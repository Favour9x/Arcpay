import { AppKit } from '@circle-fin/app-kit';
import { createViemAdapterFromProvider } from '@circle-fin/adapter-viem-v2';
import type { WalletClient } from 'viem';

// Initialize App Kit
export const kit = new AppKit();

// Create adapter from wallet client - returns a promise that must be awaited
export async function createAdapter(walletClient: WalletClient | undefined, walletAddress: string) {
  if (!walletClient) {
    throw new Error('Wallet client not available. Please ensure your wallet is connected.');
  }
  
  try {
    console.log('Creating adapter with walletClient and address:', walletAddress);
    
    // Try multiple methods to get the EIP1193 provider
    let provider;
    
    // Method 1: Check if transport has a provider (custom transport)
    if (walletClient.transport.type === 'custom' && (walletClient.transport as any).provider) {
      provider = (walletClient.transport as any).provider;
      console.log('✓ Using provider from custom transport');
    }
    // Method 2: Check window.ethereum (MetaMask, etc.)
    else if (typeof window !== 'undefined' && window.ethereum) {
      provider = window.ethereum;
      console.log('✓ Using window.ethereum provider');
    }
    // Method 3: Check if walletClient itself can act as provider
    else if ((walletClient as any).request) {
      provider = walletClient;
      console.log('✓ Using walletClient as provider');
    }
    
    if (!provider) {
      throw new Error('No EIP1193 provider available. Please ensure your wallet is properly connected.');
    }

    // Ensure Arc Testnet is added to the wallet
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4CE212' }], // 5042002 in hex
      });
      console.log('✓ Switched to Arc Testnet');
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        console.log('Arc Testnet not found, adding it...');
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x4CE212',
                chainName: 'Arc Testnet',
                nativeCurrency: {
                  name: 'USDC',
                  symbol: 'USDC',
                  decimals: 18, // MetaMask requires 18 decimals for native currency
                },
                rpcUrls: ['https://rpc.testnet.arc.network'],
                blockExplorerUrls: ['https://testnet.arcscan.app'],
              },
            ],
          });
          console.log('✓ Arc Testnet added successfully');
        } catch (addError: any) {
          console.error('Failed to add Arc Testnet to wallet:', addError);
          throw new Error('Failed to add Arc Testnet. Please add it manually in your wallet settings.');
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        throw new Error('Please approve the network switch in your wallet');
      } else {
        console.warn('Failed to switch to Arc Testnet:', switchError);
      }
    }
    
    // Use createViemAdapterFromProvider which expects an EIP1193Provider
    const adapter = await createViemAdapterFromProvider({
      provider,
      capabilities: { addressContext: 'user-controlled' }
    });
    
    console.log('✅ Adapter created successfully');
    return adapter;
    
  } catch (error: any) {
    console.error('❌ Failed to create adapter:', error);
    
    // Provide user-friendly error messages
    const errorMessage = error.message || 'Unknown error occurred';
    throw new Error(errorMessage);
  }
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

// Format balance from 6 decimals (USDC standard)
export function formatBalance(balance: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
  return `${whole}.${remainderStr}`;
}

// Parse amount to smallest unit (6 decimals for USDC)
export function parseAmount(amount: string, decimals: number = 6): bigint {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
}
