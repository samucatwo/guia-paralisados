import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, Copy, FileText, Mail, MessageCircle, Paperclip, ShieldAlert } from 'lucide-react'
import { EmailRecipients, PLANEJAMENTO_CC, PLANEJAMENTO_CC_STRING, PLANEJAMENTO_TO } from '../components/EmailRecipients'

const orientationText = `Para dar continuidade ao processo, é necessário encaminhar um e-mail para planejamento@eace.org.br com cópia para suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br, anexando um ofício da escola informando que a reforma foi finalizada e solicitando a reinstalação dos equipamentos.

O ofício deverá conter as seguintes informações:

- Nome e INEP da escola;
- Endereço completo da escola, com CEP;
- Latitude e Longitude da unidade;
- Informação de que a reforma foi concluída;
- Solicitação de reinstalação dos equipamentos;
- Esclarecimento sobre a motivação da situação da escola (informando que a unidade permaneceu em reforma).
Após elaborar o ofício:

1. Abra o e-mail e clique em "Escrever" ou "Novo e-mail";
2. No campo Destinatário, informe: planejamento@eace.org.br;
3. No campo Cópia (CC), informe: suporte@eace.org.br; martino.cardoso@gtsnet.com.br; douglas.bicudo@eace.org.br; cristiano.sousa@gtsnet.com.br;
4. No Assunto, utilize:
"Solicitação de reinstalação de equipamentos pós-reforma - INEP: [INEP da escola]";
5. Anexe o ofício ao e-mail;
6. Confira se o anexo foi incluído corretamente e clique em "Enviar".
Após o envio, por gentileza, nos informe para que possamos acompanhar a solicitação e dar continuidade ao atendimento.`

const initialSchool = { inep: '', escola: '', local: '', endereco: '', latitude: '', longitude: '' }
export function ReformaFinalizada({ onBack, onOngoing }) {
  const [stage, setStage] = useState(1)
  const [decision, setDecision] = useState('sim')
  const [confirmation, setConfirmation] = useState('pending')
  const [copied, setCopied] = useState('')
  const [school, setSchool] = useState(initialSchool)

  const emailBody = useMemo(() => `Prezados,\n\nInformamos que a unidade escolar concluiu a reforma de sua estrutura física.\n\nINEP: ${school.inep || ''}\n\nEscola: ${school.escola || ''}\n\nLocal: ${school.local || ''}\n\nEndereço: ${school.endereco || ''}\n\nLatitude: ${school.latitude || ''}\n\nLongitude: ${school.longitude || ''}\n\nApós verificação realizada no local, com a devida coleta de evidências, constatou-se que o ambiente encontra-se em conformidade com os requisitos necessários, estando apto para a execução das atividades de reinstalação dos equipamentos.\n\nAdicionalmente, informamos que a responsável pela unidade escolar foi devidamente orientada a encaminhar ofício ao setor de Planejamento, formalizando a conclusão da reforma e solicitando a reinstalação dos equipamentos, conforme procedimento estabelecido.`, [school])

  const copy = async (value, key) => {
    await navigator.clipboard.writeText(value)
    setCopied(key)
    window.setTimeout(() => setCopied(''), 2200)
  }
  const updateSchool = (field, value) => setSchool((current) => ({ ...current, [field]: value }))
  const selectStage = (nextStage) => {
    setStage(nextStage)
    window.setTimeout(() => document.getElementById(`etapa-reforma-finalizada-${nextStage}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  if (decision === 'nao') return <div className="finished-flow"><BackButton onClick={onBack} /><FlowHeader onBack={onBack} /><div className="finished-decision-stop"><AlertTriangle size={24} /><h2>A reforma ainda não foi finalizada.</h2><p>Siga o procedimento "Reforma em andamento".</p><button className="finished-primary-button" onClick={onOngoing}>IR PARA REFORMA EM ANDAMENTO</button></div></div>

  return <div className="finished-flow">
    <BackButton onClick={onBack} />
    <FlowHeader onBack={onBack} />
    <FinishedStepper stage={stage} onStage={selectStage} />
    <div className="finished-now"><span><span className="finished-live-dot" /> EM ANDAMENTO</span><strong>{stage === 1 ? 'Confirmar se a reforma terminou' : stage === 2 ? 'Coletar evidências e orientar a responsável' : 'Solicitar reinstalação ao Planejamento'}</strong><button onClick={() => setStage(Math.min(3, stage + 1))}>Próxima etapa <ArrowLeft size={14} /></button></div>

    <section id="etapa-reforma-finalizada-1" className="finished-section"><FinishedTitle number="01" title="Confirmar conclusão" description="Entrar em contato com o(a) responsável pela escola e verificar se a reforma da unidade foi concluída." /><div className="finished-confirm-card"><div className="finished-card-heading"><div><span className="finished-label"><MessageCircle size={13} /> Confirmação com a escola</span><h2>CONFIRMAÇÃO COM A ESCOLA</h2></div><button className="finished-copy-icon" onClick={() => copy('A reforma da escola foi finalizada?', 'question-1')}><Copy size={16} /></button></div><p>Perguntar ao(à) responsável pela escola se a reforma da unidade foi finalizada.</p><CopyButton label="COPIAR PERGUNTA" copied={copied === 'question-1'} copiedLabel="✓ PERGUNTA COPIADA!" onClick={() => copy('A reforma da escola foi finalizada?', 'question-1')} /></div><div className="finished-question"><strong>A reforma foi finalizada?</strong><div><button className={decision === 'sim' ? 'selected' : ''} onClick={() => setDecision('sim')}><Check size={15} /> SIM — REFORMA FINALIZADA</button><button className="negative" onClick={() => setDecision('nao')}><ArrowLeft size={15} /> NÃO — REFORMA AINDA EM ANDAMENTO</button></div></div></section>

    <section id="etapa-reforma-finalizada-2" className="finished-section"><FinishedTitle number="02" title="Coleta de evidências e orientação" description="Após confirmar que a reforma foi finalizada, realizar a coleta de fotos da escola após a reforma e orientar a responsável sobre o envio do ofício ao setor de Planejamento." /><div className="finished-two-columns"><EvidenceCard title="EVIDÊNCIAS DA REFORMA FINALIZADA" description="Coletar fotos da escola após a reforma, incluindo os cômodos e os ambientes relevantes para verificar a situação da unidade." instruction="Registrar no chamado as fotos coletadas da escola após a reforma." icon={<FileText size={19} />} /><div className="finished-highlight"><ShieldAlert size={18} /><div><strong>ATENÇÃO</strong><p>A responsável deve ser orientada sobre o envio do ofício ao Planejamento.</p></div></div></div><div className="finished-orientation-card"><div className="finished-card-heading"><div><span className="finished-label"><MessageCircle size={13} /> Comunicação oficial</span><h2>ORIENTAÇÃO À RESPONSÁVEL — OFÍCIO DE REINSTALAÇÃO</h2></div><button className="finished-copy-icon" onClick={() => copy(orientationText, 'orientation')}><Copy size={16} /></button></div><pre>{orientationText}</pre><CopyButton label="COPIAR ORIENTAÇÃO" copied={copied === 'orientation'} copiedLabel="✓ ORIENTAÇÃO COPIADA!" onClick={() => copy(orientationText, 'orientation')} /></div><div className="finished-confirmation-card"><div className="finished-card-heading"><div><span className="finished-label"><ShieldAlert size={13} /> Importante</span><h2>CONFIRMAÇÃO DA ORIENTAÇÃO</h2></div><span className={`finished-status ${confirmation === 'confirmed' ? 'confirmed' : ''}`}>{confirmation === 'confirmed' ? 'CONFIRMADO' : 'PENDENTE'}</span></div><p>Após enviar a orientação, solicitar à responsável a confirmação de recebimento.</p><div className="finished-question-prompt"><strong>Confirma o recebimento da orientação?</strong><CopyButton label="COPIAR PERGUNTA" copied={copied === 'question-2'} copiedLabel="✓ PERGUNTA COPIADA!" onClick={() => copy('Confirma o recebimento da orientação?', 'question-2')} /></div><button className="finished-confirm-button" onClick={() => setConfirmation('confirmed')}>{confirmation === 'confirmed' ? <><Check size={15} /> Responsável confirmou o recebimento da orientação.</> : 'Marcar como confirmado'}</button></div><EvidenceCard title="EVIDÊNCIA DA ORIENTAÇÃO" description="Guardar no chamado os prints que comprovem que a responsável foi devidamente orientada." instruction="Registrar no chamado o print da conversa demonstrando que a responsável foi orientada." icon={<MessageCircle size={19} />} /></section>

    <section className="finished-section"><FinishedTitle number="03" title="Solicitação de reinstalação ao Planejamento" description="Após a coleta das evidências e a orientação da responsável, realizar a solicitação de reinstalação dos equipamentos via e-mail por nossa parte." /><TeamFinishedEmail school={school} updateSchool={updateSchool} emailBody={emailBody} copy={copy} copied={copied} /></section>
  </div>
}

function BackButton({ onClick }) { return <button className="back-button" onClick={onClick}><ArrowLeft size={16} /> Voltar para reforma escolar</button> }
function FlowHeader() { return <div className="finished-heading"><div><span className="eyebrow">Procedimento operacional</span><h1>Reforma Finalizada</h1><p>Procedimento para confirmação da conclusão da reforma e solicitação de reinstalação dos equipamentos.</p></div><span className="finished-flow-badge"><SparklesIcon /> Fluxo guiado</span></div> }
function SparklesIcon() { return <span aria-hidden="true">✦</span> }
function FinishedStepper({ stage, onStage }) { const items = ['Confirmar conclusão', 'Coletar evidências e orientar a responsável', 'Solicitar reinstalação ao Planejamento']; return <div className="finished-stepper">{items.map((item, index) => <button className={stage === index + 1 ? 'active' : stage > index + 1 ? 'done' : ''} onClick={() => onStage(index + 1)} key={item}><span>{stage > index + 1 ? <Check size={14} /> : `0${index + 1}`}</span><small>ETAPA {index + 1}</small><strong>{item}</strong></button>)}</div> }
function FinishedTitle({ number, title, description }) { return <div className="finished-title"><span>{number}</span><div><em>PASSO {number}</em><h2>ETAPA {Number(number)} — {title}</h2><p>{description}</p></div></div> }
function CopyButton({ label, copied, copiedLabel, onClick }) { return <button className={`finished-copy-button ${copied ? 'copied' : ''}`} onClick={onClick}><Copy size={14} /> {copied ? copiedLabel : label}</button> }
function EvidenceCard({ title, description, instruction, icon }) { return <div className="finished-evidence-card"><div className="finished-card-heading"><div><span className="finished-label">{icon} Registro orientado</span><h2>{title}</h2></div></div><p>{description}</p><div className="finished-evidence-instruction"><strong>EVIDÊNCIAS A SEREM REGISTRADAS</strong><span>{instruction}</span></div></div> }
function TeamFinishedEmail({ school, updateSchool, emailBody, copy, copied }) { const fields = [['inep', 'INEP'], ['escola', 'Escola'], ['local', 'Local'], ['endereco', 'Endereço'], ['latitude', 'Latitude'], ['longitude', 'Longitude']]; const fullEmail = `Para: ${PLANEJAMENTO_TO}\nCC: ${PLANEJAMENTO_CC_STRING}\nAssunto: REFORMA FINALIZADA - ESCOLA - INEP\n\n${emailBody}`; return <div className="finished-team-email"><div className="finished-school-form"><div className="finished-card-heading"><div><span className="finished-label"><FileText size={13} /> Preenchimento</span><h2>DADOS DA ESCOLA</h2></div></div><div>{fields.map(([field, label]) => <label key={field}><span>{label}</span><input value={school[field]} onChange={(event) => updateSchool(field, event.target.value)} placeholder={label} /></label>)}</div></div><div className="finished-mail-card"><div className="finished-card-heading"><div><span className="finished-label"><Mail size={13} /> Solicitação da equipe</span><h2>MODELO DE E-MAIL — REFORMA FINALIZADA</h2></div><button className="finished-copy-icon" onClick={() => copy(emailBody, 'email-body')}><Copy size={16} /></button></div><div className="finished-mail-fields"><EmailRecipients to={PLANEJAMENTO_TO} cc={PLANEJAMENTO_CC} copy={copy} copied={copied} /><CopyField label="ASSUNTO" value="REFORMA FINALIZADA - ESCOLA - INEP" copy={copy} copied={copied} /><div className="finished-attachments"><span>ANEXOS OBRIGATÓRIOS</span><p><Paperclip size={14} /> EVIDENCIAS_REFORMA_FINALIZADA</p><p><Paperclip size={14} /> OFICIO</p></div></div><pre>{emailBody}</pre><CopyButton label="COPIAR E-MAIL" copied={copied === 'email-full'} copiedLabel="✓ E-MAIL COPIADO!" onClick={() => copy(fullEmail, 'email-full')} /><button className="finished-body-copy" onClick={() => copy(emailBody, 'email-body')}> <Copy size={14} /> Copiar corpo</button></div></div> }
function CopyField({ label, value, copy, copied }) { return <div className="finished-copy-field"><span>{label}</span><div><code>{value}</code><button onClick={() => copy(value, label)}><Copy size={13} /></button></div>{copied === label && <small>Copiado!</small>}</div> }
