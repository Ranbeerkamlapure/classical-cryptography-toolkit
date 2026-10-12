"""
Classical Cryptography Toolkit - Core Cipher Implementations
Academic Project: Network Security Mini Project (Final Year ECE, 2026-27)

Implements 8 Classical Cryptographic Algorithms:
A. Substitution:
   1. Caesar Cipher
   2. Monoalphabetic Substitution Cipher
   3. Playfair Cipher
   4. Hill Cipher (2x2 Matrix mod 26)
B. Polyalphabetic:
   5. Vigenère Cipher
   6. One-Time Pad
C. Transposition:
   7. Rail Fence Cipher
   8. Columnar Transposition Cipher
"""

import math
import secrets
import string
from typing import Dict, Any, Tuple, List, Optional


# ==============================================================================
# 1. CAESAR CIPHER
# ==============================================================================

def validate_caesar_key(key: Any) -> int:
    """Validate and normalize Caesar shift key."""
    if key is None or key == "":
        raise ValueError("Caesar shift key is required.")
    try:
        shift = int(key)
    except (ValueError, TypeError):
        raise ValueError("Caesar shift key must be an integer (e.g., 3, -5, 29).")
    return shift % 26


def caesar_encrypt(plaintext: str, key: Any) -> Dict[str, Any]:
    """
    Encrypt plaintext using Caesar cipher with given integer shift.
    Preserves letter case, spaces, and punctuation.
    """
    shift = validate_caesar_key(key)
    result = []
    for char in plaintext:
        if 'A' <= char <= 'Z':
            result.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
        elif 'a' <= char <= 'z':
            result.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
        else:
            result.append(char)
    ciphertext = "".join(result)
    return {
        "ciphertext": ciphertext,
        "key": shift,
        "details": {
            "effective_shift": shift,
            "preserves_case_and_punctuation": True,
            "alphabet_size": 26
        }
    }


def caesar_decrypt(ciphertext: str, key: Any) -> Dict[str, Any]:
    """Decrypt Caesar ciphertext using reverse shift."""
    shift = validate_caesar_key(key)
    reverse_shift = (26 - shift) % 26
    res = caesar_encrypt(ciphertext, reverse_shift)
    return {
        "plaintext": res["ciphertext"],
        "key": shift,
        "details": {
            "reverse_shift": reverse_shift,
            "preserves_case_and_punctuation": True
        }
    }


# ==============================================================================
# 2. MONOALPHABETIC SUBSTITUTION CIPHER
# ==============================================================================

def generate_monoalphabetic_key() -> str:
    """Generate a cryptographically secure random 26-letter substitution alphabet."""
    letters = list(string.ascii_uppercase)
    # Fisher-Yates shuffle using secrets.randbelow
    for i in range(len(letters) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        letters[i], letters[j] = letters[j], letters[i]
    return "".join(letters)


def validate_monoalphabetic_key(key: str) -> str:
    """Validate 26-letter substitution alphabet."""
    if not key or not isinstance(key, str):
        raise ValueError("Substitution key must be a 26-letter alphabet string.")
    cleaned = key.strip().upper()
    if len(cleaned) != 26:
        raise ValueError(f"Substitution key must be exactly 26 letters long (received {len(cleaned)}).")
    if not cleaned.isalpha():
        raise ValueError("Substitution key must contain only alphabetic characters (A-Z).")
    if len(set(cleaned)) != 26:
        duplicates = [c for c in set(cleaned) if cleaned.count(c) > 1]
        missing = [c for c in string.ascii_uppercase if c not in cleaned]
        raise ValueError(
            f"Substitution key must contain each letter of the alphabet exactly once. "
            f"Duplicate(s): {', '.join(duplicates)}; Missing: {', '.join(missing)}."
        )
    return cleaned


def monoalphabetic_encrypt(plaintext: str, key: str) -> Dict[str, Any]:
    """
    Encrypt plaintext using Monoalphabetic substitution.
    Preserves case, spaces, and punctuation.
    """
    norm_key = validate_monoalphabetic_key(key)
    res = []
    for char in plaintext:
        if 'A' <= char <= 'Z':
            idx = ord(char) - ord('A')
            res.append(norm_key[idx])
        elif 'a' <= char <= 'z':
            idx = ord(char) - ord('a')
            res.append(norm_key[idx].lower())
        else:
            res.append(char)
    return {
        "ciphertext": "".join(res),
        "key": norm_key,
        "details": {
            "standard_alphabet": string.ascii_uppercase,
            "cipher_alphabet": norm_key
        }
    }


def monoalphabetic_decrypt(ciphertext: str, key: str) -> Dict[str, Any]:
    """Decrypt Monoalphabetic substitution ciphertext using inverse mapping."""
    norm_key = validate_monoalphabetic_key(key)
    # Build reverse lookup map
    reverse_map = {norm_key[i]: chr(ord('A') + i) for i in range(26)}
    res = []
    for char in ciphertext:
        if 'A' <= char <= 'Z':
            res.append(reverse_map[char])
        elif 'a' <= char <= 'z':
            res.append(reverse_map[char.upper()].lower())
        else:
            res.append(char)
    return {
        "plaintext": "".join(res),
        "key": norm_key,
        "details": {
            "standard_alphabet": string.ascii_uppercase,
            "cipher_alphabet": norm_key
        }
    }


# ==============================================================================
# 3. PLAYFAIR CIPHER
# ==============================================================================

def generate_playfair_matrix(keyword: str) -> Tuple[List[List[str]], Dict[str, Tuple[int, int]]]:
    """
    Generate 5x5 Playfair key matrix from keyword.
    Merges 'I' and 'J' into 'I'.
    """
    if not keyword or not isinstance(keyword, str):
        raise ValueError("Playfair keyword cannot be empty.")
    
    clean_keyword = "".join([c.upper() for c in keyword if c.isalpha()]).replace('J', 'I')
    if not clean_keyword:
        raise ValueError("Playfair keyword must contain at least one alphabetic letter.")
    
    seen = set()
    key_letters = []
    for char in clean_keyword:
        if char not in seen:
            seen.add(char)
            key_letters.append(char)
    
    # 25-letter alphabet without 'J'
    alphabet = [c for c in string.ascii_uppercase if c != 'J']
    for char in alphabet:
        if char not in seen:
            seen.add(char)
            key_letters.append(char)
            
    matrix = [key_letters[i * 5:(i + 1) * 5] for i in range(5)]
    char_pos = {}
    for r in range(5):
        for c in range(5):
            char_pos[matrix[r][c]] = (r, c)
            
    # Also map 'J' to position of 'I'
    char_pos['J'] = char_pos['I']
    return matrix, char_pos


def prepare_playfair_digraphs(text: str) -> List[Tuple[str, str]]:
    """
    Normalize text and form digraphs for Playfair encryption.
    Uppercase, replace J with I, remove non-alpha.
    Insert 'X' between identical letters in a pair.
    Append 'X' (or 'Z' if ending with 'X') if odd length.
    """
    clean = "".join([c.upper() for c in text if c.isalpha()]).replace('J', 'I')
    if not clean:
        return []
    
    digraphs = []
    i = 0
    while i < len(clean):
        first = clean[i]
        if i + 1 == len(clean):
            # Trailing single letter
            filler = 'Z' if first == 'X' else 'X'
            digraphs.append((first, filler))
            i += 1
        elif clean[i] == clean[i + 1]:
            # Repeated character in pair
            filler = 'Z' if first == 'X' else 'X'
            digraphs.append((first, filler))
            i += 1  # only advance 1 so next letter begins next pair
        else:
            digraphs.append((first, clean[i + 1]))
            i += 2
            
    return digraphs


def playfair_encrypt(plaintext: str, keyword: str) -> Dict[str, Any]:
    """
    Encrypt plaintext using Playfair 5x5 key matrix.
    Row rule: shift right mod 5
    Column rule: shift down mod 5
    Rectangle rule: swap columns
    """
    matrix, char_pos = generate_playfair_matrix(keyword)
    digraphs = prepare_playfair_digraphs(plaintext)
    
    if not digraphs:
        return {
            "ciphertext": "",
            "key": keyword.strip().upper(),
            "details": {
                "key_matrix": matrix,
                "digraphs": [],
                "note": "Input contained no alphabetic characters."
            }
        }
        
    res_digraphs = []
    for c1, c2 in digraphs:
        r1, col1 = char_pos[c1]
        r2, col2 = char_pos[c2]
        
        if r1 == r2:
            # Same row -> shift right
            nc1 = matrix[r1][(col1 + 1) % 5]
            nc2 = matrix[r2][(col2 + 1) % 5]
        elif col1 == col2:
            # Same column -> shift down
            nc1 = matrix[(r1 + 1) % 5][col1]
            nc2 = matrix[(r2 + 1) % 5][col2]
        else:
            # Rectangle -> swap columns
            nc1 = matrix[r1][col2]
            nc2 = matrix[r2][col1]
            
        res_digraphs.append(nc1 + nc2)
        
    ciphertext = " ".join(res_digraphs)
    return {
        "ciphertext": ciphertext,
        "key": keyword.strip().upper(),
        "details": {
            "key_matrix": matrix,
            "digraphs_prepared": ["".join(d) for d in digraphs],
            "digraphs_encrypted": res_digraphs,
            "normalization_note": "Letters normalized to A-Z; J merged into I; non-alphabetic characters filtered; filler 'X'/'Z' inserted for duplicate pairs and odd lengths."
        }
    }


def playfair_decrypt(ciphertext: str, keyword: str) -> Dict[str, Any]:
    """
    Decrypt Playfair ciphertext using inverse rules.
    Row rule: shift left mod 5
    Column rule: shift up mod 5
    Rectangle rule: swap columns
    """
    matrix, char_pos = generate_playfair_matrix(keyword)
    clean = "".join([c.upper() for c in ciphertext if c.isalpha()]).replace('J', 'I')
    
    if len(clean) % 2 != 0:
        raise ValueError(f"Playfair ciphertext must have an even number of alphabetic characters (found {len(clean)}).")
    
    pairs = [(clean[i], clean[i + 1]) for i in range(0, len(clean), 2)]
    res_pairs = []
    for c1, c2 in pairs:
        r1, col1 = char_pos[c1]
        r2, col2 = char_pos[c2]
        
        if r1 == r2:
            # Same row -> shift left
            nc1 = matrix[r1][(col1 - 1) % 5]
            nc2 = matrix[r2][(col2 - 1) % 5]
        elif col1 == col2:
            # Same column -> shift up
            nc1 = matrix[(r1 - 1) % 5][col1]
            nc2 = matrix[(r2 - 1) % 5][col2]
        else:
            # Rectangle -> swap columns (same rule)
            nc1 = matrix[r1][col2]
            nc2 = matrix[r2][col1]
            
        res_pairs.append(nc1 + nc2)
        
    plaintext = "".join(res_pairs)
    return {
        "plaintext": plaintext,
        "key": keyword.strip().upper(),
        "details": {
            "key_matrix": matrix,
            "decrypted_digraphs": res_pairs,
            "decryption_note": "Decrypted text contains normalized letters with I/J merged and inserted padding characters (e.g. 'X') retained. Ambiguous padding cannot be automatically stripped without additional metadata."
        }
    }


# ==============================================================================
# 4. HILL CIPHER (2x2 Matrix Modulo 26)
# ==============================================================================

def validate_hill_matrix(matrix: List[List[int]]) -> Tuple[List[List[int]], int, int, List[List[int]]]:
    """
    Validate 2x2 integer key matrix modulo 26.
    Returns (matrix_mod26, determinant_mod26, det_inv_mod26, inverse_matrix_mod26).
    """
    if len(matrix) != 2 or len(matrix[0]) != 2 or len(matrix[1]) != 2:
        raise ValueError("Hill cipher requires a 2x2 matrix with 4 integer entries.")
    
    try:
        k00 = int(matrix[0][0]) % 26
        k01 = int(matrix[0][1]) % 26
        k10 = int(matrix[1][0]) % 26
        k11 = int(matrix[1][1]) % 26
    except (ValueError, TypeError):
        raise ValueError("All 4 matrix entries must be integers.")
        
    k = [[k00, k01], [k10, k11]]
    det = (k00 * k11 - k01 * k10) % 26
    
    gcd = math.gcd(det, 26)
    if gcd != 1:
        raise ValueError(
            f"Matrix is not invertible modulo 26. Determinant is {det}, which shares common factor with 26 (gcd={gcd}). "
            f"The determinant must be coprime to 26 (odd and not divisible by 13)."
        )
        
    # Calculate modular inverse of determinant
    det_inv = pow(det, -1, 26)
    
    # Invert 2x2 matrix: det_inv * [[k11, -k01], [-k10, k00]] mod 26
    inv_00 = (k11 * det_inv) % 26
    inv_01 = (-k01 * det_inv) % 26
    inv_10 = (-k10 * det_inv) % 26
    inv_11 = (k00 * det_inv) % 26
    inv_matrix = [[inv_00, inv_01], [inv_10, inv_11]]
    
    return k, det, det_inv, inv_matrix


def hill_encrypt(plaintext: str, matrix: List[List[int]]) -> Dict[str, Any]:
    """
    Encrypt plaintext using 2x2 Hill cipher modulo 26.
    Normalizes text to uppercase A-Z.
    Pads odd-length messages with 'X'.
    """
    k, det, det_inv, inv_k = validate_hill_matrix(matrix)
    clean = "".join([c.upper() for c in plaintext if c.isalpha()])
    if not clean:
        return {
            "ciphertext": "",
            "key": k,
            "details": {
                "determinant": det,
                "det_inverse": det_inv,
                "inverse_matrix": inv_k,
                "padded": False,
                "note": "Input contained no alphabetic characters."
            }
        }
        
    padded = False
    if len(clean) % 2 != 0:
        clean += 'X'
        padded = True
        
    res = []
    for i in range(0, len(clean), 2):
        p1 = ord(clean[i]) - ord('A')
        p2 = ord(clean[i + 1]) - ord('A')
        
        c1 = (k[0][0] * p1 + k[0][1] * p2) % 26
        c2 = (k[1][0] * p1 + k[1][1] * p2) % 26
        
        res.append(chr(c1 + ord('A')) + chr(c2 + ord('A')))
        
    ciphertext = "".join(res)
    return {
        "ciphertext": ciphertext,
        "key": k,
        "details": {
            "determinant": det,
            "det_inverse": det_inv,
            "inverse_matrix": inv_k,
            "padded": padded,
            "normalized_length": len(clean),
            "normalization_note": "Filtered to uppercase A-Z. Padded with 'X' if odd length."
        }
    }


def hill_decrypt(ciphertext: str, matrix: List[List[int]]) -> Dict[str, Any]:
    """
    Decrypt Hill ciphertext using modular inverse of 2x2 key matrix.
    """
    k, det, det_inv, inv_k = validate_hill_matrix(matrix)
    clean = "".join([c.upper() for c in ciphertext if c.isalpha()])
    
    if len(clean) % 2 != 0:
        raise ValueError(f"Hill ciphertext must have an even length (found {len(clean)} letters).")
        
    res = []
    for i in range(0, len(clean), 2):
        c1 = ord(clean[i]) - ord('A')
        c2 = ord(clean[i + 1]) - ord('A')
        
        p1 = (inv_k[0][0] * c1 + inv_k[0][1] * c2) % 26
        p2 = (inv_k[1][0] * c1 + inv_k[1][1] * c2) % 26
        
        res.append(chr(p1 + ord('A')) + chr(p2 + ord('A')))
        
    return {
        "plaintext": "".join(res),
        "key": k,
        "details": {
            "determinant": det,
            "det_inverse": det_inv,
            "inverse_matrix": inv_k,
            "decryption_note": "Decrypted characters are recovered in uppercase. Any padding 'X' added during encryption remains present."
        }
    }


# ==============================================================================
# 5. VIGENÈRE CIPHER
# ==============================================================================

def validate_vigenere_key(key: str) -> str:
    """Validate and normalize Vigenère keyword."""
    if not key or not isinstance(key, str):
        raise ValueError("Vigenère keyword cannot be empty.")
    clean = "".join([c.upper() for c in key if c.isalpha()])
    if not clean:
        raise ValueError("Vigenère keyword must contain at least one alphabetic letter (A-Z).")
    return clean


def vigenere_encrypt(plaintext: str, key: str) -> Dict[str, Any]:
    """
    Encrypt plaintext using Vigenère cipher.
    Repeats keyword across alphabetic characters.
    Preserves case, spaces, and punctuation.
    """
    norm_key = validate_vigenere_key(key)
    res = []
    key_idx = 0
    k_len = len(norm_key)
    
    for char in plaintext:
        if 'A' <= char <= 'Z':
            shift = ord(norm_key[key_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
            key_idx += 1
        elif 'a' <= char <= 'z':
            shift = ord(norm_key[key_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
            key_idx += 1
        else:
            res.append(char)
            
    return {
        "ciphertext": "".join(res),
        "key": norm_key,
        "details": {
            "normalized_keyword": norm_key,
            "keyword_length": k_len,
            "preserves_case_and_punctuation": True
        }
    }


def vigenere_decrypt(ciphertext: str, key: str) -> Dict[str, Any]:
    """
    Decrypt Vigenère ciphertext using keyword.
    Preserves case, spaces, and punctuation.
    """
    norm_key = validate_vigenere_key(key)
    res = []
    key_idx = 0
    k_len = len(norm_key)
    
    for char in ciphertext:
        if 'A' <= char <= 'Z':
            shift = ord(norm_key[key_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('A') - shift) % 26 + ord('A')))
            key_idx += 1
        elif 'a' <= char <= 'z':
            shift = ord(norm_key[key_idx % k_len]) - ord('A')
            res.append(chr((ord(char) - ord('a') - shift) % 26 + ord('a')))
            key_idx += 1
        else:
            res.append(char)
            
    return {
        "plaintext": "".join(res),
        "key": norm_key,
        "details": {
            "normalized_keyword": norm_key,
            "keyword_length": k_len,
            "preserves_case_and_punctuation": True
        }
    }


# ==============================================================================
# 6. ONE-TIME PAD (OTP)
# ==============================================================================

def generate_otp_key(length: int) -> str:
    """Generate cryptographically secure random uppercase alphabetic key of specified length."""
    if length <= 0:
        raise ValueError("OTP key length must be greater than zero.")
    return "".join(secrets.choice(string.ascii_uppercase) for _ in range(length))


def count_alphabetic(text: str) -> int:
    """Count number of alphabetic characters in text."""
    return sum(1 for c in text if c.isalpha())


def otp_encrypt(plaintext: str, key: Optional[str] = None) -> Dict[str, Any]:
    """
    Encrypt plaintext using genuine One-Time Pad over alphabet mod 26.
    If key is not provided, generates a cryptographically secure random key
    matching the exact number of alphabetic characters in plaintext.
    Preserves case and non-alphabetic characters.
    """
    alpha_count = count_alphabetic(plaintext)
    if alpha_count == 0:
        return {
            "ciphertext": plaintext,
            "key": "",
            "details": {
                "alpha_count": 0,
                "note": "Text contains no alphabetic characters to encrypt."
            }
        }
        
    if key is None or key == "":
        generated_key = generate_otp_key(alpha_count)
        active_key = generated_key
        was_generated = True
    else:
        clean_key = "".join([c.upper() for c in key if c.isalpha()])
        if len(clean_key) != alpha_count:
            raise ValueError(
                f"One-Time Pad key length ({len(clean_key)} letters) must match the number of "
                f"alphabetic characters in plaintext ({alpha_count} letters)."
            )
        active_key = clean_key
        was_generated = False
        
    res = []
    key_idx = 0
    for char in plaintext:
        if 'A' <= char <= 'Z':
            shift = ord(active_key[key_idx]) - ord('A')
            res.append(chr((ord(char) - ord('A') + shift) % 26 + ord('A')))
            key_idx += 1
        elif 'a' <= char <= 'z':
            shift = ord(active_key[key_idx]) - ord('A')
            res.append(chr((ord(char) - ord('a') + shift) % 26 + ord('a')))
            key_idx += 1
        else:
            res.append(char)
            
    return {
        "ciphertext": "".join(res),
        "key": active_key,
        "details": {
            "key_length": len(active_key),
            "key_was_generated": was_generated,
            "security_notice": (
                "Genuine OTP security requires: (1) Key generated uniformly at random; "
                "(2) Key at least as long as plaintext; (3) Key used ONLY ONCE and never reused; "
                "(4) Key kept strictly secret. Never reuse this key!"
            )
        }
    }


def otp_decrypt(ciphertext: str, key: str) -> Dict[str, Any]:
    """
    Decrypt OTP ciphertext using the user-provided secret key.
    Never regenerates a key for decryption!
    """
    if not key or not isinstance(key, str):
        raise ValueError("Decryption requires the exact secret key used during encryption.")
        
    clean_key = "".join([c.upper() for c in key if c.isalpha()])
    alpha_count = count_alphabetic(ciphertext)
    
    if alpha_count == 0:
        return {
            "plaintext": ciphertext,
            "key": clean_key,
            "details": {"alpha_count": 0}
        }
        
    if len(clean_key) != alpha_count:
        raise ValueError(
            f"Provided OTP key length ({len(clean_key)} letters) does not match the number of "
            f"alphabetic characters in ciphertext ({alpha_count} letters)."
        )
        
    res = []
    key_idx = 0
    for char in ciphertext:
        if 'A' <= char <= 'Z':
            shift = ord(clean_key[key_idx]) - ord('A')
            res.append(chr((ord(char) - ord('A') - shift) % 26 + ord('A')))
            key_idx += 1
        elif 'a' <= char <= 'z':
            shift = ord(clean_key[key_idx]) - ord('A')
            res.append(chr((ord(char) - ord('a') - shift) % 26 + ord('a')))
            key_idx += 1
        else:
            res.append(char)
            
    return {
        "plaintext": "".join(res),
        "key": clean_key,
        "details": {
            "key_length": len(clean_key)
        }
    }


# ==============================================================================
# 7. RAIL FENCE CIPHER (TRANSPOSITION)
# ==============================================================================

def validate_rail_fence_key(key: Any, text_len: int) -> int:
    """Validate rail count for Rail Fence cipher."""
    if key is None or key == "":
        raise ValueError("Rail count is required.")
    try:
        rails = int(key)
    except (ValueError, TypeError):
        raise ValueError("Rail count must be an integer.")
    if rails < 2:
        raise ValueError("Rail count must be at least 2.")
    return rails


def rail_fence_encrypt(plaintext: str, key: Any) -> Dict[str, Any]:
    """
    Encrypt plaintext using Rail Fence cipher (zigzag pattern).
    Preserves all characters, spaces, punctuation, and case.
    """
    if not plaintext:
        return {"ciphertext": "", "key": key, "details": {"rails": key}}
        
    rails = validate_rail_fence_key(key, len(plaintext))
    if rails >= len(plaintext):
        return {
            "ciphertext": plaintext,
            "key": rails,
            "details": {"rails": rails, "note": "Rails >= text length, text unchanged."}
        }
        
    fence = [[] for _ in range(rails)]
    rail = 0
    direction = 1  # 1 for down, -1 for up
    
    for char in plaintext:
        fence[rail].append(char)
        rail += direction
        if rail == rails - 1:
            direction = -1
        elif rail == 0:
            direction = 1
            
    ciphertext = "".join("".join(row) for row in fence)
    return {
        "ciphertext": ciphertext,
        "key": rails,
        "details": {
            "rails": rails,
            "rail_lengths": [len(r) for r in fence],
            "preserves_all_characters": True
        }
    }


def rail_fence_decrypt(ciphertext: str, key: Any) -> Dict[str, Any]:
    """
    Decrypt Rail Fence ciphertext using zigzag coordinate reconstruction.
    """
    if not ciphertext:
        return {"plaintext": "", "key": key, "details": {"rails": key}}
        
    rails = validate_rail_fence_key(key, len(ciphertext))
    if rails >= len(ciphertext):
        return {"plaintext": ciphertext, "key": rails, "details": {"rails": rails}}
        
    # Mark zigzag pattern coordinates
    pattern = []
    rail = 0
    direction = 1
    for i in range(len(ciphertext)):
        pattern.append(rail)
        rail += direction
        if rail == rails - 1:
            direction = -1
        elif rail == 0:
            direction = 1
            
    # Count characters on each rail
    rail_counts = [pattern.count(r) for r in range(rails)]
    
    # Slice ciphertext into each rail's characters
    rail_chars = []
    idx = 0
    for count in rail_counts:
        rail_chars.append(list(ciphertext[idx:idx + count]))
        idx += count
        
    # Reconstruct original message following the zigzag pattern
    res = []
    rail_ptrs = [0] * rails
    for r in pattern:
        res.append(rail_chars[r][rail_ptrs[r]])
        rail_ptrs[r] += 1
        
    return {
        "plaintext": "".join(res),
        "key": rails,
        "details": {
            "rails": rails,
            "rail_lengths": rail_counts
        }
    }


# ==============================================================================
# 8. COLUMNAR TRANSPOSITION CIPHER
# ==============================================================================

def validate_columnar_key(keyword: str) -> str:
    """Validate Columnar Transposition keyword."""
    if not keyword or not isinstance(keyword, str):
        raise ValueError("Columnar keyword cannot be empty.")
    clean = "".join([c.upper() for c in keyword if c.isalpha()])
    if not clean:
        raise ValueError("Columnar keyword must contain at least one alphabetic letter.")
    return clean


def get_column_order(keyword: str) -> List[int]:
    """
    Determine column reading order from keyword.
    Ties between duplicate letters are broken deterministically by their original column index.
    """
    clean = validate_columnar_key(keyword)
    # Sort tuples of (letter, original_index) to preserve stability
    sorted_cols = sorted(range(len(clean)), key=lambda i: (clean[i], i))
    return sorted_cols


def columnar_encrypt(plaintext: str, keyword: str) -> Dict[str, Any]:
    """
    Encrypt plaintext using Columnar Transposition.
    Handles irregular/incomplete final rows exactly without lossy padding.
    Preserves all characters, spaces, punctuation, and case.
    """
    if not plaintext:
        return {"ciphertext": "", "key": keyword, "details": {"keyword": keyword}}
        
    norm_key = validate_columnar_key(keyword)
    num_cols = len(norm_key)
    col_order = get_column_order(norm_key)
    n = len(plaintext)
    
    num_rows = math.ceil(n / num_cols)
    remainder = n % num_cols  # columns with index < remainder have full length
    
    # Read columns according to sorted order
    ciphertext_parts = []
    for col in col_order:
        col_len = num_rows if (remainder == 0 or col < remainder) else num_rows - 1
        col_chars = [plaintext[r * num_cols + col] for r in range(col_len)]
        ciphertext_parts.append("".join(col_chars))
        
    ciphertext = "".join(ciphertext_parts)
    return {
        "ciphertext": ciphertext,
        "key": norm_key,
        "details": {
            "keyword": norm_key,
            "columns": num_cols,
            "rows": num_rows,
            "column_order": col_order,
            "remainder": remainder,
            "note": "Irregular columnar transposition applied. Preserves spaces, casing, and punctuation perfectly without lossy padding."
        }
    }


def columnar_decrypt(ciphertext: str, keyword: str) -> Dict[str, Any]:
    """
    Decrypt Columnar Transposition ciphertext.
    Reconstructs exact original text handling incomplete final rows.
    """
    if not ciphertext:
        return {"plaintext": "", "key": keyword, "details": {"keyword": keyword}}
        
    norm_key = validate_columnar_key(keyword)
    num_cols = len(norm_key)
    col_order = get_column_order(norm_key)
    n = len(ciphertext)
    
    num_rows = math.ceil(n / num_cols)
    remainder = n % num_cols
    
    # Calculate length of each column in original matrix
    col_lengths = [
        num_rows if (remainder == 0 or c < remainder) else num_rows - 1
        for c in range(num_cols)
    ]
    
    # Slices from ciphertext correspond to col_order
    col_data = {}
    curr = 0
    for col in col_order:
        length = col_lengths[col]
        col_data[col] = ciphertext[curr:curr + length]
        curr += length
        
    # Read row by row from reconstructed grid
    plaintext_chars = []
    for r in range(num_rows):
        for c in range(num_cols):
            if r < len(col_data[c]):
                plaintext_chars.append(col_data[c][r])
                
    plaintext = "".join(plaintext_chars)
    return {
        "plaintext": plaintext,
        "key": norm_key,
        "details": {
            "keyword": norm_key,
            "columns": num_cols,
            "rows": num_rows,
            "column_order": col_order
        }
    }


# ==============================================================================
# ALGORITHM REGISTRY & UNIFIED INTERFACE
# ==============================================================================

ALGORITHMS = {
    "caesar": {
        "id": "caesar",
        "name": "Caesar Cipher",
        "category": "Substitution",
        "type": "Monoalphabetic Shift",
        "key_type": "integer",
        "default_key": 3,
        "supports_generation": False,
        "description": "Shifts each letter by a fixed integer number of positions in the alphabet.",
        "encrypt": caesar_encrypt,
        "decrypt": caesar_decrypt
    },
    "monoalphabetic": {
        "id": "monoalphabetic",
        "name": "Monoalphabetic Substitution Cipher",
        "category": "Substitution",
        "type": "Arbitrary Single-Alphabet Substitution",
        "key_type": "alphabet26",
        "default_key": "QWERTYUIOPASDFGHJKLZXCVBNM",
        "supports_generation": True,
        "description": "Substitutes each letter with a corresponding unique letter from a 26-character permuted alphabet.",
        "encrypt": monoalphabetic_encrypt,
        "decrypt": monoalphabetic_decrypt
    },
    "playfair": {
        "id": "playfair",
        "name": "Playfair Cipher",
        "category": "Substitution",
        "type": "Polygraphic (Digraph) Substitution",
        "key_type": "keyword",
        "default_key": "MONARCHY",
        "supports_generation": False,
        "description": "Encrypts letter pairs (digraphs) using a 5x5 key matrix with merged I/J letters.",
        "encrypt": playfair_encrypt,
        "decrypt": playfair_decrypt
    },
    "hill": {
        "id": "hill",
        "name": "Hill Cipher (2x2 Matrix)",
        "category": "Substitution",
        "type": "Polygraphic Linear Algebraic",
        "key_type": "matrix2x2",
        "default_key": [[9, 4], [5, 7]],
        "supports_generation": False,
        "description": "Encrypts pairs of letters using matrix multiplication modulo 26 with an invertible 2x2 key matrix.",
        "encrypt": hill_encrypt,
        "decrypt": hill_decrypt
    },
    "vigenere": {
        "id": "vigenere",
        "name": "Vigenère Cipher",
        "category": "Polyalphabetic Substitution",
        "type": "Keyword-Driven Polyalphabetic",
        "key_type": "keyword",
        "default_key": "CIPHER",
        "supports_generation": False,
        "description": "Applies a succession of Caesar ciphers based on repeating letters of an alphabetic keyword.",
        "encrypt": vigenere_encrypt,
        "decrypt": vigenere_decrypt
    },
    "otp": {
        "id": "otp",
        "name": "One-Time Pad (OTP)",
        "category": "Polyalphabetic Substitution",
        "type": "Information-Theoretically Secure Random Pad",
        "key_type": "otp_key",
        "default_key": "",
        "supports_generation": True,
        "description": "Pairs plaintext with a random secret key of matching length. Unbreakable when key is truly random, used once, and kept secret.",
        "encrypt": otp_encrypt,
        "decrypt": otp_decrypt
    },
    "rail_fence": {
        "id": "rail_fence",
        "name": "Rail Fence Cipher",
        "category": "Transposition",
        "type": "Zigzag Transposition",
        "key_type": "rails",
        "default_key": 3,
        "supports_generation": False,
        "description": "Writes plaintext in a zigzag pattern across multiple rails, then reads out horizontally.",
        "encrypt": rail_fence_encrypt,
        "decrypt": rail_fence_decrypt
    },
    "columnar": {
        "id": "columnar",
        "name": "Columnar Transposition Cipher",
        "category": "Transposition",
        "type": "Permutation Grid Transposition",
        "key_type": "keyword",
        "default_key": "GERMAN",
        "supports_generation": False,
        "description": "Arranges characters into a matrix of columns and reads columns out in alphabetical order of a keyword.",
        "encrypt": columnar_encrypt,
        "decrypt": columnar_decrypt
    }
}
