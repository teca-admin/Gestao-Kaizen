export interface User {
  name: string;
  role: string;
}

export interface InfrastructureEvent {
  id?: number;
  code: string;
  name: string;
  description: string;
  leader: string;
  shift: string;
  sector: string;
  date: string;
  supervisor: string;
  os_vinci: string;
  photo: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
}

export type Sector = 'Internação' | 'Carga Nacional/Paletizada' | 'Exportação' | 'Recebimento' | 'Liberação';
