import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, Copy, FileText, Mail, MessageCircle, Paperclip, ShieldAlert } from 'lucide-react'
import { EmailRecipients, PLANEJAMENTO_CC, PLANEJAMENTO_CC_STRING, PLANEJAMENTO_TO } from '../components/EmailRecipients'

const orientationText = `Por gentileza, solicitamos o envio de um ofício para o e-mail planejamento@eace.org.br, com cópia para suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br, formalizando a desativação da unidade escolar.

O documento deverá conter as informações pertinentes sobre a desativação para que possamos dar continuidade aos procedimentos necessários.

Para identificação da unidade e continuidade da tratativa, solicitamos que o ofício também contenha:

- Nome da escola;
- INEP da escola;
- Endereço completo da unidade, com CEP;
- Latitude e Longitude;
- Informação de que a unidade escolar foi desativada;
- Motivo ou contexto da desativação, quando informado pela escola.

Após elaborar o ofício, encaminhe-o para:

Destinatário: planejamento@eace.org.br

CC: suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br

Após o envio do ofício, pedimos a gentileza de nos informar para que possamos acompanhar o recebimento e dar prosseguimento à tratativa.

Pedimos também que, assim que o ofício for enviado, a responsável nos encaminhe uma cópia do documento pelo WhatsApp, para que possamos realizar a solicitação por nossa parte.

Ficamos no aguardo.`

const initialSchool = { inep: '', escola: '', local: '', endereco: '', latitude: '', longitude: '', fixa: '' }
export function EscolaDesativada({ onBack }) {
  const [stage, setStage] = useState(1)
  const [decision, setDecision] = useState('sim')
  const [confirmation, setConfirmation] = useState(false)
  const [copied, setCopied] = useState('')
  const [school, setSchool] = useState(initialSchool)
  const emailBody = useMemo(() => `Prezados,\n\nInformamos que a ${school.escola || '[Escola]'}, localizada no município de ${school.local || '[Cidade - UF]'}, INEP ${school.inep || '[INEP]'}, foi desativada.\n\nDessa forma, faz-se necessária a remoção dos equipamentos instalados na unidade.\n\nRessaltamos que o responsável pela escola foi orientado a encaminhar, por e-mail, o ofício oficial informando a desativação da unidade, para que sejam adotadas as providências cabíveis.\n\nDados da escola:\n\nEscola: ${school.escola}\n\nINEP: ${school.inep}\n\nLocal: ${school.local}\n\nEndereço: ${school.endereco}\n\nLatitude: ${school.latitude}\n\nLongitude: ${school.longitude}\n\nLocalização fixa: ${school.fixa}\n\nFicamos no aguardo das providências.`, [school])
  const emailSubject = `ESCOLA DESATIVADA - ${school.escola || '[Escola]'} - ${school.inep || '[INEP]'}`
  const copy = async (value, key) => { await navigator.clipboard.writeText(value); setCopied(key); window.setTimeout(() => setCopied(''), 2200) }
  const selectStage = (nextStage) => { setStage(nextStage); window.setTimeout(() => document.getElementById(`etapa-escola-desativada-${nextStage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0) }
  const update = (field, value) => setSchool((current) => ({ ...current, [field]: value }))

  if (decision === 'nao') return <div className="inactive-flow"><BackButton onClick={onBack} /><FlowHeader /><div className="inactive-stop"><AlertTriangle size={24} /><h2>A escola não foi confirmada como desativada.</h2><p>Não seguir para o fluxo de escola desativada.</p><button onClick={() => setDecision('sim')}>VOLTAR À DECISÃO</button></div></div>

  return <div className="inactive-flow"><BackButton onClick={onBack} /><FlowHeader /><InactiveStepper stage={stage} onStage={selectStage} /><div className="inactive-now"><span><i /> EM ANDAMENTO</span><strong>{stage === 1 ? 'Confirmar desativação' : stage === 2 ? 'Orientar responsável' : 'Solicitar remoção ao Planejamento'}</strong><button onClick={() => selectStage(Math.min(3, stage + 1))}>Próxima etapa <ArrowLeft size={14} /></button></div>
    <section id="etapa-escola-desativada-1" className="inactive-section"><SectionTitle number="01" title="Confirmar desativação" description="Confirmar com o(a) responsável pela escola se a unidade foi desativada." /><div className="inactive-card"><CardHeading icon={<MessageCircle size={13} />} title="CONFIRMAÇÃO COM A RESPONSÁVEL" /><p>Perguntar ao(à) responsável pela escola se a unidade foi desativada.</p><CopyButton label="COPIAR PERGUNTA" copied={copied === 'q1'} onClick={() => copy('A escola foi desativada?', 'q1')} /></div><div className="inactive-decision"><strong>A escola foi desativada?</strong><div><button className="selected" onClick={() => setDecision('sim')}><Check size={14} /> SIM — ESCOLA DESATIVADA</button><button onClick={() => setDecision('nao')}><ArrowLeft size={14} /> NÃO — ESCOLA NÃO DESATIVADA</button></div></div></section>
    <section id="etapa-escola-desativada-2" className="inactive-section"><SectionTitle number="02" title="Orientar responsável" description="Orientar a responsável a formalizar a desativação da unidade por meio de ofício encaminhado ao setor de Planejamento." /><div className="inactive-card orientation-inactive"><CardHeading icon={<MessageCircle size={13} />} title="ORIENTAÇÃO À RESPONSÁVEL — OFÍCIO DE DESATIVAÇÃO" /><pre>{orientationText}</pre><CopyButton label="COPIAR ORIENTAÇÃO" copied={copied === 'orientation'} onClick={() => copy(orientationText, 'orientation')} /></div><div className="inactive-card"><CardHeading icon={<ShieldAlert size={13} />} title="CONFIRMAÇÃO DA ORIENTAÇÃO" /><p>Após enviar a orientação, solicitar à responsável a confirmação do recebimento.</p><div className="inactive-question"><strong>Confirma o recebimento da orientação?</strong><CopyButton label="COPIAR PERGUNTA" copied={copied === 'q2'} onClick={() => copy('Confirma o recebimento da orientação?', 'q2')} /></div><button className="inactive-confirm" onClick={() => setConfirmation(true)}>{confirmation ? <><Check size={14} /> CONFIRMADO</> : 'PENDENTE — MARCAR COMO CONFIRMADO'}</button></div><div className="inactive-card evidence-inactive"><CardHeading icon={<FileText size={13} />} title="EVIDÊNCIA DA ORIENTAÇÃO" /><p>Guardar no chamado o print da conversa demonstrando que a responsável foi devidamente orientada sobre o envio do ofício.</p><div className="record-note"><strong>REGISTRO EXTERNO</strong><span>O guia não armazena prints. Registre a evidência no chamado conforme o procedimento da equipe.</span></div></div><div className="waiting-note"><Paperclip size={17} /><div><strong>AGUARDAR CÓPIA DO OFÍCIO</strong><p>Assim que a responsável conseguir o ofício, solicitar que ela envie uma cópia para nossa equipe pelo WhatsApp.</p></div></div></section>
    <section id="etapa-escola-desativada-3" className="inactive-section"><SectionTitle number="03" title="Solicitação ao Planejamento" description="Após conseguir o ofício da escola, realizar a solicitação de remoção dos equipamentos via e-mail por nossa parte." /><InactiveEmail school={school} update={update} emailBody={emailBody} emailSubject={emailSubject} copy={copy} copied={copied} /></section>
  </div>
}

function BackButton({ onClick }) { return <button className="back-button" onClick={onClick}><ArrowLeft size={16} /> Voltar para paralisados</button> }
function FlowHeader() { return <div className="inactive-heading"><div><span className="eyebrow">Procedimento operacional</span><h1>Escola Desativada</h1><p>Procedimento para confirmação da desativação da unidade e solicitação de remoção dos equipamentos.</p></div></div> }
function InactiveStepper({ stage, onStage }) { const items = ['Confirmar desativação', 'Orientar responsável', 'Solicitar remoção ao Planejamento']; return <div className="inactive-stepper">{items.map((item, index) => <button className={stage === index + 1 ? 'active' : stage > index + 1 ? 'done' : ''} onClick={() => onStage(index + 1)} key={item}><span>{stage > index + 1 ? <Check size={14} /> : `0${index + 1}`}</span><small>ETAPA {index + 1}</small><strong>{item}</strong></button>)}</div> }
function SectionTitle({ number, title, description }) { return <div className="inactive-title"><span>{number}</span><div><em>PASSO {number}</em><h2>ETAPA {Number(number)} — {title}</h2><p>{description}</p></div></div> }
function CardHeading({ icon, title, label = 'ORIENTAÇÃO' }) { return <div className="inactive-card-heading"><span className="inactive-label">{icon} {label}</span><h2>{title}</h2></div> }
function CopyButton({ label, copied, onClick }) { return <button className={`inactive-copy ${copied ? 'copied' : ''}`} onClick={onClick}><Copy size={14} /> {copied ? '✓ COPIADO!' : label}</button> }
function InactiveEmail({ school, update, emailBody, emailSubject, copy, copied }) { const fields = [['escola', 'Escola'], ['inep', 'INEP'], ['local', 'Local'], ['endereco', 'Endereço'], ['latitude', 'Latitude'], ['longitude', 'Longitude'], ['fixa', 'Localização fixa']]; const fullEmail = `Para: ${PLANEJAMENTO_TO}\nCC: ${PLANEJAMENTO_CC_STRING}\nAssunto: ${emailSubject}\n\n${emailBody}`; return <div className="inactive-email"><div className="inactive-card"><CardHeading icon={<FileText size={13} />} label="PREENCHIMENTO" title="Dados da escola" /><div className="inactive-form">{fields.map(([field, label]) => <label key={field}><span>{label}</span><input value={school[field]} onChange={(event) => update(field, event.target.value)} placeholder={label} /></label>)}</div></div><div className="inactive-card inactive-mail-card"><CardHeading icon={<Mail size={13} />} label="SOLICITAÇÃO DA EQUIPE" title="Modelo de e-mail — Escola Desativada" /><div className="inactive-mail-meta"><EmailRecipients to={PLANEJAMENTO_TO} cc={PLANEJAMENTO_CC} copy={copy} copied={copied} /><CopyField label="Assunto" value={emailSubject} copy={copy} copied={copied} /></div><pre>{emailBody}</pre><div className="inactive-document"><span>Documento que deve ser enviado</span><strong><Paperclip size={14} /> Ofício da escola</strong><p>O ofício oficial da escola deve ser anexado ao e-mail antes do envio.</p></div><CopyButton label="COPIAR E-MAIL" copied={copied === 'email'} onClick={() => copy(fullEmail, 'email')} /><button className="inactive-body-copy" onClick={() => copy(emailBody, 'body')}><Copy size={14} /> Copiar corpo do e-mail</button></div></div> }
function CopyField({ label, value, copy, copied }) { return <div className="inactive-copy-field"><span>{label}</span><div><code>{value}</code><button onClick={() => copy(value, label)}><Copy size={13} /></button></div>{copied === label && <small>Copiado!</small>}</div> }
