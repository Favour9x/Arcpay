import { History, ArrowUpRight, ArrowLeftRight, RefreshCw, Layers, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { useTransactionHistory } from '../hooks/useTransactionHistory';

export default function HistoryTab() {
  const { transactions, isLoading, refetch } = useTransactionHistory();

  return (
    <div className="p-10 pt-14 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Recent Transactions</h3>
        <div className="flex items-center gap-3">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">{transactions.length}</span>
          <button 
            onClick={refetch}
            disabled={isLoading}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && transactions.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-6">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-6">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
            <History className="w-10 h-10 text-slate-200" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-slate-900">No transactions yet</p>
            <p className="text-sm font-medium text-slate-500">Perform your first action above to start your journey on Arc.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {transactions.map(tx => (
             <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100">
                    {tx.type === 'SEND' && <ArrowUpRight className="w-5 h-5 text-slate-500" />}
                    {tx.type === 'SWAP' && <RefreshCw className="w-5 h-5 text-slate-500" />}
                    {tx.type === 'BRIDGE' && <ArrowLeftRight className="w-5 h-5 text-slate-500" />}
                    {(tx.type === 'UNIFIED DEPOSIT' || tx.type === 'UNIFIED SPEND') && <Layers className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 truncate max-w-[150px]">{tx.amount} {tx.token}</div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-tighter ${
                        tx.type === 'UNIFIED DEPOSIT' || tx.type === 'UNIFIED SPEND' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-500 truncate max-w-[200px]">{tx.address}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'success' ? 'bg-emerald-500' : 
                      tx.status === 'pending' ? 'bg-amber-500' : 
                      'bg-red-500'
                    }`} />
                    <span className="text-[10px] font-black uppercase text-slate-900 tracking-widest">{tx.status}</span>
                  </div>
                  <a 
                    href={`https://testnet.arcscan.app/tx/${tx.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter hover:text-emerald-600 transition-colors"
                  >
                    View →
                  </a>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
