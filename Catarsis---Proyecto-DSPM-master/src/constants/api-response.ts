export async function readApiJson(response: Response): Promise<Record<string, unknown>> {
  const body = await response.text();
  let data: unknown;

  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(
      `La API respondió HTTP ${response.status} sin JSON. Verificá que el backend actualizado esté iniciado y que API_URL apunte a ese servidor.`
    );
  }

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('La API devolvió una respuesta JSON con formato inesperado.');
  }

  const payload = data as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(
      typeof payload.mensaje === 'string'
        ? payload.mensaje
        : `La API respondió con el estado HTTP ${response.status}.`
    );
  }

  return payload;
}
