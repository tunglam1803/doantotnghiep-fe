import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Chatbot.module.scss';
import { Box, IconButton, TextField, Typography, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Hỗ trợ bảng, danh sách,...

const cx = classNames.bind(styles);

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Chào bạn! Mình là Unetbot, trợ lý ảo của UnetFashion Shop. Mình có thể giúp gì cho bạn ạ?" }
  ]);  
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  // Tự động scroll xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:4999/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, token }),
      });

      if (!response.ok) throw new Error('Lỗi khi gửi tin nhắn!');

      const result = await response.json();
      console.log('API Response:', result);

      if (result.response && Array.isArray(result.response)) {
        const botMessage = { role: 'assistant', content: result.response.join('') };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('Dữ liệu API không hợp lệ:', result);
      }
    } catch (error) {
      console.error('Lỗi khi gọi API chatbot:', error);
    }
  };

  return (
    <Box className={cx('chat-container')}>
      {!isOpen ? (
        <IconButton className={cx('chat-icon')} color="primary" size="large" onClick={() => setIsOpen(true)}>
          <ChatIcon fontSize="large" /> {''} Trò chuyện với AI
        </IconButton>
      ) : (
        <Box className={cx('chat-box')}>
          <Box className={cx('chat-header')}>
            <Typography variant="h4" fontWeight="bold">Trò chuyện với AI</Typography>
            <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className={cx('chat-messages')}>
            {/* <img src="/images/OIP.jpg" alt="bot" /> */}
            {messages.length === 0 ? (
              <Typography className={cx('chat-placeholder')}>Xin chào! Unee-Chan có thể giúp gì cho bạn?</Typography>
            ) : (
              messages.map((msg, index) => (
                <Box key={index} className={cx(msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot')}>
                  {/* Dùng ReactMarkdown để hiển thị markdown */}
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box className={cx('chat-input-container')}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Nhập tin nhắn và nhấn Enter..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className={cx('chat-input')}
            />
            <Button color="primary" onClick={sendMessage} className={cx('send-button')}>
              <SendIcon />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}