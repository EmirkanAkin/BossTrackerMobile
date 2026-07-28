import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { GAMES } from '@/lib/kulliyat/data';
import { KButton, Label, Hairline } from '@/components/kulliyat/primitives';
import { useAppContext } from '@/lib/kulliyat/context';
import { BOSS_DATABASE } from '@/lib/kulliyat/boss-db';

export default function AddBossScreen() {
  const router = useRouter();
  const { addBoss, bosses } = useAppContext();
  
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState(GAMES[0].id);
  const [customGame, setCustomGame] = useState('');
  const [manualGame, setManualGame] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [errorText, setErrorText] = useState('Bu canavar zaten mühürlendi!');

  // Auto-detect logic similar to web
  const handleNameChange = (val: string) => {
    setName(val);
    if (manualGame) return; // Don't override if user manually selected a game
    const q = val.trim();
    if (q.length < 2) return;
    const query = q.toLowerCase();
    const eslesen = BOSS_DATABASE.find(b => b.isim.toLowerCase().includes(query));
    if (eslesen) {
      setGameId(eslesen.oyun);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    
    // Check for exact match in DB for uppercase formatting
    const query = trimmed.toLowerCase();
    const finalGameId = gameId === 'other' && customGame.trim() ? customGame.trim().toLocaleUpperCase('tr-TR') : gameId;

    // Tam eşleşme var mı kontrol et (Kullanıcı başka bir oyunun boss'unu yanlış oyuna ekliyorsa engelle)
    const exactMatch = BOSS_DATABASE.find(b => b.isim.toLowerCase() === query);
    if (exactMatch && exactMatch.oyun !== finalGameId) {
      setErrorText(`BU BOSS ${GAMES.find(g => g.id === exactMatch.oyun)?.short || exactMatch.oyun} OYUNUNA AİT!`);
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 3000);
      return;
    }

    // Yalnızca seçili olan oyundaki bossları filtrele ki rastgele başka oyundan boss çekmesin
    const eslesenler = BOSS_DATABASE.filter(b => b.isim.toLowerCase().includes(query) && b.oyun === finalGameId);
    const eslesen = eslesenler.length > 0
      ? eslesenler.reduce((en, b) => b.isim.length < en.isim.length ? b : en)
      : null;

    // Eğer resmi bir oyun seçildiyse ve yazılan isim o oyundaki hiçbir boss ile eşleşmiyorsa engelle
    const isOfficialGame = GAMES.some(g => g.id === finalGameId && g.id !== 'other');
    if (isOfficialGame && !eslesen) {
      setErrorText('BU OYUNDA BÖYLE BİR CANAVAR YOK!');
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 3000);
      return;
    }

    const eklenecekIsim = eslesen ? eslesen.isim.toLocaleUpperCase('tr-TR') : trimmed.toLocaleUpperCase('tr-TR');

    const isDuplicate = bosses.some(b => b.name === eklenecekIsim && b.gameId === finalGameId);
    if (isDuplicate) {
      setErrorText('BU CANAVAR ZATEN MÜHÜRLENDİ!');
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 3000);
      return;
    }

    setDuplicateError(false);
    addBoss(eklenecekIsim, finalGameId);
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background touch area to close */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)' }}
        />

        <View
          className="border-t"
          style={{
            backgroundColor: '#13110E',
            borderColor: '#D4AF37',
            paddingBottom: 24,
          }}
        >
          <View className="flex-row items-center justify-between px-5 pb-3 pt-4">
            <Text
              className="font-bold text-base uppercase tracking-[1px]"
              style={{ color: '#D6C8A6' }}
            >
              Yeni Canavar
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.8} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color="#7C735F" />
            </TouchableOpacity>
          </View>
          <Hairline />

        <View className="flex-col gap-4 px-5 pb-3 pt-4">
          <View className="flex-col gap-1.5">
            <Label>Boss Adı</Label>
            <TextInput
              autoFocus
              value={name}
              onChangeText={handleNameChange}
              onSubmitEditing={handleSubmit}
              placeholder="örn. RADAHN, YARI TANRI"
              placeholderTextColor="rgba(124,115,95,0.6)"
              className="w-full rounded-[3px] border px-3 py-3 text-sm"
              style={{
                backgroundColor: '#0B0A08',
                borderColor: '#221F19',
                color: '#D6C8A6',
              }}
            />
          </View>

          <View className="flex-col gap-2">
            <Label>Oyun</Label>
            <View className="flex-row flex-wrap">
              {GAMES.map((g) => {
                const active = g.id === gameId;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => {
                      setGameId(g.id);
                      setManualGame(true);
                    }}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-2 rounded-[3px] border px-3 py-2.5 mb-2 mr-2"
                    style={{
                      borderColor: active ? '#D4AF37' : '#221F19',
                      backgroundColor: active ? '#1E1B15' : 'transparent',
                    }}
                  >
                    <View
                      className="h-3 w-1 shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <Text
                      className="text-[10px] font-semibold uppercase tracking-[1px]"
                      style={{ color: active ? '#D6C8A6' : '#7C735F' }}
                    >
                      {g.short}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            {/* Custom Game Input */}
            {gameId === 'other' && (
              <TextInput
                value={customGame}
                onChangeText={setCustomGame}
                placeholder="OYUN ADINI GİRİN..."
                placeholderTextColor="rgba(124,115,95,0.6)"
                className="w-full rounded-[3px] border px-3 py-3 text-sm mt-2"
                style={{
                  backgroundColor: '#0B0A08',
                  borderColor: '#D4AF37',
                  color: '#D6C8A6',
                }}
              />
            )}
          </View>
        </View>

        {/* fixed action */}
        <View className="px-5 pt-2">
          <KButton
            variant="primary"
            className="w-full"
            disabled={!name.trim()}
            onPress={handleSubmit}
          >
            <Text style={{ color: '#0b0a08', fontWeight: 'bold' }}>MÜHÜRLE</Text>
          </KButton>

          {duplicateError && (
            <View className="mt-3 border border-red-500/30 bg-red-500/10 py-3 rounded-[3px]">
              <Text className="text-center text-[10px] font-bold uppercase tracking-[1px]" style={{ color: '#ef4444' }}>
                {errorText}
              </Text>
            </View>
          )}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
