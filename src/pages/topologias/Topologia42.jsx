import { ArrowLeft, Clock3, Network } from 'lucide-react'
import '../../styles/topologias.css'

export function Topologia42({ onBack }) {
  return (
    <div className="topologia-page">
      {onBack && (
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar para início
        </button>
      )}

      <div className="topologia-header">
        <div className="topologia-breadcrumb-bar">
          <span>Topologias</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">Topologia 4.2</span>
        </div>

        <div className="topologia-title-row">
          <div>
            <span className="eyebrow"><span className="eyebrow-line" /> Infraestrutura de Rede</span>
            <h1>Topologia 4.2</h1>
            <p>Diagrama de conexão e distribuição de rede da unidade escolar.</p>
          </div>
          <div className="topologia-badge">
            <Network size={14} /> EACE • Padrão 4.2
          </div>
        </div>
      </div>

      <div className="topology-placeholder-card">
        <div className="placeholder-icon-wrap">
          <Clock3 size={28} />
        </div>
        <h2>Topologia 4.2</h2>
        <p>Esta topologia estará disponível em breve.</p>
      </div>
    </div>
  )
}

