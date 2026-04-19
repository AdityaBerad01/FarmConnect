import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineChatBubbleLeftRight, HiOutlineArrowRight, HiOutlineSparkles } from 'react-icons/hi2';

export default function Home() {
  const { user, api } = useAuth();
  const { t } = useLanguage();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await api.get('/market-prices/trending');
      setTrending(res.data);
    } catch (err) {
      // Silent fail - market data might not be seeded yet
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot"></span>
              Farm-to-Table Revolution
            </div>
            <h1>
              {t('heroTitle')} <span className="highlight">{t('heroHighlight')}</span> {t('heroSubtitle')}
            </h1>
            <p className="hero-desc">
              {t('heroDesc')}
            </p>
            <div className="hero-actions">
              {user ? (
                <>
                  <Link to="/marketplace" className="btn btn-primary btn-lg" id="hero-browse-btn">
                    {t('browseMarketplace')} <HiOutlineArrowRight />
                  </Link>
                  <Link to="/dashboard" className="btn btn-secondary btn-lg" id="hero-dashboard-btn">
                    {t('goToDashboard')}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" id="hero-signup-btn">
                    {t('getStarted')} <HiOutlineArrowRight />
                  </Link>
                  <Link to="/marketplace" className="btn btn-secondary btn-lg" id="hero-explore-btn">
                    {t('browseMarketplace')}
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">2,500+</div>
                <div className="hero-stat-label">{t('verifiedFarmers')}</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">15,000+</div>
                <div className="hero-stat-label">Crop Listings</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">₹5Cr+</div>
                <div className="hero-stat-label">Trade Volume</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Ticker */}
      {trending.length > 0 && (
        <section style={{ padding: '0' }}>
          <div className="container">
            <div className="price-ticker-wrapper" style={{ marginTop: '2rem', position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span className="live-dot" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary-light)' }}>
                    📊 Live Mandi Prices
                  </span>
                </div>
                <div className="price-ticker">
                  {trending.map((crop, i) => (
                    <div key={i} className="price-ticker-item">
                      <span style={{ fontWeight: 600 }}>{crop._id}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>₹{Math.round(crop.avgPrice)}/q</span>
                      <span style={{
                        color: crop.trend === 'up' ? 'var(--color-success)' : crop.trend === 'down' ? 'var(--color-error)' : 'var(--color-text-muted)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        {crop.trend === 'up' ? '▲' : crop.trend === 'down' ? '▼' : '●'}{' '}
                        {crop.changePercent > 0 ? '+' : ''}{crop.changePercent?.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
                <Link to="/market-prices" style={{ flexShrink: 0, fontSize: '0.8rem', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                  View All →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('whyChoose')}</h2>
            <p className="section-subtitle">
              We're transforming how India's agricultural supply chain works, one connection at a time.
            </p>
          </div>

          <div className="features-grid stagger-children">
            <div className="feature-card">
              <div className="feature-icon green">
                <HiOutlineShieldCheck />
              </div>
              <h3>{t('verifiedFarmers')}</h3>
              <p>Every farmer on our platform is verified, ensuring you get authentic, quality produce directly from trusted sources.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">
                <HiOutlineTruck />
              </div>
              <h3>{t('directDelivery')}</h3>
              <p>No middlemen means fresher produce and better prices. Crops go directly from farm to your doorstep within hours.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <HiOutlineChatBubbleLeftRight />
              </div>
              <h3>{t('realTimeChat')}</h3>
              <p>Communicate directly with farmers. Discuss quality, negotiate prices, and build lasting business relationships.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon green">🌿</div>
              <h3>{t('organicOptions')}</h3>
              <p>Filter and find certified organic produce. Know exactly what goes into your food with full transparency.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon orange">📊</div>
              <h3>{t('fairPricing')}</h3>
              <p>Transparent pricing without inflated markups. Live mandi prices help both farmers and buyers get fair deals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon blue">
                <HiOutlineSparkles />
              </div>
              <h3>{t('smartMatching')}</h3>
              <p>Our platform matches buyers with the best farmers based on location, crop type, and quality preferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('howItWorks')}</h2>
            <p className="section-subtitle">Get started in three simple steps</p>
          </div>

          <div className="features-grid stagger-children">
            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
              <h3>1. Sign Up</h3>
              <p>Create your free account as a farmer or buyer. It takes less than 2 minutes to get started.</p>
            </div>

            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3>2. Browse & Connect</h3>
              <p>Explore fresh crop listings or post your harvest. Use filters to find exactly what you need.</p>
            </div>

            <div className="feature-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3>3. Trade & Grow</h3>
              <p>Place orders, chat with partners, and track deliveries. Build lasting farming partnerships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '4rem', 
            background: 'linear-gradient(135deg, rgba(45,106,79,0.15), rgba(231,111,81,0.1))',
            border: '1px solid rgba(45,106,79,0.3)'
          }}>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Ready to Transform Your Farm Business?</h2>
            <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
              Join thousands of farmers and buyers already using FarmConnect.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Start as Farmer 🌾
              </Link>
              <Link to="/register" className="btn btn-accent btn-lg">
                Start as Buyer 🛒
              </Link>
              <Link to="/market-prices" className="btn btn-secondary btn-lg">
                📊 {t('marketPrices')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
