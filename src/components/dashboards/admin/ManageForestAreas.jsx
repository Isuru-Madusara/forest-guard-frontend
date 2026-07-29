import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageForestAreas = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, area_name: '', district: '', province: '', total_hectares: '', coordinates: '', assigned_officer_id: '', assigned_company_id: '' });
  const [officers, setOfficers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/forest-areas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAreas(res.data);
    } catch (err) {
      console.error("Failed to load forest areas", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/officers`, { headers: { Authorization: `Bearer ${token}` } });
      setOfficers(res.data);
    } catch (err) {
      console.error("Failed to load officers", err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/companies`, { headers: { Authorization: `Bearer ${token}` } });
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies", err);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchOfficers();
    fetchCompanies();
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

  const handleOpenModal = (area = null) => {
    if (area) {
      setFormData({ 
        id: area.area_id, 
        area_name: area.area_name, 
        district: area.district || '', 
        province: area.province || '', 
        total_hectares: area.total_hectares || '', 
        coordinates: area.coordinates || '', 
        assigned_officer_id: area.assigned_officer_id || '',
        assigned_company_id: area.assigned_company_id || '' 
      });
    } else {
      setFormData({ id: null, area_name: '', district: '', province: '', total_hectares: '', coordinates: '', assigned_officer_id: '', assigned_company_id: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.id) {
        await axios.put(`/admin/forest-areas/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/admin/forest-areas`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchAreas();
    } catch (err) {
      alert("Failed to save forest area");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this forest area?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/admin/forest-areas/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchAreas();
      } catch (err) {
        alert("Failed to delete forest area");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Manage Forest Areas</h4>
        <button className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }} onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i> Add Forest Area
        </button>
      </div>

      {loading ? (
        <p>Loading areas...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Area Name</th>
                <th>District</th>
                <th>Hectares</th>
                <th>Status</th>
                <th>Officer</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.length > 0 ? areas.map(area => (
                <tr key={area.area_id}>
                  <td>#{area.area_id}</td>
                  <td>{area.area_name}</td>
                  <td>{area.district || 'N/A'}</td>
                  <td>{area.total_hectares || 'N/A'}</td>
                  <td><span className={`badge bg-${area.status === 'active' ? 'success' : 'secondary'}`}>{area.status}</span></td>
                  <td>{area.assigned_officer ? area.assigned_officer.name : <span className="text-muted">Unassigned</span>}</td>
                  <td>{area.assigned_company ? area.assigned_company.company_name : <span className="text-muted">Unassigned</span>}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(area)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(area.area_id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No forest areas found</td>
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
            className="modal-dialog modal-lg modal-dialog-scrollable"
            style={{
              width: '100%',
              maxWidth: '700px',
              margin: 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{formData.id ? 'Edit Forest Area' : 'Add Forest Area'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form id="forest-area-form" onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Area Name</label>
                    <input type="text" className="form-control" required value={formData.area_name} onChange={e => setFormData({...formData, area_name: e.target.value})} />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">District</label>
                      <input type="text" className="form-control" required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} />
                    </div>
                    <div className="col">
                      <label className="form-label">Province</label>
                      <input type="text" className="form-control" required value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total Hectares</label>
                    <input type="number" className="form-control" required value={formData.total_hectares} onChange={e => setFormData({...formData, total_hectares: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Coordinates (JSON array of [lat, lng])</label>
                    <input type="text" className="form-control" value={formData.coordinates} onChange={e => setFormData({...formData, coordinates: e.target.value})} placeholder="e.g. [[7.8, 80.7], ...]" />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Assigned Officer</label>
                      <select className="form-select" value={formData.assigned_officer_id} onChange={e => setFormData({...formData, assigned_officer_id: e.target.value})}>
                        <option value="">-- None --</option>
                        {officers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                    </div>
                    <div className="col">
                      <label className="form-label">Assigned Company</label>
                      <select className="form-select" value={formData.assigned_company_id} onChange={e => setFormData({...formData, assigned_company_id: e.target.value})}>
                        <option value="">-- None --</option>
                        {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" form="forest-area-form" className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }}>Save Area</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageForestAreas;