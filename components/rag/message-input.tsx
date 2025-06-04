'use client';

import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function MessageInput({ inputValue, isLoading, onInputChange, onSendMessage }: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className='p-4 bg-white border-t border-gray-200'>
      <div className='flex gap-2'>
        <Input
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='输入您的问题...'
          className='flex-1'
          disabled={isLoading}
        />
        <Button onClick={onSendMessage} disabled={isLoading || !inputValue.trim()} size='icon'>
          <Send className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
