import { CheckCircleIcon, XCircleIcon, CpuChipIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import ModelLoader from './ModelLoader';
import VoiceInteraction from './VoiceInteraction';

export default function VoicePage() {
  const [wasmSupported, setWasmSupported] = useState(null);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showModelLoader, setShowModelLoader] = useState(false);
  const [hasLoadedModel, setHasLoadedModel] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [showGuide, setShowGuide] = useState(true);
  const [expandedPanel, setExpandedPanel] = useState(null);

  const checkModelCache = async () => {
    try {
      const cache = await caches.open('sherpa-models');
      const cachedRequests = await cache.keys();
      
      // 获取模型列表
      const response = await fetch('/api/models/list');
      const data = await response.json();
      
      // 检查是否有完整的模型组被缓存
      for (const group of data) {
        const isGroupCached = await Promise.all(
          group.files.map(async (file) => {
            const cacheUrl = `${window.location.origin}/api/models/download?path=${encodeURIComponent(file.path)}`;
            const cacheMatch = await cache.match(cacheUrl);
            
            if (cacheMatch) {
              const cachedSize = parseInt(cacheMatch.headers.get('X-Original-Size'));
              return cachedSize === file.size;
            }
            return false;
          })
        );
        
        if (isGroupCached.every(Boolean)) {
          setHasLoadedModel(true);
          return;
        }
      }
      
      setHasLoadedModel(false);
    } catch (error) {
      console.error('Failed to check model cache:', error);
      setHasLoadedModel(false);
    }
  };

  useEffect(() => {
    checkWasm();
    getSystemInfo();
    checkModelCache();
  }, []);

  useEffect(() => {
    if (wasmSupported && hasLoadedModel) {
      setShowGuide(false);
    }
  }, [wasmSupported, hasLoadedModel]);

  const checkWasm = () => {
    const hasWasm = typeof WebAssembly === 'object' && 
                   typeof WebAssembly.instantiate === 'function';
    setWasmSupported(hasWasm);
  };

  const getSystemInfo = () => {
    const info = {
      cores: navigator.hardwareConcurrency,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
    setSystemInfo(info);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setExpandedPanel(expandedPanel === 'system' ? null : 'system')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
            ${expandedPanel === 'system' 
              ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-500' 
              : 'bg-gray-700 hover:bg-gray-600'
            }
            ${!wasmSupported && showGuide ? 'animate-pulse ring-2 ring-blue-500' : ''}
          `}
        >
          <CpuChipIcon className="w-4 h-4" />
          <span className="text-sm text-gray-200">
            {wasmSupported ? '✓' : '✗'}
          </span>
        </button>
        
        <button
          onClick={() => setExpandedPanel(expandedPanel === 'model' ? null : 'model')}
          className={`
            flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all
            ${expandedPanel === 'model' 
              ? 'bg-blue-600 hover:bg-blue-700 ring-2 ring-blue-500' 
              : 'bg-gray-700 hover:bg-gray-600'
            }
            ${wasmSupported && !hasLoadedModel && showGuide ? 'animate-pulse ring-2 ring-blue-500' : ''}
          `}
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span className="text-sm text-gray-200">
            {hasLoadedModel ? '✓' : '✗'}
          </span>
        </button>

        {/* Close Panel Button - 只在有展开面板时显示 */}
        {expandedPanel && (
          <button
            onClick={() => setExpandedPanel(null)}
            className={`
              ml-auto px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 
              rounded-lg transition-colors flex items-center gap-2
              ${showGuide ? 'animate-pulse ring-2 ring-blue-500' : ''}
            `}
          >
            <XMarkIcon className="w-4 h-4" />
            Close Panel
          </button>
        )}
      </div>

      {/* System Info Panel */}
      {expandedPanel === 'system' && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-200">
            <CpuChipIcon className="w-6 h-6 text-blue-500" />
            System Information
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            {/* WebAssembly Support */}
            <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-md">
              <span className="font-medium text-gray-200">WebAssembly Support</span>
              {wasmSupported !== null && (
                <div className="flex items-center gap-2">
                  {wasmSupported ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`hidden sm:inline ${wasmSupported ? 'text-green-400' : 'text-red-400'}`}>
                    {wasmSupported ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              )}
            </div>

            {/* CPU Cores */}
            {systemInfo && (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-md">
                <span className="font-medium text-gray-200">CPU Cores</span>
                <span className="text-gray-200">{systemInfo.cores}</span>
              </div>
            )}

            {/* Platform */}
            {systemInfo && (
              <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-700 rounded-md">
                <span className="font-medium text-gray-200">Platform</span>
                <span className="text-gray-200 text-sm truncate max-w-[200px]">
                  {systemInfo.platform}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Model Loader Panel */}
      {expandedPanel === 'model' && (
        <div className="bg-gray-800 rounded-lg shadow-lg">
          <ModelLoader onModelLoaded={() => setHasLoadedModel(true)} />
        </div>
      )}

      {/* Voice Interaction */}
      <VoiceInteraction 
        wasmSupported={wasmSupported}
        hasLoadedModel={hasLoadedModel}
        onModelClick={() => setExpandedPanel('model')}
      />
    </div>
  );
}
