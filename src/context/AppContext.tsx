import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, Message, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { DEFAULT_ENGINE, engines } from '../config/engines';
import * as storage from '../lib/storage';
import { streamChat } from '../lib/api';
import { generateId } from '../lib/utils';

interface AppState {
  chats: Chat[];
  activeChat: Chat | null;
  settings: Settings;
  engine: string;
  isStreaming: boolean;
  // Actions
  loadChats: () => Promise<void>;
  createChat: () => void;
  selectChat: (id: string) => Promise<void>;
  deleteChat: (id: string) => Promise<Chat | undefined>;
  renameChat: (id: string, title: string) => Promise<void>;
  pinChat: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  regenerate: () => Promise<void>;
  stopStreaming: () => void;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  exportChats: () => Promise<string>;
  deleteAllData: () => Promise<void>;
  goHome: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [engine, setEngineState] = useState<string>(DEFAULT_ENGINE);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load initial data
  useEffect(() => {
    storage.getSettings().then(s => {
      const defaultEngine = engines.some(item => item.id === s.defaultEngine)
        ? s.defaultEngine
        : DEFAULT_ENGINE;
      const normalizedSettings = { ...s, defaultEngine };
      setSettings(normalizedSettings);
      setEngineState(defaultEngine);
      if (defaultEngine !== s.defaultEngine) {
        storage.saveSettings(normalizedSettings);
      }
    });
    storage.getAllChats().then(setChats);

    const refreshHandler = () => {
      storage.getAllChats().then(setChats);
    };
    window.addEventListener('milkyway:refresh-chats', refreshHandler);
    return () => window.removeEventListener('milkyway:refresh-chats', refreshHandler);
  }, []);

  const loadChats = useCallback(async () => {
    const all = await storage.getAllChats();
    setChats(all);
  }, []);

  const goHome = useCallback(() => {
    setActiveChat(null);
  }, []);

  const createChat = useCallback(() => {
    setActiveChat(null);
  }, []);

  const selectChat = useCallback(async (id: string) => {
    const chat = await storage.getChat(id);
    if (chat) setActiveChat(chat);
  }, []);

  const deleteChat = useCallback(async (id: string) => {
    const chat = await storage.getChat(id);
    await storage.deleteChat(id);
    if (activeChat?.id === id) setActiveChat(null);
    await loadChats();
    return chat;
  }, [activeChat, loadChats]);

  const renameChat = useCallback(async (id: string, title: string) => {
    const chat = await storage.getChat(id);
    if (!chat) return;
    chat.title = title;
    await storage.saveChat(chat);
    if (activeChat?.id === id) setActiveChat({ ...chat });
    await loadChats();
  }, [activeChat, loadChats]);

  const pinChat = useCallback(async (id: string) => {
    const chat = await storage.getChat(id);
    if (!chat) return;
    chat.pinned = !chat.pinned;
    await storage.saveChat(chat);
    if (activeChat?.id === id) setActiveChat({ ...chat });
    await loadChats();
  }, [activeChat, loadChats]);

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    let chat: Chat;
    if (activeChat) {
      chat = {
        ...activeChat,
        messages: [...activeChat.messages, userMsg],
        updatedAt: Date.now(),
      };
    } else {
      chat = {
        id: generateId(),
        title: content.slice(0, 60),
        messages: [userMsg],
        engine,
        pinned: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };
    chat.messages.push(assistantMsg);
    setActiveChat({ ...chat });
    await storage.saveChat(chat);
    await loadChats();

    // Stream
    setIsStreaming(true);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await streamChat({
        messages: chat.messages
          .filter(m => !m.isStreaming)
          .map(m => ({ role: m.role, content: m.content })),
        engine,
        apiKey: settings.openRouterApiKey,
        system: settings.customInstructions || undefined,
        signal: abort.signal,
        onToken: (token) => {
          assistantMsg.content += token;
          setActiveChat(prev => {
            if (!prev) return prev;
            const msgs = [...prev.messages];
            const last = msgs[msgs.length - 1];
            if (last.id === assistantMsg.id) {
              msgs[msgs.length - 1] = { ...last, content: assistantMsg.content };
            }
            return { ...prev, messages: msgs };
          });
        },
      });

      // Finalize
      assistantMsg.isStreaming = false;
      const finalChat = {
        ...chat,
        messages: chat.messages.map(m =>
          m.id === assistantMsg.id ? { ...assistantMsg, isStreaming: false } : m
        ),
        updatedAt: Date.now(),
      };
      setActiveChat(finalChat);
      await storage.saveChat(finalChat);
      await loadChats();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        assistantMsg.isStreaming = false;
        const finalChat = {
          ...chat,
          messages: chat.messages.map(m =>
            m.id === assistantMsg.id ? { ...assistantMsg, isStreaming: false } : m
          ),
          updatedAt: Date.now(),
        };
        setActiveChat(finalChat);
        await storage.saveChat(finalChat);
      } else {
        assistantMsg.isStreaming = false;
        assistantMsg.error = err.message || 'Something went wrong';
        const finalChat = {
          ...chat,
          messages: chat.messages.map(m =>
            m.id === assistantMsg.id ? { ...assistantMsg, isStreaming: false, error: assistantMsg.error } : m
          ),
          updatedAt: Date.now(),
        };
        setActiveChat(finalChat);
        await storage.saveChat(finalChat);
      }
      await loadChats();
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [activeChat, engine, settings.customInstructions, settings.openRouterApiKey, loadChats]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!activeChat) return;
    const msgIndex = activeChat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Remove all messages from this point forward
    const truncated = activeChat.messages.slice(0, msgIndex);
    const chat = { ...activeChat, messages: truncated, updatedAt: Date.now() };
    setActiveChat(chat);
    await storage.saveChat(chat);
    // Re-send with new content
    await sendMessage(newContent);
  }, [activeChat, sendMessage]);

  const regenerate = useCallback(async () => {
    if (!activeChat || activeChat.messages.length < 2) return;
    // Remove last assistant message
    const msgs = activeChat.messages.slice(0, -1);
    const lastUserMsg = msgs[msgs.length - 1];
    if (!lastUserMsg || lastUserMsg.role !== 'user') return;

    const chat = { ...activeChat, messages: msgs.slice(0, -1), updatedAt: Date.now() };
    setActiveChat(chat);
    await storage.saveChat(chat);
    await sendMessage(lastUserMsg.content);
  }, [activeChat, sendMessage]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await storage.saveSettings(updated);
  }, [settings]);

  const exportChats = useCallback(async () => {
    return storage.exportAllChats();
  }, []);

  const deleteAllData = useCallback(async () => {
    await storage.deleteAllChats();
    setChats([]);
    setActiveChat(null);
    setSettings(DEFAULT_SETTINGS);
    await storage.saveSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <AppContext.Provider value={{
      chats,
      activeChat,
      settings,
      engine,
      isStreaming,
      loadChats,
      createChat,
      selectChat,
      deleteChat,
      renameChat,
      pinChat,
      sendMessage,
      editMessage,
      regenerate,
      stopStreaming,
      updateSettings,
      exportChats,
      deleteAllData,
      goHome,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
