import { useState, useEffect } from 'react';
import { ArrowDownUp, ChevronDown, DollarSign, Euro, Loader2 } from 'lucide-react';
import { Token } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { kit, createAdapter, pollTransactionReceipt } from '../utils/appKit';
import { useBalances } from '../hooks/useBalances';

export default function SwapTab() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { usdcBalance, eurcBalance, refetch } = useBalances();
  
  const [payToken, setPayToken] = useState<Token>('USDC');
  const receiveToken: Token = payToken === 'USDC' ? 'EURC' : 'USDC';
  const [amount, setAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [fee, setFee] = useState('0.00');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [error, setError] = useState('');

  const balances = {
    USDC: parseFloat(usdcBalance),
    EURC: parseFloat(eurcBalance)
  };

  // Get quote when amount changes
  useEffect(() => {
    const getQuote = async () => {
      if (!amount || !walletClient || !address || parseFloat(amount) === 0) {
        setReceiveAmount('');
        setFee('0.00');
        return;
      }

      setIsLoadingQuote(true);
      try {
        const adapter = await createAdapter(walletClient, address);
        const quote = await kit.swap({
          from: { adapter, chain: 'Arc_Testnet' },
          tokenIn: payToken,
          tokenOut: receiveToken,
          amountIn: amount,
          config: { kitKey: import.meta.env.VITE_CIRCLE_KIT_KEY || '' },
          quoteOnly: true
        });

        setReceiveAmount(quote.amountOut || amount);
        setFee(quote.fees || '0.00');
      } catch (err) {
        console.error('Quote error:', err);
        setReceiveAmount(amount); // Fallback to 1:1
        setFee('0.00');
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [amount, payToken, receiveToken, walletClient, address]);

  const handleMax = () => {
    setAmount(balances[payToken].toString());
  };

  const handlePercentage = (percent: number) => {
    const calculated = (balances[payToken] * percent) / 100;
    setAmount(calculated.toFixed(2));
  };

  const handleFlip = () => {
    setPayToken(receiveToken);
    setAmount('');
    setReceiveAmount('');
  };

  const handleConfirm = async () => {
    if (!walletClient || !address || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const adapter = await createAdapter(walletClient, address);
      
      const result = await kit.swap({
        from: { adapter, chain: 'Arc_Testnet' },
        tokenIn: payToken,
        tokenOut: receiveToken,
        amountIn: amount,
        config: { kitKey: import.meta.env.VITE_CIRCLE_KIT_KEY || '' }
      });

      // Poll for transaction receipt
      if (result.txHash) {
        await pollTransactionReceipt(publicClient, result.txHash);
      }

      setAmount('');
      setReceiveAmount('');
      refetch();
    } catch (err: any) {
      console.error('Swap error:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = !amount || isProcessing || isLoadingQuote || parseFloat(amount) > balances[payToken];
  const buttonText = isProcessing 
    ? 'Processing...' 
    : isLoadingQuote
    ? 'Getting Quote...'
    : !amount 
    ? 'ENTER AMOUNT' 
    : parseFloat(amount) > balances[payToken]
    ? 'INSUFFICIENT BALANCE'
    : `SWAP ${payToken} FOR ${receiveToken}`;

  return (
    <div className="p-6 pt-14 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Swap"
        details={[
          { label: 'Pay', value: `${amount} ${payToken}` },
          { label: 'Receive', value: `${receiveAmount || amount} ${receiveToken}` },
          { label: 'Rate', value: `1 ${payToken} ≈ ${receiveAmount && amount ? (parseFloat(receiveAmount) / parseFloat(amount)).toFixed(4) : '1'} ${receiveToken}` }
        ]}
        actionLabel="Confirm Swap"
        type="swap"
      />
      
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">Swap Tokens</h3>
        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-full tracking-widest uppercase">Instant Execution</span>
      </div>

      <div className="space-y-2 relative">
        {/* You Pay - From Section */}
        <div className={`p-6 border rounded-3xl transition-all ${
          payToken === 'USDC' ? 'bg-blue-50/50 border-blue-100 focus-within:border-blue-300' : 'bg-emerald-50/50 border-emerald-100 focus-within:border-emerald-300'
        }`}>
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Swap From</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                payToken === 'USDC' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>{payToken}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[25, 50, 75, 100].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePercentage(p)}
                    className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/50 text-slate-500 hover:bg-white hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-100"
                    disabled={isProcessing}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <button 
                onClick={handleMax}
                className="text-[10px] font-black text-emerald-600 hover:bg-white px-2 py-0.5 rounded border border-transparent hover:border-emerald-200 transition-all"
                disabled={isProcessing}
              >
                MAX
              </button>
              <span className="text-xs font-bold text-slate-400">Bal: {balances[payToken].toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 bg-transparent border-none p-0 outline-none text-4xl font-black text-slate-900 placeholder:text-slate-200"
              disabled={isProcessing}
            />
            <button 
              onClick={handleFlip}
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 font-bold text-sm hover:border-emerald-500 transition-all shrink-0"
              disabled={isProcessing}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${payToken === 'USDC' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {payToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5" /> : <Euro className="w-3.5 h-3.5" />}
              </div>
              <span className="tracking-tight">{payToken}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Flip Button */}
        <div className="absolute left-1/2 -ml-6 top-[110px] z-10">
          <button 
            onClick={handleFlip}
            className="w-12 h-12 bg-white border-4 border-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 transition-all active:scale-95 text-slate-400 hover:text-emerald-500 group"
            disabled={isProcessing}
          >
            <ArrowDownUp className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* You Receive - To Section */}
        <div className={`p-6 border rounded-3xl pt-10 ${
          receiveToken === 'USDC' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'
        }`}>
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Swap To</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                receiveToken === 'USDC' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
              }`}>{receiveToken}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">Bal: {balances[receiveToken].toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="number" 
              placeholder="0.00" 
              value={receiveAmount || amount}
              readOnly
              className="flex-1 bg-transparent border-none p-0 outline-none text-4xl font-black text-slate-900 placeholder:text-slate-200"
            />
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 font-bold text-sm shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${receiveToken === 'USDC' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {receiveToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5" /> : <Euro className="w-3.5 h-3.5" />}
              </div>
              <span className="tracking-tight">{receiveToken}</span>
              <ChevronDown className="w-4 h-4 text-slate-200" />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exchange Fee</span>
            <span className="text-xs font-black text-slate-900 uppercase">{fee} {payToken}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full btn-primary py-5 text-lg shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={isDisabled}
      >
        {isProcessing || isLoadingQuote ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <div className="flex -space-x-2">
            <div className={`w-7 h-7 rounded-full border-2 border-emerald-600 shadow-sm flex items-center justify-center ${payToken === 'USDC' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
              {payToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5 text-white" /> : <Euro className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={`w-7 h-7 rounded-full border-2 border-emerald-600 shadow-sm flex items-center justify-center ${receiveToken === 'USDC' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
              {receiveToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5 text-white" /> : <Euro className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        )}
        <span className="font-black italic uppercase tracking-tight">
          {buttonText}
        </span>
      </button>
    </div>
  );
}
