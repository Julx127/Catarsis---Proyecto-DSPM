import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const likedWorks = [
  { title: 'Hamilton', image: require('../../assets/images/Imagenes Catarsis/CartelHamilton.png') },
  { title: 'The Guy Who Didn\'t Like Musicals', image: require('../../assets/images/Imagenes Catarsis/CartelTheGuyWhoDidntLikeMusicals.png') },
];

export default function LikesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>VOLVER AL PERFIL</Text></Pressable>
          <Text style={styles.kicker}>MI PERFIL</Text>
          <Text style={styles.title}>Likes</Text>
          <Text style={styles.subtitle}>Las obras y publicaciones que recomendaste.</Text>
          {likedWorks.map((work) => (
            <Pressable key={work.title} onPress={() => router.push({ pathname: '/work-detail', params: { title: work.title } })} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Image source={work.image} contentFit="contain" style={styles.poster} />
              <View style={styles.copy}><Text style={styles.workTitle}>{work.title}</Text><Text style={styles.like}>♥ Te gusta esta obra</Text></View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  poster: { width: 106, height: 106 },
  copy: { flex: 1 },
  workTitle: { color: '#ffffff', fontFamily: 'serif', fontSize: 17, fontWeight: '700' },
  like: { color: '#e00000', fontFamily: 'serif', fontSize: 13, marginTop: 8 },
  pressed: { opacity: 0.72 },
});
