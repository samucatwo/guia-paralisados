import { ArrowRight } from 'lucide-react'

export function TopologyLegend() {
  return (
    <div className="topology-legend-card">
      <div className="legend-title">Legenda de Conexões</div>
      <div className="legend-items-grid">
        <div className="legend-item">
          <span className="legend-swatch network" />
          <span><strong>Conexão de rede / Ethernet</strong> (Cabos RJ45 / Dados)</span>
        </div>

        <div className="legend-item">
          <span className="legend-swatch poe" />
          <span><strong>Conexão PoE</strong> (Dados + Energia via Injetor)</span>
        </div>

        <div className="legend-item">
          <span className="legend-swatch power" />
          <span><strong>Alimentação elétrica</strong> (Régua / Nobreak NHS)</span>
        </div>

        <div className="legend-item">
          <span className="legend-swatch arrow"><ArrowRight size={16} /></span>
          <span><strong>Sentido do fluxo</strong> (Distribuição lógica)</span>
        </div>
      </div>
    </div>
  )
}
