import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { startSession } from '@/constants/session';
import { usuarios } from '@/interfaces/interfaces';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // logica de iniciar sesion
  function handleLogin() {
    if (!username || !password) {
      alert('Completá todos los campos');
      return;
    }

    fetch('http://10.238.140.45:5000/usuarios/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.trim(),
        password: password
      })
    })

      .then((response) => response.json())
      .then(async (data) => {
        if (!data.idusuarios) {
          alert(data.mensaje || 'Usuario o contraseña incorrectos');
          return;
        }
        const usuario: usuarios = data;
        await startSession(usuario);
        router.replace('./works');
      })

      .catch((error) => {
        console.error(
          'Error al iniciar sesión:',
          error
        );
        alert('No se pudo conectar con el servidor');
      });
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>VOLVER</Text>
          </Pressable>
          <Image
            source={require('../../assets/images/Imagenes Catarsis/LogoCatarsis.png')}
            contentFit="contain"
            style={styles.logo}
          />
          <Text style={styles.title}>Iniciar Sesion</Text>
          <Text style={styles.subtitle}>Bienvenido de vuelta</Text>

          <View style={styles.form}>
            <TextInput value={username} onChangeText={setUsername} placeholder="Nombre de usuario o correo" placeholderTextColor="#b4b4b4" autoCapitalize="none" style={styles.input} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Contraseña" placeholderTextColor="#b4b4b4" secureTextEntry style={styles.input} />
            <Pressable
              onPress={handleLogin}
              style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}>
              <Text style={styles.confirmText}>CONFIRMAR</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#282828' },
  safeArea: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  backButton: { position: 'absolute', top: 18, left: 28, paddingVertical: 8, paddingHorizontal: 4 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  logo: { width: 88, height: 88 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 30, fontWeight: '700', marginTop: 10 },
  subtitle: { color: '#d5d5d5', fontFamily: 'serif', fontSize: 14, marginTop: 4 },
  form: { width: '100%', maxWidth: 320, gap: 12, marginTop: 30 },
  input: { height: 44, borderRadius: 22, backgroundColor: '#8b8b8b', color: '#ffffff', paddingHorizontal: 20, fontFamily: 'serif', fontSize: 13 },
  confirmButton: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#c40000', marginTop: 8 },
  confirmText: { color: '#ffffff', fontFamily: 'serif', fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
