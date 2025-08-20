import { Dot } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus = ({ isConnected }: ConnectionStatusProps) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${
      isConnected 
        ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
        : 'bg-red-400 shadow-lg shadow-red-400/50'
    }`} />
    <span className={`text-xs font-medium ${
      isConnected ? 'text-emerald-400' : 'text-red-400'
    }`}>
      {isConnected ? 'Online' : 'Offline'}
    </span>
  </div>
);