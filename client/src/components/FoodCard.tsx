import { AlertCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

export type SafetyStatus = 'SAFE' | 'WARNING' | 'EXPIRED';

export const getSafetyStatus = (expiryDate: string | Date): SafetyStatus => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 0) return 'EXPIRED';
  if (diffHours <= 1) return 'WARNING';
  return 'SAFE';
};

interface FoodCardProps {
  item: any;
  onAction?: (id: number) => void;
  actionLabel?: string;
  showDetails?: boolean;
  isPurchased?: boolean;
  verificationCode?: string;
  lockerId?: number;
}

export default function FoodCard({ item, onAction, actionLabel, showDetails = true, isPurchased = false, verificationCode, lockerId }: FoodCardProps) {
  const status = getSafetyStatus(item.expiryDate);
  
  const statusConfig = {
    SAFE: { color: '#4caf50', bg: '#e8f5e9', icon: <ShieldCheck size={16} />, label: '安全可領取' },
    WARNING: { color: '#ff9800', bg: '#fff3e0', icon: <AlertCircle size={16} />, label: '即將到期' },
    EXPIRED: { color: '#f44336', bg: '#ffebee', icon: <ShieldAlert size={16} />, label: '禁止領取 (已超時)' },
  };

  const config = statusConfig[status];

  const categoryLabels: Record<string, string> = {
    CANTEEN: '學餐',
    STORE: '超商',
    EVENT: '活動剩食',
  };

  const categoryColors: Record<string, string> = {
    CANTEEN: '#4caf50',
    STORE: '#ff9800',
    EVENT: '#2196f3',
  };

  return (
    <div className="card" style={{ 
      borderLeft: `5px solid ${config.color}`,
      position: 'relative',
      padding: '15px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <span style={{ 
            backgroundColor: categoryColors[item.category] || '#666', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '0.75rem',
            fontWeight: 'bold',
            marginRight: '8px'
          }}>
            {categoryLabels[item.category] || item.category}
          </span>
          <h3 style={{ margin: '5px 0 0 0', fontSize: '1.2rem' }}>{item.name}</h3>
        </div>
        <div style={{ 
          backgroundColor: config.bg, 
          color: config.color, 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontWeight: 'bold'
        }}>
          {config.icon}
          {config.label}
        </div>
      </div>

      {showDetails && (
        <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
          <p style={{ margin: '5px 0' }}><strong>店家:</strong> {item.store?.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: status === 'EXPIRED' ? 'var(--error)' : '#666' }}>
            <Clock size={14} />
            <span>到期時間: {new Date(item.expiryDate).toLocaleString()}</span>
          </div>
          {item.description && <p style={{ margin: '5px 0', fontSize: '0.85rem' }}>{item.description}</p>}
        </div>
      )}

      {onAction && status !== 'EXPIRED' && !isPurchased && (
        <button 
          onClick={() => onAction(item.id)} 
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '5px' }}
        >
          {actionLabel || (item.price > 0 ? `使用 ${item.price} 積分購買` : '領取')}
        </button>
      )}

      {isPurchased && (
        <div style={{ marginTop: '10px', backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffcc80' }}>
          <div style={{ textAlign: 'center', color: '#e65100', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '8px' }}>
            已購買
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>取貨碼</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '2px' }}>{verificationCode}</span>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: '#ffcc80' }}></div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block' }}>櫃位</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>#{lockerId}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '10px', textAlign: 'center', marginBottom: 0 }}>
            請在實體櫃機輸入此碼取貨
          </p>
        </div>
      )}
    </div>
  );
}
