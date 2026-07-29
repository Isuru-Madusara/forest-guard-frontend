import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import ForestMap from './ForestMap';
import axios from 'axios';

import ManageCompanies from './officer/ManageCompanies';
import ManageCuttingRequests from './officer/ManageCuttingRequests';
import ManageTimberSales from './officer/ManageTimberSales';
import ManageReplantations from './officer/ManageReplantations';
import ManageViolations from './officer/ManageViolations';

const OfficerOverview = ({ data }) => (
  <div>
    <h4>{data?.message || 'Overview'}</h4>
    <p>Review cutting requests and monitor replantation activities here.</p>
    <div className="row mt-4">
      <div className="col-md-6">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
          <div className="card-body">
            <h6 className="text-muted">Pending Requests</h6>
            <h3>0</h3>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #27ae60' }}>
          <div className="card-body">
            <h6 className="text-muted">Approved Replantations</h6>
            <h3>0</h3>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-5">
      <h5 className="mb-3 text-muted" style={{ fontWeight: 600 }}>Assigned Monitoring Zones</h5>
      <ForestMap />
    </div>
  </div>
);

const OfficerDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill' },
    { id: 'companies', label: 'Companies', icon: 'bi bi-building' },
    { id: 'cutting_requests', label: 'Cutting Requests', icon: 'bi bi-scissors' },
    { id: 'timber_sales', label: 'Timber Sales', icon: 'bi bi-cart-fill' },
    { id: 'replantations', label: 'Replantations', icon: 'bi bi-tree' },
    { id: 'violations', label: 'Violations', icon: 'bi bi-exclamation-triangle-fill' },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('/officer/dashboard', {
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
      case 'overview': return <OfficerOverview data={data} />;
      case 'companies': return <ManageCompanies />;
      case 'cutting_requests': return <ManageCuttingRequests />;
      case 'timber_sales': return <ManageTimberSales />;
      case 'replantations': return <ManageReplantations />;
      case 'violations': return <ManageViolations />;
      default: return <OfficerOverview data={data} />;
    }
  };

  return (
    <DashboardLayout 
      title="Officer Dashboard" 
      role="Forest Officer"
      navLinks={navLinks}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {data ? renderContent() : <p>Loading dashboard...</p>}
    </DashboardLayout>
  );
};

export default OfficerDashboard;
