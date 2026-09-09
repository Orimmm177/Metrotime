import { after, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validatePapers } from './validate-papers.mjs'

const publicDir = await mkdtemp(join(tmpdir(), 'metrotime-validation-'))
await mkdir(join(publicDir, 'papers'))
await mkdir(join(publicDir, 'papers/previews'))
await writeFile(join(publicDir, 'papers/previews/first.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><text x="10" y="30">Architecture</text></svg>')
const papers = ['first', 'second'].map((id, index) => ({
  id, title: 'Example', subtitle: 'Example subtitle', summary: 'Example summary',
  authors: 'Author', category: 'Research', source: 'arXiv', tags: ['Example'],
  sourceUrl: 'https://arxiv.org/abs/1706.03762', htmlPath: `papers/${id}.html`,
  published: '2017-06-12', added: '2026-09-07',
  featured: index === 0,
  previewImage: { src: 'papers/previews/first.svg', alt: 'Test model architecture', sourceLabel: 'Figure 2', sourceUrl: 'https://arxiv.org/abs/1706.03762' },
}))
for (const paper of papers) await writeFile(join(publicDir, paper.htmlPath), '<!doctype html><html><head><title>Example</title></head><body>Example</body></html>')
after(() => rm(publicDir, { recursive: true, force: true }))
const one = (changes = {}) => [{ ...papers[0], ...changes }]

test('valid reports and empty libraries are accepted', async () => {
  assert.equal(await validatePapers(papers, publicDir), papers.length)
  assert.equal(await validatePapers([], publicDir), 0)
})
test('duplicate IDs do not silently overwrite a paper', async () => {
  await assert.rejects(validatePapers([papers[0], papers[0]], publicDir), /duplicate id/)
})
test('missing HTML blocks a broken deployment', async () => {
  await assert.rejects(validatePapers(one({ htmlPath: 'papers/missing-report.html' }), publicDir), /does not exist/)
})
test('HTML links cannot escape the report directory', async () => {
  for (const htmlPath of ['../private.html', 'papers/../index.html', 'https://example.com/a.html', 'papers/%2e%2e/a.html', '/papers/a.html']) {
    await assert.rejects(validatePapers(one({ htmlPath }), publicDir), /safe local HTML path/)
  }
})
test('invalid dates cannot silently normalize into a different day', async () => {
  await assert.rejects(validatePapers(one({ added: '2026-02-30' }), publicDir), /invalid date/)
})
test('invalid metadata produces a clear build error', async () => {
  await assert.rejects(validatePapers(one({ title: '' }), publicDir), /required text/)
  await assert.rejects(validatePapers(one({ tags: 'LoRA' }), publicDir), /invalid tags/)
  await assert.rejects(validatePapers(one({ sourceUrl: 'javascript:alert(1)' }), publicDir), /HTTPS/)
  await assert.rejects(validatePapers(one({ demo: 'false' }), publicDir), /must be boolean/)
})
test('the featured report is unambiguous', async () => {
  await assert.rejects(validatePapers([papers[0], { ...papers[1], featured: true }], publicDir), /at most one/)
})

test('a model report cannot silently fall back to a generic architecture', async () => {
  await assert.rejects(validatePapers(one({ previewImage: undefined }), publicDir), /previewImage/)
})

test('architecture previews require a real local asset and attribution', async () => {
  const previewImage = { src: 'papers/previews/first.png', alt: 'First model architecture', sourceLabel: 'Figure 2', sourceUrl: 'https://arxiv.org/abs/1706.03762' }
  await assert.rejects(validatePapers(one({ previewImage: { ...previewImage, src: 'papers/previews/missing.png' } }), publicDir), /preview image does not exist/)
  await assert.rejects(validatePapers(one({ previewImage: { ...previewImage, src: 'papers/../private.png' } }), publicDir), /safe local image path/)
  await assert.rejects(validatePapers(one({ previewImage: { ...previewImage, alt: '' } }), publicDir), /previewImage/)
  await assert.rejects(validatePapers(one({ previewImage: { ...previewImage, sourceUrl: 'javascript:alert(1)' } }), publicDir), /previewImage/)
})
