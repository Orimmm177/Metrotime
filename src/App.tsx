import { useEffect, useRef, useState } from 'react'
import { ArrowDownWideNarrow, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, Clock3, Code2, ExternalLink, FileText, Github, Grid2X2, Layers3, Library, List, Menu, Search, Sparkles, X } from 'lucide-react'
import PaperPreview from './PaperPreview'
import researchDirections from './research-directions.json'
import { parsePapers, paperUrl, type Paper } from './papers'

type View = 'library' | 'saved'
const githubUrl = 'https://github.com/Orimmm177/Metrotime'
const dateLabel = (value: string) => value.replaceAll('-', '.')

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('metrotime:saved') || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch { return [] }
}

export default function App() {
  const [papers, setPapers] = useState<Paper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [view, setView] = useState<View>('library')
  const [category, setCategory] = useState('全部')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const [saved, setSaved] = useState(readSaved)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [notice, setNotice] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const aboutRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    fetch(`${import.meta.env.BASE_URL}papers.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('无法加载论文清单'); return response.json() })
      .then(data => setPapers(parsePapers(data)))
      .catch(e => { if (e.name !== 'AbortError') setError('论文档案暂时无法加载，请检查网络后重试。') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 3000)
    return () => clearTimeout(timer)
  }, [notice])

  function toggleSaved(paper: Paper) {
    const isSaved = saved.includes(paper.id)
    const next = isSaved ? saved.filter(id => id !== paper.id) : [...saved, paper.id]
    setSaved(next)
    try {
      localStorage.setItem('metrotime:saved', JSON.stringify(next))
      setNotice(isSaved ? '已移出收藏' : '已收藏，留给下一次阅读')
    } catch { setNotice('已更新本次收藏；浏览器限制导致无法持久保存') }
  }

  function navigate(next: View, nextCategory = '全部') {
    setView(next)
    setCategory(nextCategory)
    setQuery('')
    setMobileMenu(false)
  }

  const categories = [...new Set([...researchDirections, ...papers.map(p => p.category)])]
  const savedCount = papers.filter(p => saved.includes(p.id)).length
  const visible = papers.filter(p => (view !== 'saved' || saved.includes(p.id)) &&
    (category === '全部' || p.category === category) &&
    [p.title, p.subtitle, p.summary, p.authors, p.source, ...p.tags].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'oldest' ? a.added.localeCompare(b.added) : sort === 'published' ? b.published.localeCompare(a.published) : b.added.localeCompare(a.added))
  const featured = papers.find(p => p.featured)
  const latest = papers.map(p => p.added).sort().at(-1)
  const isHome = view === 'library' && category === '全部' && !query

  return <>
    <a className="skip-link" href="#papers">跳至论文列表</a>
    {mobileMenu && <button className="sidebar-backdrop" aria-label="关闭导航" onClick={() => setMobileMenu(false)} />}
    <aside className={`sidebar ${mobileMenu ? 'is-open' : ''}`}>
      <a className="brand" href="#" onClick={event => { event.preventDefault(); navigate('library') }}><span className="brand-mark"><svg viewBox="0 0 36 36" fill="none" aria-hidden="true"><path d="M7 26V10l11 8 11-8v16M18 18v10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg></span><span>Metrotime<span className="brand-sub">A SPACE FOR UNDERSTANDING</span></span></a>
      <div className="sidebar-section-label">我的阅读空间</div>
      <nav aria-label="主导航" className="main-nav">
        <button className={view === 'library' ? 'active' : ''} onClick={() => navigate('library')}><Library size={19} />论文档案<span className="nav-count">{papers.length.toString().padStart(2, '0')}</span></button>
        <button className={view === 'saved' ? 'active' : ''} onClick={() => navigate('saved')}><Bookmark size={18} />我的收藏<span className="nav-count">{savedCount.toString().padStart(2, '0')}</span></button>
      </nav>
      <div className="sidebar-section-label topic-label">探索研究方向</div>
      <nav className="topic-nav" aria-label="研究方向">{categories.map((item, i) => <button className={category === item ? 'selected' : ''} key={item} onClick={() => navigate('library', item)}><span className={`topic-dot dot-${i}`} />{item}<span>{papers.filter(p => p.category === item).length}</span></button>)}</nav>
      <div className="sidebar-bottom">
        <div className="quiet-note"><span className="note-icon"><BookOpen size={19} /></span><p>保持好奇，慢慢读懂。</p><span>每一次阅读，都是一次连接。</span><div className="note-line" /></div>
        <button className="about-button" onClick={() => { aboutRef.current?.showModal(); setMobileMenu(false) }}><Code2 size={17} />关于这个空间<ArrowUpRight size={15} /></button>
        <div className="sidebar-footer"><span className="tiny-logo">M</span>你的个人研究档案<span className="green-dot" /></div>
      </div>
    </aside>

    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><button className="icon-button mobile-toggle" aria-label="打开导航" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={21} /></button><span>阅读空间</span><span className="breadcrumb-slash">/</span><strong>{view === 'saved' ? '我的收藏' : '论文档案'}</strong></div><a className="github-link" href={githubUrl} target="_blank" rel="noreferrer"><Github size={16} /><span>GitHub</span><ArrowUpRight size={14} /></a></header>
      <main>
        <section className="page-heading"><div><div className="eyebrow"><span />THE RESEARCH JOURNAL</div><h1>{view === 'saved' ? <>值得留住的，<span>再读一遍。</span></> : <>每一篇研究，<span>都值得读懂。</span></>}</h1><p>{view === 'saved' ? '把感兴趣的研究放在这里，让好想法不再擦肩而过。' : '从论文到洞见。收集、拆解与连接，让知识慢慢生长。'}</p></div><div className="edition"><span>YOUR GROWING LIBRARY</span><div><strong>{papers.length.toString().padStart(2, '0')}</strong><span>篇阅读档案</span></div><span>{latest ? `最近收录 ${dateLabel(latest)}` : '从第一篇阅读开始'}</span></div></section>

        {isHome && featured && <section className="featured"><div className="featured-copy"><div className="featured-label"><Sparkles size={14} />从这里开始<span>EDITOR’S PICK</span></div><h2>{featured.title}</h2><p>{featured.subtitle}。{featured.summary.split('。')[0]}。</p><div className="featured-bottom"><a href={paperUrl(featured)} className="primary-link">阅读解析<ArrowRight size={16} /></a><span><Clock3 size={13} />{featured.readingMinutes} 分钟阅读</span>{featured.demo && <span className="demo-label">示例报告</span>}</div></div><div className="featured-art"><PaperPreview paper={featured} eager /></div></section>}

        <section className="archive" id="papers" aria-labelledby="archive-title">
          <div className="archive-title-row"><div className="archive-title"><h2 id="archive-title">{view === 'saved' ? '我的收藏' : '全部论文'}</h2><span>{view === 'saved' ? savedCount : papers.length}</span></div><span className="archive-note">{view === 'saved' ? '收藏保存在当前浏览器' : '让每一份思考，都有迹可循'}</span></div>
          <div className="archive-tools"><div className="search-box"><Search size={17} /><input ref={searchRef} aria-label="搜索论文" placeholder="搜索论文、关键词、作者…" value={query} onChange={e => setQuery(e.target.value)} />{query ? <button className="clear-search" aria-label="清除搜索" onClick={() => setQuery('')}><X size={15} /></button> : <kbd>⌘ K</kbd>}</div><div className="sort-box"><ArrowDownWideNarrow size={16} /><select aria-label="论文排序" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">最近收录</option><option value="oldest">最早收录</option><option value="published">发表时间</option></select><ChevronDown size={13} /></div><div className="layout-switch" aria-label="显示方式"><button aria-label="网格视图" aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')} className={layout === 'grid' ? 'active' : ''}><Grid2X2 size={17} /></button><button aria-label="列表视图" aria-pressed={layout === 'list'} onClick={() => setLayout('list')} className={layout === 'list' ? 'active' : ''}><List size={18} /></button></div></div>
          <div className="filter-row"><div className="filter-tabs" aria-label="按方向筛选">{['全部', ...categories].map(item => <button key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}{item === '全部' && <span>{view === 'saved' ? savedCount : papers.length}</span>}</button>)}</div><span className="result-count" aria-live="polite">{visible.length} 篇论文</span></div>
          {loading ? <div className="empty-state" role="status"><span className="loading-spinner" /><h3>正在打开阅读档案…</h3></div> : error ? <div className="empty-state" role="alert"><FileText size={32} /><h3>{error}</h3><button className="primary-link" onClick={() => setAttempt(attempt + 1)}>重新加载<ArrowRight size={16} /></button></div> : visible.length === 0 ? <div className="empty-state"><BookOpen size={35} /><h3>{query || category !== '全部' ? '还没有找到这篇研究' : view === 'saved' ? '为下一次阅读，留一份收藏' : '你的研究档案，从这里开始'}</h3><p>{query || category !== '全部' ? '试试其他关键词，或查看全部研究方向。' : view === 'saved' ? '点击论文卡片上的书签，把感兴趣的论文收进这里。' : '添加第一篇 HTML 报告和论文记录后，它就会出现在这里。'}</p>{(query || category !== '全部') ? <button className="text-button" onClick={() => { setQuery(''); setCategory('全部') }}>清除筛选<ArrowRight size={15} /></button> : view === 'saved' && <button className="text-button" onClick={() => navigate('library')}>探索论文档案<ArrowRight size={15} /></button>}</div> : <div className={`paper-grid ${layout === 'list' ? 'list-layout' : ''}`}>{visible.map(paper => <article className="paper-card" key={paper.id}><PaperPreview paper={paper} /><div className="paper-body"><div className="card-kicker"><span className={`category-tag category-${categories.indexOf(paper.category)}`}>{paper.category}</span><button className={`bookmark-button ${saved.includes(paper.id) ? 'is-saved' : ''}`} aria-label={`${saved.includes(paper.id) ? '取消收藏' : '收藏'} ${paper.title}`} aria-pressed={saved.includes(paper.id)} onClick={() => toggleSaved(paper)}><Bookmark size={17} fill={saved.includes(paper.id) ? 'currentColor' : 'none'} /></button></div><h3><a href={paperUrl(paper)}>{paper.title}</a></h3><p className="paper-subtitle">{paper.subtitle}</p><div className="paper-tags">{paper.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="paper-meta"><span>{dateLabel(paper.added)}</span><span className="meta-separator">·</span><span><Clock3 size={12} />{paper.readingMinutes} 分钟</span><a href={paperUrl(paper)} aria-label={`打开 ${paper.title} 解析`}><ArrowUpRight size={17} /></a></div></div></article>)}</div>}
          {!loading && !error && visible.length > 0 && <div className="end-note"><span />{query || category !== '全部' ? '以上是匹配的阅读档案' : '阅读未完，探索待续'}<span /></div>}
        </section>
        <footer className="page-footer"><span>© {new Date().getFullYear()} Metrotime<span className="footer-dot">·</span>为好奇心留一个位置</span><span>Built for curious minds<BookOpen size={14} /></span></footer>
      </main>
    </div>

    <div className={`toast ${notice ? 'visible' : ''}`} role="status">{notice && <><Check size={16} />{notice}</>}</div>
    <dialog ref={aboutRef} className="about-dialog" onClick={e => { if (e.target === e.currentTarget) aboutRef.current?.close() }}><div className="dialog-inner"><button className="icon-button dialog-close" aria-label="关闭介绍" onClick={() => aboutRef.current?.close()}><X size={20} /></button><span className="dialog-icon"><Layers3 size={26} /></span><div className="eyebrow">ABOUT METROTIME</div><h2>让阅读，留下痕迹。</h2><p>这里是你的个人论文阅读档案。每一篇论文，都可以拥有一份独立的结构化分析：研究问题、核心方法、关键结论与延伸思考。</p><div className="about-flow"><span><Search size={18} />发现论文</span><ArrowRight size={15} /><span><FileText size={18} />结构解析</span><ArrowRight size={15} /><span><BookOpen size={18} />持续阅读</span></div><p className="about-small">当前研究方向：{categories.join('、')}。研究方向与阅读报告可以持续添加。收藏仅保存在当前浏览器，不会跨设备同步。</p><p className="about-small">定时阅读与提交由外部 Codex 任务负责；本站是静态阅读入口。尚未配置定时任务。</p><a className="text-button" href={githubUrl} target="_blank" rel="noreferrer">在 GitHub 查看项目<ExternalLink size={15} /></a><button className="back-reading" onClick={() => aboutRef.current?.close()}><ArrowLeft size={15} />继续阅读</button></div></dialog>
  </>
}
