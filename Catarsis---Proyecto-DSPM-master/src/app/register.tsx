import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { usuarios } from '@/interfaces/interfaces';

export default function RegisterScreen() {

  const [usuario, setUsuario] = useState<usuarios>({
    idusuarios: 0,
    username: '',
    email: '',
    password: '',
    admin: false
  });

  const registrarUsuario = () => {
    if (
      usuario.username === '' ||
      usuario.email === '' ||
      usuario.password === ''
    ) {
      alert('Completá todos los campos');
      return;
    }

    fetch('http://10.238.140.45:5000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: usuario.username,
        email: usuario.email,
        password: usuario.password
      })
    })

      .then((response) => response.json())
      .then((data) => {
        if (data.mensaje) {
          alert(data.mensaje);
        }
        if (data.idusuarios) {
          router.replace('/login');
        }
      })
      .catch((error) =>
        console.error('Error al registrar usuario:', error)
      );
  };

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
            <Text style={styles.backText}>
              VOLVER
            </Text>
          </Pressable>
          <Image
            source={require('../../assets/images/Imagenes Catarsis/LogoCatarsis.png')}
            contentFit="contain"
            style={styles.logo}
          />
          <Text style={styles.title}>
            Registrarse
          </Text>
          <Text style={styles.subtitle}>
            Forma parte de la red teatral
          </Text>
          <View style={styles.form}>
            <TextInput
              placeholder="Nombre de usuario"
              placeholderTextColor="#b4b4b4"
              style={styles.input}
              value={usuario.username}
              onChangeText={(texto) =>
                setUsuario({
                  ...usuario,
                  username: texto
                })
              }
            />
            <TextInput
              placeholder="Correo electronico"
              placeholderTextColor="#b4b4b4"
              keyboardType="email-address"
              style={styles.input}
              value={usuario.email}
              onChangeText={(texto) =>
                setUsuario({
                  ...usuario,
                  email: texto
                })
              }
            />

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#b4b4b4"
              secureTextEntry
              style={styles.input}
              value={usuario.password}
              onChangeText={(texto) =>
                setUsuario({
                  ...usuario,
                  password: texto
                })
              }
            />


            <Pressable
              onPress={registrarUsuario}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.pressed
              ]}
            >
              <Text style={styles.confirmText}>
                CONFIRMAR
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#282828'
  },

  safeArea: {
    flex: 1
  },

  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4
  },

  backText: {
    color: '#d8d8d8',
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: '700'
  },

  logo: {
    width: 88,
    height: 88,
    marginTop: 6
  },

  title: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10
  },

  subtitle: {
    color: '#d5d5d5',
    fontFamily: 'serif',
    fontSize: 14,
    marginTop: 4
  },

  form: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 30
  },

  input: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8b8b8b',
    color: '#ffffff',
    paddingHorizontal: 20,
    fontFamily: 'serif',
    fontSize: 13
  },

  confirmButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#c40000',
    marginTop: 8
  },

  confirmText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 13,
    fontWeight: '700'
  },

  pressed: {
    opacity: 0.7
  }

});