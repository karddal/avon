from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.by_user: Dict[str, set[WebSocket]] = {}
        self.by_event: Dict[str, set[WebSocket]] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        self.by_user.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: str, ws: WebSocket):
        user_connections = self.by_user.get(user_id)
        if user_connections:
            user_connections.discard(ws)
            if not user_connections:
                self.by_user.pop(user_id, None)

        for event, connections in list(self.by_event.items()):
            if ws in connections:
                connections.discard(ws)
            if not connections:
                self.by_event.pop(event, None)

    def subscribe(self, ws: WebSocket, event: str):
        self.by_event.setdefault(event, set()).add(ws)

    def unsubscribe(self, ws: WebSocket, event: str):
        connections = self.by_event.get(event)
        if not connections:
            return
        connections.discard(ws)
        if not connections:
            self.by_event.pop(event, None)

    async def emit_to_user_if_subscribed(self, user_id: str, event: str, payload: dict):
        user_connections = self.by_user.get(user_id, set())
        event_connections = self.by_event.get(event, set())

        targets = list(user_connections & event_connections)

        dead = []
        for connection in targets:
            try:
                await connection.send_json(payload)
            except Exception:
                dead.append(connection)

        for connection in dead:
            self.disconnect(user_id, connection)