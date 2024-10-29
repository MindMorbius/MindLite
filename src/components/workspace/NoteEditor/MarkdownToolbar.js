export default function MarkdownToolbar({ onInsert }) {
  const tools = [
    { label: 'B', markdown: '**粗体**', offset: 2 },
    { label: 'I', markdown: '*斜体*', offset: 1 },
    { label: 'H1', markdown: '# 标题', offset: 2 },
    { label: 'H2', markdown: '## 子标题', offset: 3 },
    { label: '`', markdown: '`代码`', offset: 1 },
    { label: '```', markdown: '```\n代码块\n```', offset: 4 },
    { label: '[]', markdown: '[链接](url)', offset: 1 },
    { label: '- [ ]', markdown: '- [ ] 任务', offset: 6 }
  ];

  return (
    <div className="flex gap-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={() => onInsert(tool.markdown, tool.offset)}
          className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
} 