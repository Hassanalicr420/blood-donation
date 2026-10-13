# Vercel par deploy (Roman Urdu guide)

Is version mein SQLite nahi hai. Data **Neon Postgres** (free, online) mein save hota hai, isliye Vercel par sab kuch online kaam karta hai.

## 1. Database banao (2 minute, free)
1. https://neon.tech par account banao -> New Project.
2. **Connection string** copy karo (`postgresql://...neon.tech/...?sslmode=require`).
   (Ya Vercel mein: Project -> Storage -> Create -> Neon; yeh `DATABASE_URL` khud laga deta hai.)

## 2. Vercel par upload
- GitHub par is folder ko push karo aur Vercel mein "Import Project" karo, **ya**
- `npm i -g vercel` phir is folder mein `vercel --prod`.

## 3. Environment Variables (Vercel -> Settings -> Environment Variables)
| Name | Value |
|---|---|
| `DATABASE_URL` | Neon ki connection string |
| `INITIAL_ADMIN_PASSWORD` | admin ka password (kam az kam 12 characters) |
| `INITIAL_ADMIN_EMAIL` | (optional) default: rifahwelfaresociety@gmail.com |

Variables save karne ke baad **Redeploy** karo.

## 4. Check
- `https://aap-ki-site.vercel.app/api/health` -> `{"ok":true,"database":"connected"}` aana chahiye.
- `/admin.html` par email + `INITIAL_ADMIN_PASSWORD` se login.
- Tables aur admin pehli request par khud ban jate hain.

## Realtime
Vercel par WebSocket nahi hota, isliye admin dashboard aur tracking page har 5 second mein database se naya data le lete hain (jaisa pehle tha). Naye request/status change 5 second ke andar nazar aa jate hain.

## Purana data (optional)
`DATABASE_URL=... npm run migrate-sqlite -- "path/to/rifah.sqlite"`

## Admin password bhool jao to
`DATABASE_URL=... npm run set-admin -- email@example.com "naya-password-12+"`

## Local chalana
`npm install`, `.env.example` ko `.env` banao (DATABASE_URL bharo), phir `npm run dev` -> http://localhost:4173
