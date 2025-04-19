/**
 * Tools Manager - Handles registration and execution of custom tools
 */

const fs = require('fs');
const path = require('path');
const logger = require('../common/logger');

class ToolsManager {
    constructor() {
        this.tools = {};
    }

    /**
     * Register all tools from the tools directory
     */
    registerTools() {
        const toolsDir = path.join(__dirname);

        // Skip the manager itself and only load tool files
        const toolFiles = fs.readdirSync(toolsDir)
            .filter(file => file !== 'toolsManager.js' && file.endsWith('.js'));

        for (const file of toolFiles) {
            try {
                const toolModule = require(path.join(toolsDir, file));
                if (toolModule.name && typeof toolModule.execute === 'function') {
                    this.tools[toolModule.name] = toolModule;
                    logger.info(`Tool registered: ${toolModule.name}`);
                } else {
                    logger.warn(`Invalid tool format in file: ${file}`);
                }
            } catch (error) {
                logger.error(`Error loading tool from ${file}:`, error);
            }
        }
    }

    /**
     * Execute a specific tool by name with provided parameters
     * @param {string} toolName - Name of the tool to execute
     * @param {object} params - Parameters to pass to the tool
     * @returns {Promise<any>} - Result of the tool execution
     */
    async executeTool(toolName, params) {
        if (!this.tools[toolName]) {
            logger.error(`Tool not found: ${toolName}`);
            throw new Error(`Tool not found: ${toolName}`);
        }

        try {
            logger.debug(`Executing tool: ${toolName}`, { params });
            return await this.tools[toolName].execute(params);
        } catch (error) {
            logger.error(`Error executing tool ${toolName}:`, error);
            throw new Error(`Tool execution failed: ${error.message}`);
        }
    }

    /**
     * Get information about all registered tools
     * @returns {Array<object>} - Array of tool information objects
     */
    getToolsInfo() {
        return Object.values(this.tools).map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters || []
        }));
    }
}

module.exports = new ToolsManager();
