import { useState } from 'react';
import { TabType } from './types';
import ConnectScreen from './components/ConnectScreen';
import Header from './components/Header';
import BalanceCard from './components/BalanceCard';
import FaucetBar from './components/FaucetBar';
import TabNav from './components/TabNav';
import SendTab from './components/SendTab';
import SwapTab from './components/SwapTab';
import BridgeTab from './components/BridgeTab';
import UnifiedTab from './components/UnifiedTab';
import HistoryTab from './components/HistoryTab';
import { useAccount, useDisconnect } from 'wagmi';

export default function App() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [activeTab, setActiveTab] = useState<TabType>('send');

  const handleDisconnect = () => {
    disconnect();
  };

  const walletAddress = address || "0x06ca...B689";

  if (!isConnected || !address) {
    return <ConnectScreen onConnect={() => {}} />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header />
      
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 space-y-8">
        <BalanceCard 
          address={walletAddress} 
          onDisconnect={handleDisconnect} 
          onDepositToUnified={() => setActiveTab('unified')}
        />
        
        <FaucetBar />

        <div className="glass-card">
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="bg-white rounded-b-[var(--radius-card)] overflow-hidden">
            {activeTab === 'send' && <SendTab />}
            {activeTab === 'swap' && <SwapTab />}
            {activeTab === 'bridge' && <BridgeTab isConnected={isConnected} />}
            {activeTab === 'unified' && <UnifiedTab />}
            {activeTab === 'history' && <HistoryTab />}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-4">
        <span>Built by chidrexx</span>
        <span className="w-1 h-1 bg-slate-200 rounded-full" />
        <a 
          href="https://testnet.arcscan.app" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-emerald-500 transition-colors underline decoration-slate-200 underline-offset-4"
        >
          Explorer
        </a>
      </footer>
    </div>
  );
}
