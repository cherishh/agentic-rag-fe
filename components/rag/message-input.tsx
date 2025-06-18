'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 声明全局变量类型
declare global {
  interface Window {
    isDiagnosisRunning?: boolean;
  }
}

interface MessageInputProps {
  inputValue: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

export function MessageInput({ inputValue, isLoading, onInputChange, onSendMessage }: MessageInputProps) {
  const [isDiagnosisRunning, setIsDiagnosisRunning] = useState(false);

  // 监听全局变量变化
  useEffect(() => {
    const checkDiagnosisStatus = () => {
      setIsDiagnosisRunning(!!window.isDiagnosisRunning);
    };

    // 定期检查全局变量状态
    const interval = setInterval(checkDiagnosisStatus, 100);

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const isDisabled = isLoading || isDiagnosisRunning;

  return (
    <div className='p-4 bg-white border-t border-gray-200'>
      <div className='flex gap-2'>
        <Input
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isDiagnosisRunning ? '深度检测中，请稍候...' : '输入您的问题...'}
          className='flex-1'
          disabled={isDisabled}
        />
        <Button onClick={onSendMessage} disabled={isDisabled || !inputValue.trim()} size='icon'>
          <Send className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
