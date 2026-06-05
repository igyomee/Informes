import { APP_MODULES, MODULE_STORAGE_KEY, getModuleByKey, type ModuleKey } from '../config/modules';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const API_BACKEND =
  import.meta.env.VITE_API_BACKEND ??
  (API_BASE_URL.includes('script.google.com') || APP_MODULES.some((module) => module.envUrl.includes('script.google.com'))
    ? 'apps-script'
    : 'express');
const PASSWORD_KEY = 'maintenance_app_password';

export function isAppsScriptBackend(): boolean {
  return API_BACKEND === 'apps-script';
}

export function getStoredPassword(): string {
  return window.localStorage.getItem(PASSWORD_KEY) ?? '';
}

export function setStoredPassword(password: string): void {
  window.localStorage.setItem(PASSWORD_KEY, password);
}

export function clearStoredPassword(): void {
  window.localStorage.removeItem(PASSWORD_KEY);
}

export function getStoredModule(): ModuleKey {
  return getModuleByKey(window.localStorage.getItem(MODULE_STORAGE_KEY)).key;
}

export function setStoredModule(moduleKey: ModuleKey): void {
  window.localStorage.setItem(MODULE_STORAGE_KEY, moduleKey);
}

export function getActiveApiBaseUrl(): string {
  if (isAppsScriptBackend()) {
    const module = getModuleByKey(getStoredModule());
    return module.envUrl || API_BASE_URL;
  }

  return API_BASE_URL;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (isAppsScriptBackend()) {
    return appsScriptFetch<T>(path, init);
  }

  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const password = getStoredPassword();
  if (password) {
    headers.set('x-app-password', password);
  }

  const response = await fetch(`${getActiveApiBaseUrl()}${path}`, {
    ...init,
    headers
  });

  if (response.status === 401) {
    throw new Error('Contraseña incorrecta o sesión no autorizada.');
  }

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      message = payload.error ?? message;
    } catch {
      message = await response.text();
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function appsScriptFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let body: unknown = {};
  if (typeof init.body === 'string' && init.body) {
    body = JSON.parse(init.body);
  }

  const response = await fetch(getActiveApiBaseUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      path,
      method: init.method ?? 'GET',
      password: getStoredPassword(),
      body
    })
  });

  const text = await response.text();
  let payload: { ok?: boolean; data?: T; error?: string };

  try {
    payload = JSON.parse(text) as { ok?: boolean; data?: T; error?: string };
  } catch {
    throw new Error(text || 'Respuesta no valida de Google Apps Script.');
  }

  if (!payload.ok) {
    throw new Error(payload.error ?? 'Error en Google Apps Script.');
  }

  return payload.data as T;
}

export function toQueryString<T extends object>(params: T): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  const query = search.toString();
  return query ? `?${query}` : '';
}
