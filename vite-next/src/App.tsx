import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Courts from './pages/Courts';
import CourtDetail from './pages/CourtDetail';
import Petition from './pages/Petition';
import Community from './pages/Community';
import Impact from './pages/Impact';
import Help from './pages/Help';
import About from './pages/About';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courts" element={<Courts />} />
        <Route path="/courts/:id" element={<CourtDetail />} />
        <Route path="/petition" element={<Petition />} />
        <Route path="/community" element={<Community />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Layout>
  );
}
