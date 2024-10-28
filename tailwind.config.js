/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'inherit',
            lineHeight: '1.8',
            p: {
              marginTop: '1em',
              marginBottom: '1em',
            },
            // 标题样式
            h1: {
              color: 'inherit',
              fontWeight: '600',
              fontSize: '1.875em',
              marginTop: '1.4em',
              marginBottom: '0.6em',
              lineHeight: '1.3',
              borderBottom: '1px solid var(--tw-prose-hr)',
              paddingBottom: '0.3em',
            },
            h2: {
              color: 'inherit',
              fontWeight: '600',
              fontSize: '1.5em',
              marginTop: '1.4em',
              marginBottom: '0.6em',
              lineHeight: '1.35',
              borderBottom: '1px solid var(--tw-prose-hr)',
              paddingBottom: '0.3em',
            },
            h3: {
              color: 'inherit',
              fontWeight: '600',
              fontSize: '1.25em',
              marginTop: '1.4em',
              marginBottom: '0.6em',
              lineHeight: '1.4',
            },
            // 链接样式
            a: {
              color: '#3b82f6',
              textDecoration: 'none',
              '&:hover': {
                color: '#2563eb',
                textDecoration: 'underline',
              },
            },
            // 代码块样式
            pre: {
              backgroundColor: '#1e293b',
              color: '#e2e8f0',
              borderRadius: '0.5rem',
              padding: '1em',
              marginTop: '1em',
              marginBottom: '1em',
              overflow: 'auto',
            },
            // 行内代码样式
            code: {
              color: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
              fontSize: '0.875em',
              fontWeight: '400',
              border: 'none',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            // 引用块样式
            blockquote: {
              fontWeight: '400',
              fontStyle: 'normal',
              borderLeftWidth: '4px',
              borderLeftColor: '#3b82f6',
              quotes: 'none',
              marginTop: '1em',
              marginBottom: '1em',
              paddingLeft: '1em',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '0 0.375rem 0.375rem 0',
            },
            // 列表样式
            ul: {
              listStyleType: 'disc',
              marginTop: '0.75em',
              marginBottom: '0.75em',
              paddingLeft: '1.625em',
            },
            ol: {
              listStyleType: 'decimal',
              marginTop: '0.75em',
              marginBottom: '0.75em',
              paddingLeft: '1.625em',
            },
            li: {
              marginTop: '0.375em',
              marginBottom: '0.375em',
            },
            // 表格样式
            table: {
              width: '100%',
              marginTop: '1.5em',
              marginBottom: '1.5em',
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: '0.9em',
              lineHeight: '1.5',
            },
            thead: {
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
            },
            'thead th': {
              padding: '0.75em 1em',
              fontWeight: '600',
              textAlign: 'left',
              fontSize: '0.95em',
              color: 'inherit',
              borderRight: '1px solid var(--tw-prose-td-borders)',
              borderBottom: '2px solid var(--tw-prose-th-borders)',
              '&:last-child': {
                borderRight: 'none',
              },
            },
            'tbody td': {
              padding: '0.75em 1em',
              verticalAlign: 'top',
              color: 'inherit',
              borderRight: '1px solid var(--tw-prose-td-borders)',
              borderBottom: '1px solid var(--tw-prose-td-borders)',
              '&:last-child': {
                borderRight: 'none',
              },
            },
            'tbody tr': {
              '&:nth-child(even)': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            },
            // 水平线样式
            hr: {
              borderColor: 'var(--tw-prose-hr)',
              marginTop: '2em',
              marginBottom: '2em',
            },
            // 图片样式
            img: {
              marginTop: '1em',
              marginBottom: '1em',
              borderRadius: '0.375rem',
            },
            // 暗色模式特殊配置
            invert: {
              css: {
                '--tw-prose-body': 'var(--tw-prose-invert-body)',
                '--tw-prose-headings': 'var(--tw-prose-invert-headings)',
                '--tw-prose-links': 'var(--tw-prose-invert-links)',
                '--tw-prose-code': 'var(--tw-prose-invert-code)',
                '--tw-prose-pre-code': 'var(--tw-prose-invert-pre-code)',
                '--tw-prose-pre-bg': 'var(--tw-prose-invert-pre-bg)',
                '--tw-prose-hr': 'var(--tw-prose-invert-hr)',
                '--tw-prose-td-borders': 'var(--tw-prose-invert-td-borders)',
                '--tw-prose-th-borders': 'var(--tw-prose-invert-th-borders)',
              },
            },
            // 暗色模式特殊处理
            '.dark &': {
              table: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              thead: {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              'tbody tr:nth-child(even)': {
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              },
              'thead th': {
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
              },
              'tbody td': {
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              },
            },
            // Markmap 样式
            '.markmap': {
              '--mm-spacing-h': '100px',
              '--mm-spacing-v': '30px',
              '--mm-font-size': '16px',
              '--mm-root-size': '20px',
            }
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    function({ addComponents }) {
      addComponents({
        '.markmap-svg': {
          '@apply w-full h-full': {},
          '& .markmap-link': {
            '@apply stroke-gray-400 dark:stroke-gray-400': {}, // 更亮的连线
            'stroke-width': '3px',  // 更粗的连线
            'stroke-opacity': '0.8', // 更高的不透明度
          },
          '& .markmap-node > circle': {
            '@apply fill-blue-500 dark:fill-blue-400': {},
            '@apply opacity-30 dark:opacity-40': {}, // 更高的不透明度
          },
          '& .markmap-node > text': {
            '@apply font-sans text-lg text-gray-900 dark:text-gray-100': {}, // 更大的字体
            '@apply font-medium tracking-wide': {}, // 更好的字体效果
            'text-shadow': '0 1px 2px rgba(0,0,0,0.1)', // 文字阴影
          },
          '& .markmap-node.root > text': {
            '@apply text-2xl font-bold text-gray-900 dark:text-white': {}, // 更大的根节点文字
          },
          '& .markmap-node.root > circle': {
            '@apply fill-blue-600 dark:fill-blue-500': {},
            '@apply opacity-40 dark:opacity-50': {},
            'r': '8px', // 更大的根节点圆圈
          },
        },
        '.markmap-toolbar': {
          '@apply fixed right-8 top-8 z-50': {}, // 固定位置
          '@apply bg-white/90 dark:bg-gray-800/90 backdrop-blur': {}, // 半透明背景
          '@apply shadow-lg rounded-lg border border-gray-200 dark:border-gray-700': {},
          '@apply p-2': {},
          '& button': {
            '@apply text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400': {},
            '@apply p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700': {},
            '@apply transition-colors': {},
          },
        },
      });
    },
    require('tailwind-scrollbar'),
  ],
};
