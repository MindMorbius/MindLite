import { useEffect, useState, useRef } from 'react';
import MarkmapView from './markmap';
import EditorInput from './EditorInput';
import EditorPreview from './EditorPreview';
import MarkdownToolbar from './MarkdownToolbar';

export default function EditorContent({
  layoutMode,
  showMarkmap,
  localTitle,
  localContent,
  setLocalTitle,
  setLocalContent,
  handleTitleChange,
  handleContentChange,
  textareaRef
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInsertMarkdown = (markdown, offset) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = localContent.substring(0, start) + 
      markdown + 
      localContent.substring(end);
    
    setLocalContent(newContent);
    handleContentChange({ target: { value: newContent } });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + offset, start + offset);
    }, 0);
  };

  const renderEditor = () => (
    <div className="h-full flex flex-col">
      <div className="flex-none mb-2">
        <MarkdownToolbar onInsert={handleInsertMarkdown} />
      </div>
      <div className="flex-1">
        <EditorInput
          localTitle={localTitle}
          setLocalTitle={setLocalTitle}
          localContent={localContent}
          setLocalContent={setLocalContent}
          handleTitleChange={handleTitleChange}
          handleContentChange={handleContentChange}
          showTitle={true}
          textareaRef={textareaRef}
        />
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="h-full overflow-hidden">
      <EditorPreview
        localTitle={localTitle}
        localContent={localContent}
        showTitle={!isMobile || layoutMode !== 'split'}
      />
    </div>
  );

  if (showMarkmap) {
    return <MarkmapView content={localContent} show={showMarkmap} />;
  }

  if (layoutMode === 'split') {
    return (
      <div className={`flex flex-col md:flex-row h-[calc(100vh-16rem)]`}>
        <div className="h-[60vh] md:h-full">
          {renderEditor()}
        </div>

        {/* 分隔线 */}
        <div className="relative">
          <div className="md:hidden h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg" />
          <div className="hidden md:block w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 shadow-lg absolute top-0 -left-0.5" />
        </div>

        <div className="h-[40vh] md:h-full md:w-1/2 overflow-hidden md:pl-2">
          {renderPreview()}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-16rem)]">
      {layoutMode === 'preview' ? renderPreview() : renderEditor()}
    </div>
  );
} 