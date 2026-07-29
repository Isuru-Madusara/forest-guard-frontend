import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForestMap from '../ForestMap';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // State for forms
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, company_name: '', registration_number: '', email: '', password: '', address: '', contact_person: '', contact_phone: '', coordinates: '' });
  
  // State for assigning officer
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/companies?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies", err);
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

  const fetchCompanyDetails = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/admin/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCompany(res.data);
      setSelectedOfficer(res.data.assigned_officer_id || '');
    } catch (err) {
      console.error("Failed to load company details", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchOfficers();
  }, [search]);

  const handleOpenModal = (company = null) => {
    if (company) {
      setFormData({ 
        id: company.id, 
        company_name: company.company_name, 
        registration_number: company.registration_number, 
        email: company.user?.email || '', 
        password: '', 
        address: company.address || '', 
        contact_person: company.contact_person || '', 
        contact_phone: company.contact_phone || '',
        contact_person: company.contact_person || '', 
        contact_phone: company.contact_phone || '',
        coordinates: company.coordinates || ''
      });
    } else {
      setFormData({ id: null, company_name: '', registration_number: '', email: '', password: '', address: '', contact_person: '', contact_phone: '', coordinates: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      if (formData.id) {
        await axios.put(`/admin/companies/${formData.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/admin/companies`, formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchCompanies();
      if(selectedCompany) fetchCompanyDetails(selectedCompany.id);
    } catch (err) {
      alert("Failed to save company");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this company?')) {
      try {
        const token = localStorage.getItem('auth_token');
        await axios.delete(`/admin/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setSelectedCompany(null);
        fetchCompanies();
      } catch (err) {
        alert("Failed to delete company");
      }
    }
  };

  const handleApprove = async (status) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`/admin/companies/${selectedCompany.id}/approve`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      fetchCompanyDetails(selectedCompany.id);
      fetchCompanies();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleAssignOfficer = async () => {
    if(!selectedOfficer) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`/admin/companies/${selectedCompany.id}/assign-officer`, { assigned_officer_id: selectedOfficer }, { headers: { Authorization: `Bearer ${token}` } });
      fetchCompanyDetails(selectedCompany.id);
      alert('Officer assigned');
    } catch (err) {
      alert("Failed to assign officer");
    }
  };

  // If a company is selected, show details view
  if (selectedCompany) {
    const violationCount = selectedCompany.violations?.length || 0;
    
    // Simple logic for track bar: Green (0), Yellow (1), Red (2+)
    let trackBarColor = '#27ae60'; // Green
    let trackBarLabel = 'Good Standing';
    let trackBarWidth = '100%';
    
    if (violationCount === 1) {
      trackBarColor = '#f1c40f'; // Yellow
      trackBarLabel = 'Warning (1 Violation)';
      trackBarWidth = '75%';
    } else if (violationCount >= 2) {
      trackBarColor = '#e74c3c'; // Red
      trackBarLabel = `Poor Standing (${violationCount} Violations)`;
      trackBarWidth = '40%';
    }

    // Extract unique forest areas from cutting requests for the map
    const mapPolygons = [];
    if (selectedCompany.cutting_requests) {
      selectedCompany.cutting_requests.forEach(req => {
        if (req.forest_area && req.forest_area.coordinates) {
          try {
            const positions = JSON.parse(req.forest_area.coordinates);
            mapPolygons.push({
              positions: positions,
              title: req.forest_area.area_name,
              description: `Cutting Request ID: ${req.request_id}`,
              color: 'blue'
            });
          } catch(e) {}
        }
      });
    }

    if (selectedCompany.forest_areas) {
      selectedCompany.forest_areas.forEach(area => {
        if (area.coordinates) {
          try {
            const positions = JSON.parse(area.coordinates);
            mapPolygons.push({
              positions: positions,
              title: area.area_name,
              description: `Assigned Area (Total Hectares: ${area.total_hectares})`,
              color: 'green'
            });
          } catch(e) {}
        }
      });
    }

    const mapMarkers = [];
    if (selectedCompany.coordinates) {
      try {
        const coords = JSON.parse(selectedCompany.coordinates);
        if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
          mapMarkers.push({
            position: coords,
            title: selectedCompany.company_name,
            description: selectedCompany.address
          });
        } else if (Array.isArray(coords)) {
          mapPolygons.push({
            positions: coords,
            title: selectedCompany.company_name,
            description: selectedCompany.address,
            color: 'orange'
          });
        }
      } catch(e) {}
    }

    return (
      <div className="company-details">
        <div className="d-flex justify-content-between">
          <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setSelectedCompany(null)}>
            <i className="bi bi-arrow-left"></i> Back to List
          </button>
          <div>
            <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleOpenModal(selectedCompany)}><i className="bi bi-pencil"></i> Edit</button>
            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(selectedCompany.id)}><i className="bi bi-trash"></i> Delete</button>
          </div>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4>{selectedCompany.company_name} <span className="badge bg-success ms-2">{selectedCompany.approval_status}</span></h4>
            <span className="text-muted">REG: {selectedCompany.registration_number}</span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {selectedCompany.approval_status === 'pending' && (
              <>
                <button className="btn btn-success" onClick={() => handleApprove('approved')}>Approve</button>
                <button className="btn btn-danger" onClick={() => handleApprove('rejected')}>Reject</button>
              </>
            )}
            <div className="input-group">
              <select className="form-select" value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}>
                <option value="">-- Assign Officer --</option>
                {officers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <button className="btn btn-primary" onClick={handleAssignOfficer}>Assign</button>
            </div>
          </div>
        </div>

        {/* Violation Track Bar */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <h6 className="mb-2">Compliance Status</h6>
            <div className="progress" style={{ height: '24px' }}>
              <div 
                className="progress-bar" 
                role="progressbar" 
                style={{ width: trackBarWidth, backgroundColor: trackBarColor, fontWeight: 'bold' }}
              >
                {trackBarLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6>Cutting & Replantation Requests</h6>
                <hr/>
                <p className="text-muted small">Active Cutting Requests: {selectedCompany.cutting_requests?.length || 0}</p>
                <p className="text-muted small">Active Replantations: {selectedCompany.replantation_records?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
             <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6>Assigned Forest Areas</h6>
                <hr/>
                <div style={{ height: '300px' }}>
                  <ForestMap polygons={mapPolygons} markers={mapMarkers} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal for editing is shared */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Company</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleSave}>
                    <div className="mb-3">
                      <label className="form-label">Company Name</label>
                      <input type="text" className="form-control" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Reg Number</label>
                      <input type="text" className="form-control" required value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input type="text" className="form-control" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Person</label>
                      <input type="text" className="form-control" required value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Contact Phone</label>
                      <input type="text" className="form-control" required value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Coordinates (JSON array of [lat, lng])</label>
                      <input type="text" className="form-control" placeholder="e.g. [[7.29, 80.63], ...]" value={formData.coordinates} onChange={e => setFormData({...formData, coordinates: e.target.value})} />
                    </div>
                    <div className="text-end">
                      <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                      <button type="submit" className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }}>Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise show list
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Manage Companies</h4>
        <button className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }} onClick={() => handleOpenModal()}>
          <i className="bi bi-building-add me-2"></i> Add Company
        </button>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search by ID, Company Name or Reg No..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <div className="row">
          {companies.length > 0 ? companies.map(company => (
            <div className="col-md-4 mb-4" key={company.id}>
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div className="card-body" onClick={() => fetchCompanyDetails(company.id)}>
                  <h5 className="card-title">{company.company_name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{company.registration_number}</h6>
                  <p className="card-text small mb-1"><i className="bi bi-person me-2"></i>{company.contact_person}</p>
                  <p className="card-text small"><i className="bi bi-telephone me-2"></i>{company.contact_phone}</p>
                  <span className={`badge bg-${company.approval_status === 'approved' ? 'success' : (company.approval_status === 'rejected' ? 'danger' : 'warning')}`}>
                    {company.approval_status}
                  </span>
                </div>
                <div className="card-footer bg-white border-0 text-end">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={(e) => { e.stopPropagation(); handleOpenModal(company); }}><i className="bi bi-pencil"></i></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }}><i className="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12 text-center text-muted py-5">No companies found</div>
          )}
        </div>
      )}

      {/* Modal for adding */}
      {showModal && !selectedCompany && (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">Add Company</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSave}>
                  <div className="mb-3">
                    <label className="form-label">Company Name</label>
                    <input type="text" className="form-control" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Reg Number</label>
                    <input type="text" className="form-control" required value={formData.registration_number} onChange={e => setFormData({...formData, registration_number: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Login Email</label>
                    <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact Person</label>
                    <input type="text" className="form-control" required value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contact Phone</label>
                    <input type="text" className="form-control" required value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Coordinates (JSON array of [lat, lng])</label>
                    <input type="text" className="form-control" placeholder="e.g. [[7.29, 80.63], ...]" value={formData.coordinates} onChange={e => setFormData({...formData, coordinates: e.target.value})} />
                  </div>
                  <div className="text-end">
                    <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success" style={{ backgroundColor: '#3B6D11', borderColor: '#3B6D11' }}>Save Company</button>
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

export default ManageCompanies;
