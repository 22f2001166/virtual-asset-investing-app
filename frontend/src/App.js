import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from './components/ProtectedRoute'; // Import this line
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home.js';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import AddCardPage from './pages/AddCardPage';
import EarnCoins from './pages/EarnCoins';
import UserAssets from './pages/UserAssets';
import UsersList from './pages/UsersList'; 
import DiscoursePage from './pages/DiscoursePage';
import KnowMore from './pages/KnowMore';
import TermsConditions from './pages/TermsConditions';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<ProtectedRoute element={AdminDashboard} allowedRoles={['admin']} />} />
        <Route path="/user" element={<ProtectedRoute element={UserDashboard} allowedRoles={['user']} />} />
        <Route path="/add-card" element={<ProtectedRoute element={AddCardPage} allowedRoles={['admin']} />} />
        <Route path="/earn-coins" element={<ProtectedRoute element={EarnCoins} allowedRoles={['user']} />} />
        <Route path="/user-assets" element={<ProtectedRoute element={UserAssets} allowedRoles={['user']} />} />
        <Route path="/admin/users" element={<ProtectedRoute element={UsersList} allowedRoles={['admin']} />} />
        <Route path="/leaderboard" element={<ProtectedRoute element={UsersList} allowedRoles={['user']} />} />
        <Route path="/discourse" element={<ProtectedRoute element={DiscoursePage} allowedRoles={['admin', 'user']} />} /> 
        <Route path="/know-more" element={<KnowMore />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
      </Routes>
    </Router>
  );
}

export default App;
