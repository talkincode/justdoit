/**
 * 通用工具函数模块
 * 提供各种辅助功能
 */

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} - 延迟结束后解析的 Promise
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 格式化日期时间
 * @param {Date} [date=new Date()] - 日期对象
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] - 格式字符串
 * @returns {string} - 格式化后的日期时间字符串
 */
const formatDateTime = (date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @param {string} [suffix='...'] - 截断后的后缀
 * @returns {string} - 截断后的文本
 */
const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * 随机生成指定范围内的整数
 * @param {number} min - 最小值（包含）
 * @param {number} max - 最大值（包含）
 * @returns {number} - 随机整数
 */
const randomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 检查字符串是否为有效的 JSON
 * @param {string} str - 要检查的字符串
 * @returns {boolean} - 是否为有效的 JSON
 */
const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  sleep,
  formatDateTime,
  truncateText,
  randomInt,
  isValidJson
};
