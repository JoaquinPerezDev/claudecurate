#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { toolDefinitions, handleTool } from './tools.js'

const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN
const API_URL = process.env.API_URL

if (!WEBHOOK_TOKEN || !API_URL) {
  console.error('WEBHOOK_TOKEN and API_URL environment variables are required')
  process.exit(1)
}

const server = new Server(
  { name: 'claudecurate-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolDefinitions
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleTool(request.params.name, request.params.arguments || {})
  } catch (err) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
      isError: true
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
