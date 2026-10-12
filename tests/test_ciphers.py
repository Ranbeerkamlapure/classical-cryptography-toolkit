"""
Automated Unit Tests for Classical Cryptography Toolkit - Ciphers
Tests encryption, decryption, edge cases, error handling, and mathematical properties.
"""

import math
import sys
import os
import pytest

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from ciphers import (
    caesar_encrypt, caesar_decrypt, validate_caesar_key,
    monoalphabetic_encrypt, monoalphabetic_decrypt, generate_monoalphabetic_key, validate_monoalphabetic_key,
    playfair_encrypt, playfair_decrypt, generate_playfair_matrix, prepare_playfair_digraphs,
    hill_encrypt, hill_decrypt, validate_hill_matrix,
    vigenere_encrypt, vigenere_decrypt, validate_vigenere_key,
    otp_encrypt, otp_decrypt, generate_otp_key,
    rail_fence_encrypt, rail_fence_decrypt, validate_rail_fence_key,
    columnar_encrypt, columnar_decrypt, validate_columnar_key, get_column_order
)


# ==============================================================================
# 1. CAESAR CIPHER TESTS
# ==============================================================================

def test_caesar_normal_cycle():
    pt = "The Quick Brown Fox Jumps Over The Lazy Dog!"
    shift = 3
    enc = caesar_encrypt(pt, shift)
    assert enc["ciphertext"] == "Wkh Txlfn Eurzq Ira Mxpsv掛け..." or enc["ciphertext"].startswith("Wkh Txlfn Eurzq")
    assert enc["ciphertext"] == "Wkh Txlfn Eurzq Ira Mxpsv掛け..." or "Wkh Txlfn Eurzq" in enc["ciphertext"]
    dec = caesar_decrypt(enc["ciphertext"], shift)
    assert dec["plaintext"] == pt


def test_caesar_shifts_and_mod26():
    pt = "NetworkSecurity"
    # Negative shift
    enc_neg = caesar_encrypt(pt, -3)
    dec_neg = caesar_decrypt(enc_neg["ciphertext"], -3)
    assert dec_neg["plaintext"] == pt
    
    # Large shift > 26
    enc_large = caesar_encrypt(pt, 29)  # 29 % 26 == 3
    enc_3 = caesar_encrypt(pt, 3)
    assert enc_large["ciphertext"] == enc_3["ciphertext"]


def test_caesar_preserves_case_and_symbols():
    pt = "Hello, World! 123 #$"
    enc = caesar_encrypt(pt, 5)
    dec = caesar_decrypt(enc["ciphertext"], 5)
    assert dec["plaintext"] == pt
    assert ", " in enc["ciphertext"]
    assert "123 #$" in enc["ciphertext"]


def test_caesar_invalid_keys():
    with pytest.raises(ValueError):
        caesar_encrypt("Hello", "abc")
    with pytest.raises(ValueError):
        caesar_encrypt("Hello", "")


# ==============================================================================
# 2. MONOALPHABETIC SUBSTITUTION TESTS
# ==============================================================================

def test_monoalphabetic_key_generation():
    key = generate_monoalphabetic_key()
    assert len(key) == 26
    assert len(set(key)) == 26
    assert key.isalpha()
    assert key.isupper()


def test_monoalphabetic_round_trip():
    key = "QWERTYUIOPASDFGHJKLZXCVBNM"
    pt = "Cryptography Toolkit 2026! Testing Case & Symbols."
    enc = monoalphabetic_encrypt(pt, key)
    dec = monoalphabetic_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_monoalphabetic_invalid_keys():
    # Duplicate letter
    with pytest.raises(ValueError, match="Duplicate"):
        validate_monoalphabetic_key("A"*26)
        
    # Too short
    with pytest.raises(ValueError, match="exactly 26 letters"):
        validate_monoalphabetic_key("QWERTY")
        
    # Non-alpha
    with pytest.raises(ValueError):
        validate_monoalphabetic_key("QWERTYUIOPASDFGHJKLZXCVBN1")


# ==============================================================================
# 3. PLAYFAIR CIPHER TESTS
# ==============================================================================

def test_playfair_key_matrix_generation():
    matrix, char_pos = generate_playfair_matrix("MONARCHY")
    assert len(matrix) == 5
    assert len(matrix[0]) == 5
    flat = [c for row in matrix for c in row]
    assert len(flat) == 25
    assert 'J' not in flat
    assert 'I' in flat
    # M, O, N, A, R, C, H, Y are the first elements
    assert flat[:8] == ['M', 'O', 'N', 'A', 'R', 'C', 'H', 'Y']


def test_playfair_digraph_rules():
    # Duplicate letter in pair: BALLOON -> BA LX LO ON
    digraphs = prepare_playfair_digraphs("BALLOON")
    pairs = ["".join(d) for d in digraphs]
    assert pairs == ["BA", "LX", "LO", "ON"]
    
    # Odd length: TREE -> TR EX EX (E duplicate -> EX, remaining E odd -> EX)
    digraphs_tree = prepare_playfair_digraphs("TREE")
    pairs_tree = ["".join(d) for d in digraphs_tree]
    assert pairs_tree == ["TR", "EX", "EX"]


def test_playfair_encryption_decryption():
    key = "MONARCHY"
    pt = "INSTRUMENTS"
    enc = playfair_encrypt(pt, key)
    assert len(enc["ciphertext"].replace(" ", "")) % 2 == 0
    dec = playfair_decrypt(enc["ciphertext"], key)
    # The decrypted text will have normalized uppercase letters and merged I/J
    # INSTRUMENTS has odd length (11 letters) -> padded with X -> 12 letters: IN ST RU ME NT SX
    assert dec["plaintext"] == "INSTRUMENTSX"


def test_playfair_empty_and_invalid():
    enc = playfair_encrypt("", "MONARCHY")
    assert enc["ciphertext"] == ""
    with pytest.raises(ValueError):
        playfair_encrypt("Hello", "12345")


# ==============================================================================
# 4. HILL CIPHER TESTS
# ==============================================================================

def test_hill_matrix_validation_and_inversion():
    # Known invertible matrix: [[9, 4], [5, 7]]
    # det = 63 - 20 = 43 = 17 mod 26
    # 17 * 23 = 391 = 15*26 + 1 => det_inv = 23
    k = [[9, 4], [5, 7]]
    k_mod, det, det_inv, inv_k = validate_hill_matrix(k)
    assert det == 17
    assert det_inv == 23
    assert inv_k == [[5, 12], [15, 25]]


def test_hill_encrypt_decrypt_round_trip():
    k = [[9, 4], [5, 7]]
    pt = "HELP"
    enc = hill_encrypt(pt, k)
    dec = hill_decrypt(enc["ciphertext"], k)
    assert dec["plaintext"] == pt


def test_hill_padding_for_odd_length():
    k = [[9, 4], [5, 7]]
    pt = "CAT"  # length 3 -> odd, gets padded with X -> "CATX"
    enc = hill_encrypt(pt, k)
    assert len(enc["ciphertext"]) == 4
    dec = hill_decrypt(enc["ciphertext"], k)
    assert dec["plaintext"] == "CATX"


def test_hill_rejects_non_invertible_matrix():
    # Matrix with determinant sharing factor with 26
    # det([[2, 4], [1, 2]]) = 4 - 4 = 0 mod 26
    with pytest.raises(ValueError, match="not invertible"):
        validate_hill_matrix([[2, 4], [1, 2]])
        
    # det([[2, 3], [1, 5]]) = 10 - 3 = 7 (gcd(7, 26)=1 -> valid)
    # det([[2, 1], [4, 6]]) = 12 - 4 = 8 (even -> gcd with 26 >= 2 -> invalid!)
    with pytest.raises(ValueError, match="not invertible"):
        validate_hill_matrix([[2, 1], [4, 6]])


# ==============================================================================
# 5. VIGENÈRE CIPHER TESTS
# ==============================================================================

def test_vigenere_standard():
    # Known example: ATTACKATDAWN with LEMON -> LXFOPVEFRNHR
    pt = "ATTACKATDAWN"
    key = "LEMON"
    enc = vigenere_encrypt(pt, key)
    assert enc["ciphertext"] == "LXFOPVEFRNHR"
    dec = vigenere_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_vigenere_preserves_case_and_punctuation():
    pt = "Attack at Dawn, 06:00 AM!"
    key = "LEMON"
    enc = vigenere_encrypt(pt, key)
    dec = vigenere_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt
    assert ", 06:00 " in enc["ciphertext"]


def test_vigenere_invalid_key():
    with pytest.raises(ValueError):
        vigenere_encrypt("Hello", "")
    with pytest.raises(ValueError):
        vigenere_encrypt("Hello", "12345")


# ==============================================================================
# 6. ONE-TIME PAD TESTS
# ==============================================================================

def test_otp_auto_generation_and_decrypt():
    pt = "Confidential Report 2026!"
    # Auto-generate key
    enc = otp_encrypt(pt)
    assert "key" in enc
    assert len(enc["key"]) == sum(1 for c in pt if c.isalpha())
    # Decrypt with generated key
    dec = otp_decrypt(enc["ciphertext"], enc["key"])
    assert dec["plaintext"] == pt


def test_otp_user_provided_key():
    pt = "SECRET"
    key = "XMCKLQ"
    enc = otp_encrypt(pt, key)
    dec = otp_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_otp_key_mismatch():
    pt = "SECRET"  # 6 letters
    short_key = "ABC"  # 3 letters
    with pytest.raises(ValueError, match="key length"):
        otp_encrypt(pt, short_key)


# ==============================================================================
# 7. RAIL FENCE CIPHER TESTS
# ==============================================================================

def test_rail_fence_known_example():
    # 3 rails: "DEFENDTHEEASTWALL"
    pt = "DEFENDTHEEASTWALL"
    enc = rail_fence_encrypt(pt, 3)
    dec = rail_fence_decrypt(enc["ciphertext"], 3)
    assert dec["plaintext"] == pt


def test_rail_fence_preserves_all_characters():
    pt = "Network Security & Classical Cryptography 2026!"
    for r in [2, 3, 4, 5]:
        enc = rail_fence_encrypt(pt, r)
        dec = rail_fence_decrypt(enc["ciphertext"], r)
        assert dec["plaintext"] == pt


def test_rail_fence_invalid_rails():
    with pytest.raises(ValueError, match="at least 2"):
        validate_rail_fence_key(1, 10)
    with pytest.raises(ValueError):
        validate_rail_fence_key("invalid", 10)


# ==============================================================================
# 8. COLUMNAR TRANSPOSITION TESTS
# ==============================================================================

def test_columnar_standard():
    pt = "DEFENDTHEEASTWALLPOST"
    key = "GERMAN"
    enc = columnar_encrypt(pt, key)
    dec = columnar_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_columnar_duplicate_letters_tie_breaking():
    # Keyword with duplicates: "SECRET" has two 'E's
    pt = "Cryptographic Systems and Security Principles"
    key = "SECRET"
    order = get_column_order(key)
    assert len(order) == 6
    # Original E at index 1 comes before second E at index 4
    idx_first_e = order.index(1)
    idx_second_e = order.index(4)
    assert idx_first_e < idx_second_e
    
    enc = columnar_encrypt(pt, key)
    dec = columnar_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_columnar_irregular_final_row():
    # Length not divisible by key length
    pt = "Hello World From Python 3.13"
    key = "ZEBRA"  # length 5, len(pt)=28, 28 % 5 = 3
    enc = columnar_encrypt(pt, key)
    dec = columnar_decrypt(enc["ciphertext"], key)
    assert dec["plaintext"] == pt


def test_columnar_invalid_key():
    with pytest.raises(ValueError):
        columnar_encrypt("Hello", "")
    with pytest.raises(ValueError):
        columnar_encrypt("Hello", "123")
