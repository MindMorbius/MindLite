'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* 改为统一的网格布局，移动端也保持两列 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <WeatherWidget />
          <QuoteWidget />
          <GithubTrends />
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 MindMorbius. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// 修改 CardWrapper 组件，确保内容填充
const CardWrapper = ({ children }) => (
  <div className="h-full p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex flex-col">
    {children}
  </div>
);

function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  
  useEffect(() => {
    fetch('https://uapis.cn/api/weather?name=北京市')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setWeather(data);
        }
      });
  }, []);

  return (
    <CardWrapper>
      <h3 className="text-sm sm:text-lg font-bold mb-2">北京天气</h3>
      {weather && (
        <div className="flex-1 flex flex-col justify-center space-y-1 sm:space-y-2">
          <p className="text-xl sm:text-2xl">{weather.temperature}°C</p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{weather.weather}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {weather.wind_direction}风 {weather.wind_power}级 湿度{weather.humidity}
          </p>
        </div>
      )}
    </CardWrapper>
  );
}

function QuoteWidget() {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    fetch('https://uapis.cn/api/say')
      .then(res => res.text())
      .then(data => setQuote(data));
  }, []);

  return (
    <CardWrapper>
      <h3 className="text-sm sm:text-lg font-bold mb-2">今日格言</h3>
      {quote && (
        <div className="flex-1 flex items-center">
          <p className="text-xs sm:text-base italic text-gray-600 dark:text-gray-300">{quote}</p>
        </div>
      )}
    </CardWrapper>
  );
}

function GithubTrends() {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    fetch('https://api.github.com/users/MindMorbius/events?per_page=15')
      .then(res => {
        if (!res.ok) throw new Error('GitHub API 请求失败');
        return res.json();
      })
      .then(data => {
        // 按仓库分组
        const groupedByRepo = data.reduce((acc, curr) => {
          const repoKey = curr.repo.name;
          if (!acc[repoKey]) acc[repoKey] = [];
          acc[repoKey].push(curr);
          return acc;
        }, {});

        // 合并同一仓库的活动
        const mergedActivities = Object.entries(groupedByRepo).map(([repoName, events]) => {
          const latest = events[0];
          if (events.length === 1) return latest;

          // 合并同一仓库的多个活动
          const totalCommits = events.reduce((sum, e) => 
            sum + (e.type === 'PushEvent' ? (e.payload.commits?.length || 0) : 0), 0);
          
          const activityTypes = [...new Set(events.map(e => e.type))];
          
          return {
            ...latest,
            type: activityTypes.length === 1 ? activityTypes[0] : 'MultipleEvents',
            payload: {
              ...latest.payload,
              totalCommits,
              activityCount: events.length,
              activityTypes
            }
          };
        });

        setActivities(mergedActivities
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3));
      })
      .catch(error => {
        console.error('获取 GitHub 动态失败:', error);
        setActivities([]);
      });
  }, []);

  const getEventText = (event) => {
    const repoName = event.repo.name.split('/')[1];
    
    if (event.type === 'MultipleEvents') {
      const {activityCount, totalCommits, activityTypes} = event.payload;
      const activities = [];
      if (totalCommits > 0) activities.push(`${totalCommits} 次提交`);
      if (activityTypes.includes('WatchEvent')) activities.push('标星');
      if (activityTypes.includes('ForkEvent')) activities.push('Fork');
      return `📎 ${repoName}: ${activities.join('、')}`;
    }

    switch (event.type) {
      case 'PushEvent':
        return `📦 ${repoName}: ${event.payload.commits?.length || 0} 次提交`;
      case 'WatchEvent':
        return `⭐ 标星了 ${repoName}`;
      case 'ForkEvent':
        return `🍴 Fork了 ${repoName}`;
      case 'CreateEvent':
        return `🌱 新建${event.payload.ref_type === 'branch' ? '分支' : '标签'} ${event.payload.ref} (${event.repo.name.split('/')[1]})`;
      case 'IssuesEvent': {
        const title = event.payload.issue?.title;
        const action = event.payload.action;
        const repoName = event.repo.name.split('/')[1];
        const actionEmoji = action === 'opened' ? '📝' : action === 'closed' ? '✅' : '🔄';
        return `${actionEmoji} 在 ${repoName} 仓库${action === 'opened' ? '创建' : action === 'closed' ? '关闭' : '更新'}了 Issue: 【${title}】`;
      }
      case 'PullRequestEvent': {
        const title = event.payload.pull_request?.title;
        const action = event.payload.action;
        const repoName = event.repo.name.split('/')[1];
        const actionEmoji = action === 'opened' ? '📝' : action === 'closed' ? '✅' : '🔄';
        return `${actionEmoji} 在 ${repoName} 仓库${action === 'opened' ? '提交' : action === 'closed' ? '合并' : '更新'}了 PR: ${title}`;
      }
      default:
        return `✨ ${event.repo.name.split('/')[1]}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <CardWrapper>
      <h3 className="text-sm sm:text-lg font-bold mb-2">最近活动</h3>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
        <ul className="space-y-2">
          {activities.map(activity => (
            <li key={activity.id}>
              <a
                href={`https://github.com/${activity.repo.name}`}
                className="group flex items-start space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* 修改为 block 显示，避免文字截断 */}
                <div className="flex-1 min-w-0">
                  <span className="block text-xs sm:text-base truncate">
                    {getEventText(activity)}
                  </span>
                </div>
                <span className="flex-shrink-0 text-xs sm:text-sm text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300">
                  {formatDate(activity.created_at)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </CardWrapper>
  );
}
