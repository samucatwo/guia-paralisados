import { Archive, MapPin, School } from 'lucide-react'

export const categories = [
  {
    id: 'reforma-escolar',
    title: 'Reforma Escolar',
    shortTitle: 'Reforma',
    description: 'Orientações para chamados relacionados a reformas escolares.',
    icon: School,
    accent: 'amber',
    fields: ['Descrição', 'Quando utilizar', 'Documentos necessários', 'Etapas', 'Checklist', 'Responsáveis', 'Prazos', 'Observações', 'Regras', 'Histórico', 'Orientações', 'Links e anexos', 'Situações especiais'],
  },
  {
    id: 'mudanca-endereco',
    title: 'Mudança de Endereço',
    shortTitle: 'Mudança',
    description: 'Estrutura para orientar chamados de mudança de endereço.',
    icon: MapPin,
    accent: 'cyan',
    fields: ['Descrição', 'Quando utilizar', 'Documentos necessários', 'Etapas', 'Checklist', 'Responsáveis', 'Prazos', 'Observações', 'Regras', 'Histórico', 'Orientações', 'Links e anexos', 'Situações especiais'],
  },
  {
    id: 'escola-desativada',
    title: 'Escola Desativada',
    shortTitle: 'Desativada',
    description: 'Estrutura para orientar chamados de escolas desativadas.',
    icon: Archive,
    accent: 'rose',
    fields: ['Descrição', 'Quando utilizar', 'Documentos necessários', 'Etapas', 'Checklist', 'Responsáveis', 'Prazos', 'Observações', 'Regras', 'Histórico', 'Orientações', 'Links e anexos', 'Situações especiais'],
  },
]
