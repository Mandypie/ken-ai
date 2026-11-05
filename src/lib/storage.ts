/**
 * Storage wrapper using IndexedDB (via idb-keyval).
 * Swap this file to point at your own backend later.
 */
import { get, set, del, keys, createStore } from 'idb-keyval';
import type { Chat, Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const chatStore = createStore('milkyway-chats', 'chats');
const settingsStore = createStore('milkyway-settings', 'settings');

// ── Chats ──
export async function getAllChats(): Promise<Chat[]> {
  const allKeys = await keys(chatStore);
  const chats: Chat[] = [];
  for (const key of allKeys) {
    const chat = await get<Chat>(key, chatStore);
    if (chat) chats.push(chat);
  }
  return chats.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getChat(id: string): Promise<Chat | undefined> {
  return get<Chat>(id, chatStore);
}

export async function saveChat(chat: Chat): Promise<void> {
  await set(chat.id, chat, chatStore);
}

export async function deleteChat(id: string): Promise<void> {
  await del(id, chatStore);
}

export async function deleteAllChats(): Promise<void> {
  const allKeys = await keys(chatStore);
  for (const key of allKeys) {
    await del(key, chatStore);
  }
}

// ── Settings ──
export async function getSettings(): Promise<Settings> {
  const s = await get<Settings>('settings', settingsStore);
  if (!s) return DEFAULT_SETTINGS;

  const { geminiApiKey: _legacyGeminiApiKey, ...savedSettings } = s as Settings & {
    geminiApiKey?: string;
  };
  return { ...DEFAULT_SETTINGS, ...savedSettings };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await set('settings', settings, settingsStore);
}

// ── Export ──
export async function exportAllChats(): Promise<string> {
  const chats = await getAllChats();
  return JSON.stringify(chats, null, 2);
}
