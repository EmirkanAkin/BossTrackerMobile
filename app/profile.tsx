import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, RefreshCw, Users, LogOut } from 'lucide-react-native';
import { PinDisplay, Label, Hairline, TorchToggle, KButton, RoleBadge } from '@/components/kulliyat/primitives';
import { useAppContext } from '@/lib/kulliyat/context';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    connected,
    activeRole,
    activeHunterId,
    disconnectWorld,
    harlat,
    setHarlat,
  } = useAppContext();

  const handleBack = () => router.back();
  const handleToggleHarlat = () => setHarlat(!harlat);
  const handleReturnHome = async () => {
    await disconnectWorld();
    router.replace('/home');
  };
  const handleOpenPairing = () => {
    router.push('/pairing');
  };

  const role = activeRole === 'observer' ? 'gozlemci' : 'yoldas';

  return (
    <View className="flex-1" style={{ backgroundColor: '#0B0A08' }}>
      <View className="flex-row items-center gap-3 px-4 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <TouchableOpacity onPress={handleBack} activeOpacity={0.8} className="flex h-9 w-9 items-center justify-center">
          <ChevronLeft size={22} color="#7C735F" />
        </TouchableOpacity>
        <Text
          className="font-black text-base uppercase tracking-[2px]"
          style={{ color: '#D6C8A6' }}
        >
          Dünya & Ayarlar
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pb-6 pt-4">
        {connected && (
          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-3 justify-center">
              <Label>Bağlısın</Label>
              <RoleBadge role={role} />
            </View>
          <KButton variant="secondary" className="w-full" onPress={handleReturnHome}>
            <LogOut size={14} strokeWidth={1.75} color="#D6C8A6" />
            <Text style={{ color: '#D6C8A6', marginLeft: 6, fontWeight: 'bold' }}>Kendi Dünyama Dön</Text>
          </KButton>
          </View>
        )}

        <View className="mt-6 mb-3">
          <Label>Ayarlar</Label>
        </View>
        <View
          className="flex-col border"
          style={{ backgroundColor: '#13110E', borderColor: '#221F19' }}
        >
          <Row label="Ateşi Harlat" hint="Yüksek kontrast, hâlâ karanlık">
            <TorchToggle on={harlat} onToggle={handleToggleHarlat} />
          </Row>
          {/* PIN yenileme kaldırıldı, pairing_sessions ile her defasında geçici üretiliyor */}
        </View>

        <KButton variant="secondary" className="mt-6 w-full" onPress={handleOpenPairing}>
          <Users size={15} strokeWidth={1.75} color="#D6C8A6" />
          <Text style={{ color: '#D6C8A6', marginLeft: 6, fontWeight: 'bold' }}>Ruh Çağır</Text>
        </KButton>
      </ScrollView>
    </View>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <View className="flex-col gap-0.5">
        <Text
          className="text-xs font-semibold uppercase tracking-[1px]"
          style={{ color: '#D6C8A6' }}
        >
          {label}
        </Text>
        <Text className="text-[10px]" style={{ color: '#7C735F' }}>
          {hint}
        </Text>
      </View>
      {children}
    </View>
  );
}
