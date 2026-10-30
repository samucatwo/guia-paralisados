import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, ArrowDown, ArrowUp, Camera, Check, Clock3, Eye, EyeOff, FileImage, ImagePlus, Plus, RotateCcw, Save, Trash2, Upload, X } from 'lucide-react'
import './timestamp.css'

const PRESETS_STORAGE_KEY = 'eace-timestamp-presets'
const SETTINGS_STORAGE_KEY = 'eace-timestamp-settings'
const TIMESTAMP_FONTS = [
  { name: 'Arial Narrow', family: '"Arial Narrow", Arial, sans-serif' },
  { name: 'Arial', family: 'Arial, sans-serif' },
  { name: 'Segoe UI', family: '"Segoe UI", Arial, sans-serif' },
  { name: 'Trebuchet MS', family: '"Trebuchet MS", Arial, sans-serif' },
  { name: 'Tahoma', family: 'Tahoma, Arial, sans-serif' },
  { name: 'Verdana', family: 'Verdana, Arial, sans-serif' },
  { name: 'Franklin Gothic', family: '"Franklin Gothic Medium", Arial, sans-serif' },
  { name: 'Lucida Sans', family: '"Lucida Sans Unicode", "Lucida Grande", sans-serif' },
  { name: 'Impact', family: 'Impact, sans-serif' },
  { name: 'Courier New', family: '"Courier New", monospace' },
  { name: 'Georgia', family: 'Georgia, serif' },
  { name: 'Times New Roman', family: '"Times New Roman", serif' },
]

const DEFAULT_FIELD_DEFINITIONS = [
  { id: 'datetime', label: 'Data e hora', value: '', isDateTime: true },
  { id: 'coordinates', label: 'Coordenadas', value: '-3,3927S -44,0256W' },
  { id: 'address', label: 'Endereço/local', value: 'Estrada Sem Nome' },
  { id: 'city', label: 'Cidade', value: 'Presidente Vargas' },
  { id: 'state', label: 'Estado', value: 'Maranhão' },
  { id: 'identifier', label: 'Identificador', value: 'MAMINFO' },
]
const DEFAULT_FIELD_MAP = new Map(DEFAULT_FIELD_DEFINITIONS.map((field) => [field.id, field]))

const DEFAULT_STYLE = {
  font: TIMESTAMP_FONTS[0].name,
  fontSize: 24,
  weight: 400,
  color: '#ffffff',
  opacity: 100,
  letterSpacing: 0.2,
  lineHeight: 1.28,
  alignment: 'left',
  outline: true,
  outlineColor: '#07101b',
  outlineWidth: 0.8,
  shadow: true,
  shadowIntensity: 3,
  x: 5,
  y: 94,
  margin: 4,
  verticalAnchor: 'bottom',
}

const POSITION_PRESETS = [
  { id: 'top-left', label: 'Superior esquerdo', x: 5, y: 6, align: 'left', anchor: 'top' },
  { id: 'top-center', label: 'Superior centralizado', x: 50, y: 6, align: 'center', anchor: 'top' },
  { id: 'top-right', label: 'Superior direito', x: 95, y: 6, align: 'right', anchor: 'top' },
  { id: 'bottom-left', label: 'Inferior esquerdo', x: 5, y: 94, align: 'left', anchor: 'bottom' },
  { id: 'bottom-center', label: 'Inferior centralizado', x: 50, y: 94, align: 'center', anchor: 'bottom' },
  { id: 'bottom-right', label: 'Inferior direito', x: 95, y: 94, align: 'right', anchor: 'bottom' },
  { id: 'center', label: 'Centro', x: 50, y: 50, align: 'center', anchor: 'middle' },
]

function getLocalDateTime() {
  const now = new Date()
  return {
    date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
  }
}

function getDefaultFields(dateTime = getLocalDateTime()) {
  return DEFAULT_FIELD_DEFINITIONS.map((field) => ({
    ...field,
    value: field.isDateTime ? formatDateTime(dateTime.date, dateTime.time, 'camera', 'local') : field.value,
    visible: true,
  }))
}

function formatDateTime(date, time, format, zone) {
  if (!date) return ''
  const source = new Date(`${date}T${time || '00:00:00'}`)
  if (Number.isNaN(source.getTime())) return ''
  const options = {
    timeZone: zone === 'local' ? undefined : zone,
    day: '2-digit',
    month: format === 'camera' ? 'short' : '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }
  const parts = new Intl.DateTimeFormat('pt-BR', options).formatToParts(source)
  const formatted = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]))
  const { year: formattedYear, month: formattedMonth, day: formattedDay } = formatted
  const timeForZone = `${formatted.hour}:${formatted.minute}:${formatted.second}`
  if (format === 'camera') return `${formattedDay} de ${formattedMonth} de ${formattedYear} ${timeForZone}`
  const paddedMonth = String(formattedMonth).padStart(2, '0')
  const paddedDay = String(formattedDay).padStart(2, '0')
  if (format === 'long') return `${formattedDay} de ${formattedMonth} de ${formattedYear} ${timeForZone}`
  if (format === 'short') return `${formattedDay} ${formattedMonth.replace('.', '').toLocaleUpperCase('pt-BR')} ${formattedYear} ${timeForZone.slice(0, 5)}`
  if (format === 'iso') return `${formattedYear}-${paddedMonth}-${paddedDay} ${timeForZone}`
  return `${paddedDay}/${paddedMonth}/${formattedYear} ${timeForZone}`
}

function normalizeFields(savedFields, dateTime) {
  const fieldsById = new Map()
  if (Array.isArray(savedFields)) {
    savedFields.forEach((field) => {
      if (field && typeof field.id === 'string') fieldsById.set(field.id, field)
    })
  }

  const defaults = getDefaultFields()
  const normalizedDefaults = defaults.map((defaultField) => {
    const savedField = fieldsById.get(defaultField.id)
    if (!savedField) return { ...defaultField }
    const savedValue = typeof savedField.value === 'string' ? savedField.value : ''
    return {
      ...defaultField,
      ...savedField,
      id: defaultField.id,
      isDateTime: Boolean(defaultField.isDateTime),
      isCustom: false,
      label: typeof savedField.label === 'string' && savedField.label ? savedField.label : defaultField.label,
      value: !savedValue.trim() && savedField.visible !== false ? defaultField.value : savedValue,
      visible: typeof savedField.visible === 'boolean' ? savedField.visible : true,
    }
  })

  const orderedFields = []
  const normalizedById = new Map(normalizedDefaults.map((field) => [field.id, field]))
  const seenIds = new Set()
  if (Array.isArray(savedFields)) {
    savedFields.forEach((field) => {
      if (normalizedById.has(field?.id) && !seenIds.has(field.id)) {
        orderedFields.push(normalizedById.get(field.id))
        seenIds.add(field.id)
      } else if (typeof field?.id === 'string' && !DEFAULT_FIELD_MAP.has(field.id) && typeof field.label === 'string') {
        if (!seenIds.has(field.id)) {
          orderedFields.push({ ...field, isCustom: true, value: typeof field.value === 'string' ? field.value : '', visible: typeof field.visible === 'boolean' ? field.visible : true })
          seenIds.add(field.id)
        }
      }
    })
  }
  normalizedDefaults.forEach((field, defaultIndex) => {
    if (seenIds.has(field.id)) return
    const nextDefault = normalizedDefaults.slice(defaultIndex + 1).find((candidate) => seenIds.has(candidate.id))
    const nextDefaultIndex = nextDefault ? orderedFields.findIndex((candidate) => candidate.id === nextDefault.id) : -1
    const firstCustomIndex = orderedFields.findIndex((candidate) => !DEFAULT_FIELD_MAP.has(candidate.id))
    const insertionIndex = nextDefaultIndex >= 0 ? nextDefaultIndex : firstCustomIndex >= 0 ? firstCustomIndex : orderedFields.length
    orderedFields.splice(insertionIndex, 0, field)
    seenIds.add(field.id)
  })

  const datetimeField = orderedFields.find((field) => field.id === 'datetime')
  datetimeField.value = formatDateTime(dateTime.date, dateTime.time, 'camera', 'local')
  return orderedFields
}

function loadEditorSettings() {
  const now = getLocalDateTime()
  const defaults = {
    fields: getDefaultFields(now),
    dateTime: now,
    dateTimeMode: 'automatic',
    dateFormat: 'camera',
    timeZone: 'local',
    style: { ...DEFAULT_STYLE },
  }
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || 'null')
    if (!stored || typeof stored !== 'object') return defaults

    const dateTime = {
      date: typeof stored.dateTime?.date === 'string' && stored.dateTime.date ? stored.dateTime.date : now.date,
      time: typeof stored.dateTime?.time === 'string' && stored.dateTime.time ? stored.dateTime.time : now.time,
    }
    const savedMode = stored.dateTimeMode ?? stored.datetimeMode ?? stored.dateMode
    const dateTimeMode = savedMode === 'manual' || savedMode === 'auto' || savedMode === 'automatic'
      ? savedMode === 'manual' ? 'manual' : 'automatic'
      : stored.dateTime?.date && stored.dateTime?.time ? 'manual' : 'automatic'
    const resolvedDateTime = dateTimeMode === 'automatic' ? now : dateTime
    const storedStyle = stored.style && typeof stored.style === 'object' ? stored.style : {}

    return {
      fields: normalizeFields(stored.fields, resolvedDateTime),
      dateTime: resolvedDateTime,
      dateTimeMode,
      dateFormat: ['camera', 'dd/MM/yyyy HH:mm:ss', 'long', 'short', 'iso'].includes(stored.dateFormat) ? stored.dateFormat : 'camera',
      timeZone: dateTimeMode === 'automatic' || !['local', 'America/Fortaleza', 'UTC'].includes(stored.timeZone) ? 'local' : stored.timeZone,
      style: { ...DEFAULT_STYLE, ...storedStyle },
    }
  } catch (error) {
    console.error('Não foi possível carregar as configurações salvas do timestamp.', error)
    return defaults
  }
}

function readPresets() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRESETS_STORAGE_KEY) || '[]')
    return Array.isArray(stored) ? stored.filter((preset) => typeof preset?.name === 'string' && preset.style && Array.isArray(preset.fields)) : []
  } catch (error) {
    console.error('Não foi possível ler os presets de timestamp salvos.', error)
    return []
  }
}

function getAnchorTransform(alignment, anchor) {
  const horizontal = alignment === 'left' ? '0' : alignment === 'right' ? '-100%' : '-50%'
  const vertical = anchor === 'bottom' ? '-100%' : anchor === 'middle' ? '-50%' : '0'
  return `translate(${horizontal}, ${vertical})`
}

export function TimestampEditor() {
  const [initialSettings] = useState(loadEditorSettings)
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dateTime, setDateTime] = useState(initialSettings.dateTime)
  const [dateTimeMode, setDateTimeMode] = useState(initialSettings.dateTimeMode)
  const [dateFormat, setDateFormat] = useState(initialSettings.dateFormat)
  const [timeZone, setTimeZone] = useState(initialSettings.timeZone)
  const [fields, setFields] = useState(initialSettings.fields)
  const [style, setStyle] = useState(initialSettings.style)
  const [outputFormat, setOutputFormat] = useState('image/jpeg')
  const [isExporting, setIsExporting] = useState(false)
  const [loadedFontCss, setLoadedFontCss] = useState('')
  const [presetName, setPresetName] = useState('')
  const [presets, setPresets] = useState(readPresets)
  const [selectedPreset, setSelectedPreset] = useState('')
  const [status, setStatus] = useState('')
  const [previewWidth, setPreviewWidth] = useState(0)
  const fileInputRef = useRef(null)
  const imageElementRef = useRef(null)
  const imageUrlRef = useRef('')
  const dragStartRef = useRef(null)

  const refreshAutomaticDateTime = useCallback(() => {
    const currentTime = getLocalDateTime()
    setDateTime(currentTime)
    setFields((current) => current.map((field) => field.isDateTime
      ? { ...field, value: formatDateTime(currentTime.date, currentTime.time, dateFormat, timeZone) }
      : field))
  }, [dateFormat, timeZone])

  const processImage = useCallback((file) => {
    if (!file?.type.startsWith('image/')) {
      setError('Selecione ou solte um arquivo de imagem compatível.')
      return
    }
    const objectUrl = URL.createObjectURL(file)
    const probe = new Image()
    probe.onload = () => {
      if (dateTimeMode === 'automatic') refreshAutomaticDateTime()
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current)
      imageUrlRef.current = objectUrl
      setImage({ file, url: objectUrl, width: probe.naturalWidth, height: probe.naturalHeight, name: file.name || 'fotografia' })
      setError('')
      setStatus('Fotografia carregada no navegador.')
    }
    probe.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      setError('Não foi possível abrir esta imagem. Tente outro arquivo.')
    }
    probe.src = objectUrl
  }, [dateTimeMode, refreshAutomaticDateTime])

  const font = TIMESTAMP_FONTS.find((option) => option.name === style.font) ?? TIMESTAMP_FONTS[0]
  const previewScale = previewWidth / 1920
  const timestampLines = fields.filter((field) => field.visible).map((field) => field.isDateTime
    ? formatDateTime(dateTime.date, dateTime.time, dateFormat, dateTimeMode === 'automatic' ? 'local' : timeZone)
    : field.value.trim()).filter(Boolean)
  const fontCss = `${style.weight} ${style.fontSize}px ${font.family}`
  const isFontReady = loadedFontCss === fontCss

  useEffect(() => {
    let active = true
    document.fonts.load(fontCss).then(() => document.fonts.ready).then(() => {
      if (active) setLoadedFontCss(fontCss)
    }).catch((fontError) => {
      console.error('Não foi possível carregar a fonte selecionada.', fontError)
    })
    return () => { active = false }
  }, [fontCss])

  useEffect(() => {
    const preview = imageElementRef.current
    if (!preview) return undefined
    const observer = new ResizeObserver(() => setPreviewWidth(preview.getBoundingClientRect().width))
    observer.observe(preview)
    return () => observer.disconnect()
  }, [image])

  useEffect(() => () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current)
  }, [])

  useEffect(() => {
    const handlePaste = (event) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]'))) return
      const item = [...(event.clipboardData?.items ?? [])].find((clipboardItem) => clipboardItem.type.startsWith('image/'))
      const pastedFile = item?.getAsFile()
      if (!pastedFile) return
      event.preventDefault()
      void processImage(pastedFile)
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [processImage])

  useEffect(() => {
    if (!status) return undefined
    const timer = window.setTimeout(() => setStatus(''), 3500)
    return () => window.clearTimeout(timer)
  }, [status])

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        fields,
        dateTime,
        dateTimeMode,
        dateFormat,
        timeZone,
        style,
      }))
    } catch (storageError) {
      console.error('Não foi possível salvar as configurações do timestamp.', storageError)
      window.setTimeout(() => setError('Não foi possível salvar as configurações neste navegador.'), 0)
    }
  }, [fields, dateTime, dateTimeMode, dateFormat, timeZone, style])

  const setFieldValue = (id, value) => setFields((current) => current.map((field) => field.id === id ? { ...field, value } : field))
  const setFieldLabel = (id, label) => setFields((current) => current.map((field) => field.id === id ? { ...field, label } : field))
  const updateStyle = (key, value) => setStyle((current) => ({ ...current, [key]: value }))

  const updateDateTime = (key, value) => {
    const next = { ...dateTime, [key]: value }
    setDateTime(next)
    setFields((current) => current.map((field) => field.isDateTime
      ? { ...field, value: formatDateTime(next.date, next.time, dateFormat, timeZone) }
      : field))
  }

  const setAutomaticDateTime = (mode) => {
    setDateTimeMode(mode)
    if (mode === 'automatic') {
      setTimeZone('local')
      refreshAutomaticDateTime()
    }
  }

  const updateDateFormat = (value) => {
    setDateFormat(value)
    setFields((current) => current.map((field) => field.isDateTime
      ? { ...field, value: formatDateTime(dateTime.date, dateTime.time, value, timeZone) }
      : field))
  }

  const updateTimeZone = (value) => {
    setTimeZone(value)
    setFields((current) => current.map((field) => field.isDateTime
      ? { ...field, value: formatDateTime(dateTime.date, dateTime.time, dateFormat, value) }
      : field))
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    processImage(event.dataTransfer.files?.[0])
  }

  const addCustomField = () => setFields((current) => [...current, { id: `custom-${createId()}`, label: 'Novo campo', value: '', visible: true, isCustom: true }])
  const removeField = (id) => setFields((current) => current.filter((field) => field.id !== id || !field.isCustom))
  const toggleField = (id) => setFields((current) => current.map((field) => field.id === id ? { ...field, visible: !field.visible } : field))
  const moveField = (id, offset) => setFields((current) => {
    const index = current.findIndex((field) => field.id === id)
    const target = index + offset
    if (target < 0 || target >= current.length) return current
    const reordered = [...current]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    return reordered
  })

  const choosePosition = (preset) => setStyle((current) => ({
    ...current,
    x: preset.x,
    y: preset.y,
    alignment: preset.align,
    verticalAnchor: preset.anchor,
  }))

  const restoreTimestampDefaults = () => {
    const currentTime = getLocalDateTime()
    setDateTime(currentTime)
    setDateTimeMode('automatic')
    setDateFormat('camera')
    setTimeZone('local')
    setFields(getDefaultFields(currentTime))
    setStatus('Valores padrão do timestamp restaurados.')
  }

  const restoreStyleDefaults = () => {
    setStyle({ ...DEFAULT_STYLE })
    setStatus('Estilo visual padrão restaurado.')
  }

  const persistPresets = (nextPresets) => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(nextPresets))
      setPresets(nextPresets)
    } catch (storageError) {
      console.error('Não foi possível salvar presets de timestamp.', storageError)
      setError('Não foi possível salvar o preset neste navegador.')
    }
  }

  const savePreset = () => {
    const name = presetName.trim()
    if (!name) {
      setError('Digite um nome para o preset.')
      return
    }
    const preset = { id: createId(), name, style, fields: fields.map((field) => ({ ...field })), dateFormat, timeZone, dateTime, dateTimeMode }
    persistPresets([...presets, preset])
    setPresetName('')
    setError('')
    setStatus('Preset salvo neste navegador.')
  }

  const applyPreset = (id) => {
    const preset = presets.find((option) => option.id === id)
    if (!preset) return
    setStyle({ ...DEFAULT_STYLE, ...preset.style })
    const presetMode = preset.dateTimeMode === 'manual' ? 'manual' : preset.dateTimeMode === 'automatic' ? 'automatic' : preset.dateTime ? 'manual' : dateTimeMode
    const presetDateTime = presetMode === 'automatic' ? getLocalDateTime() : preset.dateTime ?? dateTime
    setFields(normalizeFields(preset.fields, presetDateTime))
    setDateFormat(preset.dateFormat ?? 'dd/MM/yyyy HH:mm:ss')
    setTimeZone(presetMode === 'automatic' ? 'local' : preset.timeZone ?? 'local')
    setDateTime(presetDateTime)
    setDateTimeMode(presetMode)
    setSelectedPreset(id)
    setStatus(`Preset "${preset.name}" aplicado.`)
  }

  const deletePreset = () => {
    if (!selectedPreset) return
    persistPresets(presets.filter((preset) => preset.id !== selectedPreset))
    setSelectedPreset('')
  }

  const exportImage = async () => {
    if (!image || !isFontReady) return
    setIsExporting(true)
    setError('')
    try {
      await document.fonts.load(fontCss)
      await document.fonts.ready
      if (!document.fonts.check(fontCss)) throw new Error('A fonte selecionada ainda não está disponível.')
      const sourceImage = new Image()
      sourceImage.src = image.url
      await sourceImage.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Não foi possível inicializar o Canvas.')
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(sourceImage, 0, 0, image.width, image.height)
      renderTimestamp(context, timestampLines, style, font.family, image.width, image.height)
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Não foi possível gerar o arquivo de imagem.')), outputFormat, outputFormat === 'image/jpeg' ? 0.95 : undefined)
      })
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const extension = outputFormat === 'image/png' ? 'png' : 'jpg'
      anchor.href = downloadUrl
      anchor.download = `timestamp_fotografia_${dateTime.date || getLocalDateTime().date}.${extension}`
      anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      setStatus('Fotografia exportada com o timestamp incorporado.')
    } catch (exportError) {
      console.error('Não foi possível exportar a fotografia.', exportError)
      setError(exportError.message || 'Não foi possível exportar a fotografia.')
    } finally {
      setIsExporting(false)
    }
  }

  const handlePreviewPointerDown = (event) => {
    if (!image || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = event.currentTarget
    updatePositionFromPointer(event)
  }

  const updatePositionFromPointer = (event) => {
    const bounds = imageElementRef.current?.getBoundingClientRect()
    if (!bounds) return
    const x = Math.max(1, Math.min(99, ((event.clientX - bounds.left) / bounds.width) * 100))
    const y = Math.max(1, Math.min(99, ((event.clientY - bounds.top) / bounds.height) * 100))
    updateStyle('x', Number(x.toFixed(1)))
    updateStyle('y', Number(y.toFixed(1)))
    updateStyle('verticalAnchor', 'middle')
  }

  return (
    <section className="timestamp-page">
      <header className="timestamp-heading">
        <div className="timestamp-title-group">
          <div className="timestamp-title-icon"><Camera size={21} /></div>
          <div><span className="eyebrow">FERRAMENTA DE IMAGEM</span><h1>TIMESTAMP FOTOGRÁFICO</h1><p>Editor de informações sobre fotografias</p></div>
        </div>
        <div className="timestamp-heading-actions">
          <button className="timestamp-reset-button" onClick={restoreTimestampDefaults}><RotateCcw size={15} /> RESTAURAR VALORES PADRÃO</button>
          <button className="timestamp-reset-button" onClick={restoreStyleDefaults}><RotateCcw size={15} /> Restaurar estilo visual</button>
        </div>
      </header>

      {status && <div className="timestamp-status" role="status"><Check size={16} />{status}</div>}
      {error && <div className="timestamp-error" role="alert"><AlertCircle size={16} />{error}<button onClick={() => setError('')} aria-label="Fechar mensagem"><X size={15} /></button></div>}

      {!image ? (
        <div className={`timestamp-uploader ${isDragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false) }} onDrop={handleDrop}>
          <div className="uploader-icon"><ImagePlus size={27} /></div>
          <h2>Adicione uma fotografia para começar</h2>
          <p>Arraste uma fotografia, selecione um arquivo ou pressione Ctrl+V para colar uma imagem.</p>
          <button className="timestamp-primary-button" onClick={() => fileInputRef.current?.click()}><Upload size={16} /> SELECIONAR FOTOGRAFIA</button>
          <span className="uploader-formats">JPG, JPEG, PNG e outros formatos de imagem compatíveis</span>
          <input ref={fileInputRef} className="timestamp-file-input" type="file" accept="image/*" onChange={(event) => { processImage(event.target.files?.[0]); event.target.value = '' }} />
        </div>
      ) : (
        <>
          <div className="timestamp-workspace">
            <section className="timestamp-preview-panel">
              <div className="timestamp-panel-heading"><div><span className="timestamp-section-kicker">PRÉ-VISUALIZAÇÃO</span><h2>{image.name}</h2></div><span className="timestamp-image-size">{image.width.toLocaleString('pt-BR')} × {image.height.toLocaleString('pt-BR')} px</span></div>
              <div className="timestamp-preview-stage" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
                <div className="timestamp-image-frame" ref={imageElementRef}>
                  <img src={image.url} alt="Fotografia em edição" onLoad={(event) => setPreviewWidth(event.currentTarget.clientWidth)} />
                  {timestampLines.length > 0 && (
                    <div className="timestamp-preview-overlay" onPointerDown={handlePreviewPointerDown} onPointerMove={(event) => { if (dragStartRef.current) updatePositionFromPointer(event) }} onPointerUp={() => { dragStartRef.current = null }} onPointerCancel={() => { dragStartRef.current = null }} style={{
                      left: `${Math.max(style.margin, Math.min(100 - style.margin, style.x))}%`,
                      top: `${Math.max(style.margin, Math.min(100 - style.margin, style.y))}%`,
                      transform: getAnchorTransform(style.alignment, style.verticalAnchor),
                      textAlign: style.alignment,
                      fontFamily: font.family,
                      fontSize: `${getScaledFontSize(style.fontSize, previewWidth || image.width, image.width)}px`,
                      fontWeight: style.weight,
                      lineHeight: style.lineHeight,
                      letterSpacing: `${style.letterSpacing * previewScale}px`,
                      color: style.color,
                      opacity: style.opacity / 100,
                      WebkitTextStroke: style.outline ? `${Math.max(0.3 * previewWidth / image.width, style.outlineWidth * previewScale)}px ${style.outlineColor}` : '0 transparent',
                      textShadow: style.shadow ? `0 ${style.shadowIntensity * previewScale * 0.35}px ${style.shadowIntensity * previewScale}px rgba(0,0,0,${Math.min(0.9, style.shadowIntensity / 10)})` : 'none',
                      maxWidth: `${100 - style.margin * 2}%`,
                    }} aria-label="Timestamp, arraste para reposicionar">
                      {timestampLines.map((line, index) => <span className="timestamp-preview-line" key={`${index}-${line}`}>{line}</span>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="timestamp-preview-footer"><span><FileImage size={14} /> Processamento local — a fotografia não é enviada</span><span>Arraste o texto para reposicionar</span></div>
            </section>

            <aside className="timestamp-controls-panel">
              <div className="timestamp-panel-heading"><div><span className="timestamp-section-kicker">EDITOR</span><h2>Configurações</h2></div><Clock3 size={18} /></div>

              <section className="timestamp-control-section">
                <div className="timestamp-datetime-heading">
                  <h3>Data e hora</h3>
                  <div className="timestamp-mode-toggle" role="group" aria-label="Modo da data e hora">
                    <button className={dateTimeMode === 'automatic' ? 'is-selected' : ''} onClick={() => setAutomaticDateTime('automatic')}>AUTOMÁTICO</button>
                    <button className={dateTimeMode === 'manual' ? 'is-selected' : ''} onClick={() => setAutomaticDateTime('manual')}>MANUAL</button>
                  </div>
                </div>
                <div className="timestamp-control-grid two-controls">
                  <label className="timestamp-control"><span>Data</span><input type="date" value={dateTime.date} disabled={dateTimeMode === 'automatic'} onChange={(event) => updateDateTime('date', event.target.value)} /></label>
                  <label className="timestamp-control"><span>Hora</span><input type="time" step="1" value={dateTime.time} disabled={dateTimeMode === 'automatic'} onChange={(event) => updateDateTime('time', event.target.value)} /></label>
                  <label className="timestamp-control"><span>Formato</span><select value={dateFormat} onChange={(event) => updateDateFormat(event.target.value)}><option value="camera">30 de out. de 2026 11:26:35</option><option value="dd/MM/yyyy HH:mm:ss">30/10/2026 11:26:35</option><option value="long">30 de outubro de 2026 11:26:35</option><option value="short">30 OUT 2026 11:26</option><option value="iso">2026-10-30 11:26:35</option></select></label>
                  <label className="timestamp-control"><span>Fuso horário</span><select value={timeZone} disabled={dateTimeMode === 'automatic'} onChange={(event) => updateTimeZone(event.target.value)}><option value="local">Local do dispositivo</option><option value="America/Fortaleza">America/Fortaleza</option><option value="UTC">UTC</option></select></label>
                </div>
              </section>

              <section className="timestamp-control-section">
                <div className="timestamp-section-heading"><h3>Informações da fotografia</h3><button className="timestamp-icon-action" onClick={addCustomField} aria-label="Adicionar campo"><Plus size={16} /></button></div>
                <div className="timestamp-fields-list">
                  {fields.map((field, index) => (
                    <div className={`timestamp-field-editor ${field.visible ? '' : 'is-hidden'}`} key={field.id}>
                      <div className="timestamp-field-toolbar">
                        <button className="timestamp-icon-action" onClick={() => toggleField(field.id)} aria-label={field.visible ? 'Ocultar campo' : 'Mostrar campo'}>{field.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                        <input aria-label="Nome do campo" value={field.label} onChange={(event) => setFieldLabel(field.id, event.target.value)} />
                        <button className="timestamp-icon-action" disabled={index === 0} onClick={() => moveField(field.id, -1)} aria-label="Mover campo para cima"><ArrowUp size={14} /></button>
                        <button className="timestamp-icon-action" disabled={index === fields.length - 1} onClick={() => moveField(field.id, 1)} aria-label="Mover campo para baixo"><ArrowDown size={14} /></button>
                        {field.isCustom && <button className="timestamp-icon-action danger-action" onClick={() => removeField(field.id)} aria-label="Remover campo"><Trash2 size={14} /></button>}
                      </div>
                      {!field.isDateTime && <input className="timestamp-field-value" value={field.value} onChange={(event) => setFieldValue(field.id, event.target.value)} placeholder={`Digite ${field.label.toLocaleLowerCase('pt-BR')}...`} />}
                    </div>
                  ))}
                </div>
                <button className="timestamp-add-field" onClick={addCustomField}><Plus size={14} /> Adicionar campo personalizado</button>
              </section>

              <section className="timestamp-control-section">
                <h3>Aparência do texto</h3>
                <div className="timestamp-control-grid two-controls">
                  <label className="timestamp-control"><span>Fonte</span><select value={style.font} onChange={(event) => updateStyle('font', event.target.value)}>{TIMESTAMP_FONTS.map((option) => <option key={option.name} value={option.name} style={{ fontFamily: option.family }}>{option.name}</option>)}</select></label>
                  <label className="timestamp-control"><span>Tamanho · {style.fontSize}px</span><input type="range" min="12" max="72" value={style.fontSize} onChange={(event) => updateStyle('fontSize', Number(event.target.value))} /></label>
                  <label className="timestamp-control"><span>Peso</span><select value={style.weight} onChange={(event) => updateStyle('weight', Number(event.target.value))}><option value="300">Leve</option><option value="400">Regular</option><option value="500">Médio</option><option value="600">Semibold</option><option value="700">Negrito</option></select></label>
                  <label className="timestamp-control color-control"><span>Cor e opacidade</span><div><input type="color" value={style.color} onChange={(event) => updateStyle('color', event.target.value)} /><input type="range" min="10" max="100" value={style.opacity} onChange={(event) => updateStyle('opacity', Number(event.target.value))} aria-label="Opacidade do texto" /></div></label>
                  <label className="timestamp-control"><span>Espaçamento · {style.letterSpacing}px</span><input type="range" min="-1" max="5" step="0.1" value={style.letterSpacing} onChange={(event) => updateStyle('letterSpacing', Number(event.target.value))} /></label>
                  <label className="timestamp-control"><span>Altura de linha · {style.lineHeight}</span><input type="range" min="1" max="2" step="0.05" value={style.lineHeight} onChange={(event) => updateStyle('lineHeight', Number(event.target.value))} /></label>
                  <label className="timestamp-control"><span>Alinhamento</span><select value={style.alignment} onChange={(event) => updateStyle('alignment', event.target.value)}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></label>
                  <label className="timestamp-control"><span>Margem · {style.margin}%</span><input type="range" min="0" max="12" step="0.5" value={style.margin} onChange={(event) => updateStyle('margin', Number(event.target.value))} /></label>
                </div>
                <div className="timestamp-style-toggles">
                  <label><input type="checkbox" checked={style.outline} onChange={(event) => updateStyle('outline', event.target.checked)} /> Contorno</label>
                  <input type="color" value={style.outlineColor} onChange={(event) => updateStyle('outlineColor', event.target.value)} aria-label="Cor do contorno" disabled={!style.outline} />
                  <input type="range" min="0.3" max="4" step="0.1" value={style.outlineWidth} onChange={(event) => updateStyle('outlineWidth', Number(event.target.value))} aria-label="Espessura do contorno" disabled={!style.outline} />
                  <label><input type="checkbox" checked={style.shadow} onChange={(event) => updateStyle('shadow', event.target.checked)} /> Sombra</label>
                  <input type="range" min="0" max="10" value={style.shadowIntensity} onChange={(event) => updateStyle('shadowIntensity', Number(event.target.value))} aria-label="Intensidade da sombra" disabled={!style.shadow} />
                </div>
              </section>

              <section className="timestamp-control-section">
                <h3>Posição do timestamp</h3>
                <div className="timestamp-position-grid">
                  {POSITION_PRESETS.map((preset) => <button key={preset.id} className={`timestamp-position-button ${style.x === preset.x && style.y === preset.y && style.alignment === preset.align ? 'is-selected' : ''}`} onClick={() => choosePosition(preset)} aria-label={preset.label}><span className={`position-dot ${preset.id}`} /></button>)}
                </div>
                <div className="timestamp-control-grid two-controls position-coordinates">
                  <label className="timestamp-control"><span>Posição X · {style.x}%</span><input type="range" min="1" max="99" step="0.5" value={style.x} onChange={(event) => updateStyle('x', Number(event.target.value))} /></label>
                  <label className="timestamp-control"><span>Posição Y · {style.y}%</span><input type="range" min="1" max="99" step="0.5" value={style.y} onChange={(event) => updateStyle('y', Number(event.target.value))} /></label>
                </div>
              </section>

              <section className="timestamp-control-section timestamp-presets-section">
                <h3>Presets do navegador</h3>
                <div className="timestamp-preset-row"><select value={selectedPreset} onChange={(event) => applyPreset(event.target.value)}><option value="">Selecionar preset...</option>{presets.map((preset) => <option key={preset.id} value={preset.id}>{preset.name}</option>)}</select><button className="timestamp-icon-action danger-action" disabled={!selectedPreset} onClick={deletePreset} aria-label="Excluir preset"><Trash2 size={15} /></button></div>
                <div className="timestamp-preset-row"><input value={presetName} onChange={(event) => setPresetName(event.target.value)} placeholder="Nome do preset..." /><button className="timestamp-icon-action" onClick={savePreset} aria-label="Salvar preset"><Save size={15} /></button></div>
              </section>
            </aside>
          </div>

          <footer className="timestamp-export-bar">
            <div className="timestamp-export-meta"><strong>Pronto para exportar?</strong><span>Imagem original: {image.width.toLocaleString('pt-BR')} × {image.height.toLocaleString('pt-BR')} px</span></div>
            <div className="timestamp-export-actions"><label className="timestamp-export-format"><span>Formato</span><select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)}><option value="image/jpeg">JPG · alta qualidade</option><option value="image/png">PNG · sem perdas</option></select></label><button className="timestamp-primary-button export-button" onClick={exportImage} disabled={isExporting || !isFontReady}>{isExporting ? 'RENDERIZANDO...' : !isFontReady ? 'CARREGANDO FONTE...' : <><FileImage size={17} /> EXPORTAR FOTOGRAFIA</>}</button></div>
          </footer>
        </>
      )}
    </section>
  )
}

function getScaledFontSize(baseSize, displayWidth, imageWidth) {
  const exportFontSize = Math.max(10, baseSize * imageWidth / 1920)
  return exportFontSize * displayWidth / imageWidth
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function renderTimestamp(context, lines, style, fontFamily, width, height) {
  if (!lines.length) return
  const scale = width / 1920
  const fontSize = Math.max(10, style.fontSize * scale)
  const marginX = Math.max(0, (style.margin / 100) * width)
  const marginY = Math.max(0, (style.margin / 100) * height)
  const x = Math.max(marginX, Math.min(width - marginX, (style.x / 100) * width))
  const y = Math.max(marginY, Math.min(height - marginY, (style.y / 100) * height))
  const maxWidth = Math.max(1, width - marginX * 2)
  const lineHeight = fontSize * style.lineHeight
  context.font = `${style.weight} ${fontSize}px ${fontFamily}`
  const wrappedLines = lines.flatMap((line) => line.split('\n').flatMap((paragraph) => wrapText(context, paragraph, maxWidth, style.letterSpacing * scale)))
  const blockHeight = lineHeight * wrappedLines.length
  const firstBaseline = style.verticalAnchor === 'bottom' ? y - blockHeight + fontSize : style.verticalAnchor === 'middle' ? y - blockHeight / 2 + fontSize : y + fontSize
  context.save()
  context.font = `${style.weight} ${fontSize}px ${fontFamily}`
  context.textAlign = style.alignment
  context.textBaseline = 'alphabetic'
  context.globalAlpha = style.opacity / 100
  context.lineJoin = 'round'
  context.miterLimit = 2
  context.shadowColor = style.shadow ? `rgba(0,0,0,${Math.min(0.9, style.shadowIntensity / 10)})` : 'transparent'
  context.shadowBlur = style.shadow ? style.shadowIntensity * scale : 0
  context.shadowOffsetX = 0
  context.shadowOffsetY = style.shadow ? style.shadowIntensity * scale * 0.35 : 0
  wrappedLines.forEach((line, index) => {
    const baseline = firstBaseline + index * lineHeight
    if (style.outline) {
      context.strokeStyle = style.outlineColor
      context.lineWidth = Math.max(0.3, style.outlineWidth * scale)
      drawSpacedText(context, line, x, baseline, style.letterSpacing * scale, true)
    }
    context.fillStyle = style.color
    drawSpacedText(context, line, x, baseline, style.letterSpacing * scale, false)
  })
  context.restore()
}

function measureSpacedText(context, text, spacing) {
  return [...text].reduce((width, character) => width + context.measureText(character).width + spacing, -spacing)
}

function wrapText(context, text, maxWidth, spacing) {
  const words = text.split(/\s+/)
  const lines = []
  let current = ''
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    if (measureSpacedText(context, candidate, spacing) <= maxWidth) {
      current = candidate
      return
    }
    if (current) lines.push(current)
    if (measureSpacedText(context, word, spacing) <= maxWidth) {
      current = word
      return
    }
    const wordLines = splitLongWord(context, word, maxWidth, spacing)
    lines.push(...wordLines.slice(0, -1))
    current = wordLines.at(-1) ?? ''
  })
  if (current) lines.push(current)
  return lines
}

function splitLongWord(context, word, maxWidth, spacing) {
  const lines = []
  let current = ''
  for (const character of word) {
    const candidate = current + character
    if (current && measureSpacedText(context, candidate, spacing) > maxWidth) {
      lines.push(current)
      current = character
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawSpacedText(context, text, x, y, spacing, stroke) {
  if (spacing === 0) {
    if (stroke) context.strokeText(text, x, y)
    else context.fillText(text, x, y)
    return
  }
  const characters = [...text]
  const widths = characters.map((character) => context.measureText(character).width + spacing)
  const totalWidth = widths.reduce((total, width) => total + width, -spacing)
  let cursor = context.textAlign === 'center' ? x - totalWidth / 2 : context.textAlign === 'right' ? x - totalWidth : x
  characters.forEach((character, index) => {
    if (stroke) context.strokeText(character, cursor, y)
    else context.fillText(character, cursor, y)
    cursor += widths[index]
  })
}
