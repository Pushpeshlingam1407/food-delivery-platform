import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CookingPot, CheckCircle, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../shared/services/api';

interface Order {
  id: string;
  order_number: string;
  status: 'placed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
}

export const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantStatus, setRestaurantStatus] = useState('closed');

  useEffect(() => {
    const fetchRestaurantAndOrders = async () => {
      try {
        // Fetch owner's restaurant profile
        const res = await api.get('/restaurants');
        // Let's search for owner restaurant
        const restaurants = res.data.data;
        if (restaurants.length > 0) {
          const r = restaurants[0]; // Choose first owned
          setRestaurantId(r.id);
          setRestaurantStatus(r.status);

          // Fetch orders
          const ordersRes = await api.get(`/orders`);
          if (ordersRes.data.status === 'success') {
            setOrders(ordersRes.data.data.filter((o: any) => o.restaurant_id === r.id));
          }
        }
      } catch (err) {
        console.error('Fetch dashboard data failed:', err);
      }
    };

    fetchRestaurantAndOrders();
  }, []);

  // Connect Socket.IO listeners
  useEffect(() => {
    if (!restaurantId) return;

    const socket: Socket = io('http://localhost:5000');

    socket.on('connect', () => {
      console.log('Connected to real-time merchant network');
      socket.emit('joinRoom', { room: `restaurant_${restaurantId}` });
    });

    socket.on('newOrderReceived', (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
      toast.success('Incoming Order Received!', {
        description: `Order #${newOrder.order_number} for $${newOrder.total_amount} placed.`,
        duration: 10000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status: newStatus });
      if (response.data.status === 'success') {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        toast.success(`Order status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      }
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  const toggleRestaurantOpen = async () => {
    if (!restaurantId) return;
    const nextStatus = restaurantStatus === 'open' ? 'closed' : 'open';
    try {
      const response = await api.put(`/restaurants/${restaurantId}`, { status: nextStatus });
      if (response.data.status === 'success') {
        setRestaurantStatus(nextStatus);
        toast.success(`Restaurant is now ${nextStatus.toUpperCase()}`);
      }
    } catch (err) {
      toast.error('Failed to toggle restaurant status.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Panel */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-squircle)',
          padding: '32px',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Active Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>Realtime order dispatch control panel</p>
        </div>

        {/* Status toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Store Status:{' '}
            <strong style={{ color: restaurantStatus === 'open' ? '#4CAF50' : '#F44336' }}>
              {restaurantStatus.toUpperCase()}
            </strong>
          </span>
          <button
            onClick={toggleRestaurantOpen}
            className="btn-premium"
            style={{
              padding: '8px 24px',
              fontSize: '0.9rem',
              background: restaurantStatus === 'open' ? '#F44336' : 'var(--primary-gradient)',
              boxShadow: 'none',
            }}
          >
            {restaurantStatus === 'open' ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {/* Grid list of orders */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '32px' }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{
              background: '#FFF',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-standard)',
              padding: '24px',
              boxShadow: 'var(--glass-shadow)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Order Card Head */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>Order #{o.order_number}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(o.created_at).toLocaleTimeString()}
                </div>
              </div>
              <span
                style={{
                  background: 'rgba(25, 25, 25, 0.04)',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {o.status.toUpperCase()}
              </span>
            </div>

            {/* Customer Details */}
            <div style={{ fontSize: '0.95rem', color: 'var(--text-slate)', marginBottom: '20px', flexGrow: 1 }}>
              Customer:{' '}
              <strong>
                {o.customer_first_name} {o.customer_last_name}
              </strong>
            </div>

            {/* Total value */}
            <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '24px' }}>
              ${parseFloat(o.total_amount.toString()).toFixed(2)}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {o.status === 'placed' && (
                <button
                  onClick={() => handleUpdateStatus(o.id, 'preparing')}
                  className="btn-premium"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    fontSize: '0.9rem',
                  }}
                >
                  <CookingPot size={16} /> Accept Order
                </button>
              )}

              {o.status === 'preparing' && (
                <button
                  onClick={() => handleUpdateStatus(o.id, 'ready')}
                  className="btn-premium"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    fontSize: '0.9rem',
                    background: 'var(--accent-violet)',
                  }}
                >
                  <CheckCircle size={16} /> Ready for Pickup
                </button>
              )}

              {o.status === 'ready' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', width: '100%', justifyContent: 'center' }}>
                  <Clock size={16} /> Waiting for Driver Pickup...
                </div>
              )}

              {o.status === 'out_for_delivery' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-orange)', fontSize: '0.9rem', width: '100%', justifyContent: 'center', fontWeight: 700 }}>
                  <Clock size={16} /> Order Out for Delivery...
                </div>
              )}

              {o.status === 'delivered' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4CAF50', fontSize: '0.9rem', width: '100%', justifyContent: 'center', fontWeight: 700 }}>
                  <Check size={16} /> Order Delivered!
                </div>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div style={{ padding: '60px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
            No active orders.
          </div>
        )}
      </div>
    </div>
  );
};
