'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic client-side validation
    if (!email.includes('@')) {
      setError('請輸入正確的 Email 格式');
      return;
    }

    if (email.toLowerCase().includes('@gamil.com')) {
      setError('您是否將 "gmail.com" 打成了 "gamil.com"？');
      return;
    }

    try {
      const res = await api.post<any>('/auth/login', { email, password });
      if (res.token) {
        login(res);
      }
    } catch (err: any) {
      setError(err.message || '登入失敗，請稍後再試');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>登入系統</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: 'var(--error)', 
            padding: '10px 15px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            fontSize: '0.9rem',
            border: '1px solid #ffcdd2',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@gmail.com"
              required 
            />
          </div>
          <div className="input-group">
            <label>密碼</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="請輸入密碼"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
            登入
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          還沒有帳號？ <Link href="/register" style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>立即註冊</Link>
        </p>
      </div>
    </div>
  );
}
