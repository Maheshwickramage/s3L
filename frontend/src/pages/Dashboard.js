import React from 'react';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

function Dashboard({ user }) {
  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Welcome, {user.username}!</h2>
      <p>Role: {user.role}</p>
      {/* Render different dashboard content based on role */}
      {user.role === 'student' && <StudentDashboard user={user} />}
      {user.role === 'teacher' && <TeacherDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
}

export default Dashboard;
