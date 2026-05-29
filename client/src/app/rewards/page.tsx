'use client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const REWARDS = [
  { id: 1, name: '美味盲盒餐食', cost: 100, description: '隨機獲得一份店家提供的驚喜餐點。' },
  { id: 2, name: '環保餐具組', cost: 500, description: '包含不鏽鋼筷子與湯匙。' },
  { id: 3, name: '系統紀念徽章', cost: 50, description: '展示您的志工貢獻。' },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState(user?.points || 0);

  const handleExchange = (reward: any) => {
    if (points >= reward.cost) {
      setPoints(points - reward.cost);
      alert(`成功兌換 ${reward.name}！剩餘積分: ${points - reward.cost}`);
    } else {
      alert('積分不足');
    }
  };

  return (
    <div className="container">
      <h1>積分兌換中心</h1>
      <div className="card">
        <h3>您的當前積分: <span style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>{Math.round(points)}</span></h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {REWARDS.map((reward) => (
          <div key={reward.id} className="card">
            <h3>{reward.name}</h3>
            <p>{reward.description}</p>
            <p style={{ fontWeight: 'bold' }}>需要積分: {reward.cost}</p>
            <button 
              onClick={() => handleExchange(reward)} 
              className="btn btn-primary"
              disabled={points < reward.cost}
            >
              立即兌換
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
