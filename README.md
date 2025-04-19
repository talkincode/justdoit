# JustdoitBot

一个基于 Node.js 的 Telegram 机器人，支持自定义工具和功能扩展。

## 项目结构

```
JustdoitBot/
├── src/                  # 源代码
│   ├── index.js          # 主应用入口点
│   └── tools/            # 自定义工具
│       ├── toolsManager.js  # 工具注册和执行管理
│       ├── aiEggsTool.js   # AI 灵感彩蛋
├── tests/                # 测试文件
├── .env.example          # 环境变量示例文件
├── package.json          # 项目依赖和脚本
└── README.md             # 项目文档
```

## 自定义工具

这个项目演示了如何创建和使用自定义工具：

1. **灵感彩蛋**：生成灵感语录

## 开始使用

### 前提条件

- Node.js (v14 或更高版本)
- npm 或 yarn
- Telegram 机器人 Token (从 BotFather 获取)

### 安装

1. 克隆仓库：
   ```
   git clone https://github.com/yourusername/JustdoitBot.git
   cd JustdoitBot
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 基于 `.env.example` 创建 `.env` 文件：
   ```
   cp .env.example .env
   ```

4. 编辑 `.env` 文件，添加你的 Telegram 机器人 Token：
   ```
   BOT_TOKEN=your_telegram_bot_token_here
   ```

5. 启动机器人：
   ```
   npm start
   ```

## 使用机器人

在 Telegram 中，你可以使用以下命令：

- `/start` - 启动机器人
- `/help` - 显示帮助信息
- `/eggs` - 生成灵感彩蛋语录

例如：
```
/eggs
```

## 获取 Telegram 机器人 Token

1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 按照提示设置机器人名称和用户名
4. 获取 API Token 并添加到 `.env` 文件中

## 许可证

MIT
