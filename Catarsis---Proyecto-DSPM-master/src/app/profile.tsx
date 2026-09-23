import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import { getCurrentUser, isAdmin } from '@/constants/session';
import { closeSession } from '@/constants/session';
async function handleLogout() {
  await closeSession();
  router.replace('/');
}

const profileSections = [
  { label: 'OBRAS VISTAS', description: 'Funciones que ya disfrutaste', route: '/watched' as const },
  { label: 'FAVORITOS', description: 'Tus obras guardadas', route: '/favorites' as const },
  { label: 'LIKES', description: 'Tus recomendaciones', route: '/likes' as const },
];

export default function ProfileScreen() {
  const [username, setUsername] = useState('Nickname');
  const [adminUser, setAdminUser] = useState(false);

  useEffect(() => {
    getCurrentUser().then((nombre) => {
      if (nombre) {
        setUsername(nombre);
      }
    });

    isAdmin().then((admin) => {
      setAdminUser(admin);
    });
  }, []);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <Pressable onPress={handleLogout} style={styles.backButton}>
            <Text style={styles.backText}>CERRAR SESION</Text>
          </Pressable>

          <View style={styles.profileHeader}>
            <Image source={require('../../assets/images/Imagenes Catarsis/Perfil.png')} contentFit="contain" style={styles.avatar} />
            <View style={styles.headerCopy}><Text style={styles.kicker}>MI CUENTA</Text><Text style={styles.title}>Perfil</Text><Text style={styles.nickname}>{username}</Text></View>
          </View>
          <Text style={styles.bio}>Tu espacio para guardar, calificar y compartir tus experiencias teatrales.</Text>
          <Text style={styles.sectionTitle}>Mi actividad</Text>
          <View style={styles.sections}>
            {profileSections.map((section) => (
              <Pressable key={section.label} onPress={() => router.push(section.route)} style={({ pressed }) => [styles.section, pressed && styles.pressed]}>
                <View><Text style={styles.sectionLabel}>{section.label}</Text><Text style={styles.sectionDescription}>{section.description}</Text></View>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={() => router.push('/works')} style={styles.worksButton}><Text style={styles.worksButtonText}>EXPLORAR OBRAS</Text></Pressable>
          {adminUser && <Pressable onPress={() => router.push('/admin')} style={styles.adminButton}><Text style={styles.adminButtonText}>PANEL DE ADMINISTRACION</Text></Pressable>}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 120 },
  backButton: { paddingVertical: 8, marginBottom: 28 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  avatar: { width: 90, height: 90 },
  headerCopy: { flex: 1 },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 36, fontWeight: '700', marginTop: 2 },
  nickname: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 15, marginTop: 3 },
  bio: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 14, lineHeight: 20, marginTop: 22 },
  sectionTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 21, fontWeight: '700', marginTop: 32, marginBottom: 12 },
  sections: { borderTopWidth: 1, borderTopColor: '#555555' },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#555555', paddingVertical: 17 },
  sectionLabel: { color: '#ffffff', fontFamily: 'serif', fontSize: 15, fontWeight: '700' },
  sectionDescription: { color: '#aaa', fontFamily: 'serif', fontSize: 13, marginTop: 4 },
  arrow: { color: '#e00000', fontSize: 30, fontWeight: '300' },
  worksButton: { alignSelf: 'center', borderRadius: 20, backgroundColor: '#c40000', paddingHorizontal: 22, paddingVertical: 12, marginTop: 28 },
  worksButtonText: { color: '#ffffff', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  adminButton: { alignSelf: 'center', borderWidth: 1, borderColor: '#777777', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 11, marginTop: 12 },
  adminButtonText: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 10, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
