import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFooter } from '@/components/app-footer';
import { AppThemeProvider, useAppTheme } from '@/components/app-theme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [fontsLoaded, fontError] = useFonts({
    RocaOne: require('../../assets/fonts/RocaOne-Rg.ttf'),
    RocaTwo: require('../../assets/fonts/RocaTwo-Rg.ttf'),
    Montserrat: require('../../assets/fonts/Montserrat-Regular.ttf')
  });

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AppThemeProvider>
      <ThemedNavigation />
    </AppThemeProvider>
  );
}

function ThemedNavigation() {
  const { mode } = useAppTheme();

  return (
    <ThemeProvider value={mode === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      <AppFooter />
    </ThemeProvider>
  );
}
