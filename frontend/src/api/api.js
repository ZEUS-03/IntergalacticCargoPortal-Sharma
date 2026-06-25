function getAuthHeaders() {
  return {};
}

function isFormData(value) {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

async function request(path, options = {}) {
  const hasBody = options.body !== undefined && options.body !== null;
  const shouldSetJsonContentType = hasBody && !isFormData(options.body);
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(shouldSetJsonContentType ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof body === "string" ? body : body?.message || "Request failed",
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function loginUser(credentials) {
  const data = await request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return data;
}

export async function signupUser(credentials) {
  return request("/signup", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function fetchCargo() {
  return request("/api/cargo", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
}

export async function uploadManifest(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof body === "string" ? body : body?.message || "Request failed",
    );
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
}

export async function fetchSession() {
  return request("/session", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
}

export async function logoutUser() {
  return request("/logout", {
    method: "POST",
  });
}
