import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForestMap from '../ForestMap';

const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/officer/companies?search=${search}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDetails = async (id) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.get(`/officer/companies/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedCompany(res.data);
    } catch (err) {
      console.error("Failed to load company details", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  // If a company is selected, show details view
  if (selectedCompany) {
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
              color: 'green'
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
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => setSelectedCompany(null)}>
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>{selectedCompany.company_name} <span className="badge bg-success ms-2">{selectedCompany.approval_status}</span></h4>
          <span className="text-muted">REG: {selectedCompany.registration_number}</span>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6>Cutting Requests & Violations</h6>
                <hr/>
                <p className="text-muted small">Active Cutting Requests: {selectedCompany.cutting_requests?.length || 0}</p>
                <p className="text-muted small text-danger">Violations Logged: {selectedCompany.violations?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
             <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6>Assigned Forest Areas & Location</h6>
                <hr/>
                <div style={{ height: '300px' }}>
                  <ForestMap polygons={mapPolygons} markers={mapMarkers} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show list
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Assigned Companies</h4>
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search assigned companies..." 
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
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => fetchCompanyDetails(company.id)}>
                <div className="card-body">
                  <h5 className="card-title">{company.company_name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{company.registration_number}</h6>
                  <p className="card-text small mb-1"><i className="bi bi-person me-2"></i>{company.contact_person}</p>
                  <p className="card-text small"><i className="bi bi-telephone me-2"></i>{company.contact_phone}</p>
                  <span className="badge bg-success">Assigned</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-12 text-center text-muted py-5">No companies found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCompanies;
