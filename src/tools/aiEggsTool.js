/**
 * Azure AI Tool - 使用 Azure AI Projects 服务
 */
import dotenv from 'dotenv';
import {  askAgent } from '../common/aiagent.js';
dotenv.config();

const aiEggsTool = {
    name: 'eggs',
    description: '来一段 AI 灵感彩蛋',
    parameters: [
        // { name: 'prompt',    type: 'string', description: '要处理的文本提示',                        required: true },
        // { name: 'operation', type: 'string', description: '操作类型 (analyze, generate, summarize)', required: true }
    ],

    async execute(params) {
        // if (!params.prompt)    throw new Error('prompt 参数是必需的');
        // if (!params.operation) throw new Error('operation 参数是必需的');

        // 调用通用对话接口
        const replyMessage = await askAgent({
            instructions: "你是 Dogecoin meme 币 Justdoit 的代言人， 你的任务是生成心灵鸡汤的短小语录， Justdoi 的理念是\
        人生苦短， 荣辱看淡， 不服就干， Jusdoit 是一种生活方式。 你生成的语录要有随机性， 风趣， 幽默， 有深度",
            content: '来一段随机灵感彩蛋',
            role: 'user'
        });

        return  replyMessage ;
    }
};

export default aiEggsTool;
