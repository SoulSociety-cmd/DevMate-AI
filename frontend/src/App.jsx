import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem 2rem', background: '#020617' }}>
        <Link to="/">Home</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
