def test_health_check_returns_status(client):
    response = client.get("/check/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
