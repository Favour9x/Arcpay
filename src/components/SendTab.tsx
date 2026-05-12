import { useState } from 'react';
import { ChevronDown, Send, Copy, Check, DollarSign, Euro, Loader2 } from 'lucide-react';
import { Token } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { kit, createAdapter, pollTransactionReceipt } from '../utils/appKit';
import { useBalances } from '../hooks/useBalances';

export default function SendTab() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { usdcBalance, eurcBalance, refetch } = useBalances();
  
  const [selectedToken, setSelectedToken] = useState<Token>('USDC');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const balances = {
    USDC: parseFloat(usdcBalance),
    EURC: parseFloat(eurcBalance)
  };

  const handleMax = () => {
    setAmount(balances[selectedToken].toString());
  };

  const handlePercentage = (percent: number) => {
    const calculated = (balances[selectedToken] * percent) / 100;
    setAmount(calculated.toFixed(2));
  };

  const handleCopy = () => {
    if (!recipientAddress) return;
    navigator.clipboard.writeText(recipientAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!walletClient || !address || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const adapter = createAdapter(walletClient, address);
      
      const result = await kit.send({
        from: { adapter, chain: 'Arc_Testnet' },
        to: recipientAddress,
        amount: amount,
        token: selectedToken
      });

      // Poll for transaction receipt
      if (result.txHash) {
        await pollTransactionReceipt(publicClient, result.txHash);
      }

      // Reset fields after success
      setAmount('');
      setRecipientAddress('');
      refetch();
    } catch (err: any) {
      console.error('Send error:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = !recipientAddress || !amount || isProcessing || parseFloat(amount) > balances[selectedToken];
  const buttonText = isProcessing 
    ? 'Processing...' 
    : !recipientAddress || !amount 
    ? 'Enter Details' 
    : parseFloat(amount) > balances[selectedToken]
    ? 'Insufficient Balance'
    : `Send ${selectedToken}`;

  return (
    <div className="p-6 pt-14 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Send"
        details={[
          { label: 'Recipient', value: recipientAddress, isAddress: true },
          { label: 'Amount', value: `${amount} ${selectedToken}` },
          { label: 'Network', value: 'Arc Testnet' }
        ]}
        actionLabel="Send Now"
        type="send"
      />

      {/* Token Selector */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button
          onClick={() => setSelectedToken('USDC')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            selectedToken === 'USDC' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedToken === 'USDC' ? 'bg-blue-500 text-white' : 'bg-slate-200'}`}>
            <DollarSign className="w-3 h-3" />
          </div>
          USDC
        </button>
        <button
          onClick={() => setSelectedToken('EURC')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            selectedToken === 'EURC' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedToken === 'EURC' ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
            <Euro className="w-3 h-3" />
          </div>
          EURC
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Recipient Address</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="0x..." 
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="input-field pr-12"
              disabled={isProcessing}
            />
            {recipientAddress && (
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                title="Copy Address"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 px-1">Amount</label>
          <div className="relative">
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field pr-36"
              disabled={isProcessing}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button 
                onClick={handleMax}
                className="text-[10px] font-black text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded"
                disabled={isProcessing}
              >
                MAX
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center px-1">
            <div className="flex gap-1.5">
              {[25, 50, 75, 100].map((p) => (
                <button
                  key={p}
                  onClick={() => handlePercentage(p)}
                  className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                  disabled={isProcessing}
                >
                  {p}%
                </button>
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Available: {balances[selectedToken]} {selectedToken}</span>
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
        className={`w-full flex items-center justify-center gap-3 py-5 text-lg rounded-[var(--radius-button)] font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
          selectedToken === 'USDC' 
            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
            : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
        } text-white`} 
        disabled={isDisabled}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            {selectedToken === 'USDC' ? <DollarSign className="w-3.5 h-3.5" /> : <Euro className="w-3.5 h-3.5" />}
          </div>
        )}
        {buttonText}
      </button>
    </div>
  );
}
