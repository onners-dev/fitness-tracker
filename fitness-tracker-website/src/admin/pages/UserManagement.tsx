import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService.js';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await adminService.getAllUsers();
        setUsers(userList);
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserBan = async (userId) => {
    try {
      await adminService.banUser(userId);
      setUsers(users.map(user => 
        user.id === userId ? {...user, isBanned: true} : user
      ));
    } catch (error) {
      console.error('Failed to ban user', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      if (action === 'ban') {
        await Promise.all(selectedUsers.map(userId => adminService.banUser(userId)));
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? {...user, isBanned: true} : user
        ));
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Bulk action failed', error);
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <div className="bulk-actions">
        <button 
          onClick={() => handleBulkAction('ban')}
          disabled={selectedUsers.length === 0}
        >
          Ban Selected Users
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                onChange={(e) => setSelectedUsers(
                  e.target.checked ? users.map(u => u.id) : []
                )}
                checked={selectedUsers.length === users.length}
              />
            </th>
            <th>Email</th>
            <th>Registered Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                    }
                  }}
                />
              </td>
              <td>{user.email}</td>
              <td>{new Date(user.registeredAt).toLocaleDateString()}</td>
              <td>{user.isBanned ? 'Banned' : 'Active'}</td>
              <td>
                <button 
                  onClick={() => handleUserBan(user.id)}
                  disabled={user.isBanned}
                >
                  Ban User
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
