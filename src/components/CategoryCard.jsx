import { ArrowUpRight, CheckCircle2 } from 'lucide-react'

export function CategoryCard({ category, onOpen }) {
  const Icon = category.icon
  return (
    <article className={`category-card ${category.accent}`}>
      <div className="card-topline"><div className="category-icon"><Icon size={19} /></div><span className="status-pill"><CheckCircle2 size={13} /> Em preparação</span></div>
      <div className="card-content"><h3>{category.title}</h3><p>{category.description}</p></div>
      <button className="card-link" onClick={onOpen}>Consultar guia <ArrowUpRight size={16} /></button>
    </article>
  )
}
