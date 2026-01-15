import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@config/api';

class SocketService {
  private socket: Socket | null = null;
  private namespace: string | null = null;

  /**
   * Kết nối đến socket namespace
   * @param namespace - Namespace của socket (ví dụ: 'payments')
   * @returns Socket instance
   */
  connect(namespace: string): Socket {
    if (this.socket && this.namespace === namespace && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    const baseUrl = API_CONFIG.BASE_URL.replace(/\/api\/v1?$/, '').replace(/\/api$/, '');
    const socketUrl = `${baseUrl}/${namespace}`;

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    this.namespace = namespace;

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected to namespace: ${namespace}`);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log(`[Socket] Disconnected from ${namespace}:`, reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error(`[Socket] Connection error to ${namespace}:`, error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.namespace = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();