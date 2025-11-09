import React from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import './AdminHeader.css';

const AdminHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-logo">Arcus Admin Panel</div>
      <div className="admin-header-user">
        <span>{user?.email}</span>
        <button onClick={logout} className="admin-logout-btn">Logout</button>
      </div>
    </header>
  );
};

export default AdminHeader;
