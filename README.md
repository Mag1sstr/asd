# Pro Auto shop

## Что нужно сделать для запуска

1. Установить Node.js 20+ и создать Neon базу данных.
2. Открыть терминал в папке `server`:

   ```powershell
   cd server
   Copy-Item .env.example .env
   ```

3. В `server/.env` вставить Neon connection string в `DATABASE_URL`. Оставить `sslmode=require`. Создать секрет JWT командой:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Вставить результат в `JWT_SECRET`. При необходимости поменять `ADMIN_EMAIL` и `ADMIN_PASSWORD`.

## Запуск backend

В терминале, находясь в папке `server`, выполнить:

```powershell
npm install
npm run seed
npm run dev
```

`npm run seed` автоматически создаёт таблицы и наполняет базу тестовыми данными: администратором, покупателем, категориями, товарами, новостями, комментарием, корзиной и заказом. Seed безопасно запускать повторно. `npm run dev` запускает сервер на `http://localhost:4000` и также проверяет/дополняет seed.

Тестовые аккаунты по умолчанию:

- Администратор: `admin@example.com` / `Admin123!` — админка: `http://localhost:5173/admin`.
- Покупатель: `demo@example.com` / `Demo123!`.

Смените пароль администратора в `server/.env` перед использованием. Документация API: [http://localhost:4000/api/docs](http://localhost:4000/api/docs).

## Запуск frontend

Откройте второй терминал в корне проекта и выполните:

```powershell
cd client
npm install
npm run dev
```

Frontend использует `http://localhost:4000/api` по умолчанию. При другом адресе API укажите `VITE_API_URL` в `client/.env.local`.

Для отправки заявок в Telegram дополнительно задайте `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в `server/.env`. Без них заявки всё равно сохраняются в базе и видны в админке.
