import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayerRegistration from './PlayerReg';
import HomePage from './HomePage';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/register">Register/Login</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<PlayerRegistration/>} />
      </Routes>
    </Router>
  );
}

export default App;