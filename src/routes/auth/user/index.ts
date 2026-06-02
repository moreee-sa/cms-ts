import { config } from "@/lib";
import { getWPPasswordByUserId } from "@/db";
import type { ApplicationPassword, UserType } from "@/types";

// Autenticazione <nome-utente>:<API password> in base64
const auth64 = btoa(`${config.wp.adminUsername}:${config.wp.adminPassword}`);

export const getAuthUser = async (id: number) => {
  const userData = await getWPPasswordByUserId(id);
  const authUser = btoa(`${userData.wp_username}:${userData.wp_app_password}`);
  return authUser;
}

// Crea un utente con ruolo autore su wordpress
export const createWPUser = async (userData: UserType, wp_username: string) => {
  const response = await fetch(`${config.wp.baseUrl}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth64}`
    },
    body: JSON.stringify({
      username: wp_username,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      roles: ['author']
    }),
    tls: { rejectUnauthorized: false }
  });

  if (response.status !== 201) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }

  return await response.json() as { id: number };
}

// Crea la password dell'applicazione (API Wordpress)
export const createWPApplicationPassword = async (userId: number) => {
  const response = await fetch(`${config.wp.baseUrl}/users/${userId}/application-passwords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth64}`
    },
    body: JSON.stringify({ name: 'user-api-cms' }),
    tls: { rejectUnauthorized: false }
  });

  if (response.status !== 201) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }

  return await response.json() as ApplicationPassword;
}

// Elimina l'utente tramite il suo ID
export const deleteWPUser = async (userId: number) => {
  const response = await fetch(`${config.wp.baseUrl}/users/${userId}?force=true&reassign=1`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${auth64}` },
    tls: { rejectUnauthorized: false }
  });

  if (!response.ok) {
    const data = await response.json() as { code: string, message: string };
    throw new Error(data.message);
  }
}