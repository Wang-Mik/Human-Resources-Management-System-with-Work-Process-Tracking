import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Dashboard from './pages/manager/Dashboard';
import WorkManagement from './pages/manager/WorkManagement';
import HandoverReview from './pages/manager/HandoverReview';
import BottleneckDashboard from './pages/manager/BottleneckDashboard';

// Tạm thời dùng state để chuyển đổi giữa các trang để bạn có thể xem preview.
// Sau này có thể thay thế bằng React Router.

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'Dashboard' | 'WorkManagement' | 'HandoverReview' | 'BottleneckDashboard'>('BottleneckDashboard');

  return (
    <div className="flex h-screen bg-surface-variant text-on-surface font-sans antialiased overflow-hidden">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />
        
        {currentPage === 'Dashboard' && <Dashboard />}
        {currentPage === 'WorkManagement' && <WorkManagement />}
        {currentPage === 'HandoverReview' && <HandoverReview />}
        {currentPage === 'BottleneckDashboard' && <BottleneckDashboard />}
      </div>
    </div>
  );
};

export default App;