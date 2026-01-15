import { useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '@shared/services/socket.service';

export interface PaymentSuccessData {
  message: string;
  referenceCode: string;
  status: string;
  paymentId?: string;
  paidAmount?: number;
  totalAmount?: number;
  discountPercent?: number;
  amount?: number;
  method?: string;
  note?: string;
  studentName?: string;
  [key: string]: unknown;
}

export interface PaymentFailureData {
  message: string;
  referenceCode: string;
  status: string;
  [key: string]: unknown;
}

interface UsePaymentSocketOptions {
  referenceCode?: string | null;
  onPaymentSuccess?: (data: PaymentSuccessData) => void;
  onPaymentFailure?: (data: PaymentFailureData) => void;
  enabled?: boolean;
}

export const usePaymentSocket = ({
  referenceCode,
  onPaymentSuccess,
  onPaymentFailure,
  enabled = true,
}: UsePaymentSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const callbacksRef = useRef({ onPaymentSuccess, onPaymentFailure });

  // Update callbacks ref khi chúng thay đổi
  useEffect(() => {
    callbacksRef.current = { onPaymentSuccess, onPaymentFailure };
  }, [onPaymentSuccess, onPaymentFailure]);

  // Subscribe vào room khi có referenceCode
  const subscribe = useCallback((refCode: string) => {
    const socket = socketRef.current;
    if (socket && socket.connected && refCode) {
      socket.emit('subscribe', refCode);
      console.log(`[PaymentSocket] Subscribed to room: ${refCode}`);
    }
  }, []);

  // Unsubscribe khỏi room
  const unsubscribe = useCallback((refCode: string) => {
    const socket = socketRef.current;
    if (socket && socket.connected && refCode) {
      socket.emit('unsubscribe', refCode);
      console.log(`[PaymentSocket] Unsubscribed from room: ${refCode}`);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Kết nối đến payments namespace
    const socket = socketService.connect('payments');
    socketRef.current = socket;

    // Lắng nghe payment success event
    const handlePaymentSuccess = (data: PaymentSuccessData) => {
      console.log('[PaymentSocket] Payment success:', data);
      if (callbacksRef.current.onPaymentSuccess) {
        callbacksRef.current.onPaymentSuccess(data);
      }
    };

    // Lắng nghe payment failure event
    const handlePaymentFailure = (data: PaymentFailureData) => {
      console.log('[PaymentSocket] Payment failure:', data);
      if (callbacksRef.current.onPaymentFailure) {
        callbacksRef.current.onPaymentFailure(data);
      }
    };

    socket.on('paymentSuccess', handlePaymentSuccess);
    socket.on('paymentFailure', handlePaymentFailure);

    // Subscribe vào room nếu có referenceCode
    if (referenceCode) {
      subscribe(referenceCode);
    }

    // Cleanup
    return () => {
      if (referenceCode) {
        unsubscribe(referenceCode);
      }
      socket.off('paymentSuccess', handlePaymentSuccess);
      socket.off('paymentFailure', handlePaymentFailure);
    };
  }, [enabled, referenceCode, subscribe, unsubscribe]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (referenceCode) {
        unsubscribe(referenceCode);
      }
    };
  }, [referenceCode, unsubscribe]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
    subscribe,
    unsubscribe,
  };
};
