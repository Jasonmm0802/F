'use client';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, Users, ShoppingBag, Award, Leaf } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <div style={{ backgroundColor: `${color}22`, color: color, padding: '15px', borderRadius: '12px' }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{title}</p>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</h3>
      </div>
    </div>
  );
}

export default function DashboardStats({ user }: { user: any }) {
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

  if (!stats) return <div className="card">載入統計數據中...</div>;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>數據概覽</h2>
        <Link href="/esg-report" className="btn btn-secondary" style={{ textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Leaf size={14} /> 查看 ESG 永續報告
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
        <StatCard 
          title="累計節省剩食 (份)" 
          value={stats.totalSaved} 
          icon={<ShoppingBag size={24} />} 
          color="#4caf50" 
        />
        <StatCard 
          title="活躍志工數" 
          value={stats.activeVolunteers} 
          icon={<Users size={24} />} 
          color="#2196f3" 
        />
        <StatCard 
          title="碳排放減少 (kg)" 
          value={stats.co2Saved.toFixed(1)} 
          icon={<Leaf size={24} />} 
          color="#8bc34a" 
        />
        <StatCard 
          title="您的累積積分" 
          value={Math.round(user?.points || 0)} 
          icon={<Award size={24} />} 
          color="#ff9800" 
        />
      </div>
    </div>
  );
}
import Link from 'next/link';
