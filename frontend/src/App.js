
import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChangePassword from './pages/ChangePassword';

function App() {
  const [user, setUser] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const handleLogin = (username, role, must_change_password) => {
    setUser({ username, role });
    setMustChangePassword(!!must_change_password);
  };

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : mustChangePassword ? (
        <ChangePassword user={user} onPasswordChanged={handlePasswordChanged} />
      ) : (
        <Dashboard user={user} />
      )}
    </div>
  );
}

export default App;
