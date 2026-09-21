import { ChevronRight, Home, LayoutList, X } from 'lucide-react'

export function Sidebar({ activeView, onNavigate, isOpen, onClose, categories }) {
  return (
    <>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Fechar menu" />}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>GUIA</strong>
            <span>PARALISADOS EACE</span>
          </div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Fechar menu"><X size={18} /></button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <p className="nav-label">Visão geral</p>
          <button className={`nav-item ${activeView === 'inicio' ? 'active' : ''}`} onClick={() => onNavigate('inicio')}>
            <Home size={18} /><span>Início</span>{activeView === 'inicio' && <ChevronRight size={15} />}
          </button>
          <p className="nav-label section-label">Categorias de paralisação</p>
          <button className={`nav-item ${activeView === 'paralizados' ? 'active' : ''}`} onClick={() => onNavigate('paralizados')}>
            <LayoutList size={18} /><span>Paralisados</span>{activeView === 'paralizados' && <ChevronRight size={15} />}
          </button>
          <div className="category-links">
            {categories.map((category) => {
              const Icon = category.icon
              return <button key={category.id} className={`nav-item nested ${activeView === category.id ? 'active' : ''}`} onClick={() => onNavigate(category.id)}><Icon size={16} /><span>{category.shortTitle}</span></button>
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <span className="live-dot" /> <span>Estrutura em atualização</span>
        </div>
      </aside>
    </>
  )
}
