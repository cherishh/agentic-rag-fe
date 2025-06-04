'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Cross query响应的数据项类型
interface CrossQueryDataItem {
  dataset: string;
  response: string;
}

// 服务状态响应类型
interface ServiceStatus {
  status?: string;
  message?: string;
  timestamp?: string;
  error?: string;
  [key: string]: unknown;
}

// API响应的数据部分
interface ApiResponseData {
  query: string;
  response: string;
  sourceNodes?: Array<{
    id?: string;
    content: string;
    score?: number;
    metadata?: Record<string, unknown>;
  }>;
  // 允许其他字段
  [key: string]: unknown;
}

// 完整的API响应格式
interface ApiResponse {
  success: boolean;
  data: ApiResponseData | CrossQueryDataItem[]; // 支持cross query的数组格式
  error?: string;
  message?: string;
}

// 为了兼容性，保留原来的接口名
type RagResponse = ApiResponse;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('basic_rag');
  const [dataset, setDataset] = useState('price_index_statistics');
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<RagResponse | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // 左侧宽度百分比
  const [isDragging, setIsDragging] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 检查服务状态
  const checkServiceStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/status', {
        method: 'GET',
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data);
      } else {
        setServiceStatus({
          error: `Failed to fetch status: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      setServiceStatus({
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setStatusLoading(false);
    }
  };

  // 页面初始化时检查服务状态
  useEffect(() => {
    checkServiceStatus();
  }, []);

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // 处理拖拽过程
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // 限制最小和最大宽度
      const clampedWidth = Math.min(Math.max(newLeftWidth, 20), 80);
      setLeftWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // 根据mode和dataset确定API端点和参数
  const getApiConfig = (mode: string, dataset: string, query: string) => {
    if (dataset === 'cross_query') {
      return {
        endpoint: '/api/cross',
        body: {
          query,
          datasets: ['price_index_statistics', 'machine_learning'],
        },
      };
    }

    if (mode === 'basic_rag') {
      return {
        endpoint: '/api/query',
        body: {
          query,
          dataset,
        },
      };
    }

    if (mode === 'agentic_rag') {
      return {
        endpoint: '/api/agent',
        body: {
          query,
          dataset,
        },
      };
    }

    // 默认情况
    return {
      endpoint: '/api/query',
      body: {
        query,
        dataset,
      },
    };
  };

  // 调用实际API
  const callRagApi = async (query: string, mode: string, dataset: string): Promise<ApiResponse> => {
    const { endpoint, body } = getApiConfig(mode, dataset, query);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // 检查API是否返回成功状态
      if (!data.success) {
        throw new Error(data.error || data.message || 'API请求失败');
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

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
      const apiResponse = await callRagApi(currentQuery, mode, dataset);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 获取当前配置的显示信息
  const getCurrentConfigInfo = () => {
    if (dataset === 'cross_query') {
      return {
        mode: 'Cross Query',
        dataset: 'Price Index Statistics + Machine Learning',
        endpoint: '/api/cross',
      };
    }

    const modeDisplay = mode === 'basic_rag' ? 'Basic RAG' : 'Agentic RAG';
    const endpointDisplay = mode === 'basic_rag' ? '/api/query' : '/api/agent';

    return {
      mode: modeDisplay,
      dataset: dataset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      endpoint: endpointDisplay,
    };
  };

  const configInfo = getCurrentConfigInfo();

  return (
    <div ref={containerRef} className='flex h-screen bg-gray-50'>
      {/* 左侧聊天区域 */}
      <div className='flex flex-col border-r border-gray-200' style={{ width: `${leftWidth}%` }}>
        {/* 头部配置区域 */}
        <div className='p-4 bg-white border-b border-gray-200'>
          <h1 className='text-xl font-semibold mb-4 text-gray-800'>RAG Chatbot Demo</h1>

          {/* 服务状态指示器 */}
          <div className='mb-4 p-2 bg-gray-50 rounded-lg'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-2 h-2 rounded-full ${
                    statusLoading ? 'bg-yellow-500 animate-pulse' : serviceStatus?.error ? 'bg-red-500' : 'bg-green-500'
                  }`}
                ></div>
                <span className='text-sm font-medium text-gray-700'>
                  服务状态: {statusLoading ? '检查中...' : serviceStatus?.error ? '服务异常' : '服务正常'}
                </span>
              </div>
              <button
                onClick={checkServiceStatus}
                disabled={statusLoading}
                className='text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                刷新状态
              </button>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>模式 (Mode)</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='选择模式' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='basic_rag'>Basic RAG</SelectItem>
                  <SelectItem value='agentic_rag'>Agentic RAG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>数据集 (Dataset)</label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='选择数据集' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='price_index_statistics'>Price Index Statistics</SelectItem>
                  <SelectItem value='machine_learning'>Machine Learning</SelectItem>
                  <SelectItem value='cross_query'>Cross Query</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 显示当前配置信息 */}
          <div className='mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600'>
            <div>
              <strong>当前配置:</strong> {configInfo.mode} | {configInfo.dataset}
            </div>
            <div>
              <strong>API端点:</strong> {configInfo.endpoint}
            </div>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.length === 0 && (
            <div className='text-center text-gray-500 mt-8'>
              <Bot className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <p>开始与RAG助手对话吧！</p>
              <br />
              <p>打开👈抽屉可以看到价格指数数据的目录</p>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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
          ))}

          {isLoading && (
            <div className='flex justify-start'>
              <div className='bg-white border border-gray-200 rounded-lg px-4 py-2'>
                <div className='flex items-center gap-2'>
                  <Bot className='h-5 w-5 text-gray-600' />
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className='p-4 bg-white border-t border-gray-200'>
          <div className='flex gap-2'>
            <Input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='输入您的问题...'
              className='flex-1'
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} size='icon'>
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* 可拖拽的分隔条 */}
      <div
        className={`w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize flex items-center justify-center group transition-colors ${
          isDragging ? 'bg-blue-500' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        <div className='opacity-0 group-hover:opacity-100 transition-opacity'>
          <GripVertical className='h-4 w-4 text-gray-600' />
        </div>
      </div>

      {/* 右侧JSON展示区域 */}
      <div className='flex flex-col bg-gray-900' style={{ width: `${100 - leftWidth}%` }}>
        <div className='p-4 bg-gray-800 border-b border-gray-700'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-white'>API Response</h2>
              <p className='text-sm text-gray-400'>展示API返回的原始JSON数据</p>
            </div>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {rawResponse ? (
            <div className='space-y-4'>
              <div>
                <h3 className='text-blue-400 text-sm font-semibold mb-2'>Response Data:</h3>
                <pre className='text-sm text-green-400 font-mono whitespace-pre-wrap'>
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {/* 服务状态显示 */}
              <div>
                <h3 className='text-blue-400 text-sm font-semibold mb-2'>Service Status:</h3>
                {statusLoading ? (
                  <div className='text-yellow-400 text-sm'>正在检查服务状态...</div>
                ) : serviceStatus ? (
                  <pre className='text-sm text-green-400 font-mono whitespace-pre-wrap'>
                    {JSON.stringify(serviceStatus, null, 2)}
                  </pre>
                ) : (
                  <div className='text-red-400 text-sm'>无法获取服务状态</div>
                )}
              </div>

              {/* 说明文字 */}
              <div className='text-center text-gray-500'>
                <div className='text-6xl mb-4'>📡</div>
                <p>发送消息后，这里将显示API返回的原始数据</p>
                <p className='text-sm mt-2'>当前端点：{configInfo.endpoint}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
