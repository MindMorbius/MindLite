import Button from '@/components/ui/Button';
import { EyeIcon, PencilIcon, MicrophoneIcon, StopIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline';

export default function EditorToolbar({ 
  isPreview, 
  setIsPreview, 
  showMarkmap, 
  setShowMarkmap,
  isTranscribing,
  setIsTranscribing,
  className
}) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 overflow-x-auto scrollbar-none rounded-lg ${className}`}>
      <Button
        onClick={() => {
          setIsPreview(!isPreview);
          if(isPreview) {
            setShowMarkmap(false);
          }
        }}
        variant={isPreview ? 'primary' : 'default'}
        className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200
          whitespace-nowrap min-w-[4rem] sm:min-w-[5rem] hover:scale-[1.02] active:scale-[0.98]
          hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5
          border border-gray-200 dark:border-gray-600"
      >
        {isPreview ? (
          <>
            <PencilIcon className="w-4 h-4" />
            <span>编辑</span>
          </>
        ) : (
          <>
            <EyeIcon className="w-4 h-4" />
            <span>预览</span>
          </>
        )}
      </Button>
      
      {isPreview && (
        <Button
          onClick={() => setShowMarkmap(!showMarkmap)}
          variant={showMarkmap ? 'primary' : 'default'} 
          className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200
            whitespace-nowrap min-w-[4rem] sm:min-w-[5rem] hover:scale-[1.02] active:scale-[0.98]
            hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5
            border border-gray-200 dark:border-gray-600"
        >
          {showMarkmap ? (
            <>
              <StopIcon className="w-4 h-4" />
              <span>关闭思维导图</span>
            </>
          ) : (
            <>
              <ChartBarSquareIcon className="w-4 h-4" />
              <span>思维导图</span>
            </>
          )}
        </Button>
      )}

      {!isPreview && (
        <Button
          onClick={() => setIsTranscribing(!isTranscribing)}
          variant={isTranscribing ? 'primary' : 'default'}
          className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200
            whitespace-nowrap min-w-[4rem] sm:min-w-[5rem] hover:scale-[1.02] active:scale-[0.98]
            hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1.5
            border border-gray-200 dark:border-gray-600"
        >
          {isTranscribing ? (
            <>
              <StopIcon className="w-4 h-4" />
              <span>停止录入</span>
            </>
          ) : (
            <>
              <MicrophoneIcon className="w-4 h-4" />
              <span>语音转录</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
