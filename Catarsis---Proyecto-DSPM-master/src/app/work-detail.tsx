import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const posterByTitle: Record<string, number> = {
  Chicago: require('../../assets/images/Imagenes Catarsis/CartelChicago.png'),
  Hamilton: require('../../assets/images/Imagenes Catarsis/CartelHamilton.png'),
  'Maybe Happy Ending': require('../../assets/images/Imagenes Catarsis/CartelMaybeHappyEnding.png'),
  Six: require('../../assets/images/Imagenes Catarsis/CartelSix.png'),
  'The Book of Mormon': require('../../assets/images/Imagenes Catarsis/CartelTheBookOfMormon.png'),
  "The Guy Who Didn't Like Musicals": require('../../assets/images/Imagenes Catarsis/CartelTheGuyWhoDidntLikeMusicals.png'),
};

const producersByTitle: Record<string, string[]> = {
  Chicago: ['Nickname 1', 'Nickname 2', 'Nickname 3'],
  Hamilton: ['Nickname 1', 'Nickname 2', 'Nickname 3'],
  'Maybe Happy Ending': ['Nickname 1', 'Nickname 2', 'Nickname 3'],
  Six: ['Nickname 1', 'Nickname 2', 'Nickname 3'],
  'The Book of Mormon': ['Nickname 1', 'Nickname 2', 'Nickname 3'],
  "The Guy Who Didn't Like Musicals": ['Nickname 1', 'Nickname 2', 'Nickname 3'],
};

export default function WorkDetailScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const workTitle = title || 'Obra seleccionada';
  const producers = producersByTitle[workTitle] || ['Nickname 1', 'Nickname 2', 'Nickname 3'];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable accessibilityRole="button" onPress={() => router.replace('/works')} style={styles.backButton}>
            <Text style={styles.backText}>VOLVER A OBRAS</Text>
          </Pressable>
          <Image
            source={posterByTitle[workTitle] || posterByTitle.Chicago}
            contentFit="contain"
            style={styles.poster}
          />
          <Text style={styles.kicker}>OBRA TEATRAL</Text>
          <Text style={styles.title}>{workTitle}</Text>
          <View style={styles.productionSection}>
            <Text style={styles.productionTitle}>Produccion</Text>
            {producers.map((producer) => (
              <Text key={producer} style={styles.producer}>
                {producer}
              </Text>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/comments', params: { title: workTitle } })}
            style={({ pressed }) => [styles.reviewButton, pressed && styles.pressed]}>
            <Text style={styles.reviewText}>DEJAR COMENTARIO</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  safeArea: { flex: 1 },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', alignItems: 'center', padding: 22, paddingBottom: 120 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 4, marginBottom: 20 },
  backText: { color: '#d8d8d8', fontFamily: 'serif', fontSize: 11, fontWeight: '700' },
  poster: { width: 210, aspectRatio: 1, borderRadius: 8 },
  kicker: { color: '#e00000', fontFamily: 'serif', fontSize: 12, fontWeight: '700', letterSpacing: 1.4, marginTop: 24 },
  title: { color: '#ffffff', fontFamily: 'serif', fontSize: 32, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  productionSection: { alignSelf: 'stretch', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#555555' },
  productionTitle: { color: '#e00000', fontFamily: 'serif', fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  producer: { color: '#d2d2d2', fontFamily: 'serif', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  reviewButton: { minWidth: 190, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#c40000', marginTop: 26, paddingHorizontal: 20 },
  reviewText: { color: '#ffffff', fontFamily: 'serif', fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.72 },
});
