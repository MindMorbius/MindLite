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
          className="rounded-none border-0 h-9 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[80px]"
        >
          <PencilIcon className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">编辑</span>
        </Button>
        <Button
          onClick={() => setLayoutMode('split')}
          variant={layoutMode === 'split' ? 'primary' : 'default'}
          className="rounded-none border-0 border-x border-gray-200 dark:border-gray-600 h-9 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[80px]"
        >
          <ViewColumnsIcon className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">分栏</span>
        </Button>
        <Button
          onClick={() => setLayoutMode('preview')}
          variant={layoutMode === 'preview' ? 'primary' : 'default'}
          className="rounded-none border-0 h-9 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[80px]"
        >
          <EyeIcon className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">预览</span>
        </Button>
        <Button
          onClick={() => setLayoutMode('voice')}
          variant={layoutMode === 'voice' ? 'primary' : 'default'}
          className="rounded-none border-0 border-l border-gray-200 dark:border-gray-600 h-9 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[80px]"
        >
          <MicrophoneIcon className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">语音</span>
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setShowMarkmap(!showMarkmap)}
          variant={showMarkmap ? 'primary' : 'default'}
          className="h-9 px-3 flex items-center justify-center min-w-[40px] sm:min-w-[80px]"
        >
          <ChartBarSquareIcon className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">导图</span>
        </Button>
      </div>
    </div>
  );
}
