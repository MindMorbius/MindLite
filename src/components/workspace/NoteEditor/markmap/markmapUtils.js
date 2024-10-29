// 颜色主题配置
export const getNodeColor = (depth, isDark) => {
    const colors = isDark ? {
      0: '#60a5fa', // 更亮的蓝色
      1: '#4ade80', // 更亮的绿色
      2: '#f472b6', // 更亮的粉色
      3: '#a78bfa', // 更亮的紫色
      4: '#fbbf24', // 更亮的黄色
    } : {
      0: '#3b82f6', // 主蓝色
      1: '#10b981', // 主绿色
      2: '#ec4899', // 主粉色
      3: '#8b5cf6', // 主紫色
      4: '#f59e0b', // 主黄色
    };
    return colors[depth % 5] || colors[0];
  };
  
  const getTextColor = (depth, isDark) => {
    const colors = isDark ? {
      0: '#e5e7eb', // 浅灰
      1: '#f3f4f6', // 更浅灰
      2: '#f9fafb'  // 最浅灰
    } : {
      0: '#374151', // 深灰
      1: '#4b5563', // 中灰
      2: '#6b7280'  // 浅灰
    };
    return colors[depth % 3] || colors[0];
  };
  
  // Markmap 配置选项
  export const getMarkmapOptions = (isDark) => ({
    autoFit: true,
    duration: 300,
    maxWidth: 800,
    color: (node) => getNodeColor(node.depth, isDark),
    paddingX: 40,          // 增加内边距
    paddingY: 20,          // 增加内边距
    nodeFont: 'system-ui, sans-serif',
    spacingHorizontal: 120, // 增加间距
    spacingVertical: 30,    // 增加间距
    initialExpandLevel: -1,
    zoom: true,
    pan: true,
    toggleRecursively: true,
    fitRatio: 0.9,         // 调整适配比例
    center: true,
    style: (node) => ({
      // 添加文本颜色控制
      text: {
        fill: isDark ? '#e5e7eb' : '#374151', // 浅灰色(dark) / 深灰色(light)
        stroke: 'none'
      },
      // 添加连接线样式
      line: {
        stroke: isDark ? '#4b5563' : '#9ca3af', // 深灰色(dark) / 中灰色(light)
        strokeWidth: '2px'
      }
    }),
    // 增加以下配置
    nodeMinHeight: 16,
    spacingVertical: 5,
    spacingHorizontal: 80,
  });
  
  // 节点控制函数
  export const collapseAll = (mm) => {
    const { state: { data } } = mm;
    const collapse = (node) => {
      node.fold = true;
      if (node.children) node.children.forEach(collapse);
    };
    collapse(data);
    mm.setData(data);
  };
  
  export const expandAll = (mm) => {
    const { state: { data } } = mm;
    const expand = (node) => {
      node.fold = false;
      if (node.children) node.children.forEach(expand);
    };
    expand(data);
    mm.setData(data);
  };
  
  export const expandToLevel = (mm, level) => {
    const { state: { data } } = mm;
    const expand = (node, currentLevel) => {
      node.fold = currentLevel >= level;
      if (node.children) {
        node.children.forEach(child => expand(child, currentLevel + 1));
      }
    };
    expand(data, 0);
    mm.setData(data);
  };
  
  // 工具栏配置
  export const setupToolbar = (toolbar) => {
    const toolbarEl = toolbar.toolbar;
    if (toolbarEl) {
      toolbarEl.classList.add(
        'absolute',
        'right-4',
        'top-4',
        'z-50',
        'bg-white/90',
        'dark:bg-gray-800/90',
        'backdrop-blur',
        'rounded-lg',
        'shadow-lg',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'p-2'
      );
      
      // 确保工具栏可见
      toolbarEl.style.display = 'flex';
      toolbarEl.style.gap = '0.5rem';
      
      // 添加到父容器
      const container = document.querySelector('.markmap');
      if (container) {
        container.appendChild(toolbarEl);
      }
    }
  };
