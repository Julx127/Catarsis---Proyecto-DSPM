import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const watched = [
  { title: 'Maybe Happy Ending', image: require('../../assets/images/Imagenes Catarsis/CartelMaybeHappyEnding.png'), rating: '4 / 5' },
  { title: 'The Book of Mormon', image: require('../../assets/images/Imagenes Catarsis/CartelTheBookOfMormon.png'), rating: '5 / 5' },
];

export default function WatchedScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>VOLVER</Text></Pressable>
          <Text style={styles.kicker}>MI PERFIL</Text>
          <Text style={styles.title}>Obras vistas</Text>
          <Text style={styles.subtitle}>El registro de tus funciones y calificaciones.</Text>
          {watched.map((work) => (
            <Pressable key={work.title} onPress={() => router.push({ pathname: '/work-detail', params: { title: work.title } })} style={styles.row}>
              <Image source={work.image} contentFit="contain" style={styles.poster} />
              <View style={styles.copy}><Text style={styles.workTitle}>{work.title}</Text><Text style={styles.rating}>★ {work.rating}</Text><Text style={styles.date}>Marcada como vista</Text></View>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 22, paddingBottom: 120 },
  backButton: { paddingVertical: 8, marginBottom: 26 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 34, fontWeight: '700', marginTop: 3 },
  subtitle: { color: '#c9c9c9', fontFamily: 'serif', fontSize: 14, lineHeight: 20, marginTop: 4, marginBottom: 28 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  poster: { width: 106, height: 106 },
  copy: { flex: 1 },
  workTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 18, fontWeight: '700' },
  rating: { color: '#e00000', fontFamily: 'serif', fontSize: 16, fontWeight: '700', marginTop: 8 },
  date: { color: '#bdbdbd', fontFamily: 'serif', fontSize: 13, marginTop: 7 },
});
