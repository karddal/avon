"use client";

import { useEffect, useRef } from "react";

type OnMessage<T> = (msg: T) => void;

export function useWs<T = unknown>(
  token: string | null,
  onMessage?: OnMessage<T>,
) {
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const webSocket = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws`);
    webSocketRef.current = webSocket;

    webSocket.onopen = () => {
      webSocket.send(JSON.stringify({ type: "auth", token }));
    };

    webSocket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        onMessage?.(msg);
      } catch {}
    };

    webSocket.onclose = () => {
      webSocketRef.current = null;
    };

    return () => {
      webSocket.close();
      webSocketRef.current = null;
    };
  }, [token, onMessage]);

  return webSocketRef;
}
