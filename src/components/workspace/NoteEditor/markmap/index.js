import dynamic from 'next/dynamic';
import 'markmap-toolbar/dist/style.css';

const MarkmapView = dynamic(() => import('./MarkmapRenderer'), {
  loading: () => <div className="w-full min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg" />,
  ssr: false
});

export default MarkmapView;