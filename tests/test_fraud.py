import pytest


@pytest.mark.anyio
async def test_fraud_scan_genuine_image(client, sample_institute):
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    files = {'image': ('img.jpg', b'fake-image-bytes', 'image/jpeg')}
    r = await client.post('/api/fraud/scan', files=files, headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert 'analysis' in data['data']


@pytest.mark.anyio
async def test_fraud_scan_invalid_file_type_400(client, sample_institute):
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    files = {'image': ('img.txt', b'not-an-image', 'text/plain')}
    r = await client.post('/api/fraud/scan', files=files, headers=headers)
    assert r.status_code in (400, 415)


@pytest.mark.anyio
async def test_fraud_stats_endpoint(client, sample_institute):
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    r = await client.get('/api/fraud/alerts', headers=headers)
    assert r.status_code == 200
