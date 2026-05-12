import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  details: {
    label: string;
    value: string;
    isAddress?: boolean;
  }[];
  actionLabel: string;
  type: 'send' | 'swap' | 'bridge';
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  details, 
  actionLabel,
  type 
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    send: { color: 'emerald', iconColor: 'emerald' },
    swap: { color: 'blue', iconColor: 'blue' },
    bridge: { color: 'indigo', iconColor: 'indigo' }
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Icon/Status Area */}
          <div className="px-6 pb-6 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-3xl bg-${config.color}-50 flex items-center justify-center mb-4`}>
              <ShieldCheck className={`w-8 h-8 text-${config.color}-600`} />
            </div>
            <p className="text-sm font-bold text-slate-500 text-center">Please review your transaction details carefully before confirming.</p>
          </div>

          {/* Details List */}
          <div className="px-6 space-y-3">
            {details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">{detail.label}</span>
                <span className={`text-sm font-bold text-slate-900 text-right ${detail.isAddress ? 'font-mono text-[11px]' : ''}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          {/* Network Fee (Static for now) */}
          <div className="px-10 py-6 text-center">
             <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
               <span>Estimated Network Fee</span>
             </div>
             <p className="text-xs font-black text-slate-900">~ 0.001 ETH ($2.40)</p>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-slate-50/50 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 rounded-2xl transition-all shadow-lg active:scale-[0.98]`}
            >
              {actionLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
