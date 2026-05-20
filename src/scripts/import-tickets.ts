/**
 * Import tickets from tickets_paid_event20.txt into Supabase.
 * Run: npx tsx src/scripts/import-tickets.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Колонки соответствуют реальной схеме таблицы tickets
interface ParsedTicket {
  id_event: string
  firtsname: string    // опечатка в БД — намеренно
  lastname: string | null
  phone: string
  len: number
  price: number
  status: string
  created_at: string
}

function parseDate(raw: string): string {
  // "20.04.2026 20:09" → ISO 8601
  const [datePart, timePart] = raw.trim().split(' ')
  const [day, month, year] = datePart.split('.')
  return `${year}-${month}-${day}T${timePart}:00+03:00`
}

function parseFile(filePath: string): ParsedTicket[] {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n')
  const tickets: ParsedTicket[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('-') || trimmed.startsWith('#') || trimmed.startsWith('С') || trimmed.startsWith('И') || trimmed.startsWith('Статус')) continue

    // Строка с именем + фамилией: "1  Даша  Качурина  +79003301001  2  6000  20.04.2026 20:09"
    const match = trimmed.match(/^(\d+)\s+(\S+)\s+(\S+)\s+(\+\d+)\s+(\d+)\s+(\d+)\s+(.+)$/)
    if (!match) {
      // Без фамилии: "20  Анна  +79173101919  2  6000  23.04.2026 10:45"
      const matchNoLast = trimmed.match(/^(\d+)\s+(\S+)\s+(\+\d+)\s+(\d+)\s+(\d+)\s+(.+)$/)
      if (matchNoLast) {
        tickets.push({
          id_event: '20',
          firtsname: matchNoLast[2],
          lastname: null,
          phone: matchNoLast[3],
          len: parseInt(matchNoLast[4], 10),
          price: parseInt(matchNoLast[5], 10),
          status: 'paid',
          created_at: parseDate(matchNoLast[6]),
        })
      }
      continue
    }

    tickets.push({
      id_event: '20',
      firtsname: match[2],
      lastname: match[3],
      phone: match[4],
      len: parseInt(match[5], 10),
      price: parseInt(match[6], 10),
      status: 'paid',
      created_at: parseDate(match[7]),
    })
  }

  return tickets
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'data/tickets_paid_event20.txt')
  const tickets = parseFile(filePath)
  console.log(`Parsed ${tickets.length} tickets`)

  const { error } = await supabase.from('tickets').insert(tickets)
  if (error) {
    console.error('Import failed:', error.message)
    process.exit(1)
  }

  console.log(`Imported ${tickets.length} tickets for event #20`)
}

main()
