# Firebase Setup Guide 🔥

Ovaj vodič će te provesti kroz podešavanje Firebase-a za **real-time collaboration**.

## Zašto Firebase?

- ✅ **Real-time sync** - Svi korisnici vide promene ODMAH
- ✅ **Besplatno** - Spark plan pokriva mali tim
- ✅ **Lako za setup** - 10 minuta
- ✅ **Cloud baza** - Podaci su sačuvani online

---

## Korak 1: Kreiraj Firebase Projekat

1. **Idi na Firebase Console**
   - Otvori: https://console.firebase.google.com/
   - Uloguj se sa Gmail nalogom

2. **Dodaj novi projekat**
   - Klikni "Add project" ili "Create a project"
   - Ime projekta: `qa-test-manager` (ili kako god hoćeš)
   - Google Analytics: **DISABLE** (nije potreban)
   - Klikni "Create Project"

3. **Sačekaj da se projekat kreira** (30 sekundi)

---

## Korak 2: Omogući Firestore Database

1. **U levom meniju klikni "Firestore Database"**
2. **Klikni "Create database"**
3. **Izaberi lokaciju:**
   - Europe (eur3) - Najbolje za Srbiju/Evropu
4. **Izaberi Security Rules:**
   - Start in **test mode** (možeš kasnije promeniti)
5. **Klikni "Enable"**

---

## Korak 3: Registruj Web App

1. **U Project Overview (Home) klikni na web ikonicu `</>`**
2. **App nickname:** `QA Test Manager Web`
3. **NE čekiraj** "Set up Firebase Hosting"
4. **Klikni "Register app"**

5. **Kopiraj Firebase konfiguraciju:**

Videćeš nešto ovako:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxxxxxxxxxx"
};
```

**KOPIRAJ OVE VREDNOSTI!** 📋

---

## Korak 4: Dodaj Environment Variables

1. **Kreiraj fajl `.env.local` u root folderu projekta:**

```bash
# U terminalu:
touch .env.local
```

2. **Otvori `.env.local` i dodaj:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
```

**Zameni sa SVOJIM vrednostima iz Koraka 3!**

---

## Korak 5: Podesi Firestore Security Rules

1. **U Firebase Console → Firestore Database → Rules**
2. **Zameni sa ovim pravilima:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Dozvoli svima da čitaju i pišu (za development)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**NAPOMENA:** Ovo je za development. Za produkciju dodaj authentication!

3. **Klikni "Publish"**

---

## Korak 6: Instaliraj Dependencies

```bash
npm install
```

---

## Korak 7: Pokreni Aplikaciju!

```bash
./start
```

ili

```bash
npm run app
```

---

## 🎉 Gotovo!

Sada kada ti i tvoje kolege pokrenete aplikaciju:

- ✅ **Svi delite istu bazu podataka**
- ✅ **Promene se pojavljuju ODMAH kod svih**
- ✅ **Možete zajedno raditi na test case-ovima**

---

## Kako Testirati Collaboration?

1. **Otvori aplikaciju u 2 browser prozora** (ili 2 računara)
2. **Uloguj se u oba**
3. **U jednom prozoru kreiraj projekat**
4. **Drugi prozor će ODMAH videti novi projekat!** 🚀

---

## Troubleshooting 🔧

### Problem: "Firebase not configured"
- **Rešenje:** Proveri da li si kreirao `.env.local` fajl
- Proveri da su sve env varijable pravilno kopirane
- Restartuj server (`Ctrl+C` pa ponovo `./start`)

### Problem: "Permission denied"
- **Rešenje:** Proveri Firestore Security Rules (Korak 5)
- Proveri da si izabrao "test mode" pri kreiranju Firestore

### Problem: "No changes appearing"
- **Rešenje:** Otvori Console (F12) i proveri errore
- Proveri internet konekciju
- Proveri da li je Firebase projekat aktivan

---

## Fallback Mode

Ako Firebase nije konfigurisan, aplikacija **automatski radi sa Local Storage**.

To znači da:
- ✅ Aplikacija radi i bez Firebase-a
- ❌ Ali nema deljenja podataka između korisnika
- ❌ Podaci su samo lokalni

---

## Bezbednost (za produkciju) 🔒

Za produkciju, promeni Firestore Rules da zahtevaju autentifikaciju:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Firebase Free Tier Limits

- **Firestore Reads:** 50,000 / dan
- **Firestore Writes:** 20,000 / dan
- **Storage:** 1 GB

**Dovoljno za mali tim (5-10 ljudi)!** ✅

---

## Potrebna Pomoć?

- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Firestore Docs: https://firebase.google.com/docs/firestore

---

**Srećno! 🚀**

Sada ti i tvoje kolege možete zajedno upravljati test case-ovima!

