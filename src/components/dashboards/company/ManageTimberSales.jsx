import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const emptyForm = {
  sale_id: null,
  request_id: '',
  buyer_name: '',
  buyer_contact: '',
  quantity_cubic_m: '',
  species_name: '',
  unit_price: '',
  total_amount: '',
  sale_date: '',
  invoice_number: ''
};

const ManageTimberSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/company/timber-sales', { headers: { Authorization: `Bearer ${token}` } });
      setSales(res.data);
    } catch (err) {
      console.error("Failed to load timber sales", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sale = null) => {
    if (sale) {
      setFormData({
        sale_id: sale.sale_id,
        request_id: sale.request_id ?? '',
        buyer_name: sale.buyer_name ?? '',
        buyer_contact: sale.buyer_contact ?? '',
        quantity_cubic_m: sale.quantity_cubic_m ?? '',
        species_name: sale.species_name ?? '',
        unit_price: sale.unit_price ?? '',
        total_amount: sale.total_amount ?? '',
        sale_date: sale.sale_date ?? '',
        invoice_number: sale.invoice_number ?? ''
      });
    } else {
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  // auto-calculate total when quantity or unit price changes
  const handleQtyOrPriceChange = (field, value) => {
    const next = { ...formData, [field]: value };
    const qty = parseFloat(field === 'quantity_cubic_m' ? value : next.quantity_cubic_m);
    const price = parseFloat(field === 'unit_price' ? value : next.unit_price);
    if (!isNaN(qty) && !isNaN(price)) {
      next.total_amount = (qty * price).toFixed(2);
    }
    setFormData(next);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.sale_id) {
        await axios.put(`/company/timber-sales/${formData.sale_id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/company/timber-sales`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error('Full error response:', err.response);
      const data = err.response?.data;
      const detail = data?.message
        ? data.message
        : data?.errors
        ? JSON.stringify(data.errors)
        : err.message;
      alert(`Failed to save timber sale (status ${err.response?.status || 'unknown'}): ${detail}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale record?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/company/timber-sales/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        console.error('Full error response:', err.response);
        alert("Failed to delete sale: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Build and open a print-ready receipt in a new window
  const handlePrintReceipt = (sale) => {
    const receiptWindow = window.open('', '_blank', 'width=650,height=800');
    const rows = [
      ['Invoice Number', sale.invoice_number || '—'],
      ['Sale ID', `#${sale.sale_id}`],
      ['Cutting Request', sale.request_id ? `#${sale.request_id}` : '—'],
      ['Buyer Name', sale.buyer_name || '—'],
      ['Buyer Contact', sale.buyer_contact || '—'],
      ['Species', sale.species_name || '—'],
      ['Quantity (m³)', sale.quantity_cubic_m ?? '—'],
      ['Unit Price', sale.unit_price ? `Rs. ${Number(sale.unit_price).toFixed(2)}` : '—'],
      ['Total Amount', sale.total_amount ? `Rs. ${Number(sale.total_amount).toFixed(2)}` : '—'],
      ['Sale Date', sale.sale_date || '—'],
    ];

    const rowsHtml = rows.map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#333;border-bottom:1px solid #eee;">${label}</td>
        <td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee;">${value}</td>
      </tr>
    `).join('');

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Sale #${sale.sale_id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #222; }
            .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #3B6D11; padding-bottom: 16px; }
            .header h1 { margin: 0; font-size: 22px; color: #1a3d0f; }
            .header h1 span { color: #3B6D11; }
            .header p { margin: 4px 0 0; color: #666; font-size: 13px; letter-spacing: 1px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Forest<span>Guard</span></h1>
            <p>TIMBER SALE RECEIPT</p>
          </div>
          <div class="title">Sale Receipt</div>
          <table>${rowsHtml}</table>
          <div class="footer">
            Generated on ${new Date().toLocaleString()} &mdash; Forest Guard, Ministry of Environment, Sri Lanka
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Timber Sales & Inventory</h4>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i> Log Sale
        </button>
      </div>

      {loading ? (
        <p>Loading sales...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Request ID</th>
                <th>Buyer Name</th>
                <th>Buyer Contact</th>
                <th>Quantity (m³)</th>
                <th>Species</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>Sale Date</th>
                <th>Invoice #</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? sales.map(sale => (
                <tr key={sale.sale_id}>
                  <td>#{sale.sale_id}</td>
                  <td>{sale.request_id ? `#${sale.request_id}` : '—'}</td>
                  <td>{sale.buyer_name}</td>
                  <td>{sale.buyer_contact || '—'}</td>
                  <td>{sale.quantity_cubic_m ?? '—'}</td>
                  <td>{sale.species_name || '—'}</td>
                  <td>{sale.unit_price ? `Rs. ${Number(sale.unit_price).toFixed(2)}` : '—'}</td>
                  <td>{sale.total_amount ? `Rs. ${Number(sale.total_amount).toFixed(2)}` : '—'}</td>
                  <td>{sale.sale_date}</td>
                  <td>{sale.invoice_number || '—'}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => handlePrintReceipt(sale)} title="Print Receipt">
                      <i className="bi bi-printer"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(sale)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(sale.sale_id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="11" className="text-center py-4 text-muted">No sales records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal rendered via portal so it can't be clipped by any parent container */}
      {showModal && ReactDOM.createPortal(
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{formData.sale_id ? 'Edit Sale' : 'Log Sale'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Approved Request ID</label>
                      <input type="number" className="form-control" value={formData.request_id} onChange={e => setFormData({ ...formData, request_id: e.target.value })} placeholder="e.g. 1" />
                    </div>
                    <div className="col">
                      <label className="form-label">Invoice Number</label>
                      <input type="text" className="form-control" value={formData.invoice_number} onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} placeholder="e.g. INV-2026-001" />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Buyer Name</label>
                      <input type="text" className="form-control" required value={formData.buyer_name} onChange={e => setFormData({ ...formData, buyer_name: e.target.value })} />
                    </div>
                    <div className="col">
                      <label className="form-label">Buyer Contact</label>
                      <input type="text" className="form-control" value={formData.buyer_contact} onChange={e => setFormData({ ...formData, buyer_contact: e.target.value })} placeholder="Phone or email" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Species Name</label>
                    <input type="text" className="form-control" value={formData.species_name} onChange={e => setFormData({ ...formData, species_name: e.target.value })} />
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Quantity Sold (Cubic Meters)</label>
                      <input type="number" step="0.01" className="form-control" required value={formData.quantity_cubic_m} onChange={e => handleQtyOrPriceChange('quantity_cubic_m', e.target.value)} />
                    </div>
                    <div className="col">
                      <label className="form-label">Unit Price (Rs.)</label>
                      <input type="number" step="0.01" className="form-control" value={formData.unit_price} onChange={e => handleQtyOrPriceChange('unit_price', e.target.value)} />
                    </div>
                    <div className="col">
                      <label className="form-label">Total Amount (Rs.)</label>
                      <input type="number" step="0.01" className="form-control" value={formData.total_amount} onChange={e => setFormData({ ...formData, total_amount: e.target.value })} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sale Date</label>
                    <input type="date" className="form-control" required value={formData.sale_date} onChange={e => setFormData({ ...formData, sale_date: e.target.value })} />
                  </div>

                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Sale</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManageTimberSales;