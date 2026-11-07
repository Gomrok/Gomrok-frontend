import { useCallback, useEffect, useRef, useState } from "react";
import { ChatSection } from "../../sections/ConceptMarkup.jsx";
import { AI_CONFIG } from "../../config/platform.js";
import { createAiService } from "../../services/ai.js";
import { createGuestQuota, readSession, writeSession } from "../../services/session.js";
import { makeId } from "../../utils/format.js";
import { useChatHistory } from "../../contexts/ChatHistoryContext.jsx";

const ai = createAiService();
const quota = createGuestQuota(AI_CONFIG.guestLimit, { getItem: (key) => window.sessionStorage.getItem(key), setItem: (key, value) => window.sessionStorage.setItem(key, value) });
export function ChatConversation({ initialQuestion = "" }) {
  const history = useChatHistory();
  const { activeId, updateMessages } = history;
  const conversation = history.conversations.find((item) => item.id === activeId) || history.conversations[0];
  const messages = conversation.messages;
  const [used, setUsed] = useState(() => quota.read());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const sessionRef = useRef(0);
  const controllerRef = useRef(null);
  const pendingRef = useRef(null);
  const lastQuestion = useRef("");
  const initialSent = useRef(false);
  const send = useCallback((question) => {
    const text = String(question || "").trim().slice(0, 500);
    if (!text || busyRef.current) return false;
    const reservation = quota.consume(); setUsed(quota.read());
    if (reservation === null) return false;
    const session = sessionRef.current;
    const controller = new AbortController(); controllerRef.current = controller;
    busyRef.current = true; setBusy(true); setError(""); lastQuestion.current = text;
    const assistantId = makeId("pending");
    pendingRef.current = { conversationId: activeId, assistantId, controller };
    updateMessages(activeId, (current) => [...current, { id: makeId("question"), role: "user", text }, { id: assistantId, role: "assistant", text: "در حال آماده‌سازی پاسخ نمونه…", pending: true }]);
    const draft = readSession("draft-request");
    ai.reply({ text, signal: controller.signal, requestContext: { requestId: draft?.id || null, referralId: draft?.referralId || null } }).then((answer) => {
      if (sessionRef.current !== session || controller.signal.aborted) return;
      updateMessages(activeId, (current) => current.map((message) => message.id === assistantId ? { ...message, text: answer.text, pending: false, kind: answer.kind } : message));
    }).catch((failure) => {
      if (sessionRef.current !== session || failure.name === "AbortError") return;
      quota.refund(); setUsed(quota.read());
      updateMessages(activeId, (current) => current.map((message) => message.id === assistantId ? { ...message, text: "پاسخ نمونه آماده نشد.", pending: false, error: true } : message));
      setError("آماده‌سازی پاسخ انجام نشد. می‌توانید دوباره تلاش کنید.");
    }).finally(() => { if (pendingRef.current?.controller === controller) pendingRef.current = null; if (sessionRef.current === session) { busyRef.current = false; setBusy(false); } });
    return true;
  }, [activeId, updateMessages]);
  const cancelPending = useCallback(() => {
    sessionRef.current += 1; controllerRef.current?.abort(); pendingRef.current = null; busyRef.current = false; setBusy(false); setError("");
    updateMessages(activeId, (current) => current.map((message) => message.pending ? { ...message, pending: false, error: true, text: "پاسخ نمونه با تغییر گفتگو لغو شد." } : message));
    setUsed(quota.read());
  }, [activeId, updateMessages]);
  const reset = useCallback(() => { cancelPending(); history.newConversation(); }, [cancelPending, history.newConversation]);
  function selectConversation(id) { if (id === activeId) return; cancelPending(); history.setActiveId(id); }
  function removeConversation(id) { if (id === activeId) cancelPending(); history.removeConversation(id); }
  useEffect(() => {
    const onPrompt = (event) => send(event.detail);
    window.addEventListener("gomrok:prompt", onPrompt); window.addEventListener("gomrok:new-chat", reset);
    const timer = window.setTimeout(() => { if (initialQuestion && !initialSent.current) { initialSent.current = true; send(initialQuestion); } }, 0);
    return () => { window.clearTimeout(timer); window.removeEventListener("gomrok:prompt", onPrompt); window.removeEventListener("gomrok:new-chat", reset); };
  }, [initialQuestion, reset, send]);
  useEffect(() => () => {
    const pending = pendingRef.current;
    if (!pending) return;
    sessionRef.current += 1; pending.controller.abort(); pendingRef.current = null;
    updateMessages(pending.conversationId, (current) => current.map((message) => message.id === pending.assistantId ? { ...message, pending: false, error: true, text: "آماده‌سازی پاسخ نمونه با خروج از گفتگو لغو شد." } : message));
  }, [updateMessages]);
  function refer(message) {
    const referral = { id: makeId("referral"), source: "ai", conversationId: activeId, answerId: message.id };
    if (!writeSession("ai-referral", referral)) { setError("مرورگر اجازهٔ نگه‌داری موقت ارجاع را نداد. درخواست را از صفحهٔ اصلی شروع کنید."); return; }
    window.location.assign("./#quote");
  }
  return <div className="chat-conversation-controller"><ChatSection messages={messages} onSend={send} busy={busy} used={used} limit={AI_CONFIG.guestLimit} blocked={used >= AI_CONFIG.guestLimit} error={error} onRetry={() => send(lastQuestion.current)} onReferral={refer} histories={history.conversations} activeHistory={activeId} onSelectHistory={selectConversation} onRemoveHistory={removeConversation} rememberHistory={history.remember} onRememberHistory={history.setRemember} historyStorageError={history.storageError} /></div>;
}
