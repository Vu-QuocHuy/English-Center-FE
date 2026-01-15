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
  const currentReferenceCodeRef = useRef<string | null>(null);

  // Update callbacks ref khi chúng thay đổi
  useEffect(() => {
    callbacksRef.current = { onPaymentSuccess, onPaymentFailure };
  }, [onPaymentSuccess, onPaymentFailure]);

  // Subscribe vào room khi có referenceCode
  const subscribe = useCallback((refCode: string) => {
    const socket = socketRef.current;
    if (socket && refCode) {
      if (socket.connected) {
        socket.emit('subscribe', refCode);
        console.log(`[PaymentSocket] Subscribed to room: ${refCode}`);
      } else {
        // Nếu chưa connected, đợi connect event
        console.log(`[PaymentSocket] Socket not connected yet, waiting for connect event...`);
        const handleConnect = () => {
          socket.emit('subscribe', refCode);
          console.log(`[PaymentSocket] Subscribed to room: ${refCode} after connect`);
          socket.off('connect', handleConnect);
        };
        socket.on('connect', handleConnect);
      }
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

    // Hàm để subscribe khi socket connected
    const handleConnect = () => {
      console.log('[PaymentSocket] Socket connected, subscribing...');
      const currentRefCode = currentReferenceCodeRef.current;
      if (currentRefCode) {
        subscribe(currentRefCode);
      }
    };

    // Unsubscribe referenceCode cũ nếu có
    const oldReferenceCode = currentReferenceCodeRef.current;
    if (oldReferenceCode && oldReferenceCode !== referenceCode) {
      unsubscribe(oldReferenceCode);
    }

    // Cập nhật referenceCode hiện tại
    currentReferenceCodeRef.current = referenceCode || null;

    // Subscribe ngay nếu đã connected, hoặc đợi connect event
    if (socket.connected && referenceCode) {
      subscribe(referenceCode);
    } else if (referenceCode) {
      socket.on('connect', handleConnect);
    }

    // Cleanup
    return () => {
      const refCodeToUnsubscribe = currentReferenceCodeRef.current;
      if (refCodeToUnsubscribe) {
        unsubscribe(refCodeToUnsubscribe);
      }
      socket.off('paymentSuccess', handlePaymentSuccess);
      socket.off('paymentFailure', handlePaymentFailure);
      socket.off('connect', handleConnect);
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
