// 使用 ES 模块语法
import { config } from 'dotenv';
import { Telegraf } from 'telegraf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
config();

// 导入工具
const toolsDir = path.join(__dirname, 'tools');
const tools = {};

// 检查是否提供了机器人令牌
if (!process.env.BOT_TOKEN) {
    console.error('BOT_TOKEN is required in .env file');
    process.exit(1);
}

// 初始化机器人
const bot = new Telegraf(process.env.BOT_TOKEN);

// 注册所有工具
async function registerTools() {
    try {
        // 读取工具目录中的所有文件
        const toolFiles = fs.readdirSync(toolsDir)
            .filter(file => file !== 'toolsManager.js' && file.endsWith('.js'));

        // 动态导入每个工具
        for (const file of toolFiles) {
            try {
                const toolModule = await import(path.join(toolsDir, file));
                const tool = toolModule.default;

                if (tool && tool.name && typeof tool.execute === 'function') {
                    tools[tool.name] = tool;
                    console.info(`Tool registered: ${tool.name}`);
                } else {
                    console.warn(`Invalid tool format in file: ${file}`);
                }
            } catch (error) {
                console.error(`Error loading tool from ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error registering tools:', error);
    }
}

// 执行工具
async function executeTool(toolName, params) {
    if (!tools[toolName]) {
        throw new Error(`Tool not found: ${toolName}`);
    }

    try {
        console.debug(`Executing tool: ${toolName}`, { params });
        return await tools[toolName].execute(params);
    } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        throw new Error(`Tool execution failed: ${error.message}`);
    }
}

// 获取工具信息
function getToolsInfo() {
    return Object.values(tools).map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || []
    }));
}

// 机器人启动命令
bot.start((ctx) => {
    console.debug('Start command received', { from: ctx.from.id });
    ctx.reply('欢迎使用 JustdoitBot! 输入 /help 查看可用命令。');
});

// 帮助命令
bot.help((ctx) => {
    console.debug('Help command received', { from: ctx.from.id });
    const toolsInfo = getToolsInfo();
    let helpMessage = '可用命令:\n\n';

    toolsInfo.forEach(tool => {
        helpMessage += `/${tool.name} - ${tool.description}\n`;
        if (tool.parameters && tool.parameters.length > 0) {
            helpMessage += '  参数:\n';
            tool.parameters.forEach(param => {
                const required = param.required ? '[必填]' : '[可选]';
                helpMessage += `  - ${param.name}: ${param.description} ${required}\n`;
            });
        }
        helpMessage += '\n';
    });

    helpMessage += '例如: /eggs';

    ctx.reply(helpMessage);
});


// Azure AI 命令
bot.command('eggs', async (ctx) => {
    console.debug('eggs command received', {
        from: ctx.from.id,
        text: ctx.message.text
    });

    try {
        const result = await executeTool('eggs');
        ctx.reply(result);
    } catch (error) {
        console.error('eggs tool execution failed', error);
        ctx.reply(`处理失败: ${error.message}`);
    }
});

// 处理所有其他消息
bot.on('text', (ctx) => {
    console.debug('Unknown command received', {
        from: ctx.from.id,
        text: ctx.message.text
    });
    ctx.reply('我不理解这个命令。请使用 /help 查看可用命令。');
});

// 启动机器人
async function startBot() {
    try {
        // 先注册工具
        await registerTools();

        // 然后启动机器人
        await bot.launch();
        console.info('Bot started successfully');
    } catch (error) {
        console.error('Failed to start bot:', error);
    }
}

// 启动
startBot();

// 优雅退出
process.once('SIGINT', () => {
    console.info('SIGINT received, stopping bot');
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    console.info('SIGTERM received, stopping bot');
    bot.stop('SIGTERM');
});
