import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Dashboard from './pages/manager/Dashboard';
import WorkManagement from './pages/manager/WorkManagement';
import WorkAssignment from './pages/manager/WorkAssignment';
import HandoverReview from './pages/manager/HandoverReview';
import BottleneckDashboard from './pages/manager/BottleneckDashboard';
import WorkforceAvailability from './pages/manager/WorkforceAvailability';
import Workspace from './pages/employee/Workspace';
import TaskBoard from './pages/employee/TaskBoard';
import MyHandovers from './pages/employee/MyHandovers';
import Login from './pages/auth/Login';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'manager' | 'employee' | null>(() => {
    try {
      const user = sessionStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        if (parsed && typeof parsed.Role === 'string') {
          return parsed.Role.toLowerCase().includes('manager') ? 'manager' : 'employee';
        }
      }
    } catch (e) {
      console.error('Error parsing user from sessionStorage', e);
    }
    return null;
  });
  
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const role = userRole;
    if (role === 'manager') return 'Dashboard';
    if (role === 'employee') return 'Workspace';
    return 'Dashboard';
  });

  const handleLogin = (role: 'manager' | 'employee') => {
    setUserRole(role);
    if (role === 'manager') {
      setCurrentPage('Dashboard');
    } else {
      setCurrentPage('Workspace');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
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
            {currentPage === 'Dashboard' && <Dashboard onNavigate={setCurrentPage} />}
            {currentPage === 'WorkManagement' && <WorkManagement />}
            {currentPage === 'WorkAssignment' && <WorkAssignment />}
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