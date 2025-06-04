'use client';

import { FileText, Database, TrendingUp, Brain, HelpCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function HelpPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          className='cursor-pointer fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 bg-gray-700 text-white'
        >
          <HelpCircle className='h-6 w-6' />
        </Button>
      </SheetTrigger>
      <SheetContent className='w-[400px] sm:w-[540px] p-6 overflow-y-auto'>
        <div className='mt-6 space-y-6'>
          {/* 使用说明 */}
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <Brain className='h-5 w-5 text-blue-600' />
              使用说明
            </h3>
            <div className='space-y-2 text-sm text-gray-600'>
              <div className='p-3 bg-blue-50 rounded-lg'>
                <p className='font-medium text-blue-800 mb-1'>Basic RAG</p>
                <p>基础检索增强生成，适用于简单问答场景</p>
              </div>
              <div className='p-3 bg-green-50 rounded-lg'>
                <p className='font-medium text-green-800 mb-1'>Agentic RAG</p>
                <p>智能代理RAG，支持复杂推理和多步骤查询</p>
              </div>
              <div className='p-3 bg-purple-50 rounded-lg'>
                <p className='font-medium text-purple-800 mb-1'>Cross Query</p>
                <p>跨数据集查询，同时搜索多个数据源并对比结果</p>
              </div>
            </div>
          </div>

          {/* 数据集详情 */}
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <Database className='h-5 w-5 text-green-600' />
              数据集详情
            </h3>
            <div className='space-y-3'>
              <div className='border rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <TrendingUp className='h-4 w-4 text-orange-600' />
                  <h4 className='font-medium'>Price Index Statistics</h4>
                </div>
                <p className='text-sm text-gray-600 mb-2'>价格指数统计数据集</p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <p>
                    <a
                      className='underline underline-offset-2'
                      href='https://data.stats.gov.cn/easyquery.htm?cn=A01'
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      国家统计局
                    </a>{' '}
                    发布的价格指数统计数据
                  </p>
                  <p>本数据集包含各类价格指数过去 13 个月的数据</p>
                </div>
              </div>

              <div className='border rounded-lg p-4'>
                <div className='flex items-center gap-2 mb-2'>
                  <Brain className='h-4 w-4 text-blue-600' />
                  <h4 className='font-medium'>Machine Learning</h4>
                </div>
                <p className='text-sm text-gray-600 mb-2'>机器学习知识库</p>
                <div className='text-xs text-gray-500 space-y-1'>
                  <p>吴恩达机器学习课程全部课时转录</p>
                  <p>机器学习、深度学习基础</p>
                  <p>网络优化手段，模型评估和优化方法</p>
                  <p>数据集策略，数据增强</p>
                  <p>CNN, RNN, transformer</p>
                </div>
              </div>
            </div>
          </div>

          {/* 查询建议 */}
          <div>
            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
              <FileText className='h-5 w-5 text-purple-600' />
              查询建议
            </h3>
            <div className='space-y-2 text-sm'>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium mb-1'>价格指数相关查询：</p>
                <p className='text-gray-600'>&ldquo;最近一个月的 CPI 怎么样&rdquo;</p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium mb-1'>机器学习相关查询：</p>
                <p className='text-gray-600'>&ldquo;解释一下卷积神经网络的工作原理&rdquo;</p>
              </div>
              <div className='p-3 bg-gray-50 rounded-lg'>
                <p className='font-medium mb-1'>跨数据集查询：</p>
                <p className='text-gray-600'>
                  &ldquo;近几个月中药价格指数上升了还是下降了？另外在 ML 中什么时候使用 ResNet? &rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
