/* ReLeaf Pro i18n overlay
   Drop-in translation system: JSON files + fallback + dynamic DOM translation.
   It does not remove your existing applyLanguage(); it wraps it safely. */
(function () {
  'use strict';

  const LANGUAGE_STORAGE_KEY = 'releaf_language_v1';
  const LEGACY_LANGUAGE_KEY = 'lang';
  const DEFAULT_LANG = 'en';

  const FALLBACK = {
    en: {
      dashboard: 'Dashboard', requests: 'My Requests', profile: 'Profile', contact: 'Contact Admin', addBtn: 'Add Paper / Carton +',
      hello: 'Hello!', hiThere: 'Hi there!', seedlingMember: 'Seedling · ReLeaf member', collectionAddress: 'Collection address', updateGps: 'Update GPS', setInProfile: 'Set in Profile', savedAddressHint: 'Same as your saved collection address',
      treesSaved: 'Trees Saved', recycled: 'Recycled', currentRank: 'Current Rank', recentActivity: 'Recent Activity', requestsHistory: 'Requests History', all: 'All', active: 'Active', completed: 'Completed', id: 'ID', type: 'Type', weight: 'Weight', status: 'Status', emptyMsg: 'No requests yet. Add your first collection request!',
      account: 'Account', myProfile: 'My profile', verified: 'Verified', name: 'Name', fullName: 'Full name', email: 'Email', phone: 'Phone', phoneNumber: 'Phone number', memberSince: 'Member since', username: 'Username', password: 'Password', notSetYet: 'Not set yet', governorateMapGps: 'Governorate + map pin or GPS', lastUpdatedPassword: 'Last updated 3 months ago', contactCollection: 'Contact & collection', signInSecurity: 'Sign-in & security', changePhoto: 'Change photo', remove: 'Remove', saveChanges: 'Save changes', backDashboard: 'Back to dashboard',
      cancelTitle: 'Cancel Request?', cancelWhy: 'Please tell us why you are cancelling this request:', wrongInfo: 'Wrong information entered', notReady: "Items aren't ready for collection", changedMind: 'Changed my mind', other: 'Other', tellMore: 'Tell us more (optional)...', confirmCancel: 'Confirm Cancel', goBack: 'Go Back', requestCancelled: 'Request Cancelled', canceled: 'Canceled',
      edit: 'Edit', value: 'Value', confirmPassword: 'Confirm new password', apply: 'Apply',
      contactAdmin: 'Contact admin', contactIntro: 'Send a message to the ReLeaf team. We’ll use your profile email for replies.', replyTo: 'Reply to:', topic: 'Topic', message: 'Message', generalQuestion: 'General question', collectionOrRequest: 'Collection or request', accountOrProfile: 'Account or profile', billingOrPayments: 'Billing or payments', feedback: 'Feedback', contactMessagePlaceholder: 'Describe your question or issue…', sendEmail: 'Send in email app', contactNote: 'Opens your mail app with this message filled in. You can edit before sending.',
      collectionIntro: 'Step 1: Choose your governorate (this matches how we route drivers). Step 2: Set a precise point with GPS or by moving the pin on the map — that’s where we’ll collect from you.', governorate: 'Governorate', useCurrentLocation: 'Use my current location', setPinMap: 'Set pin on map', dragPinHint: 'Drag the pin to your entrance, yard, or loading area.', applyAddress: 'Apply address', saved: 'Saved',
      cancel: 'Cancel', requestSentAdmin: 'Request Sent to Admin', pending: 'Awaiting Approval', created: 'Request Created', assigned: 'Admin Assigned', driver: 'Driver En Route', templateBottom: 'Once the admin reviews your request, your estimated arrival time will appear here.',
      newRequest: 'New Request', paperType: 'Paper Type', source: 'Source', weightKg: 'Weight (kg)', minWeightHint: 'Add the minimum weight you estimate you have.', weightGuide: 'Weight Guide?', closeGuide: 'Close Guide', commonEstimates: 'Common Estimates:', smallBox: 'Small Box:', largeCarton: 'Large Carton:', sheets500: '500 A4 Sheets:', magsStack: 'Stack of Mags (30cm):', minWeightEstimate: 'Minimum estimated weight (kg)', collectionTime: 'Preferred collection time', actionType: 'Action Type', sell: 'Sell', donate: 'Donate', exchange: 'Exchange', chooseExchangeReward: 'Choose exchange reward', locationForRequest: 'Location for this request', locationHint: 'Your saved collection address is used for routing. Here, choose whether this request uses the map or a governorate and area list.', gpsMap: 'GPS / Map', manualEntry: 'Manual entry', district: 'District / area', notes: 'Notes', additionalDetails: 'Additional details...', unsureSize: 'Unsure about the size?', sizeHelp: "Standard cartons usually weigh between 10-20kg. If you don't have a scale, just give us your best guess!", submitRequest: 'Submit Request',
      home: 'Home', school: 'School', university: 'University', company: 'Company', factory: 'Factory', damaged: 'Damaged', clean: 'Clean', carton: 'Carton', artwork: 'Recycled paper artwork', paperBundle: 'Clean paper bundle', stationery: 'Eco stationery pack', storageBoxes: 'Recycled carton storage boxes',
      locating: 'Locating...', locationSet: 'Location Set', locationError: 'Location Error', sentToAdmin: 'Sent to Admin', partner: 'Partner', available: 'Available', minimumEstimate: 'Minimum estimate', kg: 'kg', sprout: 'Sprout', sapling: 'Sapling', forestGuardian: 'Forest Guardian', seedling: 'Seedling', logout: 'Sign Out', lightMode: 'Light', darkMode: 'Dark', calendarHint: '📅 Click the calendar icon to choose the date'
    },
    ar: {
      dashboard: 'الصفحة الرئيسية', requests: 'طلباتي', profile: 'الملف الشخصي', contact: 'تواصل مع الإدارة', addBtn: 'إضافة ورق / كرتون +',
      hello: 'مرحباً!', hiThere: 'أهلاً بك!', seedlingMember: 'شتلة · عضو في ReLeaf', collectionAddress: 'عنوان الجمع', updateGps: 'تحديث GPS', setInProfile: 'اضبطه من الملف الشخصي', savedAddressHint: 'نفس عنوان الجمع المحفوظ',
      treesSaved: 'أشجار تم إنقاذها', recycled: 'تمت إعادة تدويره', currentRank: 'الرتبة الحالية', recentActivity: 'آخر النشاطات', requestsHistory: 'سجل الطلبات', all: 'الكل', active: 'نشط', completed: 'مكتمل', id: 'المعرف', type: 'النوع', weight: 'الوزن', status: 'الحالة', emptyMsg: 'لا توجد طلبات بعد. أضف أول طلب جمع!',
      account: 'الحساب', myProfile: 'ملفي الشخصي', verified: 'موثّق', name: 'الاسم', fullName: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الهاتف', phoneNumber: 'رقم الهاتف', memberSince: 'عضو منذ', username: 'اسم المستخدم', password: 'كلمة المرور', notSetYet: 'لم يتم التحديد بعد', governorateMapGps: 'المحافظة + دبوس الخريطة أو GPS', lastUpdatedPassword: 'آخر تحديث قبل 3 أشهر', contactCollection: 'معلومات التواصل والجمع', signInSecurity: 'تسجيل الدخول والأمان', changePhoto: 'تغيير الصورة', remove: 'إزالة', saveChanges: 'حفظ التغييرات', backDashboard: 'العودة للوحة',
      cancelTitle: 'إلغاء الطلب؟', cancelWhy: 'يرجى إخبارنا بسبب إلغاء هذا الطلب:', wrongInfo: 'تم إدخال معلومات خاطئة', notReady: 'الأغراض غير جاهزة للجمع', changedMind: 'غيّرت رأيي', other: 'أخرى', tellMore: 'أخبرنا المزيد (اختياري)...', confirmCancel: 'تأكيد الإلغاء', goBack: 'رجوع', requestCancelled: 'تم إلغاء الطلب', canceled: 'تم الإلغاء',
      edit: 'تعديل', value: 'القيمة', confirmPassword: 'تأكيد كلمة المرور الجديدة', apply: 'تطبيق',
      contactAdmin: 'التواصل مع الإدارة', contactIntro: 'أرسل رسالة إلى فريق ReLeaf. سنستخدم بريد ملفك الشخصي للرد.', replyTo: 'الرد إلى:', topic: 'الموضوع', message: 'الرسالة', generalQuestion: 'سؤال عام', collectionOrRequest: 'الجمع أو الطلب', accountOrProfile: 'الحساب أو الملف الشخصي', billingOrPayments: 'الفواتير أو الدفعات', feedback: 'ملاحظات', contactMessagePlaceholder: 'اكتب سؤالك أو مشكلتك...', sendEmail: 'إرسال عبر البريد', contactNote: 'سيفتح تطبيق البريد مع تعبئة الرسالة ويمكنك تعديلها قبل الإرسال.',
      collectionIntro: 'الخطوة 1: اختر المحافظة (حسبها نوجّه السائقين). الخطوة 2: حدّد نقطة دقيقة باستخدام GPS أو بتحريك الدبوس على الخريطة — هذا هو مكان الجمع.', governorate: 'المحافظة', useCurrentLocation: 'استخدم موقعي الحالي', setPinMap: 'تحديد دبوس على الخريطة', dragPinHint: 'اسحب الدبوس إلى المدخل أو الساحة أو منطقة التحميل.', applyAddress: 'تطبيق العنوان', saved: 'تم الحفظ',
      cancel: 'إلغاء', requestSentAdmin: 'تم إرسال الطلب إلى الإدارة', pending: 'بانتظار الموافقة', created: 'تم إنشاء الطلب', assigned: 'تم تعيين الإدارة', driver: 'السائق بالطريق', templateBottom: 'بعد مراجعة الإدارة لطلبك، سيظهر وقت الوصول المتوقع هنا.',
      newRequest: 'طلب جديد', paperType: 'نوع الورق', source: 'المصدر', weightKg: 'الوزن (كغ)', minWeightHint: 'أدخل أقل وزن تتوقع أنه متوفر لديك.', weightGuide: 'دليل الوزن؟', closeGuide: 'إغلاق الدليل', commonEstimates: 'تقديرات شائعة:', smallBox: 'صندوق صغير:', largeCarton: 'كرتونة كبيرة:', sheets500: '500 ورقة A4:', magsStack: 'مجموعة مجلات (30 سم):', minWeightEstimate: 'أقل وزن تقديري (كغ)', collectionTime: 'وقت الجمع المفضل', actionType: 'نوع الإجراء', sell: 'بيع', donate: 'تبرع', exchange: 'استبدال', chooseExchangeReward: 'اختر مكافأة الاستبدال', locationForRequest: 'موقع هذا الطلب', locationHint: 'يتم استخدام عنوان الجمع المحفوظ للتوجيه. هنا اختر هل تريد تحديد الموقع بالخريطة أو من قائمة المحافظة والمنطقة.', gpsMap: 'GPS / الخريطة', manualEntry: 'إدخال يدوي', district: 'المنطقة / الحي', notes: 'ملاحظات', additionalDetails: 'تفاصيل إضافية...', unsureSize: 'غير متأكد من الحجم؟', sizeHelp: 'عادةً يتراوح وزن الكراتين القياسية بين 10 و20 كغ. إذا لم يكن لديك ميزان، أعطنا أفضل تقدير لديك!', submitRequest: 'إرسال الطلب',
      home: 'المنزل', school: 'المدرسة', university: 'الجامعة', company: 'الشركة', factory: 'المصنع', damaged: 'تالف', clean: 'نظيف', carton: 'كرتون', artwork: 'لوحة فنية من ورق معاد تدويره', paperBundle: 'باقة ورق نظيف', stationery: 'باقة قرطاسية صديقة للبيئة', storageBoxes: 'صناديق تخزين من كرتون معاد تدويره',
      locating: 'جاري تحديد الموقع...', locationSet: 'تم تحديد الموقع', locationError: 'خطأ في الموقع', sentToAdmin: 'تم الإرسال إلى الإدارة', partner: 'الشريك', available: 'وقت التوفر', minimumEstimate: 'الحد الأدنى التقديري', kg: 'كغ', sprout: 'برعم', sapling: 'شتلة نامية', forestGuardian: 'حارس الغابة', seedling: 'شتلة', logout: 'تسجيل الخروج', lightMode: 'فاتح', darkMode: 'داكن', calendarHint:  '📅 اضغط على أيقونة التقويم لاختيار التاريخ'
    }
  };

  const EXACT_EN_TO_KEY = {
    'Dashboard': 'dashboard', 'My Requests': 'requests', 'Profile': 'profile', 'Contact Admin': 'contact', 'Add Paper / Carton +': 'addBtn',
    'Hello!': 'hello', 'Hi there!': 'hiThere', 'Seedling · ReLeaf member': 'seedlingMember', 'Collection address': 'collectionAddress', 'Update GPS': 'updateGps', 'Set in Profile': 'setInProfile', 'Same as your saved collection address': 'savedAddressHint',
    'Trees Saved': 'treesSaved', 'Recycled': 'recycled', 'Current Rank': 'currentRank', 'Recent Activity': 'recentActivity', 'Requests History': 'requestsHistory', 'All': 'all', 'Active': 'active', 'Completed': 'completed', 'ID': 'id', 'Type': 'type', 'Weight': 'weight', 'Status': 'status', 'No requests yet. Add your first collection request!': 'emptyMsg',
    'Account': 'account', 'My profile': 'myProfile', 'Verified': 'verified', 'Name': 'name', 'Full name': 'fullName', 'Email': 'email', 'Phone': 'phone', 'Phone number': 'phoneNumber', 'Member since': 'memberSince', 'Username': 'username', 'Password': 'password', 'Not set yet': 'notSetYet', 'Governorate + map pin or GPS': 'governorateMapGps', 'Last updated 3 months ago': 'lastUpdatedPassword', 'Contact & collection': 'contactCollection', 'Sign-in & security': 'signInSecurity', 'Change photo': 'changePhoto', 'Remove': 'remove', 'Save changes': 'saveChanges', 'Back to dashboard': 'backDashboard',
    'Cancel Request?': 'cancelTitle', 'Please tell us why you are cancelling this request:': 'cancelWhy', 'Wrong information entered': 'wrongInfo', "Items aren't ready for collection": 'notReady', 'Changed my mind': 'changedMind', 'Other': 'other', 'Tell us more (optional)...': 'tellMore', 'Confirm Cancel': 'confirmCancel', 'Go Back': 'goBack', 'Request Cancelled': 'requestCancelled', 'Canceled': 'canceled',
    'Edit': 'edit', 'Value': 'value', 'Confirm new password': 'confirmPassword', 'Apply': 'apply',
    'Contact admin': 'contactAdmin', 'Send a message to the ReLeaf team. We’ll use your profile email for replies.': 'contactIntro', 'Reply to:': 'replyTo', 'Topic': 'topic', 'Message': 'message', 'General question': 'generalQuestion', 'Collection or request': 'collectionOrRequest', 'Account or profile': 'accountOrProfile', 'Billing or payments': 'billingOrPayments', 'Feedback': 'feedback', 'Describe your question or issue…': 'contactMessagePlaceholder', 'Send in email app': 'sendEmail', 'Opens your mail app with this message filled in. You can edit before sending.': 'contactNote',
    'Step 1: Choose your governorate (this matches how we route drivers). Step 2: Set a precise point with GPS or by moving the pin on the map — that’s where we’ll collect from you.': 'collectionIntro', 'Governorate': 'governorate', 'Use my current location': 'useCurrentLocation', 'Set pin on map': 'setPinMap', 'Drag the pin to your entrance, yard, or loading area.': 'dragPinHint', 'Apply address': 'applyAddress', 'Saved': 'saved',
    'Cancel': 'cancel', 'Request Sent to Admin': 'requestSentAdmin', 'AWAITING APPROVAL': 'pending', 'Awaiting Approval': 'pending', 'Request Created': 'created', 'Admin Assigned': 'assigned', 'Driver En Route': 'driver', 'Once the admin reviews your request, your estimated arrival time will appear here.': 'templateBottom',
    'New Request': 'newRequest', 'Paper Type': 'paperType', 'Source': 'source', 'Weight (kg)': 'weightKg', 'Add the minimum weight you estimate you have.': 'minWeightHint', 'Weight Guide?': 'weightGuide', 'Close Guide': 'closeGuide', 'Common Estimates:': 'commonEstimates', 'Small Box:': 'smallBox', 'Large Carton:': 'largeCarton', '500 A4 Sheets:': 'sheets500', 'Stack of Mags (30cm):': 'magsStack', 'Minimum estimated weight (kg)': 'minWeightEstimate', 'Preferred collection time': 'collectionTime', 'Action Type': 'actionType', 'Sell': 'sell', 'Donate': 'donate', 'Exchange': 'exchange', 'Choose exchange reward': 'chooseExchangeReward', 'Location for this request': 'locationForRequest', 'Your saved collection address is used for routing. Here, choose whether this request uses the map or a governorate and area list.': 'locationHint', 'GPS / Map': 'gpsMap', 'Manual entry': 'manualEntry', 'District / area': 'district', 'Notes': 'notes', 'Additional details...': 'additionalDetails', 'Unsure about the size?': 'unsureSize', "Standard cartons usually weigh between 10-20kg. If you don't have a scale, just give us your best guess!": 'sizeHelp', 'Submit Request': 'submitRequest',
    'Home': 'home', 'School': 'school', 'University': 'university', 'Company': 'company', 'Factory': 'factory', 'Damaged': 'damaged', 'Clean': 'clean', 'Carton': 'carton', 'Recycled paper artwork': 'artwork', 'Clean paper bundle': 'paperBundle', 'Eco stationery pack': 'stationery', 'Recycled carton storage boxes': 'storageBoxes',
    'Locating...': 'locating', 'Location Error': 'locationError', 'Sent to Admin': 'sentToAdmin', 'Partner': 'partner', 'Available': 'available', 'Minimum estimate': 'minimumEstimate', 'kg': 'kg', 'Seedling': 'seedling', 'Sprout': 'sprout', 'Sapling': 'sapling', 'Forest Guardian': 'forestGuardian', 'Sign Out': 'logout', 'Light': 'lightMode', 'Dark': 'darkMode'
  };

  let currentLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || localStorage.getItem(LEGACY_LANGUAGE_KEY) || DEFAULT_LANG;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizeLang(currentLang));
  localStorage.setItem(LEGACY_LANGUAGE_KEY, normalizeLang(currentLang));
  let translations = { ...FALLBACK.en };
  let reverseCurrent = new Map();
  const ALL_VALUE_TO_KEY = new Map();
  Object.values(FALLBACK).forEach((dict) => {
    Object.entries(dict).forEach(([key, value]) => {
      if (typeof value === 'string') ALL_VALUE_TO_KEY.set(value.trim(), key);
    });
  });
  let observer;
  const originalApplyLanguage = window.applyLanguage;

  function normalizeLang(lang) { return lang === 'ar' ? 'ar' : 'en'; }
  function getLang() { return normalizeLang(currentLang); }

  function t(key, vars = {}) {
    let str = translations[key] || FALLBACK[getLang()][key] || FALLBACK.en[key] || key;
    Object.keys(vars).forEach((k) => { str = str.replaceAll(`{${k}}`, vars[k]); });
    return str;
  }

  function buildReverseMap() {
    reverseCurrent = new Map();
    Object.entries(translations).forEach(([key, value]) => {
      if (typeof value === 'string') reverseCurrent.set(value.trim(), key);
    });
  }

  async function loadTranslations(lang) {
    const finalLang = normalizeLang(lang);
    try {
      const res = await fetch(`lang/${finalLang}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error('JSON not found');
      const json = await res.json();
      translations = { ...FALLBACK[finalLang], ...json };
    } catch (err) {
      translations = { ...FALLBACK[finalLang] };
    }
    buildReverseMap();
  }

  function setDocumentLanguage(lang) {
    currentLang = normalizeLang(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
    localStorage.setItem(LEGACY_LANGUAGE_KEY, currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    const toggle = document.getElementById('languageToggle');
    if (toggle) toggle.value = currentLang;
  }

  function translateDataAttributes(root = document) {
    root.querySelectorAll?.('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    root.querySelectorAll?.('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    root.querySelectorAll?.('[data-i18n-title]').forEach((el) => {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    root.querySelectorAll?.('[data-i18n-aria-label]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
    });
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(parent.tagName);
  }

  function replaceTextNode(node) {
    if (shouldSkipTextNode(node)) return;
    const original = node.nodeValue;
    const trimmed = original.trim().replace(/\s+/g, ' ');
    if (!trimmed) return;

    let key = EXACT_EN_TO_KEY[trimmed];
    if (!key) key = reverseCurrent.get(trimmed);
    if (!key) key = ALL_VALUE_TO_KEY.get(trimmed);
    if (!key) return;

    const before = original.match(/^\s*/)?.[0] || '';
    const after = original.match(/\s*$/)?.[0] || '';
    node.nodeValue = before + t(key) + after;
  }

  function translateTextNodes(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      replaceTextNode(root);
      return;
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) replaceTextNode(node);
  }

  function rankKeyFromText(value) {
    const raw = String(value || '').trim();
    const normalized = raw.replace(/·.*$/, '').trim();
    const map = {
      'Seedling': 'seedling',
      'Sprout': 'sprout',
      'Sapling': 'sapling',
      'Forest Guardian': 'forestGuardian',
      'شتلة': 'seedling',
      'برعم': 'sprout',
      'شتلة نامية': 'sapling',
      'حارس الغابة': 'forestGuardian'
    };
    return map[normalized] || EXACT_EN_TO_KEY[normalized] || 'seedling';
  }

  function refreshRankLabels() {
    const level = document.getElementById('userLevel');
    const rankKey = rankKeyFromText(level ? level.textContent : 'Seedling');
    if (level) level.textContent = t(rankKey);

    const rankPill = document.getElementById('profileHeroRankLabel');
    if (rankPill) rankPill.textContent = t(rankKey);

    const sub = document.getElementById('sidebarSubtitle');
    if (sub) {
      sub.textContent = getLang() === 'ar'
        ? `${t(rankKey)} · عضو في ReLeaf`
        : `${t(rankKey)} · ReLeaf member`;
    }
  }

  function translateCommonDynamicParts() {
    const lang = getLang();
    document.querySelectorAll('.status-badge').forEach((el) => {
      el.textContent = translateStatusBadgeText(el.textContent);
    });
    document.querySelectorAll('.status-pill').forEach((el) => {
      el.textContent = translateMixedDynamicString(el.textContent);
    });

    refreshRankLabels();

    const cancelToast = document.getElementById('cancelToast');
    if (cancelToast) {
      cancelToast.childNodes.forEach((n) => { if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) n.nodeValue = ' ' + t('requestCancelled') + ' '; });
    }
  }



  function firstNameFromPage() {
    const full = document.getElementById('profileHeroName')?.textContent?.trim() || '';
    if (full) return full.split(/\s+/)[0];
    const current = document.getElementById('sidebarGreeting')?.textContent || '';
    return current.replace(/[!،,]/g, ' ').split(/\s+/).filter(Boolean).pop() || '';
  }

  function translateTypeValue(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (raw === 'damaged' || raw === 'تالف') return t('damaged');
    if (raw === 'clean' || raw === 'نظيف') return t('clean');
    if (raw === 'carton' || raw === 'كرتون') return t('carton');
    return value;
  }


  function translateMixedDynamicString(value) {
    const lang = getLang();
    let out = String(value || '');

    const pairs = [
      ['Partner', 'الشريك', 'partner'],
      ['Available', 'وقت التوفر', 'available'],
      ['Minimum estimate', 'الحد الأدنى التقديري', 'minimumEstimate'],
      ['Awaiting Approval', 'بانتظار الموافقة', 'pending'],
      ['Request Created', 'تم إنشاء الطلب', 'created'],
      ['Admin Assigned', 'تم تعيين الإدارة', 'assigned'],
      ['Driver En Route', 'السائق بالطريق', 'driver'],
      ['Cancel', 'إلغاء', 'cancel'],
      ['Canceled', 'تم الإلغاء', 'canceled'],
      ['Request Sent to Admin', 'تم إرسال الطلب إلى الإدارة', 'requestSentAdmin'],
      ['Once the admin reviews your request, your estimated arrival time will appear here.', 'بعد مراجعة الإدارة لطلبك، سيظهر وقت الوصول المتوقع هنا.', 'templateBottom'],
      ['Major hub for paper & cardboard collection in Amman.', 'مركز رئيسي لجمع الورق والكرتون في عمّان.', 'ammanHubInfo']
    ];

    pairs.forEach(([en, ar, key]) => {
      const replacement = key === 'ammanHubInfo'
        ? (lang === 'ar' ? ar : en)
        : t(key);
      out = out.split(en).join(replacement).split(ar).join(replacement);
      out = out.split(en.toUpperCase()).join(replacement.toUpperCase());
    });

    out = out.replace(/\bkg\b|كغ/g, t('kg'));
    return out;
  }


  function translateStatusBadgeText(value) {
    const lang = getLang();
    const raw = String(value || '').trim().toLowerCase();
    const normalized = raw.replace(/[_-]+/g, ' ');

    if (normalized.includes('driver') || normalized.includes('السائق')) {
      return t('driver');
    }
    if (normalized.includes('completed') || normalized.includes('مكتمل')) {
      return t('completed');
    }
    if (normalized.includes('canceled') || normalized.includes('cancelled') || normalized.includes('إلغاء') || normalized.includes('ملغى')) {
      return t('canceled');
    }
    if (normalized.includes('approved') || normalized.includes('assigned') || normalized.includes('تمت الموافقة') || normalized.includes('تعيين')) {
      return lang === 'ar' ? 'تمت الموافقة' : 'Approved';
    }
    return t('pending');
  }

  function fixRequestCardsAndDynamicText() {
    const lang = getLang();
    const name = firstNameFromPage();
    const greet = document.getElementById('sidebarGreeting');
    if (greet && name) greet.textContent = lang === 'ar' ? `مرحباً، ${name}!` : `Hello, ${name}!`;
    const welcome = document.getElementById('welcomeText');
    if (welcome && name) welcome.textContent = lang === 'ar' ? `أهلاً، ${name}!` : `Hi, ${name}!`;

    refreshRankLabels();

    document.querySelectorAll('.trackType').forEach((el) => { el.textContent = translateTypeValue(el.textContent); });

    document.querySelectorAll('#activityTable tr').forEach((row) => {
      if (row.cells && row.cells.length >= 4) {
        row.cells[1].textContent = translateTypeValue(row.cells[1].textContent);
        row.cells[2].textContent = translateMixedDynamicString(row.cells[2].textContent);
      }
    });

    document.querySelectorAll('.arrival-card').forEach((card) => {
      const bottom = Array.from(card.querySelectorAll('p')).find((p) =>
        p.textContent.includes('admin reviews') || p.textContent.includes('مراجعة الإدارة') || p.textContent.includes('بعد مراجعة')
      );
      if (bottom) bottom.textContent = t('templateBottom');

      const status = card.querySelector('.status-badge');
      if (status) status.textContent = translateStatusBadgeText(status.textContent);

      const title = Array.from(card.querySelectorAll('h4')).find((h) =>
        h.textContent.includes('Request Sent') || h.textContent.includes('تم إرسال')
      );
      if (title) title.textContent = t('requestSentAdmin');

      card.querySelectorAll('small').forEach((small) => {
        small.textContent = translateMixedDynamicString(small.textContent);
      });
      card.querySelectorAll('.card-cancel-btn').forEach((btn) => {
        btn.childNodes.forEach((n) => { if (n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()) n.nodeValue = ' ' + t('cancel'); });
      });

      const hub = card.querySelector('.trackHub');
      if (hub) {
        hub.innerHTML = translateMixedDynamicString(hub.innerHTML)
          .replace(/paper &amp; cardboard/g, 'paper & cardboard');
      }
    });
  }



  /* Province + district translation overlay (keeps option values in English for existing app logic) */
  const PROVINCE_LABELS = {
    en: {
      'Amman': 'Amman', 'Irbid': 'Irbid', 'Zarqa': 'Zarqa', 'Balqa': 'Balqa', 'Madaba': 'Madaba', 'Karak': 'Karak', 'Mafraq': 'Mafraq', 'Jerash': 'Jerash', 'Ajloun': 'Ajloun', "Ma'an": "Ma'an", 'Tafilah': 'Tafilah', 'Aqaba': 'Aqaba'
    },
    ar: {
      'Amman': 'عمّان', 'Irbid': 'إربد', 'Zarqa': 'الزرقاء', 'Balqa': 'البلقاء', 'Madaba': 'مادبا', 'Karak': 'الكرك', 'Mafraq': 'المفرق', 'Jerash': 'جرش', 'Ajloun': 'عجلون', "Ma'an": 'معان', 'Tafilah': 'الطفيلة', 'Aqaba': 'العقبة'
    }
  };

  const DISTRICT_LABELS = {
    en: {
      'Amman City': 'Amman City', 'Marka': 'Marka', 'Al-Quwaysimah': 'Al-Quwaysimah', 'University District': 'University District', 'Wadi Al-Seer': 'Wadi Al-Seer', "Na'oor": "Na'oor", 'Sahab': 'Sahab', 'Al-Jiza': 'Al-Jiza', 'Al-Muwaqqar': 'Al-Muwaqqar',
      'Irbid City': 'Irbid City', 'Bani Kenanah': 'Bani Kenanah', 'Al-Kura': 'Al-Kura', 'Al-Ramtha': 'Al-Ramtha', 'Northern Ghor': 'Northern Ghor', 'Bani Obeid': 'Bani Obeid', 'Mazar Al-Shamali': 'Mazar Al-Shamali', 'Taybeh': 'Taybeh', 'Wastiyyah': 'Wastiyyah',
      'Zarqa City': 'Zarqa City', 'Russeifa': 'Russeifa', 'Hashemiyah': 'Hashemiyah',
      'As-Salt': 'As-Salt', 'Shuna al-Janubiyya': 'Shuna al-Janubiyya', 'Deir Alla': 'Deir Alla', 'Ain al-Basha': 'Ain al-Basha', 'Fuheis & Mahis': 'Fuheis & Mahis',
      'Madaba City': 'Madaba City', 'Dhiban': 'Dhiban',
      'Karak City': 'Karak City', 'Mazar Al-Janubiyya': 'Mazar Al-Janubiyya', 'Al-Qasr': 'Al-Qasr', 'Southern Ghor': 'Southern Ghor', 'Ayy': 'Ayy', "Faqqu'": "Faqqu'", 'Qatraneh': 'Qatraneh',
      'Mafraq City': 'Mafraq City', 'Ruwayshid': 'Ruwayshid', 'Northern Badia': 'Northern Badia', 'North-Western Badia': 'North-Western Badia',
      'Jerash City': 'Jerash City', 'Ajloun City': 'Ajloun City', 'Kofranjah': 'Kofranjah',
      "Ma'an City": "Ma'an City", 'Petra': 'Petra', 'Al-Shoubak': 'Al-Shoubak', 'Al-Husayniyya': 'Al-Husayniyya',
      'Tafilah City': 'Tafilah City', 'Al-Hasa': 'Al-Hasa', 'Birsayra': 'Birsayra',
      'Aqaba City': 'Aqaba City', 'Al-Quwayra': 'Al-Quwayra'
    },
    ar: {
      'Amman City': 'مدينة عمّان', 'Marka': 'ماركا', 'Al-Quwaysimah': 'القويسمة', 'University District': 'لواء الجامعة', 'Wadi Al-Seer': 'وادي السير', "Na'oor": 'ناعور', 'Sahab': 'سحاب', 'Al-Jiza': 'الجيزة', 'Al-Muwaqqar': 'الموقر',
      'Irbid City': 'مدينة إربد', 'Bani Kenanah': 'بني كنانة', 'Al-Kura': 'الكورة', 'Al-Ramtha': 'الرمثا', 'Northern Ghor': 'الأغوار الشمالية', 'Bani Obeid': 'بني عبيد', 'Mazar Al-Shamali': 'المزار الشمالي', 'Taybeh': 'الطيبة', 'Wastiyyah': 'الوسطية',
      'Zarqa City': 'مدينة الزرقاء', 'Russeifa': 'الرصيفة', 'Hashemiyah': 'الهاشمية',
      'As-Salt': 'السلط', 'Shuna al-Janubiyya': 'الشونة الجنوبية', 'Deir Alla': 'دير علا', 'Ain al-Basha': 'عين الباشا', 'Fuheis & Mahis': 'الفحيص وماحص',
      'Madaba City': 'مدينة مادبا', 'Dhiban': 'ذيبان',
      'Karak City': 'مدينة الكرك', 'Mazar Al-Janubiyya': 'المزار الجنوبي', 'Al-Qasr': 'القصر', 'Southern Ghor': 'الأغوار الجنوبية', 'Ayy': 'عي', "Faqqu'": 'فقوع', 'Qatraneh': 'القطرانة',
      'Mafraq City': 'مدينة المفرق', 'Ruwayshid': 'الرويشد', 'Northern Badia': 'البادية الشمالية', 'North-Western Badia': 'البادية الشمالية الغربية',
      'Jerash City': 'مدينة جرش', 'Ajloun City': 'مدينة عجلون', 'Kofranjah': 'كفرنجة',
      "Ma'an City": 'مدينة معان', 'Petra': 'البتراء', 'Al-Shoubak': 'الشوبك', 'Al-Husayniyya': 'الحسينية',
      'Tafilah City': 'مدينة الطفيلة', 'Al-Hasa': 'الحسا', 'Birsayra': 'بصيرا',
      'Aqaba City': 'مدينة العقبة', 'Al-Quwayra': 'القويرة'
    }
  };

  function reverseLookup(labels, value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    for (const canonical of Object.keys(labels.en)) {
      if (raw === canonical || raw === labels.en[canonical] || raw === labels.ar[canonical]) return canonical;
    }
    return raw;
  }

  function translateLocationSelects() {
    const lang = getLang();
    ['province', 'profileLocProvinceSelect'].forEach((id) => {
      const sel = document.getElementById(id);
      if (!sel) return;
      Array.from(sel.options).forEach((opt) => {
        const canonical = reverseLookup(PROVINCE_LABELS, opt.value || opt.textContent);
        if (PROVINCE_LABELS.en[canonical]) {
          opt.value = canonical;
          opt.textContent = PROVINCE_LABELS[lang][canonical];
        }
      });
    });

    const districtSel = document.getElementById('district');
    if (districtSel) {
      Array.from(districtSel.options).forEach((opt) => {
        const canonical = reverseLookup(DISTRICT_LABELS, opt.value || opt.textContent);
        if (DISTRICT_LABELS.en[canonical]) {
          opt.value = canonical;
          opt.textContent = DISTRICT_LABELS[lang][canonical];
        }
      });
    }
  }

  function translateProvinceInVisibleText() {
    const lang = getLang();
    document.querySelectorAll('#displayAddress, #profileDdLocation, #profileLocationRowValue').forEach((el) => {
      let html = el.innerHTML;
      Object.keys(PROVINCE_LABELS.en).forEach((p) => {
        html = html.split(PROVINCE_LABELS.en[p]).join(PROVINCE_LABELS[lang][p]);
        html = html.split(PROVINCE_LABELS.ar[p]).join(PROVINCE_LABELS[lang][p]);
      });
      el.innerHTML = html;
    });
  }

  function translateDOM(root = document) {
    translateDataAttributes(root);
    translateTextNodes(root.nodeType === Node.DOCUMENT_NODE ? document.body : root);
    translateCommonDynamicParts();
    fixRequestCardsAndDynamicText();
    translateLocationSelects();
    translateProvinceInVisibleText();
  }

  async function setLanguage(lang, opts = {}) {
    setDocumentLanguage(lang);
    await loadTranslations(currentLang);
    if (typeof originalApplyLanguage === 'function' && !opts.skipOriginal) {
      try { originalApplyLanguage(currentLang); } catch (e) { console.warn('Original applyLanguage failed:', e); }
    }
    translateDOM(document);
    applyTheme(getTheme());
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function attachObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      if (!translations) return;
      observer.disconnect();
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) translateDOM(node.nodeType === Node.TEXT_NODE ? node : node);
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
    if (document.body) observer.observe(document.body, { childList: true, subtree: true });
  }

  window.t = t;
  window.translateElement = translateDOM;
  window.setLanguage = setLanguage;
  window.applyLanguage = function (lang) { return setLanguage(lang); };



  /* Theme switcher */
  const THEME_STORAGE_KEY = 'releaf_theme_v1';
  const LEGACY_THEME_KEY = 'theme';
  function normalizeTheme(theme) { return theme === 'dark' ? 'dark' : 'light'; }
  function getTheme() { const theme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_KEY) || 'light'); localStorage.setItem(THEME_STORAGE_KEY, theme); localStorage.setItem(LEGACY_THEME_KEY, theme); return theme; }
  function applyTheme(theme) {
    const finalTheme = normalizeTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, finalTheme);
    localStorage.setItem(LEGACY_THEME_KEY, finalTheme);
    document.documentElement.setAttribute('data-theme', finalTheme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
      const icon = btn.querySelector('.theme-icon');
      const label = btn.querySelector('.theme-label');
      if (icon) icon.textContent = finalTheme === 'dark' ? '☀️' : '🌙';
      if (label) {
        label.setAttribute('data-i18n', finalTheme === 'dark' ? 'lightMode' : 'darkMode');
        label.textContent = finalTheme === 'dark' ? t('lightMode') : t('darkMode');
      }
      btn.setAttribute('aria-label', finalTheme === 'dark' ? t('lightMode') : t('darkMode'));
    }
  }
  function attachThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.onclick = () => applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
    applyTheme(getTheme());
  }

  window.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.value = currentLang;
      toggle.onchange = (e) => setLanguage(e.target.value);
    }
    attachObserver();
    attachThemeToggle();
    document.getElementById('province')?.addEventListener('change', () => setTimeout(translateLocationSelects, 0));
    document.getElementById('profileLocProvinceSelect')?.addEventListener('change', () => setTimeout(translateLocationSelects, 0));
    setLanguage(currentLang).then(() => { translateLocationSelects(); translateProvinceInVisibleText(); applyTheme(getTheme()); });
  });
})();
