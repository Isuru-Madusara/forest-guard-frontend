import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import ForestMap from './ForestMap';
import axios from 'axios';
import ManageOfficers from './admin/ManageOfficers';
import ManageCompanies from './admin/ManageCompanies';
import ManageForestAreas from './admin/ManageForestAreas';

import ManageCuttingRequests from './admin/ManageCuttingRequests';

const AdminOverview = ({ data }) => {
  return (
    <div>
      <h4>{data?.message || 'Overview'}</h4>
      <p>Welcome to the central command for Forest Guard.</p>
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #3B6D11' }}>
            <div className="card-body">
              <h6 className="text-muted">Total Forest Areas</h6>
              <h3>{data?.stats?.total_forest_areas || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #2980b9' }}>
            <div className="card-body">
              <h6 className="text-muted">Registered Companies</h6>
              <h3>{data?.stats?.total_companies || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
            <div className="card-body">
              <h6 className="text-muted">Active Officers</h6>
              <h3>{data?.stats?.total_officers || 0}</h3>
            </div>
          </div>
        </div>
      </div>
      {/* Map Integration */}
      <div className="mt-5">
        <h5 className="mb-3 text-muted" style={{ fontWeight: 600 }}>National Forest & Cutting Zones Overview</h5>
        <div style={{ height: '400px' }}>
          <ForestMap 
            markers={[{ position: [7.8731, 80.7718], title: "Sri Lanka Center", description: "Forest Guard HQ" }]} 
            polygons={[]} 
          />
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill' },
    { id: 'officers', label: 'Manage Officers', icon: 'bi bi-people-fill' },
    { id: 'companies', label: 'Manage Companies', icon: 'bi bi-building' },
    { id: 'areas', label: 'Forest Areas', icon: 'bi bi-tree-fill' },
    { id: 'cutting_requests', label: 'Cutting Requests', icon: 'bi bi-scissors' },
  ];


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchDashboard();
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <AdminOverview data={data} />;
      case 'officers': return <ManageOfficers />;
      case 'companies': return <ManageCompanies />;
      case 'areas': return <ManageForestAreas />;
      case 'cutting_requests': return <ManageCuttingRequests />;
      default: return <AdminOverview data={data} />;
    }
  };

  return (
    <DashboardLayout 
      title="Admin Portal" 
      role="Administrator"
      navLinks={navLinks}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
