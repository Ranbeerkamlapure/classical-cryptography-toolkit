"""
Classical Cryptography Toolkit - File Encryption & Container Service
Handles text file encryption, metadata packaging, parsing, and decryption.
"""

import re
import datetime
from typing import Dict, Any, Tuple
from werkzeug.utils import secure_filename
from ciphers import ALGORITHMS

CONTAINER_START = "-----BEGIN CLASSICAL CRYPTOGRAPHY TOOLKIT ENCRYPTED FILE-----"
CONTAINER_END = "-----END CLASSICAL CRYPTOGRAPHY TOOLKIT ENCRYPTED FILE-----"
PAYLOAD_MARKER = "-----BEGIN ENCRYPTED PAYLOAD-----"
MAX_FILE_SIZE_BYTES = 1024 * 1024  # 1 MB


def format_encrypted_container(
    algorithm_id: str,
    original_filename: str,
    ciphertext: str,
    extra_meta: Dict[str, Any] = None
) -> str:
    """
    Format encrypted content into a clean, documented educational file container.
    Notice: Secret keys (especially OTP secret keys) are NEVER embedded in the container!
    """
    algo_meta = ALGORITHMS.get(algorithm_id, {})
    algo_name = algo_meta.get("name", algorithm_id)
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    safe_name = secure_filename(original_filename) or "document.txt"
    
    header_lines = [
        CONTAINER_START,
        "Format-Version: 1.0",
        f"Algorithm: {algorithm_id}",
        f"Algorithm-Name: {algo_name}",
        f"Original-File: {safe_name}",
        f"Timestamp: {timestamp}",
        "Security-Notice: Educational classical cipher container. Not secure for modern data protection."
    ]
    
    if extra_meta:
        for k, v in extra_meta.items():
            if k not in ["key", "secret_key"]:  # Guard against leaking secret keys
                header_lines.append(f"{k}: {v}")
                
    header_lines.append(PAYLOAD_MARKER)
    header_lines.append(ciphertext)
    header_lines.append(CONTAINER_END)
    
    return "\n".join(header_lines)


def parse_encrypted_container(file_content: str) -> Tuple[str, Dict[str, str], bool]:
    """
    Parse uploaded file content.
    If the file is formatted with the toolkit header, extract payload and metadata.
    If it's raw text, return content directly with is_container=False.
    """
    cleaned = file_content.strip()
    
    if CONTAINER_START in cleaned and CONTAINER_END in cleaned:
        metadata = {}
        payload = ""
        
        # Split between header and payload
        try:
            parts = cleaned.split(PAYLOAD_MARKER)
            header_section = parts[0]
            tail = parts[1].split(CONTAINER_END)[0]
            payload = tail.strip()
            
            for line in header_section.splitlines():
                if ":" in line and not line.startswith("-----"):
                    key, val = line.split(":", 1)
                    metadata[key.strip()] = val.strip()
                    
            return payload, metadata, True
        except Exception:
            # Fallback to entire text if parsing failed
            return cleaned, {}, False
            
    return cleaned, {}, False
