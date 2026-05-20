-- Events table
create table if not exists events (
  id          serial primary key,
  name        text not null default '',
  status      text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- Tickets table
create table if not exists tickets (
  id            serial primary key,
  event_id      integer not null references events(id) on delete cascade,
  first_name    text not null,
  last_name     text,
  phone         text not null,
  quantity      integer not null check (quantity > 0),
  amount        integer not null check (amount >= 0),
  purchased_at  timestamptz not null,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_tickets_event_id on tickets(event_id);
create index if not exists idx_tickets_phone    on tickets(phone);
create index if not exists idx_tickets_purchased_at on tickets(purchased_at);

-- Seed event #20
insert into events (id, name, status)
values (20, 'Событие 20', 'active')
on conflict (id) do nothing;

-- Stats view
create or replace view ticket_stats as
select
  event_id,
  count(*)          as total_buyers,
  sum(quantity)     as total_tickets,
  sum(amount)       as total_revenue
from tickets
group by event_id;
