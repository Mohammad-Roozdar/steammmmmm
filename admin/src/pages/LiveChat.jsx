import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api'
import { Send, User as UserIcon, Headphones } from 'lucide-react'

export default function LiveChat() {
  const [socket, setSocket] = useState(null)
  const [chats, setChats] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef()

  useEffect(() => {
    const s = io('http://localhost:5000/chat')
    s.emit('admin:join')
    s.on('chat:new', (chat) => setChats(prev => [chat, ...prev]))
    s.on('chat:update', (chat) => {
      setChats(prev => {
        const idx = prev.findIndex(c => c.id === chat.id)
        if (idx === -1) return [chat, ...prev]
        const copy = [...prev]; copy[idx] = chat; return copy
      })
    })
    s.on('chat:opened', (chat) => {
      setChats(prev => prev.map(c => c.id === chat.id ? chat : c))
    })
    s.on('message:new', (msg) => {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    s.on('typing', ({ who }) => {
      setTyping(who === 'user')
      setTimeout(() => setTyping(false), 2000)
    })
    setSocket(s)
    loadChats()
    return () => s.disconnect()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadChats = async () => {
    try {
      const { data } = await api.get('/chat/admin/all')
      setChats(data)
    } catch {}
  }

  const openChat = (chat) => {
    setActive(chat)
    socket.emit('admin:open', chat.id)
  }

  const send = () => {
    if (!text.trim() || !active) return
    socket.emit('message:send', {
      chatId: active.id, content: text,
      senderType: 'admin', senderName: 'پشتیبانی'
    })
    setText('')
  }

  const closeChat = () => {
    if (active) socket.emit('chat:close', active.id)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <aside className="w-80 bg-[#171a21] rounded-xl border border-[#2a475e] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#2a475e] font-bold flex items-center gap-2">
          <Headphones size={18} /> چت‌های آنلاین
        </div>
        <div className="flex-1 overflow-auto">
          {chats.map(c => (
            <button
              key={c.id}
              onClick={() => openChat(c)}
              className={`w-full text-right p-3 border-b border-[#2a475e] hover:bg-[#2a475e] ${
                active?.id === c.id ? 'bg-[#2a475e]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#66c0f4] text-[#0f1922] flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {c.guestName || c.User?.username || 'مهمان'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {c.status === 'waiting' ? '🟡 در انتظار' :
                       c.status === 'active' ? '🟢 فعال' : '⚫ بسته'}
                    </div>
                  </div>
                </div>
                {c.unreadAdmin > 0 && (
                  <span className="bg-red-500 text-xs px-2 rounded-full">{c.unreadAdmin}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1 truncate">{c.lastMessage}</div>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">چتی نیست</div>
          )}
        </div>
      </aside>

      <div className="flex-1 bg-[#171a21] rounded-xl border border-[#2a475e] flex flex-col">
        {active ? (
          <>
            <div className="p-4 border-b border-[#2a475e] flex items-center justify-between">
              <div>
                <div className="font-bold">{active.guestName || active.User?.username}</div>
                <div className="text-xs text-gray-500">{active.guestEmail}</div>
              </div>
              <button onClick={closeChat} className="text-red-400 text-sm hover:underline">
                بستن چت
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex ${m.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      m.senderType === 'admin'
                        ? 'bg-[#66c0f4] text-[#0f1922]'
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
              {typing && <div className="text-xs text-gray-500">✏️ در حال تایپ...</div>}
              <div ref={endRef} />
            </div>
            <div className="p-4 border-t border-[#2a475e] flex gap-2">
              <input
                value={text}
                onChange={e => {
                  setText(e.target.value)
                  socket.emit('typing', { chatId: active.id, who: 'admin' })
                }}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="پاسخ..."
                className="flex-1 bg-[#0f1922] border border-[#2a475e] rounded p-3"
              />
              <button onClick={send} className="bg-[#66c0f4] text-[#0f1922] p-3 rounded hover:bg-[#4fa8d8]">
                <Send size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            یک چت را انتخاب کنید
          </div>
        )}
      </div>
    </div>
  )
}