import { useState } from 'react';
import { Plus } from 'lucide-react';

interface CreateCommunityModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreateCommunityModal = ({
  show,
  onClose,
  onCreate
}: CreateCommunityModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (name.trim() && description.trim()) {
      onCreate(name.trim(), description.trim());
      setName('');
      setDescription('');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Create Community</h3>
            <p className="text-sm text-slate-400">Build your own space</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Community Name</label>
            <input
              type="text"
              placeholder="Enter community name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              placeholder="Describe your community..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || !description.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Community
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};