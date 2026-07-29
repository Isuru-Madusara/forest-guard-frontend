import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/frontend/Home';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboards/AdminDashboard';
import OfficerDashboard from './components/dashboards/OfficerDashboard';
import CompanyDashboard from './components/dashboards/CompanyDashboard';

import './assets/CSS/style.scss';

function App() {
  return (
  <>
    <BrowserRouter>
           <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='/admin-dashboard' element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path='/officer-dashboard' element={
                <ProtectedRoute allowedRole="forest_officer">
                  <OfficerDashboard />
                </ProtectedRoute>
              } />
              <Route path='/company-dashboard' element={
                <ProtectedRoute allowedRole="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
           </Routes>
    </BrowserRouter>
  </>
  );
}

export default App;
