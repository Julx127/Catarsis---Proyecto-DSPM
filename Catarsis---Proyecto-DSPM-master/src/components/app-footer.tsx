import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

const footerImages = {
  works: require('../../assets/images/Imagenes Catarsis/MenuFooterMascarasRojas.png'),
  community: require('../../assets/images/Imagenes Catarsis/MenuFooterComunidadRojo.png'),
  profile: require('../../assets/images/Imagenes Catarsis/MenuFooterPerfilRojo.png'),
};

const footerRoutes = ['/works', '/community', '/profile', '/favorites', '/watched', '/likes', '/work-detail', '/comments'];

export function AppFooter() {
  const pathname = usePathname();
  const isVisible = footerRoutes.some((route) => pathname === route);

  if (!isVisible) {
    return null;
  }

  const activeImage = pathname === '/community' ? footerImages.community : pathname === '/profile' || pathname === '/favorites' || pathname === '/watched' || pathname === '/likes' ? footerImages.profile : footerImages.works;

  return (
    <View style={styles.footer}>
      <Image source={activeImage} contentFit="fill" style={styles.footerImage} />
      <Pressable accessibilityLabel="Obras" onPress={() => router.replace('/works')} style={styles.worksTarget} />
      <Pressable accessibilityLabel="Comunidad" onPress={() => router.replace('/community')} style={styles.communityTarget} />
      <Pressable accessibilityLabel="Perfil" onPress={() => router.replace('/profile')} style={styles.profileTarget} />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { position: 'absolute', bottom: 0, width: '100%', maxWidth: 520, alignSelf: 'center', aspectRatio: 1077 / 235, backgroundColor: '#202020' },
  footerImage: { width: '100%', height: '100%' },
  worksTarget: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '33.333%' },
  communityTarget: { position: 'absolute', left: '33.333%', top: 0, bottom: 0, width: '33.333%' },
  profileTarget: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '33.333%' },
});
