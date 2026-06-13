import pytest


@pytest.mark.anyio
async def test_issue_certificate_success(client, sample_institute):
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
    d = r.json()
    assert d['success'] is True


@pytest.mark.anyio
async def test_issue_certificate_invalid_wallet_address(client, sample_institute):
    # Use an invalid wallet address in form
    headers = {"Authorization": f"Bearer {sample_institute['token']}"}
    data = {
        'learner_name': 'Bad Wallet',
        'learner_email': 'badwallet@test.com',
        'learner_wallet': 'not-an-address',
        'course_name': 'Foo',
        'completion_date': '2026-05-01',
        'grade': 'B'
    }
    files = {'certificate_pdf': ('cert.pdf', b'%PDF-1.4 test pdf bytes', 'application/pdf')}
    r = await client.post('/api/certificates/issue', data=data, files=files, headers=headers)
    # Depending on validation, expect 400 or 422 — ensure not 200
    assert r.status_code != 200


@pytest.mark.anyio
async def test_issue_certificate_learner_cannot_issue(client, sample_learner):
    headers = {"Authorization": f"Bearer {sample_learner['token']}"}
    data = {
        'learner_name': 'Ravi Kumar',
        'learner_email': 'ravi.kumar@test.com',
        'course_name': 'Welding NSQF L4',
        'completion_date': '2026-05-01',
        'grade': 'A'
    }
    files = {'certificate_pdf': ('cert.pdf', b'%PDF-1.4 test pdf bytes', 'application/pdf')}
    r = await client.post('/api/certificates/issue', data=data, files=files, headers=headers)
    assert r.status_code == 403


@pytest.mark.anyio
async def test_verify_certificate_public_no_auth(client, sample_certificate):
    cert_id = sample_certificate.get('certificate_id') or sample_certificate.get('certificate_id')
    r = await client.get(f'/api/certificates/verify/{cert_id}')
    assert r.status_code in (200, 404)
