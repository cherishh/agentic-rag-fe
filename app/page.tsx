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
  isStreaming?: boolean;
}

interface RagResponse {
  mode: string;
  dataset: string;
  query: string;
  response: string;
  retrieved_documents: Array<{
    id: string;
    content: string;
    score: number;
  }>;
  metadata: {
    response_time: number;
    model_used: string;
    tokens_used: number;
  };
}

interface StreamEvent {
  event?: string;
  data: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('basic_rag');
  const [dataset, setDataset] = useState('price_index_statistics');
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<RagResponse | null>(null);
  const [leftWidth, setLeftWidth] = useState(50); // 左侧宽度百分比
  const [isDragging, setIsDragging] = useState(false);
  const [streamingEvents, setStreamingEvents] = useState<StreamEvent[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentStreamingMessageId = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // 解析SSE事件数据
  const parseSSEEvent = (eventString: string): StreamEvent | null => {
    const lines = eventString.split('\n');
    let event = '';
    let data = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        data = line.slice(5).trim();
      }
    }

    if (data) {
      return { event: event || undefined, data };
    }
    return null;
  };

  // 处理流式响应
  const handleStreamResponse = async (query: string, mode: string, dataset: string) => {
    try {
      const response = await fetch('/api/agent/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, dataset }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // 创建流式消息
      const streamingMessageId = Date.now().toString();
      currentStreamingMessageId.current = streamingMessageId;

      const initialMessage: Message = {
        id: streamingMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, initialMessage]);
      setStreamingEvents([]);

      let buffer = '';
      let accumulatedContent = '';
      const accumulatedEvents: StreamEvent[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');

          // 保留最后一个可能不完整的事件
          buffer = events.pop() || '';

          for (const eventString of events) {
            if (eventString.trim()) {
              const parsedEvent = parseSSEEvent(eventString);
              if (parsedEvent) {
                accumulatedEvents.push(parsedEvent);

                // 如果是内容数据，累积到消息中
                if (parsedEvent.event === 'content' || !parsedEvent.event) {
                  try {
                    const eventData = JSON.parse(parsedEvent.data);
                    if (eventData.content) {
                      accumulatedContent += eventData.content;
                    } else if (typeof eventData === 'string') {
                      accumulatedContent += eventData;
                    }
                  } catch {
                    // 如果不是JSON，直接作为文本内容
                    accumulatedContent += parsedEvent.data;
                  }

                  // 更新流式消息内容
                  setMessages(prev =>
                    prev.map(msg => (msg.id === streamingMessageId ? { ...msg, content: accumulatedContent } : msg))
                  );
                }

                // 如果是完整的响应数据
                if (parsedEvent.event === 'complete' || parsedEvent.event === 'done') {
                  try {
                    const completeData = JSON.parse(parsedEvent.data);
                    setRawResponse(completeData);
                  } catch (error) {
                    console.error('Error parsing complete data:', error);
                  }
                }
              }
            }
          }

          // 更新流式事件显示
          setStreamingEvents([...accumulatedEvents]);
        }
      } finally {
        // 完成流式接收
        setMessages(prev => prev.map(msg => (msg.id === streamingMessageId ? { ...msg, isStreaming: false } : msg)));
        currentStreamingMessageId.current = null;
      }
    } catch (error) {
      console.error('Stream error:', error);

      // 错误处理：显示错误消息
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，处理您的请求时出现了错误：${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
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
    setInputValue('');
    setIsLoading(true);

    // 使用真实的SSE API
    await handleStreamResponse(inputValue, mode, dataset);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div ref={containerRef} className='flex h-screen bg-gray-50'>
      {/* 左侧聊天区域 */}
      <div className='flex flex-col border-r border-gray-200' style={{ width: `${leftWidth}%` }}>
        {/* 头部配置区域 */}
        <div className='p-4 bg-white border-b border-gray-200'>
          <h1 className='text-xl font-semibold mb-4 text-gray-800'>RAG Chatbot Demo</h1>
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
        </div>

        {/* 聊天消息区域 */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {messages.length === 0 && (
            <div className='text-center text-gray-500 mt-8'>
              <Bot className='mx-auto mb-4 h-12 w-12 text-gray-400' />
              <p>开始与RAG助手对话吧！</p>
              <p className='text-sm mt-2'>当前模式：{mode === 'basic_rag' ? 'Basic RAG' : 'Agentic RAG'}</p>
              <p className='text-sm'>数据集：{dataset}</p>
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
                    <div className='whitespace-pre-wrap text-sm'>
                      {message.content}
                      {message.isStreaming && <span className='inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse' />}
                    </div>
                    <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString()}
                      {message.isStreaming && ' (实时接收中...)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && !currentStreamingMessageId.current && (
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
          <h2 className='text-lg font-semibold text-white'>Raw Stream Events</h2>
          <p className='text-sm text-gray-400'>实时展示SSE流事件和最终响应数据</p>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {streamingEvents.length > 0 || rawResponse ? (
            <div className='space-y-4'>
              {/* 流式事件显示 */}
              {streamingEvents.length > 0 && (
                <div>
                  <h3 className='text-yellow-400 text-sm font-semibold mb-2'>Stream Events:</h3>
                  <pre className='text-xs text-green-400 font-mono whitespace-pre-wrap bg-gray-800 p-2 rounded max-h-40 overflow-y-auto'>
                    {streamingEvents
                      .map(
                        (event, index) =>
                          `Event ${index + 1}:\n${event.event ? `event: ${event.event}\n` : ''}data: ${event.data}\n\n`
                      )
                      .join('')}
                  </pre>
                </div>
              )}

              {/* 最终响应显示 */}
              {rawResponse && (
                <div>
                  <h3 className='text-blue-400 text-sm font-semibold mb-2'>Final Response:</h3>
                  <pre className='text-sm text-green-400 font-mono whitespace-pre-wrap'>
                    {JSON.stringify(rawResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center text-gray-500 mt-8'>
              <div className='text-6xl mb-4'>📡</div>
              <p>发送消息后，这里将实时显示SSE流事件</p>
              <p className='text-sm mt-2'>以及最终的API响应数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
