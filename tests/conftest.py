import asyncio
import re
from types import SimpleNamespace

import pytest
import mongomock
from httpx import AsyncClient

from app import main as app_module
from app.utils.jwt_utils import create_access_token


DB = mongomock.MongoClient()


def _parse_value(expr, keyname):
    # rudimentary parser for expressions like "User.email == 'a@b'"
    s = str(expr)
    m = re.search(r"==\s*'([^']+)'", s)
    if m:
        return m.group(1)
    return None


def _doc_to_obj(doc, model='user'):
    # map common fields
    d = {}
    d['id'] = str(doc.get('_id'))
    d['name'] = doc.get('name')
    d['email'] = doc.get('email')
    d['hashed_password'] = doc.get('hashed_password')
    d['role'] = doc.get('role')
    d['wallet_address'] = doc.get('wallet_address')
    d['institution_name'] = doc.get('institution_name')
    d['created_at'] = doc.get('created_at')
    return SimpleNamespace(**d)


@pytest.fixture(autouse=True)
def patch_db(monkeypatch):
    """Monkeypatch database accessors to use mongomock in-memory DB."""

    # patch get_client to return our mongomock client
    monkeypatch.setattr('app.core.database.get_client', lambda: DB)

    # prevent init_db from running at startup in tests
    async def noop_init_db():
        return None

    monkeypatch.setattr('app.core.database.init_db', noop_init_db)

    # Monkeypatch Beanie-style simple find/insert for User and Certificate
    from app.models.user import User
    from app.models.certificate import Certificate

    async def user_find_one(cls, expr=None):
        coll = DB.get_database().get_collection('users')
        if expr is None:
            return None
        email = _parse_value(expr, 'email')
        if email:
            doc = coll.find_one({'email': email})
            return _doc_to_obj(doc) if doc else None
        return None

    async def user_insert(self):
        coll = DB.get_database().get_collection('users')
        doc = self.dict()
        res = coll.insert_one(doc)
        self.id = str(res.inserted_id)
        return self

    async def user_get(cls, id_):
        coll = DB.get_database().get_collection('users')
        from bson import ObjectId
        try:
            oid = ObjectId(id_)
        except Exception:
            # maybe stored as string id
            docs = coll.find()
            for d in docs:
                if str(d.get('_id')) == id_:
                    return _doc_to_obj(d)
            return None
        doc = coll.find_one({'_id': oid})
        return _doc_to_obj(doc) if doc else None

    monkeypatch.setattr(User, 'find_one', classmethod(user_find_one))
    monkeypatch.setattr(User, 'insert', user_insert)
    monkeypatch.setattr(User, 'get', classmethod(user_get))

    # Certificate minimal methods
    async def cert_find_one(cls, expr=None):
        coll = DB.get_database().get_collection('certificates')
        if expr is None:
            return None
        val = _parse_value(expr, 'certificate_id')
        if val:
            doc = coll.find_one({'certificate_id': val})
            return SimpleNamespace(**doc) if doc else None
        return None

    async def cert_insert(self):
        coll = DB.get_database().get_collection('certificates')
        doc = self.dict()
        res = coll.insert_one(doc)
        self.id = str(res.inserted_id)
        return self

    monkeypatch.setattr(Certificate, 'find_one', classmethod(cert_find_one))
    monkeypatch.setattr(Certificate, 'insert', cert_insert)

    # Mock external services
    from app.services import blockchain_service, ipfs_service

    async def mock_mint(*args, **kwargs):
        return {"token_id": 9999, "tx_hash": "0xdeadbeef"}

    async def mock_revoke(*args, **kwargs):
        return {"status": "REVOKED"}

    async def mock_verify(*args, **kwargs):
        return {"valid": True, "token_id": 9999}

    monkeypatch.setattr(blockchain_service, 'mint_certificate', mock_mint)
    monkeypatch.setattr(blockchain_service, 'revoke_certificate', mock_revoke)
    monkeypatch.setattr(blockchain_service, 'verify_certificate', mock_verify)

    async def mock_pin_file(fileobj, filename):
        return {"IpfsHash": "QmTestHash", "PinSize": 1234}

    async def mock_pin_json(obj):
        return {"IpfsHash": "QmMetaHash"}

    monkeypatch.setattr(ipfs_service, 'pin_file', mock_pin_file)
    monkeypatch.setattr(ipfs_service, 'pin_json', mock_pin_json)

    yield


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture
async def client():
    async with AsyncClient(app=app_module.app, base_url='http://test') as ac:
        yield ac


@pytest.fixture
async def sample_institute(client):
    body = {"name": "Inst", "email": "institute@skillchain.test", "password": "SkillChain@2025", "role": "institute", "institution_name": "NIT Skills"}
    r = await client.post('/api/auth/register', json=body)
    assert r.status_code == 200
    token = r.json()['access_token']
    return {"token": token, "email": body['email']}


@pytest.fixture
async def sample_learner(client):
    body = {"name": "Ravi Kumar", "email": "ravi.kumar@test.com", "password": "Learner@2025", "role": "learner"}
    r = await client.post('/api/auth/register', json=body)
    assert r.status_code == 200
    token = r.json()['access_token']
    return {"token": token, "email": body['email']}


@pytest.fixture
async def sample_certificate(client, sample_institute):
    # Issue via API using mocked IPFS and blockchain
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    data = {
        'learner_name': 'Ravi Kumar',
        'learner_email': 'ravi.kumar@test.com',
        'course_name': 'Welding NSQF L4',
        'completion_date': '2026-05-01',
        'grade': 'A'
    }
    files = {'certificate_pdf': ('cert.pdf', b'%PDF-1.4 test pdf bytes', 'application/pdf')}
    r = await client.post('/api/certificates/issue', data=data, files=files, headers=headers)
    assert r.status_code == 200
    return r.json()['data']
