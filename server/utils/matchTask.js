const SCORE_THRESHOLD = 0.4
const SUBTASK_THRESHOLD = 0.5

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim()
}

function wordOverlap(haystack, needle) {
  const haystackWords = new Set(normalize(haystack).split(/\s+/).filter(Boolean))
  const needleWords = normalize(needle).split(/\s+/).filter(Boolean)
  if (!needleWords.length) return 0
  const hits = needleWords.filter(w => haystackWords.has(w)).length
  return hits / needleWords.length
}

function scoreTask(description, task) {
  let score = 0

  if (task.claudeKeywords?.length) {
    const keywordHits = task.claudeKeywords.filter(kw =>
      normalize(description).includes(normalize(kw))
    ).length
    score += keywordHits / task.claudeKeywords.length
  }

  const titleOverlap = wordOverlap(description, task.title)
  score += titleOverlap * 0.3

  return score
}

/**
 * Matches an incoming Claude session description against a user's tasks.
 *
 * Pass 1: check each pending subtask across all tasks.
 * Pass 2: if no subtask matched, score parent tasks directly.
 *
 * @param {string} description - Natural language description from Claude session
 * @param {Array} tasks - Array of Task documents (non-complete)
 * @returns {{ matched: boolean, task?: object, subtask?: object, autoCompletedParent?: boolean }}
 */
export function matchTask(description, tasks) {
  if (!description || !tasks?.length) return { matched: false }

  // Pass 1 — subtask match
  for (const task of tasks) {
    if (!task.subtasks?.length) continue
    const pendingSubtasks = task.subtasks.filter(s => s.status === 'pending')
    for (const subtask of pendingSubtasks) {
      if (wordOverlap(description, subtask.title) >= SUBTASK_THRESHOLD) {
        subtask.status = 'complete'
        subtask.completedAt = new Date()

        const allDone = task.subtasks.every(s => s.status === 'complete')
        const autoCompletedParent = allDone
        if (allDone) {
          task.status = 'complete'
          task.completedAt = new Date()
        }

        return { matched: true, task, subtask, autoCompletedParent }
      }
    }
  }

  // Pass 2 — parent task match
  let best = null
  let bestScore = 0

  for (const task of tasks) {
    const score = scoreTask(description, task)
    if (score > bestScore) {
      bestScore = score
      best = task
    }
  }

  if (best && bestScore >= SCORE_THRESHOLD) {
    best.status = 'complete'
    best.completedAt = new Date()
    return { matched: true, task: best }
  }

  return { matched: false }
}
