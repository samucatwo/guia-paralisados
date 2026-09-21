import { Check, Copy } from 'lucide-react'

export const PLANEJAMENTO_TO = 'planejamento@eace.org.br'
export const PLANEJAMENTO_CC = [
  'suporte@eace.org.br',
  'martino.cardoso@gtsnet.com.br',
  'douglas.bicudo@eace.org.br',
  'cristiano.sousa@gtsnet.com.br',
]
export const PLANEJAMENTO_CC_STRING = PLANEJAMENTO_CC.join('; ')

export function EmailRecipients({ to = PLANEJAMENTO_TO, cc = PLANEJAMENTO_CC, copy, copied }) {
  const ccValue = Array.isArray(cc) ? cc.join('; ') : cc

  return (
    <div className="email-recipient-panel">
      <div className="recipient-row">
        <span className="recipient-label">DESTINATÁRIO</span>
        <div className="recipient-box">
          <code>{to}</code>
          <button
            type="button"
            className="recipient-copy"
            onClick={() => copy(to, 'destinatario')}
            aria-label="Copiar destinatário"
          >
            {copied === 'destinatario' ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="recipient-row">
        <span className="recipient-label">CC</span>
        <div className="cc-list">
          {Array.isArray(cc) ? (
            cc.map((address) => (
              <div className="cc-item" key={address}>
                <code>{address}</code>
                <button
                  type="button"
                  className="recipient-copy"
                  onClick={() => copy(address, `cc-${address}`)}
                  aria-label={`Copiar ${address}`}
                >
                  {copied === `cc-${address}` ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))
          ) : (
            <div className="cc-item">
              <code>{ccValue}</code>
              <button
                type="button"
                className="recipient-copy"
                onClick={() => copy(ccValue, 'cc-all')}
                aria-label="Copiar CC"
              >
                {copied === 'cc-all' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>
      </div>

      <button type="button" className="copy-cc-button" onClick={() => copy(ccValue, 'cc-all')}>
        {copied === 'cc-all' ? <><Check size={15} /> ✓ CC COPIADO</> : <><Copy size={15} /> COPIAR CC</>}
      </button>
    </div>
  )
}
