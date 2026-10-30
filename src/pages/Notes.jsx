import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, Check, Clipboard, Plus, Search, StickyNote, X } from 'lucide-react'
import { failures } from '../data/failures'
import { getSupabaseClient } from '../lib/supabaseClient'
import './notes.css'

const notesQuery = `
  id,
  failure,
  tag_id,
  content,
  created_at,
  tag:tags(name)
`

async function fetchNotesAndTags() {
  const supabase = getSupabaseClient()
  const [tagResult, noteResult] = await Promise.all([
    supabase.from('tags').select('id, name').order('name', { ascending: true }),
    supabase.from('notes').select(notesQuery).order('created_at', { ascending: false }),
  ])

  if (tagResult.error) throw tagResult.error
  if (noteResult.error) throw noteResult.error

  return { tags: tagResult.data ?? [], notes: noteResult.data ?? [] }
}

export function Notes() {
  const [notes, setNotes] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [failureFilter, setFailureFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [selectedTagId, setSelectedTagId] = useState('')
  const [tagCreatedNotice, setTagCreatedNotice] = useState(false)
  const [notice, setNotice] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const result = await fetchNotesAndTags()
      setTags(result.tags)
      setNotes(result.notes)
    } catch (error) {
      console.error('Não foi possível carregar as notas e tags do Supabase.', error)
      setLoadError('Não foi possível carregar as notas. Verifique a conexão com o banco de dados.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    fetchNotesAndTags()
      .then(({ tags: loadedTags, notes: loadedNotes }) => {
        if (!isCurrent) return
        setTags(loadedTags)
        setNotes(loadedNotes)
      })
      .catch((error) => {
        if (!isCurrent) return
        console.error('Não foi possível carregar as notas e tags do Supabase.', error)
        setLoadError('Não foi possível carregar as notas. Verifique a conexão com o banco de dados.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const filteredNotes = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase('pt-BR')
    return notes.filter((note) => {
      const tagName = note.tag?.name ?? ''
      const matchesSearch = !searchTerm || `${note.content} ${note.failure} ${tagName}`.toLocaleLowerCase('pt-BR').includes(searchTerm)
      return matchesSearch && (!failureFilter || note.failure === failureFilter) && (!tagFilter || note.tag_id === tagFilter)
    })
  }, [notes, search, failureFilter, tagFilter])

  const openNoteForm = async () => {
    setLoadError('')
    try {
      const { data, error } = await getSupabaseClient().from('tags').select('id, name').order('name', { ascending: true })
      if (error) throw error
      setTags(data ?? [])
      setSelectedTagId('')
      setTagCreatedNotice(false)
      setIsNoteFormOpen(true)
    } catch (error) {
      console.error('Não foi possível carregar as tags para o formulário.', error)
      setLoadError('Não foi possível carregar as tags. Verifique a conexão com o banco de dados.')
    }
  }

  const handleTagCreated = (tag) => {
    setTags((currentTags) => [...currentTags, tag].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
    setSelectedTagId(tag.id)
    setTagCreatedNotice(true)
    setIsTagModalOpen(false)
    setNotice('Tag cadastrada com sucesso!')
  }

  const handleNoteCreated = async () => {
    setIsNoteFormOpen(false)
    setSelectedTagId('')
    setNotice('Nota cadastrada com sucesso!')
    await loadData()
  }

  return (
    <section className="notes-page">
      <div className="notes-page-heading">
        <div className="notes-intro">
          <div className="notes-title-icon"><StickyNote size={21} /></div>
          <div>
            <span className="eyebrow">GUIA EACE</span>
            <h1>NOTAS</h1>
            <p>Central de notas técnicas e orientações para consulta.</p>
          </div>
        </div>
        <button className="notes-primary-button" onClick={openNoteForm}><Plus size={17} /> NOVA NOTA</button>
      </div>

      <div className="notes-toolbar">
        <label className="notes-search">
          <Search size={17} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar notas..." aria-label="Pesquisar notas" />
        </label>
        <label className="notes-filter">
          <span className="visually-hidden">Filtrar por falha</span>
          <select value={failureFilter} onChange={(event) => setFailureFilter(event.target.value)}>
            <option value="">Todas as falhas</option>
            {failures.map((failure) => <option key={failure} value={failure}>{failure}</option>)}
          </select>
        </label>
        <label className="notes-filter">
          <span className="visually-hidden">Filtrar por tag</span>
          <select value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
            <option value="">Todas as tags</option>
            {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
          </select>
        </label>
      </div>

      {notice && <div className="notes-notice" role="status"><Check size={16} />{notice}</div>}
      {loadError && <div className="notes-error" role="alert"><AlertCircle size={17} />{loadError}<button onClick={loadData}>Tentar novamente</button></div>}

      {isLoading ? <div className="notes-empty-state" role="status">Carregando notas...</div> : loadError ? null : notes.length === 0 ? (
        <div className="notes-empty-state">
          <StickyNote size={26} />
          <h2>Ainda não existem notas cadastradas.</h2>
          <button className="notes-primary-button" onClick={openNoteForm}><Plus size={16} /> CRIAR PRIMEIRA NOTA</button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="notes-empty-state">
          <Search size={25} />
          <h2>Nenhuma nota encontrada para esta pesquisa.</h2>
          <p>Altere os termos ou os filtros e tente novamente.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {filteredNotes.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      )}

      {isNoteFormOpen && <NoteForm tags={tags} selectedTagId={selectedTagId} tagCreatedNotice={tagCreatedNotice} onTagChange={setSelectedTagId} onClose={() => setIsNoteFormOpen(false)} onOpenTag={() => setIsTagModalOpen(true)} onCreated={handleNoteCreated} />}
      {isTagModalOpen && <TagModal onClose={() => setIsTagModalOpen(false)} onCreated={handleTagCreated} />}
    </section>
  )
}

function NoteCard({ note }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const copyNote = async () => {
    setCopyError('')
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(note.content)
        } catch {
          copyWithFallback(note.content)
        }
      } else {
        copyWithFallback(note.content)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch (error) {
      console.error('Não foi possível copiar o conteúdo da nota.', error)
      setCopyError('Não foi possível copiar. Verifique as permissões do navegador.')
    }
  }

  return (
    <article className="note-card">
      <div className="note-card-field">
        <span className="note-field-label">Falha</span>
        <strong className="note-failure">{note.failure}</strong>
      </div>
      <div className="note-card-field">
        <span className="note-field-label">Tag</span>
        <span className="note-tag">{note.tag?.name ?? 'Tag indisponível'}</span>
      </div>
      <div className="note-card-field note-content-field">
        <span className="note-field-label">Texto da nota</span>
        <p>{note.content}</p>
      </div>
      <div className="note-card-footer">
        <span>Criada em: {formatDate(note.created_at)}</span>
        <button className={`note-copy-button ${copied ? 'is-copied' : ''}`} onClick={copyNote}>
          {copied ? <Check size={15} /> : <Clipboard size={15} />}
          {copied ? '✓ NOTA COPIADA!' : 'COPIAR NOTA'}
        </button>
      </div>
      {copyError && <p className="note-copy-error" role="alert">{copyError}</p>}
    </article>
  )
}

function NoteForm({ tags, selectedTagId, tagCreatedNotice, onTagChange, onClose, onOpenTag, onCreated }) {
  const [failure, setFailure] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveNote = async (event) => {
    event.preventDefault()
    if (!failure || !selectedTagId || !content.trim()) {
      setError('Selecione uma falha, uma tag e preencha o texto da nota.')
      return
    }

    setError('')
    setIsSaving(true)
    try {
      const { error: insertError } = await getSupabaseClient().from('notes').insert({
        failure,
        tag_id: selectedTagId,
        content: content.trim(),
      })
      if (insertError) throw insertError
      await onCreated()
    } catch (saveError) {
      console.error('Não foi possível cadastrar a nota no Supabase.', saveError)
      setError('Não foi possível salvar a nota. Verifique a conexão e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="notes-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose() }}>
      <section className="notes-modal note-form-modal" role="dialog" aria-modal="true" aria-labelledby="note-form-title">
        <div className="notes-modal-heading">
          <div><span className="eyebrow">NOTAS</span><h2 id="note-form-title">Nova nota</h2></div>
          <button className="notes-modal-close" onClick={onClose} aria-label="Fechar formulário" disabled={isSaving}><X size={20} /></button>
        </div>
        <form className="note-form" onSubmit={saveNote}>
          <label className="note-form-field">
            <span>Falha <i>*</i></span>
            <select required value={failure} onChange={(event) => setFailure(event.target.value)}>
              <option value="">Selecione a falha...</option>
              {failures.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <div className="note-form-field">
            <label htmlFor="note-tag">Tag <i>*</i></label>
            <div className="note-tag-select-row">
              <select id="note-tag" required value={selectedTagId} onChange={(event) => onTagChange(event.target.value)}>
                <option value="">Selecione uma tag...</option>
                {tags.map((tag) => <option key={tag.id} value={tag.id}>{tag.name}</option>)}
              </select>
              <button type="button" className="notes-secondary-button" onClick={onOpenTag}><Plus size={15} /> NOVA TAG</button>
            </div>
            {tags.length === 0 && <small className="note-form-hint">Ainda não existem tags. Crie sua primeira tag para continuar.</small>}
            {tagCreatedNotice && <small className="note-form-success">Tag cadastrada com sucesso!</small>}
          </div>
          <label className="note-form-field">
            <span>Texto da nota <i>*</i></span>
            <textarea required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Digite aqui a informação, orientação ou procedimento técnico que deseja armazenar..." rows={8} />
          </label>
          {error && <div className="notes-error form-error" role="alert"><AlertCircle size={16} />{error}</div>}
          <div className="notes-modal-actions">
            <button type="button" className="notes-secondary-button" onClick={onClose} disabled={isSaving}>CANCELAR</button>
            <button type="submit" className="notes-primary-button" disabled={isSaving || tags.length === 0}>
              {isSaving ? 'SALVANDO...' : 'SALVAR NOTA'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function TagModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const saveTag = async (event) => {
    event.preventDefault()
    const tagName = name.trim()
    if (!tagName) {
      setError('Informe o nome da tag.')
      return
    }

    setIsSaving(true)
    setError('')
    try {
      const supabase = getSupabaseClient()
      const { data: existingTags, error: lookupError } = await supabase.from('tags').select('id, name')
      if (lookupError) throw lookupError
      if (existingTags.some((tag) => tag.name.trim().toLocaleLowerCase('pt-BR') === tagName.toLocaleLowerCase('pt-BR'))) {
        setError('Já existe uma tag com esse nome.')
        return
      }

      const { data, error: insertError } = await supabase.from('tags').insert({ name: tagName }).select('id, name').single()
      if (insertError) {
        if (insertError.code === '23505') {
          setError('Já existe uma tag com esse nome.')
          return
        }
        throw insertError
      }
      onCreated(data)
    } catch (saveError) {
      console.error('Não foi possível cadastrar a tag no Supabase.', saveError)
      setError('Não foi possível salvar a tag. Verifique a conexão e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="notes-modal-backdrop tag-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSaving) onClose() }}>
      <section className="notes-modal tag-modal" role="dialog" aria-modal="true" aria-labelledby="tag-modal-title">
        <div className="notes-modal-heading">
          <div><span className="eyebrow">CATEGORIZAÇÃO</span><h2 id="tag-modal-title">Nova tag</h2></div>
          <button className="notes-modal-close" onClick={onClose} aria-label="Fechar modal" disabled={isSaving}><X size={20} /></button>
        </div>
        <form className="note-form" onSubmit={saveTag}>
          <label className="note-form-field">
            <span>Nome da tag <i>*</i></span>
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Digite o nome da nova tag..." />
          </label>
          {error && <div className="notes-error form-error" role="alert"><AlertCircle size={16} />{error}</div>}
          <div className="notes-modal-actions">
            <button type="button" className="notes-secondary-button" onClick={onClose} disabled={isSaving}>CANCELAR</button>
            <button type="submit" className="notes-primary-button" disabled={isSaving}>{isSaving ? 'SALVANDO...' : 'SALVAR TAG'}</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function copyWithFallback(content) {
  const textarea = document.createElement('textarea')
  textarea.value = content
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  let copied
  try {
    textarea.select()
    copied = document.execCommand('copy')
  } finally {
    textarea.remove()
  }
  if (!copied) throw new Error('O navegador não conseguiu copiar o texto.')
}

function formatDate(value) {
  if (!value) return 'Data indisponível'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data indisponível'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}
