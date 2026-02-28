import { useState } from 'react'
import {
    Stack, Text, Button, TextInput, ScrollArea, Group,
    ActionIcon, Tooltip, Box, Badge,
} from '@mantine/core'
import {
    IconPlus, IconTrash, IconMessage, IconBrain,
    IconChevronDown,
} from '@tabler/icons-react'

export default function Sidebar({
    chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
    model, onModelChange,
}) {
    const [modelInput, setModelInput] = useState(model)
    const [editingModel, setEditingModel] = useState(false)

    const handleModelSubmit = (e) => {
        e.preventDefault()
        if (modelInput.trim()) {
            onModelChange(modelInput.trim())
            setEditingModel(false)
        }
    }

    return (
        <Stack h="100%" gap={0} style={{ overflow: 'hidden' }}>
            {/* Header */}
            <Box p="md" style={{ borderBottom: '1px solid #1A1D22' }}>
                <Group justify="space-between" align="center" mb="xs">
                    <Text
                        size="lg"
                        fw={800}
                        style={{
                            fontFamily: "'Syne', sans-serif",
                            letterSpacing: '-0.5px',
                            color: '#2DD4BF',
                        }}
                    >
                        OLLAMA
                    </Text>
                    <Box
                        style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: '#2DD4BF',
                            boxShadow: '0 0 8px #2DD4BF',
                        }}
                    />
                </Group>

                {/* Model selector */}
                {editingModel ? (
                    <form onSubmit={handleModelSubmit}>
                        <TextInput
                            value={modelInput}
                            onChange={e => setModelInput(e.target.value)}
                            onBlur={() => setEditingModel(false)}
                            autoFocus
                            size="xs"
                            styles={{
                                input: {
                                    background: '#1A1D22',
                                    border: '1px solid #2DD4BF',
                                    color: '#C9CDD4',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.75rem',
                                }
                            }}
                        />
                    </form>
                ) : (
                    <Tooltip label="Click para cambiar modelo" position="right">
                        <Badge
                            variant="outline"
                            color="teal"
                            size="sm"
                            style={{
                                cursor: 'pointer',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '0.7rem',
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                            onClick={() => setEditingModel(true)}
                            rightSection={<IconChevronDown size={10} />}
                        >
                            {model}
                        </Badge>
                    </Tooltip>
                )}
            </Box>

            {/* New chat button */}
            <Box p="sm">
                <Button
                    fullWidth
                    leftSection={<IconPlus size={16} />}
                    variant="light"
                    color="teal"
                    size="sm"
                    onClick={onNewChat}
                    styles={{
                        root: {
                            background: '#0D1F1E',
                            border: '1px solid #1E3533',
                            '&:hover': { background: '#142B29' },
                        }
                    }}
                >
                    Nueva conversación
                </Button>
            </Box>

            {/* Chat list */}
            <ScrollArea flex={1} px="sm">
                <Stack gap={4} pb="md">
                    {chats.map(chat => (
                        <Group
                            key={chat.id}
                            gap={0}
                            style={{
                                borderRadius: 8,
                                cursor: 'pointer',
                                background: chat.id === activeChatId ? '#1A1D22' : 'transparent',
                                border: chat.id === activeChatId ? '1px solid #252930' : '1px solid transparent',
                                transition: 'all 0.15s ease',
                            }}
                            onClick={() => onSelectChat(chat.id)}
                            onMouseEnter={e => {
                                if (chat.id !== activeChatId)
                                    e.currentTarget.style.background = '#13151A'
                            }}
                            onMouseLeave={e => {
                                if (chat.id !== activeChatId)
                                    e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            <Group flex={1} gap="xs" p="xs" style={{ overflow: 'hidden' }}>
                                <IconMessage
                                    size={14}
                                    color={chat.id === activeChatId ? '#2DD4BF' : '#6E7280'}
                                    style={{ flexShrink: 0 }}
                                />
                                <Text
                                    size="xs"
                                    c={chat.id === activeChatId ? 'white' : 'dimmed'}
                                    style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                    }}
                                >
                                    {chat.title}
                                </Text>
                            </Group>
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                mr={4}
                                style={{ opacity: 0, transition: 'opacity 0.15s' }}
                                className="delete-btn"
                                onClick={e => {
                                    e.stopPropagation()
                                    onDeleteChat(chat.id)
                                }}
                            >
                                <IconTrash size={13} />
                            </ActionIcon>
                        </Group>
                    ))}
                </Stack>
            </ScrollArea>

            {/* Footer */}
            <Box p="md" style={{ borderTop: '1px solid #1A1D22' }}>
                <Group gap="xs">
                    <IconBrain size={14} color="#6E7280" />
                    <Text size="xs" c="dimmed">
                        Ollama local · localhost:11434
                    </Text>
                </Group>
            </Box>

            <style>{
            `.mantine-Group-root:hover .delete-btn {
            opacity: 1 !important;
            }`}</style>
        </Stack>
    )
}
