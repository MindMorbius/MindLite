import { useState, useEffect } from 'react';
import { CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function ModelSelector({ onModelSelect }) {
  const [cachedModels, setCachedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCachedModels();
  }, []);

  const loadCachedModels = async () => {
    setLoading(true);
    if (!('caches' in window)) {
      setLoading(false);
      return;
    }
    
    try {
      const cache = await caches.open('sherpa-models');
      const keys = await cache.keys();
      
      // Group cached files by model folder
      const models = {};
      for (const key of keys) {
        const path = new URL(key.url).searchParams.get('path');
        const [, , folder] = path.split('/');
        
        if (!models[folder]) {
          models[folder] = { files: [] };
        }
        models[folder].files.push(path);
      }

      // Only include complete model sets
      const completeModels = Object.entries(models)
        .filter(([, data]) => {
          const hasEncoder = data.files.some(f => f.includes('encoder'));
          const hasDecoder = data.files.some(f => f.includes('decoder'));
          const hasJoiner = data.files.some(f => f.includes('joiner'));
          const hasTokens = data.files.some(f => f.includes('tokens'));
          return hasEncoder && hasDecoder && hasJoiner && hasTokens;
        })
        .map(([name]) => name);

      setCachedModels(completeModels);
    } catch (error) {
      console.error('Failed to load cached models:', error);
    }
    setLoading(false);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    onModelSelect(model);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-200">Select Model</h3>
        <button
          onClick={loadCachedModels}
          className="p-1.5 rounded-full hover:bg-gray-600 transition-colors active:bg-gray-500"
          disabled={loading}
        >
          <ArrowPathIcon 
            className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} 
          />
        </button>
      </div>

      <div className="space-y-2">
        {cachedModels.map(model => (
          <button
            key={model}
            onClick={() => handleModelSelect(model)}
            className={`
              w-full flex items-center justify-between p-2 rounded-lg
              ${selectedModel === model 
                ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' 
                : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'}
            `}
          >
            <span>{model}</span>
            {selectedModel === model && (
              <CheckIcon className="w-5 h-5" />
            )}
          </button>
        ))}
        {cachedModels.length === 0 && (
          <div className="text-sm text-gray-400 text-center p-2 bg-gray-700/50 rounded-lg">
            {loading ? 'Loading...' : 'No cached models available. Please download a model first.'}
          </div>
        )}
      </div>
    </div>
  );
} 