import { preview } from 'vite'
import { spawn } from 'node:child_process'

const server = await preview({
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  logLevel: 'silent',
})

const urls = server.resolvedUrls
const url = urls?.local?.[0] || 'http://127.0.0.1:4173'

process.stdout.write(`Планировщик бюджета: ${url}\n`)

await new Promise((resolve) => setTimeout(resolve, 400))

if (process.platform === 'win32') {
  spawn('cmd', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref()
} else {
  spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).unref()
}

process.stdout.write('Нажмите Ctrl+C для остановки.\n')

const shutdown = () => {
  server.httpServer.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)