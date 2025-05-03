import React, { useEffect, useState } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Button, Nav } from 'react-bootstrap'; // ✨ Added Nav
import { motion } from 'framer-motion';

const NavbarComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = sessionStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('loginStatusChanged'));
    setExpanded(false);
    navigate('/');
  };

  const handleDashboard = () => {
    const role = sessionStorage.getItem('role');
    setExpanded(false);
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'user') {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : ''; 
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1000,
      }}
    >
      <Navbar expanded={expanded} onToggle={() => setExpanded(!expanded)} style={{ backgroundColor: '#1a2b4c' }} expand="lg" className="py-3">
        <Container className="px-4 px-lg-5">
          {/* Brand/Logo */}
          <div className="d-flex justify-content-between align-items-center w-100">
          <Navbar.Brand
            as={Link}
            to="/"
            className="d-flex align-items-center gap-3 text-white text-decoration-none"
            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, letterSpacing: '1px' }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: '40px', width: 'auto' }}
            />
            <div style={{ fontSize: '1.4rem', lineHeight: '1', color: 'white', fontStyle: 'italic' }}>
              <span style={{ color: '#f0c040' }}>Wea</span>lth
            </div>
          </Navbar.Brand>

          {/* Hamburger Toggle */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" style={{backgroundColor: 'white'}} />
          </div>
          {/* Collapsible Nav Items */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {isLoggedIn ? (
                <Button
                  onClick={handleDashboard}
                  variant="outline-light"
                  className={`m-2 fw-semibold ${getActiveClass('/admin') || getActiveClass('/user')}`}
                >
                  {sessionStorage.getItem('role') === 'user' ? 'Explore' : 'Cards'}
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/login"
                  onClick={() => setExpanded(false)}
                  variant="outline-light"
                  className={`m-2 fw-semibold ${getActiveClass('/login')}`}
                >
                  Login
                </Button>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'admin' && (
                <Link
                  to="/add-card"
                  onClick={() => setExpanded(false)}
                  className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/add-card')}`}
                >
                  Add
                </Link>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'user' && (
                <Link
                  to="/user-assets"
                  onClick={() => setExpanded(false)}
                  className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/user-assets')}`}
                >
                  Assets
                </Link>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'user' && (
                <Link
                  to="/earn-coins"
                  onClick={() => setExpanded(false)}
                  className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/earn-coins')}`}
                >
                  Coins
                </Link>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'user' && (
                <>
                  <Link
                    to="/leaderboard"
                    onClick={() => setExpanded(false)}
                    className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/leaderboard')}`}
                  >
                  Leaderboard
                  </Link>

                  <Link
                    to="/discourse"
                    onClick={() => setExpanded(false)}
                    className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/discourse')}`}
                  >
                  Discourse
                  </Link>
                </>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'admin' && (
                <Link
                  to="/admin/users"
                  onClick={() => setExpanded(false)}
                  className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/admin/users')}`}
                >
                  Users
                </Link>
              )}

              {isLoggedIn && sessionStorage.getItem('role') === 'admin' && (
                <Link
                  to="/discourse"
                  onClick={() => setExpanded(false)}
                  className={`btn btn-outline-light m-2 fw-semibold ${getActiveClass('/discourse')}`}
                >
                Discourse
                </Link>
              )}

              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  variant="outline-danger"
                  className="m-2 fw-semibold"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  as={Link}
                  to="/signup"
                  onClick={() => setExpanded(false)}
                  variant="outline-light"
                  className={`m-2 fw-semibold ${getActiveClass('/signup')}`}
                >
                  Signup
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </motion.div>
  );
};

export default NavbarComponent;
