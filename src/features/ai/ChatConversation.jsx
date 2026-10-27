import { useCallback, useEffect, useRef, useState } from "react";
import { ChatSection } from "../../sections/ConceptMarkup.jsx";

const sampleAnswer =
  "برای بررسی اولیه، نوع کالا، کشور مبدأ و گمرک موردنظر را مشخص کنید. شرایط هر پرونده می‌تواند متفاوت باشد.";

export function ChatConversation({ initialQuestion = "" }) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const sessionRef = useRef(0);
  const initialSent = useRef(false);
  const pending = messages.some((message) => message.pending);

  const send = useCallback((question) => {
    const text = String(question || "")
      .trim()
      .slice(0, 500);
    if (!text || busyRef.current) return;
    const session = sessionRef.current;
    busyRef.current = true;
    setBusy(true);
    setMessages((current) => [
      ...current,
      { id: `${session}-${Date.now()}-user`, role: "user", text },
      {
        id: `${session}-${Date.now()}-assistant`,
        role: "assistant",
        text: "در حال آماده‌سازی پاسخ نمونه…",
        pending: true,
      },
    ]);
  }, []);

  useEffect(() => {
    if (!pending) return undefined;
    const session = sessionRef.current;
    const timer = window.setTimeout(() => {
      if (sessionRef.current !== session) return;
      setMessages((current) =>
        current.map((message) =>
          message.pending
            ? { ...message, text: sampleAnswer, pending: false }
            : message,
        ),
      );
      busyRef.current = false;
      setBusy(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [pending]);

  const reset = useCallback(() => {
    sessionRef.current += 1;
    busyRef.current = false;
    setMessages([]);
    setBusy(false);
  }, []);

  useEffect(() => {
    const onPrompt = (event) => send(event.detail);
    const onReset = () => reset();
    window.addEventListener("gomrok:prompt", onPrompt);
    window.addEventListener("gomrok:new-chat", onReset);
    if (initialQuestion && !initialSent.current) {
      initialSent.current = true;
      send(initialQuestion);
    }
    return () => {
      window.removeEventListener("gomrok:prompt", onPrompt);
      window.removeEventListener("gomrok:new-chat", onReset);
    };
  }, [initialQuestion, reset, send]);

  return (
    <div className="chat-conversation-controller">
      <ChatSection messages={messages} onSend={send} busy={busy} />
    </div>
  );
}
