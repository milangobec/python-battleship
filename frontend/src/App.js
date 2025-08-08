import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PlayerRegistration from './PlayerReg';
import HomePage from './HomePage';
import PlayerStats from './PlayerStats';

function App() {
  return (
    <Router>
      <nav class="bg-gray-400 dark:bg-gray-800 dark:text-white">
        <div class="flex items-center p-4">
          <Link class="mr-6" to="/">Home</Link>
          <Link class="mr-6" to="/register">Registration</Link>
          <Link class="mr-6" to="/stats">Player Stats</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<PlayerRegistration/>} />
        <Route path="/stats" element={<PlayerStats/>} />
      </Routes>
    </Router>
  );
}

export default App;