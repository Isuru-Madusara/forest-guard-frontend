import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children, title, role, navLinks = [], activeTab = '', onTabChange = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f9f4' }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: '260px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '2px 0 15px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div className="sidebar-header" style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: 0, fontWeight: 700, color: '#2c3e50' }}>
            Forest<span style={{ color: '#3B6D11' }}>Guard</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#7f8c8d', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {role} Portal
          </span>
        </div>

        <nav className="sidebar-nav" style={{ padding: '20px', flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {navLinks.length > 0 ? (
              navLinks.map((link) => (
                <li 
                  key={link.id}
                  onClick={() => onTabChange(link.id)}
                  style={{ 
                    padding: '12px 15px', 
                    borderRadius: '8px', 
                    background: activeTab === link.id ? 'rgba(59, 109, 17, 0.1)' : 'transparent', 
                    color: activeTab === link.id ? '#3B6D11' : '#7f8c8d', 
                    fontWeight: activeTab === link.id ? 600 : 400, 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <i className={`${link.icon} me-2`}></i> {link.label}
                </li>
              ))
            ) : (
              <li style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(59, 109, 17, 0.1)', color: '#3B6D11', fontWeight: 600, cursor: 'pointer' }}>
                <i className="bi bi-grid-1x2-fill me-2"></i> Dashboard
              </li>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer" style={{ padding: '20px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <button onClick={handleLogout} className="btn btn-outline-danger w-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <i className="bi bi-box-arrow-left"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#2c3e50', fontWeight: 700 }}>{title}</h2>
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3B6D11', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              U
            </div>
          </div>
        </header>
        
        <div className="dashboard-content" style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          padding: '25px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          border: '1px solid rgba(255, 255, 255, 0.6)'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
