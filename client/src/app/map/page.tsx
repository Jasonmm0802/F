'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import L from 'leaflet';
import FoodCard from '@/components/FoodCard';

// Dynamically import Leaflet components with no SSR
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function FoodMap() {
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const { token } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchAvailableFood();
  }, []);

  const fetchAvailableFood = async () => {
    try {
      const data = await api.get<any[]>('/food/available', token!);
      setFoodItems(data);
    } catch (error) {
      console.error('Failed to fetch food items:', error);
    }
  };

  const handleClaim = async (foodId: number) => {
    try {
      // For demo, we just pick school ID 1
      const res = await api.post<any>('/delivery/claim', { foodId, schoolId: 1 }, token!);
      if (res.id) {
        alert('已領取運送任務！');
        fetchAvailableFood();
      }
    } catch (error: any) {
      alert(error.message || '領取失敗');
    }
  };

  if (!isMounted) return <div className="container">載入中...</div>;

  // Custom Icons for different categories
  const createIcon = (color: string) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });

  const icons: Record<string, any> = {
    CANTEEN: createIcon('#4caf50'), // Green
    STORE: createIcon('#ff9800'),   // Yellow
    EVENT: createIcon('#2196f3'),   // Blue
    DEFAULT: createIcon('#9e9e9e'), // Grey
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>剩食聚集地圖</h1>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', backgroundColor: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50' }}></div>
          <span style={{ fontSize: '0.9rem' }}>學餐 (🟢)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff9800' }}></div>
          <span style={{ fontSize: '0.9rem' }}>超商 (🟡)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2196f3' }}></div>
          <span style={{ fontSize: '0.9rem' }}>活動剩食 (🔵)</span>
        </div>
      </div>

      <div className="map-container" style={{ height: '700px', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <MapContainer center={[25.0330, 121.5654]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {foodItems.map((item) => (
            <Marker 
              key={item.id} 
              position={[item.store.lat || 25.0330, item.store.lng || 121.5654]} 
              icon={icons[item.category] || icons.DEFAULT}
            >
              <Popup maxWidth={300}>
                <div style={{ minWidth: '250px' }}>
                  <FoodCard 
                    item={item} 
                    onAction={handleClaim} 
                    actionLabel="領取運送任務"
                    showDetails={true}
                  />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
