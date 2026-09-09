import { useState } from 'react'
import { FileImage } from 'lucide-react'
import { paperUrl, previewUrl, type Paper } from './papers'

export default function PaperPreview({ paper, eager = false }: { paper: Paper; eager?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const src = previewUrl(paper)

  return (
    <figure className="model-preview">
      <a className="model-preview-image" href={paperUrl(paper)} aria-label={`阅读 ${paper.title}`}>
        {failedSource === src ? (
          <span className="preview-unavailable"><FileImage size={25} />架构图暂不可用<span>打开报告查看</span></span>
        ) : (
          <img src={src} alt={paper.previewImage.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailedSource(src)} />
        )}
      </a>
      <figcaption>
        <span>模型架构</span>
        <a href={paper.previewImage.sourceUrl} target="_blank" rel="noreferrer">{paper.previewImage.sourceLabel} ↗</a>
      </figcaption>
    </figure>
  )
}
