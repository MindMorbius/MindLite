import { useCallback, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { Toolbar } from 'markmap-toolbar';
import 'markmap-toolbar/dist/style.css';
import { 
  getMarkmapOptions, 
  setupToolbar,
  expandAll
} from './markmapUtils';

// 创建一个全局的 transformer 实例
const transformer = new Transformer();

export default function MarkmapRenderer({ content, show }) {
  // 原来 Markmap.js 中的实现代码
  const markmapRef = useRef(null);
  const markmapInstanceRef = useRef(null);
  const toolbarRef = useRef(null);
  
  const renderMarkmap = useCallback(() => {
    if (!content || !markmapRef.current) return;
    
    try {
      let markdownContent = content;
      if (!content.trim().startsWith('#')) {
        markdownContent = `# ${content}`;
      }
      
      // 清理旧的 SVG
      const existingSvg = markmapRef.current.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }

      // 创建新的 SVG
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'markmap-svg markmap-custom'); // 确保有 markmap-custom 类
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // 设置一个更合适的初始 viewBox
      const containerWidth = markmapRef.current.clientWidth;
      const containerHeight = markmapRef.current.clientHeight;
      svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
      
      markmapRef.current.appendChild(svg);
      
      const { root, features } = transformer.transform(markdownContent);
      const isDark = document.documentElement.classList.contains('dark');
      
      // 创建新实例
      markmapInstanceRef.current = new Markmap(svg, getMarkmapOptions(isDark));
      markmapInstanceRef.current.setData(root, features);
      
      // 优化 viewBox 更新逻辑
      requestAnimationFrame(() => {
        if (markmapInstanceRef.current) {
          const { minX, minY, maxX, maxY } = markmapInstanceRef.current.state;
          const width = maxX - minX + 300;  // 增加右侧边距
          const height = maxY - minY + 100;  // 添加垂直边距
          
          // 根节点靠左放置，只在左侧留少量边距
          const leftPadding = 100;  // 左侧边距
          const viewBoxX = minX - leftPadding;
          const viewBoxY = minY - (height - (maxY - minY)) / 2;  // 垂直居中
          
          // 设置 viewBox
          svg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${width} ${height}`);
          markmapInstanceRef.current.fit();
          expandAll(markmapInstanceRef.current);
        }
      });

      // 工具栏
      if (!toolbarRef.current) {
        toolbarRef.current = new Toolbar();
        toolbarRef.current.attach(markmapInstanceRef.current);
        setupToolbar(toolbarRef.current);
      }
    } catch (error) {
      console.error('Markmap render error:', error);
    }
  }, [content]);

  // 清理函数
  const cleanup = useCallback(() => {
    if (toolbarRef.current) {
      // 移除工具栏
      const toolbarEl = toolbarRef.current.toolbar;
      if (toolbarEl && toolbarEl.parentNode) {
        toolbarEl.parentNode.removeChild(toolbarEl);
      }
      toolbarRef.current = null;
    }
    if (markmapInstanceRef.current) {
      markmapInstanceRef.current.destroy();
      markmapInstanceRef.current = null;
    }
  }, []);

  // 监听主题变化
  useEffect(() => {
    const observer = new MutationObserver(renderMarkmap);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, [renderMarkmap]);

  useEffect(() => {
    if (show) {
      renderMarkmap();
      
      // 确保工具栏在渲染后创建
      requestAnimationFrame(() => {
        if (markmapInstanceRef.current && !toolbarRef.current) {
          toolbarRef.current = new Toolbar();
          toolbarRef.current.attach(markmapInstanceRef.current);
          setupToolbar(toolbarRef.current);
        }
      });

      window.addEventListener('resize', renderMarkmap);
      return () => {
        window.removeEventListener('resize', renderMarkmap);
        cleanup();
      };
    }
  }, [show, renderMarkmap, cleanup]);

  if (!show) return null;

  return (
    <div className="relative">
      <div 
        ref={markmapRef} 
        className="markmap w-full min-h-[500px] h-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        style={{ 
          height: 'max(500px, min(80vh, 1000px))',
          position: 'relative',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}
