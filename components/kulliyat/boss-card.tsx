import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Skull, Trash2, ChevronRight, Swords } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { cn } from '@/lib/utils';
import { type Boss, gameById } from '@/lib/kulliyat/data';
import { StatusPill } from './primitives';
import * as Haptics from 'expo-haptics';

export function BossCard({
  boss,
  observer,
  onOpen,
  onSetStatus,
  onDelete,
}: {
  boss: Boss;
  observer: boolean;
  onOpen: () => void;
  onSetStatus: (kind: 'slain' | 'died') => void;
  onDelete: () => void;
}) {
  const game = gameById(boss.gameId);
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const previousDeaths = useRef(boss.deaths);
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const [animatingStatus, setAnimatingStatus] = useState<'slain' | 'died' | null>(null);

  useEffect(() => {
    if (boss.deaths > previousDeaths.current) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true })
      ]).start();
    }
    previousDeaths.current = boss.deaths;
  }, [boss.deaths, scale]);

  function mark(kind: 'slain' | 'died') {
    if (animatingStatus) return;
    setAnimatingStatus(kind);
    
    // Titreşim (Haptic Feedback) eklendi
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Hızlı (snappy) parlama
    Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 0.2, duration: 80, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 120, useNativeDriver: true })
    ]).start();

    if (kind === 'died') {
      // Optimistic animation (anında zıplat!)
      previousDeaths.current = boss.deaths + 1;
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true })
      ]).start();

      onSetStatus(kind);
      setTimeout(() => setAnimatingStatus(null), 200);
    } else {
      // Kesildi listesine giderken sadece 180ms (göz kırpma süresi) bekle ki efekti görsün
      setTimeout(() => {
        onSetStatus(kind);
        setAnimatingStatus(null);
      }, 180);
    }
  }

  const renderLeftActions = (progress: any, dragX: any) => {
    if (observer) return null;
    
    // As you pull to the right, the red background and skull reveal
    return (
      <View
        className="flex-1 justify-center pl-6"
        style={{ backgroundColor: '#dc2626' }}
      >
        <Skull size={24} color="#0B0A08" strokeWidth={2} />
      </View>
    );
  };

  const renderRightActions = (progress: any, dragX: any) => {
    if (observer) return null;
    
    return (
      <TouchableOpacity
        onPress={() => {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete();
        }}
        activeOpacity={0.8}
        className="flex w-[76px] items-center justify-center"
        style={{ backgroundColor: '#312121' }}
      >
        <Trash2 size={18} color="#e0a3a3" strokeWidth={1.75} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="relative">
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        onSwipeableOpen={(direction) => {
          if (direction === 'left') {
            mark('died');
            swipeableRef.current?.close();
          }
        }}
        enabled={!observer && !animatingStatus}
        overshootRight={false}
        overshootLeft={false}
      >
        <View
          className="flex-row items-stretch border relative overflow-hidden"
          style={{
            backgroundColor: '#13110E',
            borderColor: '#221F19',
          }}
        >
          <Animated.View 
            pointerEvents="none" 
            className="absolute inset-0 z-10" 
            style={{ 
              backgroundColor: animatingStatus === 'slain' ? '#728F60' : '#dc2626', 
              opacity: glowOpacity 
            }} 
          />

          {/* game color spine */}
          <View className="w-1 shrink-0" style={{ backgroundColor: game.color }} />

          <View className="flex-1 flex-col gap-2 px-3 py-2.5">
            <TouchableOpacity onPress={onOpen} className="flex-row items-start justify-between gap-2" activeOpacity={0.7}>
              <View className="flex-1">
                <Text
                  className="font-black text-sm uppercase leading-tight tracking-[1px]"
                  style={{ color: '#D6C8A6' }}
                >
                  {boss.name}
                </Text>
                <Text
                  className="mt-0.5 text-[9px] font-medium uppercase tracking-[2px]"
                  style={{ color: game.color }}
                >
                  {game.short}
                </Text>
              </View>
              <View className="mt-0.5 shrink-0">
                <ChevronRight size={16} color="#7C735F" />
              </View>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between">
              <Animated.View className="flex-row items-center gap-1" style={{ transform: [{ scale }] }}>
                <Skull size={13} strokeWidth={1.75} color="#7C735F" />
                <Text className="text-[11px] font-semibold" style={{ color: '#7C735F' }}>
                  {boss.deaths}
                </Text>
              </Animated.View>

              <View className="flex-row items-center gap-1.5">
                <StatusPill
                  kind="slain"
                  active={boss.status === 'slain' || animatingStatus === 'slain'}
                  disabled={observer || animatingStatus !== null}
                  onClick={() => mark('slain')}
                />
                <StatusPill
                  kind="died"
                  active={boss.status === 'died' || animatingStatus === 'died'}
                  disabled={observer || animatingStatus !== null}
                  onClick={() => mark('died')}
                />
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

export function SlainBossCard({
  boss,
  observer,
  onOpen,
  onRestore,
  onDelete,
}: {
  boss: Boss;
  observer: boolean;
  onOpen: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const game = gameById(boss.gameId);
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = () => {
    if (observer) return null;
    return (
      <TouchableOpacity
        onPress={() => {
          swipeableRef.current?.close();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDelete();
        }}
        activeOpacity={0.8}
        className="flex w-[60px] items-center justify-center"
        style={{ backgroundColor: '#13110E' }}
      >
        <Trash2 size={16} color="#7C735F" strokeWidth={1.5} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="relative opacity-60">
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        enabled={!observer}
        overshootRight={false}
      >
        <TouchableOpacity
          onPress={onOpen}
          activeOpacity={0.8}
          className="flex-row items-center border"
          style={{
            backgroundColor: '#0B0A08',
            borderColor: '#1E1B15',
          }}
        >
          {/* game color spine */}
          <View className="w-1 self-stretch shrink-0 opacity-50" style={{ backgroundColor: game.color }} />

          <View className="flex-1 flex-row items-center px-3 py-3">
            <View className="w-[70px]">
              <Text
                className="text-[9px] font-medium uppercase tracking-[1px] opacity-70"
                style={{ color: game.color }}
                numberOfLines={1}
              >
                {game.short}
              </Text>
            </View>

            <View className="flex-1">
              <Text
                className="font-bold text-xs uppercase tracking-[1px] line-through"
                style={{ color: '#7C735F' }}
                numberOfLines={1}
              >
                {boss.name}
              </Text>
            </View>

            <View className="flex-row items-center gap-4 ml-2">
              <View className="flex-row items-center gap-1 opacity-70">
                <Skull size={11} strokeWidth={2} color="#7C735F" />
                <Text className="text-[10px] font-semibold" style={{ color: '#7C735F' }}>
                  {boss.deaths}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!observer && onRestore) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onRestore();
                  }
                }}
                disabled={observer}
                activeOpacity={0.7}
                className="flex-row items-center gap-1"
              >
                <Swords size={12} color="#7C735F" />
                <Text className="text-[9px] font-bold uppercase tracking-[1px]" style={{ color: '#7C735F' }}>
                  Kesildi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
}
