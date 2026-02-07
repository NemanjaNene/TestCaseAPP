# 👥 QA Test Case Manager - User Guide

## 🔐 User Accounts & Access

### **QA Team (Admin Access)** - Full Permissions
Username-ovi za tim sa **zajedničkom šifrom**:

| Username | Šifra | Pristup |
|----------|-------|---------|
| **NemanjaN** | Comitqa123 | Sve (Admin) |
| **NemanjaP** | Comitqa123 | Sve (Admin) |
| **Milan** | Comitqa123 | Sve (Admin) |
| **Vlada** | Comitqa123 | Sve (Admin) |
| **Comitqa** | Comitqa123 | Sve (Admin - Legacy) |

**Login:** Selektuj "QA Team" tab → Izaberi ime iz dropdown-a → Unesi šifru

**Mogućnosti:**
- ✅ Kreiraju i edituju projekte
- ✅ Kreiraju i edituju test suite-ove
- ✅ Kreiraju i edituju test case-ove
- ✅ Kreiraju i izvršavaju test run-ove
- ✅ Dodaju komentare i Bug ID-ove
- ✅ Brišu projekte, suite-ove i test case-ove

---

### **Global Viewer (PM/Owner)** - Read-Only All Projects

| Username | Šifra | Pristup |
|----------|-------|---------|
| **GlobalView** | ViewAll2026 | Svi projekti (Read-Only) |

**Login:** Selektuj "Viewer" tab → Unesi username i šifru

**Mogućnosti:**
- ✅ Vidi sve projekte
- ✅ Vidi sve test suite-ove
- ✅ Vidi sve test case-ove sa detaljima
- ✅ Vidi test run rezultate
- ✅ Vidi komentare i Bug ID-ove
- ✅ Vidi statistiku (pass/fail rate)
- ❌ **NE može kreirati/editovati/brisati bilo šta**

---

### **Per-Project Viewers** - Read-Only Specific Projects

#### 1️⃣ FairPlay Viewer

| Username | Šifra | Pristup |
|----------|-------|---------|
| **FairPlayView** | FairPlay2026 | Samo **FairPlay** projekat (Read-Only) |

#### 2️⃣ Raz Viewer

| Username | Šifra | Pristup |
|----------|-------|---------|
| **RazView** | Raz2026 | Samo **Raz** projekat (Read-Only) |

#### 3️⃣ Vitals Viewer

| Username | Šifra | Pristup |
|----------|-------|---------|
| **VitalsView** | Vitals2026 | Samo **Vitals 4 Pets** projekat (Read-Only) |

**Login:** Selektuj "Viewer" tab → Unesi username i šifru

**Mogućnosti:**
- ✅ Vidi SAMO dodeljeni projekat
- ✅ Vidi test suite-ove i case-ove unutar projekta
- ✅ Vidi test run rezultate
- ✅ Vidi komentare i Bug ID-ove
- ❌ **NE može kreirati/editovati/brisati bilo šta**

---

## 🎯 UI Razlike za Viewer-e

Kada se viewer prijavi, neće videti:
- ❌ "New Project" dugme
- ❌ "New Test Suite" dugme
- ❌ "New Test Case" dugme
- ❌ "New Test Run" dugme
- ❌ Edit i Delete dugmad
- ❌ Drag-and-drop za reorder test case-ova

Ali će videti:
- ✅ Sve test case-ove sa svim detaljima
- ✅ Sve test run rezultate
- ✅ Status indikatore (zelene/crvene/žute tačkice)
- ✅ Komentare i Bug ID-ove
- ✅ Statistiku izvršavanja
- ✅ Role badge u gornjem desnom uglu

---

## 📋 Kako Deliti Pristup Klijentima

### Za PM-ove i vlasnike firme:
```
Username: GlobalView
Šifra: ViewAll2026
```
*Vide sve projekte, svi testovi i rezultati*

### Za FairPlay klijente:
```
Username: FairPlayView
Šifra: FairPlay2026
```
*Vide samo FairPlay projekat*

### Za Raz klijente:
```
Username: RazView
Šifra: Raz2026
```
*Vide samo Raz projekat*

### Za Vitals klijente:
```
Username: VitalsView
Šifra: Vitals2026
```
*Vide samo Vitals 4 Pets projekat*

---

## 🔄 Kako Promeniti Šifre (Opciono)

Šifre su sačuvane u `utils/storage.ts` fajlu. Ako želite da promenite šifre:

1. Otvori `utils/storage.ts`
2. Pronađi `loadUsers()` funkciju
3. Promeni `password` vrednost za željeni nalog
4. Sačuvaj fajl
5. Refresh aplikaciju

**VAŽNO:** Trenutno su šifre sačuvane u localStorage-u browsera. Ako korisnik već ima cached podatke, možda će morati da obriše localStorage ili da se ponovo login-uje.

---

## 🎨 Pristup Features

| Feature | QA Team (Admin) | Global Viewer | Project Viewer |
|---------|----------------|---------------|----------------|
| Vidi sve projekte | ✅ | ✅ | ❌ (samo dodeljeni) |
| Vidi test case-ove | ✅ | ✅ | ✅ |
| Vidi test run rezultate | ✅ | ✅ | ✅ |
| Kreiraj projekat | ✅ | ❌ | ❌ |
| Kreiraj test suite | ✅ | ❌ | ❌ |
| Kreiraj test case | ✅ | ❌ | ❌ |
| Edituj test case | ✅ | ❌ | ❌ |
| Briši test case | ✅ | ❌ | ❌ |
| Kreiraj test run | ✅ | ❌ | ❌ |
| Izvršavaj testove | ✅ | ❌ | ❌ |
| Dodaj komentare | ✅ | ❌ | ❌ |

---

## 🚀 Quick Start

1. **Login kao QA član:**
   - Klikni "QA Team" tab
   - Izaberi svoje ime iz dropdown-a
   - Unesi šifru: `Comitqa123`

2. **Login kao Viewer:**
   - Klikni "Viewer" tab
   - Unesi username (npr. `GlobalView`)
   - Unesi šifru (npr. `ViewAll2026`)

3. **Daj pristup klijentu:**
   - Pošalji mu username i šifru (npr. `FairPlayView` / `FairPlay2026`)
   - Objasni mu da koristi "Viewer" tab za login

---

## 📞 Support

Za pitanja ili probleme, kontaktiraj QA tim.
