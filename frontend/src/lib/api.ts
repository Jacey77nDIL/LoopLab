const API_BASE_URL = "http://127.0.0.1:8000";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  localStorage.setItem("auth_token", data.access_token);
  return data;
}

export async function signupUser(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export async function fetchProject() {
  const response = await fetch(`${API_BASE_URL}/ide/project`, {
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
    }
    throw new Error(await response.text());
  }
  return await response.json();
}

export async function sendPrompt(prompt: string) {
  const response = await fetch(`${API_BASE_URL}/ide/prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) throw new Error(await response.text());
  return await response.json();
}

export function logoutUser() {
  localStorage.removeItem("auth_token");
}
