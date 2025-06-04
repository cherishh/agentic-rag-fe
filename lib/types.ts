// 消息类型
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Cross query响应的数据项类型
export interface CrossQueryDataItem {
  dataset: string;
  response: string;
}

// 服务状态响应类型
export interface ServiceStatus {
  status?: string;
  message?: string;
  timestamp?: string;
  error?: string;
  [key: string]: unknown;
}

// API响应的数据部分
export interface ApiResponseData {
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
export interface ApiResponse {
  success: boolean;
  data: ApiResponseData | CrossQueryDataItem[]; // 支持cross query的数组格式
  error?: string;
  message?: string;
}

// 为了兼容性，保留原来的接口名
export type RagResponse = ApiResponse;

// 配置信息类型
export interface ConfigInfo {
  mode: string;
  dataset: string;
  endpoint: string;
}

// API配置类型
export interface ApiConfig {
  endpoint: string;
  body: {
    query: string;
    dataset?: string;
    datasets?: string[];
  };
}
