import { Edge, Node } from '@swimlane/ngx-graph';

export type NodeType = 'chat' | 'integration' | 'scheduler' | 'task' | 'report' | 'pinned-input';

export interface CybertronNode extends Node {
  type: NodeType;
  config: any;
  description?: string;
  style?: {
    border?: string;
    background?: string;
  };
}

export interface CybertronEdge extends Edge {
  data?: any;
}

export interface ChatNodeConfig {
  model: string;
  systemPrompt: string;
}

export interface SchedulerNodeConfig {
  scheduleType: 'cron' | 'interval' | 'onetime';
  expression: string;
}

export interface IntegrationNodeConfig {
  integrationType: string;
  apiKey: string;
}

export interface TaskNodeConfig {
  script: string;
  sandboxOptions: {
    timeout: number;
    memory: number;
    allowImports: string[];
  };
}

export interface ReportNodeConfig {
  destFile: boolean;
  destEmail: boolean;
  destWebhook: boolean;
  destDashboard: boolean;
  filePath?: string;
  email?: string;
  webhookUrl?: string;
  dashboardSection?: string;
  format: 'json' | 'csv' | 'txt';
}

export interface PinnedInputNodeConfig {
  value: string;
  timestamp: number;
} 