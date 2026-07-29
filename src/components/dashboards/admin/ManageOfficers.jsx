import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', email: '', phone: '', password: '' });

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/officers?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOfficers(res.data);
    } catch (err) {
      console.error("Failed to load officers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [search]);

  const handleOpenModal = (officer = null) => {
    if (officer) {
      setFormData({ id: officer.id, name: officer.name, email: officer.email, phone: officer.phone || '', password: '' });
    } else {
      setFormData({ id: null, name: '', email: '', phone: '', password: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.id) {
        await axios.put(`/admin/officers/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/admin/officers`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchOfficers();
    } catch (err) {
      alert("Failed to save officer");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this officer?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/admin/officers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchOfficers();
      } catch (err) {
        alert("Failed to delete officer");
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Manage Forest Officers</h4>
        <button className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }} onClick={() => handleOpenModal()}>
          <i className="bi bi-person-plus-fill me-2"></i> Add Officer
        </button>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by ID, Name, Email or Phone..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <p>Loading officers...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {officers.length > 0 ? officers.map(officer => (
                <tr key={officer.id}>
                  <td>#{officer.id}</td>
                  <td>{officer.name}</td>
                  <td>{officer.email}</td>
                  <td>{officer.phone || 'N/A'}</td>
                  <td>{new Date(officer.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(officer)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(officer.id)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No officers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{formData.id ? 'Edit Officer' : 'Add Officer'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  {!formData.id && (
                    <div className="mb-3">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" required={!formData.id} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  )}
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }}>Save Officer</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOfficers;
