import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCuttingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/admin/cutting-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="badge bg-success">Approved</span>;
      case 'rejected': return <span className="badge bg-danger">Rejected</span>;
      case 'completed': return <span className="badge bg-info">Completed</span>;
      default: return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  const handleAccept = async (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.post(`/admin/cutting-requests/${id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchRequests();
      } catch (err) {
        alert("Failed to approve request: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.post(`/admin/cutting-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
        fetchRequests();
      } catch (err) {
        alert("Failed to reject request: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Cutting Requests Oversight</h4>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Forest Area</th>
                <th>Trees Requested</th>
                <th>Planned Date/Time</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.request_id}>
                  <td>#{req.request_id}</td>
                  <td>{req.company?.company_name || 'N/A'}</td>
                  <td>{req.forest_area?.area_name || 'N/A'}</td>
                  <td>{req.requested_trees} ({req.species_name || 'Mixed'})</td>
                  <td>{req.planned_date} {req.planned_time}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>{new Date(req.submitted_at).toLocaleDateString()}</td>
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => handleAccept(req.request_id)} title="Accept">
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(req.request_id)} title="Reject">
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No cutting requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCuttingRequests;
