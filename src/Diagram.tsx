import { useId } from 'react'
import type { Visual } from './papers'

// Vector sketches illustrate concepts; they are not figures from the papers.
export default function Diagram({ kind = 'attention' }: { kind?: Visual }) {
  const patternId = useId()
  return <svg viewBox="0 0 360 150" fill="none" aria-hidden="true" className={`diagram diagram-${kind}`}>
    <defs><pattern id={patternId} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" opacity=".18" /></pattern></defs>
    <rect width="360" height="150" fill={`url(#${patternId})`} />
    {kind === 'attention' && <>
      {[74, 144, 214, 284].map((x, i) => <g key={x}>{[74, 144, 214, 284].map((end, j) => <path key={end} d={`M${x} 108 Q${180 + (i-j)*12} ${55 + Math.abs(i-j)*8} ${end} 43`} stroke="currentColor" opacity={i === j ? '.6' : '.17'} strokeWidth={i === j ? '1.6' : '1'} />)}<rect x={x-23} y="108" width="46" height="22" rx="5" fill="currentColor" opacity=".13" /><rect x={x-23} y="20" width="46" height="23" rx="5" fill="currentColor" opacity={.32 + i*.13} /><text x={x} y="123" textAnchor="middle">{['All', 'you', 'need', '.'][i]}</text></g>)}
      <text x="180" y="79" textAnchor="middle" className="diagram-equation">Attention(Q, K, V)</text>
    </>}
    {kind === 'lora' && <>
      <rect x="55" y="37" width="64" height="77" rx="5" fill="currentColor" opacity=".12" />
      <path d="M71 37v77m16-77v77m16-77v77M55 56h64M55 75h64M55 94h64" stroke="currentColor" opacity=".2" />
      <text x="87" y="134" textAnchor="middle">W₀ · frozen</text><text x="142" y="83" className="diagram-equation">+</text>
      <rect x="178" y="37" width="16" height="77" rx="3" fill="currentColor" opacity=".55" /><text x="186" y="133" textAnchor="middle">B</text>
      <text x="211" y="83" className="diagram-equation">×</text><rect x="245" y="66" width="64" height="17" rx="3" fill="currentColor" opacity=".55" /><text x="277" y="105" textAnchor="middle">A</text>
      <text x="235" y="27" textAnchor="middle" letterSpacing="2">LOW-RANK UPDATE</text>
    </>}
    {kind === 'vit' && <>
      {Array.from({length:16}, (_, i) => <rect key={i} x={48 + (i%4)*20} y={33+Math.floor(i/4)*20} width="17" height="17" rx="2" fill="currentColor" opacity={.12+(i%5)*.12} />)}
      <path d="M144 73h34m-5-5 6 5-6 5" stroke="currentColor" opacity=".6" />
      {[0,1,2,3,4,5].map(i => <rect key={i} x={197+i*17} y="35" width="12" height="19" rx="2" fill="currentColor" opacity={.2+i*.1} />)}
      <path d="M245 62v16m-4-5 4 5 4-5" stroke="currentColor" />
      <rect x="184" y="87" width="122" height="29" rx="5" stroke="currentColor" opacity=".5" /><text x="245" y="106" textAnchor="middle">Transformer</text><text x="86" y="133" textAnchor="middle">16 × 16 patches</text>
    </>}
    {kind === 'rag' && <>
      <rect x="34" y="59" width="64" height="31" rx="5" stroke="currentColor" opacity=".5" /><text x="66" y="79" textAnchor="middle">Query</text>
      <path d="M105 75h30m-5-5 5 5-5 5M225 75h30m-5-5 5 5-5 5" stroke="currentColor" opacity=".6" />
      {[0,1,2].map(i => <rect key={i} x={153+i*5} y={44-i*6} width="51" height="65" rx="4" fill="var(--diagram-bg)" stroke="currentColor" opacity=".65" />)}
      <path d="M171 47h22m-22 10h22m-22 10h14" stroke="currentColor" opacity=".6" /><text x="183" y="134" textAnchor="middle">Retrieve knowledge</text>
      <rect x="266" y="59" width="64" height="31" rx="5" fill="currentColor" opacity=".15" /><text x="298" y="79" textAnchor="middle">Generate</text>
    </>}
    {kind === 'dpo' && <>
      <path d="M47 123h273M60 126V27" stroke="currentColor" opacity=".22" />
      <path d="M61 111C117 111 128 107 163 75S223 36 310 33" stroke="currentColor" strokeWidth="2.4" />
      <path d="M61 58C123 60 130 83 184 95S253 111 310 114" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" opacity=".45" />
      <circle cx="231" cy="41" r="5" fill="currentColor" /><text x="242" y="66">preferred y⁺</text><text x="218" y="100" opacity=".6">rejected y⁻</text><text x="75" y="29" letterSpacing="1">PREFERENCE → ALIGNMENT</text>
    </>}
    {kind === 'resnet' && <>
      <path d="M37 84h286m-6-5 6 5-6 5M71 83V33h208v40m-5-5 5 5 5-5" stroke="currentColor" opacity=".5" />
      <rect x="105" y="64" width="60" height="40" rx="5" fill="var(--diagram-bg)" stroke="currentColor" opacity=".8" /><rect x="185" y="64" width="60" height="40" rx="5" fill="var(--diagram-bg)" stroke="currentColor" opacity=".8" />
      <circle cx="279" cy="84" r="10" fill="var(--diagram-bg)" stroke="currentColor" /><text x="279" y="89" textAnchor="middle">+</text><text x="135" y="89" textAnchor="middle">weight</text><text x="215" y="89" textAnchor="middle">weight</text><text x="174" y="24" textAnchor="middle">identity shortcut</text><text x="174" y="133" textAnchor="middle" className="diagram-equation">y = F(x) + x</text>
    </>}
  </svg>
}
