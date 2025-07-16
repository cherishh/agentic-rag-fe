import { ApiConfig, ApiResponse, ConfigInfo } from './types';

// 根据mode和dataset确定API端点和参数
export const getApiConfig = (query: string): ApiConfig => {
  return {
    endpoint: '/api/intelligent-query',
    body: {
      query,
    },
  };
};

// 调用实际API
export const callRagApi = async (query: string): Promise<ApiResponse> => {
  const { endpoint, body } = getApiConfig(query);

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

// 检查服务状态
export const checkServiceStatus = async () => {
  try {
    const response = await fetch('/api/status', {
      method: 'GET',
      cache: 'no-cache',
    });

    if (response.ok) {
      const data = await response.json();
      return { data, error: null };
    } else {
      return {
        data: null,
        error: {
          error: `Failed to fetch status: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    return {
      data: null,
      error: {
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      },
    };
  }
};

// 深度检测诊断
export const runDiagnosis = async () => {
  try {
    const response = await fetch('/api/diagnose', {
      method: 'GET',
      cache: 'no-cache',
    });

    if (response.ok) {
      const data = await response.json();
      return { data, error: null };
    } else {
      return {
        data: null,
        error: {
          error: `Failed to run diagnosis: ${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString(),
        },
      };
    }
  } catch (error) {
    return {
      data: null,
      error: {
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      },
    };
  }
};

// 获取当前配置的显示信息
export const getCurrentConfigInfo = (mode: string, dataset: string): ConfigInfo => {
  if (dataset === 'cross_query') {
    return {
      mode: 'Cross Query',
      dataset: 'Price Index Statistics + Machine Learning',
      endpoint: '/api/cross',
    };
  }

  const modeDisplay = mode === 'basic_rag' ? 'Basic RAG' : 'Agentic RAG';
  const endpointDisplay = mode === 'basic_rag' ? '/api/intelligent-query' : '/api/agent';

  return {
    mode: modeDisplay,
    dataset: dataset.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    endpoint: endpointDisplay,
  };
};
