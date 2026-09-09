import { readFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export async function validatePapers(papers, publicDir) {
  if (!Array.isArray(papers)) throw new Error('papers.json must be an array')
  const ids = new Set()
  const paths = new Set()
  const required = ['id', 'title', 'subtitle', 'summary', 'authors', 'category', 'source', 'sourceUrl', 'htmlPath', 'published', 'added']
  for (const [index, paper] of papers.entries()) {
    const label = `Paper ${index + 1}`
    if (!paper || required.some(key => typeof paper[key] !== 'string' || !paper[key].trim())) throw new Error(`${label}: missing required text field`)
    if (ids.has(paper.id)) throw new Error(`${label}: duplicate id ${paper.id}`)
    ids.add(paper.id)
    if (!Array.isArray(paper.tags) || !paper.tags.every(tag => typeof tag === 'string' && tag.trim())) throw new Error(`${label}: invalid tags`)
    for (const date of [paper.published, paper.added]) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error(`${label}: invalid date ${date}`)
    }
    if (!/^papers\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(paper.htmlPath)) throw new Error(`${label}: htmlPath must be a safe local HTML path under papers/`)
    if (paths.has(paper.htmlPath)) throw new Error(`${label}: duplicate htmlPath`)
    paths.add(paper.htmlPath)
    try { if (new URL(paper.sourceUrl).protocol !== 'https:') throw new Error() } catch { throw new Error(`${label}: sourceUrl must be an HTTPS URL`) }
    const preview = paper.previewImage
    if (!preview || ['src', 'alt', 'sourceLabel', 'sourceUrl'].some(key => typeof preview[key] !== 'string' || !preview[key].trim())) throw new Error(`${label}: previewImage requires src, alt, sourceLabel and sourceUrl for this model's architecture`)
    if (!/^papers\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:png|jpe?g|webp|svg)$/.test(preview.src)) throw new Error(`${label}: previewImage.src must be a safe local image path under papers/`)
    try { if (new URL(preview.sourceUrl).protocol !== 'https:') throw new Error() } catch { throw new Error(`${label}: previewImage.sourceUrl must be an HTTPS URL`) }
    try { await access(resolve(publicDir, preview.src)) } catch { throw new Error(`${label}: preview image does not exist: ${preview.src}`) }
    for (const key of ['demo', 'featured']) if (paper[key] !== undefined && typeof paper[key] !== 'boolean') throw new Error(`${label}: ${key} must be boolean`)
    try { await access(resolve(publicDir, paper.htmlPath)) } catch { throw new Error(`${label}: report does not exist: ${paper.htmlPath}`) }
    const html = await readFile(resolve(publicDir, paper.htmlPath), 'utf8')
    if (!/<title>\s*[^<]+<\/title>/i.test(html) || !/<html[\s>]/i.test(html)) throw new Error(`${label}: report must be a complete HTML document with a title`)
  }
  if (papers.filter(p => p.featured).length > 1) throw new Error('Choose at most one featured paper')
  return papers.length
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
    const papers = JSON.parse(await readFile(resolve(publicDir, 'papers.json'), 'utf8'))
    console.log(`Validated ${await validatePapers(papers, publicDir)} papers and their HTML reports.`)
  } catch (error) {
    console.error(`Paper validation failed: ${error.message}`)
    process.exitCode = 1
  }
}
