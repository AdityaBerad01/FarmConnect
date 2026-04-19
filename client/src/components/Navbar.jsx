import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import { HiOutlineShoppingBag, HiOutlineChatBubbleLeftRight, HiOutlineSquares2X2, HiOutlinePlusCircle, HiOutlineArrowRightOnRectangle, HiOutlineChartBar, HiOutlineWallet, HiOutlineHeart } from 'react-icons/hi2';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarInnerRef = useRef(null);
  const navbarLinksRef = useRef(null);
  const navbarUserRef = useRef(null);
  const navbarLogoRef = useRef(null);
  const marketplaceLinkRef = useRef(null);
  const favoritesLinkRef = useRef(null);
  const languageSwitcherRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  useEffect(() => {
    const logNavbarMetrics = (reason) => {
      const inner = navbarInnerRef.current;
      const links = navbarLinksRef.current;
      const userSection = navbarUserRef.current;
      const logo = navbarLogoRef.current;

      if (!inner || !links || !userSection || !logo) return;

      const data = {
        reason,
        path: location.pathname,
        windowWidth: window.innerWidth,
        menuOpen,
        hasUser: Boolean(user),
        innerWidth: inner.clientWidth,
        linksClientWidth: links.clientWidth,
        linksWidth: links.scrollWidth,
        linksOverflowing: links.scrollWidth > links.clientWidth,
        userClientWidth: userSection.clientWidth,
        userWidth: userSection.scrollWidth,
        logoWidth: logo.scrollWidth,
        totalRequiredWidth: links.scrollWidth + userSection.scrollWidth + logo.scrollWidth,
      };

      // #region agent log
      fetch('http://127.0.0.1:7804/ingest/ecf5640e-99fa-4af5-8378-2c31baad47f5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'28763f'},body:JSON.stringify({sessionId:'28763f',runId:'header-debug-1',hypothesisId:'H1-H2-H3',location:'Navbar.jsx:metrics-effect',message:'Navbar width metrics snapshot',data,timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const marketplaceEl = marketplaceLinkRef.current;
      const favoritesEl = favoritesLinkRef.current;
      if (marketplaceEl && favoritesEl) {
        const innerRect = inner.getBoundingClientRect();
        const userRect = userSection.getBoundingClientRect();
        const marketplaceRect = marketplaceEl.getBoundingClientRect();
        const favoritesRect = favoritesEl.getBoundingClientRect();
        const visibilityData = {
          reason,
          path: location.pathname,
          windowWidth: window.innerWidth,
          innerLeft: Math.round(innerRect.left),
          marketplaceRight: Math.round(marketplaceRect.right),
          favoritesLeft: Math.round(favoritesRect.left),
          favoritesRight: Math.round(favoritesRect.right),
          userLeft: Math.round(userRect.left),
          userRight: Math.round(userRect.right),
          innerRight: Math.round(innerRect.right),
          marketplaceClipped: marketplaceRect.right > innerRect.right,
          favoritesClipped: favoritesRect.right > innerRect.right,
          favoritesInsideLinksOverflow: favoritesRect.right > Math.round(innerRect.left) && favoritesRect.right > userRect.left,
          favoritesOverlapsUser: favoritesRect.right > userRect.left,
          marketplaceText: marketplaceEl.textContent?.trim()?.slice(0, 40) || '',
          favoritesText: favoritesEl.textContent?.trim()?.slice(0, 40) || '',
        };

        // #region agent log
        fetch('http://127.0.0.1:7804/ingest/ecf5640e-99fa-4af5-8378-2c31baad47f5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'28763f'},body:JSON.stringify({sessionId:'28763f',runId:'header-debug-2',hypothesisId:'H5-H6',location:'Navbar.jsx:item-visibility',message:'Marketplace/Favorites visibility snapshot',data:visibilityData,timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }

      const languageEl = languageSwitcherRef.current;
      if (languageEl) {
        const langRect = languageEl.getBoundingClientRect();
        const userRect = userSection.getBoundingClientRect();
        const innerRect = inner.getBoundingClientRect();
        const languageData = {
          reason,
          path: location.pathname,
          windowWidth: window.innerWidth,
          languageWidth: Math.round(langRect.width),
          languageLeft: Math.round(langRect.left),
          languageRight: Math.round(langRect.right),
          userLeft: Math.round(userRect.left),
          userRight: Math.round(userRect.right),
          innerLeft: Math.round(innerRect.left),
          innerRight: Math.round(innerRect.right),
          navShiftRisk: Math.round(langRect.width) > 96,
          hasUser: Boolean(user),
        };

        // #region agent log
        fetch('http://127.0.0.1:7804/ingest/ecf5640e-99fa-4af5-8378-2c31baad47f5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'28763f'},body:JSON.stringify({sessionId:'28763f',runId:'header-debug-language-1',hypothesisId:'H9-H10-H11',location:'Navbar.jsx:language-position',message:'Language switcher position snapshot',data:languageData,timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }
    };

    logNavbarMetrics('effect-run');
    const onResize = () => logNavbarMetrics('resize');
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [location.pathname, menuOpen, user]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7804/ingest/ecf5640e-99fa-4af5-8378-2c31baad47f5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'28763f'},body:JSON.stringify({sessionId:'28763f',runId:'header-debug-1',hypothesisId:'H4',location:'Navbar.jsx:menu-toggle-effect',message:'Menu open state changed',data:{menuOpen,path:location.pathname,windowWidth:window.innerWidth},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, [menuOpen, location.pathname]);

  return (
    <nav className="navbar" id="main-navbar">
      <div className="container navbar-inner" ref={navbarInnerRef}>
        <Link to="/home" className="navbar-logo" ref={navbarLogoRef}>
          <div className="logo-icon">🌾</div>
          <span>FarmConnect</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`} ref={navbarLinksRef}>
          <Link to="/marketplace" className={isActive('/marketplace')} onClick={() => setMenuOpen(false)} ref={marketplaceLinkRef}>
            <HiOutlineShoppingBag /> {t('marketplace')}
          </Link>
          <Link to="/market-prices" className={isActive('/market-prices')} onClick={() => setMenuOpen(false)}>
            <HiOutlineChartBar /> {t('marketPrices')}
          </Link>
          
          {user && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
                <HiOutlineSquares2X2 /> {t('dashboard')}
              </Link>
              {user.role === 'farmer' && (
                <Link to="/add-crop" className={isActive('/add-crop')} onClick={() => setMenuOpen(false)}>
                  <HiOutlinePlusCircle /> {t('addCrop')}
                </Link>
              )}
              <Link to="/messages" className={isActive('/messages')} onClick={() => setMenuOpen(false)}>
                <HiOutlineChatBubbleLeftRight /> {t('messages')}
              </Link>
              <Link to="/wallet" className={isActive('/wallet')} onClick={() => setMenuOpen(false)}>
                <HiOutlineWallet /> {t('wallet')}
              </Link>
              <Link to="/favorites" className={isActive('/favorites')} onClick={() => setMenuOpen(false)} ref={favoritesLinkRef}>
                <HiOutlineHeart /> Favorites
              </Link>
            </>
          )}
        </div>

        <div className="navbar-user" ref={navbarUserRef}>
          <div ref={languageSwitcherRef}>
            <LanguageSwitcher />
          </div>

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            id="theme-toggle-btn"
          >
            <div className="theme-toggle-knob">
              {theme === 'dark' ? '🌙' : '☀️'}
            </div>
          </button>

          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile" className="navbar-avatar" title={user.name}>
                {user.name.charAt(0).toUpperCase()}
              </Link>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary" id="logout-btn">
                <HiOutlineArrowRightOnRectangle /> {t('logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-secondary" id="login-btn">{t('login')}</Link>
              <Link to="/register" className="btn btn-sm btn-primary" id="register-btn">{t('signUp')}</Link>
            </>
          )}
          <button
            className={`mobile-menu-btn ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
