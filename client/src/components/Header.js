import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { BRAND_INFO, CATEGORIES } from '../config/constants';
import { 
  HeartIcon, 
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, adminLogout, isAuthenticated, isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    if (isAdmin) {
      adminLogout();
      navigate('/');
    } else {
      logout();
      navigate('/');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <img src={BRAND_INFO.logo} alt={BRAND_INFO.name} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            {CATEGORIES.map(category => (
              <Link key={category} to={`/collection/${category}`}>
                {category}
              </Link>
            ))}
            <Link to="/products">All Products</Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">
              <MagnifyingGlassIcon />
            </button>
          </form>

          {/* Right Icons */}
          <div className="header-actions">
            <Link to="/wishlist" className="icon-link">
              <HeartIcon />
              {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
            </Link>
            {isAuthenticated || isAdmin ? (
              <div className="user-menu">
                <UserIcon />
                <div className="user-dropdown">
                  {isAdmin ? (
                    <>
                      <Link to="/admin">Admin Dashboard</Link>
                      <button onClick={handleLogout}>Logout</button>
                    </>
                  ) : (
                    <>
                      <span>{user?.first_name || user?.email}</span>
                      <button onClick={handleLogout}>Logout</button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline">
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <nav>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              {CATEGORIES.map(category => (
                <Link
                  key={category}
                  to={`/collection/${category}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>All Products</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              {isAuthenticated || isAdmin ? (
                <button onClick={handleLogout}>Logout</button>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;