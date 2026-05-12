import { useState } from 'react';
import { ChevronDown, Info, CheckCircle2, Circle, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useAccount, useWalletClient } from 'wagmi';
import { kit, createAdapter, CHAIN_MAPPING } from '../utils/appKit';
import { useBalances } from '../hooks/useBalances';

export default function BridgeTab({ isConnected = true }: { isConnected?: boolean }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { usdcBalance, refetch } = useBalances();
  
  const [direction, setDirection] = useState<'to' | 'from'>('to');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isBridging, setIsBridging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('Ethereum Sepolia');
  const [isChainListOpen, setIsChainListOpen] = useState(false);
  const [error, setError] = useState('');
  const [bridgeSteps, setBridgeSteps] = useState<any[]>([]);

  const balance = parseFloat(usdcBalance);

  const handleMax = () => {
    setAmount(balance.toString());
  };

  const handlePercentage = (percent: number) => {
    const calculated = (balance * percent) / 100;
    setAmount(calculated.toFixed(2));
  };

  const chains = [
    'Ethereum Sepolia',
    'Arbitrum Sepolia',
    'Base Sepolia',
    'OP Sepolia',
    'Unichain Sepolia',
    'Linea Sepolia',
    'Polygon PoS Amoy',
    'Avalanche Fuji',
    'Solana Devnet',
    'HyperEVM Testnet',
    'Monad Testnet',
    'Morph Testnet',
    'Pharos Atlantic',
    'Plume Testnet',
    'Sei Testnet',
    'Sonic Testnet',
    'World Chain Sepolia',
    'Codex Testnet',
    'EDGE Testnet',
    'Ink Testnet',
    'XDC Apothem'
  ];

  const handleBridge = () => {
    if (!amount) return;
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!walletClient || !address) {
      setError('Wallet not connected');
      return;
    }

    setIsBridging(true);
    setError('');
    setBridgeSteps([]);

    try {
      const adapter = createAdapter(walletClient, address);
      const sourceChain = direction === 'to' ? CHAIN_MAPPING[selectedChain] : 'Arc_Testnet';
      const destChain = direction === 'to' ? 'Arc_Testnet' : CHAIN_MAPPING[selectedChain];

      const result = await kit.bridge({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destChain },
        amount: amount
      });

      // Track bridge steps
      if (result.steps) {
        setBridgeSteps(result.steps);
      }

      // Reset after success
      setAmount('');
      setRecipientAddress('');
      refetch();
    } catch (err: any) {
      console.error('Bridge error:', err);
      setError(err.message || 'Bridge failed');
      setIsBridging(false);
    }
  };

  const isDisabled = !isConnected || !amount || isBridging || parseFloat(amount) > balance;
  const buttonText = isBridging 
    ? 'Processing...' 
    : !isConnected 
    ? 'Connect Wallet' 
    : !amount 
    ? 'Enter Amount' 
    : parseFloat(amount) > balance
    ? 'Insufficient Balance'
    : 'Bridge';

  return (
    <div className="p-6 pt-14 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Bridge"
        details={[
          { label: 'Asset', value: 'USDC' },
          { label: 'Amount', value: `${amount} USDC` },
          { label: 'From Network', value: direction === 'to' ? selectedChain : 'Arc Testnet' },
          { label: 'To Network', value: direction === 'to' ? 'Arc Testnet' : selectedChain },
        ]}
        actionLabel="Confirm Bridge"
        type="bridge"
      />

      {/* Direction Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setDirection('to')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            direction === 'to' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
          }`}
          disabled={isBridging}
        >
          To Arc
        </button>
        <button
          onClick={() => setDirection('from')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            direction === 'from' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
          }`}
          disabled={isBridging}
        >
          From Arc
        </button>
      </div>

      {/* Network Selectors */}
      <div className="grid grid-cols-2 gap-4 relative">
        {/* From Network */}
        <div className={`p-4 border rounded-2xl transition-all ${
          direction === 'to' ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">From</label>
          {direction === 'to' ? (
            <div className="relative">
              <button 
                onClick={() => setIsChainListOpen(!isChainListOpen)}
                className="w-full flex items-center justify-between font-bold text-sm text-slate-900 pr-1 group"
                disabled={isBridging}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="truncate">{selectedChain}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isChainListOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isChainListOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  {chains.map((chain) => (
                    <button
                      key={chain}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedChain(chain);
                        setIsChainListOpen(false);
                      }}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="truncate">Arc Testnet</span>
            </div>
          )}
        </div>

        {/* To Network */}
        <div className={`p-4 border rounded-2xl transition-all ${
          direction === 'from' ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">To</label>
          {direction === 'from' ? (
            <div className="relative">
              <button 
                onClick={() => setIsChainListOpen(!isChainListOpen)}
                className="w-full flex items-center justify-between font-bold text-sm text-slate-900 pr-1 group"
                disabled={isBridging}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="truncate">{selectedChain}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isChainListOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isChainListOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  {chains.map((chain) => (
                    <button
                      key={chain}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedChain(chain);
                        setIsChainListOpen(false);
                      }}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="truncate">Arc Testnet</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Token Info (Locked to USDC) */}
        <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-3xl flex items-center justify-between">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1 px-1">Selected Asset</label>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">USDC</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Available</span>
            <span className="text-sm font-black text-slate-900">{balance.toFixed(2)} USDC</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Bridge Amount</label>
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercentage(p)}
                    className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                    disabled={isBridging}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field py-4 text-xl font-black focus:ring-blue-500 focus:border-blue-500" 
                disabled={isBridging}
              />
              <button 
                onClick={handleMax}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest"
                disabled={isBridging}
              >
                Max
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Recipient Address</label>
            <input 
              type="text" 
              placeholder="Defaults to connected wallet" 
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="input-field text-xs font-bold py-4" 
              disabled={isBridging}
            />
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-[11px] font-semibold text-slate-600 leading-normal">
          Get USDC from <a href="https://faucet.circle.com" target="_blank" className="text-blue-600 hover:underline">faucet.circle.com</a> and native gas tokens from a public faucet for your source chain.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <button 
        onClick={handleBridge}
        className={`w-full flex items-center justify-center gap-3 py-5 text-lg rounded-[var(--radius-button)] font-black uppercase italic tracking-tight transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white`} 
        disabled={isDisabled}
      >
        {isBridging && <Loader2 className="w-5 h-5 animate-spin" />}
        {buttonText}
      </button>

      {/* Step Tracker */}
      {isBridging && bridgeSteps.length > 0 && (
        <div className="pt-8 border-t border-slate-100 animate-in fade-in-0 duration-700 space-y-6">
          <div className="flex items-center justify-between relative px-2">
            {bridgeSteps.map((step, index) => (
              <>
                <div key={step.name} className="flex flex-col items-center gap-3 relative z-10">
                  <div className="flex flex-col items-center">
                    {step.state === 'completed' ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                    ) : step.state === 'processing' ? (
                      <div className="w-7 h-7 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    ) : (
                      <Circle className="w-7 h-7 text-slate-300" />
                    )}
                    <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">{step.name}</span>
                  </div>
                  {step.explorerUrl ? (
                    <a href={step.explorerUrl} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600">
                      Tx <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-300">Pending</span>
                  )}
                </div>
                {index < bridgeSteps.length - 1 && <div className="flex-1 h-1 bg-slate-100 -mt-8" />}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="p-6 pt-14 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Bridge"
        details={[
          { label: 'Asset', value: 'USDC' },
          { label: 'Amount', value: `${amount} USDC` },
          { label: 'From Network', value: direction === 'to' ? selectedChain : 'Arc Testnet' },
          { label: 'To Network', value: direction === 'to' ? 'Arc Testnet' : selectedChain },
        ]}
        actionLabel="Confirm Bridge"
        type="bridge"
      />

      {/* Direction Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setDirection('to')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            direction === 'to' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
          }`}
        >
          To Arc
        </button>
        <button
          onClick={() => setDirection('from')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
            direction === 'from' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
          }`}
        >
          From Arc
        </button>
      </div>

      {/* Network Selectors */}
      <div className="grid grid-cols-2 gap-4 relative">
        {/* From Network */}
        <div className={`p-4 border rounded-2xl transition-all ${
          direction === 'to' ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">From</label>
          {direction === 'to' ? (
            <div className="relative">
              <button 
                onClick={() => setIsChainListOpen(!isChainListOpen)}
                className="w-full flex items-center justify-between font-bold text-sm text-slate-900 pr-1 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="truncate">{selectedChain}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isChainListOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isChainListOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  {chains.map((chain) => (
                    <button
                      key={chain}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedChain(chain);
                        setIsChainListOpen(false);
                      }}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="truncate">Arc Testnet</span>
            </div>
          )}
        </div>

        {/* To Network */}
        <div className={`p-4 border rounded-2xl transition-all ${
          direction === 'from' ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">To</label>
          {direction === 'from' ? (
            <div className="relative">
              <button 
                onClick={() => setIsChainListOpen(!isChainListOpen)}
                className="w-full flex items-center justify-between font-bold text-sm text-slate-900 pr-1 group"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <span className="truncate">{selectedChain}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isChainListOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isChainListOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-100 shadow-2xl rounded-2xl max-h-60 overflow-y-auto no-scrollbar py-2">
                  {chains.map((chain) => (
                    <button
                      key={chain}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedChain(chain);
                        setIsChainListOpen(false);
                      }}
                    >
                      {chain}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="truncate">Arc Testnet</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Token Info (Locked to USDC) */}
        <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-3xl flex items-center justify-between">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1 px-1">Selected Asset</label>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-900">USDC</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Available</span>
            <span className="text-sm font-black text-slate-900">9.65 USDC</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Bridge Amount</label>
              <div className="flex gap-1.5">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercentage(p)}
                    className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field py-4 text-xl font-black focus:ring-blue-500 focus:border-blue-500" 
              />
              <button 
                onClick={handleMax}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest"
              >
                Max
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2 px-1">Recipient Address</label>
            <input 
              type="text" 
              placeholder="Defaults to connected wallet" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field text-xs font-bold py-4" 
            />
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0" />
        <p className="text-[11px] font-semibold text-slate-600 leading-normal">
          Get USDC from <a href="https://faucet.circle.com" target="_blank" className="text-blue-600 hover:underline">faucet.circle.com</a> and native gas tokens from a public faucet for your source chain.
        </p>
      </div>

      <button 
        onClick={handleBridge}
        className={`w-full flex items-center justify-center gap-3 py-5 text-lg rounded-[var(--radius-button)] font-black uppercase italic tracking-tight transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 text-white`} 
        disabled={!isConnected || !amount || isBridging}
      >
        {!isConnected ? 'Connect Wallet' : !amount ? 'Enter Amount' : 'Bridge'}
      </button>

      {/* Step Tracker */}
      {isBridging && (
        <div className="pt-8 border-t border-slate-100 animate-in fade-in-0 duration-700 space-y-6">
          <div className="flex items-center justify-between relative px-2">
            {/* Step 1: Approve */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Approve</span>
              </div>
              <a href="https://testnet.arcscan.app" target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600">
                Tx <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex-1 h-1 bg-slate-100 -mt-8" />

            {/* Step 2: Bridge */}
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">Bridge</span>
              </div>
              <a href="https://testnet.arcscan.app" target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-emerald-600">
                Tx <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex-1 h-1 bg-slate-100 -mt-8" />

            {/* Step 3: Receive */}
            <div className="flex flex-col items-center gap-3 relative z-10 opacity-40">
              <div className="flex flex-col items-center">
                <Circle className="w-7 h-7 text-slate-300" />
                <span className="mt-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Receive</span>
              </div>
              <span className="text-[10px] font-bold text-slate-300">Pending</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
