import { useRef, useEffect, useCallback, useState } from 'react';
import RecordRTC from 'recordrtc';
import { audioStorage } from '@/utils/audioStorage';
import { formatDuration, formatFileSize } from '@/utils/format';
import WaveSurfer from 'wavesurfer.js';
import { useWaveformCanvas } from '@/hooks/useWaveformCanvas';

const calculateEstimatedSize = (duration) => {
  // OPUS 格式的估算
  const bitRate = 24000;  // 24 kbps (OPUS默认比特率)
  const bytes = (bitRate * duration) / 8;  // 比特率 * 时长(秒) / 8 = 字节数
  const kb = bytes / 1024;
  return `~${kb.toFixed(1)}KB`;
};

// 新增函数用于获取存储信息
const getStorageInfo = async () => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const { usage, quota } = await navigator.storage.estimate();
      return {
        used: usage,
        total: quota,
        free: quota - usage,
        supported: true
      };
    }
    return {
      supported: false,
      message: '当前浏览器不支持存储空间检测'
    };
  } catch (err) {
    return {
      supported: false,
      message: '获取存储信息失败'
    };
  }
};

export const RecordingControl = ({
  onRecordingComplete,
  isRecording,
  setIsRecording,
  recordingState,
  setRecordingState,
  isPaused,
  setIsPaused
}) => {
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const canvasRef = useWaveformCanvas(recordingState.waveformData);
  const [storageInfo, setStorageInfo] = useState(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 48000,     // OPUS推荐采样率
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // 设置音频分析器
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      streamRef.current = stream;
      
      const recorder = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/webm;codecs=opus',
        numberOfAudioChannels: 1,
        desiredSampRate: 48000,
        audioBitsPerSecond: 24000, // OPUS推荐比特率
        recorderType: RecordRTC.MediaStreamRecorder,
        timeSlice: 100,
      });
      
      recorderRef.current = recorder;
      recorder.startRecording();
      setIsRecording(true);
      
      let duration = 0;
      timerRef.current = setInterval(() => {
        duration += 0.1;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        const audioData = Array.from(dataArrayRef.current)
          .slice(0, 32)
          .map(value => Math.max(1, value * 1.5));
        
        setRecordingState(prev => ({
          ...prev,
          duration,
          currentTime: duration,
          waveformData: audioData
        }));
      }, 100);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    
    recorderRef.current.stopRecording(async () => {
      const blob = await recorderRef.current.getBlob();
      const id = Date.now();
      
      await audioStorage.store(id, blob, {
        createdAt: id,
        duration: recordingState.duration
      });
      
      onRecordingComplete(id);
      
      streamRef.current.getTracks().forEach(track => track.stop());
      clearInterval(timerRef.current);
      recorderRef.current = null;
      streamRef.current = null;
      timerRef.current = null;
      
      setIsRecording(false);
      setRecordingState({
        duration: 0,
        isPaused: false,
        currentTime: 0,
        waveformData: []
      });
    });
  }, [onRecordingComplete, recordingState.duration]);

  const pauseRecording = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.pauseRecording();
    clearInterval(timerRef.current);
    setIsPaused(true);
  }, [setIsPaused]);

  const resumeRecording = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.resumeRecording();
    
    timerRef.current = setInterval(() => {
      setRecordingState(prev => ({
        ...prev,
        duration: prev.duration + 0.1,
        currentTime: prev.duration + 0.1
      }));
    }, 100);
    
    setIsPaused(false);
  }, [setIsPaused]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 添加存储信息获取
  useEffect(() => {
    const updateStorageInfo = async () => {
      const info = await getStorageInfo();
      setStorageInfo(info);
    };
    updateStorageInfo();
    
    // 每30秒更新一次存储信息
    const interval = setInterval(updateStorageInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  // 添加保存录音的函数
  const saveRecording = useCallback(async () => {
    if (!recorderRef.current) return;
    
    return new Promise((resolve) => {
      recorderRef.current.stopRecording(async () => {
        const blob = await recorderRef.current.getBlob();
        const id = Date.now();
        
        await audioStorage.store(id, blob, {
          createdAt: id,
          duration: recordingState.duration,
          isAutoSaved: true
        });
        
        streamRef.current?.getTracks().forEach(track => track.stop());
        clearInterval(timerRef.current);
        onRecordingComplete(id);
        resolve(id);
      });
    });
  }, [recordingState.duration, onRecordingComplete]);

  // 添加页面关闭/隐藏处理
  useEffect(() => {
    if (!isRecording) return;

    const handleBeforeUnload = async (e) => {
      if (isRecording) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        await saveRecording();
      }
    };

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && isRecording) {
        await saveRecording();
        setIsRecording(false);
        setRecordingState({
          duration: 0,
          isPaused: false,
          currentTime: 0,
          waveformData: []
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRecording, saveRecording]);

  return (
    <div className="flex flex-col gap-2">
      {/* 存储信息显示 */}
      {storageInfo && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-950/30">
          <span className="text-xs text-gray-400">
            {storageInfo.supported ? 
              `已用: ${formatFileSize(storageInfo.used)} / 总计: ${formatFileSize(storageInfo.total)} / 剩余: ${formatFileSize(storageInfo.free)}` :
              storageInfo.message
            }
          </span>
        </div>
      )}
      
      {/* 原有的控制界面 */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-gray-700/30 shadow-lg">
        {/* 上排：状态和时间 */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* 状态指示器 */}
          <div className="flex items-center gap-2 w-24 px-3 py-1.5 rounded-lg bg-gray-950/30">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}/>
            <span className="text-xs text-gray-400 truncate">
              {isRecording ? (isPaused ? '已暂停' : '录制中') : '就绪'}
            </span>
          </div>

          {/* 时间显示 */}
          <div className="w-24 px-3 py-1.5 rounded-lg bg-gray-950/30 text-center">
            <span className="font-mono text-sm font-medium tabular-nums tracking-wider text-indigo-400">
              {formatDuration(recordingState.duration)}
            </span>
          </div>

          {/* 文件大小 */}
          <div className="w-24 px-3 py-1.5 rounded-lg bg-gray-950/30 text-center">
            <span className="text-xs text-gray-400">
              {calculateEstimatedSize(recordingState.duration)}
            </span>
          </div>
        </div>
        
        {/* 下排：波形和控制按钮 */}
        <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
          {/* 波形显示 */}
          <div className="h-[2.625rem] flex-1 min-w-[100px] rounded-lg overflow-hidden bg-gray-950/30">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </div>

          {/* 控制按钮组 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isRecording ? (
              <>
                <button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-all active:scale-95"
                >
                  {isPaused ? 
                    <svg className="w-4 h-4 text-indigo-400 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg> : 
                    <svg className="w-4 h-4 text-indigo-400 fill-current" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  }
                </button>
                <button
                  onClick={stopRecording}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4 text-red-400 fill-current" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={startRecording}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all active:scale-95"
              >
                <div className="w-3 h-3 rounded-full bg-red-500"/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 