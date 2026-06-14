#!/bin/bash

# SkillChain Smoke Test Script
# Tests core functionality before hackathon submission

set -e

API_URL="${API_URL:-http://localhost:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "=== SkillChain Smoke Test ==="
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}PASS${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}FAIL${NC}: $2"
        ((FAILED++))
    fi
}

# 1. Health Check
echo "Test 1: Health Check"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" = "200" ]; then
    print_result 0 "Health check returned 200"
    echo "Response: $body"
else
    print_result 1 "Health check failed with code $http_code"
fi
echo ""

# 2. Register Test Institute
echo "Test 2: Register Test Institute"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Institute",
    "email": "smoke_test@institute.test",
    "password": "TestPass123!",
    "role": "institute",
    "institution_name": "Smoke Test Institute"
  }')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    print_result 0 "Institute registration successful"
    TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo "Token obtained: ${TOKEN:0:20}..."
else
    print_result 1 "Institute registration failed with code $http_code"
    echo "Response: $body"
    TOKEN=""
fi
echo ""

# 3. Login Test
echo "Test 3: Login Test Institute"
if [ -n "$TOKEN" ]; then
    print_result 0 "Already logged in from registration"
else
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "institute@skillchain.test",
        "password": "SkillChain@2025"
      }')
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" = "200" ]; then
        print_result 0 "Login successful"
        TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        echo "Token obtained: ${TOKEN:0:20}..."
    else
        print_result 1 "Login failed with code $http_code"
        echo "Response: $body"
    fi
fi
echo ""

# 4. Issue Certificate (with mocked blockchain if no funds)
echo "Test 4: Issue Certificate"
if [ -n "$TOKEN" ]; then
    # Create a dummy PDF file for testing
    echo "%PDF-1.4" > /tmp/test_cert.pdf
    echo "1 0 obj" >> /tmp/test_cert.pdf
    echo "endobj" >> /tmp/test_cert.pdf
    echo "%%EOF" >> /tmp/test_cert.pdf
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/certificates/issue" \
      -H "Authorization: Bearer $TOKEN" \
      -F "learner_name=Smoke Test Learner" \
      -F "learner_email=smoke@learner.test" \
      -F "learner_wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" \
      -F "course_name=Smoke Test Course" \
      -F "completion_date=2024-06-15" \
      -F "grade=A" \
      -F "certificate_pdf=@/tmp/test_cert.pdf")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "202" ]; then
        print_result 0 "Certificate issuance successful"
        CERT_ID=$(echo "$body" | grep -o '"certificate_id":"[^"]*' | cut -d'"' -f4)
        echo "Certificate ID: ${CERT_ID:0:20}..."
    else
        print_result 1 "Certificate issuance failed with code $http_code (may fail if no blockchain funds, this is expected)"
        echo "Response: $body"
        CERT_ID=""
    fi
    rm -f /tmp/test_cert.pdf
else
    print_result 1 "Skipped - no token available"
fi
echo ""

# 5. Verify Certificate
echo "Test 5: Verify Certificate"
if [ -n "$CERT_ID" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL/api/certificates/verify/$CERT_ID")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" = "200" ]; then
        print_result 0 "Certificate verification successful"
        echo "Response: $body"
    else
        print_result 1 "Certificate verification failed with code $http_code"
        echo "Response: $body"
    fi
else
    print_result 1 "Skipped - no certificate ID available"
fi
echo ""

# 6. Fraud Scan
echo "Test 6: Fraud Scan"
if [ -n "$TOKEN" ]; then
    # Create a dummy image for testing
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/fraud/scan" \
      -H "Authorization: Bearer $TOKEN" \
      -F "image=@/tmp/test_image.png")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "202" ]; then
        print_result 0 "Fraud scan successful"
        echo "Response: $body"
    else
        print_result 1 "Fraud scan failed with code $http_code"
        echo "Response: $body"
    fi
    rm -f /tmp/test_image.png
else
    print_result 1 "Skipped - no token available"
fi
echo ""

# Summary
echo "=== Test Summary ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
