import { useState, useEffect, useRef } from "react";
import classNames from "classnames/bind";
import styles from "./Chatbot.module.scss";
import { Box, IconButton, TextField, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ChatIcon from "@mui/icons-material/Chat";

const cx = classNames.bind(styles);

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <Box className={cx("chat-container")}>
      {!isOpen ? (
        <IconButton color="primary" size="large" onClick={() => setIsOpen(true)}>
          <ChatIcon fontSize="large" />
        </IconButton>
      ) : (
        <Box className={cx("chat-box")}>
          <Box className={cx("chat-header")}>
            <Typography fontWeight="bold">UnetFashion</Typography>
            <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box className={cx("chat-messages")}>
            {messages.length === 0 ? (
                <Typography className={cx("chat-placeholder")}>Xin chào tôi có thẻ giúp gì cho bạn?</Typography>
            ) : (
                messages.map((msg, index) => (
                <Box key={index} className={cx(msg.sender === "user" ? "chat-message-user" : "chat-message-bot")}>
                    {msg.text}
                </Box>
                ))
            )}
            <div ref={messagesEndRef} />
            </Box>

          <Box className={cx("chat-input-container")}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Nhập tin nhắn và nhấn Enter..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className={cx("chat-input")}
            />
            <Button color="primary" onClick={sendMessage} className={cx("send-button")}>
              <SendIcon />
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}