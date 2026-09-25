import { useCallback, useEffect, useRef, useState } from "react";
import { authFetch } from "../auth/authService.js";
import { cp04BuildApiUrl } from "../utils/apiEndpoint.js";
import { t } from "../i18n/translations.js";
import { useLang } from "../i18n/language.js";

const CHAT_ENDPOINT = cp04BuildApiUrl("/api/chat", import.meta.env);

const WELCOME_MSG = {
  id: "welcome",
  role: "bot",
  text: "chatbot.welcome",
};

function BotMessage({ text }) {
  return (
    <div style={styles.botBubble}>
      {text.split("\n").map((line, i) => (
        <span key={i}>{line}{i < text.split("\n").length - 1 && <br />}</span>
      ))}
    </div>
  );
}

function UserMessage({ text }) {
  return <div style={styles.userBubble}>{text}</div>;
}

function TypingIndicator() {
  return (
    <div style={styles.botBubble}>
      <span style={styles.typing}>● ● ●</span>
    </div>
  );
}

export function ChatbotAsistente({ onNavigate }) {
  const { lang } = useLang();
  const tx = useCallback((key) => t(key, lang), [lang]);

  const [messages, setMessages] = useState([{ ...WELCOME_MSG, text: tx("chatbot.welcome") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    let reply = tx("chatbot.error_process");
    let redirectHint = null;

    try {
      const res = await authFetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, origin: "web", context: {} }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.reply) reply = data.reply;
      if (data.redirect_hint) redirectHint = data.redirect_hint;

      if (data.authRequired) {
        reply = tx("chatbot.error_auth");
      }
    } catch {
      reply = tx("chatbot.error_connection");
    }

    const botMsg = { id: Date.now() + 1, role: "bot", text: reply, redirectHint };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  }, [input, loading, tx]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerIcon}>🤖</span>
        <span style={styles.headerTitle}>{tx("chatbot.title")}</span>
      </div>

      <div style={styles.messageList}>
        {messages.map((m) =>
          m.role === "user"
            ? <UserMessage key={m.id} text={m.text} />
            : (
              <div key={m.id}>
                <BotMessage text={m.text} />
                {m.redirectHint && onNavigate && (
                  <button
                    style={styles.navBtn}
                    onClick={() => onNavigate(m.redirectHint)}
                  >
                    {tx("chatbot.navigate_to")} {m.redirectHint}
                  </button>
                )}
              </div>
            )
        )}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputRow}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tx("chatbot.placeholder")}
          rows={2}
          disabled={loading}
          aria-label={tx("chatbot.message_aria")}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: loading || !input.trim() ? 0.5 : 1,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
          }}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label={tx("chatbot.send_aria")}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    maxWidth: 600,
    minHeight: 420,
    maxHeight: 600,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  header: {
    background: "#1a1a2e",
    color: "#fff",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontWeight: 600, fontSize: 15 },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f8f9fa",
  },
  botBubble: {
    alignSelf: "flex-start",
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "4px 14px 14px 14px",
    padding: "10px 14px",
    maxWidth: "85%",
    fontSize: 14,
    color: "#1a1a2e",
    lineHeight: 1.5,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  userBubble: {
    alignSelf: "flex-end",
    background: "#1a6b3c",
    color: "#fff",
    borderRadius: "14px 4px 14px 14px",
    padding: "10px 14px",
    maxWidth: "80%",
    fontSize: 14,
    lineHeight: 1.5,
  },
  typing: {
    fontSize: 12,
    color: "#999",
    letterSpacing: 3,
    animation: "blink 1.4s infinite",
  },
  navBtn: {
    marginTop: 6,
    marginLeft: 4,
    background: "#1a6b3c",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "5px 12px",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
  },
  inputRow: {
    display: "flex",
    gap: 8,
    padding: "10px 12px",
    borderTop: "1px solid #e0e0e0",
    background: "#fff",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    resize: "none",
    border: "1px solid #ccc",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    lineHeight: 1.4,
  },
  sendBtn: {
    background: "#1a1a2e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    width: 40,
    height: 40,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
