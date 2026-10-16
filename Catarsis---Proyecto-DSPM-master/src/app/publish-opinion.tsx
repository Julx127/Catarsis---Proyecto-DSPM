import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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

const MAX_LENGTH = 2000;

export default function PublishOpinionScreen() {
  const [contenido, setContenido] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState('');

  async function publicarOpinion() {
    const texto = contenido.trim();
    if (!texto) {
      setError('Escribí tu opinión antes de publicarla.');
      return;
    }
    if (publicando) return;

    setPublicando(true);
    setError('');
    try {
      const usuarioId = await getCurrentUserId();
      if (usuarioId === null) {
        throw new Error('Tenés que iniciar sesión para publicar una opinión.');
      }

      const respuesta = await fetch(`${API_URL}/posteos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId, contenido: texto })
      });
      await readApiJson(respuesta);

      router.replace('/community');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error al publicar.');
    } finally {
      setPublicando(false);
    }
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
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>VOLVER A COMUNIDAD</Text>
          </Pressable>

          <Text style={styles.kicker}>RED TEATRAL</Text>
          <Text style={styles.title}>Publicar opinión</Text>
          <Text style={styles.subtitle}>
            Contale a la comunidad qué pensás. Añadí hashtags, por ejemplo #teatro o #musical.
          </Text>

          <TextInput
            value={contenido}
            onChangeText={setContenido}
            multiline
            maxLength={MAX_LENGTH}
            placeholder="Escribí tu opinión y agregá #hashtags..."
            placeholderTextColor="#b8b8b8"
            style={styles.input}
            textAlignVertical="top"
            accessibilityLabel="Escribí tu opinión"
          />
          <Text style={styles.characterCount}>
            {contenido.length}/{MAX_LENGTH}
          </Text>

          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <Pressable
            accessibilityRole="button"
            disabled={publicando}
            onPress={publicarOpinion}
            style={({ pressed }) => [
              styles.publishButton,
              pressed && styles.pressed,
              publicando && styles.disabled
            ]}
          >
            {publicando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.publishText}>PUBLICAR OPINION</Text>
            )}
          </Pressable>
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
    paddingBottom: 120
  },
  backButton: { paddingVertical: 8, marginBottom: 24 },
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
    fontFamily: 'RocaOne',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 3
  },
  subtitle: {
    color: '#c9c9c9',
    fontFamily: 'RocaTwo',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20
  },
  input: {
    minHeight: 190,
    borderRadius: 8,
    backgroundColor: '#3c3c3c',
    borderWidth: 1,
    borderColor: '#696969',
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 15,
    lineHeight: 22,
    padding: 16
  },
  characterCount: {
    color: '#aaaaaa',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 6
  },
  publishButton: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#c40000',
    paddingHorizontal: 20,
    marginTop: 18
  },
  publishText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700'
  },
  error: { color: '#ff7777', fontSize: 13, marginTop: 12 },
  disabled: { opacity: 0.6 },
  pressed: { opacity: 0.72 }
});
