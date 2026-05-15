let users=JSON.parse(localStorage.getItem('users'))||[];const L='lang',T='theme',CUSTOMER='customer.html',ADMIN='admin.html';const D={en:{home:'Home',about:'About',how:'How it Works',login:'Login',signup:'Sign Up',themeDark:'Dark',themeLight:'Light',eyebrow:'Smart paper recycling platform',heroTitle:'Join us to protect the environment',heroText:'Start your recycling journey with ReLeaf today.',getStarted:'Get Started',f1:'For Institutions',f1t:'Easily schedule pickups and track your collection requests.',f2:'For Recycling Centers',f2t:'Receive organized requests and collect more recyclable materials.',f3:'Eco-Friendly Solution',f3t:'Support sustainable practices and reduce paper waste.',b1:'Eco-friendly',b1t:'Designed to make paper recycling easier for daily operations.',b2:'Simple workflow',b2t:'Submit, organize, and follow recycling requests from one place.',b3:'Organized access',b3t:'Separate customer and admin access for clearer management.',footerText:'A cleaner way to connect paper waste with recycling partners.',footerRights:'© 2026 ReLeaf. All rights reserved.',aboutLabel:'About ReLeaf',why:'Why <span>ReLeaf</span>?',whyText:'We bridge the gap between businesses with paper waste and recycling centers to create a cleaner, greener future.',process:'Process',workTitle:'How ReLeaf Works',s1:'1. List Your Paper Waste',s1t:'Register your institution and add paper or carton details.',s2:'2. Match with Recycling Centers',s2t:'Get connected with the best recycling partner.',s3:'3. Schedule & Track Pickup',s3t:'Choose a time and track the collection process.',cta:'Connecting Businesses with Recycling Centers',ctaText:'Bridging the gap between institutions with paper waste and recycling centers.',backHome:'← Home',loginTitle:'Welcome Back',loginSub:'Login to your ReLeaf account',signupTitle:'Create Account',signupSub:'Join ReLeaf and start recycling smarter',firstName:'First Name',lastName:'Last Name',username:'Username',email:'Email',password:'Password',role:'Account type',customer:'Customer',admin:'Admin',noAccount:"Don't have an account?",haveAccount:'Already have an account?',createAccount:'Create Account',usernameExists:'❌ Username already exists',emailExists:'❌ Email already used',accountCreated:'🎉 Account created successfully!',usernameNotFound:'❌ Username not found',wrongPassword:'❌ Wrong password',loginSuccess:'🎉 Login successful! Welcome {name}',weak:'Weak 🔴',medium:'Medium 🟡',strong:'Strong 🟢'},ar:{home:'الرئيسية',about:'من نحن',how:'كيف يعمل',login:'تسجيل الدخول',signup:'إنشاء حساب',themeDark:'داكن',themeLight:'فاتح',eyebrow:'منصة ذكية لإعادة تدوير الورق',heroTitle:'انضم إلينا لحماية البيئة',heroText:'ابدأ رحلة إعادة التدوير مع ReLeaf اليوم. ',getStarted:'ابدأ الآن',f1:'للمؤسسات',f1t:'جدولة عمليات الجمع بسهولة ومتابعة طلباتك.',f2:'لمراكز إعادة التدوير',f2t:'استقبل طلبات منظمة واحصل على مواد قابلة للتدوير أكثر.',f3:'حل صديق للبيئة',f3t:'ادعم الممارسات المستدامة وقلّل هدر الورق.',b1:'صديق للبيئة',b1t:'مصمم لتسهيل إعادة تدوير الورق ضمن العمل اليومي.',b2:'خطوات بسيطة',b2t:'أرسل ونظّم وتابع طلبات التدوير من مكان واحد.',b3:'دخول منظم',b3t:'دخول منفصل للمستخدم والمدير لإدارة أوضح.',footerText:'طريقة أنظف لربط نفايات الورق بشركاء إعادة التدوير.',footerRights:'© 2026 ReLeaf. جميع الحقوق محفوظة.',aboutLabel:'عن ReLeaf',why:'لماذا <span>ReLeaf</span>؟',whyText:'نربط المؤسسات التي لديها نفايات ورقية بمراكز إعادة التدوير لبناء مستقبل أنظف وأكثر استدامة.',process:'الخطوات',workTitle:'كيف يعمل ReLeaf',s1:'١. أضف نفايات الورق',s1t:'سجّل مؤسستك وأضف تفاصيل الورق أو الكرتون.',s2:'٢. المطابقة مع مراكز التدوير',s2t:'يتم ربطك مع أفضل شريك تدوير متاح.',s3:'٣. جدولة ومتابعة الجمع',s3t:'اختر الوقت المناسب وتابع حالة الطلب.',cta:' نربط المؤسسات مع مراكز إعادة التدوير',ctaText: ' نقرّب المسافة بين المؤسسات التي لديها نفايات ورقية ومراكز إعادة التدوير.',backHome:'الرئيسية ←',loginTitle:'أهلاً بعودتك',loginSub:'سجّل الدخول إلى حسابك في ReLeaf',signupTitle:'إنشاء حساب',signupSub:'انضم إلى ReLeaf وابدأ التدوير بطريقة أذكى',firstName:'الاسم الأول',lastName:'اسم العائلة',username:'اسم المستخدم',email:'البريد الإلكتروني',password:'كلمة المرور',role:'نوع الحساب',customer:'مستخدم',admin:'مدير',noAccount:'ليس لديك حساب؟',haveAccount:'لديك حساب بالفعل؟',createAccount:'إنشاء الحساب',usernameExists:'❌ اسم المستخدم موجود مسبقاً',emailExists:'❌ البريد الإلكتروني مستخدم مسبقاً',accountCreated:'🎉 تم إنشاء الحساب بنجاح!',usernameNotFound:'❌ اسم المستخدم غير موجود',wrongPassword:'❌ كلمة المرور غير صحيحة',loginSuccess:'🎉 تم تسجيل الدخول بنجاح! أهلاً {name}',weak:'ضعيفة 🔴',medium:'متوسطة 🟡',strong:'قوية 🟢'}};function lang(){let x=localStorage.getItem('releaf_language_v1')||localStorage.getItem(L)||'en';localStorage.setItem(L,x);localStorage.setItem('releaf_language_v1',x);return x}function theme(){let x=localStorage.getItem('releaf_theme_v1')||localStorage.getItem(T)||'light';localStorage.setItem(T,x);localStorage.setItem('releaf_theme_v1',x);return x}function tr(k,v={}){let s=(D[lang()]&&D[lang()][k])||D.en[k]||k;Object.keys(v).forEach(x=>s=s.replace('{'+x+'}',v[x]));return s}function applyTheme(x=theme()){x=x==='dark'?'dark':'light';localStorage.setItem(T,x);localStorage.setItem('releaf_theme_v1',x);document.documentElement.dataset.theme=x;document.querySelectorAll('#themeToggle').forEach(b=>b.innerHTML=x==='dark'?`☀️ <span data-i18n="themeLight">${tr('themeLight')}</span>`:`🌙 <span data-i18n="themeDark">${tr('themeDark')}</span>`)}function applyLang(x=lang()){x=x==='ar'?'ar':'en';localStorage.setItem(L,x);localStorage.setItem('releaf_language_v1',x);document.documentElement.lang=x;document.documentElement.dir=x==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(e=>e.textContent=tr(e.dataset.i18n));document.querySelectorAll('[data-i18n-html]').forEach(e=>e.innerHTML=tr(e.dataset.i18nHtml));document.querySelectorAll('[data-i18n-placeholder]').forEach(e=>e.placeholder=tr(e.dataset.i18nPlaceholder));document.querySelectorAll('#languageToggle').forEach(s=>s.value=x);applyTheme(theme())}document.addEventListener('DOMContentLoaded',()=>{applyTheme();applyLang();document.querySelectorAll('#languageToggle').forEach(s=>s.onchange=e=>applyLang(e.target.value));document.querySelectorAll('#themeToggle').forEach(b=>b.onclick=()=>applyTheme(theme()==='dark'?'light':'dark'))});
function releafPersistCurrentLanguage(){const v=(document.getElementById('languageToggle')?.value)||localStorage.getItem('releaf_language_v1')||localStorage.getItem('lang')||document.documentElement.lang||'en';applyLang(v==='ar'?'ar':'en');}
/* ===== AUTH -> CUSTOMER PROFILE SYNC ===== */
function releafSetLoggedInCustomer(user){
  const cleanUser = { ...user, role: user.role || "customer" };
  localStorage.setItem("currentUser", JSON.stringify(cleanUser));
  const fullName = [cleanUser.firstName, cleanUser.lastName].filter(Boolean).join(" ").trim() || cleanUser.username || "ReLeaf User";
  localStorage.setItem("releaf_profile_v1", JSON.stringify({
    fullName: fullName,
    email: cleanUser.email || "",
    phone: cleanUser.phone || "",
    username: cleanUser.username || "",
    passwordUpdatedAt: Date.now(),
    photo: null,
    profileProvince: "",
    profileLat: null,
    profileLon: null,
    profileLocationSource: ""
  }));
}

function register(){let firstName=firstNameEl('firstName'),lastName=firstNameEl('lastName'),username=firstNameEl('username'),email=firstNameEl('email'),password=document.getElementById('password')?.value||'';if(users.find(u=>u.username===username)){userMsg.innerText=tr('usernameExists');return}else userMsg.innerText='';if(users.find(u=>u.email===email)){emailMsg.innerText=tr('emailExists');return}else emailMsg.innerText='';users.push({firstName,lastName,username,email,password,role:'customer'});localStorage.setItem('users',JSON.stringify(users));alert(tr('accountCreated'));releafPersistCurrentLanguage();location.href='login.html'}function firstNameEl(id){return document.getElementById(id)?.value.trim()||''}function checkPassword(){let p=document.getElementById('password')?.value||'',m=document.getElementById('passMsg');if(!m)return;if(!p){m.innerText='';return}let c=[/[a-zA-Z]/.test(p),/[0-9]/.test(p),/[^a-zA-Z0-9]/.test(p)].filter(Boolean).length;m.innerText=c===1?tr('weak'):c===2?tr('medium'):tr('strong');m.style.color=c===1?'#d9534f':c===2?'#d99200':'#2f9e66'}function login(){let username=firstNameEl('username'),password=document.getElementById('password')?.value||'',role=document.getElementById('roleSelect')?.value||'customer';if(role==='admin'){localStorage.setItem('adminName',username||'Admin');alert(tr('loginSuccess',{name:username||'Admin'}));releafPersistCurrentLanguage();location.href=ADMIN;return}let us=JSON.parse(localStorage.getItem('users'))||[],u=us.find(x=>x.username===username);if(!u){userMsg.innerText=tr('usernameNotFound');passMsg.innerText='';return}userMsg.innerText='';if(u.password!==password){passMsg.innerText=tr('wrongPassword');passMsg.style.color='#d9534f';return}passMsg.innerText='';localStorage.setItem('currentUser',JSON.stringify(u));alert(tr('loginSuccess',{name:u.firstName||u.username}));location.href=CUSTOMER}

/* ===== SIGNUP / LOGIN VALIDATION PATCH ===== */
Object.assign(D.en, {
  phone: 'Phone Number',
  usernameHint: 'Username must be 4–18 characters, start with a letter, and use letters, numbers, or _ only.',
  phoneHint: 'Use a valid phone number so the team can contact you.',
  passwordHint: 'Use 8+ characters with letters and numbers. Add a symbol for stronger security.',
  requiredField: '❌ Please fill in all required fields',
  invalidUsername: '❌ Username must be 4–18 characters, start with a letter, and use letters/numbers/_ only',
  invalidEmail: '❌ Please enter a valid email address',
  invalidPhone: '❌ Please enter a valid phone number',
  weakPasswordFull: 'Weak 🔴 — add at least 8 characters with letters and numbers',
  mediumPasswordFull: 'Medium 🟡 — good, add a symbol for stronger security',
  strongPasswordFull: 'Strong 🟢',
  passwordTooWeak: '❌ Password is too weak',
  emptyLogin: '❌ Please enter username and password'
});
Object.assign(D.ar, {
  phone: 'رقم الهاتف',
  usernameHint: 'اسم المستخدم يجب أن يكون من 4 إلى 18 حرفاً، يبدأ بحرف، ويحتوي على حروف أو أرقام أو _ فقط.',
  phoneHint: 'استخدم رقم هاتف صحيح حتى يتمكن الفريق من التواصل معك.',
  passwordHint: 'استخدم 8 أحرف أو أكثر مع حروف وأرقام. أضف رمزاً ليكون أقوى.',
  requiredField: '❌ يرجى تعبئة جميع الحقول المطلوبة',
  invalidUsername: '❌ اسم المستخدم يجب أن يكون من 4 إلى 18 حرفاً، يبدأ بحرف، ويحتوي على حروف/أرقام/_ فقط',
  invalidEmail: '❌ يرجى إدخال بريد إلكتروني صحيح',
  invalidPhone: '❌ يرجى إدخال رقم هاتف صحيح',
  weakPasswordFull: 'ضعيفة 🔴 — أضف 8 أحرف على الأقل مع حروف وأرقام',
  mediumPasswordFull: 'متوسطة 🟡 — جيدة، أضف رمزاً لتصبح أقوى',
  strongPasswordFull: 'قوية 🟢',
  passwordTooWeak: '❌ كلمة المرور ضعيفة جداً',
  emptyLogin: '❌ يرجى إدخال اسم المستخدم وكلمة المرور'
});

function valueOf(id){ return document.getElementById(id)?.value.trim() || ''; }
function setMsg(id, text, color){ const el = document.getElementById(id); if(el){ el.innerText = text || ''; if(color) el.style.color = color; } }
function validUsernameValue(v){ return /^[A-Za-z][A-Za-z0-9_]{3,17}$/.test(v); }
function validEmailValue(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function validPhoneValue(v){ return /^\+?\d{8,15}$/.test(String(v).replace(/[\s()-]/g, '')); }
function passwordScore(p){
  const longEnough = p.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(p);
  const hasNumber = /[0-9]/.test(p);
  const hasSymbol = /[^a-zA-Z0-9]/.test(p);
  if(!longEnough || !(hasLetter && hasNumber)) return 1;
  if(hasSymbol && p.length >= 10) return 3;
  return 2;
}

function checkPassword(){
  const p = document.getElementById('password')?.value || '';
  const m = document.getElementById('passMsg');
  if(!m) return;
  if(!p){ m.innerText=''; return; }
  const score = passwordScore(p);
  if(score === 1){ m.innerText = tr('weakPasswordFull'); m.style.color = '#d9534f'; }
  else if(score === 2){ m.innerText = tr('mediumPasswordFull'); m.style.color = '#d99200'; }
  else { m.innerText = tr('strongPasswordFull'); m.style.color = '#2f9e66'; }
}

function register(){
  users = JSON.parse(localStorage.getItem('users')) || [];
  const firstName = valueOf('firstName');
  const lastName = valueOf('lastName');
  const username = valueOf('username');
  const email = valueOf('email');
  const phone = valueOf('phone');
  const password = document.getElementById('password')?.value || '';
  setMsg('userMsg',''); setMsg('emailMsg',''); setMsg('phoneMsg',''); setMsg('passMsg','');

  if(!firstName || !username || !email || !phone || !password){ setMsg('userMsg', tr('requiredField'), '#d9534f'); return; }
  if(!validUsernameValue(username)){ setMsg('userMsg', tr('invalidUsername'), '#d9534f'); return; }
  if(users.some(u => String(u.username || '').toLowerCase() === username.toLowerCase())){ setMsg('userMsg', tr('usernameExists'), '#d9534f'); return; }
  if(!validEmailValue(email)){ setMsg('emailMsg', tr('invalidEmail'), '#d9534f'); return; }
  if(users.some(u => String(u.email || '').toLowerCase() === email.toLowerCase())){ setMsg('emailMsg', tr('emailExists'), '#d9534f'); return; }
  if(!validPhoneValue(phone)){ setMsg('phoneMsg', tr('invalidPhone'), '#d9534f'); return; }
  if(passwordScore(password) === 1){ setMsg('passMsg', tr('passwordTooWeak'), '#d9534f'); return; }

  const newUser = { firstName, lastName, username, email, phone, password, role:'customer' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  releafSetLoggedInCustomer(newUser);
  alert(tr('accountCreated'));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

function login(){
  const username = valueOf('username');
  const password = document.getElementById('password')?.value || '';
  const role = document.getElementById('roleSelect')?.value || 'customer';
  setMsg('userMsg',''); setMsg('passMsg','');
  if(!username || !password){ setMsg('userMsg', tr('emptyLogin'), '#d9534f'); return; }
  if(role === 'admin'){
    localStorage.setItem('adminName', username || 'Admin');
    alert(tr('loginSuccess', { name: username || 'Admin' }));
    releafPersistCurrentLanguage();
    location.href = ADMIN;
    return;
  }
  const us = JSON.parse(localStorage.getItem('users')) || [];
  const u = us.find(x => String(x.username || '').toLowerCase() === username.toLowerCase());
  if(!u){ setMsg('userMsg', tr('usernameNotFound'), '#d9534f'); return; }
  if(u.password !== password){ setMsg('passMsg', tr('wrongPassword'), '#d9534f'); return; }
  releafSetLoggedInCustomer(u);
  alert(tr('loginSuccess', { name: u.firstName || u.username }));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  if(usernameInput && document.getElementById('firstName')){
    usernameInput.addEventListener('input', () => {
      const v = valueOf('username');
      if(!v) return setMsg('userMsg','');
      if(!validUsernameValue(v)) setMsg('userMsg', tr('invalidUsername'), '#d9534f');
      else if((JSON.parse(localStorage.getItem('users')) || []).some(u => String(u.username || '').toLowerCase() === v.toLowerCase())) setMsg('userMsg', tr('usernameExists'), '#d9534f');
      else setMsg('userMsg','');
    });
  }
  const phoneInput = document.getElementById('phone');
  if(phoneInput){
    phoneInput.addEventListener('input', () => {
      const v = valueOf('phone');
      if(!v) return setMsg('phoneMsg','');
      setMsg('phoneMsg', validPhoneValue(v) ? '' : tr('invalidPhone'), '#d9534f');
    });
  }
});

/* ===== FINAL AUTH UX: CONFIRM PASSWORD + JORDAN PHONE + SHOW/HIDE PASSWORD ===== */
Object.assign(D.en, {
  confirmPassword: 'Confirm Password',
  confirmPasswordRequired: '❌ Please confirm your password',
  passwordsMismatch: '❌ Passwords do not match',
  passwordsMatch: 'Passwords match ✅',
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  phoneHint: 'Use a valid Jordanian phone number, for example 07XXXXXXXX.',
  invalidPhone: '❌ Please enter a valid Jordanian phone number, for example 07XXXXXXXX'
});
Object.assign(D.ar, {
  confirmPassword: 'تأكيد كلمة المرور',
  confirmPasswordRequired: '❌ يرجى تأكيد كلمة المرور',
  passwordsMismatch: '❌ كلمتا المرور غير متطابقتين',
  passwordsMatch: 'كلمتا المرور متطابقتان ✅',
  showPassword: 'إظهار كلمة المرور',
  hidePassword: 'إخفاء كلمة المرور',
  phoneHint: 'استخدم رقم هاتف أردني صحيح، مثل 07XXXXXXXX.',
  invalidPhone: '❌ يرجى إدخال رقم هاتف أردني صحيح، مثل 07XXXXXXXX'
});

function normalizeJordanPhone(raw){
  let v = String(raw || '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  v = v.replace(/[\s()-]/g, '').replace(/[^\d+]/g, '');
  if(v.startsWith('00962')) v = '+962' + v.slice(5);
  if(v.startsWith('962')) v = '+962' + v.slice(3);
  if(/^7\d{8}$/.test(v)) v = '0' + v;
  return v;
}
function validPhoneValue(v){
  const p = normalizeJordanPhone(v);
  return /^07\d{8}$/.test(p) || /^\+9627\d{8}$/.test(p);
}
function checkConfirmPassword(){
  const confirmEl = document.getElementById('confirmPassword');
  const passwordEl = document.getElementById('password');
  const msg = document.getElementById('confirmMsg');
  if(!confirmEl || !passwordEl || !msg) return true;
  if(!confirmEl.value){ msg.innerText = ''; return false; }
  if(confirmEl.value !== passwordEl.value){ msg.innerText = tr('passwordsMismatch'); msg.style.color = '#d9534f'; return false; }
  msg.innerText = tr('passwordsMatch'); msg.style.color = '#2f9e66'; return true;
}
function checkPassword(){
  const p = document.getElementById('password')?.value || '';
  const m = document.getElementById('passMsg');
  if(!m) return;
  if(!p){ m.innerText=''; checkConfirmPassword(); return; }
  const score = passwordScore(p);
  if(score === 1){ m.innerText = tr('weakPasswordFull'); m.style.color = '#d9534f'; }
  else if(score === 2){ m.innerText = tr('mediumPasswordFull'); m.style.color = '#d99200'; }
  else { m.innerText = tr('strongPasswordFull'); m.style.color = '#2f9e66'; }
  checkConfirmPassword();
}
function register(){
  users = JSON.parse(localStorage.getItem('users')) || [];
  const firstName = valueOf('firstName');
  const lastName = valueOf('lastName');
  const username = valueOf('username');
  const email = valueOf('email');
  const phoneInput = document.getElementById('phone');
  const phone = normalizeJordanPhone(phoneInput?.value || '');
  const password = document.getElementById('password')?.value || '';
  const confirmPassword = document.getElementById('confirmPassword')?.value || '';
  setMsg('userMsg',''); setMsg('emailMsg',''); setMsg('phoneMsg',''); setMsg('passMsg',''); setMsg('confirmMsg','');

  if(!firstName || !username || !email || !phone || !password || !confirmPassword){ setMsg('userMsg', tr('requiredField'), '#d9534f'); return; }
  if(!validUsernameValue(username)){ setMsg('userMsg', tr('invalidUsername'), '#d9534f'); return; }
  if(users.some(u => String(u.username || '').toLowerCase() === username.toLowerCase())){ setMsg('userMsg', tr('usernameExists'), '#d9534f'); return; }
  if(!validEmailValue(email)){ setMsg('emailMsg', tr('invalidEmail'), '#d9534f'); return; }
  if(users.some(u => String(u.email || '').toLowerCase() === email.toLowerCase())){ setMsg('emailMsg', tr('emailExists'), '#d9534f'); return; }
  if(!validPhoneValue(phone)){ setMsg('phoneMsg', tr('invalidPhone'), '#d9534f'); return; }
  if(phoneInput) phoneInput.value = phone;
  if(passwordScore(password) === 1){ setMsg('passMsg', tr('passwordTooWeak'), '#d9534f'); return; }
  if(confirmPassword !== password){ setMsg('confirmMsg', tr('passwordsMismatch'), '#d9534f'); return; }

  const newUser = { firstName, lastName, username, email, phone, password, role:'customer' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  releafSetLoggedInCustomer(newUser);
  alert(tr('accountCreated'));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    const label = () => btn.setAttribute('aria-label', tr(btn.classList.contains('is-visible') ? 'hidePassword' : 'showPassword'));
    label();
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if(!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      btn.classList.toggle('is-visible', !visible);
      btn.textContent = visible ? '👁' : '🙈';
      label();
    });
  });
  const phoneInput = document.getElementById('phone');
  if(phoneInput){
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^\d+\s()-]/g, '');
      const v = valueOf('phone');
      if(!v) return setMsg('phoneMsg','');
      setMsg('phoneMsg', validPhoneValue(v) ? '' : tr('invalidPhone'), '#d9534f');
    });
    phoneInput.addEventListener('blur', () => { phoneInput.value = normalizeJordanPhone(phoneInput.value); });
  }
  const confirmEl = document.getElementById('confirmPassword');
  if(confirmEl) confirmEl.addEventListener('input', checkConfirmPassword);
});

/* ===== FINAL FIX: EMAIL DOMAIN VALIDATION + PASSWORD EYE UI ===== */
Object.assign(D.en, {
  invalidEmail: '❌ Please enter a valid email ending with @gmail.com, @yahoo.com, or @hotmail.com',
  emailHint: 'Use a real email such as name@gmail.com, name@yahoo.com, or name@hotmail.com.'
});
Object.assign(D.ar, {
  invalidEmail: '❌ يرجى إدخال بريد إلكتروني صحيح وينتهي بـ @gmail.com أو @yahoo.com أو @hotmail.com',
  emailHint: 'استخدمي بريد إلكتروني حقيقي مثل name@gmail.com أو name@yahoo.com أو name@hotmail.com.'
});

function validEmailValue(v){
  const email = String(v || '').trim().toLowerCase();
  return /^[a-z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(email);
}

function normalizeEmail(raw){
  return String(raw || '').trim().toLowerCase();
}

function setPasswordEyeIcon(btn, visible){
  btn.innerHTML = visible
    ? '<span aria-hidden="true">🙈</span>'
    : '<span aria-hidden="true">👁️</span>';
  btn.setAttribute('aria-label', tr(visible ? 'hidePassword' : 'showPassword'));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;

    // Remove older click handlers by replacing the button cleanly.
    const cleanBtn = btn.cloneNode(false);
    cleanBtn.className = btn.className;
    cleanBtn.dataset.target = btn.dataset.target;
    btn.replaceWith(cleanBtn);

    setPasswordEyeIcon(cleanBtn, false);
    cleanBtn.addEventListener('click', () => {
      const target = document.getElementById(cleanBtn.dataset.target);
      if (!target) return;
      const show = target.type === 'password';
      target.type = show ? 'text' : 'password';
      cleanBtn.classList.toggle('is-visible', show);
      setPasswordEyeIcon(cleanBtn, show);
    });
  });

  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      emailInput.value = normalizeEmail(emailInput.value);
      const val = emailInput.value;
      if (!val) return setMsg('emailMsg', '');
      setMsg('emailMsg', validEmailValue(val) ? '' : tr('invalidEmail'), '#d9534f');
    });
    emailInput.addEventListener('input', () => {
      const val = emailInput.value.trim();
      if (!val) return setMsg('emailMsg', '');
      setMsg('emailMsg', validEmailValue(val) ? '' : tr('invalidEmail'), '#d9534f');
    });
  }
});

// Re-declare register at the end so it uses the stricter email validator above.
function register(){
  users = JSON.parse(localStorage.getItem('users')) || [];
  const firstName = valueOf('firstName');
  const lastName = valueOf('lastName');
  const username = valueOf('username');
  const emailInput = document.getElementById('email');
  const email = normalizeEmail(emailInput?.value || '');
  const phoneInput = document.getElementById('phone');
  const phone = normalizeJordanPhone(phoneInput?.value || '');
  const password = document.getElementById('password')?.value || '';
  const confirmPassword = document.getElementById('confirmPassword')?.value || '';

  setMsg('userMsg','');
  setMsg('emailMsg','');
  setMsg('phoneMsg','');
  setMsg('passMsg','');
  setMsg('confirmMsg','');

  if(!firstName || !username || !email || !phone || !password || !confirmPassword){
    setMsg('userMsg', tr('requiredField'), '#d9534f');
    return;
  }
  if(!validUsernameValue(username)){
    setMsg('userMsg', tr('invalidUsername'), '#d9534f');
    return;
  }
  if(users.some(u => String(u.username || '').toLowerCase() === username.toLowerCase())){
    setMsg('userMsg', tr('usernameExists'), '#d9534f');
    return;
  }
  if(!validEmailValue(email)){
    setMsg('emailMsg', tr('invalidEmail'), '#d9534f');
    return;
  }
  if(emailInput) emailInput.value = email;
  if(users.some(u => String(u.email || '').toLowerCase() === email.toLowerCase())){
    setMsg('emailMsg', tr('emailExists'), '#d9534f');
    return;
  }
  if(!validPhoneValue(phone)){
    setMsg('phoneMsg', tr('invalidPhone'), '#d9534f');
    return;
  }
  if(phoneInput) phoneInput.value = phone;
  if(passwordScore(password) === 1){
    setMsg('passMsg', tr('passwordTooWeak'), '#d9534f');
    return;
  }
  if(confirmPassword !== password){
    setMsg('confirmMsg', tr('passwordsMismatch'), '#d9534f');
    return;
  }

  const newUser = { firstName, lastName, username, email, phone, password, role:'customer' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  releafSetLoggedInCustomer(newUser);
  alert(tr('accountCreated'));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

/* ===== FINAL SIGNUP COPY + EMAIL/CONFIRM RULES ===== */
Object.assign(D.en, {
  email: 'Email (example: name@gmail.com)',
  phone: '07xxxxxxxx',
  usernameHint: 'Username must be 4–18 characters, start with a letter, and use letters, numbers, or _ only.',
  phoneHint: 'Use a valid Jordanian phone number, for example 07XXXXXXXX.',
  invalidEmail: '❌ Please enter a real email ending with @gmail.com, @yahoo.com, or @hotmail.com',
  confirmPasswordRequired: '❌ Please confirm your password',
  passwordsMismatch: '❌ Passwords do not match'
});
Object.assign(D.ar, {
  email: 'البريد الإلكتروني (مثال: name@gmail.com)',
  phone: '07xxxxxxxx',
  usernameHint: 'اسم المستخدم يجب أن يكون من 4 إلى 18 حرفاً، يبدأ بحرف، ويحتوي على حروف أو أرقام أو _ فقط.',
  phoneHint: 'استخدمي رقم هاتف أردني صحيح، مثل 07XXXXXXXX.',
  invalidEmail: '❌ يرجى إدخال بريد إلكتروني حقيقي وينتهي بـ @gmail.com أو @yahoo.com أو @hotmail.com',
  confirmPasswordRequired: '❌ يرجى تأكيد كلمة المرور',
  passwordsMismatch: '❌ كلمتا المرور غير متطابقتين'
});

function validEmailValue(v){
  const email = String(v || '').trim().toLowerCase();
  return /^[a-z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com)$/.test(email);
}

function checkConfirmPassword(){
  const confirmEl = document.getElementById('confirmPassword');
  const passwordEl = document.getElementById('password');
  const msg = document.getElementById('confirmMsg');
  if(!confirmEl || !passwordEl || !msg) return true;
  if(!confirmEl.value){ msg.innerText = ''; return false; }
  if(confirmEl.value !== passwordEl.value){ msg.innerText = tr('passwordsMismatch'); msg.style.color = '#d9534f'; return false; }
  msg.innerText = tr('passwordsMatch'); msg.style.color = '#2f9e66'; return true;
}

function register(){
  users = JSON.parse(localStorage.getItem('users')) || [];
  const firstName = valueOf('firstName');
  const lastName = valueOf('lastName');
  const username = valueOf('username');
  const email = normalizeEmail(valueOf('email'));
  const phoneInput = document.getElementById('phone');
  const phone = normalizeJordanPhone(phoneInput?.value || '');
  const password = document.getElementById('password')?.value || '';
  const confirmPassword = document.getElementById('confirmPassword')?.value || '';
  setMsg('userMsg',''); setMsg('emailMsg',''); setMsg('phoneMsg',''); setMsg('passMsg',''); setMsg('confirmMsg','');

  if(!firstName || !username || !email || !phone || !password || !confirmPassword){ setMsg('userMsg', tr('requiredField'), '#d9534f'); return; }
  if(!validUsernameValue(username)){ setMsg('userMsg', tr('invalidUsername'), '#d9534f'); return; }
  if(users.some(u => String(u.username || '').toLowerCase() === username.toLowerCase())){ setMsg('userMsg', tr('usernameExists'), '#d9534f'); return; }
  if(!validEmailValue(email)){ setMsg('emailMsg', tr('invalidEmail'), '#d9534f'); return; }
  if(users.some(u => String(u.email || '').toLowerCase() === email.toLowerCase())){ setMsg('emailMsg', tr('emailExists'), '#d9534f'); return; }
  if(!validPhoneValue(phone)){ setMsg('phoneMsg', tr('invalidPhone'), '#d9534f'); return; }
  if(phoneInput) phoneInput.value = phone;
  const emailInput = document.getElementById('email');
  if(emailInput) emailInput.value = email;
  if(passwordScore(password) === 1){ setMsg('passMsg', tr('passwordTooWeak'), '#d9534f'); return; }
  if(!confirmPassword){ setMsg('confirmMsg', tr('confirmPasswordRequired'), '#d9534f'); return; }
  if(confirmPassword !== password){ setMsg('confirmMsg', tr('passwordsMismatch'), '#d9534f'); return; }

  const newUser = { firstName, lastName, username, email, phone, password, role:'customer' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  releafSetLoggedInCustomer(newUser);
  alert(tr('accountCreated'));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

function setPasswordEyeIcon(btn, visible){
  btn.innerHTML = visible ? '<span aria-hidden="true">🙈</span>' : '<span aria-hidden="true">👁️</span>';
  btn.setAttribute('aria-label', tr(visible ? 'hidePassword' : 'showPassword'));
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(lang());
  document.querySelectorAll('.toggle-password').forEach(btn => {
    setPasswordEyeIcon(btn, false);
    btn.onclick = () => {
      const input = document.getElementById(btn.dataset.target);
      if(!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('is-visible', show);
      setPasswordEyeIcon(btn, show);
    };
  });
  const confirmEl = document.getElementById('confirmPassword');
  if(confirmEl) confirmEl.addEventListener('input', checkConfirmPassword);
  const emailInput = document.getElementById('email');
  if(emailInput){
    emailInput.addEventListener('input', () => {
      const v = normalizeEmail(emailInput.value);
      if(!v) return setMsg('emailMsg','');
      setMsg('emailMsg', validEmailValue(v) ? '' : tr('invalidEmail'), '#d9534f');
    });
    emailInput.addEventListener('blur', () => { emailInput.value = normalizeEmail(emailInput.value); });
  }
});


/* ===== REAL FINAL PASSWORD TOGGLE FUNCTION FIX =====
   Rebinds the eye buttons once, after all previous handlers.
*/
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.password-wrap .toggle-password').forEach(function (oldBtn) {
    const targetId = oldBtn.dataset.target;
    const newBtn = oldBtn.cloneNode(false);
    newBtn.className = oldBtn.className;
    newBtn.type = 'button';
    newBtn.dataset.target = targetId;
    newBtn.innerHTML = '<span aria-hidden="true">👁️</span>';
    newBtn.setAttribute('aria-label', typeof tr === 'function' ? tr('showPassword') : 'Show password');
    oldBtn.replaceWith(newBtn);

    newBtn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const input = document.getElementById(targetId);
      if (!input) return;
      const shouldShow = input.type === 'password';
      input.type = shouldShow ? 'text' : 'password';
      newBtn.classList.toggle('is-visible', shouldShow);
      newBtn.innerHTML = shouldShow ? '<span aria-hidden="true">🙈</span>' : '<span aria-hidden="true">👁️</span>';
      newBtn.setAttribute('aria-label', typeof tr === 'function' ? tr(shouldShow ? 'hidePassword' : 'showPassword') : (shouldShow ? 'Hide password' : 'Show password'));
    });
  });
});


/* ===== FINAL ADMIN LOGIN + RESERVED USERS FIX =====
   Added only: keeps registered usernames/emails after sign out and restricts admin login names.
*/
Object.assign(D.en, {
  adminNameNotAllowed: '⏳ This admin name is not approved yet. A request was sent to the existing admins for review.',
  adminNameRequired: '❌ Please enter an admin name',
  adminApprovedNamesHint: 'Allowed admin names: Raneem, Raghad, or Mayar'
});
Object.assign(D.ar, {
  adminNameNotAllowed: '⏳ اسم الأدمن هذا غير معتمد حالياً. تم إرسال طلب للأدمن الموجودين لمراجعته.',
  adminNameRequired: '❌ يرجى إدخال اسم الأدمن',
  adminApprovedNamesHint: 'أسماء الأدمن المسموحة: رنيم، رغد، أو ميار'
});

function releafNormalizeNameForAdmin(value){
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

function releafApprovedAdminName(value){
  const clean = releafNormalizeNameForAdmin(value);
  const allowed = ['رنيم','رغد','ميار','raneem','raneem78','raneem788','raghad','mayar'];
  return allowed.some(name => clean === releafNormalizeNameForAdmin(name));
}

function releafStoreAdminAccessRequest(name){
  const key = 'releaf_admin_access_requests_v1';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  const cleanName = String(name || '').trim();
  if(!list.some(req => String(req.name || '').trim().toLowerCase() === cleanName.toLowerCase() && req.status === 'pending')){
    list.push({
      id: '#' + Math.floor(1000 + Math.random() * 9000),
      name: cleanName,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      sentTo: ['Raneem', 'Raghad', 'Mayar']
    });
    localStorage.setItem(key, JSON.stringify(list));
  }
}

// Re-declare login at the very end so existing UI stays the same, with only the new admin-name rule added.
function login(){
  const username = firstNameEl('username');
  const password = document.getElementById('password')?.value || '';
  const role = document.getElementById('roleSelect')?.value || 'customer';
  setMsg('userMsg','');
  setMsg('passMsg','');

  if(role === 'admin'){
    if(!username){
      setMsg('userMsg', tr('adminNameRequired'), '#d9534f');
      return;
    }
    if(!releafApprovedAdminName(username)){
      releafStoreAdminAccessRequest(username);
      setMsg('userMsg', tr('adminNameNotAllowed'), '#d99200');
      alert(tr('adminNameNotAllowed'));
      return;
    }
    localStorage.setItem('adminName', username);
    alert(tr('loginSuccess', {name: username}));
    releafPersistCurrentLanguage();
    location.href = ADMIN;
    return;
  }

  const us = JSON.parse(localStorage.getItem('users')) || [];
  const u = us.find(x => String(x.username || '').toLowerCase() === username.toLowerCase());
  if(!u){
    setMsg('userMsg', tr('usernameNotFound'), '#d9534f');
    return;
  }
  if(u.password !== password){
    setMsg('passMsg', tr('wrongPassword'), '#d9534f');
    return;
  }
  releafSetLoggedInCustomer(u);
  alert(tr('loginSuccess', {name: u.firstName || u.username}));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

// Extra live duplicate checks: username/email remain blocked because sign out no longer deletes registered accounts.
document.addEventListener('DOMContentLoaded', function(){
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  if(usernameInput && emailInput){
    usernameInput.addEventListener('input', function(){
      const v = valueOf('username');
      if(!v) return setMsg('userMsg','');
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if(savedUsers.some(u => String(u.username || '').toLowerCase() === v.toLowerCase())){
        setMsg('userMsg', tr('usernameExists'), '#d9534f');
      }
    });
    emailInput.addEventListener('input', function(){
      const v = normalizeEmail(emailInput.value || '');
      if(!v) return setMsg('emailMsg','');
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if(savedUsers.some(u => String(u.email || '').toLowerCase() === v.toLowerCase())){
        setMsg('emailMsg', tr('emailExists'), '#d9534f');
      }
    });
  }
});

/* ===== FINAL SIGNUP DUPLICATE VALIDATION FIX =====
   Added only: shows all signup errors together for taken username/email/phone and weak password.
*/
Object.assign(D.en, {
  phoneExists: '❌ Phone number already used'
});
Object.assign(D.ar, {
  phoneExists: '❌ رقم الهاتف مستخدم مسبقاً'
});

function releafSignupSavedUsers(){
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function releafPhoneTaken(phone){
  const clean = normalizeJordanPhone(phone || '');
  return releafSignupSavedUsers().some(u => normalizeJordanPhone(u.phone || '') === clean);
}
function releafUsernameTaken(username){
  return releafSignupSavedUsers().some(u => String(u.username || '').toLowerCase() === String(username || '').toLowerCase());
}
function releafEmailTaken(email){
  return releafSignupSavedUsers().some(u => String(u.email || '').toLowerCase() === String(email || '').toLowerCase());
}
function releafValidateSignupLiveField(field){
  if(field === 'username'){
    const username = valueOf('username');
    if(!username) return setMsg('userMsg','');
    if(!validUsernameValue(username)) return setMsg('userMsg', tr('invalidUsername'), '#d9534f');
    if(releafUsernameTaken(username)) return setMsg('userMsg', tr('usernameExists'), '#d9534f');
    return setMsg('userMsg','');
  }
  if(field === 'email'){
    const emailInput = document.getElementById('email');
    const email = normalizeEmail(emailInput?.value || '');
    if(!email) return setMsg('emailMsg','');
    if(!validEmailValue(email)) return setMsg('emailMsg', tr('invalidEmail'), '#d9534f');
    if(releafEmailTaken(email)) return setMsg('emailMsg', tr('emailExists'), '#d9534f');
    return setMsg('emailMsg','');
  }
  if(field === 'phone'){
    const phone = normalizeJordanPhone(document.getElementById('phone')?.value || '');
    if(!phone) return setMsg('phoneMsg','');
    if(!validPhoneValue(phone)) return setMsg('phoneMsg', tr('invalidPhone'), '#d9534f');
    if(releafPhoneTaken(phone)) return setMsg('phoneMsg', tr('phoneExists'), '#d9534f');
    return setMsg('phoneMsg','');
  }
}

document.addEventListener('DOMContentLoaded', function(){
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  if(usernameInput) usernameInput.addEventListener('input', function(){ releafValidateSignupLiveField('username'); });
  if(emailInput) emailInput.addEventListener('input', function(){ releafValidateSignupLiveField('email'); });
  if(phoneInput) phoneInput.addEventListener('input', function(){ releafValidateSignupLiveField('phone'); });
});

function register(){
  users = JSON.parse(localStorage.getItem('users')) || [];
  const firstName = valueOf('firstName');
  const lastName = valueOf('lastName');
  const username = valueOf('username');
  const email = normalizeEmail(valueOf('email'));
  const phoneInput = document.getElementById('phone');
  const phone = normalizeJordanPhone(phoneInput?.value || '');
  const password = document.getElementById('password')?.value || '';
  const confirmPassword = document.getElementById('confirmPassword')?.value || '';
  let hasError = false;

  setMsg('userMsg','');
  setMsg('emailMsg','');
  setMsg('phoneMsg','');
  setMsg('passMsg','');
  setMsg('confirmMsg','');

  if(!firstName || !username){
    setMsg('userMsg', tr('requiredField'), '#d9534f');
    hasError = true;
  }
  if(!email){
    setMsg('emailMsg', tr('requiredField'), '#d9534f');
    hasError = true;
  }
  if(!phone){
    setMsg('phoneMsg', tr('requiredField'), '#d9534f');
    hasError = true;
  }
  if(!password){
    setMsg('passMsg', tr('requiredField'), '#d9534f');
    hasError = true;
  }
  if(!confirmPassword){
    setMsg('confirmMsg', tr('confirmPasswordRequired'), '#d9534f');
    hasError = true;
  }

  if(username){
    if(!validUsernameValue(username)){ setMsg('userMsg', tr('invalidUsername'), '#d9534f'); hasError = true; }
    else if(releafUsernameTaken(username)){ setMsg('userMsg', tr('usernameExists'), '#d9534f'); hasError = true; }
  }

  if(email){
    if(!validEmailValue(email)){ setMsg('emailMsg', tr('invalidEmail'), '#d9534f'); hasError = true; }
    else if(releafEmailTaken(email)){ setMsg('emailMsg', tr('emailExists'), '#d9534f'); hasError = true; }
  }

  if(phone){
    if(!validPhoneValue(phone)){ setMsg('phoneMsg', tr('invalidPhone'), '#d9534f'); hasError = true; }
    else if(releafPhoneTaken(phone)){ setMsg('phoneMsg', tr('phoneExists'), '#d9534f'); hasError = true; }
  }

  if(phoneInput) phoneInput.value = phone;
  const emailInput = document.getElementById('email');
  if(emailInput) emailInput.value = email;

  if(password && passwordScore(password) === 1){
    setMsg('passMsg', tr('passwordTooWeak'), '#d9534f');
    hasError = true;
  }
  if(confirmPassword && confirmPassword !== password){
    setMsg('confirmMsg', tr('passwordsMismatch'), '#d9534f');
    hasError = true;
  }

  if(hasError) return;

  const newUser = { firstName, lastName, username, email, phone, password, role:'customer' };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  releafSetLoggedInCustomer(newUser);
  alert(tr('accountCreated'));
  releafPersistCurrentLanguage();
  location.href = CUSTOMER;
}

/* ===== FINAL AUTH CONSISTENCY FIX: login uses saved current credentials only ===== */
(function(){
  const ADMIN_PASSWORDS_KEY = 'releaf_admin_passwords_v1';
  function adminKey(name){
    return String(name || '').trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,'').replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  }
  function getAdminPasswords(){ try { return JSON.parse(localStorage.getItem(ADMIN_PASSWORDS_KEY) || '{}') || {}; } catch(e){ return {}; } }
  function isLoginPage(){ return !!document.getElementById('roleSelect') && !document.getElementById('firstName'); }
  document.addEventListener('DOMContentLoaded', function(){
    if(!isLoginPage()) return;
    const u = document.getElementById('username');
    const p = document.getElementById('password');
    if(u) u.addEventListener('input', function(){ setMsg('userMsg',''); });
    if(p) p.addEventListener('input', function(){ setMsg('passMsg',''); });
  });
  const previousLogin = typeof login === 'function' ? login : null;
  window.login = login = function(){
    const username = firstNameEl('username');
    const password = document.getElementById('password')?.value || '';
    const role = document.getElementById('roleSelect')?.value || 'customer';
    setMsg('userMsg',''); setMsg('passMsg','');
    if(!username || !password){ setMsg('userMsg', tr('emptyLogin'), '#d9534f'); return; }
    if(role === 'admin'){
      if(!releafApprovedAdminName(username)){
        releafStoreAdminAccessRequest(username);
        setMsg('userMsg', tr('adminNameNotAllowed'), '#d99200');
        alert(tr('adminNameNotAllowed'));
        return;
      }
      const savedPasswords = getAdminPasswords();
      const key = adminKey(username);
      if(savedPasswords[key] && savedPasswords[key] !== password){
        setMsg('passMsg', tr('wrongPassword'), '#d9534f');
        return;
      }
      localStorage.setItem('adminName', username);
      localStorage.setItem('releaf_current_admin_v1', key);
      alert(tr('loginSuccess', {name: username}));
      releafPersistCurrentLanguage();
    location.href = ADMIN;
      return;
    }
    const us = JSON.parse(localStorage.getItem('users')) || [];
    const lookup = String(username || '').trim().toLowerCase();
    const u = us.find(x => String(x.username || '').trim().toLowerCase() === lookup || String(x.email || '').trim().toLowerCase() === lookup);
    if(!u){ setMsg('userMsg', tr('usernameNotFound'), '#d9534f'); return; }
    if(u.password !== password){ setMsg('passMsg', tr('wrongPassword'), '#d9534f'); return; }
    releafSetLoggedInCustomer(u);
    alert(tr('loginSuccess', {name: u.firstName || u.username}));
    releafPersistCurrentLanguage();
  location.href = CUSTOMER;
  };
})();


/* ===== REQUESTED ONLY: signup/login formatting-safe placeholder fix ===== */
document.addEventListener('DOMContentLoaded', function(){
  const phoneInput = document.getElementById('phone');
  if(phoneInput){
    phoneInput.setAttribute('placeholder', '07xxxxxxxx');
  }
});


/* ===== REQUESTED ONLY PATCH: optional last name + phone placeholder/hint ===== */
(function(){
  function isArabic(){ return document.documentElement.lang === 'ar'; }
  function applySignupOptionalLastNameUI(){
    var lastName = document.getElementById('lastName');
    if(lastName){
      lastName.removeAttribute('required');
      lastName.placeholder = isArabic() ? 'اسم العائلة (اختياري)' : 'Last Name (optional)';
    }
    var phone = document.getElementById('phone');
    if(phone){
      phone.placeholder = '07xxxxxxxx';
      phone.setAttribute('placeholder', '07xxxxxxxx');
    }
    var phoneHint = document.querySelector('[data-i18n="phoneHint"]');
    if(phoneHint){
      phoneHint.textContent = isArabic() ? 'استخدمي رقم هاتف أردني صحيح، مثل 07xxxxxxxx.' : 'Use a valid Jordanian phone number, for example 07xxxxxxxx.';
    }
  }
  document.addEventListener('DOMContentLoaded', applySignupOptionalLastNameUI);
  document.addEventListener('change', function(e){ if(e.target && e.target.id === 'languageToggle') setTimeout(applySignupOptionalLastNameUI, 20); });
  setTimeout(applySignupOptionalLastNameUI, 100);
})();

/* ===== FINAL REQUESTED PATCH: signup field-specific validation, optional last name ===== */
(function(){
  function msg(id, text, color){
    const el = document.getElementById(id);
    if(!el) return;
    el.innerText = text || '';
    if(color) el.style.color = color;
  }
  function val(id){ return (document.getElementById(id)?.value || '').trim(); }
  function bad(text){ return text || ''; }
  function clearSignupMessages(){
    ['userMsg','emailMsg','phoneMsg','passMsg','confirmMsg'].forEach(function(id){ msg(id, ''); });
  }
  const oldApplyLang = typeof applyLang === 'function' ? applyLang : null;
  if(oldApplyLang){
    applyLang = function(){
      const result = oldApplyLang.apply(this, arguments);
      const phone = document.getElementById('phone');
      if(phone) phone.placeholder = '07xxxxxxxx';
      return result;
    };
  }
  window.register = register = function(){
    users = JSON.parse(localStorage.getItem('users')) || [];
    const firstName = val('firstName');
    const lastName = val('lastName');
    const username = val('username');
    const email = val('email');
    const phoneEl = document.getElementById('phone');
    const phone = typeof normalizeJordanPhone === 'function' ? normalizeJordanPhone(phoneEl?.value || '') : val('phone');
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    clearSignupMessages();

    if(!firstName){ msg('userMsg', bad(document.documentElement.lang === 'ar' ? '❌ الاسم الأول مطلوب' : '❌ First name is required'), '#d9534f'); return; }
    if(!username){ msg('userMsg', bad(document.documentElement.lang === 'ar' ? '❌ اسم المستخدم مطلوب' : '❌ Username is required'), '#d9534f'); return; }
    if(typeof validUsernameValue === 'function' && !validUsernameValue(username)){ msg('userMsg', tr('invalidUsername'), '#d9534f'); return; }
    if(users.some(function(u){ return String(u.username || '').toLowerCase() === username.toLowerCase(); })){ msg('userMsg', tr('usernameExists'), '#d9534f'); return; }
    if(!email){ msg('emailMsg', document.documentElement.lang === 'ar' ? '❌ البريد الإلكتروني مطلوب' : '❌ Email is required', '#d9534f'); return; }
    if(typeof validEmailValue === 'function' && !validEmailValue(email)){ msg('emailMsg', tr('invalidEmail'), '#d9534f'); return; }
    if(users.some(function(u){ return String(u.email || '').toLowerCase() === email.toLowerCase(); })){ msg('emailMsg', tr('emailExists'), '#d9534f'); return; }
    if(!phone){ msg('phoneMsg', document.documentElement.lang === 'ar' ? '❌ رقم الهاتف مطلوب' : '❌ Phone number is required', '#d9534f'); return; }
    if(typeof validPhoneValue === 'function' && !validPhoneValue(phone)){ msg('phoneMsg', tr('invalidPhone'), '#d9534f'); return; }
    if(phoneEl) phoneEl.value = phone;
    if(!password){ msg('passMsg', document.documentElement.lang === 'ar' ? '❌ كلمة المرور مطلوبة' : '❌ Password is required', '#d9534f'); return; }
    if(typeof passwordScore === 'function' && passwordScore(password) === 1){ msg('passMsg', tr('passwordTooWeak'), '#d9534f'); return; }
    if(document.getElementById('confirmPassword') && !confirmPassword){ msg('confirmMsg', tr('confirmPasswordRequired'), '#d9534f'); return; }
    if(document.getElementById('confirmPassword') && confirmPassword !== password){ msg('confirmMsg', tr('passwordsMismatch'), '#d9534f'); return; }

    const newUser = { firstName: firstName, lastName: lastName, username: username, email: email, phone: phone, password: password, role: 'customer' };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    if(typeof releafSetLoggedInCustomer === 'function') releafSetLoggedInCustomer(newUser);
    else localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert(tr('accountCreated'));
    releafPersistCurrentLanguage();
  location.href = CUSTOMER;
  };
  document.addEventListener('DOMContentLoaded', function(){
    const phone = document.getElementById('phone');
    if(phone) phone.placeholder = '07xxxxxxxx';
  });
})();
