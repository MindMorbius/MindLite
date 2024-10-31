import { useState, useEffect } from 'react';
import { CheckCircleIcon, ArrowPathIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ModelLoader({ onModelLoaded }) {
  const [modelGroups, setModelGroups] = useState([]);
  const [modelStatus, setModelStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModelList();
  }, []);

  // 检查tokens是否已加载（基于模型文件夹名称）
  const isTokensLoaded = (filePath) => {
    if (filePath.includes('tokens')) {
      const modelFolder = filePath.split('/')[2];
      return Object.entries(modelStatus).some(([path, status]) => 
        path.includes('tokens') && 
        path.split('/')[2] === modelFolder && 
        status.loaded
      );
    }
    return modelStatus[filePath]?.loaded;
  };

  // 修改缓存检查函数，放宽限制
  const isCacheAvailable = () => {
    try {
      return 'caches' in window && 
             window.isSecureContext && 
             typeof caches.open === 'function';
    } catch (e) {
      console.warn('Cache check failed:', e);
      return false;
    }
  };

  const fetchModelList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const host = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;
      const baseUrl = `${protocol}//${host}${port ? ':' + port : ''}`;
      
      console.log('Current location:', {
        protocol,
        host,
        port,
        fullUrl: `${baseUrl}/api/models/list`
      });

      const response = await fetch(`${baseUrl}/api/models/list`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        credentials: 'same-origin'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      
      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format received');
      }
      
      setModelGroups(data);
      
      // 检查缓存态
      const validCacheStatus = { ...modelStatus };
      
      if (isCacheAvailable()) {
        try {
          const cache = await caches.open('sherpa-models');
          
          // 检查每个文件的缓存状态
          for (const group of data) {
            for (const file of group.files) {
              const cacheUrl = `/api/models/download?path=${encodeURIComponent(file.path)}`;
              const cacheMatch = await cache.match(cacheUrl);
              
              if (cacheMatch) {
                const cachedSize = parseInt(cacheMatch.headers.get('X-Original-Size'));
                if (cachedSize === file.size) {
                  validCacheStatus[file.path] = { loaded: true };
                } else {
                  await cache.delete(cacheUrl);
                  delete validCacheStatus[file.path];
                }
              } else {
                delete validCacheStatus[file.path];
              }
            }
          }
        } catch (cacheError) {
          console.warn('Cache API not available:', cacheError);
        }
      }
      
      setModelStatus(validCacheStatus);
      
      // 处理模型组数据
      const processedData = data.map(group => {
        const hasTokens = group.files.some(f => f.type === 'tokens');
        if (!hasTokens) {
          const baseModelPath = group.name.split('(')[0].trim();
          const tokensFile = data
            .find(g => g.name.startsWith(baseModelPath))
            ?.files.find(f => f.type === 'tokens');
          
          if (tokensFile) {
            return {
              ...group,
              files: [...group.files, tokensFile]
            };
          }
        }
        return group;
      });
      
      setModelGroups(processedData);
      await updateCacheSize();
    } catch (error) {
      console.error('Failed to fetch model list:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  const loadModel = async (path, onProgress) => {
    // 如果是tokens文件，检查同一模型文件夹下的 tokens 是否已加载
    if (path.includes('tokens')) {
      const modelFolder = path.split('/')[2];
      if (Object.entries(modelStatus).some(([p, s]) => 
          p.includes('tokens') && 
          p.split('/')[2] === modelFolder && 
          s.loaded)) {
        return true;
      }
    }

    try {
      const response = await fetch(`/api/models/download?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const reader = response.body.getReader();
      const contentLength = +response.headers.get('Content-Length');
      
      let receivedLength = 0;
      const chunks = [];
      
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        onProgress(receivedLength / contentLength);
      }

      // 创建新的 Response 对象，添加额外的头信息
      const blobData = new Blob(chunks);
      
      // 缓存响应
      if (isCacheAvailable()) {
        try {
          const cache = await caches.open('sherpa-models');
          const cacheResponse = new Response(blobData, {
            headers: {
              'Content-Type': 'application/octet-stream',
              'Content-Length': contentLength.toString(),
              'X-Original-Size': contentLength.toString(),
            }
          });
          
          await cache.put(
            `/api/models/download?path=${encodeURIComponent(path)}`, 
            cacheResponse
          );
        } catch (cacheError) {
          console.warn('Failed to cache model:', cacheError);
        }
      }
      
      // 如果是tokens文件，只更新同一模型文件夹下所有tokens的状态
      if (path.includes('tokens')) {
        const modelFolder = path.split('/')[2];
        modelGroups.forEach(group => {
          group.files.forEach(file => {
            if (file.path.includes('tokens') && 
                file.path.split('/')[2] === modelFolder) {
              setModelStatus(prev => ({
                ...prev,
                [file.path]: { loaded: true }
              }));
            }
          });
        });
      } else {
        setModelStatus(prev => ({
          ...prev,
          [path]: { loaded: true }
        }));
      }
      
      await updateCacheSize();
      return true;
    } catch (error) {
      console.error(`Failed to load model ${path}:`, error);
      return false;
    }
  };

  // 改进格式化文件大小显示
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  // 改进缓存大小检查
  const updateCacheSize = async () => {
    if (!isCacheAvailable()) {
      console.warn('Cache API not available');
      setCacheSize(0);
      return;
    }

    try {
      const cache = await caches.open('sherpa-models');
      if (!cache) {
        setCacheSize(0);
        return;
      }

      const keys = await cache.keys();
      let totalSize = 0;
      
      for (const request of keys) {
        try {
          const response = await cache.match(request);
          if (response?.headers) {
            const size = parseInt(response.headers.get('X-Original-Size') || '0');
            if (!isNaN(size)) {
              totalSize += size;
            }
          }
        } catch (e) {
          console.warn('Failed to get cache entry size:', e);
        }
      }
      
      setCacheSize(totalSize);
    } catch (error) {
      console.warn('Failed to update cache size:', error);
      setCacheSize(0);
    }
  };

  // 计算模型组的总大小
  const getGroupSize = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  // 检查模型组是否已完全加载
  const isGroupFullyLoaded = (files) => {
    return files.every(file => isTokensLoaded(file.path));
  };

  // 加载整个模型组
  const loadModelGroup = async (group) => {
    setSelectedGroup(group);
    let allSuccess = true;
    
    // 按顺序下载每个文件
    for (const file of group.files) {
      try {
        // 设置当前文件的加载状态
        setModelStatus(prev => ({
          ...prev,
          [file.path]: { loading: true, progress: 0 }
        }));
        
        const success = await loadModel(file.path, (progress) => {
          setModelStatus(prev => ({
            ...prev,
            [file.path]: { loading: true, progress }
          }));
        });

        if (!success) {
          allSuccess = false;
          break;
        }

        // 更新文件状态为已完成
        setModelStatus(prev => ({
          ...prev,
          [file.path]: { loaded: true, progress: 1 }
        }));

      } catch (error) {
        console.error(`Failed to load file ${file.path}:`, error);
        allSuccess = false;
        break;
      }
    }
    
    if (allSuccess) {
      onModelLoaded();
    }
    setSelectedGroup(null);
    return allSuccess;
  };

  // 改进清除缓存函数
  const clearCache = async () => {
    if (!isCacheAvailable()) {
      setError('Cache API not available');
      return;
    }
    
    try {
      const cache = await caches.open('sherpa-models');
      if (!cache) {
        setError('Failed to open cache');
        return;
      }

      const keys = await cache.keys();
      let failedCount = 0;
      
      for (const key of keys) {
        try {
          await cache.delete(key);
        } catch (e) {
          console.warn('Failed to delete cache entry:', e);
          failedCount++;
        }
      }
      
      setModelStatus({});
      await updateCacheSize();
      await fetchModelList();

      if (failedCount > 0) {
        setError(`Failed to clear ${failedCount} cache entries`);
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
      setError('Failed to clear cache');
    }
  };

  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isCacheAvailable() && (
            <>
              <div className="text-sm text-gray-300">
                Cache: {formatFileSize(cacheSize)}
              </div>
              {cacheSize > 0 && (
                <button
                  onClick={clearCache}
                  className="p-1.5 rounded-full hover:bg-red-600/20 transition-colors text-red-400 active:bg-red-600/40"
                  title="Clear cache"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
        <button
          onClick={fetchModelList}
          className="p-1.5 rounded-full hover:bg-gray-600 transition-colors active:bg-gray-500"
          disabled={loading}
        >
          <ArrowPathIcon className={`w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        {modelGroups.map(group => {
          const isLoaded = isGroupFullyLoaded(group.files);
          
          return (
            <div 
              key={group.name} 
              className={`
                bg-gray-700/50 rounded-lg p-2 sm:p-3 transition-colors
                ${isLoaded ? 'ring-2 ring-green-500/50' : ''}
              `}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className={`
                  text-sm font-medium
                  ${isLoaded ? 'text-green-400' : 'text-gray-200'}
                `}>
                  {group.name}
                </h3>
                <span className="text-xs text-gray-400">
                  {formatFileSize(getGroupSize(group.files))}
                </span>
              </div>
              
              {/* 文件列表 */}
              <div className="space-y-2 mb-3">
                {group.files.map(file => {
                  const fileStatus = modelStatus[file.path];
                  const isFileLoaded = fileStatus?.loaded;
                  
                  return (
                    <div 
                      key={file.path} 
                      className={`
                        bg-gray-700 rounded-lg p-2
                        ${isFileLoaded ? 'ring-1 ring-green-500/30' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`
                          font-medium
                          ${isFileLoaded ? 'text-green-400' : 'text-gray-200'}
                        `}>
                          {file.type}
                        </span>
                        <span className="text-gray-400">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                      {fileStatus?.loading && (
                        <div className="w-full bg-gray-600 rounded-full h-1 mt-1.5">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{width: `${fileStatus.progress * 100}%`}}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 下载按钮 */}
              <div className="flex justify-end">
                {isLoaded ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                ) : selectedGroup?.name === group.name ? (
                  <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <button
                    onClick={() => loadModelGroup(group)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={selectedGroup !== null}
                  >
                    Download All
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 