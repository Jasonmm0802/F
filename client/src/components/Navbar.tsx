'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav>
      <div className="nav-content">
        <Link href="/" className="logo">智慧剩食循環系統</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>控制面板</Link>
              {user.role === 'USER' && (
                <>
                  <Link href="/map" style={{ textDecoration: 'none', color: 'inherit' }}>任務地圖</Link>
                  <Link href="/rewards" style={{ textDecoration: 'none', color: 'inherit' }}>積分兌換</Link>
                </>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                <span className={`role-badge badge-${user.role.toLowerCase()}`}>
                  {user.name} ({user.role})
                </span>
                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px' }}>登出</button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>登入</Link>
              <Link href="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>註冊</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
