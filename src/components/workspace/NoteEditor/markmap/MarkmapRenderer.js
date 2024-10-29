import { useCallback, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';
import { Toolbar } from 'markmap-toolbar';

const transformer = new Transformer();

// 添加样式到组件顶部
const toolbarStyles = {
  '.mm-toolbar .mm-toolbar-brand': {
    display: 'none'
  }
};

export default function MarkmapRenderer({ content, show }) {
  const markmapRef = useRef(null);
  const markmapInstanceRef = useRef(null);
  const containerRef = useRef(null);
  
  const renderMarkmap = useCallback(() => {
    if (!content || !markmapRef.current) return;
    
    try {
      let markdownContent = content;
      if (!content.trim().startsWith('#')) {
        markdownContent = `# ${content}`;
      }
      
      const existingSvg = markmapRef.current.querySelector('svg');
      if (existingSvg) {
        existingSvg.remove();
      }

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const containerWidth = markmapRef.current.clientWidth || 800;
      const containerHeight = markmapRef.current.clientHeight || 600;
      
      svg.setAttribute('width', containerWidth);
      svg.setAttribute('height', containerHeight);
      svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
      markmapRef.current.appendChild(svg);
      
      const { root } = transformer.transform(markdownContent);
      markmapInstanceRef.current = new Markmap(svg);
      markmapInstanceRef.current.setData(root);
      markmapInstanceRef.current.fit();
      
      const toolbar = Toolbar.create(markmapInstanceRef.current);
      toolbar.el.style.position = 'absolute';
      toolbar.el.style.top = '0.5rem';
      toolbar.el.style.right = '0.5rem';
      containerRef.current.appendChild(toolbar.el);
    } catch (error) {
      console.error('Markmap render error:', error);
    }
  }, [content]);

  useEffect(() => {
    if (show) {
      renderMarkmap();
      window.addEventListener('resize', renderMarkmap);
      return () => {
        window.removeEventListener('resize', renderMarkmap);
        if (markmapInstanceRef.current) {
          markmapInstanceRef.current.destroy();
        }
      };
    }
  }, [show, renderMarkmap]);

  useEffect(() => {
    // 添加自定义样式
    const styleSheet = document.createElement('style');
    styleSheet.textContent = Object.entries(toolbarStyles)
      .map(([selector, rules]) => 
        `${selector} { ${Object.entries(rules)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ')} }`
      ).join('\n');
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!show) return null;

  return (
    <div ref={containerRef} className="relative">
      <div 
        ref={markmapRef} 
        className="w-full min-h-[500px]"
        style={{ height: 'max(500px, 80vh)' }}
      />
    </div>
  );
}
