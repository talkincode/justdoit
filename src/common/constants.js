/**
 * 常量定义模块
 * 集中管理应用中使用的常量
 */

// 应用常量
const APP = {
    NAME: 'JustdoitBot',
    VERSION: '1.0.0',
};

// 消息常量
const MESSAGES = {
    WELCOME: '欢迎使用 JustdoitBot! 输入 /help 查看可用命令。',
    HELP_HEADER: '可用命令:\n\n',
    COMMAND_NOT_UNDERSTOOD: '我不理解这个命令。请使用 /help 查看可用命令。',
    MISSING_PARAMS: '缺少必要参数。请查看 /help 获取使用说明。',
};

// 工具相关常量
const TOOLS = {

};

// API 相关常量
const API = {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 毫秒
    TIMEOUT: 10000, // 毫秒
};

module.exports = {
    APP,
    MESSAGES,
    TOOLS,
    API
};
