import { useCallback, useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { Transformer } from 'markmap-lib';

const transformer = new Transformer();

export default function MarkmapRenderer({ content, show }) {
  const markmapRef = useRef(null);
  const markmapInstanceRef = useRef(null);
  
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
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      markmapRef.current.appendChild(svg);
      
      const { root } = transformer.transform(markdownContent);
      markmapInstanceRef.current = new Markmap(svg);
      markmapInstanceRef.current.setData(root);
      markmapInstanceRef.current.fit();
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

  if (!show) return null;

  return (
    <div 
      ref={markmapRef} 
      className="w-full min-h-[500px]"
      style={{ height: 'max(500px, 80vh)' }}
    />
  );
}
