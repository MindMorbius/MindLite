export default function MarkdownToolbar({ onInsert }) {
  const tools = [

    { label: '#', markdown: '# ', offset: 2 },
    { label: '-', markdown: '- ', offset: 2 },
    { label: '`', markdown: '`', offset: 1 },
    { label: '```', markdown: '```', offset: 4 },
    { label: '>', markdown: '> ', offset: 2 },
    { label: '[ ]', markdown: '- [ ] ', offset: 6 },
    { label: '[x]', markdown: '- [x] ', offset: 6 },
    { label: '链接', markdown: '[]()', offset: 1 },
    { label: '撤销', markdown: '', offset: 0, action: 'undo' },
    { label: '重做', markdown: '', offset: 0, action: 'redo' },
    { label: '换行', markdown: '\n', offset: 1 },
  ];

  const handleClick = (tool) => {
    if (tool.action === 'undo') {
      document.execCommand('undo');
    } else if (tool.action === 'redo') {
      document.execCommand('redo');
    } else {
      onInsert(tool.markdown, tool.offset);
    }
  };

  return (
    <div className="flex flex-wrap p-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 
      animate-in fade-in zoom-in duration-200 origin-bottom">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => handleClick(tool)}
          className="flex-1 min-w-[40px] px-1.5 py-0.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 rounded 
            transition-all duration-200 hover:scale-110 m-0.5"
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}