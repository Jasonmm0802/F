'use client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import FoodCard from '@/components/FoodCard';
import DashboardStats from '@/components/DashboardStats';

export default function DashboardPage() {
  const { user, token, setUser } = useAuth();
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [newFood, setNewFood] = useState({ name: '', price: 0, expiryDate: '', category: 'STORE', description: '' });
  const [incomingDeliveries, setIncomingDeliveries] = useState<any[]>([]);
  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'USER') {
      fetchAvailableFood();
      fetchActiveTasks();
    }
    if (user?.role === 'SCHOOL') {
      fetchIncomingDeliveries();
    }
  }, [user]);

  const fetchAvailableFood = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/food/available', token!);
      setFoodItems(data);
    } catch (error) {
      console.error('Failed to fetch food:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveTasks = async () => {
    try {
      const data = await api.get<any[]>('/delivery/active', token!);
      // 分離購買的項目和運送中的項目
      setActiveTasks(data.filter(d => !d.verificationCode));
      setPurchasedItems(data.filter(d => d.verificationCode));
    } catch (error) {
      console.error('Failed to fetch active tasks:', error);
    }
  };

  const fetchIncomingDeliveries = async () => {
    try {
      const data = await api.get<any[]>('/delivery/school', token!);
      setIncomingDeliveries(data);
    } catch (error) {
      console.error('Failed to fetch incoming deliveries:', error);
    }
  };

  const handleClaim = async (foodId: number) => {
    const schoolId = prompt('請輸入送達學校 ID (測試用, 預設可用 2):', '2');
    if (!schoolId) return;

    try {
      const res = await api.post<any>('/delivery/claim', { foodId, schoolId: Number(schoolId) }, token!);
      alert('領取成功！');
      fetchAvailableFood();
      fetchActiveTasks();
      // 更新用戶積分 (本地)
      const food = foodItems.find(f => f.id === foodId);
      if (food && food.price > 0 && user) {
        setUser({ ...user, points: user.points - food.price });
      }
    } catch (error: any) {
      alert(error.message || '領取失敗');
    }
  };

  const handleTopup = async () => {
    const amount = prompt('請輸入儲值金額:', '100');
    if (!amount) return;

    try {
      const res = await api.post<any>('/points/topup', { amount: Number(amount) }, token!);
      alert(`儲值成功！當前積分: ${res.points}`);
      if (user) {
        setUser({ ...user, points: res.points });
      }
    } catch (error: any) {
      alert(error.message || '儲值失敗');
    }
  };

  const handleConfirm = async (deliveryId: number) => {
    try {
      const res = await api.post<any>('/delivery/confirm', { deliveryId }, token!);
      alert(res.message);
      fetchIncomingDeliveries();
    } catch (error: any) {
      alert(error.message || '確認失敗');
    }
  };

  const handleRegisterFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>('/food', newFood, token!);
      if (res.id) {
        alert('食品登記成功');
        setNewFood({ name: '', price: 0, expiryDate: '', category: 'STORE', description: '' });
      }
    } catch (error: any) {
      alert(error.message || '登記失敗');
    }
  };

  if (!user) return <div className="container">請先登入</div>;

  return (
    <div className="container">
      <h1 style={{ marginBottom: '30px' }}>控制面板</h1>

      <DashboardStats user={user} />

        {user.role === 'STORE' && (
          <div className="card">
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>登記新食品</h2>
            <form onSubmit={handleRegisterFood}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label>食品名稱</label>
                  <input type="text" value={newFood.name} onChange={(e) => setNewFood({...newFood, name: e.target.value})} placeholder="例如: 雞腿便當" required />
                </div>
                <div className="input-group">
                  <label>剩食來源分類</label>
                  <select value={newFood.category} onChange={(e) => setNewFood({...newFood, category: e.target.value})}>
                    <option value="STORE">超商</option>
                    <option value="CANTEEN">學餐</option>
                    <option value="EVENT">活動剩食</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label>價格 (積分)</label>
                  <input type="number" value={newFood.price} onChange={(e) => setNewFood({...newFood, price: Number(e.target.value)})} required />
                </div>
                <div className="input-group">
                  <label>安全領取期限</label>
                  <input type="datetime-local" value={newFood.expiryDate} onChange={(e) => setNewFood({...newFood, expiryDate: e.target.value})} required />
                </div>
              </div>
              <div className="input-group">
                <label>描述 (選填)</label>
                <textarea 
                  value={newFood.description} 
                  onChange={(e) => setNewFood({...newFood, description: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', minHeight: '80px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>提交登記</button>
            </form>
          </div>
        )}

        {user.role === 'USER' && (
          <div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <button onClick={handleTopup} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 25px', cursor: 'pointer' }}>
                <span style={{ fontSize: '1.2rem' }}>💰</span> 積分儲值
              </button>
              <Link href="/map" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 25px' }}>
                <span style={{ fontSize: '1.2rem' }}>📍</span> 查看地圖
              </Link>
            </div>
            
            {purchasedItems.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: '#e65100' }}>已購買待領取的剩食</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {purchasedItems.map((task) => (
                    <FoodCard 
                      key={task.id} 
                      item={task.food} 
                      isPurchased={true} 
                      verificationCode={task.verificationCode} 
                      lockerId={task.lockerId}
                    />
                  ))}
                </div>
              </div>
            )}

            <h2 style={{ marginBottom: '20px' }}>附近可領取的剩食</h2>
            {loading ? <p>載入中...</p> : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {foodItems.length === 0 ? <p>目前沒有可領取的剩食。</p> : foodItems.map((item: any) => (
                  <FoodCard key={item.id} item={item} onAction={handleClaim} />
                ))}
              </div>
            )}

            {activeTasks.length > 0 && (
              <div style={{ marginTop: '40px' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--secondary)' }}>進行中的任務</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                  {activeTasks.map((task) => (
                    <div key={task.id} className="card" style={{ borderLeft: '5px solid var(--secondary)' }}>
                      <h3 style={{ margin: '0 0 10px 0' }}>{task.food.name}</h3>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>從:</strong> {task.food.store.name}</p>
                      <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>到:</strong> {task.school.name}</p>
                      <div style={{ marginTop: '15px', backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>
                        <span style={{ color: '#1565c0', fontWeight: 'bold' }}>任務狀態: 運送中...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'SCHOOL' && (
          <div className="card">
            <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>收貨確認</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>在這裡您可以確認志工送達的食品。</p>
            {loading ? <p>載入中...</p> : incomingDeliveries.length === 0 ? (
              <p>目前沒有待確認的運送。</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {incomingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="card" style={{ borderTop: '4px solid var(--secondary)' }}>
                    <div style={{ marginBottom: '10px' }}><strong>食品:</strong> {delivery.food.name}</div>
                    <div style={{ marginBottom: '10px' }}><strong>運送員:</strong> {delivery.courier.name}</div>
                    <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9rem' }}>
                      <strong>開始時間:</strong> {new Date(delivery.startTime).toLocaleString()}
                    </div>
                    <button onClick={() => handleConfirm(delivery.id)} className="btn btn-primary" style={{ width: '100%' }}>
                      確認送達
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
