import { TOPOLOGIA_41_EQUIPMENTS } from '../../data/topologiasData'

export function TopologyEquipmentCards({ selectedEquipmentId, onSelectEquipment }) {
  const handleCardClick = (id) => {
    onSelectEquipment(id)
    // Scroll suavemente até a área do diagrama
    const diagramEl = document.getElementById('diagram-canvas-root')
    if (diagramEl) {
      diagramEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <section className="topology-equipments-section">
      <div className="equipments-section-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> Hardware Homologado</span>
          <h2>Equipamentos da Topologia</h2>
          <p>Relação de todos os componentes da rede escolar, suas funções e portas utilizadas.</p>
        </div>
      </div>

      <div className="equipments-cards-grid">
        {TOPOLOGIA_41_EQUIPMENTS.map((eq) => {
          const isActive = selectedEquipmentId === eq.id
          return (
            <div
              key={eq.id}
              className={`equipment-summary-card ${isActive ? 'is-active' : ''}`}
              onClick={() => handleCardClick(eq.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick(eq.id)
                }
              }}
            >
              <div className="card-thumb-wrap">
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="card-thumb"
                  loading="lazy"
                />
              </div>

              <div className="card-details">
                <strong>{eq.fullName || eq.name}</strong>
                <span className="card-role">{eq.role}</span>
                <p className="card-desc">{eq.description}</p>
                <div className="card-ports-tag">
                  <strong>Portas / Conexões:</strong> {eq.ports[0]}
                  {eq.ports.length > 1 && ` (+${eq.ports.length - 1} porta${eq.ports.length > 2 ? 's' : ''})`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
