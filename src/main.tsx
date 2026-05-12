import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, coinbaseWallet, walletConnectWallet, rabbyWallet, injectedWallet } from '@rainbow-me/rainbowkit/wallets';
import { defineChain } from 'viem';

// Define Arc Testnet
const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { 
    name: 'USDC', 
    symbol: 'USDC', 
    decimals: 6 // USDC has 6 decimals
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] }
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' }
  },
  testnet: true
});

// Configure Wagmi with RainbowKit
const config = getDefaultConfig({
  appName: 'ArcPay',
  projectId: '0bef75de6f140b5d11bb5c9c98e4db79',
  chains: [arcTestnet],
  wallets: [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, coinbaseWallet, rabbyWallet, walletConnectWallet, injectedWallet]
    }
  ],
  ssr: false
});

const queryClient = new QueryClient();

// Error boundary fallback
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `<div style="padding: 20px; font-family: sans-serif;"><h1>Error Loading App</h1><p>${error}</p></div>`;
}
