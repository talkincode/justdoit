// 使用 ES 模块语法
import { config } from 'dotenv';
import { Telegraf } from 'telegraf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { askAgent } from './common/aiagent.js';
import { generatePoster } from './common/imagegen.js';
import cron from 'node-cron';

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

const raw = process.env.ALLOWED_GROUP_IDS || '';
const ALLOWED_GROUP_IDS = new Set(
    raw
        .split(',')                    // 以逗号拆分
        .map(s => s.trim())            // 去掉首尾空格
        .filter(Boolean)               // 过滤空字符串
        .map(id => Number(id))         // 转为数字
);

// 初始化机器人
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use((ctx, next) => {
    const chatId = ctx.chat && ctx.chat.id;
    console.log("chatId = ", chatId)
    if (ALLOWED_GROUP_IDS.has(chatId)) {
        return next();
    }
    console.log("没有注册的Group ", chatId)
});

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
        throw new Error(`Tool execution failed`);
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
    }
});

// 处理所有其他消息
bot.on('text', (ctx) => {
    console.debug('Unknown command received', {
        from: ctx.from.id,
        text: ctx.message.text
    });
    // ctx.reply('我不理解这个命令。请使用 /help 查看可用命令。');
});

// 使用 cron 每4小时发送一次消息
cron.schedule('0 */1 * * *', async () => {
    console.log('[Cron] 被触发了：', new Date().toLocaleString());  // ← 排查用
    for (const chatId of ALLOWED_GROUP_IDS) {
        try {
            const replyMessage = await askAgent({
                instructions: `
                    你是 Dogecoin meme 币 Justdoit 的代言人，
                    你的任务是生成心灵鸡汤的短小语录, 或者讲一个币圈的小笑话，小故事，
                    Justdoit 的理念是：人生苦短，荣辱笑看，不服就干，Justdoit 是一种生活方式。
                    你生成的内容要有随机性、风趣、幽默， 犀利、有深度，
                    注意要尽量模拟一个人的角色，使用口语化表达`,
                content: '用户群里比较闷，说点啥子解解闷哦',
                role: 'user'
            });
            const respmsg = `${replyMessage}

Dogecoin Justdoit($JUSTDOIT)，JUSTDOIT 是一种生活方式。人生苦短，荣辱看淡，不服就干。
JUSTDOIT is a way of life. Life is short—treat honor and disgrace with indifference...
https://dogepump.ai/coin/8f871446473a9708a997bc80244a6ab65a1a4158a96f13eb4baf28383e83c457`;

            await bot.telegram.sendMessage(chatId, respmsg);
            console.log(`[Cron] 成功发送给 ${chatId}`);
        } catch (err) {
            console.error(`[Cron] 给 ${chatId} 发送失败：`, err);
        }
    }
}, {
    timezone: 'Asia/Shanghai'
});

// 使用 cron 每10分钟生成并发送 JUSTDOIT 宣传海报
cron.schedule('*/30 * * * *', async () => {
    console.log(`[Cron] Generating JUSTDOIT poster: ${new Date().toLocaleString()}`);
    try {
        const sysPrompt = `作为 Dogecoin Meme 币 JUSTDOIT 的视觉设计师, 你的任务是按用户要求创作图片`
        // const userPrompt = `
        // 请生成一张图文并茂的宣传海报，文字**尽量使用中文**，需包含以下要素：

        // - **核心文字**：“DogePump” & “JUSTDOIT”，突出展示。
        // - **辅助文字**： 中文须突出展示，英文可作小注
        // - **JUSTDOIT 理念**：人生苦短，荣辱笑看，不服就干
        // - **狗狗泵特色**：Dogechain 侧链 + Meme20 原生协议，债券曲线自动做市，一键发行，零预售零锁仓
        // - **风格**：吉卜力手绘或轻松漫画风，富有情感共鸣
        // - **配色**：鲜艳活泼，灵活搭配
        // - **随机趣味元素**：结合经典 Doge 表情或有趣场景
        // `;
        const userPrompt = `
        请生成一张宣传海报，需包含以下要素：
        - **风格**：吉卜力手绘或轻松漫画风，富有情感共鸣
        - **配色**：鲜艳活泼，灵活搭配
        - **随机趣味元素**：结合经典 Doge 表情或有趣场景
        `;
        const imageUrl = await generatePoster(
            sysPrompt,  userPrompt
        );
        for (const chatId of ALLOWED_GROUP_IDS) {
            await bot.telegram.sendPhoto(chatId, imageUrl, { caption: 'DogePump Justdoit' });
        }
        console.log('[Cron] Poster sent successfully');
    } catch (err) {
        console.error('[Cron] Poster generation failed:', err);
    }
}, {
    timezone: 'Asia/Shanghai'
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
