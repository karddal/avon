import { useCallback, useEffect, useState } from "react";
import { mutate as swrMutate } from "swr";
import { useWs } from "@/hooks/use-ws";

type WSMsg =
  | { type: "auth_ok"; user_id: string; role?: string }
  | { type: "subscribe_ok"; event: string }
  | { type: "units_changed" }
  | { type: "error"; message: string };

async function fetchWsToken() {
  const res = await fetch("/api/auth/ws-token", { cache: "no-store" });

  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { token: string };

  return data.token;
}

export function useUnitsRealtime(opts?: { mutate?: typeof swrMutate }) {
  const mutate = opts?.mutate ?? swrMutate;
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    fetchWsToken()
      .then((token) => {
        alive && setToken(token);
      })
      .catch(() => {
        alive && setToken(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const wsRef = useWs(
    token,
    useCallback(
      (msg: WSMsg) => {
        if (msg.type === "auth_ok") {
          wsRef.current?.send(
            JSON.stringify({ type: "subscribe", event: "units_changed" }),
          );
          return;
        }

        if (msg.type === "units_changed") {
          void mutate("/api/calendar/units");
        }
      },
      [mutate],
    ),
  );

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    return () => {
      try {
        ws.send(
          JSON.stringify({ type: "unsubscribe", event: "units_changed" }),
        );
      } catch {}
    };
  }, [wsRef]);

  return { ready: !!token };
}
