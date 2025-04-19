import { AIProjectsClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

export async function askAgent({
    connectionString = process.env.AZURE_AI_PROJECTS_CONNECTION_STRING,
    content = "Hi Agent657",
    role = "user",
    instructions = "",
    pollInterval = 1000
}) {
    if (!connectionString) {
        throw new Error('缺少 Azure AI 配置。请在 .env 文件中设置 AZURE_AI_PROJECTS_CONNECTION_STRING');
    }

    const client = AIProjectsClient.fromConnectionString(
        connectionString,
        new DefaultAzureCredential()
    );

    // 获取 Agent
    const agent = await client.agents.createAgent("gpt-4o", {
        name: "Jusdoit-agent",
        instructions: instructions
    });
    console.log(`Retrieved agent: ${agent.name}`);

    // 创建对话线程
    const thread = await client.agents.createThread();
    console.log(`Retrieved thread, thread ID: ${thread.id}`);

    // 发送用户消息
    const message = await client.agents.createMessage(thread.id, { role, content });
    console.log(`Created message, message ID: ${message.id}`);

    // 创建并轮询 Run
    let run = await client.agents.createRun(thread.id, agent.id);
    while (run.status === "queued" || run.status === "in_progress") {
        await new Promise(res => setTimeout(res, pollInterval));
        run = await client.agents.getRun(thread.id, run.id);
    }

    console.log(`Run completed with status: ${run.status}`);

    await client.agents.deleteThread(thread.id);
    await client.agents.deleteAgent(agent.id);

    // 获取并返回消息
    const messages = await client.agents.listMessages(thread.id);

    // 过滤仅返回机器人的文本
    const assistantMessages = messages.data
        .filter(msg => msg.role === "assistant")
        .map(msg => msg.content);

    if(!assistantMessages){
        return ""
    }
    return assistantMessages?.[0]?.[0]?.text?.value ?? '';
}