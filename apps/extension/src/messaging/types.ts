export interface ExtensionMessage<T = any> {
  id: string;
  type: string;
  payload?: T;
  origin?: string;
}

export interface ExtensionResponse<T = any> {
  id: string;
  success: boolean;
  data?: T;
  error?: string;
}

export type RequestStatus =
  | 'Created'
  | 'Queued'
  | 'Displayed'
  | 'Approved'
  | 'Rejected'
  | 'TimedOut'
  | 'Cancelled'
  | 'Completed'
  | 'Failed';

export interface ProviderRequest {
  requestId: string;
  origin: string;
  tabId?: number;
  frameId?: number;
  chainId?: number;
  account?: string;
  createdAt: number;
  expiresAt: number;
  method: string;
  params: any[];
  status: RequestStatus;
  error?: string;
  result?: any;
}

export type MessageHandler = (
  request: ExtensionMessage,
  sender: chrome.runtime.MessageSender
) => Promise<any>;
