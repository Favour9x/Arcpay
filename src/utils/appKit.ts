import { AppKit } from '@circle-fin/app-kit';
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';
import { WalletClient } from 'viem';

// Initialize App Kit
export const kit = new AppKit();

// Create adapter from wallet client
export function createAdapter(walletClient: WalletClient, walletAddress: string) {
  return createViemAdapterFromProvider(walletClient, { walletAddress });
}

// Chain name mapping for Circle App Kit
export const CHAIN_MAPPING: Record<string, string> = {
  'Ethereum Sepolia': 'Ethereum_Sepolia',
  'Arbitrum Sepolia': 'Arbitrum_Sepolia',
  'Base Sepolia': 'Base_Sepolia',
  'OP Sepolia': 'Optimism_Sepolia',
  'Unichain Sepolia': 'Unichain_Sepolia',
  'Linea Sepolia': 'Linea_Sepolia',
  'Polygon PoS Amoy': 'Polygon_Amoy_Testnet',
  'Avalanche Fuji': 'Avalanche_Fuji',
  'Solana Devnet': 'Solana_Devnet',
  'HyperEVM Testnet': 'HyperEVM_Testnet',
  'Monad Testnet': 'Monad_Testnet',
  'Morph Testnet': 'Morph_Testnet',
  'Pharos Atlantic': 'Pharos_Testnet',
  'Plume Testnet': 'Plume_Testnet',
  'Sei Testnet': 'Sei_Testnet',
  'Sonic Testnet': 'Sonic_Testnet',
  'World Chain Sepolia': 'World_Chain_Sepolia',
  'Codex Testnet': 'Codex_Testnet',
  'EDGE Testnet': 'Edge_Testnet',
  'Ink Testnet': 'Ink_Testnet',
  'XDC Apothem': 'XDC_Apothem',
  'Arc Testnet': 'Arc_Testnet'
};

// Poll for transaction receipt
export async function pollTransactionReceipt(
  provider: any,
  txHash: string,
  intervalMs: number = 2000,
  timeoutMs: number = 120000
): Promise<any> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const receipt = await provider.getTransactionReceipt({ hash: txHash });
        
        if (receipt) {
          clearInterval(interval);
          resolve(receipt);
        }
        
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          reject(new Error('Transaction receipt polling timeout'));
        }
      } catch (error) {
        // Continue polling on error
      }
    }, intervalMs);
  });
}

// Format balance from 18 decimals
export function formatBalance(balance: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole}.${remainderStr}`;
}

// Parse amount to wei (18 decimals)
export function parseAmount(amount: string, decimals: number = 18): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
