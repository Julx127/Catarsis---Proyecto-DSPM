
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '@/constants/config';
import { getCurrentUserId } from '@/constants/session';

type Resenia = {
  idresenias: number;
  obras_idobras: number;
  usuarios_idusuarios: number;
  username: string;
  estrellas: number;
  comentario: string;
  fecha: string;
};

type DatosObra = {
  titulo: string;
};

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const obraId = Number(id);

  const [titulo, setTitulo] = useState('Obra seleccionada');
  const [resenias, setResenias] = useState<Resenia[]>([]);
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');

  const [cargando, setCargando] = useState(true);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const cargarResenias = useCallback(async () => {
    if (!Number.isInteger(obraId) || obraId <= 0) {
      throw new Error('El identificador de la obra no es válido.');
    }

    const respuesta = await fetch(
      `${API_URL}/resenias/obra/${obraId}`
    );

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar las reseñas.');
    }

    const datos: Resenia[] = await respuesta.json();
    setResenias(datos);
  }, [obraId]);

  useEffect(() => {
    let cancelado = false;

    async function cargarDatos() {
      setCargando(true);
      setError('');

      try {
        if (!Number.isInteger(obraId) || obraId <= 0) {
          throw new Error('El identificador de la obra no es válido.');
        }

        const [respuestaObra, respuestaResenias] = await Promise.all([
          fetch(`${API_URL}/obras/${obraId}`),
          fetch(`${API_URL}/resenias/obra/${obraId}`)
        ]);

        if (!respuestaObra.ok || !respuestaResenias.ok) {
          throw new Error('No se pudieron cargar los datos.');
        }

        const datosObra: DatosObra = await respuestaObra.json();
        const datosResenias: Resenia[] = await respuestaResenias.json();

        if (!cancelado) {
          setTitulo(datosObra.titulo);
          setResenias(datosResenias);
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error
              ? e.message
              : 'Ocurrió un error al cargar los datos.'
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      cancelado = true;
    };
  }, [obraId]);

  async function publicarResenia() {
    setError('');
    setMensaje('');

    if (calificacion < 1 || calificacion > 5) {
      setError('Seleccioná una calificación de 1 a 5 estrellas.');
      return;
    }

    if (comentario.trim().length === 0) {
      setError('Escribí un comentario antes de publicar.');
      return;
    }

    if (publicando) return;

    setPublicando(true);

    try {
      const usuarioId = await getCurrentUserId();

      if (usuarioId === null) {
        throw new Error('Tenés que iniciar sesión para publicar una reseña.');
      }

      const respuesta = await fetch(`${API_URL}/resenias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          obraId,
          usuarioId,
          estrellas: calificacion,
          comentario: comentario.trim()
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'No se pudo publicar la reseña.');
      }

      // Agregamos la reseña que devuelve el backend.
      setResenias((anteriores) => [datos, ...anteriores]);

      setCalificacion(0);
      setComentario('');
      setMensaje('¡Tu reseña se publicó correctamente!');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Ocurrió un error al publicar la reseña.'
      );
    } finally {
      setPublicando(false);
    }
  }

  function Estrellas({
    valor,
    seleccionable = false,
    onSeleccion
  }: {
    valor: number;
    seleccionable?: boolean;
    onSeleccion?: (puntuacion: number) => void;
  }) {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((numero) => {
          const rellena = numero <= valor;

          if (seleccionable) {
            return (
              <Pressable
                key={numero}
                accessibilityRole="button"
                accessibilityLabel={`${numero} ${numero === 1 ? 'estrella' : 'estrellas'}`}
                accessibilityState={{ selected: numero === valor }}
                onPress={() => onSeleccion?.(numero)}
                hitSlop={4}
                style={styles.starButton}
              >
                <Text style={rellena ? styles.starFilled : styles.starEmpty}>
                  {rellena ? '★' : '☆'}
                </Text>
              </Pressable>
            );
          }

          return (
            <Text
              key={numero}
              style={rellena ? styles.starFilled : styles.starEmpty}
            >
              {rellena ? '★' : '☆'}
            </Text>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.replace({
                pathname: '/work-detail',
                params: { id: String(obraId) }
              })
            }
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER A LA OBRA</Text>
          </Pressable>

          <Text style={styles.kicker}>TU OPINIÓN</Text>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>
            Compartí tu experiencia con la comunidad.
          </Text>

          <View style={styles.ratingBox}>
            <Text style={styles.label}>Tu calificación</Text>

            <Estrellas
              valor={calificacion}
              seleccionable
              onSeleccion={setCalificacion}
            />

            <Text style={styles.ratingHint}>
              {calificacion === 0
                ? 'Seleccioná de 1 a 5 estrellas'
                : `Seleccionaste ${calificacion} de 5 estrellas`}
            </Text>
          </View>

          <Text style={styles.label}>Comentario</Text>

          <TextInput
            value={comentario}
            onChangeText={setComentario}
            multiline
            maxLength={2000}
            placeholder="Escribí tu reseña..."
            placeholderTextColor="#b8b8b8"
            style={styles.commentInput}
            textAlignVertical="top"
            accessibilityLabel="Escribir reseña"
          />

          <Text style={styles.characterCount}>
            {comentario.length}/2000
          </Text>

          <Pressable
            accessibilityRole="button"
            disabled={publicando}
            onPress={publicarResenia}
            style={({ pressed }) => [
              styles.submit,
              pressed && styles.pressed,
              publicando && styles.disabled
            ]}
          >
            {publicando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitText}>PUBLICAR RESEÑA</Text>
            )}
          </Pressable>

          {error !== '' && (
            <Text style={styles.error}>{error}</Text>
          )}

          {mensaje !== '' && (
            <Text style={styles.success}>{mensaje}</Text>
          )}

          <Text style={styles.sectionTitle}>Opiniones recientes</Text>

          {cargando ? (
            <ActivityIndicator
              size="large"
              color="#e00000"
              style={styles.loading}
            />
          ) : resenias.length === 0 ? (
            <Text style={styles.empty}>
              Todavía no hay reseñas. ¡Sé la primera persona en opinar!
            </Text>
          ) : (
            resenias.map((resenia) => (
              <View key={resenia.idresenias} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.user}>{resenia.username}</Text>
                    <Text style={styles.date}>{resenia.fecha}</Text>
                  </View>

                  <Estrellas valor={Number(resenia.estrellas)} />
                </View>

                <Text style={styles.reviewText}>
                  {resenia.comentario}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e1e'
  },
  safeArea: {
    flex: 1
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 120
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 26
  },
  backText: {
    color: '#d8d8d8',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700'
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
    fontFamily: 'serif',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 3
  },
  subtitle: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 26
  },
  ratingBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#555555',
    paddingVertical: 16,
    marginBottom: 24
  },
  label: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 9
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  starButton: {
    paddingHorizontal: 2,
    paddingVertical: 3
  },
  starFilled: {
    color: '#e00000',
    fontSize: 24
  },
  starEmpty: {
    color: '#888888',
    fontSize: 24
  },
  ratingHint: {
    color: '#c9c9c9',
    fontSize: 12,
    marginTop: 8
  },
  commentInput: {
    minHeight: 130,
    borderRadius: 8,
    backgroundColor: '#3c3c3c',
    borderWidth: 1,
    borderColor: '#696969',
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 14,
    padding: 14
  },
  characterCount: {
    color: '#aaaaaa',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5
  },
  submit: {
    alignSelf: 'flex-start',
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#c40000',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 14
  },
  submitText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700'
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 14
  },
  review: {
    backgroundColor: '#303030',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap'
  },
  reviewUserInfo: {
    flex: 1,
    gap: 4
  },
  user: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: '700'
  },
  date: {
    color: '#c9c9c9',
    fontSize: 12
  },
  reviewText: {
    color: '#d4d4d4',
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10
  },
  empty: {
    color: '#c9c9c9',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingVertical: 24
  },
  loading: {
    marginTop: 20
  },
  error: {
    color: '#ff7777',
    fontSize: 13,
    marginTop: 12
  },
  success: {
    color: '#8ddd9a',
    fontSize: 13,
    marginTop: 12
  },
  disabled: {
    opacity: 0.6
  },
  pressed: {
    opacity: 0.72
  }
});
