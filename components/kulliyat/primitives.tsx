import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Flame, Skull, Swords, ShieldCheck, Eye } from 'lucide-react-native';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------- */
/* Section label                                                    */
/* ---------------------------------------------------------------- */
export function Label({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: TextStyle;
}) {
  return (
    <Text
      className={cn(
        "text-[10px] font-medium uppercase tracking-[2px]",
        className
      )}
      style={[{ color: '#7C735F' }, style]}
    >
      {children}
    </Text>
  );
}

/* ---------------------------------------------------------------- */
/* Hairline — 1px gold divider                                      */
/* ---------------------------------------------------------------- */
export function Hairline({ className }: { className?: string }) {
  // In React Native, linear gradient borders are complex without expo-linear-gradient.
  // We'll use a solid color for simplicity, or we can just use a View with backgroundColor.
  return (
    <View
      className={cn("h-[1px] w-full", className)}
      style={{ backgroundColor: '#221F19' }}
    />
  );
}

/* ---------------------------------------------------------------- */
/* Button — primary / secondary / ghost                             */
/* ---------------------------------------------------------------- */
export function KButton({
  children,
  variant = 'primary',
  className,
  onPress,
  disabled,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      className={cn(
        "flex-row items-center justify-center gap-2 px-4 py-3",
        variant === 'secondary' && "border",
        disabled && "opacity-40",
        className
      )}
      style={{
        backgroundColor: variant === 'primary' ? '#D4AF37' : variant === 'secondary' ? '#1E1B15' : 'transparent',
        borderColor: variant === 'secondary' ? '#221F19' : 'transparent',
        // 'k-chamfer' clip-path logic is tough in pure RN without svg.
        // We'll just use normal border radius for now.
        borderRadius: 4,
      }}
    >
      <Text
        className="text-xs font-semibold uppercase tracking-[2px]"
        style={{
          color: variant === 'primary' ? '#0b0a08' : variant === 'secondary' ? '#D6C8A6' : '#7C735F',
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------------- */
/* Status pill — KESİLDİ / ÖLDÜN, active/inactive                   */
/* ---------------------------------------------------------------- */
export function StatusPill({
  kind,
  active,
  disabled,
  onClick,
}: {
  kind: 'slain' | 'died';
  active: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const isSlain = kind === 'slain';
  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.7}
      className={cn(
        "flex-row items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5",
        disabled && "opacity-45"
      )}
      style={{
        borderColor: active ? (isSlain ? '#728F60' : '#8F6060') : '#221F19',
        backgroundColor: active ? (isSlain ? '#273121' : '#312121') : 'transparent',
      }}
    >
      {isSlain ? <Swords size={12} strokeWidth={1.75} color={active ? '#a7d0af' : '#7C735F'} /> : <Skull size={12} strokeWidth={1.75} color={active ? '#e0a3a3' : '#7C735F'} />}
      <Text
        className="text-[10px] font-bold uppercase tracking-[1px]"
        style={{
          color: active ? (isSlain ? '#a7d0af' : '#e0a3a3') : '#7C735F',
        }}
      >
        {isSlain ? 'KESİLDİ' : 'ÖLDÜN'}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------------- */
/* Role badge — Yoldaş / Gözlemci                                   */
/* ---------------------------------------------------------------- */
export function RoleBadge({ role }: { role: 'yoldas' | 'gozlemci' }) {
  const isEditor = role === 'yoldas';
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-[3px] border px-2 py-1"
      style={{
        borderColor: '#221F19',
        backgroundColor: '#1E1B15',
      }}
    >
      {isEditor ? <ShieldCheck size={11} strokeWidth={1.75} color="#D4AF37" /> : <Eye size={11} strokeWidth={1.75} color="#D4AF37" />}
      <Text className="text-[9px] font-bold uppercase tracking-[2px]" style={{ color: '#D4AF37' }}>
        {isEditor ? 'YOLDAŞ' : 'GÖZLEMCİ'}
      </Text>
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* Torch toggle — Ateşi Harlat                                      */
/* ---------------------------------------------------------------- */
export function TorchToggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      className="flex items-center justify-center h-9 w-9 rounded-[3px] border"
      style={{
        borderColor: on ? '#D4AF37' : '#221F19',
        backgroundColor: on ? 'rgba(212,175,55,0.2)' : '#1E1B15',
      }}
    >
      <Flame size={16} strokeWidth={1.75} color={on ? '#D6C8A6' : '#7C735F'} />
    </TouchableOpacity>
  );
}

/* ---------------------------------------------------------------- */
/* Stat strip — KESİLEN / TOPLAM / ÖLÜMLER                           */
/* ---------------------------------------------------------------- */
export function StatStrip({
  slain,
  total,
  deaths,
}: {
  slain: number;
  total: number;
  deaths: number;
}) {
  const items = [
    { label: 'KESİLEN', value: slain, color: '#728F60' },
    { label: 'TOPLAM', value: total, color: '#D4AF37' },
    { label: 'ÖLÜMLER', value: deaths, color: '#8F6060' },
  ];
  return (
    <View
      className="flex-row items-stretch border-y"
      style={{ borderColor: '#221F19' }}
    >
      {items.map((it, i) => (
        <View
          key={it.label}
          className={cn(
            "flex-1 flex-col items-center gap-0.5 py-2.5",
            i > 0 && "border-l"
          )}
          style={i > 0 ? { borderColor: '#221F19' } : undefined}
        >
          <Text
            className="font-black text-xl leading-none"
            style={{ color: it.color }}
          >
            {it.value}
          </Text>
          <Label className="text-[9px]">{it.label}</Label>
        </View>
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- */
/* PIN box — rune-stone tiles                                       */
/* ---------------------------------------------------------------- */
export function PinDisplay({ pin }: { pin?: string }) {
  const safePin = pin || '....';
  const chars = safePin.padEnd(4, '•').slice(0, 4).split('');
  return (
    <View className="flex-row justify-center gap-3">
      {chars.map((c, i) => (
        <View
          key={i}
          className="flex h-14 w-12 items-center justify-center border"
          style={{
            borderColor: '#D4AF37',
            backgroundColor: '#1E1B15',
            borderRadius: 4, // Replaced clipPath with borderRadius
          }}
        >
          <Text
            className="font-black text-2xl"
            style={{ color: '#D4AF37' }}
          >
            {c}
          </Text>
        </View>
      ))}
    </View>
  );
}
