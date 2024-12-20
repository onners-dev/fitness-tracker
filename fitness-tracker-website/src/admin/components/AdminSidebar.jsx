import React from 'react';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = () => {
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
    { path: '/admin/content', label: 'Content Moderation', icon: '🌐' },
    { path: '/admin/workouts', label: 'Workout Moderation', icon: '💪' },
    { path: '/admin/nutrition', label: 'Nutrition Moderation', icon: '🥗' },
    { path: '/admin/analytics', label: 'System Analytics', icon: '📈' }
  ];

  return (
    <aside className="admin-sidebar">
      <nav>
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="admin-sidebar-item">
            <span className="admin-sidebar-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
