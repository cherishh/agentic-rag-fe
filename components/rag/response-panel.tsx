'use client';

import { RagResponse, ServiceStatus as ServiceStatusType, ConfigInfo } from '@/lib/types';

interface ResponsePanelProps {
  rawResponse: RagResponse | null;
  serviceStatus: ServiceStatusType | null;
  statusLoading: boolean;
  configInfo: ConfigInfo;
}

export function ResponsePanel({ rawResponse, serviceStatus, statusLoading, configInfo }: ResponsePanelProps) {
  return (
    <div className='flex flex-col bg-gray-900 h-full'>
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
  );
}
