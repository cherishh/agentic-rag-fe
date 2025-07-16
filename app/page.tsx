'use client';

import { useState, useEffect } from 'react';
import {
  Message,
  ServiceStatus as ServiceStatusType,
  RagResponse,
  CrossQueryDataItem,
  ApiResponseData,
} from '@/lib/types';
import { callRagApi, checkServiceStatus, getCurrentConfigInfo } from '@/lib/api';
import { ChatPanel, ResponsePanel, ResizableLayout, HelpPanel } from '@/components/rag';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('basic_rag');
  const [dataset, setDataset] = useState('price_index_statistics');
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<RagResponse | null>(null);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatusType | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // 检查服务状态
  const handleCheckServiceStatus = async () => {
    setStatusLoading(true);
    const result = await checkServiceStatus();

    if (result.data) {
      setServiceStatus(result.data);
    } else {
      setServiceStatus(result.error);
    }

    setStatusLoading(false);
  };

  // 页面初始化时检查服务状态
  useEffect(() => {
    handleCheckServiceStatus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // 调用实际API
      const apiResponse = await callRagApi(currentQuery);
      setRawResponse(apiResponse);

      let responseContent = '';

      // 检查是否是cross query的特殊响应格式
      if (dataset === 'cross_query' && Array.isArray(apiResponse.data)) {
        // 处理cross query的数组响应
        const crossData = apiResponse.data as CrossQueryDataItem[];
        responseContent = crossData
          .map((item: CrossQueryDataItem) => {
            return `"${item.dataset}"上的回复：\n${item.response}`;
          })
          .join('\n\n');
      } else {
        // 处理标准的单一响应格式
        const standardData = apiResponse.data as ApiResponseData;
        responseContent = standardData.response || '抱歉，没有获取到有效的回复。';
      }

      // 创建助手回复消息
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Request failed:', error);

      // 显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，处理您的请求时出现了错误：${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      setRawResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前配置信息
  const configInfo = getCurrentConfigInfo(mode, dataset);

  // 左侧聊天面板
  const leftPanel = (
    <ChatPanel
      messages={messages}
      inputValue={inputValue}
      mode={mode}
      dataset={dataset}
      isLoading={isLoading}
      serviceStatus={serviceStatus}
      statusLoading={statusLoading}
      configInfo={configInfo}
      onInputChange={setInputValue}
      onSendMessage={handleSendMessage}
      onModeChange={setMode}
      onDatasetChange={setDataset}
      onRefreshStatus={handleCheckServiceStatus}
    />
  );

  // 右侧响应面板
  const rightPanel = (
    <ResponsePanel
      rawResponse={rawResponse}
      serviceStatus={serviceStatus}
      statusLoading={statusLoading}
      configInfo={configInfo}
    />
  );

  return (
    <>
      <ResizableLayout leftPanel={leftPanel} rightPanel={rightPanel} initialLeftWidth={50} />
      <HelpPanel />
    </>
  );
}
