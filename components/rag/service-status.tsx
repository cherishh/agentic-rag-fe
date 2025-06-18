'use client';

import { useState } from 'react';
import { ServiceStatus as ServiceStatusType } from '@/lib/types';
import { runDiagnosis } from '@/lib/api';

// 声明全局变量类型
declare global {
  interface Window {
    isDiagnosisRunning?: boolean;
  }
}

interface ServiceStatusProps {
  serviceStatus: ServiceStatusType | null;
  statusLoading: boolean;
  onRefresh: () => void;
}

export function ServiceStatus({ serviceStatus, statusLoading, onRefresh }: ServiceStatusProps) {
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<ServiceStatusType | null>(null);
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false);
  const [disableStatusButton, setDisableStatusButton] = useState(false);

  const handleDiagnosis = async () => {
    setDiagnosisLoading(true);
    setDisableStatusButton(true);
    setDiagnosisResult(null);

    // 设置全局变量禁用输入框
    window.isDiagnosisRunning = true;

    const result = await runDiagnosis();

    if (result.data) {
      setDiagnosisResult(result.data);
    } else {
      setDiagnosisResult(result.error);
    }

    setDiagnosisLoading(false);
    setShowDiagnosisResult(true);

    // 清除全局变量恢复输入框
    window.isDiagnosisRunning = false;
    setDisableStatusButton(false);
  };

  const hasError = serviceStatus?.error;

  return (
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
        <div className='flex gap-2'>
          {hasError && (
            <button
              onClick={handleDiagnosis}
              disabled={diagnosisLoading || statusLoading}
              className='text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {diagnosisLoading ? '深度检测中...' : '深度检测'}
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={statusLoading || disableStatusButton}
            className='text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            刷新状态
          </button>
        </div>
      </div>

      {/* 深度检测结果显示 */}
      {showDiagnosisResult && diagnosisResult && (
        <div className='mt-3 p-2 bg-gray-100 rounded border-l-4 border-orange-500'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-xs font-medium text-orange-600'>深度检测结果</span>
            <button onClick={() => setShowDiagnosisResult(false)} className='text-xs text-gray-500 hover:text-gray-700'>
              ✕
            </button>
          </div>
          <pre className='text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto'>
            {JSON.stringify(diagnosisResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
