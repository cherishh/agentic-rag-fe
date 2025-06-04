'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('basic_rag');
  const [dataset, setDataset] = useState('price_index_statistics');
  const [isLoading, setIsLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<RagResponse | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock数据生成函数
  const generateMockResponse = (query: string, mode: string, dataset: string): RagResponse => {
    const mockDocuments = [
      {
        id: 'doc_1',
        content: `关于${dataset}的相关信息：这是一个关于${query}的详细说明文档。`,
        score: 0.95,
      },
      {
        id: 'doc_2',
        content: `在${dataset}数据集中，${query}是一个重要的概念...`,
        score: 0.87,
      },
      {
        id: 'doc_3',
        content: `根据${dataset}的分析结果，我们可以得出以下结论...`,
        score: 0.78,
      },
    ];

    const mockResponses = {
      basic_rag: `基于检索增强生成（Basic RAG）的回答：

根据在${dataset}数据集中检索到的相关文档，关于"${query}"的回答如下：

${query}是一个重要的概念。通过分析相关数据，我们可以看到其在实际应用中的重要性。具体来说：

1. 数据特征：根据检索到的文档显示，相关数据表现出明显的趋势
2. 应用场景：在${dataset}领域有着广泛的应用
3. 关键指标：通过分析可以得出相应的结论

这些信息来源于高质量的文档检索结果，为您的查询提供了可靠的答案。`,

      agentic_rag: `智能代理RAG（Agentic RAG）的分析回答：

我作为一个智能代理，将通过多步推理和工具调用来回答您关于"${query}"的问题：

**第一步：查询分析**
- 识别查询意图：信息检索
- 确定相关数据集：${dataset}
- 制定检索策略：多轮检索 + 结果融合

**第二步：知识检索与验证**
- 初始检索：在${dataset}中找到3个高相关度文档
- 交叉验证：确认信息的一致性和准确性
- 补充检索：获取更多上下文信息

**第三步：推理与综合**
基于检索到的信息，${query}具有以下特点：
- 在${dataset}领域中扮演关键角色
- 具有可量化的指标和明确的应用价值
- 与其他相关概念存在密切联系

**第四步：答案生成与优化**
通过智能代理的多步推理，我为您提供了这个综合性的回答，不仅包含了基础信息，还加入了分析推理过程，确保答案的准确性和完整性。`,
    };

    return {
      mode,
      dataset,
      query,
      response: mockResponses[mode as keyof typeof mockResponses],
      retrieved_documents: mockDocuments,
      metadata: {
        response_time: Math.random() * 2000 + 500,
        model_used: mode === 'basic_rag' ? 'gpt-3.5-turbo' : 'gpt-4-turbo',
        tokens_used: Math.floor(Math.random() * 1000) + 200,
      },
    };
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

    // 模拟API调用延迟
    setTimeout(() => {
      const mockResponse = generateMockResponse(inputValue, mode, dataset);
      setRawResponse(mockResponse);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: mockResponse.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex h-screen bg-gray-50'>
      {/* 左侧聊天区域 */}
      <div className='flex-1 flex flex-col border-r border-gray-200'>
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
                className={`max-w-3xl rounded-lg px-4 py-2 ${
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

      {/* 右侧JSON展示区域 */}
      <div className='w-1/2 flex flex-col bg-gray-900'>
        <div className='p-4 bg-gray-800 border-b border-gray-700'>
          <h2 className='text-lg font-semibold text-white'>Raw JSON Response</h2>
          <p className='text-sm text-gray-400'>实时展示API返回的原始数据</p>
        </div>

        <div className='flex-1 overflow-y-auto p-4'>
          {rawResponse ? (
            <pre className='text-sm text-green-400 font-mono whitespace-pre-wrap'>
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          ) : (
            <div className='text-center text-gray-500 mt-8'>
              <div className='text-6xl mb-4'>{}</div>
              <p>发送消息后，这里将显示API返回的原始JSON数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
