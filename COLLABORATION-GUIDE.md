# Team Collaboration Guide 👥

## Kako Tvoje Kolege Mogu Koristiti Aplikaciju

### Scenario 1: Lokalni Rad (Bez Deljenja)

Ako svako želi **svoje lokalne podatke**:

1. **Kolega klonira repo:**
```bash
git clone <your-repo-url>
cd TestCase_APP
```

2. **Instalira dependencies:**
```bash
npm install
```

3. **Pokrene aplikaciju:**
```bash
./start
```

**Rezultat:**
- ✅ Aplikacija radi
- ❌ Svako ima svoje projekte (ne dele se)
- ❌ Test case-ovi su lokalni

---

### Scenario 2: Tim Collaboration (Sa Deljenjem) 🔥

Ako želiš da **svi dele iste projekte i test case-ove**:

#### Korak 1: Ti Podestiš Firebase (Jednom)

1. Prati **[FIREBASE-SETUP.md](./FIREBASE-SETUP.md)** vodič
2. Kreiraj Firebase projekat
3. Dobij Firebase credentials

#### Korak 2: Podeli Credentials Sa Timom

**Opcija A: Dodaj u repo (NE preporučujem za javni repo)**
```bash
# Kreiraj .env.local sa Firebase credentials
# Komituj ga (samo za privatni repo!)
```

**Opcija B: Pošalji kolegi na Slack/Email (Preporučeno)**
```
Pošalji mu:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
```

#### Korak 3: Kolega Setup

Kolega treba da:

1. **Klonira repo:**
```bash
git clone <your-repo-url>
cd TestCase_APP
npm install
```

2. **Kreira `.env.local` fajl:**
```bash
touch .env.local
```

3. **Doda Firebase credentials u `.env.local`:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=<vrednost_koju_si_mu_poslao>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<vrednost_koju_si_mu_poslao>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<vrednost_koju_si_mu_poslao>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<vrednost_koju_si_mu_poslao>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<vrednost_koju_si_mu_poslao>
NEXT_PUBLIC_FIREBASE_APP_ID=<vrednost_koju_si_mu_poslao>
```

4. **Pokrene aplikaciju:**
```bash
./start
```

**Rezultat:**
- ✅ Svi vide iste projekte
- ✅ Real-time sync
- ✅ Mogu zajedno raditi

---

## Kako Radi Real-Time Collaboration?

### Primer:

**Ti (na svom računaru):**
1. Uloguješ se kao `admin`
2. Kreiraš projekat "E-Commerce Website"
3. Dodaš test case "Login Test"

**Kolega (na svom računaru):**
1. Uloguje se kao `admin` (ili drugi user)
2. **ODMAH vidi** projekat "E-Commerce Website"
3. **ODMAH vidi** test case "Login Test"
4. Može da doda svoj test case
5. **Ti odmah vidiš** njegov test case!

---

## GitHub Setup

### Šta Okačiti na GitHub?

**✅ Okači:**
- Sav kod
- `package.json`
- `README.md`
- `FIREBASE-SETUP.md`
- `env.example` (template bez pravih vrednosti)

**❌ NE okači:**
- `.env.local` (sadrži tajne Firebase credentials!)
- `node_modules/`
- `.next/`

### .gitignore je Već Podešen ✅

Fajl `.gitignore` već ignoriše:
```
.env.local
.env
node_modules/
.next/
```

### Kako Okačiti na GitHub?

```bash
# 1. Inicijalizuj git (ako već nije)
git init

# 2. Dodaj sve fajlove
git add .

# 3. Komituj
git commit -m "Initial commit: QA Test Case Manager with Firebase"

# 4. Dodaj remote (zameni sa svojim repo URL-om)
git remote add origin https://github.com/tvoj-username/qa-test-manager.git

# 5. Push
git push -u origin main
```

---

## Instrukcije Za Kolege

Pošalji kolegama ovaj tekst:

```
Pozdrav!

Napravio sam QA Test Case Manager aplikaciju. Evo kako da je pokreneš:

1. Kloniraj repo:
   git clone <repo-url>
   cd TestCase_APP

2. Instaliraj dependencies:
   npm install

3. Kreiraj .env.local fajl i dodaj Firebase credentials koje sam ti poslao

4. Pokreni:
   ./start

Login:
- Username: admin
- Password: admin123

Sada možemo zajedno raditi na test case-ovima! Sve promene se sinhronizuju u realnom vremenu.
```

---

## FAQ

### Koliko ljudi može koristiti aplikaciju?
- **Firebase Free Tier:** 50,000 reads/dan, 20,000 writes/dan
- **Dovoljno za:** 5-10 ljudi koji aktivno rade

### Da li svako mora da ima Firebase nalog?
- **NE!** Samo ti kreiraš Firebase projekat
- Kolege samo dodaju credentials u `.env.local`

### Šta ako neko nema `.env.local`?
- Aplikacija radi u **Local Storage mode**
- Podaci su samo lokalni, bez sync-a

### Mogu li imati različite korisnike?
- Trenutno svi koriste isti login (`admin`)
- Možeš dodati nove korisnike u `utils/storage.ts`

### Kako dodati novog korisnika?
```typescript
// U utils/storage.ts, dodaj u defaultUsers:
const defaultUsers = [
  { id: '1', username: 'admin', password: 'admin123', name: 'Administrator' },
  { id: '2', username: 'nemanja', password: 'pass123', name: 'Nemanja' },
  { id: '3', username: 'kolega', password: 'pass123', name: 'Kolega' }
]
```

---

## Bezbednost 🔒

### Za Privatni Tim:
- Firebase credentials u `.env.local` su OK
- Drži repo privatnim

### Za Javni Repo:
- **NE komituj** `.env.local`
- Podeli credentials preko Slack/Email
- Podesi Firebase Security Rules

---

**Srećno sa team collaboration! 🚀**

