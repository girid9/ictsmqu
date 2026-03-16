import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HamburgerMenu from './components/HamburgerMenu';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Learn from './pages/Learn';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <main className="app-shell">
        <HamburgerMenu />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
