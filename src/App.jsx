import { useState, useCallback } from 'react'
import { AppShell, Box } from '@mantine/core'
import Sidebar from './components/Sidebar.jsx'
import ChatWindow from './components/ChatWindow.jsx'

const OLLAMA_BASE = 'http://localhost:11434'
//const DEFAULT_MODEL = 'qwen2.5-coder:7b'
const DEFAULT_MODEL = 'qwen2.5:7b'
//const DEFAULT_MODEL = 'qwen3:4b'

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function createChat(title = 'Nueva conversación') {
    return { id: generateId(), title, messages: [], createdAt: Date.now() }
}

export default function App() {
    const [chats, setChats] = useState(() => {
        const initial = createChat()
        return [initial]
    })
    const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id)
    const [model, setModel] = useState(DEFAULT_MODEL)
    const [streaming, setStreaming] = useState(false)

    const activeChat = chats.find(c => c.id === activeChatId)

    const newChat = useCallback(() => {
        const chat = createChat()
        setChats(prev => [chat, ...prev])
        setActiveChatId(chat.id)
    }, [])

    const deleteChat = useCallback((id) => {
        setChats(prev => {
            const next = prev.filter(c => c.id !== id)
            if (activeChatId === id) {
                if (next.length === 0) {
                    const fresh = createChat()
                    setActiveChatId(fresh.id)
                    return [fresh]
                }
                setActiveChatId(next[0].id)
            }
            return next
        })
    }, [activeChatId])

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || streaming) return

        const userMsg = { id: generateId(), role: 'user', content, timestamp: Date.now() }
        const assistantMsg = { id: generateId(), role: 'assistant', content: '', timestamp: Date.now(), streaming: true }

        // Update title on first message
        setChats(prev => prev.map(c => {
            if (c.id !== activeChatId) return c
            const isFirst = c.messages.length === 0
            return {
                ...c,
                title: isFirst ? content.slice(0, 48) : c.title,
                messages: [...c.messages, userMsg, assistantMsg],
            }
        }))

        setStreaming(true)

        try {
            const currentChat = chats.find(c => c.id === activeChatId)
            const history = (currentChat?.messages || []).map(m => ({
                role: m.role,
                content: m.content,
            }))

            const response = await fetch(`${OLLAMA_BASE}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    messages: [...history, { role: 'user', content }],
                    stream: true,
                }),
            })

            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let accumulated = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter(Boolean)

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line)
                        if (data.message?.content) {
                            accumulated += data.message.content
                            setChats(prev => prev.map(c => {
                                if (c.id !== activeChatId) return c
                                return {
                                    ...c,
                                    messages: c.messages.map(m =>
                                        m.id === assistantMsg.id
                                            ? { ...m, content: accumulated }
                                            : m
                                    ),
                                }
                            }))
                        }
                    } catch { /* skip malformed lines */ }
                }
            }

            // Mark streaming done
            setChats(prev => prev.map(c => {
                if (c.id !== activeChatId) return c
                return {
                    ...c,
                    messages: c.messages.map(m =>
                        m.id === assistantMsg.id ? { ...m, streaming: false } : m
                    ),
                }
            }))
        } catch (err) {
            setChats(prev => prev.map(c => {
                if (c.id !== activeChatId) return c
                return {
                    ...c,
                    messages: c.messages.map(m =>
                        m.id === assistantMsg.id
                            ? { ...m, content: `❌ Error conectando con Ollama: ${err.message}\n\nAsegurate de que Ollama esté corriendo en \`${OLLAMA_BASE}\``, streaming: false }
                            : m
                    ),
                }
            }))
        } finally {
            setStreaming(false)
        }
    }, [activeChatId, chats, model, streaming])

    return (
        <AppShell
            navbar={{ width: 260, breakpoint: 'sm' }}
            padding={0}
        >
            <AppShell.Navbar style={{ background: '#08090C', borderRight: '1px solid #1A1D22' }}>
                <Sidebar
                    chats={chats}
                    activeChatId={activeChatId}
                    onSelectChat={setActiveChatId}
                    onNewChat={newChat}
                    onDeleteChat={deleteChat}
                    model={model}
                    onModelChange={setModel}
                />
            </AppShell.Navbar>

            <AppShell.Main
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                    minHeight: 0,
                    background: '#0D0F13',
                    paddingTop: 0,
                }}
            >
                <ChatWindow
                    chat={activeChat}
                    onSend={sendMessage}
                    streaming={streaming}
                    model={model}
                />
            </AppShell.Main>
        </AppShell>
    )
}
