import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from '@/components/app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '@/constants/config';
import { getCurrentUserId } from '@/constants/session';
import { readApiJson } from '@/constants/api-response';
import {
  etiquetas as Etiqueta,
  interacciones_posteos as InteraccionPosteo,
  posteos as Posteo,
  posteos_etiquetas as PosteoEtiqueta
} from '@/interfaces/interfaces';

type PosteoComunidad = Posteo & {
  username: string;
  likes: number;
};

export default function CommunityScreen() {
  const [posteos, setPosteos] = useState<PosteoComunidad[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [relaciones, setRelaciones] = useState<PosteoEtiqueta[]>([]);
  const [interacciones, setInteracciones] = useState<InteraccionPosteo[]>([]);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [cargando, setCargando] = useState(true);
  const [posteoEnProceso, setPosteoEnProceso] = useState<number | null>(null);
  const [posteoAEliminar, setPosteoAEliminar] = useState<number | null>(null);
  const [error, setError] = useState('');

  const cargarComunidad = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const [respuestaPosteos, respuestaEtiquetas, respuestaRelaciones, respuestaInteracciones, idUsuario] =
        await Promise.all([
          fetch(`${API_URL}/posteos`),
          fetch(`${API_URL}/etiquetas`),
          fetch(`${API_URL}/posteos_etiquetas`),
          fetch(`${API_URL}/interacciones_posteos`),
          getCurrentUserId()
        ]);

      if (
        !respuestaPosteos.ok ||
        !respuestaEtiquetas.ok ||
        !respuestaRelaciones.ok ||
        !respuestaInteracciones.ok
      ) {
        throw new Error('No se pudo cargar la comunidad.');
      }

      const [datosPosteos, datosEtiquetas, datosRelaciones, datosInteracciones] =
        await Promise.all([
          respuestaPosteos.json() as Promise<PosteoComunidad[]>,
          respuestaEtiquetas.json() as Promise<Etiqueta[]>,
          respuestaRelaciones.json() as Promise<PosteoEtiqueta[]>,
          respuestaInteracciones.json() as Promise<InteraccionPosteo[]>
        ]);

      setPosteos(datosPosteos);
      setEtiquetas(datosEtiquetas);
      setRelaciones(datosRelaciones);
      setInteracciones(datosInteracciones);
      setUsuarioId(idUsuario);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error al cargar la comunidad.');
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarComunidad();
    }, [cargarComunidad])
  );

  const etiquetasPorPosteo = useMemo(() => {
    const resultado = new Map<number, Etiqueta[]>();
    relaciones.forEach((relacion) => {
      const etiqueta = etiquetas.find(
        (item) => item.idetiquetas === relacion.etiquetas_idetiquetas
      );
      if (etiqueta) {
        resultado.set(relacion.posteos_idposteos, [
          ...(resultado.get(relacion.posteos_idposteos) ?? []),
          etiqueta
        ]);
      }
    });
    return resultado;
  }, [etiquetas, relaciones]);

  const filteredPosteos = useMemo(() => {
    const textoBuscado = query.trim().toLowerCase().replace(/^#/, '');
    if (textoBuscado === '') return posteos;

    return posteos.filter((posteo) => {
      const etiquetasPosteo = etiquetasPorPosteo.get(posteo.idposteos) ?? [];
      return (
        posteo.contenido.toLowerCase().includes(textoBuscado) ||
        etiquetasPosteo.some((etiqueta) =>
          etiqueta.nombre.toLowerCase().includes(textoBuscado)
        )
      );
    });
  }, [etiquetasPorPosteo, posteos, query]);

  async function alternarMeGusta(posteoId: number) {
    if (usuarioId === null) {
      setError('Iniciá sesión para indicar que te gusta un posteo.');
      return;
    }
    if (posteoEnProceso !== null) return;

    const likeAntes = interacciones.some(
      (interaccion) =>
        interaccion.posteos_idposteos === posteoId &&
        interaccion.usuarios_idusuarios === usuarioId &&
        Number(interaccion.like) === 1
    );
    setPosteoEnProceso(posteoId);
    setError('');
    try {
      const respuesta = await fetch(`${API_URL}/interacciones_posteos/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, posteoId })
      });

      const datos = await readApiJson(respuesta);
      if (
        (datos.like !== 0 && datos.like !== 1) ||
        typeof datos.likes !== 'number' ||
        !Number.isFinite(datos.likes)
      ) {
        throw new Error('La API devolvió datos inválidos para el “Me gusta”.');
      }
      const likeActivo = datos.like === 1;

      setInteracciones((actuales) => {
        const existente = actuales.find(
          (item) =>
            item.usuarios_idusuarios === usuarioId &&
            item.posteos_idposteos === posteoId
        );
        if (existente) {
          return actuales.map((item) =>
            item === existente ? { ...item, like: likeActivo } : item
          );
        }
        return [
          ...actuales,
          {
            idinteracciones_posteos: 0,
            usuarios_idusuarios: usuarioId,
            posteos_idposteos: posteoId,
            like: likeActivo,
            dislike: false
          }
        ];
      });

      setPosteos((actuales) =>
        actuales.map((posteo) =>
          posteo.idposteos === posteoId
            ? { ...posteo, likes: datos.likes as number }
            : posteo
        )
      );
    } catch (e) {
      if (e instanceof TypeError) {
        try {
          const [respuestaPosteos, respuestaInteracciones] = await Promise.all([
            fetch(`${API_URL}/posteos`),
            fetch(`${API_URL}/interacciones_posteos`)
          ]);
          if (!respuestaPosteos.ok || !respuestaInteracciones.ok) {
            throw new Error('No se pudo verificar el estado actualizado del “Me gusta”.');
          }

          const [posteosActualizados, interaccionesActualizadas] = await Promise.all([
            respuestaPosteos.json() as Promise<PosteoComunidad[]>,
            respuestaInteracciones.json() as Promise<InteraccionPosteo[]>
          ]);
          setPosteos(posteosActualizados);
          setInteracciones(interaccionesActualizadas);

          const likeActual = interaccionesActualizadas.some(
            (interaccion) =>
              interaccion.posteos_idposteos === posteoId &&
              interaccion.usuarios_idusuarios === usuarioId &&
              Number(interaccion.like) === 1
          );
          if (likeActual === !likeAntes) {
            setError('');
            return;
          }

          setError('No se pudo guardar el “Me gusta”. El estado se actualizó desde el servidor; volvé a intentarlo.');
        } catch (errorVerificacion) {
          setError(
            errorVerificacion instanceof TypeError
              ? `No se pudo confirmar el “Me gusta” porque no hay conexión con la API (${API_URL}).`
              : errorVerificacion instanceof Error
                ? errorVerificacion.message
                : 'No se pudo confirmar el estado del “Me gusta”.'
          );
        }
      } else {
        setError(
          e instanceof Error ? e.message : 'Ocurrió un error al guardar el “Me gusta”.'
        );
      }
    } finally {
      setPosteoEnProceso(null);
    }
  }

  function confirmarBorrado(posteoId: number) {
    setPosteoAEliminar(posteoId);
  }

  async function confirmarEliminacion() {
    if (posteoAEliminar === null || posteoEnProceso !== null) return;
    const posteoId = posteoAEliminar;
    await borrarPosteo(posteoId);
    setPosteoAEliminar(null);
  }

  async function borrarPosteo(posteoId: number) {
    if (usuarioId === null || posteoEnProceso !== null) return;

    setPosteoEnProceso(posteoId);
    setError('');
    try {
      const respuesta = await fetch(`${API_URL}/posteos/${posteoId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId })
      });
      await readApiJson(respuesta);

      setPosteos((actuales) => actuales.filter((posteo) => posteo.idposteos !== posteoId));
      setRelaciones((actuales) =>
        actuales.filter((relacion) => relacion.posteos_idposteos !== posteoId)
      );
      setInteracciones((actuales) =>
        actuales.filter((interaccion) => interaccion.posteos_idposteos !== posteoId)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error al borrar la publicación.');
    } finally {
      setPosteoEnProceso(null);
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.kicker}>RED TEATRAL</Text>
          <Text style={styles.title}>Comunidad</Text>
          <Text style={styles.subtitle}>
            Compartí tus impresiones y descubrí nuevas recomendaciones.
          </Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por palabra o hashtag..."
            placeholderTextColor="#b8b8b8"
            style={styles.search}
            accessibilityLabel="Buscar publicaciones"
          />

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/publish-opinion')}
            style={({ pressed }) => [styles.publish, pressed && styles.pressed]}
          >
            <Text style={styles.publishText}>PUBLICAR OPINION</Text>
          </Pressable>

          {error !== '' && <Text style={styles.error}>{error}</Text>}
          {cargando ? (
            <ActivityIndicator color="#e00000" style={styles.loading} />
          ) : filteredPosteos.length === 0 ? (
            <Text style={styles.empty}>No encontramos publicaciones.</Text>
          ) : (
            filteredPosteos.map((posteo) => {
              const etiquetasPosteo = etiquetasPorPosteo.get(posteo.idposteos) ?? [];
              const meGusta = interacciones.some(
                (interaccion) =>
                  interaccion.posteos_idposteos === posteo.idposteos &&
                  interaccion.usuarios_idusuarios === usuarioId &&
                  Number(interaccion.like) === 1
              );
              const fecha = new Date(posteo.fecha_creacion);

              return (
                <View key={posteo.idposteos} style={styles.post}>
                  <Text style={styles.user}>{posteo.username || 'Usuario'}</Text>
                  <Text style={styles.postText}>{posteo.contenido}</Text>
                  <Text style={styles.postDate}>
                    {Number.isNaN(fecha.getTime())
                      ? ''
                      : fecha.toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                  </Text>

                  <View style={styles.tags}>
                    {etiquetasPosteo.map((etiqueta) => (
                      <Text key={etiqueta.idetiquetas} style={styles.tag}>
                        #{etiqueta.nombre}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.postActions}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={meGusta ? 'Quitar me gusta' : 'Me gusta'}
                      accessibilityState={{
                        selected: meGusta,
                        disabled: posteoEnProceso === posteo.idposteos
                      }}
                      disabled={posteoEnProceso === posteo.idposteos}
                      onPress={() => alternarMeGusta(posteo.idposteos)}
                      style={({ pressed }) => [
                        styles.likeButton,
                        pressed && styles.pressed
                      ]}
                    >
                      {posteoEnProceso === posteo.idposteos ? (
                        <ActivityIndicator size="small" color="#e00000" />
                      ) : (
                        <Text style={[styles.action, meGusta && styles.actionActive]}>
                          {meGusta ? '♥' : '♡'} Me gusta · {posteo.likes}
                        </Text>
                      )}
                    </Pressable>
                    {posteo.usuarios_idusuarios === usuarioId && (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Borrar comentario"
                        accessibilityState={{
                          disabled: posteoEnProceso === posteo.idposteos
                        }}
                        disabled={posteoEnProceso === posteo.idposteos}
                        onPress={() => confirmarBorrado(posteo.idposteos)}
                        style={({ pressed }) => [
                          styles.deleteButton,
                          pressed && styles.pressed
                        ]}
                      >
                        <Text style={styles.deleteText}>BORRAR COMENTARIO</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
      <Modal
        visible={posteoAEliminar !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (posteoEnProceso === null) setPosteoAEliminar(null);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View
            accessibilityRole="alert"
            accessibilityViewIsModal
            style={styles.confirmationDialog}
          >
            <Text style={styles.confirmationTitle}>Confirmar eliminación</Text>
            <Text style={styles.confirmationMessage}>
              ¿Quieres borrar tu comentario?
            </Text>
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                disabled={posteoEnProceso !== null}
                onPress={() => setPosteoAEliminar(null)}
                style={({ pressed }) => [
                  styles.cancelDeleteButton,
                  pressed && styles.pressed,
                  posteoEnProceso !== null && styles.disabledButton
                ]}
              >
                <Text style={styles.cancelDeleteText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={posteoEnProceso !== null}
                onPress={confirmarEliminacion}
                style={({ pressed }) => [
                  styles.confirmDeleteButton,
                  pressed && styles.pressed,
                  posteoEnProceso !== null && styles.disabledButton
                ]}
              >
                {posteoEnProceso === posteoAEliminar ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Borrar mensaje</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 120
  },
  kicker: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4
  },
  title: {
    color: '#ffffff',
    fontFamily: 'RocaOne',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 3
  },
  subtitle: {
    color: '#c9c9c9',
    fontFamily: 'RocaTwo',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 22
  },
  search: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3c3c3c',
    borderWidth: 1,
    borderColor: '#696969',
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 13,
    paddingHorizontal: 18
  },
  publish: {
    alignSelf: 'flex-end',
    borderRadius: 18,
    backgroundColor: '#c40000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 24
  },
  publishText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 10,
    fontWeight: '700'
  },
  post: {
    borderTopWidth: 1,
    borderTopColor: '#555555',
    paddingVertical: 18
  },
  user: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '700'
  },
  postText: {
    color: '#d4d4d4',
    fontFamily: 'serif',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8
  },
  postDate: {
    color: '#888888',
    fontFamily: 'serif',
    fontSize: 11,
    marginTop: 8
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { color: '#e00000', fontFamily: 'serif', fontSize: 13 },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14
  },
  likeButton: { minHeight: 24, justifyContent: 'center' },
  action: { color: '#bdbdbd', fontFamily: 'serif', fontSize: 12 },
  actionActive: { color: '#e00000' },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#8b3333',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6
  },
  deleteText: { color: '#ff7777', fontFamily: 'serif', fontSize: 10, fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.72)'
  },
  confirmationDialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#555555',
    backgroundColor: '#2b2b2b',
    padding: 22
  },
  confirmationTitle: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 19,
    fontWeight: '700'
  },
  confirmationMessage: {
    color: '#d4d4d4',
    fontFamily: 'serif',
    fontSize: 15,
    marginTop: 12
  },
  confirmationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24
  },
  cancelDeleteButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#777777',
    paddingHorizontal: 16
  },
  cancelDeleteText: {
    color: '#d4d4d4',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700'
  },
  confirmDeleteButton: {
    minHeight: 40,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#c40000',
    paddingHorizontal: 16
  },
  confirmDeleteText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700'
  },
  disabledButton: { opacity: 0.55 },
  loading: { marginTop: 30 },
  empty: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 35
  },
  error: { color: '#ff7777', fontSize: 13, marginBottom: 10 },
  pressed: { opacity: 0.72 }
});
