import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageCuttingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get('/officer/cutting-requests', {
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

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = status === 'approved' ? `/officer/cutting-requests/${id}/accept` : `/officer/cutting-requests/${id}/reject`;
      await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDoneReport = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`/officer/cutting-requests/${id}/report`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Done report generated and marked as completed!");
      fetchRequests();
    } catch (err) {
      alert("Failed to generate report");
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="badge bg-success">Approved</span>;
      case 'rejected': return <span className="badge bg-danger">Rejected</span>;
      case 'completed': return <span className="badge bg-info">Completed</span>;
      default: return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Manage Cutting Requests</h4>
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
                <th>Planned Schedule</th>
                <th>Status</th>
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
                  <td>
                    {req.status === 'pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => handleUpdateStatus(req.request_id, 'approved')}>Approve</button>
                        <button className="btn btn-sm btn-danger me-2" onClick={() => handleUpdateStatus(req.request_id, 'rejected')}>Reject</button>
                      </>
                    )}
                    {req.status === 'approved' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleDoneReport(req.request_id)}>Generate Done Report</button>
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
