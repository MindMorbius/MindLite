export const formatDate = (timestamp) => {
  try {
    const date = new Date(Number(timestamp));
    if (isNaN(date.getTime())) {
      return '无效日期';
    }
    return new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch (err) {
    return '无效日期';
  }
};

export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatFileSize = (bytes) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Math.abs(bytes);
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  // 小于 10 显示一位小数，大于等于 10 显示整数
  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[unitIndex]}`;
}; 