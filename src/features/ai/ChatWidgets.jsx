import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon.jsx";

export function ChatComposer({ onSend, busy = false }) {
  const [value, setValue] = useState("");

  function submit(event) {
    event.preventDefault();
    const question = value.trim().slice(0, 500);
    if (!question || busy) return;
    setValue("");
    onSend(question);
  }

  return (
    <form className="chat-compose" id="chat-form" onSubmit={submit}>
      <div className="compose-row">
        <label className="sr-only" htmlFor="chat-prompt">
          سؤال شما
        </label>
        <textarea
          id="chat-prompt"
          rows={1}
          placeholder="سؤال خود را بنویسید…"
          maxLength={500}
          required
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="send-square"
          aria-label="ارسال سؤال نمونه"
          disabled={busy || !value.trim()}
        >
          <Icon name="arrow-up" />
        </button>
      </div>
      <p>
        این گفت‌وگو نمونهٔ طراحی است؛ هیچ پیام یا اطلاعاتی به سرویس هوش مصنوعی
        ارسال نمی‌شود.
      </p>
    </form>
  );
}

export function ChatMessages({ messages = [], busy = false }) {
  const threadRef = useRef(null);

  useEffect(() => {
    if (messages.length)
      threadRef.current?.scrollTo({
        top: threadRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [messages]);

  return (
    <div
      className="chat-thread"
      id="chat-thread"
      aria-live="polite"
      ref={threadRef}
    >
      {!messages.length && (
        <div className="chat-welcome">
          <Icon name="sparkles" />
          <h2>از کجا شروع کنیم؟</h2>
          <p>سؤال خود را بنویسید یا یکی از این موارد را انتخاب کنید.</p>
          <div className="chat-suggestions">
            {[
              "برای ترخیص کالا چه مدارکی لازم دارم؟",
              "کد تعرفه کالا را از کجا پیدا کنم؟",
              "هزینه‌های گمرکی چگونه محاسبه می‌شوند؟",
            ].map((question) => (
              <button
                key={question}
                type="button"
                className="question-chip"
                data-chat-question={question}
              >
                {question}
                <Icon name="arrow-up-left" />
              </button>
            ))}
          </div>
        </div>
      )}
      {messages.map((message) => (
        <div
          className={`chat-message ${message.role === "user" ? "user-message" : "assistant-message"}`}
          key={message.id}
        >
          <span
            className={`message-avatar ${message.role === "assistant" ? "ai-avatar" : ""}`}
          >
            {message.role === "user" ? "شما" : <Icon name="sparkles" />}
          </span>
          <div>
            <p>{message.text}</p>
            {message.role === "assistant" && !message.pending && (
              <div className="chat-source">
                <Icon name="info" />
                <span>پاسخ نمایشی؛ این گفتگو به مدل هوش مصنوعی متصل نیست.</span>
              </div>
            )}
          </div>
        </div>
      ))}
      {busy && <span className="sr-only">در حال آماده‌سازی پاسخ نمونه…</span>}
    </div>
  );
}
