import axios from 'axios';

const TOKEN_KEY = 'token';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2000/api';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function apiRegister(body: { username: string; email: string; password: string }): Promise<any> {
  const res = await api.post("/auth/register", body);
  if (res.data.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
}

export async function apiLogin(body: { email: string; password: string }): Promise<any> {
  const res = await api.post("/auth/login", body);
  if (res.data.token) {
    setAuthToken(res.data.token);
  }
  return res.data;
}

export async function apiCreateWorkflow(body: { nodes: any[]; edges: any[] }): Promise<any> {
  const res = await api.post("/workflow", body);
  return res.data;
}

export async function apiGetAllWorkflows(): Promise<any> {
  const res = await api.get("/workflow");
  return res.data;
}

export async function apiGetWorkflow(workflowId: string): Promise<any> {
  const res = await api.get(`/workflow/${workflowId}`);
  return res.data;
}

export async function apiGetNodes(): Promise<any> {
  const res = await api.get("/nodes");
  return res.data;
}


