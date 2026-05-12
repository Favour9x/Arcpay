import { useState } from 'react';
import { ChevronDown, Info, CheckCircle2, Circle, DollarSign, ExternalLink, Layers, Loader2 } from 'lucide-react';
import { useAccount, useWalletClient } from 'wagmi';
import { kit, createAdapter, CHAIN_MAPPING } from '../utils/appKit';
import { useBalances } from '../hooks/useBalances';

export default function UnifiedTab() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { usdcBalance, unifiedBalance, refetch } = useBalances();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isDepositChainOpen, setIsDepositChainOpen] = useState(false);
  const [selectedDepositChain, setSelectedDepositChain] = useState('Ethereum Sepolia');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processType, setProcessType] = useState<'deposit' | 'spend' | null>(null);
  const [error, setError] = useState('');

  const depositChains = [
    'Ethereum Sepolia',
    'Arbitrum Sepolia',
    'Base Sepolia',
    'OP Sepolia',
    'Unichain Sepolia',
    'Polygon PoS Amoy',
    'Avalanche Fuji',
    'Solana Devnet',
    'HyperEVM Testnet',
    'Sei Testnet',
    'Sonic Testnet',
    'World Chain Sepolia'
  ];

  const handleDeposit = async () => {
    if (!depositAmount || !walletClient || !address) return;
    
    setProcessType('deposit');
    setIsProcessing(true);
    setError('');

    try {
      const adapter = await createAdapter(walletClient, address);
      const sourceChain = CHAIN_MAPPING[selectedDepositChain];

      await kit.unifiedBalance.deposit({
        from: { adapter, chain: sourceChain },
        amount: depositAmount,
        token: 'USDC'
      });

      setDepositAmount('');
      refetch();
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Deposit failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpend = async () => {
    if (!spendAmount || !recipientAddress || !walletClient || !address) return;
    
    setProcessType('spend');
    setIsProcessing(true);
    setError('');

    try {
      const adapter = await createAdapter(walletClient, address);

      await kit.unifiedBalance.spend({
        from: { adapter },
        amountIn: spendAmount,
        to: {
          adapter,
          chain: 'Arc_Testnet',
          recipientAddress: recipientAddress
        }
      });

      setSpendAmount('');
      setRecipientAddress('');
      refetch();
    } catch (err: any) {
      console.error('Spend error:', err);
      setError(err.message || 'Spend failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMaxDeposit = () => {
    setDepositAmount(usdcBalance);
  };

  const unifiedBalanceNum = parseFloat(unifiedBalance);
  const canSpend = unifiedBalanceNum > 0 && parseFloat(spendAmount) <= unifiedBalanceNum;

  return (
    <div className="p-6 pt-14 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* DEPOSIT SECTION */}
      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Deposit to Unified Balance</h3>
          <p className="text-sm font-bold text-slate-400">Combine USDC from multiple chains into one balance</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Source Chain */}
            <div className="relative">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Source Chain</label>
              <button 
                onClick={() => setIsDepositChainOpen(!isDepositChainOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900 group transition-all hover:border-blue-200"
                disabled={isProcessing}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="truncate">{selectedDepositChain}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDepositChainOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDepositChainOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  {depositChains.map((chain) => (
                    <button
                      key={chain}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedDepositChain(chain);
                        setIsDepositChainOpen(false);
                      }}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Token - Locked */}
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Asset</label>
              <div className="w-full flex items-center gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm text-slate-900">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <DollarSign className="w-3 h-3" />
                </div>
                <span>USDC</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Amount</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="input-field py-4 text-xl font-black bg-slate-50/50 border-slate-100 focus:bg-white focus:border-blue-500" 
                disabled={isProcessing}
              />
              <button 
                onClick={handleMaxDeposit}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest"
                disabled={isProcessing}
              >
                Max
              </button>
            </div>
          </div>

          <button 
            onClick={handleDeposit}
            className="w-full flex items-center justify-center gap-3 py-5 text-lg rounded-[var(--radius-button)] font-black uppercase italic tracking-tight transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-900 text-white hover:bg-slate-800"
            disabled={!depositAmount || isProcessing}
          >
            {isProcessing && processType === 'deposit' && <Loader2 className="w-5 h-5 animate-spin" />}
            {depositAmount ? 'Deposit to Unified' : 'Enter Amount'}
          </button>
        </div>
      </section>

      <div className="h-px bg-slate-100" />

      {/* UNIFIED BALANCE SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col items-center text-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[var(--radius-card)] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-32 h-32 rotate-12" />
          </div>
          <label className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-slate-400">Your Unified Balance</label>
          <div className="text-5xl font-black tracking-tighter mb-2">{unifiedBalance} USDC</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combined from all deposited chains</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Spend on Arc</h3>
            <p className="text-sm font-bold text-slate-400">Instantly use your unified balance</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Recipient Address</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="input-field py-4 text-xs font-bold" 
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Amount</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={spendAmount}
                    onChange={(e) => setSpendAmount(e.target.value)}
                    className="input-field py-4 text-sm font-black" 
                    disabled={isProcessing}
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">To Network</label>
                <div className="w-full flex items-center gap-2 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl font-bold text-sm text-slate-900">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="truncate">Arc Testnet</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSpend}
              className="w-full flex items-center justify-center gap-3 py-5 text-lg rounded-[var(--radius-button)] font-black uppercase italic tracking-tight transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
              disabled={!canSpend || !recipientAddress || !spendAmount || isProcessing}
            >
              {isProcessing && processType === 'spend' && <Loader2 className="w-5 h-5 animate-spin" />}
              {!spendAmount ? 'Enter Amount' : !recipientAddress ? 'Enter Address' : unifiedBalanceNum === 0 ? 'No Balance' : 'Spend on Arc'}
            </button>
          </div>
        </div>
      </section>

      {/* INFO NOTE */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-[11px] font-semibold text-slate-600 leading-normal">
          Deposit USDC from any supported chain into your <span className="text-slate-900 font-bold italic">Unified Balance</span>, then spend it instantly on Arc — no bridging needed.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      {/* STEP TRACKER */}
      {isProcessing && (
        <div className="pt-8 border-t border-slate-100 animate-in fade-in-0 duration-700 space-y-6">
          <div className="flex items-center justify-between relative px-2">
            {/* Step 1: Deposit/Action */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">
                  {processType === 'deposit' ? 'Deposit' : 'Spend'}
                </span>
              </div>
              <a href="https://testnet.arcscan.app" target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600">
                Tx <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex-1 h-1 bg-slate-100 -mt-8" />

            {/* Step 2: Confirm */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Confirm</span>
              </div>
              <a href="https://testnet.arcscan.app" target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600">
                Tx <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex-1 h-1 bg-slate-100 -mt-8" />

            {/* Step 3: Spend/Complete */}
            <div className="flex flex-col items-center gap-3 relative z-10 opacity-40">
              <div className="flex flex-col items-center">
                <Circle className="w-7 h-7 text-slate-300" />
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                  {processType === 'deposit' ? 'Complete' : 'Receive'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-300">Pending</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
