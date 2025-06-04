'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigInfo } from '@/lib/types';

interface ConfigPanelProps {
  mode: string;
  dataset: string;
  configInfo: ConfigInfo;
  onModeChange: (value: string) => void;
  onDatasetChange: (value: string) => void;
}

export function ConfigPanel({ mode, dataset, configInfo, onModeChange, onDatasetChange }: ConfigPanelProps) {
  return (
    <>
      <div className='flex gap-4'>
        <div className='flex-1'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>模式 (Mode)</label>
          <Select value={mode} onValueChange={onModeChange}>
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
          <Select value={dataset} onValueChange={onDatasetChange}>
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
      {/* <div className='mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600'>
        <div>
          <strong>当前配置:</strong> {configInfo.mode} | {configInfo.dataset}
        </div>
        <div>
          <strong>API端点:</strong> {configInfo.endpoint}
        </div>
      </div> */}
    </>
  );
}
