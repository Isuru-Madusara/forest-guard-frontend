import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageReplantations = () => {
  const [records, setRecords] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ replantation_id: null, company_id: '', planted_date: '', trees_planted: '', survival_rate: '', species_name: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/officer/replantations', { headers: { Authorization: `Bearer ${token}` } });
      setRecords(res.data);
      
      const compRes = await axios.get('/officer/companies', { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(compRes.data);
    } catch (err) {
      console.error("Failed to load replantations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lock background scroll while the modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const handleOpenModal = (record = null) => {
    if (record) {
      setFormData({ 
        replantation_id: record.replantation_id, 
        company_id: record.company_id, 
        planted_date: record.planting_date, 
        trees_planted: record.trees_planted, 
        survival_rate: record.survival_rate || '', 
        species_name: record.species_name || '' 
      });
    } else {
      setFormData({ replantation_id: null, company_id: '', planted_date: '', trees_planted: '', survival_rate: '', species_name: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      // Only send the fields the backend expects; drop replantation_id from the body
      const { replantation_id, ...payload } = formData;
      if (replantation_id) {
        await axios.put(`/officer/replantations/${replantation_id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/officer/replantations`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save replantation record");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this record?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/officer/replantations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        alert("Failed to delete record");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Replantation Records</h4>
        <button className="btn btn-success" style={{ backgroundColor: '#27ae60', borderColor: '#27ae60' }} onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i> Log Replantation
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
                <th>Species</th>
                <th>Trees Planted</th>
                <th>Survival Rate</th>
                <th>Planted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map(record => (
                <tr key={record.replantation_id}>
                  <td>#{record.replantation_id}</td>
                  <td>{record.company?.company_name || 'N/A'}</td>
                  <td>{record.species_name || 'N/A'}</td>
                  <td>{record.trees_planted}</td>
                  <td>{record.survival_rate ? `${record.survival_rate}%` : 'N/A'}</td>
                  <td>{record.planting_date}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(record)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(record.replantation_id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No records found</td>
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
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1050,
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '2rem 1rem'
          }}
        >
          <div
            className="modal-dialog modal-dialog-scrollable"
            style={{
              width: '100%',
              maxWidth: '600px',
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{formData.replantation_id ? 'Edit Replantation' : 'Log Replantation'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form id="replantation-form" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Company</label>
                    <select className="form-select" required value={formData.company_id} onChange={e => setFormData({...formData, company_id: e.target.value})}>
                      <option value="">-- Select Company --</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Species Name</label>
                    <input type="text" className="form-control" required value={formData.species_name} onChange={e => setFormData({...formData, species_name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Trees Planted</label>
                    <input type="number" className="form-control" required value={formData.trees_planted} onChange={e => setFormData({...formData, trees_planted: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Survival Rate (%)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.survival_rate} onChange={e => setFormData({...formData, survival_rate: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Planted Date</label>
                    <input type="date" className="form-control" required value={formData.planted_date} onChange={e => setFormData({...formData, planted_date: e.target.value})} />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" form="replantation-form" className="btn btn-success" style={{ backgroundColor: '#27ae60', borderColor: '#27ae60' }}>Save Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReplantations;