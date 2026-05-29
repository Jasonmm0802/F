'use client';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    lat: 25.0330,
    lng: 121.5654,
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email.includes('@')) {
      setError('請輸入正確的 Email 格式');
      return;
    }

    if (form.email.toLowerCase().includes('@gamil.com')) {
      setError('您是否將 "gmail.com" 打成了 "gamil.com"？');
      return;
    }

    if (form.password.length < 6) {
      setError('密碼至少需要 6 個字元');
      return;
    }

    try {
      const res = await api.post<any>('/auth/register', form);
      if (res.userId) {
        alert('註冊成功，請登入');
        router.push('/login');
      }
    } catch (err: any) {
      setError(err.message || '註冊失敗');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '450px', marginTop: '50px' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>註冊帳號</h2>

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
            <label>姓名 / 商家名稱</label>
            <input 
              type="text" 
              value={form.name} 
              onChange={(e) => setForm({...form, name: e.target.value})} 
              placeholder="請輸入名稱"
              required 
            />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({...form, email: e.target.value})} 
              placeholder="example@gmail.com"
              required 
            />
          </div>
          <div className="input-group">
            <label>密碼 (至少 6 個字元)</label>
            <input 
              type="password" 
              value={form.password} 
              onChange={(e) => setForm({...form, password: e.target.value})} 
              placeholder="請輸入密碼"
              required 
            />
          </div>
          <div className="input-group">
            <label>您的身份</label>
            <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} style={{ cursor: 'pointer' }}>
              <option value="USER">一般使用者 (志工運送員)</option>
              <option value="STORE">店家 (提供剩食)</option>
              <option value="SCHOOL">學校 (接收端)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
            註冊
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
          已有帳號？ <Link href="/login" style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>立即登入</Link>
        </p>
      </div>
    </div>
  );
}
