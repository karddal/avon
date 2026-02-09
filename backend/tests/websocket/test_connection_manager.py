import pytest

from app.routers.websocket import ConnectionManager


class FakeWs:
    def __init__(self):
        self.send = []

    async def send_json(self, payload):
        self.send.append(payload)

@pytest.mark.asyncio
async def test_emit_to_user_if_subscribed_need_both_conditions():
    manager = ConnectionManager()
    ws = FakeWs()

    user_id = "test_unit"
    manager.by_user.setdefault(user_id, set()).add(ws)

    await manager.emit_to_user_if_subscribed(user_id, "units_changed", {"type":"units_changed"})
    assert ws.send == []

    manager.by_event.setdefault("units_changed", set()).add(ws)
    await manager.emit_to_user_if_subscribed(user_id, "units_changed", {"type":"units_changed"})
    assert ws.send == [{"type":"units_changed"}]