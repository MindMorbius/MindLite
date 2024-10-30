import Button from '@/components/ui/Button';
import { PencilIcon, MicrophoneIcon, StopIcon, ChartBarSquareIcon, ViewColumnsIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function EditorToolbar({ 
  layoutMode,
  setLayoutMode,
  showMarkmap, 
  setShowMarkmap,
  isTranscribing,
  setIsTranscribing,
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
        <Button
          onClick={() => setLayoutMode('edit')}
          variant={layoutMode === 'edit' ? 'primary' : 'default'}
          className="rounded-none border-0 h-8 sm:h-9"
        >
          <div className='flex items-center'>
            <PencilIcon className='w-4 h-4' />
            <span className='hidden sm:inline ml-1.5'>编辑</span>
          </div>
        </Button>
        <Button
          onClick={() => setLayoutMode('split')}
          variant={layoutMode === 'split' ? 'primary' : 'default'}
          className="rounded-none border-0 border-x border-gray-200 dark:border-gray-600 h-8 sm:h-9"
        >
          <div className='flex items-center'>
            <ViewColumnsIcon className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">分栏</span>
          </div>
        </Button>
        <Button
          onClick={() => setLayoutMode('preview')}
          variant={layoutMode === 'preview' ? 'primary' : 'default'}
          className="rounded-none border-0 h-8 sm:h-9"
        >
          <div className='flex items-center'>
            <EyeIcon className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">预览</span>
          </div>
        </Button>
      </div>

      <div className="flex gap-2">
        {layoutMode !== 'preview' && (
          <Button
            onClick={() => setIsTranscribing(!isTranscribing)}
            variant={isTranscribing ? 'primary' : 'default'}
            className="h-8 sm:h-9"
          >
            <div className='flex items-center'>
              {isTranscribing ? <StopIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
              <span className="hidden sm:inline ml-1.5">{isTranscribing ? '停止' : '语音'}</span>
            </div>
          </Button>
        )}
        
        <Button
          onClick={() => setShowMarkmap(!showMarkmap)}
          variant={showMarkmap ? 'primary' : 'default'}
          className="h-8 sm:h-9"
        >
          <div className='flex items-center'>
            <ChartBarSquareIcon className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">导图</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
