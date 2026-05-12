import { Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface ConnectScreenProps {
  onConnect: () => void;
}

export default function ConnectScreen({ onConnect }: ConnectScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-100/50 rounded-full blur-3xl -z-10" />
      
      <div className="w-full max-w-lg text-center">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="text-white w-7 h-7" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">ArcPay</span>
        </div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight"
        >
          Your stablecoin wallet on Arc
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 mb-10 leading-relaxed"
        >
          Send, swap, and bridge USDC & EURC on Arc
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button
                onClick={openConnectModal}
                className="w-full btn-primary text-xl py-5 shadow-xl shadow-emerald-500/20"
              >
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </motion.div>
        
        <p className="mt-6 text-sm font-semibold text-slate-400">
          Arc Testnet · Chain ID 5042002 · USDC gas
        </p>

        <footer className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 flex items-center justify-center gap-4">
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
    </div>
  );
}
