import React, { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { chatAPI } from '../services/api'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'

const SUGGESTIONS = [
  'What documents are missing?',
  'What is my compliance score?',
  'Why is my application pending?',
  'What are the next steps?',
]

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm VendorAI, your onboarding assistant. Ask me about your documents, compliance score, or application status." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const message = text || input
    if (!message.trim() || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setLoading(true)

    try {
      const res = await chatAPI.sendMessage({ message, sessionId })
      setSessionId(res.data.sessionId)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch {
      toast.error('Failed to get response')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
      <PageHeader
        title="AI Onboarding Assistant"
        description="Powered by Google Gemini — context-aware answers about your onboarding"
        badge={<span className="badge bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"><Sparkles className="w-3 h-3" /> AI</span>}
      />

      <Card className="flex-1 flex flex-col overflow-hidden !p-0 shadow-elevated" noPadding>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md shadow-soft'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Bot className="w-4 h-4 text-slate-500" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-200/80 dark:border-slate-700/80 p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                           text-slate-600 dark:text-slate-400 hover:border-primary-300 dark:hover:border-primary-700
                           hover:text-primary-600 dark:hover:text-primary-400 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage() }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your onboarding..."
              className="input flex-1"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn btn-primary px-4">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default ChatBot
