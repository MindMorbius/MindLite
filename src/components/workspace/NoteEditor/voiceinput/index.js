import { useState, useEffect } from 'react';
import { AudioCard } from './AudioCard';
import { audioStorage } from '@/utils/audioStorage';
import { RecordingControl } from './RecordingControl';

export default function VoiceInput() {
  const [recordings, setRecordings] = useState(() => {
    const saved = localStorage.getItem('voiceRecordings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('voiceRecordings', JSON.stringify(recordings));
  }, [recordings]);

  const [selectedId, setSelectedId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState({
    duration: 0,
    waveformData: []
  });
  const [isPaused, setIsPaused] = useState(false);

  const handleCardSelect = (id) => {
    setSelectedId(selectedId === id ? null : id);
  };

  const handleDelete = (id) => {
    audioStorage.delete(id);
    setRecordings(prev => prev.filter(r => r.id !== id));
    setSelectedId(null);
  };

  const handleTranscriptionUpdate = (id, updates) => {
    setRecordings(prev => prev.map(recording => 
      recording.id === id 
        ? { ...recording, ...updates }
        : recording
    ));
  };

  const handleRecordingComplete = (id) => {
    setRecordings(prev => [{
      id,
      recorded: true
    }, ...prev]);
    setSelectedId(id);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6 p-6 pb-40 bg-gray-900/50 backdrop-blur min-h-screen">
        <div className="w-full max-w-5xl columns-1 sm:columns-2 gap-6 space-y-5 px-0">
          {recordings.map(recording => (
            <div key={recording.id} className="break-inside-avoid">
              <AudioCard 
                id={recording.id}
                selected={selectedId === recording.id}
                onSelect={() => handleCardSelect(recording.id)}
                onDelete={() => handleDelete(recording.id)}
                transcription={recording.transcription}
                error={recording.error}
                onTranscriptionUpdate={handleTranscriptionUpdate}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-20 left-0 right-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <RecordingControl
            onRecordingComplete={handleRecordingComplete}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
            recordingState={recordingState}
            setRecordingState={setRecordingState}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
          />
        </div>
      </div>
    </>
  );
}
