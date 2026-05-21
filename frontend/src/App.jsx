import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import CampaignPage from './pages/CampaignPage';
import FarmersPage from './pages/FarmersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SelfieToolPage from './pages/SelfieToolPage';
import RAGDemoPage from './pages/RAGDemoPage';
import HeroPage from './pages/HeroPage';
import AutomationPage from './pages/AutomationPage';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHeroPage = location.pathname === '/';

  if (isHeroPage) {
    return (
      <Routes>
        <Route path="/" element={<HeroPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main style={{ padding: '24px', paddingTop: '88px' }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/campaigns" element={<CampaignPage />} />
            <Route path="/farmers" element={<FarmersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/krishigarv" element={<SelfieToolPage />} />
            <Route path="/rag" element={<RAGDemoPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

