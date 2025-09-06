import React from 'react';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

function Dashboard({ user, onLogout }) {
  return (
    <div>
      {/* Render different dashboard content based on role */}
      {user.role === 'student' && <StudentDashboard user={user} onLogout={onLogout} />}
      {user.role === 'teacher' && <TeacherDashboard user={user} onLogout={onLogout} />}
      {user.role === 'admin' && <AdminDashboard user={user} onLogout={onLogout} />}
    </div>
  );
}

export default Dashboard;
