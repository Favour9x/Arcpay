export type TabType = 'send' | 'swap' | 'bridge' | 'unified' | 'history';
export type Token = 'USDC' | 'EURC';

export interface Transaction {
  id: string;
  type: 'SEND' | 'SWAP' | 'BRIDGE' | 'UNIFIED DEPOSIT' | 'UNIFIED SPEND';
  amount: string;
  token: Token;
  address: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}
