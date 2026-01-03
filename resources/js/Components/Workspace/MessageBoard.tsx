import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Paper,
    Chip,
    Menu,
    MenuItem,
    Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PushPinIcon from '@mui/icons-material/PushPin';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { Channel, Message } from '@/types';
import axios from 'axios';
import { format } from 'date-fns';

interface MessageBoardProps {
    channel: Channel;
}

export default function MessageBoard({ channel }: MessageBoardProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/channels/${channel.id}/messages`);
            setMessages(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [channel.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await axios.post(`/api/v1/channels/${channel.id}/messages`, {
                content: newMessage,
                message_type: 'text',
            });
            setMessages([...messages, response.data.data || response.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, message: Message) => {
        setMenuAnchor(event.currentTarget);
        setSelectedMessage(message);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedMessage(null);
    };

    const handlePinMessage = async () => {
        if (!selectedMessage) return;

        try {
            if (selectedMessage.is_pinned) {
                await axios.delete(`/api/v1/messages/${selectedMessage.id}/pin`);
            } else {
                await axios.post(`/api/v1/messages/${selectedMessage.id}/pin`);
            }
            setMessages(messages.map(m =>
                m.id === selectedMessage.id ? { ...m, is_pinned: !m.is_pinned } : m
            ));
        } catch (error) {
            console.error('Error pinning message:', error);
        }
        handleMenuClose();
    };

    const handleDeleteMessage = async () => {
        if (!selectedMessage) return;

        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await axios.delete(`/api/v1/messages/${selectedMessage.id}`);
                setMessages(messages.filter(m => m.id !== selectedMessage.id));
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
        handleMenuClose();
    };

    const handleReaction = async (messageId: number, emoji: string) => {
        try {
            await axios.post(`/api/v1/messages/${messageId}/reactions`, { emoji });
            // Refresh messages to get updated reactions
            fetchMessages();
        } catch (error) {
            console.error('Error adding reaction:', error);
        }
    };

    const formatMessageTime = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM d, h:mm a');
        } catch {
            return dateString;
        }
    };

    const pinnedMessages = messages.filter(m => m.is_pinned);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Channel Header */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 2, mb: 2 }}>
                <Typography variant="h6">#{channel.name}</Typography>
                {channel.description && (
                    <Typography variant="body2" color="textSecondary">
                        {channel.description}
                    </Typography>
                )}
            </Box>

            {/* Pinned Messages */}
            {pinnedMessages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PushPinIcon fontSize="small" />
                        Pinned Messages
                    </Typography>
                    {pinnedMessages.map((msg) => (
                        <Paper key={msg.id} sx={{ p: 1, mt: 1, bgcolor: 'action.hover' }}>
                            <Typography variant="body2" noWrap>
                                <strong>{msg.user?.name}:</strong> {msg.content}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            )}

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                {loading ? (
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                        Loading messages...
                    </Typography>
                ) : messages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="textSecondary">
                            No messages yet. Start the conversation!
                        </Typography>
                    </Box>
                ) : (
                    messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                gap: 1,
                                mb: 2,
                                '&:hover .message-actions': { opacity: 1 },
                            }}
                        >
                            <Avatar
                                src={message.user?.avatar_url || undefined}
                                sx={{ width: 36, height: 36 }}
                            >
                                {message.user?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {message.user?.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatMessageTime(message.created_at)}
                                    </Typography>
                                    {message.is_pinned && (
                                        <PushPinIcon fontSize="small" color="action" />
                                    )}
                                    <IconButton
                                        size="small"
                                        className="message-actions"
                                        sx={{ opacity: 0, ml: 'auto' }}
                                        onClick={(e) => handleMenuOpen(e, message)}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Typography variant="body2">{message.content}</Typography>
                                {message.reactions && message.reactions.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                        {message.reactions.map((reaction, idx) => (
                                            <Chip
                                                key={idx}
                                                label={`${reaction.emoji} ${reaction.user?.name || ''}`}
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                <Box className="message-actions" sx={{ opacity: 0, mt: 0.5 }}>
                                    <Tooltip title="Add reaction">
                                        <IconButton size="small" onClick={() => handleReaction(message.id, '👍')}>
                                            <EmojiEmotionsIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </Box>
                    ))
                )}
                <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={`Message #${channel.name}`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <IconButton type="submit" color="primary" disabled={sending || !newMessage.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>

            {/* Message Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handlePinMessage}>
                    {selectedMessage?.is_pinned ? 'Unpin' : 'Pin'} Message
                </MenuItem>
                <MenuItem onClick={handleDeleteMessage} sx={{ color: 'error.main' }}>
                    Delete Message
                </MenuItem>
            </Menu>
        </Box>
    );
}
