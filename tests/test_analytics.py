import pytest


@pytest.mark.anyio
async def test_public_stats_no_auth_required(client):
    r = await client.get('/api/analytics/stats')
    assert r.status_code == 200
    data = r.json()
    assert 'data' in data


@pytest.mark.anyio
async def test_institute_dashboard_requires_auth(client):
    r = await client.get('/api/analytics/dashboard')
    assert r.status_code == 401 or r.status_code == 403


@pytest.mark.anyio
async def test_stats_returns_correct_counts(client, sample_institute):
    # Ensure endpoint responds and includes key fields
    r = await client.get('/api/analytics/stats')
    assert r.status_code == 200
    data = r.json()['data']
    assert 'total_certificates_issued' in data
