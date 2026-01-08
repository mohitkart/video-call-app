/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import envirnment from '@/envirnment';
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useSocket = (roomName: string) => {
  const socketRef = useRef<any>(undefined)

  useEffect(() => {
    socketRef.current = io(envirnment.api_url);
    
    socketRef.current.emit('join', roomName);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomName]);

  return socketRef;
};
