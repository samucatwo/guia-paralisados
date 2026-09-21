import { Menu, Moon, Search, Sun } from 'lucide-react'

export function Header({ theme, onToggleTheme, onOpenMenu, searchTerm, onSearch }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-trigger" onClick={onOpenMenu} aria-label="Abrir menu"><Menu size={20} /></button>
      <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>Guia operacional</strong></div>
      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input value={searchTerm} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar categoria..." aria-label="Buscar categoria" />
          <kbd>⌘ K</kbd>
        </label>
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Ativar tema ${theme === 'dark' ? 'claro' : 'escuro'}`}>
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}<span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
        </button>
      </div>
    </header>
  )
}
