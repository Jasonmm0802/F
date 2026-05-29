import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="container" style={{ 
      textAlign: 'center', 
      marginTop: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '80vh',
      justifyContent: 'center'
    }}>
      <div className="card" style={{ maxWidth: '800px', padding: '60px' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}>
          智慧剩食循環系統
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#666', lineHeight: '1.6', marginBottom: '40px' }}>
          打造永續校園，從減少浪費開始。我們連結餐廳、超商與志工，建立高效、透明的剩食再分配網絡，讓每一份食物都能發揮最大價值。
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link href="/login" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 32px', fontSize: '1.1rem' }}>
            立即開始
          </Link>
          <Link href="/register" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '12px 32px', fontSize: '1.1rem' }}>
            加入我們
          </Link>
        </div>
      </div>
      
      <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', maxWidth: '1200px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>商家</h3>
          <p>簡單登記剩食，減少報廢成本，提升品牌形象。</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>志工</h3>
          <p>參與運送任務，賺取積分，兌換精美獎勵。</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>學校</h3>
          <p>接收安全食材，協助有需要的學生與社團。</p>
        </div>
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ color: 'var(--primary)' }}>AI 助理</h3>
          <p>專業營養搭配建議，為您的健康把關。</p>
        </div>
      </div>
    </div>
  );
}
