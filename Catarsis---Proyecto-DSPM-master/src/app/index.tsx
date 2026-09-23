import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { getSession } from '@/constants/session';

export default function HomeScreen() {
  useEffect(() => {
    async function verificarSesion() {
      const sesionIniciada = await getSession();
      if (sesionIniciada) {
        router.replace('/works');
      }
    }
    verificarSesion();
  }, []);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.stage}>
          <View style={styles.redCurtain} />
          <View style={styles.darkCurtain} />

          <View style={styles.content}>
            <Image
              source={require('../../assets/images/Imagenes Catarsis/LogoCatarsis.png')}
              contentFit="contain"
              style={styles.logo}
            />
            <Image
              source={require('../../assets/images/Imagenes Catarsis/Titulo Catarsis.png')}
              contentFit="contain"
              style={styles.titleImage}
            />

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/register')}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                <Text style={styles.actionText}>REGISTRARSE</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/login')}
                style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                <Text style={styles.actionText}>INICIAR SESION</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>Todos los Derechos Reservados</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  stage: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    minHeight: 640,
    overflow: 'hidden',
    backgroundColor: '#282828',
  },
  redCurtain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
    backgroundColor: '#c40000',
  },
  darkCurtain: {
    position: 'absolute',
    top: '53%',
    left: -80,
    right: -80,
    height: '48%',
    borderRadius: 240,
    backgroundColor: '#282828',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 80,
    gap: 14,
  },
  logo: {
    width: 116,
    height: 116,
  },
  titleImage: {
    width: 190,
    height: 82,
  },
  actions: {
    width: '100%',
    maxWidth: 220,
    gap: 12,
    marginTop: 18,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#8b8b8b',
    borderWidth: 1,
    borderColor: '#b8b8b8',
  },
  actionText: {
    color: '#ffffff',
    fontFamily: 'serif',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pressed: {
    opacity: 0.7,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    color: '#e2e2e2',
    fontFamily: 'serif',
    fontSize: 9,
    textAlign: 'center',
  },
});
