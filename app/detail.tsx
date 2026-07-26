import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Minus, Plus, Swords, Skull } from 'lucide-react-native';
import { gameById } from '@/lib/kulliyat/data';
import { StatusPill, Label, Hairline, KButton } from '@/components/kulliyat/primitives';
import { useAppContext } from '@/lib/kulliyat/context';

export default function DetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bosses, observer, setStatus, adjustDeaths, deleteBoss } = useAppContext();

  const boss = bosses.find((b) => b.id === id);

  if (!boss) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0A08]">
        <Text style={{ color: '#D6C8A6' }}>Boss bulunamadı.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-2">
          <Text style={{ color: '#D4AF37' }}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const game = gameById(boss.gameId);

  return (
    <View className="flex-1" style={{ backgroundColor: '#0B0A08' }}>
      <View className="flex-row items-center gap-3 px-4 pb-2 pt-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="flex h-9 w-9 items-center justify-center"
        >
          <ChevronLeft size={22} color="#7C735F" />
        </TouchableOpacity>
        <Text
          className="text-[10px] font-semibold uppercase tracking-[2px]"
          style={{ color: game.color }}
        >
          {game.short}
        </Text>
      </View>

      <ScrollView className="flex-1 px-5 pb-6">
        {/* title */}
        <View className="flex-row items-start gap-3 py-3">
          <View className="mt-1 h-10 w-1 shrink-0" style={{ backgroundColor: game.color }} />
          <Text
            className="font-black text-2xl uppercase leading-tight tracking-[1px] flex-1"
            style={{ color: '#D6C8A6' }}
          >
            {boss.name}
          </Text>
        </View>

        {/* death counter stepper */}
        <View
          className="mt-2 flex-row items-center justify-between border px-4 py-4"
          style={{ backgroundColor: '#13110E', borderColor: '#221F19' }}
        >
          <View className="flex-col gap-1">
            <Label>Ölüm Sayısı</Label>
            <View className="flex-row items-center gap-2">
              <Skull size={22} strokeWidth={1.5} color="#8F6060" />
              <Text
                className="font-black text-3xl tabular-nums"
                style={{ color: '#8F6060' }}
              >
                {boss.deaths}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <StepperButton
              disabled={observer || boss.deaths <= 0}
              onClick={() => adjustDeaths(boss.id, -1)}
            >
              <Minus size={18} strokeWidth={2} color={observer || boss.deaths <= 0 ? '#4a4438' : '#D6C8A6'} />
            </StepperButton>
            <StepperButton
              disabled={observer}
              onClick={() => adjustDeaths(boss.id, 1)}
            >
              <Plus size={18} strokeWidth={2} color={observer ? '#4a4438' : '#D6C8A6'} />
            </StepperButton>
          </View>
        </View>

        {/* status */}
        <View className="mt-4 flex-row items-center gap-2">
          <StatusPill
            kind="slain"
            active={boss.status === 'slain'}
            disabled={observer}
            onClick={() => setStatus(boss.id, 'slain')}
          />
          <StatusPill
            kind="died"
            active={boss.status === 'died'}
            disabled={observer}
            onClick={() => setStatus(boss.id, 'died')}
          />
        </View>

        {/* history timeline */}
        <View className="mt-6 flex-col gap-3">
          <Label>Kayıtlar</Label>
          <Hairline />
          {boss.history.length === 0 ? (
            <Text className="py-4 text-center text-[11px]" style={{ color: '#7C735F' }}>
              Henüz bir iz bırakılmadı.
            </Text>
          ) : (
            <View className="relative flex-col gap-4 pl-4 pt-1">
              <View
                className="absolute left-[3px] top-1 bottom-1 w-[1px]"
                style={{ backgroundColor: '#221F19' }}
              />
              {boss.history.map((h, i) => {
                const isSlain = h.kind === 'slain';
                return (
                  <View key={h.id} className="relative flex-row items-center gap-3">
                    <View
                      className="absolute -left-[21px] flex h-5 w-5 items-center justify-center rounded-full border"
                      style={{
                        borderColor: isSlain ? '#728F60' : '#8F6060',
                        backgroundColor: '#0B0A08',
                        zIndex: 10,
                      }}
                    >
                      {isSlain ? (
                        <Swords size={10} color="#728F60" />
                      ) : (
                        <Skull size={10} color="#8F6060" />
                      )}
                    </View>
                    <Text
                      className="ml-2 text-[11px] font-medium flex-1"
                      style={{ color: '#D6C8A6' }}
                    >
                      {h.label}
                    </Text>
                    <Text
                      className="ml-auto text-[9px] font-bold uppercase tracking-[1px]"
                      style={{ color: isSlain ? '#a7d0af' : '#e0a3a3' }}
                    >
                      {isSlain ? 'KESİLDİ' : 'ÖLDÜN'}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* delete */}
        {!observer && (
          <View className="mt-10 flex-col items-center gap-2">
            <Hairline />
            <KButton
              variant="ghost"
              className="mt-2"
              onPress={() => {
                router.back();
                deleteBoss(boss.id);
              }}
            >
              Bu kaydı sil
            </KButton>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StepperButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onClick}
      disabled={disabled}
      activeOpacity={0.8}
      className="flex h-10 w-10 items-center justify-center rounded-[3px] border"
      style={{
        borderColor: '#221F19',
        backgroundColor: '#1E1B15',
        opacity: disabled ? 0.3 : 1,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
