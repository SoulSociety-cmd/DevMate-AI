import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Explain from './pages/Explain.jsx'
import FixBugs from './pages/FixBugs.jsx'
import Optimize from './pages/Optimize.jsx'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem 2rem', background: '#020617', display: 'flex', gap: '1rem' }}>
        <Link to="/">Home</Link>
        <Link to="/explain">Explain</Link>
        <Link to="/optimize">Optimize</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explain" element={<Explain />} />
        <Route path="/fix-bugs" element={<FixBugs />} />
        <Route path="/optimize" element={<Optimize />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
