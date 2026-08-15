// ponytail: bun/astro orphan child processes on Windows Ctrl+C — reclaim dev ports before starting
import { execSync } from 'node:child_process'

const run = (cmd) => {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString()
  } catch {
    return ''
  }
}

for (const port of [4321, 4322, 4323, 4324, 4325]) {
  if (process.platform === 'win32') {
    const pids = new Set(
      run('netstat -ano')
        .split('\n')
        .filter((l) => l.includes(`:${port} `) && l.includes('LISTENING'))
        .map((l) => l.trim().split(/\s+/).at(-1))
    )
    for (const pid of pids)
      if (Number(pid) > 0) run(`taskkill /F /PID ${pid}`)
  } else {
    run(`lsof -ti tcp:${port} | xargs kill -9`)
  }
}
