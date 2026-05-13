import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import EmergencyBooking from './pages/EmergencyBooking';
import KnowledgeCenter from './pages/KnowledgeCenter';
import Login from './pages/Login';
import Profile from './pages/Profile';
import RepairCostEstimation from './pages/RepairCostEstimation';
import ScanResults from './pages/ScanResults';
import Scanner from './pages/Scanner';
import VassuAi from './pages/VassuAi';
import AiDetectionIntro from './pages/AiDetectionIntro';

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public routes (no login required) ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* Demo / Explore pages — visible without login */}
        <Route path="/ai-detection-intro" element={<AiDetectionIntro />} />
        <Route path="/knowledge-center" element={<KnowledgeCenter />} />
        {/* Scanner is public so demo works */}
        <Route path="/scanner" element={<Scanner />} />

        {/* ── Protected routes (login required via MainLayout guard) ── */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/emergency-booking" element={<EmergencyBooking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/repair-cost-estimation" element={<RepairCostEstimation />} />
          <Route path="/scan-results" element={<ScanResults />} />
          <Route path="/vassu-ai" element={<VassuAi />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
