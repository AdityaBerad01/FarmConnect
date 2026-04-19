import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WalletPage() {
  const { user, api } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.data);
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) return;

    setAdding(true);
    try {
      await api.post('/wallet/add-funds', { amount, method: 'upi' });
      setAddAmount('');
      setShowAddForm(false);
      setSuccessMsg(`₹${amount.toLocaleString()} added successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add funds');
    } finally {
      setAdding(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">💳 Digital Wallet</h1>
          <p className="page-subtitle">Manage your FarmConnect wallet and transactions</p>
        </div>

        {successMsg && (
          <div className="animate-slide-up" style={{
            padding: '1rem 1.5rem',
            background: 'rgba(82,183,136,0.1)',
            border: '1px solid rgba(82,183,136,0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            ✅ {successMsg}
          </div>
        )}

        {/* Balance Card */}
        <div className="wallet-balance-card animate-fade-in">
          <div className="wallet-balance-bg"></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.25rem' }}>Available Balance</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
              ₹{wallet.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.5rem' }}>
              👤 {user?.name} • {user?.role === 'farmer' ? '🧑‍🌾 Farmer' : '🛒 Buyer'}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn btn-lg"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                💰 Add Funds
              </button>
            </div>
          </div>
        </div>

        {/* Add Funds Form */}
        {showAddForm && (
          <div className="card animate-slide-up" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>💰 Add Funds via UPI</h3>
            <form onSubmit={handleAddFunds}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    type="button"
                    className={`btn btn-sm ${addAmount === String(amt) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAddAmount(String(amt))}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Enter Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  min="1"
                  max="100000"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={adding}>
                  {adding ? 'Processing...' : '📱 Pay via UPI'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Transaction History */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>📜 Transaction History</h3>

          {wallet.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
              <p>No transactions yet. Add funds to get started!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {wallet.transactions.map((txn, i) => (
                <div key={i} className="transaction-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={`transaction-icon ${txn.type}`}>
                      {txn.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{txn.description}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {txn.method?.toUpperCase()} • {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: txn.type === 'credit' ? 'var(--color-success)' : 'var(--color-error)'
                  }}>
                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
