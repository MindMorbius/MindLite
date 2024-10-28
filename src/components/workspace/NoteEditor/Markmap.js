import dynamic from 'next/dynamic';

const MarkmapView = dynamic(() => import('./MarkmapRenderer'), {
  loading: () => (
    <div className="animate-pulse w-full min-h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
  ),
  ssr: false
});

export default MarkmapView;