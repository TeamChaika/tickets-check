export interface Ticket {
  id: string           // uuid
  created_at: string
  len: number          // кол-во билетов
  pay: string | null   // способ оплаты
  firtsname: string    // опечатка в БД — не менять
  lastname: string | null
  status: string       // 'paid' | etc.
  table: string | null
  phone: string
  comment: string | null
  inhall: number | null
  smsrequest: string | null
  promo: string | null
  event: string | null
  id_event: string
  price: number
}

export interface Event {
  id: number
  created_at: string
  name: string
  price: number
  img_background: string | null
  img_logo: string | null
  img_card: string | null
  description: string | null
  id_org: string | null
  date: string | null
  time: string | null
  sale_on: boolean
}

export interface Promocode {
  id: number
  created_at: string
  code: string
  event: string | null
  blog_name: string | null
  dicount: number      // опечатка в БД — не менять
  type: string | null
  active_code: boolean
  active_from: string | null
  active_to: string | null
}

export interface TicketStats {
  total_buyers: number
  total_tickets: number
  total_revenue: number
}
