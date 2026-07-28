import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { type Boss, type BossStatus, nextId } from './data';
import { db } from './firebase';
import { collection, onSnapshot, doc, updateDoc, increment, deleteDoc, setDoc, query, getDocs, where, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppContextType = {
  bosses: Boss[];
  filter: string;
  setFilter: (f: string) => void;
  activeBossId: string | null;
  setActiveBossId: (id: string | null) => void;
  harlat: boolean;
  setHarlat: React.Dispatch<React.SetStateAction<boolean>>;
  sound: boolean;
  setSound: React.Dispatch<React.SetStateAction<boolean>>;
  observer: boolean;
  setObserver: React.Dispatch<React.SetStateAction<boolean>>;
  connected: boolean;
  setConnected: React.Dispatch<React.SetStateAction<boolean>>;
  activeRole: 'owner' | 'editor' | 'observer';
  localUserId: string;
  activeHunterId: string;
  connectToWorld: (code: string) => Promise<void>;
  disconnectWorld: () => Promise<void>;
  setStatus: (id: string, kind: 'slain' | 'died') => void;
  adjustDeaths: (id: string, delta: number) => void;
  deleteBoss: (id: string) => void;
  addBoss: (name: string, gameId: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [filter, setFilter] = useState('all');
  const [activeBossId, setActiveBossId] = useState<string | null>(null);
  
  const [harlat, setHarlat] = useState(false);
  const [sound, setSound] = useState(true);
  const [observer, setObserver] = useState(false);
  const [connected, setConnected] = useState(false);
  const [activeRole, setActiveRole] = useState<'owner' | 'editor' | 'observer'>('owner');
  
  const [localUserId, setLocalUserId] = useState<string>('');
  const [activeHunterId, setActiveHunterId] = useState<string>('');

  // 1. Initialize user identity
  useEffect(() => {
    async function initUser() {
      try {
        let storedId = await AsyncStorage.getItem('hunter_id');
        if (!storedId) {
          storedId = 'user-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
          await AsyncStorage.setItem('hunter_id', storedId);
        }
        setLocalUserId(storedId);

        const pairedHunterId = await AsyncStorage.getItem('paired_hunter_id');
        const pairedRole = await AsyncStorage.getItem('paired_role');

        if (pairedHunterId && pairedRole) {
          setActiveHunterId(pairedHunterId);
          setActiveRole(pairedRole as any);
          setConnected(true);
          setObserver(pairedRole === 'observer');
        } else {
          setActiveHunterId(storedId);
          setActiveRole('owner');
        }
      } catch (e) {
        console.error("User init failed:", e);
      }
    }
    initUser();
  }, []);

  // 2. Listen to activeHunterId's bosses
  useEffect(() => {
    if (!activeHunterId) return;

    const unsubscribe = onSnapshot(doc(db, 'hunters', activeHunterId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().bosslar) {
        const rawData = docSnap.data().bosslar;
        const mappedBosses: Boss[] = rawData.map((b: any) => ({
          id: String(b.id),
          name: b.isim,
          gameId: b.oyun,
          deaths: b.olumler,
          status: b.kesildiMi ? 'slain' : 'pending',
          history: b.kayitlar || []
        }));
        setBosses(mappedBosses);
      } else {
        setBosses([]);
      }
    });

    return () => unsubscribe();
  }, [activeHunterId]);

  async function connectToWorld(code: string) {
    const docSnap = await getDoc(doc(db, 'pairing_sessions', code));
    if (docSnap.exists()) {
      const data = docSnap.data();
      const newHunterId = data.hunterId;
      const newRole = data.role || 'observer';
      
      setActiveHunterId(newHunterId);
      setActiveRole(newRole);
      setConnected(true);
      setObserver(newRole === 'observer');

      await AsyncStorage.setItem('paired_hunter_id', newHunterId);
      await AsyncStorage.setItem('paired_role', newRole);
    } else {
      throw new Error('Mühür Bulunamadı');
    }
  }

  async function disconnectWorld() {
    setActiveHunterId(localUserId);
    setActiveRole('owner');
    setConnected(false);
    setObserver(false);
    await AsyncStorage.removeItem('paired_hunter_id');
    await AsyncStorage.removeItem('paired_role');
  }

  // --- CRUD HELPERS (Writes array back to Firebase) ---
  async function writeBosses(newBosses: Boss[]) {
    if (!activeHunterId) return;
    const bosslar = newBosses.map(b => ({
      id: Number(b.id),
      isim: b.name,
      oyun: b.gameId,
      olumler: b.deaths,
      kesildiMi: b.status === 'slain',
      kayitlar: b.history || []
    }));
    await setDoc(doc(db, 'hunters', activeHunterId), { bosslar }, { merge: true });
  }

  async function setStatus(id: string, kind: 'slain' | 'died') {
    if (activeRole === 'observer') return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const newHistoryEvent = { id: String(Date.now()), kind, label: timeString };

    const newBosses = bosses.map(b => {
      if (b.id !== id) return b;
      
      const updatedHistory = [...(b.history || []), newHistoryEvent];
      
      if (kind === 'died') {
        return { ...b, deaths: b.deaths + 1, status: 'pending' as const, history: updatedHistory };
      }
      
      return { ...b, status: 'slain' as const, history: updatedHistory };
    });
    await writeBosses(newBosses);
  }

  async function adjustDeaths(id: string, delta: number) {
    if (activeRole === 'observer') return;
    const newBosses = bosses.map(b => 
      b.id === id ? { ...b, deaths: Math.max(0, b.deaths + delta) } : b
    );
    await writeBosses(newBosses);
  }

  async function deleteBoss(id: string) {
    if (activeRole === 'observer') return;
    const newBosses = bosses.filter(b => b.id !== id);
    await writeBosses(newBosses);
  }

  async function addBoss(name: string, gameId: string) {
    if (activeRole === 'observer') return;
    const newId = Date.now();
    const newBoss: Boss = {
      id: String(newId),
      name: name,
      gameId: gameId,
      deaths: 0,
      status: 'pending',
      history: []
    };
    const newBosses = [...bosses, newBoss];
    await writeBosses(newBosses);
  }
  
  function regeneratePin() {
    // Placeholder implementation
  }

  return (
    <AppContext.Provider
      value={{
        bosses,
        filter,
        setFilter,
        activeBossId,
        setActiveBossId,
        harlat,
        setHarlat,
        sound,
        setSound,
        observer,
        setObserver,
        connected,
        setConnected,
        activeRole,
        localUserId,
        activeHunterId,
        connectToWorld,
        disconnectWorld,
        setStatus,
        adjustDeaths,
        deleteBoss,
        addBoss,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
