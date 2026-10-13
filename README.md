# رفاہ بلڈ ڈونیشن ویب سائٹ

سادہ HTML، CSS اور JavaScript میں بنایا گیا ایک موبائل فرینڈلی اردو/انگریزی blood-donation ویب سائٹ۔

## صفحات

- `index.html` — ہوم پیج
- `request.html` — خون کی درخواست کا فارم
- `tracking.html` — ٹریکنگ آئی ڈی سے درخواست کا اسٹیٹس
- `donate.html` — ڈونر رجسٹریشن
- `about.html` — رفاہ ویلفیئر سوسائٹی، اس کے پراجیکٹس، ٹیم اور رابطہ
- `assets/blood-donation.svg` — آف لائن، مقامی vector illustration جو تمام صفحات پر استعمال ہوتی ہے

ہر صفحے کے header میں زبان کا انتخاب موجود ہے۔ انتخاب محفوظ رہتا ہے اور اگلے صفحے پر بھی برقرار رہتا ہے۔

## چلانے کا طریقہ

`index.html` کو فائل کے طور پر براہ راست نہ کھولیں۔ یہ ورژن local Node.js server اور SQLite database استعمال کرتا ہے۔

### Windows پر پہلی بار

1. Node.js 22 یا اس سے نیا ورژن انسٹال کرکے PowerShell میں اس فولڈر کو کھولیں۔
2. `.\start.ps1` چلائیں۔ اگر admin database ابھی خالی ہے تو پہلی بار اپنا منتخب کردہ پاس ورڈ محفوظ prompt میں درج کریں؛ اسکرین پر ظاہر نہیں ہوگا۔ Windows اسی account کے لیے پاس ورڈ کو DPAPI کے ذریعے `.env` میں encrypt کرتا ہے؛ یہ فائل `.gitignore` میں ہے۔ اگلی بار خالی database پر setup چلے تو اسی encrypted password کو استعمال کیا جا سکتا ہے۔
3. سرور `http://127.0.0.1:4173` پر چلے گا۔ اسے چلتا رہنے دیں۔
4. ویب سائٹ `http://127.0.0.1:4173` کھولیں۔ منتظم کا ای میل login فارم میں پہلے سے بھرا ہے۔
5. سرور بند کرنے کے لیے اسی PowerShell میں `Ctrl+C` دبائیں۔ اس کے بعد دوبارہ چلانے کے لیے `.\start.ps1` استعمال کریں۔

منتظم کا پاس ورڈ source code یا plaintext database میں محفوظ نہیں ہوتا؛ مقامی `.env` میں Windows DPAPI-encrypted صورت میں رکھا جاتا ہے اور database میں scrypt password hash محفوظ ہوتا ہے۔ Live server process میں password صرف hashing کے وقت عارضی طور پر دستیاب ہوتا ہے۔ `.env` کی decryptibility اسی Windows account سے منسلک ہے۔ Database `data\rifah.sqlite` میں ہے؛ یہ folder بھی `.gitignore` میں شامل ہے۔ Admin login page پر sign-in کے لیے آپ کو اپنا password درج کرنا ہوگا۔

موبائل اور عوامی استعمال کے لیے website کو HTTPS دینے والی hosting یا reverse proxy کے پیچھے deploy کریں۔ production میں `NODE_ENV=production` اور `PUBLIC_ORIGIN=https://آپ-کی-سائٹ` لازمی ہیں۔ HTTPS کے بغیر طبی معلومات انٹرنیٹ پر مت بھیجیں، اور یہ local HTTP server براہِ راست انٹرنیٹ پر مت کھولیں۔

## کیا کام کرتا ہے؟

- SQLite میں خون کی درخواستیں، درخواست کا اسٹیٹس اور ڈونر رجسٹریشن محفوظ کرنا
- bell میں نئی درخواستوں کی notifications؛ admin قبول کرے تو dashboard میں آتی ہیں، منسوخ کرے تو notification سے ہٹ جاتی ہیں
- admin panel سے donor شامل کرنا، عوامی donor registrations دیکھنا، filter کرنا اور فون کرنا
- tracking ID سے status دیکھنا، اور review سے پہلے اپنی درخواست cancel کرنا
- محفوظ admin login، session، CSRF/origin protection اور login rate limiting
- اختیاری JPG/PNG/WEBP میڈیکل رپورٹ زیادہ سے زیادہ 3 MB کے ساتھ محفوظ کرنا، صرف admin کے لیے download
- مکمل درخواست کو Word-compatible `.doc` فائل میں download کرنا
- ڈونر فہرست، بلڈ گروپ فلٹر اور ایک ٹیپ پر donor کو فون
- رفاہ ویلفیئر سوسائٹی کا تعارف، ٹیم اور رابطے کی تفصیل
- تمام صفحات پر اردو اور انگریزی زبان کا انتخاب
- ہر صفحے کے لیے blood donation سے متعلق illustration اور رہنمائی
- چھوٹے فون، ٹیبلٹ اور بڑے اسکرین کے لیے responsive layout

## اہم حفاظتی حدود

یہ ایک بنیادی مقامی SQLite implementation ہے، طبی compliance یا managed hosting کا متبادل نہیں۔ مکمل database اور میڈیکل رپورٹس صرف سرور کی `data\` directory میں رہتے ہیں۔ اس کا باقاعدہ backup، ڈسک کی encryption، HTTPS، مجاز admin account کا محفوظ انتظام، privacy notice/consent، data retention اور security patching production سے پہلے configure کریں۔ سرور local طور پر شروع کرنے سے پہلے پہلی بار منتظم کا پاس ورڈ لازمی set کرنا ہوگا۔ کسی دوسرے کمپیوٹر یا فون سے database ریکارڈ صرف deployed سرور کے ذریعے دستیاب ہوں گے، ان کے اپنے browser storage سے نہیں۔
