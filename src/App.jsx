import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, ClipboardCheck, Clock3, Info, ListChecks, Search, ShieldCheck } from 'lucide-react'
import { CategoryCard } from './components/CategoryCard'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { categories } from './data/paralizados'
import { ReformaEscolar } from './pages/ReformaEscolar'
import { EscolaDesativada } from './pages/EscolaDesativada'
import { MudancaEndereco } from './pages/MudancaEndereco'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('inicio')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('eace-theme') || 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('eace-theme', theme)
  }, [theme])

  const filteredCategories = useMemo(() => categories.filter((category) => `${category.title} ${category.description}`.toLowerCase().includes(searchTerm.toLowerCase())), [searchTerm])
  const navigate = (view) => { setActiveView(view); setIsSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const activeCategory = categories.find((category) => category.id === activeView)

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={navigate} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} categories={categories} />
      <div className="main-shell">
        <Header theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onOpenMenu={() => setIsSidebarOpen(true)} searchTerm={searchTerm} onSearch={setSearchTerm} />
        <main className="main-content">
          {activeView === 'reforma-escolar' ? <ReformaEscolar onBack={() => navigate('paralizados')} /> : activeView === 'escola-desativada' ? <EscolaDesativada onBack={() => navigate('paralizados')} /> : activeView === 'mudanca-endereco' ? <MudancaEndereco onBack={() => navigate('paralizados')} /> : activeCategory ? <CategoryPage category={activeCategory} onBack={() => navigate('inicio')} /> : activeView === 'paralizados' ? <CategoriesPage categories={filteredCategories} onOpen={navigate} searchTerm={searchTerm} /> : <HomePage categories={filteredCategories} onOpen={navigate} />}
        </main>
        <footer className="footer"><span>GUIA PARALISADOS EACE</span><span>Base estrutural v1.0</span></footer>
      </div>
    </div>
  )
}

function HomePage({ categories: visibleCategories, onOpen }) {
  return <>
    <section className="welcome-block"><div className="eyebrow"><span className="eyebrow-line" /> Central de orientação</div><h1>Guia de <em>paralisados</em><br />do projeto EACE.</h1><p>Consulte rapidamente a estrutura de atendimento para cada situação e acompanhe o que precisa ser organizado.</p></section>
    <section className="metrics-row"><div className="metric-card accent-metric"><span className="metric-icon"><BookOpen size={18} /></span><strong>03</strong><span>Categorias disponíveis</span></div><div className="metric-card"><span className="metric-icon"><ClipboardCheck size={18} /></span><strong>—</strong><span>Procedimentos publicados</span></div><div className="metric-card"><span className="metric-icon"><Clock3 size={18} /></span><strong>Em breve</strong><span>Conteúdo operacional</span></div></section>
    <div className="section-heading"><div><span className="eyebrow">Navegação rápida</span><h2>Categorias de paralisação</h2></div><button className="text-button" onClick={() => onOpen('paralizados')}>Ver todas <ArrowLeft size={15} className="rotate-180" /></button></div>
    <div className="category-grid">{visibleCategories.map((category) => <CategoryCard key={category.id} category={category} onOpen={() => onOpen(category.id)} />)}</div>
  </>
}

function CategoriesPage({ categories: visibleCategories, onOpen, searchTerm }) {
  return <><PageIntro eyebrow="Paralisados" title="Categorias de atendimento" description="Selecione uma situação para acessar sua estrutura de orientação." icon={<ListChecks size={22} />} />{visibleCategories.length ? <div className="category-grid">{visibleCategories.map((category) => <CategoryCard key={category.id} category={category} onOpen={() => onOpen(category.id)} />)}</div> : <EmptyState searchTerm={searchTerm} />}</>
}

function CategoryPage({ category, onBack }) {
  const Icon = category.icon
  return <><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Voltar para início</button><PageIntro eyebrow="Categoria de paralisação" title={category.title} description={category.description} icon={<Icon size={22} />} /><div className="procedure-layout"><section className="empty-procedure"><div className={`large-category-icon ${category.accent}`}><Icon size={28} /></div><h2>Conteúdo do procedimento será disponibilizado em breve.</h2><p>Esta página já está preparada para receber as orientações oficiais desta categoria.</p><div className="notice"><Info size={17} /><span>Nenhuma regra, prazo ou exigência foi adicionada nesta versão.</span></div></section><aside className="future-structure"><div className="aside-heading"><ShieldCheck size={17} /><span>Estrutura prevista</span></div>{category.fields.map((field) => <div className="structure-row" key={field}><span>{field}</span><span className="pending-dot" /></div>)}</aside></div></>
}

function PageIntro({ eyebrow, title, description, icon }) { return <div className="page-intro"><div className="page-intro-icon">{icon}</div><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></div> }
function EmptyState({ searchTerm }) { return <div className="empty-state"><Search size={22} /><h2>Nenhuma categoria encontrada</h2><p>Não há resultados para “{searchTerm}”.</p></div> }

export default App
