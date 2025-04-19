/**
 * 日志工具模块
 * 提供统一的日志记录功能
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// 从环境变量获取日志级别，默认为 info
const currentLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
const currentLevelValue = LOG_LEVELS[currentLevel] || LOG_LEVELS.info;

/**
 * 日志记录器
 */
const logger = {
  /**
   * 记录错误日志
   * @param {string} message - 日志消息
   * @param {Error|object} [error] - 错误对象或附加信息
   */
  error(message, error) {
    if (currentLevelValue >= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },

  /**
   * 记录警告日志
   * @param {string} message - 日志消息
   * @param {object} [data] - 附加数据
   */
  warn(message, data) {
    if (currentLevelValue >= LOG_LEVELS.warn) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },

  /**
   * 记录信息日志
   * @param {string} message - 日志消息
   * @param {object} [data] - 附加数据
   */
  info(message, data) {
    if (currentLevelValue >= LOG_LEVELS.info) {
      console.info(`[INFO] ${message}`, data || '');
    }
  },

  /**
   * 记录调试日志
   * @param {string} message - 日志消息
   * @param {object} [data] - 附加数据
   */
  debug(message, data) {
    if (currentLevelValue >= LOG_LEVELS.debug) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }
};

module.exports = logger;
