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

// Tạm thời dùng state để chuyển đổi giữa các trang để bạn có thể xem preview.
// Sau này có thể thay thế bằng React Router.

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'manager' | 'employee' | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('Dashboard');

  const handleLogin = (role: 'manager' | 'employee') => {
    setUserRole(role);
    if (role === 'manager') {
      setCurrentPage('BottleneckDashboard');
    } else {
      setCurrentPage('TaskBoard');
    }
  };

  if (!userRole) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-surface-variant text-on-surface font-sans antialiased overflow-hidden">
      <Sidebar userRole={userRole} currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onLogout={() => setUserRole(null)} />
        
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