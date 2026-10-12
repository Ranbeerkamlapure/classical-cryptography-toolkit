"""
Classical Cryptography Toolkit - Flask REST API Server
Academic Project: Network Security Mini Project (Final Year ECE, 2026-27)
"""

import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from ciphers import (
    ALGORITHMS,
    caesar_encrypt, caesar_decrypt,
    monoalphabetic_encrypt, monoalphabetic_decrypt, generate_monoalphabetic_key,
    playfair_encrypt, playfair_decrypt,
    hill_encrypt, hill_decrypt,
    vigenere_encrypt, vigenere_decrypt,
    otp_encrypt, otp_decrypt, generate_otp_key, count_alphabetic,
    rail_fence_encrypt, rail_fence_decrypt,
    columnar_encrypt, columnar_decrypt
)
from file_service import (
    format_encrypted_container,
    parse_encrypted_container,
    MAX_FILE_SIZE_BYTES
)

app = Flask(__name__)
# Narrow CORS configuration for local development
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "Classical Cryptography Toolkit API",
        "version": "1.0.0",
        "academic_info": "Network Security Mini Project (Final Year ECE 2026-27)"
    })


@app.route("/api/algorithms", methods=["GET"])
def get_algorithms():
    """Return catalog of available algorithms and their metadata."""
    catalog = []
    for algo_id, data in ALGORITHMS.items():
        catalog.append({
            "id": algo_id,
            "name": data["name"],
            "category": data["category"],
            "type": data["type"],
            "key_type": data["key_type"],
            "default_key": data["default_key"],
            "supports_generation": data["supports_generation"],
            "description": data["description"]
        })
    return jsonify({"success": True, "algorithms": catalog})


@app.route("/api/generate-key", methods=["POST"])
def generate_key_endpoint():
    """Generate a random key for algorithms that support it (Monoalphabetic, OTP)."""
    data = request.get_json(silent=True) or {}
    algo_id = data.get("algorithm", "").strip().lower()
    
    if algo_id == "monoalphabetic":
        key = generate_monoalphabetic_key()
        return jsonify({"success": True, "algorithm": algo_id, "key": key})
    elif algo_id == "otp":
        text = data.get("text", "")
        length = data.get("length")
        if length is not None:
            try:
                l_val = int(length)
            except (ValueError, TypeError):
                return jsonify({"success": False, "error": "Invalid length parameter."}), 400
        elif text:
            l_val = count_alphabetic(text)
            if l_val == 0:
                l_val = 16  # fallback default
        else:
            l_val = 16
        key = generate_otp_key(l_val)
        return jsonify({"success": True, "algorithm": algo_id, "key": key, "length": l_val})
    else:
        return jsonify({
            "success": False,
            "error": f"Key generation is not applicable for '{algo_id}'."
        }), 400


@app.route("/api/encrypt", methods=["POST"])
def encrypt_endpoint():
    """Unified encryption endpoint."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON body."}), 400
        
    algo_id = data.get("algorithm", "").strip().lower()
    text = data.get("text", "")
    key = data.get("key")
    
    if not algo_id or algo_id not in ALGORITHMS:
        return jsonify({"success": False, "error": f"Unsupported or unknown algorithm: '{algo_id}'."}), 400
        
    algo_entry = ALGORITHMS[algo_id]
    
    try:
        start_time = time.perf_counter()
        result = algo_entry["encrypt"](text, key)
        elapsed_sec = time.perf_counter() - start_time
        
        return jsonify({
            "success": True,
            "algorithm": algo_id,
            "algorithm_name": algo_entry["name"],
            "ciphertext": result["ciphertext"],
            "key": result["key"],
            "details": result.get("details", {}),
            "execution_time_ms": round(elapsed_sec * 1000, 4)
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as ex:
        return jsonify({"success": False, "error": f"Encryption failed: {str(ex)}"}), 500


@app.route("/api/decrypt", methods=["POST"])
def decrypt_endpoint():
    """Unified decryption endpoint."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON body."}), 400
        
    algo_id = data.get("algorithm", "").strip().lower()
    text = data.get("text", "")
    key = data.get("key")
    
    if not algo_id or algo_id not in ALGORITHMS:
        return jsonify({"success": False, "error": f"Unsupported or unknown algorithm: '{algo_id}'."}), 400
        
    algo_entry = ALGORITHMS[algo_id]
    
    try:
        start_time = time.perf_counter()
        result = algo_entry["decrypt"](text, key)
        elapsed_sec = time.perf_counter() - start_time
        
        return jsonify({
            "success": True,
            "algorithm": algo_id,
            "algorithm_name": algo_entry["name"],
            "plaintext": result["plaintext"],
            "key": result["key"],
            "details": result.get("details", {}),
            "execution_time_ms": round(elapsed_sec * 1000, 4)
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as ex:
        return jsonify({"success": False, "error": f"Decryption failed: {str(ex)}"}), 500


@app.route("/api/compare", methods=["POST"])
def compare_endpoint():
    """
    Compare 2 or more algorithms on the same plaintext.
    Measures execution time with perf_counter and reports ciphertext length.
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON body."}), 400
        
    text = data.get("text", "")
    selections = data.get("selections", [])
    
    if not text:
        return jsonify({"success": False, "error": "Plaintext is required for comparison."}), 400
        
    if not selections or len(selections) < 2:
        return jsonify({"success": False, "error": "Please select at least 2 algorithms to compare."}), 400
        
    results = []
    
    for item in selections:
        algo_id = item.get("algorithm", "").strip().lower()
        key = item.get("key")
        
        if algo_id not in ALGORITHMS:
            results.append({
                "algorithm_id": algo_id,
                "algorithm_name": algo_id,
                "success": False,
                "error": f"Unknown algorithm: '{algo_id}'"
            })
            continue
            
        algo_entry = ALGORITHMS[algo_id]
        try:
            start_time = time.perf_counter()
            res = algo_entry["encrypt"](text, key)
            elapsed_sec = time.perf_counter() - start_time
            
            ciphertext = res["ciphertext"]
            results.append({
                "algorithm_id": algo_id,
                "algorithm_name": algo_entry["name"],
                "category": algo_entry["category"],
                "success": True,
                "ciphertext": ciphertext,
                "ciphertext_length": len(ciphertext),
                "plaintext_length": len(text),
                "execution_time_ms": round(elapsed_sec * 1000, 4),
                "key_used": res["key"]
            })
        except Exception as ex:
            results.append({
                "algorithm_id": algo_id,
                "algorithm_name": algo_entry["name"],
                "category": algo_entry["category"],
                "success": False,
                "error": str(ex)
            })
            
    return jsonify({
        "success": True,
        "input_length": len(text),
        "results": results,
        "disclaimer": (
            "Benchmark measurements reflect runtime execution conditions and string transformations. "
            "Faster execution or differing output length do not indicate modern cryptographic strength. "
            "Classical ciphers are mathematically broken by modern cryptanalysis."
        )
    })


@app.route("/api/files/encrypt", methods=["POST"])
def file_encrypt_endpoint():
    """
    Encrypt uploaded plain-text file.
    Packages output into documented container format.
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded in form data."}), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Uploaded file has an empty filename."}), 400
        
    algo_id = request.form.get("algorithm", "").strip().lower()
    raw_key = request.form.get("key")
    
    if algo_id not in ALGORITHMS:
        return jsonify({"success": False, "error": f"Unknown algorithm: '{algo_id}'."}), 400
        
    # Read file content safely in memory
    raw_bytes = file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        return jsonify({"success": False, "error": "File size exceeds 1 MB limit."}), 400
        
    try:
        text_content = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text_content = raw_bytes.decode("latin-1")
        except Exception:
            return jsonify({"success": False, "error": "File must be valid UTF-8 or ASCII plain text."}), 400
            
    # Parse key for Hill cipher if sent as JSON string
    active_key = raw_key
    if algo_id == "hill" and isinstance(raw_key, str) and raw_key.startswith("["):
        import json
        try:
            active_key = json.loads(raw_key)
        except Exception:
            pass
            
    algo_entry = ALGORITHMS[algo_id]
    try:
        start_time = time.perf_counter()
        result = algo_entry["encrypt"](text_content, active_key)
        elapsed_sec = time.perf_counter() - start_time
        
        safe_orig_name = secure_filename(file.filename) or "document.txt"
        container_text = format_encrypted_container(
            algorithm_id=algo_id,
            original_filename=safe_orig_name,
            ciphertext=result["ciphertext"],
            extra_meta={
                "Execution-Time-Ms": round(elapsed_sec * 1000, 4),
                "Original-Size-Bytes": len(raw_bytes)
            }
        )
        
        output_filename = f"{safe_orig_name}.enc.txt"
        return jsonify({
            "success": True,
            "filename": output_filename,
            "container_content": container_text,
            "raw_ciphertext": result["ciphertext"],
            "algorithm": algo_id,
            "algorithm_name": algo_entry["name"],
            "key_used": result["key"],
            "original_size": len(raw_bytes),
            "output_size": len(container_text.encode("utf-8")),
            "details": result.get("details", {})
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as ex:
        return jsonify({"success": False, "error": f"File encryption failed: {str(ex)}"}), 500


@app.route("/api/files/decrypt", methods=["POST"])
def file_decrypt_endpoint():
    """
    Decrypt uploaded file (either container format or raw ciphertext).
    """
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded in form data."}), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Uploaded file has an empty filename."}), 400
        
    algo_id = request.form.get("algorithm", "").strip().lower()
    raw_key = request.form.get("key")
    
    raw_bytes = file.read()
    if len(raw_bytes) > MAX_FILE_SIZE_BYTES:
        return jsonify({"success": False, "error": "File size exceeds 1 MB limit."}), 400
        
    try:
        text_content = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        try:
            text_content = raw_bytes.decode("latin-1")
        except Exception:
            return jsonify({"success": False, "error": "File must be valid UTF-8 or ASCII plain text."}), 400
            
    payload, meta, is_container = parse_encrypted_container(text_content)
    
    # If container specified an algorithm and user didn't or matches
    if is_container and meta.get("Algorithm"):
        container_algo = meta["Algorithm"].strip().lower()
        if not algo_id:
            algo_id = container_algo
        elif algo_id != container_algo:
            return jsonify({
                "success": False,
                "error": f"Selected algorithm '{algo_id}' does not match container header algorithm '{container_algo}'."
            }), 400
            
    if not algo_id or algo_id not in ALGORITHMS:
        return jsonify({
            "success": False,
            "error": "Algorithm must be specified or detected from container header."
        }), 400
        
    active_key = raw_key
    if algo_id == "hill" and isinstance(raw_key, str) and raw_key.startswith("["):
        import json
        try:
            active_key = json.loads(raw_key)
        except Exception:
            pass
            
    algo_entry = ALGORITHMS[algo_id]
    try:
        result = algo_entry["decrypt"](payload, active_key)
        
        orig_name = meta.get("Original-File") if is_container else None
        if not orig_name:
            orig_name = secure_filename(file.filename) or "decrypted.txt"
            if orig_name.endswith(".enc.txt"):
                orig_name = orig_name[:-8] + ".txt"
            elif orig_name.endswith(".enc"):
                orig_name = orig_name[:-4]
            else:
                orig_name = f"decrypted_{orig_name}"
                
        return jsonify({
            "success": True,
            "filename": orig_name,
            "plaintext": result["plaintext"],
            "algorithm": algo_id,
            "algorithm_name": algo_entry["name"],
            "is_container": is_container,
            "container_meta": meta,
            "details": result.get("details", {})
        })
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as ex:
        return jsonify({"success": False, "error": f"File decryption failed: {str(ex)}"}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
