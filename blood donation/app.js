"use strict";

const STORAGE_KEYS = {
  requests: "rifahBloodRequests",
  donors: "rifahBloodDonors",
  language: "rifahLanguage"
};

const TEXT = {
  ur: {
    brand: "رفاہ بلڈ ڈونیشن", society: "رفاہ ویلفیئر سوسائٹی", languageLabel: "زبان",
    navRequest: "خون کی درخواست", navTracking: "ٹریکنگ", navDonate: "خون عطیہ کریں", navAbout: "ہمارے بارے میں",
    footerSociety: "رفاہ ویلفیئر سوسائٹی، چکنمبر 116/ڈبلیو بی", footerContact: "ہم سے رابطہ کریں",
    adminLoginLink: "منتظم لاگ اِن",
    homeEyebrow: "رفاہ ویلفیئر سوسائٹی، چکنمبر 116/WB", homeTitle1: "آپ کا عطیہ،", homeTitle2: "کسی کی زندگی",
    homeIntro: "خون کی ضرورت ہو یا آپ عطیہ کرنا چاہتے ہوں، ہم سے رابطہ کریں۔ ایک چھوٹا سا قدم کسی گھر کے لیے امید بن سکتا ہے۔",
    homeRequestCta: "خون کی درخواست دیں", homeDonateCta: "ڈونر بنیں", homeNote: "ضرورت مند مریضوں کے لیے مقامی خون کی مدد",
    dropCaption: "زندگی بانٹیں", stepRequestTitle: "درخواست جمع کریں", stepRequestText: "مریض کی ضرورت بتائیں",
    stepTrackingTitle: "درخواست ٹریک کریں", stepTrackingText: "اپنی درخواست کا اسٹیٹس دیکھیں",
    stepDonateTitle: "ڈونر بنیں", stepDonateText: "کسی کی مدد کے لیے رجسٹر ہوں",
    homeHowKicker: "آسان اور سیدھا طریقہ", homeHowTitle: "مدد حاصل کرنے کے تین قدم",
    homeHowIntro: "درخواست دیں، اپنی ٹریکنگ آئی ڈی محفوظ رکھیں، اور ہماری ٹیم سے رابطے میں رہیں۔",
    homeCardRequestTitle: "خون کی درخواست", homeCardRequestText: "مریض، بلڈ گروپ، ہسپتال اور ضرورت کے وقت کی معلومات درج کریں۔",
    homeCardRequestLink: "درخواست شروع کریں ←", homeCardTrackingTitle: "درخواست کی ٹریکنگ",
    homeCardTrackingText: "اپنی منفرد ٹریکنگ آئی ڈی سے محفوظ کردہ درخواست دیکھیں۔", homeCardTrackingLink: "درخواست ٹریک کریں ←",
    homeCardDonateTitle: "بطور ڈونر رجسٹر ہوں", homeCardDonateText: "اپنا بلڈ گروپ اور رابطے کی تفصیل دے کر خون عطیہ کرنے کی پیشکش کریں۔",
    homeCardDonateLink: "ڈونر بنیں ←", homeAboutKicker: "رفاہ ویلفیئر سوسائٹی",
    homeAboutTitle: "اپنی کمیونٹی کی خدمت، ایک زندگی سے آغاز",
    homeAboutText: "ہم چکنمبر 116/WB میں صحت اور فلاح کے پروگراموں کے ذریعے ضرورت مند خاندانوں کی مدد کے لیے کام کرتے ہیں۔",
    homeAboutCta: "سوسائٹی کے بارے میں جانیں",
    homeImageAlt: "ایک ڈونر مریض کی مدد کر رہا ہے",
    requestImageAlt: "خون کے ذریعے مریض کی مدد", trackingImageAlt: "خون کی درخواست سے متعلق مدد",
    donateImageAlt: "خون کا عطیہ دیتے ہوئے ڈونر", aboutImageAlt: "رفاہ سوسائٹی کی جانب سے مریض کی مدد",
    bloodGroupsKicker: "خون کے گروپس", bloodGroupsTitle: "اپنا بلڈ گروپ جانتے ہیں؟",
    bloodGroupsText: "درخواست یا ڈونر فارم میں درست بلڈ گروپ منتخب کریں۔ گروپ معلوم نہ ہو تو پہلے لیبارٹری سے تصدیق کروائیں۔",
    bloodGroupsNote: "خون کی ضرورت فوری ہو تو ویب فارم کے ساتھ سوسائٹی سے فون پر بھی رابطہ کریں۔",
    homeContactKicker: "فوری مدد درکار ہے؟", homeContactTitle: "ہماری ٹیم سے رابطہ کریں",
    homeContactText: "آن لائن درخواست کے ساتھ فون پر بھی اپنی ضرورت بتائیں۔",
    requestKicker: "مریض کے لیے مدد", requestTitle: "خون کی درخواست دیں",
    requestIntro: "مریض کی معلومات درج کریں۔ درخواست جمع ہونے پر آپ کو ٹریکنگ آئی ڈی ملے گی۔",
    requestStepsKicker: "درخواست دینے سے پہلے", requestStepsTitle: "یہ معلومات تیار رکھیں",
    requestTip1: "مریض کا درست بلڈ گروپ اور رابطہ نمبر۔",
    requestTip2: "ہسپتال کا نام اور خون کی ضرورت کا وقت۔",
    requestTip3: "اگر دستیاب ہو تو تازہ میڈیکل رپورٹ۔",
    requestHelpText: "فوری ضرورت ہو تو درخواست کے بعد رفاہ ویلفیئر سوسائٹی کو فون بھی کریں۔",
    patientName: "مریض کا نام <b>*</b>", yourName: "آپ کا نام <b>*</b>", phone: "رابطہ نمبر <b>*</b>",
    bloodGroup: "بلڈ گروپ <b>*</b>", selectBlood: "بلڈ گروپ منتخب کریں", city: "شہر / گاؤں <b>*</b>",
    hospital: "ہسپتال کا نام <b>*</b>", neededBy: "خون کب تک چاہیے؟ <b>*</b>", hemoglobin: "ہیموگلوبن (Hb)",
    condition: "بیماری / ضرورت کی تفصیل", reportImage: "میڈیکل رپورٹ کی تصویر <small>(اختیاری)</small>",
    extraInfo: "اضافی معلومات", requestConsent: "میں تصدیق کرتا/کرتی ہوں کہ فراہم کردہ معلومات درست ہیں۔ <b>*</b>",
    submitRequest: "درخواست جمع کریں", requestPrivacy: "<strong>رازداری:</strong> درخواست اور میڈیکل رپورٹ منتظم کے مقامی SQLite database میں محفوظ ہوں گے۔ حقیقی استعمال میں صرف HTTPS کے ذریعے طبی معلومات بھیجیں۔",
    fullNamePlaceholder: "پورا نام", cityPlaceholder: "مثلاً چکنمبر 116/WB", hospitalPlaceholder: "ہسپتال کا نام",
    hbPlaceholder: "مثلاً 7.5", conditionPlaceholder: "ضرورت کی مختصر وجہ",
    fileHint: "صرف JPG، PNG یا WEBP تصویر؛ زیادہ سے زیادہ 3 MB۔ رپورٹ منتظم کے محفوظ پینل میں رکھی جائے گی۔",
    extraPlaceholder: "یونٹس کی تعداد یا کوئی دوسری ضروری بات", donorCityPlaceholder: "آپ کا علاقہ",
    age: "عمر <b>*</b>", agePlaceholder: "18 سے 65 سال", lastDonation: "آخری مرتبہ خون کب دیا؟",
    donorConsent: "میں رابطے کے لیے اپنی معلومات فراہم کرنے پر رضامند ہوں۔ <b>*</b>",
    registerDonor: "ڈونر کے طور پر رجسٹر ہوں",
    donorPrivacy: "<strong>رازداری:</strong> آپ کی معلومات رفاہ ویلفیئر سوسائٹی کو موصول ہوں گی اور منتظم کے محفوظ پینل میں دکھائی دیں گی۔",
    donateKicker: "زندگی بانٹنے کے لیے تیار ہیں؟", donateTitle: "بطور ڈونر رجسٹر ہوں",
    donateIntro: "اپنی بنیادی تفصیل دیں۔ ضرورت کے وقت رفاہ ویلفیئر سوسائٹی آپ سے رابطہ کر سکتی ہے۔",
    donorGuideKicker: "بطور ڈونر", donorGuideTitle: "آپ کی پیشکش اہم ہے",
    donorGuideText: "رجسٹریشن کے بعد ضرورت کے مطابق ٹیم آپ سے رابطہ کر سکتی ہے۔ خون عطیہ کرنے کے وقت اور طبی موزونیت کے لیے ڈاکٹر یا متعلقہ بلڈ بینک کی ہدایات پر عمل کریں۔",
    donorTip1: "اپنا رابطہ نمبر اور بلڈ گروپ درست درج کریں۔",
    donorTip2: "ضرورت کے وقت فون دستیاب رکھیں۔",
    donorTip3: "عطیہ دینے سے پہلے طبی عملے سے تصدیق کریں۔",
    donorAboutLink: "سوسائٹی سے رابطے کی تفصیل دیکھیں ←",
    trackingKicker: "اپنی درخواست کا حال جانیں", trackingTitle: "درخواست ٹریک کریں",
    trackingIntro: "درخواست جمع ہونے پر ملنے والی ٹریکنگ آئی ڈی درج کریں۔",
    trackingStep1Title: "آئی ڈی درج کریں", trackingStep1Text: "درخواست جمع ہونے کے بعد ملی ہوئی آئی ڈی استعمال کریں۔",
    trackingStep2Title: "درخواست دیکھیں", trackingStep2Text: "درخواست کی تفصیل اور موجودہ اسٹیٹس دیکھیں۔",
    trackingStep3Title: "مدد کے لیے رابطہ کریں", trackingStep3Text: "فوری تصدیق یا مدد کے لیے سوسائٹی کو فون کریں۔",
    trackingIdLabel: "ٹریکنگ آئی ڈی", viewStatus: "اسٹیٹس دیکھیں",
    trackingDisclaimer: "اسٹیٹس رفاہ ویلفیئر سوسائٹی کی جانب سے اپ ڈیٹ ہوتا ہے۔ فوری مدد یا تصدیق کے لیے سوسائٹی سے فون پر رابطہ کریں۔",
    trackingRequestCta: "خون کی درخواست دیں",
    aboutKicker: "ہمارا تعارف", aboutTitle: "رفاہ ویلفیئر سوسائٹی<br>چکنمبر 116/ڈبلیو بی",
    aboutIntro: "ہم اس ادارے کے تحت گاؤں میں چار بڑے پراجیکٹس چلا رہے ہیں۔",
    aboutMark: "خدمت<br>انسانیت", programHealth: "ہیلتھ پروگرام",
    programHealthText: "ایمرجنسی میں فوری خون کا بندوبست اور گاؤں کے مستحق مریضوں کا علاج۔",
    programFamily: "فیملی سپورٹ پروگرام", programFamilyText: "مستحق یتیم بچیوں کی شادی، مستحق گھروں میں فوتگی کے اخراجات اور راشن کی تقسیم۔",
    programEmployment: "روزگار اسکیم پروگرام", programEmploymentText: "گاؤں کے مستحق ہنرمند افراد کو باعزت روزگار فراہم کرنا۔",
    programEducation: "ایجوکیشنل سپورٹ اسکالرشپ پروگرام", programEducationText: "گاؤں کے مستحق ہونہار طلباء کو تعلیم میں مدد دینا۔",
    teamKicker: "ہماری ٹیم", teamTitle: "خدمت کے لیے حاضر", chairman: "چئیرمین", president: "صدر",
    secretary: "جنرل و فنانس سیکریٹری", healthManager: "ہیلتھ پروگرام مینجر",
    familyManager: "فیملی سپورٹ پروگرام مینجر", employmentManager: "روزگار اسکیم", educationManager: "تعلیم پروگرام",
    contactKicker: "رابطہ کریں", contactTitle: "ہم آپ کی مدد کے لیے موجود ہیں",
    officeAddress: "دفتر وزٹ کریں: چکنمبر 116 ڈبلیو بی، نزد ملک یاسر کریانہ سٹور",
    warning: "<strong>اہم انتباہ:</strong> ادارہ صرف اوپر درج افراد پر مشتمل ہے۔ ان افراد کے علاوہ کسی شخص کا ادارے کے ساتھ کوئی تعلق نہیں اور ادارہ ایسے کسی شخص کے قول و فعل کا ذمہ دار نہ ہوگا۔ شکریہ۔",
    chairmanName: "حافظ حماد عظمت", presidentName: "عدنان شاہ", secretaryName: "کاشف نواز",
    healthManagerNames: "آصف نواز، چاند نوناری", familyManagerNames: "اسامہ منیر، علی رضا",
    employmentManagerName: "کاشف نواز", educationManagerName: "حماد عظمت",
    requestSaved: "آپ کی درخواست موصول ہوگئی۔ اپنی ٹریکنگ آئی ڈی محفوظ کر لیں: {id}",
    requestSaveError: "درخواست جمع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں یا سوسائٹی سے رابطہ کریں۔",
    donorSaved: "شکریہ! آپ کی ڈونر رجسٹریشن رفاہ ویلفیئر سوسائٹی کو موصول ہوگئی۔",
    donorSaveError: "رجسٹریشن جمع نہیں ہو سکی۔ براہِ کرم دوبارہ کوشش کریں۔",
    fileInvalid: "درست تصویر منتخب کریں (JPG، PNG یا WEBP؛ زیادہ سے زیادہ 3 MB)۔",
    fileSelected: "{name} — رپورٹ منتظم کے لیے محفوظ طریقے سے جمع ہوگی۔",
    trackingNotFound: "اس ٹریکنگ آئی ڈی کے لیے کوئی درخواست نہیں ملی۔ آئی ڈی چیک کرکے دوبارہ کوشش کریں۔",
    requestStatus: "بلڈ گروپ: {group} · ہسپتال: {hospital}",
    needDate: "خون درکار: {date}", trackingCode: "ٹریکنگ آئی ڈی: ",
    statusPending: "درخواست موصول ہوئی", statusAccepted: "درخواست منظور ہوگئی",
    statusMatched: "ڈونر مل گیا", statusFulfilled: "خون کی ضرورت پوری ہوگئی",
    statusCancelled: "درخواست منسوخ", cancelRequest: "درخواست منسوخ کریں",
    cancelConfirm: "کیا آپ یہ درخواست منسوخ کرنا چاہتے ہیں؟",
    adminStatusOnly: "اسٹیٹس کی تصدیق صرف رفاہ ویلفیئر سوسائٹی کے منتظم سے کریں۔",
    connectionError: "سرور سے رابطہ نہیں ہو سکا۔ ویب سائٹ سرور چل رہا ہو تو دوبارہ کوشش کریں۔",
    pageTitleHome: "رفاہ بلڈ ڈونیشن | ہوم",
    pageTitleRequest: "خون کی درخواست | رفاہ بلڈ ڈونیشن", pageTitleTracking: "درخواست ٹریک کریں | رفاہ بلڈ ڈونیشن",
    pageTitleDonate: "خون عطیہ کریں | رفاہ بلڈ ڈونیشن", pageTitleAbout: "ہمارے بارے میں | رفاہ بلڈ ڈونیشن"
  },
  en: {
    brand: "Rifah Blood Donation", society: "Rifah Welfare Society", languageLabel: "Language",
    navRequest: "Request blood", navTracking: "Track request", navDonate: "Donate blood", navAbout: "About us",
    footerSociety: "Rifah Welfare Society, Chak No. 116/WB", footerContact: "Contact us",
    adminLoginLink: "Admin sign in",
    homeEyebrow: "Rifah Welfare Society, Chak No. 116/WB", homeTitle1: "Your donation,", homeTitle2: "someone's life",
    homeIntro: "Need blood or want to donate? Get in touch. One small step can bring hope to a family.",
    homeRequestCta: "Request blood", homeDonateCta: "Become a donor", homeNote: "Local blood support for patients in need",
    dropCaption: "Share life", stepRequestTitle: "Submit a request", stepRequestText: "Tell us what the patient needs",
    stepTrackingTitle: "Track your request", stepTrackingText: "Check the status of your request",
    stepDonateTitle: "Become a donor", stepDonateText: "Register to help someone",
    homeHowKicker: "Simple and straightforward", homeHowTitle: "Three steps to get help",
    homeHowIntro: "Submit a request, keep your tracking ID, and stay in touch with our team.",
    homeCardRequestTitle: "Request blood", homeCardRequestText: "Enter patient, blood group, hospital, and when blood is needed.",
    homeCardRequestLink: "Start a request ←", homeCardTrackingTitle: "Track a request",
    homeCardTrackingText: "Look up your saved request using its unique tracking ID.", homeCardTrackingLink: "Track request ←",
    homeCardDonateTitle: "Register as a donor", homeCardDonateText: "Offer to donate blood by sharing your blood group and contact details.",
    homeCardDonateLink: "Become a donor ←", homeAboutKicker: "Rifah Welfare Society",
    homeAboutTitle: "Serving our community, one life at a time",
    homeAboutText: "We work to support families in need through health and welfare programs in Chak No. 116/WB.",
    homeAboutCta: "Learn about the society",
    homeImageAlt: "A donor helping a patient",
    requestImageAlt: "Helping a patient through blood donation", trackingImageAlt: "Blood request tracking support",
    donateImageAlt: "A blood donor helping someone", aboutImageAlt: "Rifah Society helping a patient",
    bloodGroupsKicker: "Blood groups", bloodGroupsTitle: "Do you know your blood group?",
    bloodGroupsText: "Select the correct blood group on the request or donor form. If you are unsure, confirm it with a laboratory first.",
    bloodGroupsNote: "If blood is urgently needed, contact the society by phone as well as submitting the online form.",
    homeContactKicker: "Need urgent help?", homeContactTitle: "Contact our team",
    homeContactText: "Along with the online form, please tell us about your need by phone.",
    requestKicker: "Help for a patient", requestTitle: "Request blood",
    requestIntro: "Enter the patient's details. You will receive a tracking ID after submitting the request.",
    requestStepsKicker: "Before you start", requestStepsTitle: "Have these details ready",
    requestTip1: "The patient's confirmed blood group and a contact number.",
    requestTip2: "The hospital name and when the blood is needed.",
    requestTip3: "A recent medical report, if available.",
    requestHelpText: "For an urgent need, call Rifah Welfare Society after submitting the form.",
    patientName: "Patient name <b>*</b>", yourName: "Your name <b>*</b>", phone: "Contact number <b>*</b>",
    bloodGroup: "Blood group <b>*</b>", selectBlood: "Select blood group", city: "City / village <b>*</b>",
    hospital: "Hospital name <b>*</b>", neededBy: "When is blood needed? <b>*</b>", hemoglobin: "Hemoglobin (Hb)",
    condition: "Medical condition / details", reportImage: "Medical report image <small>(optional)</small>",
    extraInfo: "Additional information", requestConsent: "I confirm that the information provided is accurate. <b>*</b>",
    submitRequest: "Submit request", requestPrivacy: "<strong>Privacy:</strong> Requests and medical reports are saved in the admin's local SQLite database. Only send medical information over HTTPS in a real deployment.",
    fullNamePlaceholder: "Full name", cityPlaceholder: "e.g. Chak No. 116/WB", hospitalPlaceholder: "Hospital name",
    hbPlaceholder: "e.g. 7.5", conditionPlaceholder: "Briefly describe the need",
    fileHint: "JPG, PNG, or WEBP image only; maximum 3 MB. The report is available to the admin in the protected panel.",
    extraPlaceholder: "Number of units or any other important details", donorCityPlaceholder: "Your area",
    age: "Age <b>*</b>", agePlaceholder: "18 to 65 years", lastDonation: "When did you last donate blood?",
    donorConsent: "I agree to provide my details so I can be contacted. <b>*</b>",
    registerDonor: "Register as a donor",
    donorPrivacy: "<strong>Privacy:</strong> Your details are submitted to Rifah Welfare Society and will be visible in the protected admin panel.",
    donateKicker: "Ready to share life?", donateTitle: "Register as a donor",
    donateIntro: "Share your basic details. Rifah Welfare Society may contact you when a donor is needed.",
    donorGuideKicker: "As a donor", donorGuideTitle: "Your offer can help",
    donorGuideText: "The team may contact you when a donor is needed. Follow a doctor's or blood bank's guidance about donation timing and medical eligibility.",
    donorTip1: "Enter your blood group and contact number accurately.",
    donorTip2: "Keep your phone reachable when help is needed.",
    donorTip3: "Check with medical staff before donating.",
    donorAboutLink: "View society contact details ←",
    trackingKicker: "Check your request", trackingTitle: "Track your request",
    trackingIntro: "Enter the tracking ID you received after submitting your request.",
    trackingStep1Title: "Enter your ID", trackingStep1Text: "Use the ID you received after submitting the request.",
    trackingStep2Title: "Review your request", trackingStep2Text: "See your request details and its current status.",
    trackingStep3Title: "Get in touch", trackingStep3Text: "Call the society for urgent help or confirmation.",
    trackingIdLabel: "Tracking ID", viewStatus: "View status",
    trackingDisclaimer: "The status is updated by Rifah Welfare Society. Contact the society by phone for urgent help or confirmation.",
    trackingRequestCta: "Request blood",
    aboutKicker: "About us", aboutTitle: "Rifah Welfare Society<br>Chak No. 116/WB",
    aboutIntro: "We run four major projects in our village through this organization.",
    aboutMark: "Serving<br>humanity", programHealth: "Health Program",
    programHealthText: "Arranging blood quickly in emergencies and treating deserving patients in the village.",
    programFamily: "Family Support Program", programFamilyText: "Supporting marriages of deserving orphan girls, funeral expenses for families in need, and food distribution.",
    programEmployment: "Employment Scheme", programEmploymentText: "Providing dignified employment to deserving skilled people in the village.",
    programEducation: "Educational Support Scholarship", programEducationText: "Helping deserving, talented students in the village continue their education.",
    teamKicker: "Our team", teamTitle: "Here to serve", chairman: "Chairman", president: "President",
    secretary: "General & Finance Secretary", healthManager: "Health Program Manager",
    familyManager: "Family Support Program Managers", employmentManager: "Employment Scheme", educationManager: "Education Program",
    contactKicker: "Get in touch", contactTitle: "We are here to help",
    officeAddress: "Visit our office: Chak No. 116/WB, near Malik Yasir Kiryana Store",
    warning: "<strong>Important notice:</strong> The organization consists only of the people listed above. No other person is associated with the organization, and it is not responsible for the words or actions of anyone else. Thank you.",
    chairmanName: "Hafiz Hammad Azmat", presidentName: "Adnan Shah", secretaryName: "Kashif Nawaz",
    healthManagerNames: "Asif Nawaz, Chand Noonari", familyManagerNames: "Usama Munir, Ali Raza",
    employmentManagerName: "Kashif Nawaz", educationManagerName: "Hammad Azmat",
    requestSaved: "Your request was received. Save your tracking ID: {id}",
    requestSaveError: "Could not submit your request. Please try again or contact the society.",
    donorSaved: "Thank you! Rifah Welfare Society has received your donor registration.",
    donorSaveError: "Could not submit your registration. Please try again.",
    fileInvalid: "Choose a valid image (JPG, PNG, or WEBP; maximum 3 MB).",
    fileSelected: "{name} — will be securely submitted to the admin.",
    trackingNotFound: "No request was found for this tracking ID. Check the ID and try again.",
    requestStatus: "Blood group: {group} · Hospital: {hospital}",
    needDate: "Blood needed: {date}", trackingCode: "Tracking ID: ",
    statusPending: "Request received", statusAccepted: "Request accepted",
    statusMatched: "Donor matched", statusFulfilled: "Blood need fulfilled",
    statusCancelled: "Request cancelled", cancelRequest: "Cancel request",
    cancelConfirm: "Do you want to cancel this request?",
    adminStatusOnly: "Contact Rifah Welfare Society's admin to confirm the status.",
    connectionError: "Could not connect to the server. Make sure the website server is running and try again.",
    pageTitleHome: "Rifah Blood Donation | Home",
    pageTitleRequest: "Request blood | Rifah Blood Donation", pageTitleTracking: "Track request | Rifah Blood Donation",
    pageTitleDonate: "Donate blood | Rifah Blood Donation", pageTitleAbout: "About us | Rifah Blood Donation"
  }
};

const translate = (key, values = {}) => {
  let value = TEXT[language]?.[key] ?? TEXT.ur[key] ?? key;
  Object.entries(values).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
};

let language = localStorage.getItem(STORAGE_KEYS.language) === "en" ? "en" : "ur";

function applyLanguage(nextLanguage) {
  language = nextLanguage === "en" ? "en" : "ur";
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  document.querySelectorAll(".language-select").forEach((select) => { select.value = language; });
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.alt = translate(element.dataset.i18nAlt);
  });
  document.querySelectorAll(".main-nav").forEach((nav) => {
    nav.setAttribute("aria-label", language === "ur" ? "مرکزی مینو" : "Main navigation");
  });
  document.querySelectorAll(".menu-toggle").forEach((button) => {
    button.setAttribute("aria-label", language === "ur" ? "مینو کھولیں" : "Open menu");
  });
  document.querySelectorAll(".language-select").forEach((select) => {
    select.setAttribute("aria-label", translate("languageLabel"));
  });
  const titleKey = `pageTitle${document.body.dataset.page[0].toUpperCase()}${document.body.dataset.page.slice(1)}`;
  document.title = translate(titleKey);
  const currentPage = document.body.dataset.page === "home" ? "index.html" : `${document.body.dataset.page}.html`;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === currentPage);
  });
  localStorage.setItem(STORAGE_KEYS.language, language);
}

function formValues(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function apiRequest(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  let response;
  try {
    response = await fetch(url, { ...options, headers, credentials: "same-origin" });
  } catch (error) {
    console.error(`Could not connect to ${url}.`, error);
    throw new Error(translate("connectionError"));
  }
  let body = null;
  if ((response.headers.get("content-type") || "").includes("application/json")) body = await response.json();
  if (!response.ok) {
    const message = body?.error || translate("connectionError");
    throw new Error(response.status >= 500 ? translate("connectionError") : message);
  }
  return body;
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function formatDate(value) {
  if (!value) return language === "ur" ? "درج نہیں کی گئی" : "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(language === "ur" ? "ur-PK" : "en-PK", { dateStyle: "medium", timeStyle: "short" });
}

function statusLabel(status) {
  const labels = {
    pending: "statusPending",
    accepted: "statusAccepted",
    matched: "statusMatched",
    fulfilled: "statusFulfilled",
    cancelled: "statusCancelled"
  };
  return translate(labels[status] || labels.pending);
}

let currentRequest = null;

applyLanguage(language);
document.querySelectorAll(".language-select").forEach((select) => {
  select.addEventListener("change", () => {
    applyLanguage(select.value);
    if (currentRequest) renderTrackingRequest(currentRequest);
    const fileInput = document.querySelector("#report-image");
    if (fileInput && !fileInput.files.length) {
      const fileHint = document.querySelector("#file-hint");
      fileHint.textContent = translate("fileHint");
      fileHint.classList.remove("form-message", "error");
    }
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

const requestForm = document.querySelector("#request-form");
if (requestForm) {
  const reportInput = document.querySelector("#report-image");
  const fileHint = document.querySelector("#file-hint");
  const resetFileHint = () => {
    fileHint.classList.remove("form-message", "error");
    fileHint.textContent = translate("fileHint");
  };

  reportInput.addEventListener("change", () => {
    const file = reportInput.files[0];
    if (!file) {
      resetFileHint();
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type) || file.size > 3 * 1024 * 1024) {
      reportInput.value = "";
      fileHint.textContent = translate("fileInvalid");
      fileHint.classList.add("form-message", "error");
      return;
    }
    fileHint.classList.remove("form-message", "error");
    fileHint.textContent = translate("fileSelected", { name: file.name });
  });

  requestForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = document.querySelector("#request-message");
    const submitButton = requestForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    showMessage(message, "");
    try {
      const result = await apiRequest("/api/requests", {
        method: "POST",
        body: new FormData(requestForm)
      });
      requestForm.reset();
      resetFileHint();
      window.location.href = `tracking.html?id=${encodeURIComponent(result.trackingId)}`;
    } catch (error) {
      showMessage(message, error.message || translate("requestSaveError"), true);
      submitButton.disabled = false;
    }
  });

  const neededByInput = requestForm.elements.namedItem("neededBy");
  const localNow = new Date();
  localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
  neededByInput.min = localNow.toISOString().slice(0, 16);
}

const donorForm = document.querySelector("#donor-form");
donorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.querySelector("#donor-message");
  const values = formValues(donorForm);
  const submitButton = donorForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  showMessage(message, "");
  try {
    await apiRequest("/api/donors", {
      method: "POST",
      body: JSON.stringify({
        name: values.name,
        phone: values.phone,
        bloodGroup: values.bloodGroup,
        city: values.city,
        age: Number(values.age),
        lastDonation: values.lastDonation,
        consent: values.consent === "on"
      })
    });
    donorForm.reset();
    showMessage(message, translate("donorSaved"));
  } catch (error) {
    showMessage(message, error.message || translate("donorSaveError"), true);
  } finally {
    submitButton.disabled = false;
  }
});

const trackingForm = document.querySelector("#tracking-form");
const trackingResult = document.querySelector("#tracking-result");

function renderTrackingRequest(request) {
  if (!trackingResult) return;
  const card = document.createElement("article");
  card.className = "tracking-card";
  const heading = document.createElement("h2");
  heading.textContent = translate("trackingTitle");
  const status = document.createElement("span");
  status.className = "status-pill";
  if (["accepted", "matched", "fulfilled"].includes(request.status)) status.classList.add("is-complete");
  if (request.status === "cancelled") status.classList.add("is-cancelled");
  status.textContent = statusLabel(request.status);
  const details = document.createElement("p");
  details.textContent = translate("requestStatus", {
    group: request.bloodGroup,
    hospital: request.hospital
  });
  const needBy = document.createElement("p");
  needBy.textContent = translate("needDate", { date: formatDate(request.neededBy) });
  const code = document.createElement("p");
  code.append(translate("trackingCode"));
  const codeValue = document.createElement("span");
  codeValue.className = "tracking-code";
  codeValue.textContent = request.trackingId;
  code.append(codeValue);
  card.append(heading, status, details, needBy, code);

  if (request.status === "pending") {
    const cancel = document.createElement("button");
    cancel.className = "cancel-request";
    cancel.type = "button";
    cancel.textContent = translate("cancelRequest");
    cancel.addEventListener("click", async () => {
      if (!window.confirm(translate("cancelConfirm"))) return;
      cancel.disabled = true;
      try {
        await apiRequest(`/api/requests/${encodeURIComponent(request.trackingId)}/cancel`, {
          method: "POST",
          body: JSON.stringify({ confirmation: request.trackingId })
        });
        await lookupTrackingRequest(request.trackingId);
      } catch (error) {
        cancel.disabled = false;
        showTrackingError(error.message);
      }
    });
    card.append(cancel);
  } else if (["accepted", "matched", "fulfilled"].includes(request.status)) {
    const note = document.createElement("p");
    note.className = "tracking-admin-note";
    note.textContent = translate("adminStatusOnly");
    card.append(note);
  }
  trackingResult.append(card);
}

function showTrackingError(message) {
  trackingResult.replaceChildren();
  const error = document.createElement("p");
  error.className = "tracking-error";
  error.textContent = message;
  trackingResult.append(error);
}

async function lookupTrackingRequest(trackingId) {
  try {
    currentRequest = await apiRequest(`/api/requests/${encodeURIComponent(trackingId)}`);
    renderTrackingRequest(currentRequest);
  } catch (error) {
    currentRequest = null;
    showTrackingError(error.message || translate("trackingNotFound"));
  }
}

if (trackingForm) {
  trackingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = trackingForm.elements.namedItem("trackingId").value.trim().toUpperCase();
    if (id) lookupTrackingRequest(id);
  });
  const trackingId = new URLSearchParams(window.location.search).get("id");
  if (trackingId) {
    trackingForm.elements.namedItem("trackingId").value = trackingId.toUpperCase();
    lookupTrackingRequest(trackingId.toUpperCase());
  }
}
