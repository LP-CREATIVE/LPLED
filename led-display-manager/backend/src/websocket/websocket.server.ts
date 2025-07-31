import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { supabase } from '../index';
import { logger } from '../utils/logger';
import { monitoringService } from '../services/monitoring.service';

export function setupWebSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
      credentials: true
    }
  });

  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error('Invalid token'));
      }

      socket.data.userId = user.id;
      socket.data.userEmail = user.email;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User ${socket.data.userEmail} connected via WebSocket`);

    // Join user's room
    socket.join(`user:${socket.data.userId}`);

    // Subscribe to display updates
    socket.on('subscribe:displays', async () => {
      try {
        // Get user's displays
        const { data: displays, error } = await supabase
          .from('displays')
          .select('*')
          .eq('user_id', socket.data.userId);

        if (!error && displays) {
          // Send initial display data
          socket.emit('displays:initial', displays);

          // Join display-specific rooms
          displays.forEach(display => {
            socket.join(`display:${display.id}`);
          });

          // Start monitoring for this user's displays
          monitoringService.startUserDisplayMonitoring(socket.data.userId);
        }
      } catch (error) {
        logger.error('Failed to subscribe to displays:', error);
        socket.emit('error', { message: 'Failed to subscribe to displays' });
      }
    });

    // Handle display control commands
    socket.on('display:control', async (data) => {
      try {
        const { displayId, command } = data;

        // Verify ownership
        const { data: display, error } = await supabase
          .from('displays')
          .select('id')
          .eq('id', displayId)
          .eq('user_id', socket.data.userId)
          .single();

        if (error || !display) {
          throw new Error('Display not found or not authorized');
        }

        // Emit command acknowledgment
        socket.emit('display:control:ack', { displayId, command, status: 'processing' });

        // Command will be processed by the REST API
        // Real-time updates will be sent via display status monitoring
      } catch (error) {
        logger.error('Failed to process display control:', error);
        socket.emit('error', { message: 'Failed to process command' });
      }
    });

    // Unsubscribe from display updates
    socket.on('unsubscribe:displays', () => {
      // Leave all display rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('display:')) {
          socket.leave(room);
        }
      });
    });

    socket.on('disconnect', () => {
      logger.info(`User ${socket.data.userEmail} disconnected`);
    });
  });

  // Function to broadcast display updates
  const broadcastDisplayUpdate = (displayId: string, update: any) => {
    io.to(`display:${displayId}`).emit('display:update', {
      displayId,
      update,
      timestamp: new Date().toISOString()
    });
  };

  // Function to broadcast to all user's displays
  const broadcastToUser = (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  return {
    io,
    broadcastDisplayUpdate,
    broadcastToUser
  };
}