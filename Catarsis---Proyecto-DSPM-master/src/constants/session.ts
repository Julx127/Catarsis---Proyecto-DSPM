// CONFIGURAR SESION CON ASYNC STORAGE
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usuarios } from '@/interfaces/interfaces';

// variable de la sesion
const SESSION_KEY = 'usuarioSesion';

// crear sesión
export async function startSession(usuario: usuarios) {
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      idusuarios: usuario.idusuarios,
      username: usuario.username,
      email: usuario.email,
      admin: usuario.admin
    })
  );
}

// obtener datos de la sesión
export async function getSession(): Promise<usuarios | null> {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  if (!session) {
    return null;
  }
  return JSON.parse(session);
}

// obtener usuario
export async function getCurrentUser(): Promise<string | null> {
  const usuario = await getSession();
  if (!usuario) {
    return null;
  }
  return usuario.username;
}

// obtener id del usuario
export async function getCurrentUserId(): Promise<number | null> {
  const usuario = await getSession();
  if (!usuario) {
    return null;
  }
  return usuario.idusuarios;
}

// saber si es o no admin
export async function isAdmin(): Promise<boolean> {
  const usuario = await getSession();
  if (!usuario) {
    return false;
  }
  return usuario.admin;
}

// cerrar y eliminar sesion
export async function closeSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}