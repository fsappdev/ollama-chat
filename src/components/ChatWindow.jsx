import { useRef, useEffect, useState } from 'react'
import {
    Stack, Box, Text, Textarea, ActionIcon, Group,
    ScrollArea, Loader, Tooltip,
} from '@mantine/core'
import { IconSend, IconUser, IconRobot, IconCopy, IconCheck } from '@tabler/icons-react'
import MessageBubble from './MessageBubble.jsx'

export default function ChatWindow({ chat, onSend, streaming, model }) {
    const [input, setInput] = useState('')
    const viewport = useRef(null)
    const textareaRef = useRef(null)

    const messages = chat?.messages || []

    // Auto-scroll to bottom
    useEffect(() => {
        if (viewport.current) {
            viewport.current.scrollTo({
                top: viewport.current.scrollHeight,
                behavior: 'smooth',
            })
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || streaming) return
        onSend(input.trim())
        setInput('')
        textareaRef.current?.focus()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <Stack h="100%" gap={0} style={{ background: '#0D0F13' }}>
            {/* Top bar */}
            <Box
                px="xl"
                py="md"
                style={{
                    borderBottom: '1px solid #1A1D22',
                    background: '#08090C',
                    flexShrink: 0,
                }}
            >
                <Group justify="space-between">
                    <Text
                        size="sm"
                        fw={600}
                        style={{ fontFamily: "'Syne', sans-serif", color: '#9EA3AD' }}
                    >
                        {chat?.title || 'Nueva conversación'}
                    </Text>
                    <Text
                        size="xs"
                        c="dimmed"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                        {model}
                    </Text>
                </Group>
            </Box>

            {/* Messages */}
            <ScrollArea
                flex={1}
                viewportRef={viewport}
                style={{ background: '#0D0F13' }}
            >
                <Box px={{ base: 'md', sm: 'xl', lg: '10%' }} py="xl">
                    {messages.length === 0 ? (
                        <EmptyState model={model} />
                    ) : (
                        <Stack gap="xl">
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}
                        </Stack>
                    )}
                </Box>
            </ScrollArea>

            {/* Input area */}
            <Box
                px={{ base: 'md', sm: 'xl', lg: '10%' }}
                py="md"
                style={{
                    borderTop: '1px solid #1A1D22',
                    background: '#08090C',
                    flexShrink: 0,
                }}
            >
                <Box
                    style={{
                        background: '#13151A',
                        border: '1px solid #252930',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 8,
                        padding: '8px 8px 8px 16px',
                        transition: 'border-color 0.2s',
                    }}
                    onFocusCapture={e => e.currentTarget.style.borderColor = '#2DD4BF44'}
                    onBlurCapture={e => e.currentTarget.style.borderColor = '#252930'}
                >
                    <Textarea
                        ref={textareaRef}
                        flex={1}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu mensaje... (Enter para enviar, Shift+Enter nueva línea)"
                        autosize
                        minRows={1}
                        maxRows={6}
                        disabled={streaming}
                        styles={{
                            input: {
                                background: 'transparent',
                                border: 'none',
                                color: '#C9CDD4',
                                fontFamily: "'Syne', sans-serif",
                                fontSize: '0.9rem',
                                resize: 'none',
                                padding: 0,
                                '&:focus': { outline: 'none' },
                                '&::placeholder': { color: '#4C515C' },
                            },
                            wrapper: { flex: 1 },
                        }}
                    />
                    <Tooltip label={streaming ? 'Generando...' : 'Enviar (Enter)'}>
                        <ActionIcon
                            size="lg"
                            color="teal"
                            variant={streaming ? 'subtle' : 'filled'}
                            onClick={handleSend}
                            disabled={streaming || !input.trim()}
                            style={{ flexShrink: 0, borderRadius: 8 }}
                        >
                            {streaming ? <Loader size="xs" color="teal" /> : <IconSend size={16} />}
                        </ActionIcon>
                    </Tooltip>
                </Box>
                <Text size="xs" c="dimmed" ta="center" mt={6}>
                    Los modelos locales pueden cometer errores. Verifica información importante.
                </Text>
            </Box>
        </Stack>
    )
}

function EmptyState({ model }) {
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                gap: 16,
            }}
        >
            <Box
                style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, #0D1F1E 0%, #142B29 100%)',
                    border: '1px solid #1E3533',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 32px #2DD4BF22',
                }}
            >
                <IconRobot size={32} color="#2DD4BF" />
            </Box>
            <Stack gap={4} align="center">
                <Text
                    size="xl"
                    fw={700}
                    style={{ fontFamily: "'Syne', sans-serif", color: '#C9CDD4' }}
                >
                    ¿En qué te ayudo?
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={400}>
                    Conectado a{' '}
                    <Text span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2DD4BF', fontSize: '0.8em' }}>
                        {model}
                    </Text>{' '}
                    vía Ollama local
                </Text>
            </Stack>
        </Box>
    )
}
