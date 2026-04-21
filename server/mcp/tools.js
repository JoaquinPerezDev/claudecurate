import nodeFetch from 'node-fetch'

const API_URL = process.env.API_URL
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN
const fetch = globalThis.fetch ?? nodeFetch

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-token': WEBHOOK_TOKEN,
      ...(options.headers || {})
    }
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status}`)
  }
  return res.json()
}

export const toolDefinitions = [
  {
    name: 'list_tasks',
    description: "List the user's pending and in-progress tasks in ClaudeCurate.",
    inputSchema: { type: 'object', properties: {}, required: [] }
  },
  {
    name: 'complete_task',
    description: 'Mark a specific ClaudeCurate task as complete by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'The _id of the task to complete' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'log_session',
    description: 'Log what was accomplished in this Claude session. ClaudeCurate will auto-match and complete relevant tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'One sentence describing what was accomplished' }
      },
      required: ['description']
    }
  }
]

export async function handleTool(name, args) {
  if (name === 'list_tasks') {
    const { tasks, language } = await apiFetch('/api/webhook/mcp/tasks')
    const langHint = language === 'es'
      ? '⚠️ Este usuario habla español. Cuando uses log_session, escribe la descripción EN ESPAÑOL para que coincida con los títulos de las tareas.'
      : '⚠️ This user speaks English. When calling log_session, write the description in ENGLISH to match task titles.'

    return {
      content: [{
        type: 'text',
        text: tasks.length
          ? `${langHint}\n\n${tasks.map(t => `[${t._id}] ${t.title} (${t.status})${t.subtasks?.length ? `\n  Subtasks: ${t.subtasks.map(s => `${s.title} [${s.status}]`).join(', ')}` : ''}`).join('\n')}`
          : `${langHint}\n\nNo pending tasks.`
      }]
    }
  }

  if (name === 'complete_task') {
    const task = await apiFetch(`/api/webhook/mcp/tasks/${args.taskId}/complete`, { method: 'POST' })
    return { content: [{ type: 'text', text: `Marked "${task.title}" as complete.` }] }
  }

  if (name === 'log_session') {
    const result = await apiFetch('/api/webhook/claude-hook', {
      method: 'POST',
      body: JSON.stringify({ webhookToken: WEBHOOK_TOKEN, taskDescription: args.description })
    })
    if (!result.matched) {
      return { content: [{ type: 'text', text: 'Session logged. No matching task found.' }] }
    }
    const msg = result.subtask
      ? `Completed subtask "${result.subtask.title}"${result.autoCompletedParent ? ` and parent task "${result.task.title}"` : ''}.`
      : `Completed task "${result.task.title}".`
    return { content: [{ type: 'text', text: msg }] }
  }

  throw new Error(`Unknown tool: ${name}`)
}
