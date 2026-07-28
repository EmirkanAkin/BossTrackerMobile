import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/lib/kulliyat/context';
import { PinDisplay } from '@/components/kulliyat/primitives';
import { db } from '@/lib/kulliyat/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function PairingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { localUserId, connectToWorld, setObserver } = useAppContext();
  const [entry, setEntry] = useState('');
  
  // share modal state
  const [shareRole, setShareRole] = useState<'gozlemci' | 'editor' | null>(null);
  const [pairingCode, setPairingCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleClose = () => router.back();

  const handleShare = async (role: 'gozlemci' | 'editor') => {
    setShareRole(role);
    setCopied(false);
    
    // Generate new code and save to pairing_sessions
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    setPairingCode(newCode);
    
    try {
      await setDoc(doc(db, 'pairing_sessions', newCode), {
        hunterId: localUserId,
        role: role,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Paylaşım hatası:", e);
    }
  };

  const copyPin = async () => {
    if (!pairingCode) return;
    await Clipboard.setStringAsync(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = async () => {
    if (entry.length !== 4) return;
    setIsConnecting(true);
    setErrorMsg('');
    
    try {
      await connectToWorld(entry);
      // Başarıyla bağlandı, roller connectToWorld içinde otomatik atanıyor
      router.replace('/home');
    } catch (e: any) {
      setErrorMsg(e.message || 'Mühür bulunamadı veya bağlantı koptu.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1" 
      style={{ backgroundColor: '#0B0A08' }}
    >
      <View className="flex-row items-center justify-between px-5 pb-4 border-b border-[#1E1B15]" style={{ paddingTop: insets.top + 24 }}>
        <Text
          className="font-black text-lg uppercase tracking-[3px]"
          style={{ color: '#D6C8A6' }}
        >
          RUH ÇAĞIRMA AYİNİ
        </Text>
        <TouchableOpacity onPress={handleClose} activeOpacity={0.8} className="p-1">
          <X size={24} color="#7C735F" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        <Text
          className="text-center text-xs font-medium leading-relaxed tracking-[1px] mb-8"
          style={{ color: '#D4AF37' }}
        >
          Başka bir dünyadaki avcıyla güçlerini birleştir veya kendi dünyanı başkalarına aç.
        </Text>

        {/* Share Section */}
        <View 
          className="border border-[#1E1B15] p-5 mb-6 flex-col items-center gap-4"
          style={{ backgroundColor: '#0f0e0c' }}
        >
          <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D6C8A6' }}>
            KENDİ DÜNYANI PAYLAŞ
          </Text>

          <TouchableOpacity
            onPress={() => handleShare('gozlemci')}
            activeOpacity={0.8}
            className="w-full border py-3 items-center justify-center"
            style={{ borderColor: '#221F19', backgroundColor: '#13110E' }}
          >
            <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#7C735F' }}>
              GÖZLEMCİ OLARAK
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleShare('editor')}
            activeOpacity={0.8}
            className="w-full border py-3 items-center justify-center"
            style={{ borderColor: '#221F19', backgroundColor: '#13110E' }}
          >
            <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#7C735F' }}>
              KALICI OLARAK
            </Text>
          </TouchableOpacity>
        </View>

        {/* Connect Section */}
        <View 
          className="border border-[#1E1B15] p-5 flex-col items-center gap-4"
          style={{ backgroundColor: '#0f0e0c' }}
        >
          <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D6C8A6' }}>
            MÜHRE BAĞLAN
          </Text>
          
          <Text className="text-[10px] tracking-[1px]" style={{ color: '#7C735F' }}>
            Başka bir cihazın ilerlemesini al
          </Text>

          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            value={entry}
            onChangeText={(text) => setEntry(text.replace(/\D/g, '').slice(0, 4))}
            placeholder="Arkadaşının Kodunu Gir"
            placeholderTextColor="rgba(124,115,95,0.5)"
            caretHidden={true}
            className="w-full border py-3 text-center text-lg mt-2"
            style={{
              backgroundColor: '#1E1B15',
              borderColor: '#D4AF37',
              color: '#D4AF37',
              fontFamily: 'monospace',
            }}
          />

          <TouchableOpacity
            onPress={handleConnect}
            disabled={entry.length !== 4 || isConnecting}
            activeOpacity={0.8}
            className={cn("w-full py-3 items-center justify-center mt-2", (entry.length !== 4 || isConnecting) ? "opacity-50" : "opacity-100")}
            style={{ backgroundColor: '#D4AF37' }}
          >
            <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#0b0a08' }}>
              {isConnecting ? 'Bağlanıyor...' : 'Bağlan'}
            </Text>
          </TouchableOpacity>

          {errorMsg ? (
            <View className="w-full mt-2 border border-red-500/30 bg-red-500/10 py-3 rounded-[3px]">
              <Text className="text-center text-[10px] font-semibold uppercase tracking-[1px]" style={{ color: '#ef4444' }}>
                {errorMsg}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Themed Share Modal */}
      <Modal
        visible={shareRole !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShareRole(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/80 px-5">
          <View 
            className="w-full border p-6 items-center flex-col gap-6"
            style={{ backgroundColor: '#0B0A08', borderColor: '#221F19' }}
          >
            <TouchableOpacity 
              onPress={() => setShareRole(null)} 
              activeOpacity={0.8} 
              className="absolute right-3 top-3 p-2"
            >
              <X size={20} color="#7C735F" />
            </TouchableOpacity>

            <View className="items-center gap-1 mt-2">
              <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D6C8A6' }}>
                {shareRole === 'gozlemci' ? 'GÖZLEMCİ DAVETİ' : 'YÖNETİCİ DAVETİ'}
              </Text>
              <Text className="text-[10px] text-center tracking-[1px] mt-2 leading-relaxed px-4" style={{ color: '#7C735F' }}>
                Bu rün taşlarını {shareRole === 'gozlemci' ? 'dünyanı izlemesi' : 'yoldaşın olması'} için bir avcıyla paylaş.
              </Text>
            </View>

            <PinDisplay pin={pairingCode || '....'} />

            <TouchableOpacity
              onPress={copyPin}
              activeOpacity={0.8}
              className="w-full border py-3 items-center justify-center flex-row gap-2 mt-2"
              style={{ borderColor: copied ? '#D4AF37' : '#221F19', backgroundColor: '#13110E' }}
            >
              {copied ? (
                <>
                  <Check size={16} color="#D4AF37" />
                  <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#D4AF37' }}>
                    Kopyalandı
                  </Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#7C735F" />
                  <Text className="text-xs font-bold uppercase tracking-[2px]" style={{ color: '#7C735F' }}>
                    Mührü Kopyala
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}
