import { useEffect, useRef, useState } from 'react'
import { chatWithAssistant } from '../services/api'

/**
 * Floating rule-based chatbot for resume guidance.
 * It stays decoupled from the main analysis UI and only receives optional analysis context.
 */
function ChatBot({ analysisResult = null }) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your Resume Assistant. Ask me about ATS score, missing skills, or career growth.',
    },
  ])
  const messagesEndRef = useRef(null)

  // Keep the latest message visible after each update.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    try {
      const payload = analysisResult
        ? {
            missing_skills: analysisResult.missingSkills || [],
            matched_skills: analysisResult.matchedSkills || [],
            ats_score: analysisResult.atsScore ?? 0,
          }
        : null

      const data = await chatWithAssistant(trimmed, payload)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.reply || 'I can help with resume improvement, skills, and career advice.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'I am unable to respond right now. Please try again.',
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const handleEnter = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end sm:bottom-6 sm:right-6">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto group relative flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 p-1 shadow-[0_8px_30px_rgba(45,212,191,0.5)] transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(45,212,191,0.7)]"
          aria-label="Open AI Assistant"
          title="Resume Assistant"
        >
          <span className="absolute inset-0 rounded-full bg-emerald-400/50 blur-xl animate-pulse transition-colors duration-500 group-hover:bg-cyan-400/60" />

          <div className="relative z-10 grid h-full w-full place-items-center rounded-full bg-transparent">
            <img
              src="/robot.png"
              alt="AI Assistant Robot"
              className="h-10 w-10 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
            />
          </div>
        </button>
      )}

      <div
        className={`absolute bottom-20 right-0 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-300 sm:w-96 ${
          isOpen
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-4 scale-95 opacity-0'
        }`}
      >
        <div className="flex h-[min(34rem,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-2xl border border-white/20 bg-slate-900/85 backdrop-blur-xl shadow-2xl shadow-cyan-900/30">
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
            <h3 className="font-semibold text-cyan-100">Resume Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat assistant"
            >
              x
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'border border-cyan-300/40 bg-cyan-400/30 text-cyan-50'
                      : 'border border-white/20 bg-white/10 text-slate-100'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-slate-200 animate-pulse">
                  Assistant is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/15 bg-slate-950/40 p-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleEnter}
              placeholder="Ask about ATS, missing skills..."
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-300 outline-none transition-colors focus:border-cyan-300/70"
            />
            <button
              onClick={handleSend}
              disabled={isThinking || !input.trim()}
              className="rounded-xl bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatBot
