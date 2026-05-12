import { Layers } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 shadow-sm shadow-slate-200/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer">
          <Layers className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-900 leading-tight">ArcPay</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-50/50 border border-emerald-100/50 px-3 py-1.5 rounded-full">
          <div className="relative flex h-2 w-2">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
            <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest px-0.5">Arc Testnet</span>
        </div>
      </div>
    </header>
  );
}
