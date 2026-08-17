import { Tabs } from 'expo-router';
import { BookOpen, Compass, HandHeart, Home, Menu } from 'lucide-react-native';
import { useTranslation } from '../../src/lib/i18n';
import { useTheme } from '../../src/theme/components';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.navActive,
        tabBarInactiveTintColor: theme.colors.navInactive,
        sceneStyle: { backgroundColor: theme.colors.bg },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          // Soft elevation instead of the default hairline rule.
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 8,
          height: 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
        },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: t('tabs.quran'),
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="duas"
        options={{
          title: t('tabs.duas'),
          tabBarIcon: ({ color }) => <HandHeart size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: t('tabs.qibla'),
          tabBarIcon: ({ color }) => <Compass size={22} color={color} strokeWidth={1.75} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tabs.more'),
          tabBarIcon: ({ color }) => <Menu size={22} color={color} strokeWidth={1.75} />,
        }}
      />
    </Tabs>
  );
}
