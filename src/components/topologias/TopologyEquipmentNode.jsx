export function TopologyEquipmentNode({
  equipment,
  isHovered,
  isSelected,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) {
  const { coords, name, model, image, badge, isCentral } = equipment

  return (
    <div
      id={`node-${equipment.id}`}
      className={`equipment-node ${isCentral ? 'central-node' : ''} ${
        isHovered ? 'is-hovered' : ''
      } ${isSelected ? 'is-selected' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      style={{
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        width: `${coords.width}px`,
        height: `${coords.height}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Equipamento: ${name}`}
    >
      <div className="node-header">
        <span className="node-badge">{badge || 'Equipamento'}</span>
      </div>

      <div className="node-image-container">
        <img
          src={image}
          alt={name}
          className="node-image"
          loading="lazy"
        />
      </div>

      <div className="node-footer">
        <strong className="node-name" title={name}>{name}</strong>
        <span className="node-subtext" title={model}>{model}</span>
      </div>
    </div>
  )
}

