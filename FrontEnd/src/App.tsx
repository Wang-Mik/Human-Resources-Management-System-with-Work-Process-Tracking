import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Dashboard from './pages/manager/Dashboard';
import WorkManagement from './pages/manager/WorkManagement';
import HandoverReview from './pages/manager/HandoverReview';
import BottleneckDashboard from './pages/manager/BottleneckDashboard';
import WorkforceAvailability from './pages/manager/WorkforceAvailability';
import Workspace from './pages/employee/Workspace';
import TaskBoard from './pages/employee/TaskBoard';
import MyHandovers from './pages/employee/MyHandovers';
import Login from './pages/auth/Login';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'manager' | 'employee' | null>(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.Role.toLowerCase().includes('manager') ? 'manager' : 'employee';
    }
    return null;
  });
  
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const role = userRole;
    if (role === 'manager') return 'BottleneckDashboard';
    if (role === 'employee') return 'TaskBoard';
    return 'Dashboard';
  });

  const handleLogin = (role: 'manager' | 'employee') => {
    setUserRole(role);
    if (role === 'manager') {
      setCurrentPage('BottleneckDashboard');
    } else {
      setCurrentPage('TaskBoard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole(null);
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-surface-variant text-on-surface font-sans antialiased overflow-hidden">
      <Sidebar userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onLogout={handleLogout} />
        
        {userRole === 'manager' && (
          <>
            {currentPage === 'Dashboard' && <Dashboard />}
            {currentPage === 'WorkManagement' && <WorkManagement />}
            {currentPage === 'HandoverReview' && <HandoverReview />}
            {currentPage === 'BottleneckDashboard' && <BottleneckDashboard />}
            {currentPage === 'WorkforceAvailability' && <WorkforceAvailability />}
          </>
        )}

        {userRole === 'employee' && (
          <>
            {currentPage === 'Workspace' && <Workspace />}
            {currentPage === 'TaskBoard' && <TaskBoard />}
            {currentPage === 'MyHandovers' && <MyHandovers />}
          </>
        )}
      </div>
    </div>
  );
};

export default App;