import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View
} from '@/components/app-theme';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_URL } from '@/constants/config';
import { getCurrentUserId } from '@/constants/session';

type Produccion = {
  idproducciones: number;
  ubicacion: string;
  anio: number;
};
type Obra = {
  idobras: number;
  titulo: string;
  autor: string;
  sinopsis: string;
  portada: string;
  likes: number;
  producciones: Produccion[];
};
type Interacciones = {
  vista: number;
  like: number;
  favorita: number;
};

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const obraId = Number(id);
  const [obra, setObra] = useState<Obra | null>(null);
  const [interacciones, setInteracciones] = useState<Interacciones>({
    vista: 0,
    like: 0,
    favorita: 0
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    async function cargarDatos() {
      if (!id || !Number.isInteger(obraId) || obraId <= 0) {
        setError('El ID de la obra no es válido');
        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');

      try {
        const usuarioId = await getCurrentUserId();
        if (usuarioId === null) {
          throw new Error('Iniciá sesión para consultar tus interacciones');
        }

        const [respuestaObra, respuestaInteracciones] =
          await Promise.all([
            fetch(`${API_URL}/obras/${obraId}`),
            fetch(
              `${API_URL}/interacciones_obras/usuario/${usuarioId}/obra/${obraId}`
            )
          ]);
        if (!respuestaObra.ok) {
          throw new Error('No se pudo obtener la obra');
        }
        if (!respuestaInteracciones.ok) {
          throw new Error('No se pudieron obtener las interacciones');
        }

        const datosObra: Obra = await respuestaObra.json();
        const datosInteracciones: Interacciones =
          await respuestaInteracciones.json();
        if (!cancelado) {
          setObra(datosObra);
          setInteracciones(datosInteracciones);
        }
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error
              ? e.message
              : 'Ocurrió un error al cargar los datos D:'
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
  }, [id]);

  async function alternarInteraccion(
    campo: 'vista' | 'like' | 'favorita'
  ) {
    if (guardando || !obra) return;
    setGuardando(true);
    setError('');

    try {
      const usuarioId = await getCurrentUserId();
      if (usuarioId === null) {
        throw new Error('La sesión no esta iniciada');
      }
      const respuesta = await fetch(
        `${API_URL}/interacciones_obras/toggle`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            usuarioId,
            obraId: obra.idobras,
            campo
          })
        }
      );
      if (!respuesta.ok) {
        throw new Error('No se pudo guardar la interacción :(');
      }
      const nuevosEstados: Interacciones = await respuesta.json();
      setInteracciones(nuevosEstados);

      if (campo === 'like') {
        const respuestaObra = await fetch(
          `${API_URL}/obras/${obra.idobras}`
        );
        if (!respuestaObra.ok) {
          throw new Error('Se guardó el like, pero no se pudo actualizar el contador :C');
        }
        const datosActualizados: Obra = await respuestaObra.json();
        setObra(datosActualizados);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Ocurrió un error al guardar el cambio D:'
      );
    } finally {
      setGuardando(false);
    }
  }

  function BotonInteraccion({
    campo,
    activo,
    icono,
    iconoActivo,
    texto
  }: {
    campo: 'vista' | 'like' | 'favorita';
    activo: boolean;
    icono: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    iconoActivo: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    texto: string;
  }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={texto}
        accessibilityState={{ selected: activo, disabled: guardando }}
        disabled={guardando}
        onPress={() => alternarInteraccion(campo)}
        style={({ pressed }) => [
          styles.interactionButton,
          pressed && styles.pressed
        ]}
      >
        <MaterialCommunityIcons
          name={activo ? iconoActivo : icono}
          size={43}
          color={activo ? '#E00000' : '#FFFFFF'}
        />
        <Text
          style={[
            styles.interactionText,
            activo && styles.interactionTextActive
          ]}
        >
          {texto}
        </Text>
      </Pressable>
    );
  }

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E00000" />
        <Text style={styles.message}>Cargando obra...</Text>
      </View>
    );
  }

  if (error && !obra) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable
            onPress={() => router.replace('/works')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER A OBRAS</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!obra) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/works')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER A OBRAS</Text>
          </Pressable>
          <Image
            source={{ uri: obra.portada }}
            contentFit="contain"
            style={styles.poster}
          />
          <Text style={styles.kicker}>OBRA TEATRAL</Text>
          <Text style={styles.title}>{obra.titulo}</Text>
          <Text style={styles.author}>Por {obra.autor}</Text>
          <View style={styles.likesContainer}>
            <MaterialCommunityIcons
              name="thumb-up"
              size={20}
              color="#E00000"
            />
            <Text style={styles.likesText}>
              {obra.likes} {obra.likes === 1 ? 'usuario' : 'usuarios'} les
              gusta esta obra
            </Text>
          </View>
          <View style={styles.interactions}>
            <BotonInteraccion
              campo="vista"
              activo={Number(interacciones.vista) === 1}
              icono="eye-outline"
              iconoActivo="eye"
              texto="Vista"
            />
            <BotonInteraccion
              campo="like"
              activo={Number(interacciones.like) === 1}
              icono="thumb-up-outline"
              iconoActivo="thumb-up"
              texto="Me gusta"
            />
            <BotonInteraccion
              campo="favorita"
              activo={Number(interacciones.favorita) === 1}
              icono="heart-outline"
              iconoActivo="heart"
              texto="Favorita"
            />
          </View>

          {guardando && (
            <ActivityIndicator color="#E00000" style={styles.loadingSmall} />
          )}
          {error !== '' && (
            <Text style={styles.error}>{error}</Text>
          )}
          <View style={styles.productionSection}>
            <Text style={styles.productionTitle}>PRODUCCIONES</Text>

            {obra.producciones.length > 0 ? (
              obra.producciones.map((produccion) => (
                <Text
                  key={produccion.idproducciones}
                  style={styles.producer}
                >
                  • {produccion.anio} {produccion.ubicacion}
                </Text>
              ))
            ) : (
              <Text style={styles.message}>
                No hay producciones registradas.
              </Text>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '/comments',
                params: {
                  id: String(obra.idobras)
                }
              })
            }
            style={({ pressed }) => [
              styles.reviewButton,
              pressed && styles.pressed
            ]}
          >
            <Text style={styles.reviewText}>VER RESEÑAS</Text>
          </Pressable>
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
    alignItems: 'center',
    padding: 22,
    paddingBottom: 120
  },
  center: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 20
  },
  backText: {
    color: '#d8d8d8',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700'
  },
  poster: {
    width: 230,
    aspectRatio: 1,
    borderRadius: 8
  },
  kicker: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginTop: 24
  },
  title: {
    color: '#ffffff',
    fontFamily: 'RocaOne',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4
  },
  author: {
    color: '#d2d2d2',
    fontFamily: 'RocaTwo',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16
  },
  likesText: {
    color: '#e00000',
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1
  },
  interactions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    marginTop: 26,
    paddingVertical: 20,
    backgroundColor: '#303030',
    borderRadius: 12
  },
  interactionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 5
  },
  interactionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  interactionTextActive: {
    color: '#e00000'
  },
  productionSection: {
    alignSelf: 'stretch',
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#555555'
  },
  productionTitle: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e00000',
    paddingBottom: 7
  },
  producer: {
    color: '#d2d2d2',
    fontSize: 15,
    lineHeight: 25,
    paddingHorizontal: 8
  },
  message: {
    color: '#c9c9c9',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12
  },
  error: {
    color: '#ff6666',
    textAlign: 'center',
    marginVertical: 12
  },
  loadingSmall: {
    marginTop: 12
  },
  pressed: {
    opacity: 0.65
  },
  reviewButton: { 
    minWidth: 190, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#c40000', marginTop: 26, paddingHorizontal: 20 
  },
  reviewText: { 
    color: '#ffffff', fontFamily: 'serif', fontSize: 12, fontWeight: '700' 
  },
});
