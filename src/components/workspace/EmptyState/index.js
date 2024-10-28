import { PlusIcon, FolderIcon, DocumentTextIcon, BoltIcon, ChartBarIcon, ListBulletIcon, ShieldCheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/lib/store';

const features = [
  {
    title: 'Markdown',
    description: '专业文档编辑',
    icon: DocumentTextIcon,
    items: ['语法高亮', '实时预览']
  },
  {
    title: '思维导图',
    description: '可视化笔记内容',
    icon: ChartBarIcon,
    items: ['实时转换', '多种布局']
  },
  {
    title: '双视图',
    description: '灵活切换文件视图',
    icon: ListBulletIcon,
    items: ['文件树', '列表视图']
  },
  {
    title: '语音转录',
    description: '语音转文字记录',
    icon: BoltIcon,
    items: ['实时转录', '多语言支持']
  },
  {
    title: 'AI 交互',
    description: 'LLM增强灵感',
    icon: DocumentTextIcon,
    items: ['内容解析', '智能总结']
  },
  {
    title: '更多功能',
    description: '敬请期待',
    icon: ArrowRightIcon,
    items: ['Oauth 登录', '多设备同步']
  }
];

function FeatureCard({ title, description, items, icon: Icon }) {
  return (
    <div className="group relative p-4 sm:p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
      <div className="flex items-start gap-2 sm:gap-4">
        <div className="shrink-0 p-2 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate mb-1 sm:mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">
            {description}
          </p>
          <ul className="space-y-1 sm:space-y-2">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400"
              >
                <span className="mr-2 w-1 h-1 rounded-full bg-blue-500/50" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function EmptyState() {
  const { addQuickNote, addNote } = useStore();
  
  const handleAddNote = () => {
    const now = new Date();
    addNote({
      id: now.getTime().toString(),
      title: '未命名笔记',
      content: '',
    });
  };
  
  return (
    <div className="min-h-full flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
            开始记录你的第一个笔记
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            MindLite - 让灵感链接现实
          </p>
        </div>

        {/* 创建按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <button
            onClick={addQuickNote}
            className="px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 flex items-center justify-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            创建速记
          </button>
          <button
            onClick={handleAddNote}
            className="px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 flex items-center justify-center border border-gray-200 dark:border-gray-600"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            创建笔记
          </button>
        </div>

        {/* 功能特性网格 */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </div>
  );
} 