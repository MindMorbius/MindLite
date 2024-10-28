import Button from '@/components/ui/Button';

export default function EditorToolbar({ 
  isPreview, 
  setIsPreview, 
  showMarkmap, 
  setShowMarkmap,
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
          whitespace-nowrap min-w-[4rem] sm:min-w-[5rem] hover:scale-[1.02] active:scale-[0.98]"
      >
        {isPreview ? '编辑' : '预览'}
      </Button>
      
      {isPreview && (
        <Button
          onClick={() => setShowMarkmap(!showMarkmap)}
          variant={showMarkmap ? 'primary' : 'default'} 
          className="h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-all duration-200
            whitespace-nowrap min-w-[4rem] sm:min-w-[5rem] hover:scale-[1.02] active:scale-[0.98]"
        >
          思维导图
        </Button>
      )}
    </div>
  );
}
