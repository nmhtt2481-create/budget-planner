import sharp from 'sharp'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'build-icons')

mkdirSync(OUT, { recursive: true })

const RUBLE_GLYPH = `
  <g fill="#FFFFFF">
    <rect x="195" y="130" width="60" height="150" rx="12"/>
    <path d="M195 130 C 195 173 308 208 351 208 C 351 251 238 286 195 286 Z"/>
    <rect x="170" y="302" width="200" height="34" rx="17"/>
    <rect x="170" y="354" width="200" height="34" rx="17"/>
  </g>
`

const GRADIENT = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5B5CE2"/>
      <stop offset="1" stop-color="#8B7CF6"/>
    </linearGradient>
  </defs>
`

function fullIconSvg(rounded = true) {
  const bg = rounded
    ? `<rect width="512" height="512" rx="112" fill="url(#g)"/>`
    : `<rect width="512" height="512" fill="url(#g)"/>`
  return `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${GRADIENT}${bg}${RUBLE_GLYPH}</svg>`
}

function foregroundSvg() {
  return `<svg width="432" height="432" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${RUBLE_GLYPH}</svg>`
}

const DENSITIES = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
]

async function generateAndroidIcons() {
  const resDir = join(ROOT, 'android', 'app', 'src', 'main', 'res')
  const full = Buffer.from(fullIconSvg(true))
  const fg = Buffer.from(foregroundSvg())

  for (const d of DENSITIES) {
    const dir = join(resDir, d.dir)
    await sharp(full).resize(d.size, d.size).png().toFile(join(dir, 'ic_launcher.png'))
    await sharp(full).resize(d.size, d.size).png().toFile(join(dir, 'ic_launcher_round.png'))
    await sharp(fg).resize(d.size, d.size).png().toFile(join(dir, 'ic_launcher_foreground.png'))
    console.log(`  ${d.dir}: ${d.size}px`)
  }
  const dir = join(resDir, 'values')
  writeFileSync(join(dir, 'ic_launcher_background.xml'), `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#5B5CE2</color>
</resources>
`)
  console.log('  adaptive background -> #5B5CE2')
}

function buildIco(entries) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)

  const dirs = []
  const bodies = []
  let offset = 6 + entries.length * 16
  for (const { size, png } of entries) {
    const d = Buffer.alloc(16)
    d.writeUInt8(size >= 256 ? 0 : size, 0)
    d.writeUInt8(size >= 256 ? 0 : size, 1)
    d.writeUInt8(0, 2)
    d.writeUInt8(0, 3)
    d.writeUInt16LE(1, 4)
    d.writeUInt16LE(32, 6)
    d.writeUInt32LE(png.length, 8)
    d.writeUInt32LE(offset, 12)
    dirs.push(d)
    bodies.push(png)
    offset += png.length
  }
  return Buffer.concat([header, ...dirs, ...bodies])
}

async function generateDesktopIcon() {
  const full = Buffer.from(fullIconSvg(true))

  await sharp(full).png().toFile(join(OUT, 'icon-512.png'))
  console.log('  icon-512.png')

  const sizes = [16, 24, 32, 48, 64, 128, 256]
  const entries = []
  for (const size of sizes) {
    const png = await sharp(full).resize(size, size).png().toBuffer()
    entries.push({ size, png })
  }
  writeFileSync(join(OUT, 'budget.ico'), buildIco(entries))
  console.log(`  budget.ico (${sizes.join(', ')}px)`)

  writeFileSync(join(OUT, 'app-icon.svg'), fullIconSvg(true))
  console.log('  app-icon.svg')
}

console.log('Генерация иконок...')
console.log('Android иконки:')
await generateAndroidIcons()
console.log('Desktop иконки:')
await generateDesktopIcon()
console.log('Готово. Файлы в build-icons/')