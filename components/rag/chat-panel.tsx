'use client';

import { Message, ServiceStatus as ServiceStatusType, ConfigInfo } from '@/lib/types';
import { ServiceStatus } from './service-status';
import { ConfigPanel } from './config-panel';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { ExternalLink } from 'lucide-react';

interface ChatPanelProps {
  messages: Message[];
  inputValue: string;
  mode: string;
  dataset: string;
  isLoading: boolean;
  serviceStatus: ServiceStatusType | null;
  statusLoading: boolean;
  configInfo: ConfigInfo;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onModeChange: (value: string) => void;
  onDatasetChange: (value: string) => void;
  onRefreshStatus: () => void;
}

export function ChatPanel({
  messages,
  inputValue,
  mode,
  dataset,
  isLoading,
  serviceStatus,
  statusLoading,
  configInfo,
  onInputChange,
  onSendMessage,
  onModeChange,
  onDatasetChange,
  onRefreshStatus,
}: ChatPanelProps) {
  return (
    <div className='flex flex-col border-r border-gray-200 h-full'>
      {/* 头部配置区域 */}
      <div className='p-4 bg-white border-b border-gray-200'>
        <h1 className='text-xl font-semibold mb-4 text-gray-800 flex items-center justify-between'>
          <span>RAG Chatbot Demo</span>
          <a
            className='underline underline-offset-2 text-sm text-gray-500 flex items-center gap-1'
            href='https://github.com/cherishh/agentic-rag-ts'
            target='_blank'
            rel='noopener noreferrer'
          >
            查看对应后端服务
            <ExternalLink className='w-4 h-4' />
          </a>
        </h1>

        {/* 服务状态指示器 */}
        <ServiceStatus serviceStatus={serviceStatus} statusLoading={statusLoading} onRefresh={onRefreshStatus} />

        {/* 配置面板 */}
        <ConfigPanel
          mode={mode}
          dataset={dataset}
          configInfo={configInfo}
          onModeChange={onModeChange}
          onDatasetChange={onDatasetChange}
        />
      </div>

      {/* 聊天消息区域 */}
      <MessageList messages={messages} isLoading={isLoading} />

      {/* 输入区域 */}
      <MessageInput
        inputValue={inputValue}
        isLoading={isLoading}
        onInputChange={onInputChange}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}
