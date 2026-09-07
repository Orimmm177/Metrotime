export type Visual = 'attention' | 'lora' | 'vit' | 'rag' | 'dpo' | 'resnet'
export interface Paper {
  id: string
  title: string
  subtitle: string
  summary: string
  authors: string
  category: string
  tags: string[]
  published: string
  added: string
  readingMinutes: number
  source: string
  sourceUrl: string
  htmlPath: string
  visual?: Visual
  featured?: boolean
  demo?: boolean
}

export function paperUrl(paper: Paper) {
  return `${import.meta.env.BASE_URL}${paper.htmlPath}`
}

export function parsePapers(data: unknown): Paper[] {
  if (!Array.isArray(data)) throw new Error('论文清单格式不正确')
  const ids = new Set<string>()
  for (const p of data) {
    if (!p || typeof p !== 'object' ||
      ['id', 'title', 'subtitle', 'summary', 'authors', 'category', 'source', 'sourceUrl', 'htmlPath', 'published', 'added'].some(key => typeof p[key] !== 'string' || !p[key].trim()) ||
      !Array.isArray(p.tags) || !p.tags.every((tag: unknown) => typeof tag === 'string') ||
      !Number.isFinite(p.readingMinutes) || p.readingMinutes <= 0 ||
      !/^papers\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(p.htmlPath) ||
      !/^https:\/\//.test(p.sourceUrl) ||
      [p.added, p.published].some(date => !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) ||
      ids.has(p.id)) throw new Error('论文清单中有无效或重复的记录')
    ids.add(p.id)
  }
  return data as Paper[]
}
