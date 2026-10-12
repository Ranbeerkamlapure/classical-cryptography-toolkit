/**
 * API client module for Classical Cryptography Toolkit
 */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.port === "5173"
    ? "/api"
    : "https://classical-crypto-api.onrender.com/api");

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: response.ok, message: text };
    }

    if (!response.ok) {
      const errorMsg =
        data && data.error
          ? data.error
          : `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (
      err.message.includes("Failed to fetch") ||
      err.message.includes("NetworkError")
    ) {
      throw new Error('Could not connect to the backend. Please check the API server and try again.');
    }
    throw err;
  }
}

export async function checkHealth() {
  return request("/health");
}

export async function fetchAlgorithms() {
  return request("/algorithms");
}

export async function encryptText(algorithm, text, key) {
  return request("/encrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, text, key }),
  });
}

export async function decryptText(algorithm, text, key) {
  return request("/decrypt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, text, key }),
  });
}

export async function generateKey(algorithm, length = 16, text = "") {
  return request("/generate-key", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm, length, text }),
  });
}

export async function compareAlgorithms(text, selections) {
  return request("/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, selections }),
  });
}

export async function encryptFile(file, algorithm, key) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("algorithm", algorithm);
  formData.append("key", typeof key === "object" ? JSON.stringify(key) : key);

  return request("/files/encrypt", {
    method: "POST",
    body: formData,
  });
}

export async function decryptFile(file, algorithm, key) {
  const formData = new FormData();
  formData.append("file", file);
  if (algorithm) formData.append("algorithm", algorithm);
  if (key)
    formData.append("key", typeof key === "object" ? JSON.stringify(key) : key);

  return request("/files/decrypt", {
    method: "POST",
    body: formData,
  });
}
