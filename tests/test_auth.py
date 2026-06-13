import pytest


@pytest.mark.anyio
async def test_register_institute_success(client):
    body = {"name": "Test Inst", "email": "inst2@test", "password": "Pass@1234", "role": "institute", "institution_name": "Inst 2"}
    r = await client.post('/api/auth/register', json=body)
    assert r.status_code == 200
    data = r.json()
    assert 'access_token' in data
    assert data['user']['email'] == body['email']


@pytest.mark.anyio
async def test_register_duplicate_email_fails(client):
    body = {"name": "Dup", "email": "dup@test", "password": "Pass@1234", "role": "learner"}
    r1 = await client.post('/api/auth/register', json=body)
    assert r1.status_code == 200
    r2 = await client.post('/api/auth/register', json=body)
    assert r2.status_code == 400


@pytest.mark.anyio
async def test_login_success_returns_jwt(client):
    body = {"name": "Luser", "email": "login@test", "password": "Login@123", "role": "learner"}
    r = await client.post('/api/auth/register', json=body)
    assert r.status_code == 200
    resp = await client.post('/api/auth/login', json={"email": body['email'], "password": body['password']})
    assert resp.status_code == 200
    assert 'access_token' in resp.json()


@pytest.mark.anyio
async def test_login_wrong_password_fails(client):
    body = {"name": "Bad", "email": "bad@test", "password": "Right@123", "role": "learner"}
    await client.post('/api/auth/register', json=body)
    resp = await client.post('/api/auth/login', json={"email": body['email'], "password": "WrongPass"})
    assert resp.status_code == 401


@pytest.mark.anyio
async def test_get_me_authenticated(client, sample_institute):
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    r = await client.get('/api/auth/me', headers=headers)
    assert r.status_code == 200
    assert r.json()['user']['email'] == sample_institute['email']


@pytest.mark.anyio
async def test_get_me_unauthenticated_401(client):
    r = await client.get('/api/auth/me')
    assert r.status_code == 401
