import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export function useRealtimeDisplay(displayId: string) {
  const [displayStatus, setDisplayStatus] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Subscribe to display updates
    socket.emit('subscribe:displays');

    // Listen for display updates
    const handleDisplayUpdate = (data: any) => {
      if (data.displayId === displayId) {
        setDisplayStatus(data.update);
        setLastUpdate(new Date(data.timestamp));
      }
    };

    socket.on('display:update', handleDisplayUpdate);

    return () => {
      socket.off('display:update', handleDisplayUpdate);
      socket.emit('unsubscribe:displays');
    };
  }, [displayId]);

  return { displayStatus, lastUpdate };
}