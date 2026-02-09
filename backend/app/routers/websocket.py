import json

from app.core.webSocket.manager import ConnectionManager
from fastapi import WebSocket, WebSocketDisconnect, APIRouter
from app.core.security import verify_token_and_get_user
from app.schemas.websocket import ws_msg_adapter, Auth, Subscribe, Unsubscribe

router = APIRouter(prefix="/ws")
manager = ConnectionManager()

@router.websocket("")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    user_id = None

    try:
        # auth message
        first = json.loads(await ws.receive_text())
        first_msg = ws_msg_adapter(first)

        if not isinstance(first_msg, Auth):
            await ws.close(code=1008)
            return

        payload = await verify_token_and_get_user(first_msg.token)

        user_id = payload.get('sub') or payload.get("id")
        role = payload.get('role')

        if not user_id:
            await ws.close(code=1008)
            return

        await manager.connect(user_id, ws)
        await ws.send_json({'type': 'auth_ok', 'user_id': user_id, 'role': role})

        while True:
            raw = json.loads(await ws.receive_text())

            try:
                msg = ws_msg_adapter(raw)
            except Exception as e:
                await ws.send_json({"type": "error", "message": str(e)})
                continue

            if isinstance(msg, Subscribe):
                manager.subscribe(ws, msg.event)
                await ws.send_json({"type": "subscribe_ok", "event": msg.event})

            if isinstance(msg, Unsubscribe):
                manager.unsubscribe(ws, msg.event)

    except WebSocketDisconnect:
        if 'user_id' in locals():
            manager.disconnect(user_id, ws)
    except Exception:
        if 'user_id' in locals():
            manager.disconnect(user_id, ws)
        try:
            await ws.close(code=1011)
        except Exception:
            pass