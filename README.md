# 🎫 Tickets Check - Сервис проверки билетов

PWA приложение для проверки билетов на мероприятия с QR-сканером.

## ✨ Возможности

- 📷 Сканирование QR-кодов билетов камерой
- 🔍 Поиск билетов по фамилии или телефону
- 👥 Частичный проход гостей (билет на несколько человек)
- 📊 Статистика по мероприятиям в реальном времени
- 📱 PWA - работает как мобильное приложение
- 🔄 Офлайн режим с синхронизацией

## 🚀 Быстрый старт

### 1. Создайте файл `.env`

```bash
# Создайте файл .env в корне проекта со следующим содержимым:
VITE_SUPABASE_URL=https://board.chaika.team
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzI1NDgzNjAwLAogICJleHAiOiAxODgzMjUwMDAwCn0.B7-MhcmGj3V7q1eatc17XJ0ygevbsB8E_YVj57t-1GQ
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Запустите проект

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## 📦 SQL для таблицы логов

Выполните в Supabase SQL Editor:

```sql
-- Таблица для логирования сканирований
CREATE TABLE IF NOT EXISTS scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    persons_entered INTEGER NOT NULL DEFAULT 1,
    scanner_user_id UUID REFERENCES auth.users(id),
    event_id TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    device_info TEXT,
    is_synced BOOLEAN DEFAULT true
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_scan_logs_ticket_id ON scan_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON scan_logs(scanned_at);
CREATE INDEX IF NOT EXISTS idx_scan_logs_event_id ON scan_logs(event_id);

-- RLS политики (если включен RLS)
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to insert scan_logs" ON scan_logs
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read scan_logs" ON scan_logs
    FOR SELECT TO authenticated USING (true);
```

## 🔐 Создание пользователя

Создайте пользователя в Supabase Dashboard → Authentication → Users → Add User

Или через SQL:
```sql
-- Вариант через Supabase Dashboard рекомендуется
```

## 📱 Установка как приложение

1. Откройте сайт на мобильном устройстве
2. iOS: Safari → Поделиться → На экран «Домой»
3. Android: Chrome → Меню → Добавить на главный экран

## 🛠 Технологии

- **Vue 3** - UI фреймворк
- **Vite** - сборщик
- **Pinia** - state management
- **Vue Router** - маршрутизация
- **Supabase** - база данных и авторизация
- **vue-qrcode-reader** - сканер QR-кодов
- **VueUse** - утилиты
- **vite-plugin-pwa** - PWA поддержка

## 📁 Структура проекта

```
src/
├── assets/
│   └── styles/
│       └── main.css          # Глобальные стили
├── components/
│   ├── QRScanner.vue         # Компонент сканера
│   └── TicketCard.vue        # Карточка билета
├── composables/
│   ├── useSupabase.js        # Supabase клиент
│   ├── useAuth.js            # Авторизация
│   └── useTickets.js         # Работа с билетами
├── stores/
│   └── offlineStore.js       # Офлайн очередь
├── views/
│   ├── LoginView.vue         # Страница входа
│   └── ScanView.vue          # Главная страница
├── router/
│   └── index.js              # Маршруты
├── App.vue
└── main.js
```

## 📝 Лицензия

MIT © Chaika Team

