import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const ManageCuttingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [forestAreas, setForestAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ request_id: null, forest_area_id: '', requested_trees: '', species_name: '', reason: '', planned_date: '', planned_time: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/company/cutting-requests', { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);

      try {
        const areasResp = await axios.get('/company/dashboard', { headers: { Authorization: `Bearer ${token}` } });
        // If dashboard returns assigned areas, we could use them here.
      } catch (e) {}

    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (req = null) => {
    if (req) {
      setFormData({
        request_id: req.request_id,
        forest_area_id: req.forest_area_id,
        requested_trees: req.requested_trees,
        species_name: req.species_name || '',
        reason: req.reason || '',
        planned_date: req.planned_date,
        planned_time: req.planned_time
      });
    } else {
      setFormData({ request_id: null, forest_area_id: '', requested_trees: '', species_name: '', reason: '', planned_date: '', planned_time: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.request_id) {
        await axios.put(`/company/cutting-requests/${formData.request_id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/company/cutting-requests`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save request: " + (err.response?.data?.message || JSON.stringify(err.response?.data?.errors) || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pending request?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/company/cutting-requests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        fetchData();
      } catch (err) {
        alert("Failed to delete request");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="badge bg-success">Approved</span>;
      case 'rejected': return <span className="badge bg-danger">Rejected</span>;
      case 'completed': return <span className="badge bg-info">Completed</span>;
      default: return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>My Cutting Requests</h4>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i> Submit Request
        </button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Forest Area ID</th>
                <th>Trees Requested</th>
                <th>Planned Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.request_id}>
                  <td>#{req.request_id}</td>
                  <td>Area #{req.forest_area_id}</td>
                  <td>{req.requested_trees} ({req.species_name || 'Mixed'})</td>
                  <td>{req.planned_date} {req.planned_time}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(req)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(req.request_id)}><i className="bi bi-trash"></i></button>
                      </>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No cutting requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal rendered via portal so it can't be clipped by any parent container */}
      {showModal && ReactDOM.createPortal(
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">{formData.request_id ? 'Edit Request' : 'Submit Request'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Forest Area ID</label>
                    <input type="number" className="form-control" required value={formData.forest_area_id} onChange={e => setFormData({ ...formData, forest_area_id: e.target.value })} placeholder="Enter assigned Forest Area ID" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Requested Trees (Count)</label>
                    <input type="number" className="form-control" required value={formData.requested_trees} onChange={e => setFormData({ ...formData, requested_trees: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Species Name</label>
                    <input type="text" className="form-control" value={formData.species_name} onChange={e => setFormData({ ...formData, species_name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reason</label>
                    <textarea className="form-control" rows="2" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Planned Date</label>
                      <input type="date" className="form-control" required value={formData.planned_date} onChange={e => setFormData({ ...formData, planned_date: e.target.value })} />
                    </div>
                    <div className="col">
                      <label className="form-label">Planned Time</label>
                      <input type="time" className="form-control" required value={formData.planned_time} onChange={e => setFormData({ ...formData, planned_time: e.target.value })} />
                    </div>
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Request</button>
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

export default ManageCuttingRequests;