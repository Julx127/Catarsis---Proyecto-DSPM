import { router } from 'expo-router';
import {Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';

import { posteos } from '@/interfaces/interfaces';
import { etiquetas } from '@/interfaces/interfaces';
import { posteos_etiquetas } from '@/interfaces/interfaces';
import { usuarios } from '@/interfaces/interfaces';

export default function CommunityScreen() {

  const [posteos, setPosteos] = useState<posteos[]>([]);
  useEffect(() => {
    fetch('http://10.238.140.45:5000/posteos')
      .then((response) => response.json())
      .then((data) => setPosteos(data))
      .catch((error) =>
        console.error('Error al obtener datos:', error)
      );
  }, []);


  const [etiquetas, setEtiquetas] = useState<etiquetas[]>([]);
  useEffect(() => {
    fetch('http://10.238.140.45:5000/etiquetas')
      .then((response) => response.json())
      .then((data) => setEtiquetas(data))
      .catch((error) =>
        console.error('Error al obtener datos:', error)
      );
  }, []);


  const [posteos_etiquetas, setPosteos_etiquetas] =useState<posteos_etiquetas[]>([]);
  useEffect(() => {
    fetch('http://10.238.140.45:5000/posteos_etiquetas')
      .then((response) => response.json())
      .then((data) => setPosteos_etiquetas(data))
      .catch((error) =>
        console.error('Error al obtener datos:', error)
      );
  }, []);


  const [usuarios, setUsuarios] = useState<usuarios[]>([]);
  useEffect(() => {
    fetch('http://10.238.140.45:5000/usuarios')
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch((error) =>
        console.error('Error al obtener datos:', error)
      );
  }, []);


  // Funcion para buscar etiquetas del posteo
  const obtenerEtiquetas = (idPosteo: number): etiquetas[] => {

    const relaciones = posteos_etiquetas.filter(
      (relacion) =>
        relacion.posteos_idposteos === idPosteo
    );

    const etiquetasDelPosteo = relaciones
      .map((relacion) =>
        etiquetas.find(
          (etiqueta) =>
            etiqueta.idetiquetas ===
            relacion.etiquetas_idetiquetas
        )
      )
      .filter(
        (etiqueta): etiqueta is etiquetas =>
          etiqueta !== undefined
      );

    return etiquetasDelPosteo;
  };


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.kicker}>
            RED TEATRAL
          </Text>
          <Text style={styles.title}>
            Comunidad
          </Text>
          <Text style={styles.subtitle}>
            Compartí tus impresiones y descubrí nuevas recomendaciones.
          </Text>

          <TextInput
            placeholder="Buscar por palabra o hashtag..."
            placeholderTextColor="#b8b8b8"
            style={styles.search}
          />

          <Pressable style={styles.publish}>
            <Text style={styles.publishText}>
              PUBLICAR OPINION
            </Text>
          </Pressable>

          {posteos.map((posteo) => {
            const etiquetasDelPosteo =
              obtenerEtiquetas(posteo.idposteos);

            return (
              <View
                key={posteo.idposteos}
                style={styles.post}
              >
                <Text style={styles.user}>
                  {usuarios.find(
                    (usuario) =>
                      usuario.idusuarios ===
                      posteo.usuarios_idusuarios
                  )?.username}
                </Text>

                <Text style={styles.postText}>
                  {posteo.contenido}
                </Text>

                <Text style={styles.postDate}>
                  {new Date(
                    posteo.fecha_creacion
                  ).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </Text>

                <View style={styles.tags}>
                  {etiquetasDelPosteo.map((etiqueta) => (
                    <Text
                      key={etiqueta.idetiquetas}
                      style={styles.tag}
                    >
                      #{etiqueta.nombre}
                    </Text>
                  ))}
                </View>


                <View style={styles.postActions}>
                  <Text style={styles.action}>
                    ♡ Me gusta
                  </Text>
                </View>
              </View>
            );
          })}

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
    fontSize: 34,
    fontWeight: '700',
    marginTop: 3
  },

  subtitle: {
    color: '#c9c9c9',
    fontFamily: 'serif',
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

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },

  tag: {
    color: '#e00000',
    fontFamily: 'serif',
    fontSize: 13
  },

  postActions: {
    flexDirection: 'row',
    gap: 22,
    marginTop: 14
  },

  action: {
    color: '#bdbdbd',
    fontFamily: 'serif',
    fontSize: 12
  }

});