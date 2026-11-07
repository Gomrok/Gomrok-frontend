import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { makeId } from "../utils/format.js";
import { readSession, removeSession, writeSession } from "../services/session.js";

const Context = createContext(null);
const fresh = () => ({ id: makeId("conversation"), title: "گفت‌وگوی تازه", messages: [], createdAt: new Date().toISOString() });
function restore() {
  if (!readSession("remember-chat", false)) return [fresh()];
  const saved = readSession("chat-history", []);
  if (!Array.isArray(saved)) return [fresh()];
  const items = saved.filter((item) => item && typeof item.id === "string" && Array.isArray(item.messages)).slice(0, 20).map((item) => ({ ...item, messages: item.messages.filter((message) => ["user", "assistant"].includes(message.role) && typeof message.text === "string").slice(-100) }));
  return items.length ? items : [fresh()];
}
export function ChatHistoryProvider({ children }) {
  const [conversations, setConversations] = useState(restore);
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [remember, setRemember] = useState(() => Boolean(readSession("remember-chat", false)));
  const [storageError, setStorageError] = useState(false);
  const updateMessages = useCallback((id, updater) => setConversations((current) => current.map((item) => {
    if (item.id !== id) return item;
    const messages = typeof updater === "function" ? updater(item.messages) : updater;
    return { ...item, messages, title: messages.find((message) => message.role === "user")?.text.slice(0, 42) || "گفت‌وگوی تازه" };
  })), []);
  const newConversation = useCallback(() => { const item = fresh(); setConversations((current) => [item, ...current].slice(0, 20)); setActiveId(item.id); return item.id; }, []);
  function removeConversation(id) {
    const remaining = conversations.filter((item) => item.id !== id);
    const next = remaining.length ? remaining : [fresh()];
    setConversations(next); if (activeId === id) setActiveId(next[0].id);
  }
  useEffect(() => {
    writeSession("remember-chat", remember);
    if (remember) setStorageError(!writeSession("chat-history", conversations.map((item) => ({ ...item, messages: item.messages.filter((message) => !message.pending) }))));
    else { removeSession("chat-history"); setStorageError(false); }
  }, [conversations, remember]);
  return <Context.Provider value={{ conversations, activeId, setActiveId, updateMessages, newConversation, removeConversation, remember, setRemember, storageError }}>{children}</Context.Provider>;
}
export function useChatHistory() { const context = useContext(Context); if (!context) throw new Error("ChatHistoryProvider is required"); return context; }
