import type { SidebarItem } from "@/config/site";

import { siteConfig } from "@/config/site";

// 工具函数：找到匹配的 key
export function getSidebarItemsByPath(pathname: string): SidebarItem[] {
  const sortedKeys = Object.keys(siteConfig.sidebarItems).sort(
    (a, b) => b.length - a.length,
  );

  const matchedKey = sortedKeys.find((key) => pathname.startsWith(key));

  return matchedKey
    ? (siteConfig.sidebarItems as Record<string, SidebarItem[]>)[matchedKey]
    : [];
}

// 增加一个工具方法
/**
 * 格式化时间戳
 * @param timestamp 时间戳字符串
 */
export function formatDate(timestamp: string) {
  let date = new Date(parseInt(timestamp));

  let year = date.getFullYear(); // 年
  let month = date.getMonth() + 1; // 月
  let day = date.getDate(); // 日

  let hour = date.getHours(); // 时
  let minutes = date.getMinutes(); // 分
  let seconds = date.getSeconds(); // 秒

  let weekArr = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  let week = weekArr[date.getDay()];

  // 需要给一位数前面加 0
  // 9 点 ----> 09:45:03

  if (month >= 1 && month <= 9) {
    // month += '0'; // a += b ----> a = a + b
    month = parseInt("0" + month);
  }

  if (day >= 0 && day <= 9) {
    day = parseInt("0" + day);
  }

  if (hour >= 0 && hour <= 9) {
    hour = parseInt("0" + hour);
  }

  if (minutes >= 0 && minutes <= 9) {
    minutes = parseInt("0" + minutes);
  }

  if (seconds >= 0 && seconds <= 9) {
    seconds = parseInt("0" + seconds);
  }

  return (
    year +
    "-" +
    month +
    "-" +
    day +
    " " +
    hour +
    ":" +
    minutes +
    ":" +
    seconds +
    " " +
    week
  );
}
