import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from '@/components/app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { API_URL } from '@/constants/config';
import { getCurrentUserId } from '@/constants/session';

type TipoInteraccion = 'vista' | 'like' | 'favorita';

interface Obra {
  idobras: number;
  titulo: string;
  portada: string;
}

interface Props {
  tipo: TipoInteraccion;
  titulo: string;
  subtitulo: string;
}

export default function UserWorksList({
  tipo,
  titulo,
  subtitulo,
}: Props) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargarObras() {
      try {
        setCargando(true);
        setError('');

        const usuarioId = await getCurrentUserId();

        if (!usuarioId) {
          throw new Error('No se encontró una sesión iniciada.');
        }

        const response = await fetch(
          `${API_URL}/interacciones_obras/usuario/${usuarioId}/tipo/${tipo}`
        );

        if (!response.ok) {
          throw new Error('No se pudieron cargar las obras.');
        }

        const data: Obra[] = await response.json();

        if (activo) {
          setObras(data);
        }
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error
              ? e.message
              : 'Ocurrió un error al cargar las obras.'
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarObras();

    return () => {
      activo = false;
    };
  }, [tipo]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER AL PERFIL</Text>
          </Pressable>

          <Text style={styles.kicker}>MI PERFIL</Text>
          <Text style={styles.title}>{titulo}</Text>
          <Text style={styles.subtitle}>{subtitulo}</Text>

          {cargando ? (
            <Text style={styles.message}>Cargando obras...</Text>
          ) : error ? (
            <Text style={styles.message}>{error}</Text>
          ) : obras.length === 0 ? (
            <Text style={styles.message}>
              Todavía no tenés obras en esta sección
            </Text>
          ) : (
            obras.map((obra) => (
              <Pressable
                key={obra.idobras}
                onPress={() =>
                  router.push({
                    pathname: '/work-detail',
                    params: {
                      id: String(obra.idobras),
                      title: obra.titulo,
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={{ uri: obra.portada }}
                  contentFit="contain"
                  style={styles.poster}
                />

                <View style={styles.copy}>
                  <Text style={styles.workTitle}>
                    {obra.titulo}
                  </Text>

                  {tipo === 'vista' && (
                    <Text style={styles.detail}>
                      Obra vista
                    </Text>
                  )}

                  {tipo === 'like' && (
                    <Text style={styles.like}>
                      ♥ Te gusta esta obra
                    </Text>
                  )}

                  {tipo === 'favorita' && (
                    <Text style={styles.favorite}>
                      ★ Obra favorita
                    </Text>
                  )}
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
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
    paddingBottom: 120,
  },
  backButton: { paddingVertical: 8, marginBottom: 26 },
  backText: {
    color: '#d8d8d8',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700',
  },
  kicker: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  title: {
    color: '#ffffff',
    fontFamily: 'RocaOne',
    fontSize: 34,
    fontWeight: '700',
    marginTop: 3,
  },
  subtitle: {
    color: '#c9c9c9',
    fontFamily: 'RocaTwo',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  poster: { width: 106, height: 106 },
  copy: { flex: 1 },
  workTitle: {
    color: '#ffffff',
    fontFamily: 'RocaTwo',
    fontSize: 17,
    fontWeight: '700',
  },
  detail: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 13,
    marginTop: 8,
  },
  like: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 13,
    marginTop: 8,
  },
  favorite: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 13,
    marginTop: 8,
  },
  message: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
  pressed: { opacity: 0.72 },
});
