'use client';

import { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Message } from '@/lib/types';
import { MessageItem } from './message-item';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-4'>
      {messages.length === 0 && (
        <div className='text-center text-gray-500 mt-8'>
          <Bot className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p>开始与RAG助手对话吧！</p>
          <br />
          <p>点击右小角帮助按钮可以看到价格指数数据的目录</p>
        </div>
      )}

      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className='flex justify-start'>
          <div className='bg-white border border-gray-200 rounded-lg px-4 py-2'>
            <div className='flex items-center gap-2'>
              <Bot className='h-5 w-5 text-gray-600' />
              <div className='flex space-x-1'>
                <div className='w-2 h-2 bg-gray-600 rounded-full animate-bounce'></div>
                <div
                  className='w-2 h-2 bg-gray-600 rounded-full animate-bounce'
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className='w-2 h-2 bg-gray-600 rounded-full animate-bounce'
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
