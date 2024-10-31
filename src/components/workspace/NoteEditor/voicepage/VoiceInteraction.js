import { useState, useEffect, useRef, useCallback } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import ModelSelector from './ModelSelector';

// 导入 sherpa-onnx
const sherpaOnnx = require('sherpa-onnx');

export default function VoiceInteraction({ wasmSupported, hasLoadedModel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [recognizerState, setRecognizerState] = useState({
    isInitialized: false,
    isProcessing: false,
    error: null
  });
  const [partialTranscript, setPartialTranscript] = useState('');
  const transcriptRef = useRef('');
  
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const startRecording = async () => {
    try {
      if (!window.isSecureContext) {
        throw new Error('Audio recording requires a secure context (HTTPS)');
      }

      if (!window.AudioContext && !window.webkitAudioContext) {
        throw new Error('Your browser does not support AudioContext');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio recording. Please use a modern browser or enable permissions.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      mediaStreamRef.current = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (e) => {
        const samples = e.inputBuffer.getChannelData(0);
        processAudio(samples);
      };

      setIsRecording(true);
      setError('');
    } catch (err) {
      console.error('Recording error:', err);
      let errorMessage = err.message;
      if (err.name === 'NotAllowedError') {
        errorMessage = '请允许麦克风访问权限';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '未找到麦克风设备';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '麦克风设备正被其他应用使用';
      }
      setError(errorMessage);
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  const stopRecording = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsRecording(false);
  };

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      return result.state === 'granted';
    } catch (err) {
      console.warn('Permission API not supported:', err);
      return null;
    }
  };

  useEffect(() => {
    checkMicrophonePermission().then(hasPermission => {
      if (hasPermission === false) {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      }
    });
  }, []);

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    if (recognizerRef.current) {
      recognizerRef.current.reset();
    }
    initializeRecognizer(model);
  };

  const initializeRecognizer = async (model) => {
    if (!model) return;
    
    try {
      setRecognizerState(prev => ({ ...prev, isProcessing: true, error: null }));
      const cache = await caches.open('sherpa-models');
      
      const modelFiles = {
        encoder: await (await cache.match(`/api/models/download?path=/models/${model}/encoder.onnx`)).arrayBuffer(),
        decoder: await (await cache.match(`/api/models/download?path=/models/${model}/decoder.onnx`)).arrayBuffer(),
        joiner: await (await cache.match(`/api/models/download?path=/models/${model}/joiner.onnx`)).arrayBuffer(),
        tokens: await (await cache.match(`/api/models/download?path=/models/${model}/tokens.txt`)).text()
      };

      // 使用 sherpa-onnx 的配置格式
      const config = {
        modelConfig: {
          transducer: {
            encoder: modelFiles.encoder,
            decoder: modelFiles.decoder,
            joiner: modelFiles.joiner,
          },
          tokens: modelFiles.tokens,
          numThreads: 1,
          provider: 'cpu',
          modelType: 'zipformer',
        },
        featConfig: {
          sampleRate: 16000,
          featureDim: 80,
        },
        decodingMethod: 'greedy_search',
        maxActivePaths: 4,
        enableEndpoint: true,
        rule1MinTrailingSilence: 2.4,
        rule2MinTrailingSilence: 1.2,
        rule3MinUtteranceLength: 20,
      };

      recognizerRef.current = sherpaOnnx.createOnlineRecognizer(config);
      streamRef.current = recognizerRef.current.createStream();
      
      setRecognizerState(prev => ({ 
        ...prev, 
        isInitialized: true, 
        isProcessing: false 
      }));
    } catch (error) {
      console.error('Failed to initialize recognizer:', error);
      setRecognizerState(prev => ({ 
        ...prev, 
        error: '初始化识别器失败', 
        isProcessing: false 
      }));
    }
  };

  // 更新音频处理逻辑
  const processAudio = useCallback((samples) => {
    if (!streamRef.current || !recognizerRef.current) return;

    try {
      // 直接使用 Float32Array
      streamRef.current.acceptWaveform(16000, samples);
      
      while (recognizerRef.current.isReady(streamRef.current)) {
        recognizerRef.current.decode(streamRef.current);
      }

      const result = recognizerRef.current.getResult(streamRef.current);
      if (result.text !== transcriptRef.current) {
        transcriptRef.current = result.text;
        setPartialTranscript(result.text);
      }

      if (recognizerRef.current.isEndpoint(streamRef.current)) {
        setTranscript(prev => prev + (prev ? '\n' : '') + result.text);
        recognizerRef.current.reset(streamRef.current);
        transcriptRef.current = '';
        setPartialTranscript('');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      setError('音频处理出错');
    }
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 space-y-4">
      <ModelSelector onModelSelect={handleModelSelect} />
      
      <div className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              recognizerState.isInitialized 
                ? 'bg-green-500' 
                : recognizerState.isProcessing 
                  ? 'bg-yellow-500 animate-pulse' 
                  : 'bg-red-500'
            }`} />
            <span className="text-sm text-gray-300">
              {recognizerState.isInitialized 
                ? '识别器就绪' 
                : recognizerState.isProcessing 
                  ? '初始化中...' 
                  : '未初始化'}
            </span>
          </div>
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!recognizerState.isInitialized}
            className={`
              p-2 rounded-full transition-colors
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600' 
                : recognizerState.isInitialized
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isRecording ? (
              <StopIcon className="w-5 h-5 text-white" />
            ) : (
              <MicrophoneIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm bg-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* Transcription Display */}
        <div className="space-y-2">
          {/* Partial Result */}
          {partialTranscript && (
            <div className="bg-gray-700/50 rounded-lg p-3">
              <p className="text-gray-300 italic">{partialTranscript}</p>
            </div>
          )}
          
          {/* Final Results */}
          {transcript && (
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              {transcript.split('\n').map((line, i) => (
                <p key={i} className="text-gray-200">{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 