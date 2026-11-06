import { useState } from 'react'
import { ArrowLeft, ArrowRight, Network, Clock3 } from 'lucide-react'
import { TopologyDiagram } from '../../components/topologias/TopologyDiagram'
import { TopologyLegend } from '../../components/topologias/TopologyLegend'
import { TopologyEquipmentCards } from '../../components/topologias/TopologyEquipmentCards'
import { TopologyOperationalGuide } from '../../components/topologias/TopologyOperationalGuide'
import '../../styles/topologias.css'

export function Topologia41({ onBack }) {
  const [activeMode, setActiveMode] = useState('sem-switch') // 'sem-switch' ou 'com-switch'
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null)

  return (
    <div className="topologia-page">
      {onBack && (
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={16} /> Voltar para início
        </button>
      )}

      {/* Header da Página com Breadcrumb */}
      <div className="topologia-header">
        <div className="topologia-breadcrumb-bar">
          <span>Topologias</span>
          <span className="crumb-sep">/</span>
          <span>Topologia 4.1</span>
          <span className="crumb-sep">/</span>
          <span className="crumb-active">
            {activeMode === 'sem-switch' ? 'Sem Switch' : 'Com Switch'}
          </span>
        </div>

        <div className="topologia-title-row">
          <div>
            <span className="eyebrow"><span className="eyebrow-line" /> Infraestrutura de Rede</span>
            <h1>
              TOPOLOGIA 4.1 {activeMode === 'sem-switch' ? '— SEM SWITCH' : '— COM SWITCH'}
            </h1>
            <p>
              {activeMode === 'sem-switch'
                ? 'Diagrama de conexão e distribuição dos equipamentos de rede da unidade escolar.'
                : 'Configuração de topologia 4.1 com switch dedicado.'}
            </p>
          </div>
          <div className="topologia-badge">
            <Network size={14} /> EACE • Padrão 4.1
          </div>
        </div>
      </div>

      {/* Seletor entre COM SWITCH e SEM SWITCH */}
      <section className="topology-mode-selector">
        <div className="topology-mode-selector-heading">
          <span>Escolha a configuração da rede:</span>
          {activeMode === 'sem-switch' && (
            <span style={{ color: 'var(--accent)', textTransform: 'none' }}>
              ✓ Exibindo topologia completa homologada
            </span>
          )}
        </div>

        <div className="topology-mode-grid">
          {/* Card COM SWITCH */}
          <button
            className={`topology-mode-card ${activeMode === 'com-switch' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveMode('com-switch')
              setSelectedEquipmentId(null)
            }}
          >
            <div className="topology-mode-info">
              <strong>COM SWITCH</strong>
              <span>Topologia estruturada com switch de distribuição</span>
            </div>
            <span className="topology-mode-arrow">
              Acessar topologia <ArrowRight size={14} />
            </span>
          </button>

          {/* Card SEM SWITCH */}
          <button
            className={`topology-mode-card ${activeMode === 'sem-switch' ? 'is-active' : ''}`}
            onClick={() => setActiveMode('sem-switch')}
          >
            <div className="topology-mode-info">
              <strong>SEM SWITCH</strong>
              <span>Conexão direta nas portas do Firewall e OC200</span>
            </div>
            <span className="topology-mode-arrow">
              Acessar topologia <ArrowRight size={14} />
            </span>
          </button>
        </div>
      </section>

      {/* Conteúdo Dinâmico Baseado na Opção Selecionada */}
      {activeMode === 'sem-switch' ? (
        <>
          {/* 1. Diagrama Gráfico Interativo */}
          <TopologyDiagram
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={setSelectedEquipmentId}
          />

          {/* 2. Legenda Visual */}
          <TopologyLegend />

          {/* 3. Painel de Equipamentos */}
          <TopologyEquipmentCards
            selectedEquipmentId={selectedEquipmentId}
            onSelectEquipment={setSelectedEquipmentId}
          />

          {/* 4. Como a Topologia Funciona (Passo a Passo) */}
          <TopologyOperationalGuide />
        </>
      ) : (
        /* Estrutura visual da opção COM SWITCH */
        <div className="topology-placeholder-card">
          <div className="placeholder-icon-wrap">
            <Clock3 size={28} />
          </div>
          <h2>Topologia 4.1 — Com Switch</h2>
          <p>Esta topologia estará disponível em breve.</p>
        </div>
      )}
    </div>
  )
}
