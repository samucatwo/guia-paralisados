import { useState, useRef } from 'react'
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  X,
  Cable,
} from 'lucide-react'
import { TOPOLOGIA_41_EQUIPMENTS, TOPOLOGIA_41_CONNECTIONS } from '../../data/topologiasData'
import { TopologyEquipmentNode } from './TopologyEquipmentNode'

export function TopologyDiagram({ selectedEquipmentId, onSelectEquipment }) {
  const [filterMode, setFilterMode] = useState('all') // 'all', 'network', 'power'
  const [hoveredEquipmentId, setHoveredEquipmentId] = useState(null)
  const [hoveredConnectionId, setHoveredConnectionId] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const diagramRef = useRef(null)

  const activeEquipmentId = selectedEquipmentId || hoveredEquipmentId

  // Equipamento em foco
  const activeEquipment = TOPOLOGIA_41_EQUIPMENTS.find(
    (e) => e.id === activeEquipmentId
  )

  // Conexão em foco
  const activeConnection = TOPOLOGIA_41_CONNECTIONS.find(
    (c) => c.id === hoveredConnectionId
  )

  // Determinar se uma conexão está ativa / destacada
  const isConnectionActive = (conn) => {
    if (hoveredConnectionId === conn.id) return true
    if (activeEquipmentId) {
      return conn.from === activeEquipmentId || conn.to === activeEquipmentId
    }
    return false
  }

  // Determinar visibilidade da conexão de acordo com o filtro
  const isConnectionVisible = (conn) => {
    if (filterMode === 'all') return true
    if (filterMode === 'network') return conn.type === 'network' || conn.type === 'poe'
    if (filterMode === 'power') return conn.type === 'power'
    return true
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    if (diagramRef.current) {
      diagramRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="diagram-container-card" id="diagram-canvas-root">
      {/* Barra de Ferramentas do Diagrama */}
      <div className="diagram-toolbar">
        <div className="diagram-filter-group">
          <span className="diagram-filter-btn" style={{ cursor: 'default', background: 'transparent', borderColor: 'transparent' }}>
            <SlidersHorizontal size={14} /> <strong>Exibir:</strong>
          </span>

          <button
            className={`diagram-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
            title="Exibir circuitos de dados, PoE e elétricos"
          >
            <span className="filter-dot all" /> Todas as Conexões
          </button>

          <button
            className={`diagram-filter-btn ${filterMode === 'network' ? 'active' : ''}`}
            onClick={() => setFilterMode('network')}
            title="Exibir somente conexões de dados Ethernet e PoE"
          >
            <span className="filter-dot network" /> Somente Rede & PoE
          </button>

          <button
            className={`diagram-filter-btn ${filterMode === 'power' ? 'active' : ''}`}
            onClick={() => setFilterMode('power')}
            title="Exibir somente conexões de alimentação elétrica"
          >
            <span className="filter-dot power" /> Somente Elétrica
          </button>
        </div>

        <div className="diagram-zoom-controls">
          <button
            className="diagram-action-btn"
            onClick={() => setZoomLevel((prev) => Math.max(0.75, Number((prev - 0.1).toFixed(2))))}
            title="Diminuir visualização"
          >
            <Minimize2 size={13} />
          </button>
          <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '42px', textAlign: 'center', color: 'var(--text-soft)' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            className="diagram-action-btn"
            onClick={() => setZoomLevel((prev) => Math.min(1.3, Number((prev + 0.1).toFixed(2))))}
            title="Aumentar visualização"
          >
            <Maximize2 size={13} />
          </button>
          <button
            className="diagram-action-btn"
            onClick={handleResetZoom}
            title="Restaurar tamanho original"
          >
            <RotateCcw size={13} /> Ajustar
          </button>
        </div>
      </div>

      {/* Área de Visualização com Scroll Horizontal */}
      <div className="diagram-viewport" ref={diagramRef}>
        <div
          className="diagram-canvas-wrap"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            marginBottom: zoomLevel < 1 ? `-${(1 - zoomLevel) * 740}px` : `${(zoomLevel - 1) * 740}px`,
            marginRight: zoomLevel < 1 ? `-${(1 - zoomLevel) * 1200}px` : `${(zoomLevel - 1) * 1200}px`,
          }}
        >
          {/* Camada SVG de Conexões */}
          <svg className="diagram-svg-layer" viewBox="0 0 1200 740">
            <defs>
              <marker
                id="arrow-network"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
              </marker>

              <marker
                id="arrow-poe"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>

              <marker
                id="arrow-power"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Linhas de Conexão */}
            {TOPOLOGIA_41_CONNECTIONS.map((conn) => {
              const visible = isConnectionVisible(conn)
              if (!visible) return null

              const isActive = isConnectionActive(conn)
              const hasActiveFocus = Boolean(activeEquipmentId || hoveredConnectionId)
              const isDimmed = hasActiveFocus && !isActive

              const badgeWidth = Math.max(76, conn.label.length * 6.5 + 18)
              const badgeHeight = 22

              return (
                <g key={conn.id}>
                  {/* Linha visível */}
                  <path
                    d={conn.path}
                    className={`conn-line ${conn.type} ${isActive ? 'is-highlighted' : ''} ${
                      isDimmed ? 'is-dimmed' : ''
                    }`}
                    markerEnd={`url(#${conn.marker})`}
                    onMouseEnter={() => setHoveredConnectionId(conn.id)}
                    onMouseLeave={() => setHoveredConnectionId(null)}
                  />

                  {/* Badge de identificação da porta / fluxo */}
                  {conn.labelPos && (
                    <g
                      className={`conn-label-group ${isActive ? 'is-highlighted' : ''}`}
                      transform={`translate(${conn.labelPos.x}, ${conn.labelPos.y})`}
                      onMouseEnter={() => setHoveredConnectionId(conn.id)}
                      onMouseLeave={() => setHoveredConnectionId(null)}
                    >
                      <rect
                        x={-badgeWidth / 2}
                        y={-badgeHeight / 2}
                        width={badgeWidth}
                        height={badgeHeight}
                        className={`conn-badge-rect ${conn.type}`}
                      />
                      <text className={`conn-badge-text ${conn.type}`}>{conn.label}</text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Nós de Equipamentos */}
          {TOPOLOGIA_41_EQUIPMENTS.map((eq) => {
            const isHovered = hoveredEquipmentId === eq.id
            const isSelected = selectedEquipmentId === eq.id
            const hasFocus = Boolean(activeEquipmentId || hoveredConnectionId)

            let isDimmed = false
            if (hasFocus) {
              if (activeEquipmentId) {
                // Dimmed se não for o próprio nem conectado ao ativo
                const isConnected = TOPOLOGIA_41_CONNECTIONS.some(
                  (c) =>
                    (c.from === activeEquipmentId && c.to === eq.id) ||
                    (c.to === activeEquipmentId && c.from === eq.id)
                )
                isDimmed = eq.id !== activeEquipmentId && !isConnected
              } else if (activeConnection) {
                // Dimmed se não for parte da conexão destacada
                isDimmed = eq.id !== activeConnection.from && eq.id !== activeConnection.to
              }
            }

            return (
              <TopologyEquipmentNode
                key={eq.id}
                equipment={eq}
                isHovered={isHovered}
                isSelected={isSelected}
                isDimmed={isDimmed}
                onMouseEnter={() => setHoveredEquipmentId(eq.id)}
                onMouseLeave={() => setHoveredEquipmentId(null)}
                onClick={() => {
                  if (selectedEquipmentId === eq.id) {
                    onSelectEquipment(null)
                  } else {
                    onSelectEquipment(eq.id)
                  }
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Inspector Flutuante do Equipamento Selecionado ou em Hover */}
      {activeEquipment && (
        <div className="diagram-inspector">
          <div className="inspector-header">
            <div>
              <span className="node-badge" style={{ marginBottom: '4px', display: 'inline-block' }}>
                {activeEquipment.badge}
              </span>
              <strong>{activeEquipment.fullName || activeEquipment.name}</strong>
            </div>
            {selectedEquipmentId && (
              <button
                className="inspector-close"
                onClick={() => onSelectEquipment(null)}
                aria-label="Fechar detalhes"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="inspector-desc">{activeEquipment.description}</p>
          <span className="inspector-ports-title">Portas / Ligações Utilizadas:</span>
          <ul className="inspector-ports-list">
            {activeEquipment.ports.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Inspector Flutuante de Conexão */}
      {activeConnection && (
        <div className="connection-inspector">
          <div className="connection-inspector-title">
            <Cable size={14} /> Detalhes da Conexão
          </div>
          <div className="connection-inspector-row">
            <span>Origem:</span>
            <strong>{activeConnection.originName}</strong>
          </div>
          <div className="connection-inspector-row">
            <span>Porta / Rótulo:</span>
            <strong style={{ color: 'var(--accent)' }}>{activeConnection.port}</strong>
          </div>
          <div className="connection-inspector-row">
            <span>Destino:</span>
            <strong>{activeConnection.destName}</strong>
          </div>
          <div className="connection-inspector-row">
            <span>Tipo de Link:</span>
            <strong style={{ textTransform: 'capitalize' }}>
              {activeConnection.type === 'network'
                ? 'Rede Ethernet'
                : activeConnection.type === 'poe'
                ? 'PoE (Dados + Energia)'
                : 'Alimentação Elétrica'}
            </strong>
          </div>
        </div>
      )}
    </div>
  )
}
