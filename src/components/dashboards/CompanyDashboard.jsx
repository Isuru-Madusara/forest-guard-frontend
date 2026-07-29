import React, { useEffect, useState } from 'react';
import DashboardLayout from './DashboardLayout';
import ForestMap from './ForestMap';
import axios from 'axios';

import ManageCuttingRequests from './company/ManageCuttingRequests';
import ManageTimberSales from './company/ManageTimberSales';
import Permits from './company/Permits';

const CompanyOverview = ({ data }) => (
  <div>
    <h4>{data?.message || 'Overview'}</h4>
    <p>Submit cutting requests and track your compliance.</p>
    <div className="row mt-4">
      <div className="col-md-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #2980b9' }}>
          <div className="card-body">
            <h6 className="text-muted">Active Requests</h6>
            <h3>0</h3>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #27ae60' }}>
          <div className="card-body">
            <h6 className="text-muted">Trees Replanted</h6>
            <h3>0</h3>
          </div>
        </div>
      </div>
      <div className="col-md-4">
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px', borderLeft: '4px solid #f1c40f' }}>
          <div className="card-body">
            <h6 className="text-muted">Violation Warnings</h6>
            <h3>0</h3>
          </div>
        </div>
      </div>
    </div>
    <div className="mt-5">
      <h5 className="mb-3 text-muted" style={{ fontWeight: 600 }}>Approved Cutting Areas</h5>
      <ForestMap />
    </div>
  </div>
);

const CompanyDashboard = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const navLinks = [
    { id: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2-fill' },
    { id: 'cutting_requests', label: 'Cutting Requests', icon: 'bi bi-scissors' },
    { id: 'timber_sales', label: 'Timber Sales', icon: 'bi bi-cart-fill' },
    { id: 'permits', label: 'Permits', icon: 'bi bi-file-earmark-text-fill' },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get('/company/dashboard', {
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
      case 'overview': return <CompanyOverview data={data} />;
      case 'cutting_requests': return <ManageCuttingRequests />;
      case 'timber_sales': return <ManageTimberSales />;
      case 'permits': return <Permits />;
      default: return <CompanyOverview data={data} />;
    }
  };

  return (
    <DashboardLayout 
      title="Company Dashboard" 
      role="Timber Company"
      navLinks={navLinks}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {data ? renderContent() : <p>Loading dashboard...</p>}
    </DashboardLayout>
  );
};

export default CompanyDashboard;