'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Leaf, Droplets, Cloud, ArrowLeft, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';

export default function EsgReportPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<any>('/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <div className="container">載入報告中...</div>;

  return (
    <div className="container" style={{ marginTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <ArrowLeft size={18} /> 返回控制面板
        </Link>
      </div>

      <div className="card" style={{ backgroundColor: '#f1f8e9', border: 'none', padding: '40px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ color: '#4caf50', marginBottom: '20px' }}>
          <Leaf size={60} />
        </div>
        <h1 style={{ color: '#2e7d32', marginBottom: '10px' }}>ESG 永續影響力報告</h1>
        <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>
          每一份被拯救的剩食，都是對地球的一份承諾。透過智慧循環系統，我們將校園浪費轉化為具體的環保數據。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <Cloud size={40} color="#81c784" style={{ marginBottom: '15px' }} />
          <h3>溫室氣體減量</h3>
          <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: 'var(--primary)' }}>{stats.co2Saved.toFixed(1)} <span style={{ fontSize: '1rem' }}>kg CO2e</span></h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>相當於種植了 {Math.round(stats.co2Saved / 0.5)} 棵樹苗並生長一整月所吸收的二氧化碳。</p>
        </div>

        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <Droplets size={40} color="#4fc3f7" style={{ marginBottom: '15px' }} />
          <h3>節約水資源</h3>
          <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#03a9f4' }}>{stats.waterSaved.toFixed(1)} <span style={{ fontSize: '1rem' }}>m³</span></h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>減少了相當於 {Math.round(stats.waterSaved * 1000 / 250)} 人份的日均飲用水消耗。</p>
        </div>

        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <Globe size={40} color="#ffb74d" style={{ marginBottom: '15px' }} />
          <h3>社會影響力評級</h3>
          <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#ffa726' }}>{stats.impactScore}</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>根據剩食拯救頻率與志工參與度評估，本校園目前處於領先地位。</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '40px', padding: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <BarChart3 color="var(--primary)" />
          <h2 style={{ margin: 0 }}>永續發展目標 (SDGs) 貢獻</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ padding: '15px', backgroundColor: '#fff9c4', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#fbc02d' }}>SDG 2: 消除飢餓</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>透過再分配機制，確保剩餘資源流向有需要的學生或社群。</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#e1f5fe', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#039be5' }}>SDG 12: 負責任的消費與生產</h4>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>有效降低校園餐廳與超商的報廢率，推動循環經濟。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
