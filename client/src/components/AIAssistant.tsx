'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Maximize2, Minimize2, Send, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '你好！我是你的營養助理。有什麼我可以幫你的嗎？' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isFull]);

  const handleSend = async (textToSend?: string) => {
    try {
      const messageContent = textToSend || input;
      if (!messageContent || !messageContent.trim() || isLoading) return;

      const userMessage: Message = { role: 'user', content: messageContent };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'lmstudio-community/gpt-oss-20b-GGUF/gpt-oss-20b-MXFP4.gguf', // 使用更完整的模型路徑
          messages: [
            { 
              role: 'system', 
              content: '你是一位專業的營養搭配助理。你的任務是根據用戶提供的食物，給出科學的營養搭配建議，幫助用戶實現均衡飲食。請務必使用 Markdown 格式（如表格、列表、粗體）來讓排版美觀。請提供具體的卡路里、蛋白質、脂肪和碳水化合物的概算（如果可能），並建議搭配哪些食物會更好。請保持回答簡明扼要，使用繁體中文。' 
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            userMessage
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'AI 服務連線失敗');
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('AI 返回了無效的格式');
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `抱歉，發生了錯誤：${error.message}。請確保 AI 服務接口已啟動並正確連接。` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFull = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFull(!isFull);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) setIsFull(false); // 關閉時重置全屏
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {/* 懸浮按鈕 */}
      <button
        onClick={toggleOpen}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isOpen ? <X size={28} /> : 'AI'}
      </button>

      {/* 聊天窗口 */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: isFull ? '-20px' : '80px',
            right: isFull ? '-20px' : '0',
            width: isFull ? 'calc(100vw - 40px)' : '450px',
            height: isFull ? 'calc(100vh - 40px)' : '600px',
            maxWidth: isFull ? 'none' : '450px',
            maxHeight: isFull ? 'none' : '600px',
            backgroundColor: 'white',
            borderRadius: isFull ? '0' : '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out',
            zIndex: 1001,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '15px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>營養搭配助手</span>
              <span style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>Powered by LM Studio</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={toggleFull}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}
                title={isFull ? "縮小" : "全屏"}
              >
                {isFull ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button 
                onClick={toggleOpen}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              backgroundColor: '#f9f9f9'
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.role === 'user' ? 'var(--primary)' : 'white',
                  color: m.role === 'user' ? 'white' : 'var(--text)',
                  padding: '12px 18px',
                  borderRadius: '15px',
                  borderTopRightRadius: m.role === 'user' ? '2px' : '15px',
                  borderTopLeftRadius: m.role === 'assistant' ? '2px' : '15px',
                  maxWidth: isFull ? '70%' : '90%',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                }}
              >
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', backgroundColor: 'white', padding: '12px 18px', borderRadius: '15px', fontSize: '14px', borderTopLeftRadius: '2px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <span>AI 正在思考中...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {!isLoading && messages.length === 1 && (
            <div style={{ padding: '15px 20px', display: 'flex', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #eee', backgroundColor: 'white' }}>
              {[
                '🍎 推薦今天的午餐搭配',
                '🍱 這份便當營養嗎？',
                '💪 如何增加蛋白質？',
                '♻️ 剩食再利用建議'
              ].map((text) => (
                <button
                  key={text}
                  onClick={() => handleSend(text)}
                  style={{
                    fontSize: '13px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #e0e0e0',
                    background: '#fff',
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.color = '#666';
                  }}
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '12px', backgroundColor: 'white' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="詢問營養建議..."
              style={{
                flex: 1,
                padding: '12px 20px',
                border: '1px solid #ddd',
                borderRadius: '30px',
                outline: 'none',
                fontSize: '15px'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={(e) => !isLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Send size={20} />
            </button>
          </div>
          
          <style jsx global>{`
            .markdown-content table {
              border-collapse: collapse;
              width: 100%;
              margin: 15px 0;
              font-size: 14px;
              color: inherit;
            }
            .markdown-content th, .markdown-content td {
              border: 1px solid #ddd;
              padding: 10px 12px;
              text-align: left;
            }
            .markdown-content th {
              background-color: rgba(0,0,0,0.05);
            }
            .markdown-content p {
              margin: 10px 0;
            }
            .markdown-content ul, .markdown-content ol {
              padding-left: 25px;
              margin: 10px 0;
            }
            .markdown-content strong {
              color: inherit;
              font-weight: bold;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
