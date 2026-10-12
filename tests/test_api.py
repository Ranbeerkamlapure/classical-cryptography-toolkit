"""
Automated Integration Tests for Flask REST API Endpoints
Tests API routes, payloads, file handling, edge cases, and error responses.
"""

import io
import json
import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app import app


@pytest.fixture
def client():
    """Flask test client fixture."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ==============================================================================
# API HEALTH & ALGORITHMS
# ==============================================================================

def test_api_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_api_algorithms(client):
    response = client.get("/api/algorithms")
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    algos = data["algorithms"]
    assert len(algos) == 8
    algo_ids = {a["id"] for a in algos}
    expected = {"caesar", "monoalphabetic", "playfair", "hill", "vigenere", "otp", "rail_fence", "columnar"}
    assert algo_ids == expected


# ==============================================================================
# KEY GENERATION ENDPOINT
# ==============================================================================

def test_api_generate_key_monoalphabetic(client):
    response = client.post("/api/generate-key", json={"algorithm": "monoalphabetic"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["key"]) == 26
    assert len(set(data["key"])) == 26


def test_api_generate_key_otp(client):
    response = client.post("/api/generate-key", json={"algorithm": "otp", "length": 32})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["key"]) == 32


# ==============================================================================
# ENCRYPT / DECRYPT ENDPOINTS
# ==============================================================================

def test_api_encrypt_caesar(client):
    payload = {
        "algorithm": "caesar",
        "text": "Hello, World!",
        "key": 3
    }
    response = client.post("/api/encrypt", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["ciphertext"] == "Khoor, Zruog!"
    assert "execution_time_ms" in data


def test_api_decrypt_caesar(client):
    payload = {
        "algorithm": "caesar",
        "text": "Khoor, Zruog!",
        "key": 3
    }
    response = client.post("/api/decrypt", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["plaintext"] == "Hello, World!"


def test_api_encrypt_hill(client):
    payload = {
        "algorithm": "hill",
        "text": "HELP",
        "key": [[9, 4], [5, 7]]
    }
    response = client.post("/api/encrypt", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    
    # Decrypt to verify round-trip
    dec_response = client.post("/api/decrypt", json={
        "algorithm": "hill",
        "text": data["ciphertext"],
        "key": [[9, 4], [5, 7]]
    })
    assert dec_response.status_code == 200
    dec_data = dec_response.get_json()
    assert dec_data["plaintext"] == "HELP"


def test_api_invalid_algorithm(client):
    response = client.post("/api/encrypt", json={"algorithm": "unknown_cipher", "text": "Hi", "key": 1})
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "Unsupported" in data["error"]


def test_api_invalid_hill_key(client):
    # Singular matrix
    response = client.post("/api/encrypt", json={
        "algorithm": "hill",
        "text": "HELP",
        "key": [[2, 4], [1, 2]]
    })
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "not invertible" in data["error"]


# ==============================================================================
# ALGORITHM COMPARISON
# ==============================================================================

def test_api_compare_success(client):
    payload = {
        "text": "Network Security Final Year Project 2026",
        "selections": [
            {"algorithm": "caesar", "key": 5},
            {"algorithm": "vigenere", "key": "KEYWORD"},
            {"algorithm": "rail_fence", "key": 3},
            {"algorithm": "columnar", "key": "SECURITY"}
        ]
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["results"]) == 4
    for item in data["results"]:
        assert item["success"] is True
        assert "ciphertext" in item
        assert "execution_time_ms" in item
        assert item["ciphertext_length"] > 0


def test_api_compare_insufficient_selections(client):
    payload = {
        "text": "Hello",
        "selections": [
            {"algorithm": "caesar", "key": 3}
        ]
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data["success"] is False
    assert "at least 2" in data["error"]


# ==============================================================================
# FILE ENCRYPT / DECRYPT
# ==============================================================================

def test_api_file_encryption_and_decryption_flow(client):
    file_bytes = b"Classical cryptography is educational and fascinating!"
    filename = "test_note.txt"
    
    # 1. Encrypt file with Vigenere
    data = {
        "algorithm": "vigenere",
        "key": "SECRET"
    }
    data["file"] = (io.BytesIO(file_bytes), filename)
    
    enc_response = client.post(
        "/api/files/encrypt",
        data=data,
        content_type="multipart/form-data"
    )
    assert enc_response.status_code == 200
    enc_json = enc_response.get_json()
    assert enc_json["success"] is True
    assert "container_content" in enc_json
    assert "test_note.txt.enc.txt" in enc_json["filename"]
    
    container_bytes = enc_json["container_content"].encode("utf-8")
    
    # 2. Decrypt file using container
    dec_data = {
        "algorithm": "vigenere",
        "key": "SECRET"
    }
    dec_data["file"] = (io.BytesIO(container_bytes), enc_json["filename"])
    
    dec_response = client.post(
        "/api/files/decrypt",
        data=dec_data,
        content_type="multipart/form-data"
    )
    assert dec_response.status_code == 200
    dec_json = dec_response.get_json()
    assert dec_json["success"] is True
    assert dec_json["plaintext"] == file_bytes.decode("utf-8")
    assert dec_json["is_container"] is True
