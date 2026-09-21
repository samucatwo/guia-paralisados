import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  FileCheck2,
  FileText,
  MessageCircle,
  Paperclip,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { EmailRecipients, PLANEJAMENTO_CC_STRING, PLANEJAMENTO_TO } from '../components/EmailRecipients'
import { ReformaFinalizada } from './ReformaFinalizada'

const schoolMessage = `Olá! Para darmos continuidade à análise da reforma da escola, poderia nos informar, por favor:

1. Qual é a previsão para conclusão da reforma?
2. O teto da escola será removido ou haverá alguma obra que possa afetar o local onde estão instalados os equipamentos de internet?
3. A reforma irá afetar a parte da frente ou as áreas externas da escola? Caso sim, haverá algum responsável ou vigia no local durante o período da reforma?
4. Os equipamentos de internet estão protegidos durante a reforma? Além do equipamento que fica dentro do rack, existem pela escola alguns dispositivos brancos instalados nas paredes ou no teto, responsáveis por distribuir o sinal de Wi-Fi. Esses equipamentos também estão protegidos contra poeira, umidade, água e possíveis danos ou furtos?
5. Durante a reforma, algum desses equipamentos precisará ser retirado, deslocado ou ficará próximo às áreas onde estão sendo realizadas as obras?
Se possível, pedimos também o envio de fotos ou vídeos da reforma e dos locais onde os equipamentos estão instalados, para que possamos avaliar a situação.`

const orientationMessage = `Para dar continuidade ao processo de remoção dos equipamentos devido à reforma da unidade, é necessário encaminhar um e-mail ao setor de Planejamento do projeto, com cópia para o suporte e demais contatos do setor.

O e-mail deverá conter um ofício da escola informando que a unidade está passando por reforma e solicitando a remoção dos equipamentos durante o período da obra.

O ofício deverá conter:

Nome e INEP da escola;

Endereço completo da unidade, com CEP;

Latitude e Longitude;

Informação de que a escola está em reforma;

Previsão de conclusão da reforma, se disponível;

Solicitação de remoção dos equipamentos devido à reforma;

Esclarecimento de que a reforma afetará o local onde os equipamentos estão instalados.

Envio do e-mail:

Destinatário: planejamento@eace.org.br

CC: suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br

Assunto: Solicitação de remoção de equipamentos devido à reforma - INEP: [INEP da escola]

Anexo: Ofício da escola.

Após o envio, por gentileza, nos informe para que possamos acompanhar a solicitação e dar continuidade ao atendimento.

Reforçar com ela também o envio para nós, pelo WhatsApp, de uma cópia do ofício para fazermos a solicitação por nossa parte.`

const analysisItems = [
  ['Previsão de conclusão', 'Informação sobre quando a reforma deverá terminar.', 'calendar'],
  ['Impacto no teto', 'Verificar se o teto será removido ou se haverá obra que possa afetar os equipamentos.', 'roof'],
  ['Áreas externas', 'Verificar se a reforma afetará a parte da frente ou áreas externas.', 'outside'],
  ['Responsável/Vigia', 'Caso áreas externas sejam afetadas, verificar se haverá alguém responsável ou vigia no local.', 'person'],
  ['Proteção dos equipamentos', 'Verificar se os equipamentos estão protegidos contra poeira, umidade, água, danos e furtos.', 'shield'],
  ['Equipamentos afetados', 'Verificar se algum equipamento precisará ser retirado, deslocado ou permanecer próximo às áreas de obra.', 'router'],
  ['Evidências', 'Verificar se foram recebidas fotos e vídeos.', 'media'],
]

const receivedChecklist = ['Ofício recebido', 'Ofício conferido', 'Informações da escola identificadas', 'Reforma informada no documento', 'Solicitação de remoção identificada', 'Documento pronto para anexar à solicitação']
const conferenceChecklist = ['Nome da escola', 'INEP', 'Endereço completo com CEP', 'Latitude', 'Longitude', 'Informação sobre a reforma', 'Previsão de conclusão, quando disponível', 'Solicitação de remoção dos equipamentos', 'Informação de que a reforma afetará o local dos equipamentos']

const initialSchool = { inep: '', escola: '', endereco: '', uf: '', cidade: '', latitude: '', longitude: '', localizacao: '', previsaoConclusao: '' }

function formatCompletionDate(value) {
  if (!value) return '[previsão de conclusão não informada]'

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function ReformaEscolar({ onBack }) {
  const [flow, setFlow] = useState('select')
  const [activeStage, setActiveStage] = useState(1)
  const [decision, setDecision] = useState('sim')
  const [copied, setCopied] = useState('')
  const [school, setSchool] = useState(initialSchool)
  const [checked, setChecked] = useState({ received: [], conference: [] })
  const [orientationStatus, setOrientationStatus] = useState('pending')
  const [confirmationDate, setConfirmationDate] = useState('')
  const [confirmationNote, setConfirmationNote] = useState('')

  const copy = async (value, label) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(''), 2200)
  }

  const toggleCheck = (group, item) => setChecked((current) => ({
    ...current,
    [group]: current[group].includes(item) ? current[group].filter((entry) => entry !== item) : [...current[group], item],
  }))

  const updateSchool = (field, value) => setSchool((current) => ({ ...current, [field]: value }))

  const emailBody = useMemo(() => `Prezados,\n\nEm contato com o responsável pela escola, fomos informados que a unidade está passando por uma reforma, com previsão de conclusão para ${formatCompletionDate(school.previsaoConclusao)}. A reforma afetará a sala onde estão instalados os equipamentos de internet, além de outras áreas da unidade, sendo necessária a retirada dos equipamentos durante o período da obra.\n\nINEP: ${school.inep || '<inep>'}\nEscola: ${school.escola || '<escola>'}\nEndereço: ${school.endereco || '<Endereço com cep>'}\nLocal: ${school.uf || 'Uf'} ${school.cidade || 'cidade'}\nLatitude: ${school.latitude || '<Latitude>'}\nLongitude: ${school.longitude || '<Longitude>'}\nLocalização fixa: ${school.localizacao || '<Localização fixa>'}\n\nAdicionalmente, informamos que o responsável pela unidade escolar foi orientado a encaminhar ofício ao setor de Planejamento, formalizando a solicitação da retirada temporária dos equipamentos, conforme procedimento estabelecido.\n\n---\nIMPORTANTE:`, [school])

  const stageStatus = (stage) => stage < activeStage ? 'done' : stage === activeStage ? 'current' : 'pending'

  if (flow === 'finished') return <ReformaFinalizada onBack={() => setFlow('select')} onOngoing={() => setFlow('ongoing')} />
  if (flow === 'select') return <ReformaSelection onBack={onBack} onSelect={setFlow} />
  if (flow !== 'ongoing') return <ReformaSelection onBack={onBack} onSelect={setFlow} />

  return <div className="reforma-page">
    <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Voltar para paralisados</button>
    <div className="reforma-heading"><div><span className="eyebrow">Procedimento operacional</span><h1>Reforma Escolar</h1><p>Procedimento para análise e remoção dos equipamentos de internet durante reforma da unidade escolar.</p></div><div className="reforma-heading-badge"><Sparkles size={17} /><span>Fluxo guiado</span></div></div>
    <StageStepper activeStage={activeStage} setActiveStage={setActiveStage} stageStatus={stageStatus} />
    <div className="current-action"><div className="current-action-label"><span className="live-dot" /> Agora</div><div><strong>{activeStage === 1 ? 'Analisar a reforma' : activeStage === 2 ? 'Orientar a escola sobre o ofício' : activeStage === 3 ? 'Receber cópia do ofício' : 'Realizar solicitação ao Planejamento'}</strong><span>{activeStage === 1 ? 'Faça o levantamento antes de decidir o próximo caminho.' : activeStage === 2 ? 'Oriente o envio do ofício e da cópia pelo WhatsApp.' : activeStage === 3 ? 'Aguarde e confira o documento recebido.' : 'Monte o e-mail da equipe com os dados e anexos.'}</span></div><button className="outline-button" onClick={() => setActiveStage(Math.min(4, activeStage + 1))}>Próxima etapa <ChevronDown size={15} className="chevron-right" /></button></div>

    <section className="reforma-section"><SectionTitle number="01" title="Análise da reforma" description="Primeiro, entrar em contato com a responsável pela escola para entender a amplitude da reforma e identificar se existe necessidade de remoção dos equipamentos de internet durante o período da obra." />
      <div className="operational-grid"><div className="message-card"><div className="card-heading"><div><span className="mini-label"><MessageCircle size={13} /> Comunicação</span><h2>Mensagem para enviar à responsável</h2></div><button className="copy-icon" onClick={() => copy(schoolMessage, 'message')} aria-label="Copiar mensagem"><Copy size={16} /></button></div><div className="message-text">{schoolMessage}</div><CopyButton label="COPIAR MENSAGEM" copied={copied === 'message'} onClick={() => copy(schoolMessage, 'message')} /></div><div className="analysis-panel"><div className="card-heading"><div><span className="mini-label"><Clipboard size={13} /> Levantamento</span><h2>Informações coletadas na análise</h2></div></div><div className="analysis-list">{analysisItems.map(([title, description, icon]) => <div className="analysis-item" key={title}><span className={`analysis-icon ${icon}`}><Check size={13} /></span><div><strong>{title}</strong><p>{description}</p></div></div>)}</div></div></div>
    </section>

    <section className="decision-section"><div><span className="mini-label"><ShieldAlert size={13} /> Decisão do fluxo</span><h2>É necessário remover os equipamentos?</h2><p>Selecione o caminho identificado após a coleta das informações.</p></div><div className="decision-options"><button className={`decision-option yes ${decision === 'sim' ? 'selected' : ''}`} onClick={() => setDecision('sim')}><span className="decision-mark">{decision === 'sim' ? <Check size={16} /> : '01'}</span><span><strong>SIM</strong><small>É necessário remover os equipamentos</small></span></button><button className={`decision-option no ${decision === 'nao' ? 'selected' : ''}`} onClick={() => setDecision('nao')}><span className="decision-mark">{decision === 'nao' ? <Check size={16} /> : '02'}</span><span><strong>NÃO</strong><small>Não é necessária a remoção</small></span></button></div>{decision === 'nao' && <div className="inline-notice"><AlertTriangle size={16} /> Procedimento de não remoção ainda não cadastrado.</div>}</section>

    {decision === 'sim' && <>
      <OrientationStage status={orientationStatus} setStatus={setOrientationStatus} confirmationDate={confirmationDate} setConfirmationDate={setConfirmationDate} confirmationNote={confirmationNote} setConfirmationNote={setConfirmationNote} copied={copied} copy={copy} />
      <section className="reforma-section"><SectionTitle number="03" title="Receber cópia do ofício" description="Após orientar a responsável, aguardar o recebimento de uma cópia do ofício pelo WhatsApp." /><div className="attention-grid"><Highlight type="attention" title="ATENÇÃO" text="A responsável pela escola também deve enviar para a equipe, pelo WhatsApp, uma cópia do ofício." icon={<MessageCircle size={18} />} /><Highlight type="evidence" title="COMO ACOMPANHAR" text="Após o envio, por gentileza, nos informe para que possamos acompanhar a solicitação e dar continuidade ao atendimento." icon={<Send size={18} />} /></div><ChecklistCard title="Acompanhamento do recebimento" items={receivedChecklist} values={checked.received} onToggle={(item) => toggleCheck('received', item)} /><div className="subsection-heading"><h2>Conferência do ofício</h2><span>Marque o que foi identificado no documento</span></div><ChecklistCard title="Itens para conferir" items={conferenceChecklist} values={checked.conference} onToggle={(item) => toggleCheck('conference', item)} /></section>
      <section className="reforma-section"><SectionTitle number="04" title="Solicitação ao Planejamento" description="Após receber a cópia do ofício da escola, realizar a solicitação via e-mail por nossa parte." /><TeamEmailCard school={school} setSchool={updateSchool} emailBody={emailBody} copied={copied} copy={copy} /></section>
    </>}
  </div>
}

function StageStepper({ setActiveStage, stageStatus }) {
  const stages = [['Análise da reforma', 'Levantamento'], ['Orientação à escola', 'Ofício'], ['Recebimento do ofício', 'Conferência'], ['Solicitação ao Planejamento', 'Envio']]

  return <div className="stage-stepper">{stages.map(([title, short], index) => { const stage = index + 1; return <button className={`stage-step ${stageStatus(stage)}`} key={title} onClick={() => setActiveStage(stage)}><span className="stage-number">{stageStatus(stage) === 'done' ? <Check size={14} /> : `0${stage}`}</span><span><small>ETAPA {stage}</small><strong>{title}</strong><em>{short}</em></span></button> })}</div>
}

function ReformaSelection({ onBack, onSelect }) {
  return <div className="reforma-selection"><button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Voltar para paralisados</button><div className="selection-heading"><span className="eyebrow">Reforma Escolar</span><h1>Qual momento da reforma?</h1><p>Escolha o procedimento correspondente à situação atual da unidade escolar.</p></div><div className="selection-grid"><article className="selection-card ongoing"><span className="selection-icon">✦</span><span className="eyebrow">Procedimento 01</span><h2>Reforma em andamento</h2><p>Escola ainda está em reforma. Processo de análise e remoção dos equipamentos.</p><button className="selection-action" type="button" onClick={() => onSelect('ongoing')}>Acessar procedimento <ArrowLeft size={15} /></button></article><article className="selection-card finished"><span className="selection-icon">✓</span><span className="eyebrow">Procedimento 02</span><h2>Reforma finalizada</h2><p>Reforma da escola foi concluída. Processo de coleta de evidências e solicitação de reinstalação.</p><button className="selection-action" type="button" onClick={() => onSelect('finished')}>Acessar procedimento <ArrowLeft size={15} /></button></article></div></div>
}

function OrientationStage({ status, setStatus, confirmationDate, setConfirmationDate, confirmationNote, setConfirmationNote, copied, copy }) {
  const statusLabels = { pending: 'Pendente', sent: 'Orientação enviada', confirmed: 'Confirmado', waiting: 'Aguardando ofício' }
  const question = 'Confirma o recebimento da orientação?'
  const ccSummary = 'suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br'

  return <section className="reforma-section orientation-stage">
    <SectionTitle number="02" title="Orientação à responsável pela escola" description="Orientar a responsável sobre o envio do ofício ao setor de Planejamento." />
    <div className="orientation-status-bar"><span className={`status-dot ${status}`} /><div><span className="mini-label">Status da etapa 2</span><strong>{statusLabels[status]}</strong></div><div className="status-actions">{status === 'pending' && <button className="outline-button" onClick={() => setStatus('sent')}><Send size={14} /> Marcar orientação enviada</button>}{status === 'sent' && <button className="outline-button" onClick={() => setStatus('confirmed')}>Registrar confirmação</button>}{status === 'confirmed' && <button className="outline-button" onClick={() => setStatus('waiting')}><Paperclip size={14} /> Aguardar ofício</button>}</div></div>
    <div className="orientation-card"><div className="card-heading"><div><span className="mini-label"><MessageCircle size={13} /> Comunicação oficial</span><h2>ORIENTAÇÃO À RESPONSÁVEL</h2></div><button className="copy-icon" onClick={() => copy(orientationMessage, 'orientation')} aria-label="Copiar orientação"><Copy size={16} /></button></div><div className="orientation-text">{orientationMessage}</div><CopyButton label="COPIAR ORIENTAÇÃO" copied={copied === 'orientation'} copiedLabel="✓ ORIENTAÇÃO COPIADA" onClick={() => copy(orientationMessage, 'orientation')} /></div>
    <div className="confirmation-card"><div className="card-heading"><div><span className="mini-label"><ShieldAlert size={13} /> Registro da orientação</span><h2>CONFIRMAÇÃO DA ORIENTAÇÃO</h2></div><span className={`confirmation-badge ${status === 'confirmed' || status === 'waiting' ? 'confirmed' : ''}`}>{status === 'confirmed' || status === 'waiting' ? 'CONFIRMADO' : 'PENDENTE'}</span></div><p>Após enviar a orientação para a responsável pela escola, solicite a confirmação de recebimento.</p><div className="question-box"><strong>Confirma o recebimento da orientação?</strong><CopyButton label="COPIAR PERGUNTA" copied={copied === 'question'} copiedLabel="✓ PERGUNTA COPIADA" onClick={() => copy(question, 'question')} /></div><div className="confirmation-form"><label><span>Data da confirmação</span><input type="date" value={confirmationDate} onChange={(event) => setConfirmationDate(event.target.value)} /></label><label><span>Observação <em>(opcional)</em></span><input value={confirmationNote} onChange={(event) => setConfirmationNote(event.target.value)} placeholder="Registre uma observação" /></label></div><button className={`confirm-button ${status === 'confirmed' || status === 'waiting' ? 'is-confirmed' : ''}`} onClick={() => setStatus('confirmed')}>{status === 'confirmed' || status === 'waiting' ? <><Check size={15} /> Orientação recebida pela responsável</> : 'Marcar como confirmado'}</button></div>
    <div className="evidence-card"><div className="card-heading"><div><span className="mini-label"><ImagesIcon /> Registro do atendimento</span><h2>EVIDÊNCIA DA ORIENTAÇÃO</h2></div><FileText size={19} className="heading-icon" /></div><p>É necessário manter evidências de que a responsável pela escola foi devidamente orientada sobre o procedimento.</p><div className="evidence-alert"><ShieldAlert size={17} /><strong>Os prints da conversa devem comprovar que a orientação foi enviada à responsável.</strong></div><div className="evidence-record"><strong>EVIDÊNCIA A SER REGISTRADA</strong><span>Guardar no chamado os prints da conversa que comprovem que a responsável foi devidamente orientada.</span></div><div className="evidence-proof"><strong>O print deve demonstrar que:</strong><p>A responsável recebeu a orientação;</p><p>A responsável foi orientada sobre o envio do e-mail ao Planejamento;</p><p>A responsável foi orientada sobre o envio da cópia do ofício para nossa equipe via WhatsApp.</p></div></div>
    <div className={`next-step-card ${status === 'waiting' ? 'ready' : ''}`}><div className="next-step-icon"><ArrowLeft size={18} className="rotate-down" /></div><div><span className="mini-label">Próximo passo</span><h2>Aguardar cópia do ofício</h2><p>Aguardar o envio, pela responsável, de uma cópia do ofício pelo WhatsApp para que nossa equipe possa realizar a solicitação por sua parte.</p></div><span className="waiting-badge">{status === 'waiting' ? 'Aguardando cópia do ofício' : 'Após confirmação'}</span></div>
    <div className="two-sends"><div><span>ENVIO 1 — RESPONSÁVEL → PLANEJAMENTO</span><strong>{PLANEJAMENTO_TO}</strong><small>CC: {ccSummary} · O e-mail deve conter o ofício da escola.</small></div><div><span>ENVIO 2 — RESPONSÁVEL → NOSSA EQUIPE</span><strong><MessageCircle size={14} /> Cópia do ofício pelo WhatsApp</strong><small>Esta cópia será utilizada posteriormente pela equipe.</small></div></div>
  </section>
}

function ImagesIcon() { return <span aria-hidden="true">◆</span> }
function SectionTitle({ number, title, description }) { return <div className="section-title"><span className="section-number">{number}</span><div><span className="eyebrow">Passo {number}</span><h2>ETAPA {Number(number)} — {title}</h2><p>{description}</p></div></div> }
function CopyButton({ label, copied, copiedLabel = '✓ Mensagem copiada!', onClick }) { return <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={onClick}>{copied ? <><Check size={15} /> {copiedLabel}</> : <><Copy size={15} /> {label}</>}</button> }
function ChecklistCard({ title, items, values, onToggle }) { return <div className="checklist-card"><div className="card-heading"><div><span className="mini-label"><FileCheck2 size={13} /> Checklist</span><h2>{title}</h2></div><span className="check-progress">{values.length}/{items.length}</span></div><div className="checklist-items">{items.map((item) => <label className={`check-item ${values.includes(item) ? 'checked' : ''}`} key={item}><input type="checkbox" checked={values.includes(item)} onChange={() => onToggle(item)} /><span className="check-box"><Check size={13} /></span><span>{item}</span></label>)}</div></div> }
function Highlight({ type, title, text, icon }) { return <div className={`highlight ${type}`}><span className="highlight-icon">{icon}</span><div><strong>{title}</strong><p>{text}</p></div></div> }
function CopyField({ label, value, copy, copied }) { return <div className="copy-field"><span>{label}</span><div><code>{value}</code><button onClick={() => copy(value, label)} aria-label={`Copiar ${label}`}><Copy size={14} /></button></div>{copied === label && <small>Copiado!</small>}</div> }
function TeamEmailCard({ school, setSchool, emailBody, copied, copy }) {
  const fields = [['inep', 'INEP'], ['escola', 'Escola'], ['endereco', 'Endereço completo com CEP'], ['uf', 'UF'], ['cidade', 'Cidade'], ['latitude', 'Latitude'], ['longitude', 'Longitude'], ['localizacao', 'Localização fixa'], ['previsaoConclusao', 'Previsão de conclusão da reforma']]

  return <div className="team-email-wrap"><div className="school-data-card"><div className="card-heading"><div><span className="mini-label"><Clipboard size={13} /> Preenchimento</span><h2>Dados da escola</h2></div><span className="required-note">Preencha antes de enviar</span></div><div className="school-form">{fields.map(([field, label]) => <label key={field} className={field === 'endereco' ? 'wide-field' : ''}><span>{label}</span><input type={field === 'previsaoConclusao' ? 'date' : 'text'} value={school[field]} onChange={(event) => setSchool(field, event.target.value)} placeholder={label} /></label>)}</div></div><div className="team-email-card"><div className="card-heading"><div><span className="mini-label"><Send size={13} /> Solicitação da equipe</span><h2>MODELO DE E-MAIL — SOLICITAÇÃO DE REMOÇÃO</h2></div><button className="copy-icon" onClick={() => copy(emailBody, 'body')} aria-label="Copiar corpo do e-mail"><Copy size={16} /></button></div><div className="team-email-meta"><EmailRecipients to={PLANEJAMENTO_TO} cc={PLANEJAMENTO_CC_STRING.split('; ').map((item) => item.trim())} copy={copy} copied={copied} /><CopyField label="ASSUNTO" value="REFORMA ESCOLAR - ESCOLA - INEP" copy={copy} copied={copied} /><div className="attachment-list"><span>ANEXOS</span><div><Paperclip size={14} /> EVIDENCIAS_ESCOLA_EM_REFORMA.ZIP</div><div><Paperclip size={14} /> Ofício da escola</div></div></div><pre className="email-body">{emailBody}</pre><div className="email-actions"><CopyButton label="COPIAR E-MAIL" copied={copied === 'full-email'} onClick={() => copy(emailBody, 'full-email')} /><button className="body-copy-button" onClick={() => copy(emailBody, 'body')}><Copy size={14} /> Copiar corpo do e-mail</button></div></div></div>
}
