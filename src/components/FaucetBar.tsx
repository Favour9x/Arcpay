import { ExternalLink } from 'lucide-react';

export default function FaucetBar() {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-center sm:text-left">
        <p className="text-sm font-bold text-emerald-900">Need testnet tokens?</p>
        <p className="text-xs font-medium text-emerald-700">Get USDC from Circle's faucet to start transacting.</p>
      </div>
      <a 
        href="https://faucet.circle.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
      >
        Get Tokens
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
