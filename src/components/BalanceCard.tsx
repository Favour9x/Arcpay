import { useState } from 'react';
import { RefreshCcw, LogOut, DollarSign, Euro } from 'lucide-react';
import { useBalances } from '../hooks/useBalances';

interface BalanceCardProps {
  onDisconnect: () => void;
  onDepositToUnified: () => void;
  address: string;
}

export default function BalanceCard({ onDisconnect, onDepositToUnified, address }: BalanceCardProps) {
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'EURC'>('USDC');
  const { usdcBalance, eurcBalance, unifiedBalance, isLoading, refetch } = useBalances();
  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const displayBalance = selectedToken === 'USDC' ? usdcBalance : eurcBalance;

  return (
    <div className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Decorative gradient top bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />

      {/* TOP ROW */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Balance</span>
        <button 
          onClick={refetch}
          disabled={isLoading}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors group"
        >
          <RefreshCcw className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-active:rotate-180'}`} />
        </button>
      </div>

      {/* TOKEN TOGGLE */}
      <div className="flex items-center justify-center gap-1.5 bg-slate-100/50 p-1 rounded-full w-fit mx-auto -mb-2">
        <button 
          onClick={() => setSelectedToken('USDC')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            selectedToken === 'USDC' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600 px-3'
          }`}
        >
          USDC
        </button>
        <button 
          onClick={() => setSelectedToken('EURC')}
          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            selectedToken === 'EURC' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-400 hover:text-slate-600 px-3'
          }`}
        >
          EURC
        </button>
      </div>

      {/* MAIN BALANCE */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedToken === 'USDC' ? 'bg-blue-500' : 'bg-emerald-500'} text-white shadow-sm`}>
            {selectedToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5" /> : <Euro className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">{selectedToken}</span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-tight">
          {displayBalance}
        </h2>
        <p className="text-[11px] font-bold text-slate-400 mt-1">
          {selectedToken === 'USDC' ? 'Arc Testnet · Native Gas Token' : 'Arc Testnet · ERC-20 Token'}
        </p>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* UNIFIED BALANCE ROW */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unified Balance</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900">{unifiedBalance} {selectedToken}</span>
          <button 
            onClick={onDepositToUnified}
            className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
          >
            Deposit
          </button>
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full" />

      {/* WALLET ROW */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Address</span>
        <span className="text-xs font-mono font-medium text-slate-400 tracking-tighter">{truncatedAddress}</span>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex items-stretch gap-2 mt-2">
        <button 
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.15em] rounded-xl transition-all hover:bg-slate-800 active:scale-[0.98]" 
          onClick={onDisconnect}
        >
          <LogOut className="w-3.5 h-3.5" />
          Disconnect
        </button>
        <button className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-200 transition-all group active:scale-95" onClick={refetch} disabled={isLoading}>
          <RefreshCcw className={`w-5 h-5 transition-transform ${isLoading ? 'animate-spin' : 'group-active:rotate-180'}`} />
        </button>
      </div>
    </div>
  );
}
