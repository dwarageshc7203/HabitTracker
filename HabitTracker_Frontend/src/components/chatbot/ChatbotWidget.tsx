import axios from 'axios'
import { useState } from 'react'
import { aiService } from '../../services/aiService'
import { habitService } from '../../services/habitService'
import type { HabitSuggestion } from '../../types/api'

const quickPrompts = [
  'Suggest a habit',
  'What should I do today?',
  'How to build better habits?',
]

const ChatbotWidget = () => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<HabitSuggestion[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [adding, setAdding] = useState<Record<number, boolean>>({})
  const [added, setAdded] = useState<Record<number, boolean>>({})

  const handleSend = async (prompt: string) => {
    const trimmed = prompt.trim()
    if (!trimmed) {
      return
    }

    setStatus('loading')
    setErrorMessage('')
    try {
      const data = await aiService.suggestHabits(trimmed)
      setSuggestions(data)
      setStatus('idle')
    } catch (error) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined
      setStatus('error')
      setErrorMessage(apiMessage ?? 'Unable to fetch suggestions right now.')
    }
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    void handleSend(prompt)
  }

  const handleAddHabit = async (suggestion: HabitSuggestion, index: number) => {
    if (adding[index] || added[index]) {
      return
    }

    setAdding((prev) => ({ ...prev, [index]: true }))
    setErrorMessage('')
    try {
      await habitService.createHabit({
        name: suggestion.habitName,
        category: suggestion.habitCategory,
        difficulty: suggestion.habitDifficulty,
      })
      setAdded((prev) => ({ ...prev, [index]: true }))
    } catch (error) {
      setErrorMessage('Unable to add this habit right now.')
    } finally {
      setAdding((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <aside
      className={`chatbot-widget ${isMinimized ? 'is-minimized' : ''}`}
      aria-label="Habit assistant"
    >
      <button
        className="chatbot-orb"
        type="button"
        onClick={() => setIsMinimized(false)}
        aria-label="Open habit assistant"
      >
        <span className="orb-core" />
        <span className="orb-ring" />
      </button>
      <div className="chatbot-panel" aria-hidden={isMinimized}>
        <div className="chatbot-header">
          <span>Habit Assistant</span>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => setIsMinimized(true)}
          >
            Minimize
          </button>
        </div>
        <div className="chatbot-messages">
          <div className="chatbot-bubble">
            Tell me what you want to improve and I will suggest a few habits.
          </div>
          {status === 'loading' && (
            <div className="chatbot-bubble chatbot-status">
              Finding habits for you...
            </div>
          )}
          {status === 'error' && errorMessage && (
            <div className="chatbot-bubble chatbot-error">{errorMessage}</div>
          )}
        </div>
        {suggestions.length > 0 ? (
          <div className="chatbot-results">
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.habitName}-${index}`} className="chatbot-card">
                <div className="chatbot-card-text">
                  <div className="chatbot-card-title">{suggestion.habitName}</div>
                  <div className="chatbot-card-meta">
                    {suggestion.habitCategory} · {suggestion.habitDifficulty}
                  </div>
                </div>
                <button
                  className="btn btn-primary chatbot-add"
                  type="button"
                  onClick={() => void handleAddHabit(suggestion, index)}
                  disabled={adding[index] || added[index]}
                >
                  {added[index] ? 'Added' : adding[index] ? 'Adding...' : '+ Add'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="chatbot-suggestions">
            {quickPrompts.map((item) => (
              <button
                key={item}
                className="btn btn-secondary"
                type="button"
                onClick={() => handleQuickPrompt(item)}
              >
                {item}
              </button>
            ))}
          </div>
        )}
        <div className="chatbot-input">
          <input
            className="input"
            type="text"
            placeholder="Ask the assistant"
            aria-label="Ask the assistant"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleSend(input)
              }
            }}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => void handleSend(input)}
            disabled={status === 'loading'}
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  )
}

export default ChatbotWidget
