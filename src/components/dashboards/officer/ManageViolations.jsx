import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageViolations = () => {
  const [violations, setViolations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ violation_id: null, company_id: '', violation_type: '', description: '', penalty_amount: '', violation_date: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/officer/violations', { headers: { Authorization: `Bearer ${token}` } });
      setViolations(res.data);
      
      const compRes = await axios.get('/officer/companies', { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(compRes.data);
    } catch (err) {
      console.error("Failed to load violations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (violation = null) => {
    if (violation) {
      setFormData({ 
        violation_id: violation.violation_id, 
        company_id: violation.company_id, 
        violation_type: violation.violation_type, 
        description: violation.description || '', 
        penalty_amount: violation.penalty_amount || '', 
        violation_date: violation.violation_date 
      });
    } else {
      setFormData({ violation_id: null, company_id: '', violation_type: '', description: '', penalty_amount: '', violation_date: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.violation_id) {
        await axios.put(`/officer/violations/${formData.violation_id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/officer/violations`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save violation record");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this violation record?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/officer/violations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        alert("Failed to delete record");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Violations</h4>
        <button className="btn btn-danger" onClick={() => handleOpenModal()}>
          <i className="bi bi-exclamation-triangle-fill me-2"></i> Log Violation
        </button>
      </div>

      {loading ? (
        <p>Loading records...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Type</th>
                <th>Description</th>
                <th>Penalty Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {violations.length > 0 ? violations.map(violation => (
                <tr key={violation.violation_id}>
                  <td>#{violation.violation_id}</td>
                  <td>{violation.company?.company_name || 'N/A'}</td>
                  <td>{violation.violation_type}</td>
                  <td>{violation.description || 'N/A'}</td>
                  <td>{violation.penalty_amount ? `Rs. ${violation.penalty_amount}` : 'N/A'}</td>
                  <td>{violation.violation_date}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(violation)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(violation.violation_id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No violations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
        >
          <div className="modal-dialog" style={{ margin: '2rem auto', width: '100%', maxWidth: '500px' }}>
            <div
              className="modal-content border-0 shadow"
              style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            >
              <div className="modal-header bg-danger text-white" style={{ flexShrink: 0 }}>
                <h5 className="modal-title">{formData.violation_id ? 'Edit Violation' : 'Log Violation'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body" style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                <form id="violationForm" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Company</label>
                    <select className="form-select" required value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}>
                      <option value="">-- Select Company --</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Violation Type</label>
                    <input type="text" className="form-control" required value={formData.violation_type} onChange={e => setFormData({...formData, violation_type: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Penalty Amount (Rs.)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.penalty_amount} onChange={e => setFormData({...formData, penalty_amount: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Violation Date</label>
                    <input type="date" className="form-control" required value={formData.violation_date} onChange={e => setFormData({...formData, violation_date: e.target.value})} />
                  </div>
                </form>
              </div>
              <div className="modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" form="violationForm" className="btn btn-danger">Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageViolations;