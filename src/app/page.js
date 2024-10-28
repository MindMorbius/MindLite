import Image from "next/image";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Hero Section - 调整上边距避免被导航栏遮挡 */}
          <div className="text-center pt-16 sm:pt-20 pb-6 sm:pb-8"> {/* 调整间距 */}
            <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">
              MindLite
              <span className="text-gray-600 dark:text-gray-400 text-xl sm:text-2xl block mt-1 sm:mt-2">
                让灵感链接现实
              </span>
            </h1>
          </div>

          {/* Features Grid - 移动端使用两列布局 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
            <FeatureCard
              title="智能任务管理"
              description="动态范围任务管理，自动拆解复杂任务，智能推荐替代方案"
              icon="📋"
            />
            <FeatureCard
              title="灵感即任务"
              description="支持 Markdown，语音实时转写，灵感自动转化为可执行任务"
              icon="💡"
            />
            <FeatureCard
              title="思维界面"
              description="自由布局，极简设计，多种视图激活创意"
              icon="🎯"
            />
          </div>

          {/* CTA Button */}
          <div className="text-center pb-8">
            <Link href="/workspace">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 sm:py-3 sm:px-8 rounded-full transition-colors">
                开始使用
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="p-3 sm:p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">{icon}</div>
      <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{title}</h3>
      <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
