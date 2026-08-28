# مدرسہ سیدنا صدیق اکبرؓ - ویب ایپلیکیشن

Madrassa Syedina Sadeeq-e-Akbar (RA) - Mardan

## تکنیکی اسٹیک

- **فرنٹ اینڈ:** React.js (Vite)
- **بیک اینڈ:** Node.js + Express.js + JWT + Multer
- **ڈیٹا بیس:** MongoDB (Mongoose)
- **ڈیزائن:** Vanilla CSS (US Government style)
- **زبان:** اردو (RTL)

---

## چلانے کا طریقہ (How to Run)

### 1. فرنٹ اینڈ (Frontend)
```bash
cd client
npm install
npm run dev
```
فرنٹ اینڈ **`http://localhost:3000`** پر چلے گا۔

---

### 2. ڈیٹا بیس اور بیک اینڈ (Database & Backend)

MongoDB آپ کے سسٹم میں انسٹال ہو چکا ہے (`C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe`)۔

#### طریقہ الف — شارٹ کٹ اسکرپٹس (Direct Click):
1. **ڈیٹا بیس چلائیں:** `server/start-mongo.bat` پر ڈبل کلک کریں۔
2. **ڈیٹا سیڈ کریں:** `server/seed-db.bat` پر ڈبل کلک کریں (صرف پہلی بار ڈیٹا بھرنے کے لیے)۔
3. **بیک اینڈ سرور چلائیں:** `server/start-server.bat` پر ڈبل کلک کریں۔

#### طریقہ ب — ٹرمینل سے (Terminal):
```bash
# 1. Start MongoDB
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "server/data/db" --port 27017

# 2. Seed initial data (first time)
cd server
npm run seed

# 3. Start Backend API server
npm start
```
بیک اینڈ **`http://localhost:5000`** پر چلے گا۔

---

## ٹیسٹ لاگ ان معلومات

| کردار | صارف نام | پاسورڈ |
|-------|----------|--------|
| ایڈمن | admin | admin123 |
| استاذ | teacher | teacher123 |
| طالب علم | student | student123 |
