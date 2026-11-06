import { TOPOLOGIA_41_OPERATIONAL_STEPS } from '../../data/topologiasData'

export function TopologyOperationalGuide() {
  return (
    <section className="topology-operational-section">
      <div className="equipments-section-header">
        <div>
          <span className="eyebrow"><span className="eyebrow-line" /> Fluxo de Conexão</span>
          <h2>Como a Topologia Funciona</h2>
          <p>Passo a passo operacional das interligações elétricas, de roteamento e de pontos de acesso Wi-Fi.</p>
        </div>
      </div>

      <div className="operational-steps-grid">
        {TOPOLOGIA_41_OPERATIONAL_STEPS.map((item) => (
          <div key={item.step} className="operational-step-card">
            <span className="step-number-badge">0{item.step}</span>
            <div className="step-text">
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
