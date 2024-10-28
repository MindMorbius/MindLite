import Button from '@/components/ui/Button';

export default function EditorToolbar({ 
  isPreview, 
  setIsPreview, 
  showMarkmap, 
  setShowMarkmap,
  saveStatus 
}) {
  return (
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
        <Button
          onClick={() => setIsPreview(!isPreview)}
          variant={isPreview ? 'primary' : 'default'}
        >
          {isPreview ? '编辑' : '预览'}
        </Button>
        
        <Button
          onClick={() => setShowMarkmap(!showMarkmap)}
          variant={showMarkmap ? 'primary' : 'default'}
        >
          思维导图
        </Button>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {saveStatus === 'saving' && '保存中...'}
        {saveStatus === 'saved' && '已保存'}
        {saveStatus === 'error' && '保存失败'}
      </div>
    </div>
  );
}
