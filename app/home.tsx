import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SectionList, Animated, LayoutAnimation, Platform, UIManager, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, UserRound, Eye, Ghost } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { GAMES } from '@/lib/kulliyat/data';
import { BossCard } from '@/components/kulliyat/boss-card';
import { StatStrip, TorchToggle, Label } from '@/components/kulliyat/primitives';
import { useAppContext } from '@/lib/kulliyat/context';
import { SlainBossCard } from '@/components/kulliyat/boss-card';

function FadeInView({ children, delay }: { children: React.ReactNode; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateY, delay]);

  return <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>{children}</Animated.View>;
}

function EmptyState({ onAdd, observer }: { onAdd: () => void; observer: boolean }) {
  return (
    <View className="flex-col items-center gap-5 px-6 pt-24">
      <Ghost size={44} strokeWidth={1} color="#7C735F" style={{ opacity: 0.5 }} />
      <Text
        className="text-center text-sm uppercase leading-relaxed tracking-[2px]"
        style={{ color: '#7C735F' }}
      >
        Lütfün rehberliği yolunu aydınlatsın.
      </Text>
      <Label>Henüz mühürlenmiş bir canavar yok</Label>
      {!observer && (
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.8}
          className="mt-2 px-5 py-3 rounded-[3px]"
          style={{ backgroundColor: '#D4AF37' }}
        >
          <Text className="text-xs font-semibold uppercase tracking-[2px]" style={{ color: '#0b0a08' }}>
            İlkini Mühürle
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    bosses,
    filter,
    setFilter,
    harlat,
    setHarlat,
    observer,
    setStatus,
    deleteBoss,
  } = useAppContext();

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const handleFilter = (newFilter: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilter(newFilter);
  };

  const slain = bosses.filter((b) => b.status === 'slain').length;
  const deaths = bosses.reduce((sum, b) => sum + b.deaths, 0);

  // Sadece eklenmiş boss'u olan oyunları filtrele
  const activeGameIds = Array.from(new Set(bosses.map(b => b.gameId)));
  const activeTabs = activeGameIds.map(id => {
    const found = GAMES.find(g => g.id === id);
    return found ? found : { id, short: id };
  });

  // Varsayılan GAMES sırasına göre sırala, custom oyunları sona at
  activeTabs.sort((a, b) => {
    const indexA = GAMES.findIndex(g => g.id === a.id);
    const indexB = GAMES.findIndex(g => g.id === b.id);
    if (indexA === -1 && indexB === -1) return a.id.localeCompare(b.id);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const tabs = [{ id: 'all', short: 'HEPSİ' }, ...activeTabs];
  const visible = filter === 'all' ? bosses : bosses.filter((b) => b.gameId === filter);
  const activeBosses = visible.filter((b) => b.status !== 'slain');
  const slainBosses = visible.filter((b) => b.status === 'slain');

  const pulse = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    if (harlat) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.65, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0.95, duration: 2000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(0.85);
    }
  }, [harlat, pulse]);

  const handleToggleHarlat = () => setHarlat((v) => !v);
  const handleOpenProfile = () => router.push('/profile');
  const handleOpenBoss = (id: string) => {
    router.push({ pathname: '/detail', params: { id } });
  };
  const handleAdd = () => {
    router.push('/add-boss');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#0B0A08' }}>
      
      {/* ARKAPLAN GÖRSELİ */}
      <Image
        source={require('@/assets/images/arkaplan.jpg')}
        style={{ position: 'absolute', width: '100%', height: '100%', resizeMode: 'cover' }}
      />
      
      {/* GENEL KARARTMA (Okunabilirliği artırmak için siyah/koyu kahve maske) */}
      <View 
        pointerEvents="none"
        className="absolute inset-0 z-0"
        style={{ backgroundColor: 'rgba(11, 10, 8, 0.85)' }} 
      />

      {/* 🔥 KINDLED (ATEŞİ HARLAT) EFEKTİ */}
      {harlat && (
        <Animated.View 
          pointerEvents="none" 
          className="absolute inset-0 z-0" 
          style={[
            { backgroundColor: 'rgba(212, 175, 55, 0.12)' }, // Yarı saydam altın sarısı/ateş tonu
            { opacity: pulse }
          ]} 
        />
      )}
      
      {/* header */}
      <View className="flex-row items-center justify-between px-4 pb-3 pt-3">
        <View className="flex-col">
          <View className="flex-row items-center gap-2">
            <Text
              className="text-lg font-black uppercase tracking-[3px]"
              style={{ color: '#D6C8A6' }}
            >
              KÜLLİYAT
            </Text>
            {observer && (
              <View
                className="flex-row items-center gap-1 rounded-[3px] border px-1.5 py-0.5"
                style={{
                  borderColor: '#D4AF37',
                  backgroundColor: '#1E1B15',
                }}
              >
                <Eye size={9} strokeWidth={2} color="#D4AF37" />
                <Text className="text-[8px] font-bold uppercase tracking-[2px]" style={{ color: '#D4AF37' }}>
                  Gözlemci
                </Text>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <TorchToggle on={harlat} onToggle={handleToggleHarlat} />
          <TouchableOpacity
            onPress={handleOpenProfile}
            activeOpacity={0.8}
            className="flex items-center justify-center h-9 w-9 rounded-[3px] border"
            style={{ borderColor: '#221F19', backgroundColor: '#1E1B15' }}
          >
            <UserRound size={16} strokeWidth={1.75} color="#7C735F" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="z-10">
        <StatStrip slain={slain} total={bosses.length} deaths={deaths} />
      </View>

      {/* game filter tabs */}
      <View className="z-10">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-4 py-3 border-b border-[#221F19]">
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleFilter(t.id)}
                activeOpacity={0.8}
                className="relative pb-1 mr-4"
              >
                <Text
                  className="text-[10px] font-semibold uppercase tracking-[2px]"
                  style={{ color: active ? '#D6C8A6' : '#7C735F' }}
                >
                  {t.short}
                </Text>
                {active && (
                  <View
                    className="absolute inset-x-0 bottom-0 h-0.5"
                    style={{ backgroundColor: '#D4AF37' }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* list / empty */}
      <View className="flex-1 z-10">
        {visible.length === 0 ? (
          <EmptyState onAdd={handleAdd} observer={observer} />
        ) : (
          <SectionList
            sections={[
              { title: 'active', data: activeBosses },
              { title: 'slain', data: slainBosses }
            ]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 96 }}
            renderItem={({ item, section, index }) => {
              if (section.title === 'active') {
                return (
                  <View className="mb-3">
                    <FadeInView delay={index * 50}>
                      <BossCard
                        boss={item}
                        observer={observer}
                        onOpen={() => handleOpenBoss(item.id)}
                        onSetStatus={(kind) => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setStatus(item.id, kind);
                        }}
                        onDelete={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          deleteBoss(item.id);
                        }}
                      />
                    </FadeInView>
                  </View>
                );
              } else {
                return (
                  <View className="mb-3">
                    <FadeInView delay={index * 50}>
                      <SlainBossCard
                        boss={item}
                        observer={observer}
                        onOpen={() => handleOpenBoss(item.id)}
                        onRestore={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setStatus(item.id, 'slain');
                        }}
                        onDelete={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          deleteBoss(item.id);
                        }}
                      />
                    </FadeInView>
                  </View>
                );
              }
            }}
            renderSectionHeader={({ section }) => {
              if (section.title === 'slain' && section.data.length > 0 && activeBosses.length > 0) {
                return (
                  <View className="my-2 mb-4 flex-row items-center justify-center opacity-30">
                    <View className="h-px w-24 bg-[#7C735F]" />
                    <View className="mx-2 h-1.5 w-1.5 rotate-45 border border-[#7C735F]" />
                    <View className="h-px w-24 bg-[#7C735F]" />
                  </View>
                );
              }
              return null;
            }}
          />
        )}
      </View>

      {/* FAB */}
      {!observer && (
        <TouchableOpacity
          onPress={handleAdd}
          activeOpacity={0.8}
          className="absolute bottom-6 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full border-2"
          style={{
            borderColor: '#D4AF37',
            backgroundColor: '#13110E',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }}
        >
          <Plus size={24} strokeWidth={1.75} color="#D4AF37" />
        </TouchableOpacity>
      )}
    </View>
  );
}
