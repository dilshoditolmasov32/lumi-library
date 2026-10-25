#!/usr/bin/env node
/**
 * Downloads public-domain editions from Standard Ebooks (released under CC0)
 * and converts them into small per-chapter JSON files for LUMI's reader:
 *
 *   public/books/<bookId>/manifest.json   chapter list + word counts
 *   public/books/<bookId>/<n>.json        one chapter's text blocks
 *
 * Run with: npm run books:import
 * Only text and <em>/<br> markup survive; everything else is escaped.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const SOURCE = 'Standard Ebooks'
const BOOKS = {
  'pride-and-prejudice': 'jane-austen/pride-and-prejudice',
  persuasion: 'jane-austen/persuasion',
  'jane-eyre': 'charlotte-bronte/jane-eyre',
  'wuthering-heights': 'emily-bronte/wuthering-heights',
  frankenstein: 'mary-shelley/frankenstein',
  'moby-dick': 'herman-melville/moby-dick',
  'the-hound-of-the-baskervilles': 'arthur-conan-doyle/the-hound-of-the-baskervilles',
  'the-great-gatsby': 'f-scott-fitzgerald/the-great-gatsby',
  'mrs-dalloway': 'virginia-woolf/mrs-dalloway',
}

/** Sections longer than this are split into parts at paragraph boundaries. */
const MAX_WORDS = 9000
const PART_WORDS = 4500

const OUT_DIR = join(process.cwd(), 'public', 'books')

// ---------------------------------------------------------------- helpers

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Converts an XHTML fragment to safe HTML that only contains <em> and <br>. */
function toSafeHtml(fragment) {
  const withoutNotes = fragment.replace(/<a\b[^>]*epub:type="noteref"[^>]*>[\s\S]*?<\/a>/g, '')
  const parts = withoutNotes.split(/(<[^>]+>)/)
  let html = ''
  for (const part of parts) {
    if (!part) continue
    if (part.startsWith('<')) {
      if (/^<br\b/i.test(part)) html += '<br>'
      else if (/^<(em|i)\b/i.test(part)) html += '<em>'
      else if (/^<\/(em|i)>/i.test(part)) html += '</em>'
      // every other tag is dropped, keeping its text
    } else {
      html += escapeHtml(decodeEntities(part))
    }
  }
  return html
    .replace(/[ \t\r\n]+/g, ' ')
    .replace(/\s*<br>\s*/g, '<br>')
    .replace(/<em>\s*<\/em>/g, '')
    .trim()
}

function plainText(fragment) {
  return decodeEntities(fragment.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Finds every <section> with its nesting, so we can keep only the leaf
 * sections that belong to the body of the book.
 */
function parseSections(html) {
  const tag = /<(\/?)section\b([^>]*)>/g
  const stack = []
  const sections = []
  let match
  while ((match = tag.exec(html))) {
    if (match[1] !== '/') {
      const attrs = match[2]
      const type = /epub:type="([^"]*)"/.exec(attrs)?.[1] ?? ''
      const parent = stack[stack.length - 1]
      const node = {
        id: /id="([^"]*)"/.exec(attrs)?.[1] ?? '',
        type,
        bodymatter: type.includes('bodymatter') || Boolean(parent?.bodymatter),
        contentStart: tag.lastIndex,
        hasChildren: false,
        parent,
      }
      if (parent) parent.hasChildren = true
      stack.push(node)
    } else {
      const node = stack.pop()
      if (!node) continue
      node.content = html.slice(node.contentStart, match.index)
      sections.push(node)
    }
  }
  // Sections close in reverse order; restore document order.
  return sections.sort((a, b) => a.contentStart - b.contentStart)
}

/** The heading block at the very start of a section (an <hgroup> or a single <hN>), if any. */
const LEADING_HEADING =
  /^\s*(?:<header\b[^>]*>\s*)?(<hgroup\b[^>]*>[\s\S]*?<\/hgroup>|<(h[1-6])\b[^>]*>[\s\S]*?<\/\2>)(?:\s*<\/header>)?/

function sectionTitle(content) {
  const leading = LEADING_HEADING.exec(content)?.[1]
  if (!leading) return ''
  const pieces = [...leading.matchAll(/<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => plainText(m[2]))
  return formatTitle(pieces.filter(Boolean))
}

function formatTitle(pieces) {
  if (pieces.length === 0) return ''
  const [first, ...rest] = pieces
  const label = /^([IVXLCDM]+|\d+)$/.test(first) ? `Chapter ${first}` : first
  return rest.length ? `${label}: ${rest.join(' — ')}` : label
}

/** Turns a section body into reader blocks: paragraphs, quotes, sub-headings and breaks. */
function sectionBlocks(content) {
  const body = content.replace(LEADING_HEADING, '')
  const blocks = []
  const token = /<(p|h[2-6])\b([^>]*)>([\s\S]*?)<\/\1>|<hr\b[^>]*\/?>|<(\/?)blockquote\b[^>]*>/g
  let quoteDepth = 0
  let match
  while ((match = token.exec(body))) {
    if (match[0].startsWith('<hr')) {
      blocks.push({ t: 'break' })
    } else if (match[0].startsWith('<blockquote') || match[0].startsWith('</blockquote')) {
      quoteDepth += match[4] === '/' ? -1 : 1
    } else {
      const html = toSafeHtml(match[3])
      if (!html) continue
      const type = match[1] === 'p' ? (quoteDepth > 0 ? 'quote' : 'p') : 'h'
      blocks.push({ t: type, html })
    }
  }
  // Chapters written as letters arrive wrapped in a quotation; show them as normal text.
  const textBlocks = blocks.filter((block) => block.t === 'p' || block.t === 'quote')
  const quotes = textBlocks.filter((block) => block.t === 'quote').length
  if (textBlocks.length && quotes / textBlocks.length > 0.7) {
    for (const block of blocks) if (block.t === 'quote') block.t = 'p'
  }
  // Drop leading/trailing breaks.
  while (blocks[0]?.t === 'break') blocks.shift()
  while (blocks.at(-1)?.t === 'break') blocks.pop()
  return blocks
}

function blockWords(block) {
  return block.html ? countWords(block.html.replace(/<[^>]+>/g, ' ')) : 0
}

function splitLong(title, blocks) {
  const words = blocks.reduce((sum, block) => sum + blockWords(block), 0)
  if (words <= MAX_WORDS) return [{ title, blocks, words }]
  // (an untitled section gets plain "Part n of m" titles below)
  const parts = []
  let current = []
  let count = 0
  for (const block of blocks) {
    current.push(block)
    count += blockWords(block)
    if (count >= PART_WORDS && (block.t === 'p' || block.t === 'break')) {
      parts.push({ blocks: current, words: count })
      current = []
      count = 0
    }
  }
  if (current.length) {
    // Fold a small remainder into the previous part.
    if (count < PART_WORDS / 3 && parts.length) {
      parts.at(-1).blocks.push(...current)
      parts.at(-1).words += count
    } else parts.push({ blocks: current, words: count })
  }
  const label = (i) => `Part ${i + 1} of ${parts.length}`
  return parts.map((part, i) => ({ ...part, title: title ? `${title} · ${label(i)}` : label(i) }))
}

// ---------------------------------------------------------------- main

async function importBook(bookId, slug) {
  const sourceUrl = `https://standardebooks.org/ebooks/${slug}`
  const response = await fetch(`${sourceUrl}/text/single-page`)
  if (!response.ok) throw new Error(`${bookId}: HTTP ${response.status}`)
  const html = await response.text()

  const chapters = []
  for (const section of parseSections(html)) {
    if (!section.bodymatter || section.hasChildren) continue
    const blocks = sectionBlocks(section.content)
    if (blocks.length === 0) continue
    const title = sectionTitle(section.content)
    for (const chapter of splitLong(title, blocks)) {
      chapters.push({ ...chapter, title: chapter.title || `Section ${chapters.length + 1}` })
    }
  }
  if (chapters.length === 0) throw new Error(`${bookId}: no chapters found`)

  const dir = join(OUT_DIR, bookId)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  await Promise.all(
    chapters.map((chapter, index) =>
      writeFile(join(dir, `${index}.json`), JSON.stringify({ title: chapter.title, blocks: chapter.blocks })),
    ),
  )
  const manifest = {
    bookId,
    source: SOURCE,
    sourceUrl,
    license: 'CC0 1.0 (public domain dedication)',
    totalWords: chapters.reduce((sum, chapter) => sum + chapter.words, 0),
    chapters: chapters.map((chapter) => ({ title: chapter.title, words: chapter.words })),
  }
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 1))
  return manifest
}

const only = process.argv.slice(2)
for (const [bookId, slug] of Object.entries(BOOKS)) {
  if (only.length && !only.includes(bookId)) continue
  const manifest = await importBook(bookId, slug)
  console.log(
    `${bookId.padEnd(32)} ${String(manifest.chapters.length).padStart(4)} chapters  ${String(manifest.totalWords).padStart(7)} words`,
  )
}
