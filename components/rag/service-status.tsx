'use client';

import { ServiceStatus as ServiceStatusType } from '@/lib/types';

interface ServiceStatusProps {
  serviceStatus: ServiceStatusType | null;
  statusLoading: boolean;
  onRefresh: () => void;
}

export function ServiceStatus({ serviceStatus, statusLoading, onRefresh }: ServiceStatusProps) {
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
        <button
          onClick={onRefresh}
          disabled={statusLoading}
          className='text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          刷新状态
        </button>
      </div>
    </div>
  );
}
