'use client';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, X, Send } from 'lucide-react';
import api from '@/lib/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [started, setStarted] = useState(false);
  const [unread, setUnread] = useState(0);
  const endRef = useRef();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sid = localStorage.getItem('chat_session');
    if (sid) {
      setSessionId(sid);
      setStarted(true);
    }
  }, []);

  useEffect(() => {
    if (!started || !sessionId) return;

    const s = io('http://localhost:5000/chat');
    s.on('connect', () => {
      s.emit('user:join', { sessionId, name, email });
    });
    s.on('chat:history', ({ messages }) => setMessages(messages));
    s.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!open && msg.senderType === 'admin') setUnread((u) => u + 1);
    });
    s.on('chat:closed', () => {
      localStorage.removeItem('chat_session');
      setStarted(false);
      setSessionId(null);
      setMessages([]);
    });
    setSocket(s);
    return () => s.disconnect();
  }, [started, sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const start = async () => {
    if (!name.trim()) return alert('اسمت رو بنویس');
    const { data } = await api.post('/chat/start', { name, email });
    localStorage.setItem('chat_session', data.sessionId);
    setSessionId(data.sessionId);
    setStarted(true);
  };

  const send = () => {
    if (!text.trim() || !socket) return;
    socket.emit('message:send', {
      chatId: messages[0]?.LiveChatId || null,
      content: text,
      senderType: 'user',
      senderName: name || 'کاربر'
    });
    setText('');
  };

  // برای ارسال، اول باید chatId رو بدونیم
  // یه راه ساده: توی message:send اگه chatId نداشتیم، از سرور بگیریم
  const sendMsg = () => {
    if (!text.trim() || !socket || !sessionId) return;
    api.get(`/chat/session/${sessionId}`).then((r) => {
      socket.emit('message:send', {
        chatId: r.data.chat.id,
        content: text,
        senderType: 'user',
        senderName: name || 'کاربر'
      });
      setText('');
    });
  };

return (
  <>
    <button
      onClick={() => { setOpen(!open); setUnread(0); }}
      className={`fixed z-50 bg-[#66c0f4] text-[#171a21] p-4 rounded-full shadow-2xl hover:bg-[#4fa8d8] transition-all animate-pulse-ring ${
        open ? 'bottom-6 left-6 rotate-90' : 'bottom-6 left-6'
      }`}
    >
      {open ? <X size={24} /> : <MessageCircle size={24} />}
      {!open && unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
          {unread}
        </span>
      )}
    </button>

    {open && (
      <div className="fixed z-50 bg-[#171a21] border border-[#2a475e] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-bounce-in
        left-4 right-4 bottom-24 top-20
        sm:left-6 sm:right-auto sm:bottom-24 sm:top-auto sm:w-80 sm:h-[500px]">
        {/* هدر */}
        <div className="bg-gradient-to-l from-[#66c0f4] to-[#4fa8d8] text-[#171a21] p-4 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
            پشتیبانی آنلاین
          </div>
          <button onClick={() => setOpen(false)} className="sm:hidden">
            <X size={20} />
          </button>
        </div>

        {!started ? (
          <div className="p-4 space-y-3 flex-1">
            <p className="text-sm text-gray-400">برای شروع چت، اسمت رو بنویس:</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام شما"
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل (اختیاری)"
              className="w-full bg-[#0f1922] border border-[#2a475e] rounded p-3 text-sm"
            />
            <button
              onClick={start}
              className="w-full bg-[#66c0f4] text-[#171a21] py-3 rounded font-bold hover:bg-[#4fa8d8] transition"
            >
              شروع گفتگو
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      m.senderType === 'user'
                        ? 'bg-[#66c0f4] text-[#171a21]'
                        : m.senderType === 'system'
                        ? 'bg-gray-700 text-xs'
                        : 'bg-[#2a475e]'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">{m.senderName}</div>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            <div className="p-3 border-t border-[#2a475e] flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                placeholder="پیام..."
                className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded p-2 text-sm"
              />
              <button
                onClick={sendMsg}
                className="bg-[#66c0f4] text-[#171a21] p-2 rounded hover:bg-[#4fa8d8] transition"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    )}
  </>
);
}