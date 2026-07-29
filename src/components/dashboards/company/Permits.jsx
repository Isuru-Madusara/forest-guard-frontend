import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Permits = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPermit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/company/permit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to load permit', err.response || err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermit();
  }, []);

  const openPrintablePermit = () => {
    const company = data.company;
    const permitWindow = window.open('', '_blank', 'width=750,height=900');

    const rows = [
      ['Company Name', company.company_name],
      ['Registration Number', company.registration_number],
      ['Address', company.address],
      ['Contact Person', company.contact_person],
      ['Contact Phone', company.contact_phone],
      ['Assigned Forest Officer', company.assigned_officer?.name || 'Not yet assigned'],
      ['Approved On', company.approved_at ? new Date(company.approved_at).toLocaleDateString() : '—'],
      ['Permit Reference No.', `FG-PERMIT-${String(company.id).padStart(5, '0')}`],
    ];

    const rowsHtml = rows.map(([label, value]) => `
      <tr>
        <td style="padding:10px 14px;font-weight:600;color:#333;border-bottom:1px solid #eee;width:240px;">${label}</td>
        <td style="padding:10px 14px;color:#111;border-bottom:1px solid #eee;">${value}</td>
      </tr>
    `).join('');

    permitWindow.document.write(`
      <html>
        <head>
          <title>Permit - ${company.company_name}</title>
          <style>
            body { font-family: Georgia, 'Times New Roman', serif; margin: 0; padding: 40px; color: #1a1a1a; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 3px double #3B6D11; padding-bottom: 20px; }
            .header h1 { margin: 0; font-size: 20px; letter-spacing: 1px; color: #1a3d0f; text-transform: uppercase; }
            .header h2 { margin: 6px 0 0; font-size: 15px; color: #444; font-weight: normal; }
            .header p { margin: 10px 0 0; font-size: 12px; color: #777; }
            .permit-title { text-align: center; font-size: 22px; font-weight: bold; margin: 28px 0 8px; color: #1a3d0f; }
            .permit-sub { text-align: center; font-size: 13px; color: #555; margin-bottom: 28px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            .clause-title { font-weight: bold; margin: 20px 0 8px; font-size: 14px; }
            .clause { font-size: 13px; color: #333; line-height: 1.6; margin-bottom: 10px; }
            .signature-row { display: flex; justify-content: space-between; margin-top: 60px; }
            .signature-box { width: 45%; text-align: center; border-top: 1px solid #333; padding-top: 6px; font-size: 12px; color: #555; }
            .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Democratic Socialist Republic of Sri Lanka</h1>
            <h2>Ministry of Environment &mdash; Forest Guard Program</h2>
            <p>Official Timber Operations Permit</p>
          </div>

          <div class="permit-title">Timber Cutting &amp; Transport Permit</div>
          <div class="permit-sub">Issued under the Forest Guard sustainable timber management system</div>

          <table>${rowsHtml}</table>

          <div class="clause-title">Terms &amp; Conditions</div>
          <div class="clause">1. This permit authorizes the above company to engage in approved timber cutting, transport, and sale activities strictly within forest areas assigned to it and cutting requests approved by a Forest Guard officer.</div>
          <div class="clause">2. All cutting activities must be accompanied by mandatory replantation as required under Forest Guard regulations.</div>
          <div class="clause">3. Timber transport vehicles must carry a copy of this permit along with the relevant approved cutting request and sale documentation at all times.</div>
          <div class="clause">4. This permit is subject to suspension or revocation upon confirmed violation of forest conservation regulations.</div>
          <div class="clause">5. This permit remains valid while the company's approval status is active within the Forest Guard system.</div>

          <div class="signature-row">
            <div class="signature-box">Authorized Forest Officer</div>
            <div class="signature-box">Ministry of Environment Seal</div>
          </div>

          <div class="footer">
            Document generated on ${new Date().toLocaleString()} via Forest Guard &mdash; This is a system-generated permit document.
          </div>
        </body>
      </html>
    `);
    permitWindow.document.close();
    permitWindow.focus();
    permitWindow.print();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Permits</h4>
      </div>

      <div className="bg-white rounded shadow-sm border p-4">
        {loading && <p className="mb-0">Loading permit status...</p>}

        {!loading && error && (
          <div className="alert alert-danger mb-0">{error}</div>
        )}

        {!loading && !error && data && !data.permitted && (
          <div className="alert alert-warning mb-0">
            <strong>Permit not available.</strong> {data.message}
            <div className="mt-1 small text-muted">
              Current status: <span className="text-capitalize">{data.approval_status}</span>
            </div>
          </div>
        )}

        {!loading && !error && data && data.permitted && (
          <div>
            <p className="text-muted mb-3">
              Your company is approved. You can view and download your official Forest Guard timber operations permit below.
            </p>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-primary" onClick={openPrintablePermit}>
                <i className="bi bi-printer me-2"></i> View / Print Permit
              </button>
              <span className="text-muted small">
                Approved on {data.company.approved_at ? new Date(data.company.approved_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Permits;