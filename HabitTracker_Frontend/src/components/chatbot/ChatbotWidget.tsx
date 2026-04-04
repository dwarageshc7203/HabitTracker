import { useState } from 'react'

const ChatbotWidget = () => {
  const suggestions = [
    'Suggest a habit',
    'What should I do today?',
    'How to build better habits?',
  ]
  const [isMinimized, setIsMinimized] = useState(false)

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
            You are on a great streak. Want to add a 5 minute stretch today?
          </div>
          <div className="chatbot-bubble">
            I can suggest a quick habit based on your schedule.
          </div>
        </div>
        <div className="chatbot-suggestions">
          {suggestions.map((item) => (
            <button key={item} className="btn btn-secondary" type="button">
              {item}
            </button>
          ))}
        </div>
        <div className="chatbot-input">
          <input
            className="input"
            type="text"
            placeholder="Ask the assistant"
            aria-label="Ask the assistant"
          />
          <button className="btn btn-primary" type="button">
            Send
          </button>
        </div>
      </div>
    </aside>
  )
}

export default ChatbotWidget
