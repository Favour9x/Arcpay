import { Send, ArrowLeftRight, RefreshCw, History, Layers } from 'lucide-react';
import { TabType } from '../types';

interface TabNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabs: { id: TabType; icon: any; label: string }[] = [
    { id: 'send', icon: Send, label: 'Send' },
    { id: 'swap', icon: RefreshCw, label: 'Swap' },
    { id: 'bridge', icon: ArrowLeftRight, label: 'Bridge' },
    { id: 'unified', icon: Layers, label: 'Unified' },
    { id: 'history', icon: History, label: 'History' },
  ];

  return (
    <div className="flex border-b border-slate-100 sticky top-20 bg-white/80 backdrop-blur-md z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`nav-tab flex items-center justify-center gap-2 ${
            activeTab === tab.id ? 'nav-tab-active' : ''
          }`}
        >
          <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'}`} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
