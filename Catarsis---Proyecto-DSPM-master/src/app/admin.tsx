import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';

import { API_URL } from '@/constants/config';

interface Obra {
  idobras: number;
  titulo: string;
  autor: string;
  sinopsis: string;
  portada: string;
}

interface ProduccionFormulario {
  ubicacion: string;
  anio: string;
}

const nuevaProduccion = (): ProduccionFormulario => ({
  ubicacion: '',
  anio: '',
});

export default function AdminScreen() {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [sinopsis, setSinopsis] = useState('');
  const [portada, setPortada] = useState('');
  const [producciones, setProducciones] = useState<ProduccionFormulario[]>([
    nuevaProduccion(),
  ]);

  const [obras, setObras] = useState<Obra[]>([]);
  const [publicando, setPublicando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [cargandoObras, setCargandoObras] = useState(true);

  const cargarObras = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/obras`);

      if (!response.ok) {
        throw new Error('No se pudieron obtener las obras.');
      }

      const data: Obra[] = await response.json();
      setObras(data);
    } catch (error) {
      console.error('Error al cargar las obras:', error);
      Alert.alert('Error', 'No se pudieron cargar las obras vigentes.');
    } finally {
      setCargandoObras(false);
    }
  }, []);

  useEffect(() => {
    cargarObras();
  }, [cargarObras]);

  // Agregar una nueva producción al formulario.
  function agregarProduccion() {
    setProducciones((actuales) => [...actuales, nuevaProduccion()]);
  }

  // Modificar la ubicación o el año de una producción.
  function actualizarProduccion(
    indice: number,
    campo: keyof ProduccionFormulario,
    valor: string
  ) {
    setProducciones((actuales) =>
      actuales.map((produccion, i) =>
        i === indice
          ? { ...produccion, [campo]: valor }
          : produccion
      )
    );
  }

  // Eliminar una producción del formulario.
  function quitarProduccion(indice: number) {
    setProducciones((actuales) =>
      actuales.filter((_, i) => i !== indice)
    );
  }

  // Limpiar el formulario después de publicar correctamente.
  function limpiarFormulario() {
    setTitulo('');
    setAutor('');
    setSinopsis('');
    setPortada('');
    setProducciones([nuevaProduccion()]);
  }

  async function publicarObra() {
    Keyboard.dismiss();

    if (
      !titulo.trim() ||
      !autor.trim() ||
      !sinopsis.trim() ||
      !portada.trim()
    ) {
      Alert.alert(
        'Campos incompletos',
        'Completá el título, autor, sinopsis y URL de la portada.'
      );
      return;
    }

    const urlValida = /^https?:\/\/\S+$/i.test(portada.trim());

    if (!urlValida) {
      Alert.alert(
        'URL inválida',
        'Ingresá una dirección de imagen que comience con http:// o https://.'
      );
      return;
    }

    const produccionesValidas = producciones.every((p) => {
      const anio = Number(p.anio);

      return (
        p.ubicacion.trim().length > 0 &&
        /^\d{4}$/.test(p.anio.trim()) &&
        Number.isInteger(anio) &&
        anio >= 1000 &&
        anio <= 9999
      );
    });

    if (!produccionesValidas) {
      Alert.alert(
        'Producciones incompletas',
        'Cada producción necesita una ubicación y un año de cuatro cifras.'
      );
      return;
    }

    setPublicando(true);

    try {
      const response = await fetch(`${API_URL}/obras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: titulo.trim(),
          autor: autor.trim(),
          sinopsis: sinopsis.trim(),
          portada: portada.trim(),
          producciones: producciones.map((p) => ({
            ubicacion: p.ubicacion.trim(),
            anio: Number(p.anio),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo publicar la obra.');
      }

      limpiarFormulario();
      await cargarObras();

      Alert.alert('¡Publicada!', 'La obra se guardó correctamente.');
    } catch (error) {
      console.error('Error al publicar la obra:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el servidor.'
      );
    } finally {
      setPublicando(false);
    }
  }

  function confirmarEliminacion(obra: Obra) {
    Alert.alert(
      'Eliminar obra',
      `¿Querés eliminar "${obra.titulo}"? También se borrarán sus producciones, interacciones y reseñas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarObra(obra.idobras),
        },
      ]
    );
  }

  async function eliminarObra(id: number) {
    setEliminandoId(id);

    try {
      const response = await fetch(`${API_URL}/obras/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'No se pudo eliminar la obra.');
      }

      setObras((actuales) =>
        actuales.filter((obra) => obra.idobras !== id)
      );

      Alert.alert('Obra eliminada', 'La obra se eliminó correctamente.');
    } catch (error) {
      console.error('Error al eliminar la obra:', error);

      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el servidor.'
      );
    } finally {
      setEliminandoId(null);
    }
  }

  const urlPortadaValida = /^https?:\/\/\S+$/i.test(portada.trim());

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER</Text>
          </Pressable>

          <Text style={styles.title}>Publicación de obras</Text>

          <Pressable
            onPress={() => router.push('/works')}
            style={styles.viewWorksButton}
          >
            <Text style={styles.viewWorksText}>VER OBRAS</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Datos de la obra</Text>

          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Título de la obra"
            placeholderTextColor="#b8b8b8"
            style={styles.input}
            maxLength={200}
          />

          <TextInput
            value={autor}
            onChangeText={setAutor}
            placeholder="Autor"
            placeholderTextColor="#b8b8b8"
            style={styles.input}
            maxLength={200}
          />

          <TextInput
            value={sinopsis}
            onChangeText={setSinopsis}
            placeholder="Sinopsis"
            placeholderTextColor="#b8b8b8"
            multiline
            style={[styles.input, styles.descriptionInput]}
          />

          <TextInput
            value={portada}
            onChangeText={setPortada}
            placeholder="URL de la portada"
            placeholderTextColor="#b8b8b8"
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          {urlPortadaValida && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Vista previa</Text>
              <Image
                source={{ uri: portada.trim() }}
                contentFit="contain"
                style={styles.previewImage}
                onError={() => {
                  console.warn('No se pudo cargar la imagen de portada.');
                }}
              />
            </View>
          )}

          <Text style={styles.sectionTitle}>Producciones</Text>

          {producciones.map((produccion, indice) => (
            <View key={indice} style={styles.productionCard}>
              <View style={styles.productionHeader}>
                <Text style={styles.productionLabel}>
                  Producción {indice + 1}
                </Text>

                {producciones.length > 1 && (
                  <Pressable onPress={() => quitarProduccion(indice)}>
                    <Text style={styles.removeProductionText}>QUITAR</Text>
                  </Pressable>
                )}
              </View>

              <TextInput
                value={produccion.ubicacion}
                onChangeText={(valor) =>
                  actualizarProduccion(indice, 'ubicacion', valor)
                }
                placeholder="Ubicación"
                placeholderTextColor="#b8b8b8"
                style={styles.input}
              />

              <TextInput
                value={produccion.anio}
                onChangeText={(valor) =>
                  actualizarProduccion(
                    indice,
                    'anio',
                    valor.replace(/[^0-9]/g, '').slice(0, 4)
                  )
                }
                placeholder="Año de estreno"
                placeholderTextColor="#b8b8b8"
                keyboardType="number-pad"
                maxLength={4}
                style={[styles.input, styles.lastInput]}
              />
            </View>
          ))}

          <Pressable
            onPress={agregarProduccion}
            style={styles.addProduction}
          >
            <Text style={styles.addProductionText}>
              ＋ AGREGAR PRODUCCIÓN
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              onPress={limpiarFormulario}
              disabled={publicando}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Limpiar</Text>
            </Pressable>

            <Pressable
              onPress={publicarObra}
              disabled={publicando}
              style={[
                styles.publishButton,
                publicando && styles.disabledButton,
              ]}
            >
              <Text style={styles.publishText}>
                {publicando ? 'Publicando...' : 'Publicar obra'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Obras vigentes</Text>

          {cargandoObras ? (
            <Text style={styles.statusText}>Cargando obras...</Text>
          ) : obras.length === 0 ? (
            <Text style={styles.statusText}>
              Todavía no hay obras registradas.
            </Text>
          ) : (
            <View style={styles.activeWorks}>
              {obras.map((obra) => (
                <View key={obra.idobras} style={styles.workRow}>
                  <View style={styles.workCopy}>
                    <Text style={styles.workName}>{obra.titulo}</Text>
                    <Text style={styles.workAuthor}>{obra.autor}</Text>
                  </View>

                  <Pressable
                    onPress={() => confirmarEliminacion(obra)}
                    disabled={eliminandoId === obra.idobras}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>
                      {eliminandoId === obra.idobras
                        ? 'ELIMINANDO...'
                        : 'ELIMINAR'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
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
    paddingBottom: 60,
  },
  backButton: { paddingVertical: 8, marginBottom: 18 },
  backText: {
    color: '#d8d8d8',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontFamily: 'RocaOne',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 22,
  },
  viewWorksButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#8f0000',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginTop: -10,
    marginBottom: 18,
  },
  viewWorksText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'RocaTwo',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 12,
  },
  input: {
    minHeight: 45,
    borderRadius: 6,
    backgroundColor: '#3c3c3c',
    borderWidth: 1,
    borderColor: '#696969',
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  descriptionInput: {
    height: 110,
    paddingTop: 13,
    textAlignVertical: 'top',
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#292929',
    borderRadius: 8,
  },
  previewTitle: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 13,
    marginBottom: 10,
  },
  previewImage: {
    width: 180,
    height: 220,
    borderRadius: 5,
  },
  productionCard: {
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#292929',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444444',
  },
  productionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productionLabel: {
    color: '#ffffff',
    fontFamily: 'RocaTwo',
    fontSize: 15,
    fontWeight: '700',
  },
  removeProductionText: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 10,
    fontWeight: '700',
  },
  lastInput: { marginBottom: 0 },
  addProduction: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 10,
  },
  addProductionText: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
    marginBottom: 14,
  },
  cancelButton: {
    minWidth: 104,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#777777',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  cancelText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
  },
  publishButton: {
    minWidth: 125,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#c40000',
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  publishText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
  },
  disabledButton: { opacity: 0.6 },
  activeWorks: { borderTopWidth: 1, borderTopColor: '#555555' },
  workRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555555',
    paddingVertical: 13,
  },
  workCopy: { flex: 1 },
  workName: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: '700',
  },
  workAuthor: {
    color: '#bdbdbd',
    fontFamily: 'serif',
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#c40000',
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 9,
    fontWeight: '700',
  },
  statusText: {
    color: '#c9c9c9',
    fontFamily: 'serif',
    fontSize: 14,
    paddingVertical: 16,
  },
});