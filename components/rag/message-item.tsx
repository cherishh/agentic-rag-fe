'use client';

import { User, Bot } from 'lucide-react';
import { Message } from '@/lib/types';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        <div className='flex items-start gap-2'>
          {message.role === 'assistant' && <Bot className='h-5 w-5 mt-0.5 text-gray-600' />}
          {message.role === 'user' && <User className='h-5 w-5 mt-0.5' />}
          <div className='flex-1'>
            <div className='whitespace-pre-wrap text-sm'>{message.content}</div>
            <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
