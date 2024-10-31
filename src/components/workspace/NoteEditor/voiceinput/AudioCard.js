import { useState } from 'react';
import { audioStorage } from '@/utils/audioStorage';
import { formatDate, formatDuration, formatFileSize } from '@/utils/format';

export const AudioCard = ({ 
  id, 
  selected, 
  onSelect, 
  onDelete,
  transcription: initialTranscription,
  error: initialError,
  onTranscriptionUpdate
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState(initialTranscription);
  const [error, setError] = useState(initialError);
  const audio = audioStorage.get(id);

  const handleTranscribe = async (e) => {
    e.stopPropagation();
    setIsTranscribing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', audio.blob, 'audio.wav');
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        const errorMsg = `[${response.status}] ${result.error}`;
        setError(errorMsg);
        onTranscriptionUpdate(id, { error: errorMsg });
        return;
      }
      
      if (!result.text?.trim()) {
        const errorMsg = '未检测到有效语音,建议不要再次尝试转录';
        setError(errorMsg);
        onTranscriptionUpdate(id, { error: errorMsg });
        return;
      }
      
      setTranscription(result.text);
      onTranscriptionUpdate(id, { transcription: result.text, error: null });
    } catch (err) {
      const errorMsg = `请求失败: ${err.message}`;
      setError(errorMsg);
      onTranscriptionUpdate(id, { error: errorMsg });
    } finally {
      setIsTranscribing(false);
    }
  };

  const renderContent = () => {
    if (transcription || initialTranscription) {
      return (
        <div className="text-gray-300 text-sm break-words whitespace-pre-wrap">
          {transcription || initialTranscription}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-4">
        {error || initialError ? (
          <div className="space-y-1 text-center">
            <div className="text-red-400 text-sm">{error || initialError}</div>
            <button
              onClick={handleTranscribe}
              className="px-2 py-0.5 text-xs bg-red-500/20 hover:bg-red-500/30 
                text-red-400 rounded-full transition-colors"
            >
              重试转录
            </button>
          </div>
        ) : audio ? (
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-500/20 
              hover:bg-emerald-500/30 text-emerald-400 rounded-full 
              transition-colors disabled:opacity-50"
          >
            {isTranscribing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                转录中...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                语音转录
              </>
            )}
          </button>
        ) : null}
      </div>
    );
  };

  return (
    <div 
      className={`w-full p-3 rounded-lg bg-gray-800 shadow-lg cursor-pointer
        ${selected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-gray-600'}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <span>{formatDate(audio?.metadata?.createdAt || id)}</span>
            {audio && (
              <>
                <span>·</span>
                <span>{formatFileSize(audio.blob.size)}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-400 rounded-lg
            hover:bg-red-400/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
        </button>
      </div>

      <div className="mt-2">
        {renderContent()}
      </div>

      {audio?.url && (
        <div onClick={e => e.stopPropagation()} className="mt-2">
          <audio 
            src={audio.url} 
            controls 
            className="w-full h-7"
            controlsList="nodownload"
          />
        </div>
      )}
    </div>
  );
}; 