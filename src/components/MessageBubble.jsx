import { useState, useCallback } from 'react'
import { Box, Text, Group, ActionIcon, Tooltip, CopyButton } from '@mantine/core'
import { IconUser, IconRobot, IconCopy, IconCheck } from '@tabler/icons-react'

/**
 * Simple markdown renderer:
 * - Code blocks (```...```)
 * - Inline code (`...`)
 * - Bold (**...**)
 * - Line breaks
 */
function renderContent(text) {
    const parts = []
    let remaining = text
    let key = 0

    // Split by code blocks first
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match

    codeBlockRegex.lastIndex = 0
    while ((match = codeBlockRegex.exec(text)) !== null) {
        // Text before code block
        if (match.index > lastIndex) {
            parts.push(
                <span key={key++}>
                    {renderInline(text.slice(lastIndex, match.index))}
                </span>
            )
        }
        // Code block
        const lang = match[1] || ''
        const code = match[2]
        parts.push(
            <Box key={key++} style={{ position: 'relative', margin: '12px 0' }}>
                {lang && (
                    <Box
                        style={{
                            background: '#1A1D22',
                            borderRadius: '8px 8px 0 0',
                            padding: '4px 12px',
                            borderBottom: '1px solid #252930',
                        }}
                    >
                        <Text size="xs" c="dimmed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {lang}
                        </Text>
                    </Box>
                )}
                <pre style={{ margin: 0, borderRadius: lang ? '0 0 8px 8px' : 8 }}>
                    <code>{code.trim()}</code>
                </pre>
                <CopyButton value={code.trim()}>
                    {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copiado!' : 'Copiar código'}>
                            <ActionIcon
                                size="sm"
                                variant="subtle"
                                color={copied ? 'teal' : 'gray'}
                                onClick={copy}
                                style={{ position: 'absolute', top: lang ? 28 : 8, right: 8 }}
                            >
                                {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </CopyButton>
            </Box>
        )
        lastIndex = match.index + match[0].length
    }

    // Remaining text after last code block
    if (lastIndex < text.length) {
        parts.push(
            <span key={key++}>
                {renderInline(text.slice(lastIndex))}
            </span>
        )
    }

    return parts.length > 0 ? parts : renderInline(text)
}

function renderInline(text) {
    // Split by inline code and bold
    const segments = []
    const regex = /`([^`]+)`|\*\*([^*]+)\*\*/g
    let last = 0
    let m
    let k = 0

    while ((m = regex.exec(text)) !== null) {
        if (m.index > last) {
            segments.push(<span key={k++}>{renderLineBreaks(text.slice(last, m.index))}</span>)
        }
        if (m[1] !== undefined) {
            // inline code
            segments.push(
                <code key={k++} style={{
                    background: '#1A1D22',
                    border: '1px solid #353A43',
                    borderRadius: 4,
                    padding: '0.1em 0.4em',
                    color: '#2DD4BF',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.85em',
                }}>
                    {m[1]}
                </code>
            )
        } else if (m[2] !== undefined) {
            // bold
            segments.push(<strong key={k++} style={{ color: '#fff' }}>{m[2]}</strong>)
        }
        last = m.index + m[0].length
    }

    if (last < text.length) {
        segments.push(<span key={k++}>{renderLineBreaks(text.slice(last))}</span>)
    }

    return segments.length > 0 ? segments : renderLineBreaks(text)
}

function renderLineBreaks(text) {
    return text.split('\n').map((line, i, arr) => (
        <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
        </span>
    ))
}

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user'
    const isStreaming = message.streaming

    return (
        <Group
            align="flex-start"
            gap="sm"
            style={{ flexDirection: isUser ? 'row-reverse' : 'row' }}
        >
            {/* Avatar */}
            <Box
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isUser ? '#1E3A4C' : '#0D1F1E',
                    border: `1px solid ${isUser ? '#2A5A72' : '#1E3533'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                {isUser
                    ? <IconUser size={16} color="#38BDF8" />
                    : <IconRobot size={16} color="#2DD4BF" />
                }
            </Box>

            {/* Bubble */}
            <Box
                style={{
                    maxWidth: '80%',
                    position: 'relative',
                }}
            >
                <Box
                    style={{
                        background: isUser ? '#0D2235' : '#13151A',
                        border: `1px solid ${isUser ? '#1E3A4C' : '#1A1D22'}`,
                        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        padding: '12px 16px',
                        color: '#C9CDD4',
                        fontSize: '0.9rem',
                        lineHeight: 1.7,
                        wordBreak: 'break-word',
                    }}
                >
                    <Text
                        component="div"
                        size="sm"
                        style={{ lineHeight: 1.7 }}
                    >
                        {renderContent(message.content)}
                        {isStreaming && <span className="cursor-blink" />}
                    </Text>
                </Box>

                {/* Copy button for assistant messages */}
                {!isUser && !isStreaming && message.content && (
                    <CopyButton value={message.content}>
                        {({ copied, copy }) => (
                            <Tooltip label={copied ? 'Copiado!' : 'Copiar respuesta'} position="bottom">
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color={copied ? 'teal' : 'gray'}
                                    onClick={copy}
                                    style={{
                                        position: 'absolute',
                                        bottom: -20,
                                        left: 8,
                                        opacity: 0.6,
                                    }}
                                >
                                    {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                )}
            </Box>
        </Group>
    )
}
