'use client';

import dynamic from 'next/dynamic';

const FoodMapClient = dynamic(() => import('@/components/FoodMapClient'), {
  ssr: false,
  loading: () => <div className="container">地圖載入中...</div>,
});

export default function MapPage() {
  return <FoodMapClient />;
}