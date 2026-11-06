import { useState } from 'react'
import {
  Camera,
  ChevronDown,
  ChevronRight,
  Home,
  LayoutList,
  Network,
  StickyNote,
  X,
} from 'lucide-react'

export function Sidebar({ activeView, onNavigate, isOpen, onClose, categories }) {
  const isTopologiaActive = activeView.startsWith('topologia')
  const [isTopologiasManualToggle, setIsTopologiasManualToggle] = useState(null)

  // Expansão derivada: se o usuário alternar manualmente, respeitamos; senão abre se a rota for topologia
  const isTopologiasOpen =
    isTopologiasManualToggle !== null ? isTopologiasManualToggle : isTopologiaActive

  const toggleTopologias = () => {
    setIsTopologiasManualToggle(!isTopologiasOpen)
  }

  return (
    <>
      {isOpen && <button className="sidebar-overlay" onClick={onClose} aria-label="Fechar menu" />}
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">E</div>
          <div>
            <strong>GUIA EACE</strong>
            <span>ORIENTAÇÃO OPERACIONAL</span>
          </div>
          <button className="icon-button mobile-close" onClick={onClose} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          <p className="nav-label">Visão geral</p>
          <button
            className={`nav-item ${activeView === 'inicio' ? 'active' : ''}`}
            onClick={() => onNavigate('inicio')}
          >
            <Home size={18} />
            <span>Início</span>
            {activeView === 'inicio' && <ChevronRight size={15} />}
          </button>

          <p className="nav-label section-label">Categorias de paralisação</p>
          <button
            className={`nav-item ${activeView === 'paralizados' ? 'active' : ''}`}
            onClick={() => onNavigate('paralizados')}
          >
            <LayoutList size={18} />
            <span>Paralisados</span>
            {activeView === 'paralizados' && <ChevronRight size={15} />}
          </button>
          <div className="category-links">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  className={`nav-item nested ${activeView === category.id ? 'active' : ''}`}
                  onClick={() => onNavigate(category.id)}
                >
                  <Icon size={16} />
                  <span>{category.shortTitle}</span>
                </button>
              )
            })}
          </div>

          <p className="nav-label section-label">Ferramentas & Recursos</p>
          <button
            className={`nav-item notes-nav-item ${activeView === 'notas' ? 'active' : ''}`}
            onClick={() => onNavigate('notas')}
          >
            <StickyNote size={18} />
            <span>Notas</span>
            {activeView === 'notas' && <ChevronRight size={15} />}
          </button>

          <button
            className={`nav-item timestamp-nav-item ${activeView === 'timestamp' ? 'active' : ''}`}
            onClick={() => onNavigate('timestamp')}
          >
            <Camera size={18} />
            <span>Timestamp Fotográfico</span>
            {activeView === 'timestamp' && <ChevronRight size={15} />}
          </button>

          {/* NOVO MENU LATERAL: TOPOLOGIAS (Expansível / Retrátil) */}
          <button
            className={`nav-item topologias-nav-item ${isTopologiaActive ? 'active' : ''}`}
            onClick={toggleTopologias}
            aria-expanded={isTopologiasOpen}
          >
            <Network size={18} />
            <span>Topologias</span>
            {isTopologiasOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </button>

          {isTopologiasOpen && (
            <div className="category-links topologias-sublinks">
              <button
                className={`nav-item nested ${activeView === 'topologia-4-1' ? 'active' : ''}`}
                onClick={() => onNavigate('topologia-4-1')}
              >
                <span>Topologia 4.1</span>
              </button>

              <button
                className={`nav-item nested ${activeView === 'topologia-4-2' ? 'active' : ''}`}
                onClick={() => onNavigate('topologia-4-2')}
              >
                <span>Topologia 4.2</span>
              </button>

              <button
                className={`nav-item nested ${activeView === 'topologia-5-0' ? 'active' : ''}`}
                onClick={() => onNavigate('topologia-5-0')}
              >
                <span>Topologia 5.0</span>
              </button>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <span className="live-dot" /> <span>Estrutura em atualização</span>
        </div>
      </aside>
    </>
  )
}
