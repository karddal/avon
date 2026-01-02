def test_client_starts(client):
    response = client.get("/")

    # FastAPI always returns 404 for root unless defined
    assert response.status_code == 404
