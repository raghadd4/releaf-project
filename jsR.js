function showPage(id, clickedItem){

  // إخفاء كل الصفحات
  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  // إظهار الصفحة المطلوبة
  const page = document.getElementById(id);
  if(page) page.classList.add("active");

  // إزالة التفعيل من كل عناصر السايدبار
  document.querySelectorAll(".sidebar li")
    .forEach(li => li.classList.remove("active-link"));

  // إذا الكبس مباشر من السايدبار
  if(clickedItem){
    clickedItem.classList.add("active-link");
  }

  // إذا الانتقال صار من زر داخلي
  else{

    const sidebarMap = {
      dashboard: 0,
      users: 1,
      requests: 2,
      reports: 3,
      settings: 4
    };

    const items = document.querySelectorAll(".sidebar li");

    if(items[sidebarMap[id]]){
      items[sidebarMap[id]].classList.add("active-link");
    }
  }

  // تحميل الطلبات عند فتح صفحة الطلبات
  if(id === "requests"){
    loadRequests();
  }
}
function logout(){ localStorage.clear(); location.reload(); }
let users = JSON.parse(localStorage.getItem("users")) || [];
let notif = Number(localStorage.getItem("notifCount") || 3);
function currentLang(){ return pendingLang || localStorage.getItem("lang") || "en"; }
let pendingAdminPhoto = null;
let pendingRemoveAdminPhoto = false;
let pendingTheme = null;
let pendingLang = null;
let pendingNotifStatus = null;
function t(key){ const lang=currentLang(); return (translations[lang]&&translations[lang][key])||translations.en[key]||key; }
function translateValue(value){ const map={Pending:"pendingStatus",Completed:"completedStatus",Damaged:"damaged",Clean:"clean",Carton:"carton"}; return map[value]?t(map[value]):value; }
function renderRows(list){
  const table=document.querySelector("tbody"); table.innerHTML="";
  if(!list.length){ table.innerHTML=`<tr><td colspan="4" class="empty-row">${t("noRequests")}</td></tr>`; return; }
  list.forEach(u=>{ table.innerHTML+=`<tr><td>${u.name}</td><td>${translateValue(u.type)}</td><td>${u.weight}kg</td><td><span class="status ${u.status==="Completed"?"completed":"pending"}">${translateValue(u.status)}</span></td></tr>`; });
}
function loadTable(){ renderRows(users); }
function searchUsers(){ const val=document.getElementById("searchBox").value.toLowerCase(); const filtered=users.filter(u=>String(u.name||"").toLowerCase().includes(val)||String(u.type||"").toLowerCase().includes(val)||String(u.status||"").toLowerCase().includes(val)); renderRows(filtered); }
function filterData(type){
  let filtered = [...users];

  if(type === "today"){
    filtered = users.slice(0,2);
  } else if(type === "week"){
    filtered = users.slice(0,5);
  }

  renderRows(filtered);
  initCharts(filtered);
}
function downloadReport(){
  let csv = "User,Material,Status,Weight\n";

  users.forEach(u=>{
    csv += `${u.name},${u.type},${u.status},${u.weight}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "report.csv";
  link.click();
}
function updateInsights(){
  if(!users.length) return;

  const materialCount = {};

  users.forEach(u=>{
    materialCount[u.type] = (materialCount[u.type] || 0) + 1;
  });

  const topMaterial = Object.keys(materialCount).reduce((a,b)=>
    materialCount[a] > materialCount[b] ? a : b
  );

  document.getElementById("topMaterial").innerText = "Top Material: " + topMaterial;
  document.getElementById("requestsTrend").innerText = "Requests: " + users.length;

  const topUser = users[0]?.name || "--";
  document.getElementById("topUser").innerText = "Top User: " + topUser;
}
function renderFilteredRequests(list){
  const container = document.getElementById("requestsContainer");
  if(!container) return;

  container.innerHTML = "";

  if(!list.length){
    container.innerHTML = "<p>No requests found</p>";
    return;
  }

  list.forEach(r=>{
    container.innerHTML += `
      <div class="card">
        <h4>${r.ownerName}</h4>
        <p>Type: ${r.type}</p>
        <p>Weight: ${r.weight}kg</p>
        <p>Status: ${r.status}</p>

        <button onclick="cancelRequest('${r.id}')">Cancel</button>
      </div>
    `;
  });
}
function loadRequests(){
  const all = JSON.parse(localStorage.getItem("releaf_requests_v1")) || [];
  renderFilteredRequests(all);
}
function searchRequests(val){
  const all = JSON.parse(localStorage.getItem("releaf_requests_v1")) || [];

  const filtered = all.filter(r =>
    (r.ownerName || "").toLowerCase().includes(val.toLowerCase())
  );

  renderFilteredRequests(filtered);
}
function filterRequests(status){
  const all = JSON.parse(localStorage.getItem("releaf_requests_v1")) || [];

  if(status === "all"){
    renderFilteredRequests(all);
    return;
  }

  const filtered = all.filter(r => r.status === status);
  renderFilteredRequests(filtered);
}
function cancelRequest(id){
  let all = JSON.parse(localStorage.getItem("releaf_requests_v1")) || [];

  all = all.map(r=>{
    if(r.id === id){
      r.status = "canceled";
    }
    return r;
  });

  localStorage.setItem("releaf_requests_v1", JSON.stringify(all));

  loadRequests();
}
function updateCards(){ const c=document.querySelectorAll(".card p"); if(c.length<4)return; c[0].innerText=users.length; c[1].innerText=users.length; c[2].innerText=users.filter(u=>u.status==="Completed").length; c[3].innerText=users.filter(u=>u.status==="Pending").length; }
function openAddUserModal(){ const modal=document.getElementById("addUserModal"); modal.classList.add("show"); modal.setAttribute("aria-hidden","false"); setTimeout(()=>document.getElementById("newUserName").focus(),50); }
function closeAddUserModal(){ const modal=document.getElementById("addUserModal"); modal.classList.remove("show"); modal.setAttribute("aria-hidden","true"); document.getElementById("addUserForm").reset(); }
function submitAddUser(e){ e.preventDefault(); const name=document.getElementById("newUserName").value.trim(); const type=document.getElementById("newUserType").value; const weight=document.getElementById("newUserWeight").value; const status=document.getElementById("newUserStatus").value; if(!name||!type||!weight||!status)return; users.push({name,type,weight,status}); localStorage.setItem("users",JSON.stringify(users)); loadTable(); updateCards(); increaseNotif(); closeAddUserModal(); }
function addUser(){ openAddUserModal(); }
function increaseNotif(){ if(localStorage.getItem("notifStatus")!=="off"){ notif++; localStorage.setItem("notifCount",String(notif)); const el=document.getElementById("notifCount"); if(el) el.innerText=notif; } }
function markAsRead(){ notif=0; localStorage.setItem("notifCount","0"); const el=document.getElementById("notifCount"); if(el) el.innerText=notif; }
function toggleNotif(v){ pendingNotifStatus = v; }
function initialsFromName(name){
  const parts=String(name||"Admin").trim().split(/\s+/).filter(Boolean);
  if(!parts.length) return "A";
  return parts.slice(0,2).map(p=>p[0]).join("").toUpperCase();
}
function saveSettings(){
  const name=document.getElementById("nameInput").value.trim();
  const email=document.getElementById("emailInput").value.trim();
  const phone=document.getElementById("phoneInput").value.trim();
  const pass=document.getElementById("passInput").value.trim();

  // Save only when the admin explicitly clicks Save Changes.
  localStorage.setItem("adminName", name || "Admin");
  localStorage.setItem("adminEmail", email || "admin@releaf.com");
  localStorage.setItem("adminPhone", phone || "+962 7X XXX XXXX");

  if(pendingRemoveAdminPhoto){
    localStorage.removeItem("adminPhoto");
  } else if(pendingAdminPhoto){
    localStorage.setItem("adminPhoto", pendingAdminPhoto);
  }

  if(pass) localStorage.setItem("adminPasswordUpdated",new Date().toISOString());
  if(pendingTheme) localStorage.setItem("theme", pendingTheme);
  if(pendingLang) localStorage.setItem("lang", pendingLang);
  if(pendingNotifStatus) localStorage.setItem("notifStatus", pendingNotifStatus);

  pendingAdminPhoto=null;
  pendingRemoveAdminPhoto=false;
  pendingTheme=null;
  pendingLang=null;
  pendingNotifStatus=null;

  document.getElementById("passInput").value="";
  loadAdminProfile(true);
  loadAdmin();
  alert(t("saved"));
}
function updateWelcome(){
  const lang=currentLang();
  const storedName=(localStorage.getItem("adminName") || "").trim();
  const name=storedName || (lang === "ar" ? "\u0627\u0644\u0645\u062f\u064a\u0631" : "Admin");
  const message = lang === "ar" ? `\u0623\u0647\u0644\u0627\u064b ${name} \u{1F44B}` : `Welcome ${name} \u{1F44B}`;
  const welcome=document.getElementById("welcomeText");
  if(welcome){
    welcome.innerHTML=`<i class="fa-solid fa-user-shield"></i><span class="welcome-copy">${message}</span>`;
  }
}
function loadAdmin(){ updateWelcome(); }
function updateAvatarView(photo, name){
  const avatar=document.getElementById("adminAvatar");
  const img=document.getElementById("adminAvatarImg");
  if(!avatar) return;
  if(photo && img){
    img.src=photo;
    avatar.classList.add("has-photo");
    avatar.dataset.initials=initialsFromName(name);
  }else{
    if(img) img.removeAttribute("src");
    avatar.classList.remove("has-photo");
    avatar.innerText=initialsFromName(name);
    if(img && !avatar.contains(img)) avatar.appendChild(img);
  }
}
function chooseAdminPhoto(){
  const input=document.getElementById("adminPhotoInput");
  if(input) input.click();
}
function removeAdminPhotoDraft(){
  pendingAdminPhoto=null;
  pendingRemoveAdminPhoto=true;
  const name=document.getElementById("nameInput")?.value.trim() || localStorage.getItem("adminName") || "Admin";
  updateAvatarView(null,name);
}
function setupAdminPhotoInput(){
  const input=document.getElementById("adminPhotoInput");
  if(!input || input.dataset.bound) return;
  input.dataset.bound="1";
  input.addEventListener("change",()=>{
    const file=input.files && input.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      pendingAdminPhoto=String(reader.result || "");
      pendingRemoveAdminPhoto=false;
      const name=document.getElementById("nameInput")?.value.trim() || localStorage.getItem("adminName") || "Admin";
      updateAvatarView(pendingAdminPhoto,name);
    };
    reader.readAsDataURL(file);
  });
}
function loadAdminProfile(syncInputs=false){
  const name=localStorage.getItem("adminName") || "Admin";
  const email=localStorage.getItem("adminEmail") || "admin@releaf.com";
  const phone=localStorage.getItem("adminPhone") || "+962 7X XXX XXXX";
  const savedPhoto=localStorage.getItem("adminPhoto") || "";
  updateAvatarView(savedPhoto,name);
  setText("adminNameDisplay",name);
  setText("adminEmailDisplay",email);
  setText("adminPhoneDisplay",phone);
  setText("summaryRoleValue",t("adminRole"));
  setText("adminRoleDisplay",t("adminRole"));
  setText("adminVerifiedDisplay",t("verified"));
  setText("adminLastLoginDisplay",t("today"));
  if(syncInputs){
    const nameInput=document.getElementById("nameInput"); if(nameInput) nameInput.value=localStorage.getItem("adminName") || "";
    const emailInput=document.getElementById("emailInput"); if(emailInput) emailInput.value=localStorage.getItem("adminEmail") || "";
    const phoneInput=document.getElementById("phoneInput"); if(phoneInput) phoneInput.value=localStorage.getItem("adminPhone") || "";
    const themeSelect=document.getElementById("themeSelect"); if(themeSelect) themeSelect.value=localStorage.getItem("theme") || "light";
    const languageSelect=document.getElementById("languageSelect"); if(languageSelect) languageSelect.value=localStorage.getItem("lang") || "en";
    const notifSelect=document.getElementById("notifSelect"); if(notifSelect) notifSelect.value=localStorage.getItem("notifStatus") || "on";
  }
}
function changeTheme(){ const v=document.getElementById("themeSelect").value; pendingTheme=v; applyTheme(v,false); }
function toggleThemeQuick(){ const next=document.body.classList.contains("dark")?"light":"dark"; pendingTheme=next; applyTheme(next,false); }
function applyTheme(theme,persist=true){ if(persist) localStorage.setItem("theme",theme); document.body.classList.toggle("dark",theme==="dark"); const select=document.getElementById("themeSelect"); if(select)select.value=theme; const quick=document.getElementById("themeQuickText"); if(quick)quick.innerText=theme==="dark"?t("lightMode"):t("darkMode"); }
const translations={
 en:{welcome:"Welcome Admin 👋",dashboard:"Dashboard",users:"Users",requests:"Requests",reports:"Reports",settings:"Settings",logout:"Logout",title:"Recycling Dashboard",desc:"Manage paper, carton, users, and recycling requests efficiently.",search:"Search users...",notif:"Notifications",totalUsers:"Total Users",completed:"Completed",pending:"Pending",activityChart:"Activity Chart",chartPlaceholder:"Analytics space — ready for charts.",latestRequests:"Latest Requests",user:"User",type:"Type",weight:"Weight",status:"Status",addUser:"Add User",viewReports:"View Reports",checkRequests:"Check Requests",usersPage:"Users Page",usersPageDesc:"Manage registered customers and recycling activity.",requestsPage:"Requests Page",requestsPageDesc:"Review, approve, and track collection requests.",reportsPage:"Reports Page",reportsPageDesc:"Export and review operational reports.",settingsTitle:"Settings",account:"Account",adminName:"Admin Name",theme:"Theme",light:"Light",dark:"Dark",language:"Language",notifications:"Notifications",on:"ON",off:"OFF",save:"Save",saved:"Saved successfully",darkMode:"Dark",lightMode:"Light",noRequests:"No requests yet.",addUserTitle:"Add New User",addUserDesc:"Add user request details in a clean form instead of browser prompts.",name:"Name",namePlaceholder:"Enter user name",requestType:"Paper Type",damaged:"Damaged",clean:"Clean",carton:"Carton",weightKg:"Weight (kg)",weightPlaceholder:"e.g. 8",requestStatus:"Status",pendingStatus:"Pending",completedStatus:"Completed",cancel:"Cancel",saveUser:"Save User",adminProfile:"Admin Profile",accountInfo:"Account Information",accountInfoDesc:"Keep the admin contact details accurate for internal communication.",email:"Email",phone:"Phone",profileSummary:"Profile Summary",role:"Role",adminRole:"Administrator",verified:"Verified",joined:"Joined",lastLogin:"Last Login",today:"Today",preferences:"Preferences",security:"Security",securityDesc:"Update the password only when needed. Leave it empty to keep the current password.",password:"New Password",passwordPlaceholder:"Leave blank to keep current password",securityNote:"Changes are saved locally on this device.",adminEmailPlaceholder:"admin@releaf.com",adminPhonePlaceholder:"+962 7X XXX XXXX",saveChanges:"Save Changes",changePhoto:"Change Photo",removePhoto:"Remove"},
 ar:{welcome:"أهلاً بالمدير 👋",dashboard:"لوحة التحكم",users:"المستخدمون",requests:"الطلبات",reports:"التقارير",settings:"الإعدادات",logout:"تسجيل الخروج",title:"لوحة إعادة التدوير",desc:"إدارة الورق والكرتون والمستخدمين وطلبات إعادة التدوير بكفاءة.",search:"ابحث عن مستخدم...",notif:"الإشعارات",totalUsers:"إجمالي المستخدمين",completed:"المكتملة",pending:"قيد الانتظار",activityChart:"مخطط النشاط",chartPlaceholder:"مساحة مخصصة للتحليلات — جاهزة للمخططات.",latestRequests:"أحدث الطلبات",user:"المستخدم",type:"النوع",weight:"الوزن",status:"الحالة",addUser:"إضافة مستخدم",viewReports:"عرض التقارير",checkRequests:"تفقد الطلبات",usersPage:"صفحة المستخدمين",usersPageDesc:"إدارة العملاء المسجلين ونشاط إعادة التدوير.",requestsPage:"صفحة الطلبات",requestsPageDesc:"مراجعة طلبات الجمع والموافقة عليها وتتبعها.",reportsPage:"صفحة التقارير",reportsPageDesc:"تصدير ومراجعة التقارير التشغيلية.",settingsTitle:"الإعدادات",account:"الحساب",adminName:"اسم المدير",theme:"المظهر",light:"فاتح",dark:"داكن",language:"اللغة",notifications:"الإشعارات",on:"تشغيل",off:"إيقاف",save:"حفظ",saved:"تم الحفظ بنجاح",darkMode:"داكن",lightMode:"فاتح",noRequests:"لا توجد طلبات بعد.",addUserTitle:"إضافة مستخدم جديد",addUserDesc:"أضف تفاصيل طلب المستخدم من نموذج مرتب بدل رسائل المتصفح.",name:"الاسم",namePlaceholder:"أدخل اسم المستخدم",requestType:"نوع الورق",damaged:"تالف",clean:"نظيف",carton:"كرتون",weightKg:"الوزن (كغ)",weightPlaceholder:"مثال: 8",requestStatus:"الحالة",pendingStatus:"قيد الانتظار",completedStatus:"مكتمل",cancel:"إلغاء",saveUser:"حفظ المستخدم",adminProfile:"ملف المدير",accountInfo:"معلومات الحساب",accountInfoDesc:"حافظي على بيانات تواصل المدير دقيقة للتواصل الداخلي.",email:"البريد الإلكتروني",phone:"رقم الهاتف",profileSummary:"ملخص الملف",role:"الدور",adminRole:"مدير النظام",verified:"موثّق",joined:"تاريخ الانضمام",lastLogin:"آخر تسجيل دخول",today:"اليوم",preferences:"التفضيلات",security:"الأمان",securityDesc:"حدّثي كلمة المرور عند الحاجة فقط. اتركيها فارغة للإبقاء على كلمة المرور الحالية.",password:"كلمة مرور جديدة",passwordPlaceholder:"اتركيها فارغة للإبقاء على الحالية",securityNote:"يتم حفظ التغييرات محلياً على هذا الجهاز.",adminEmailPlaceholder:"admin@releaf.com",adminPhonePlaceholder:"+962 7X XXX XXXX",saveChanges:"حفظ التغييرات",changePhoto:"تغيير الصورة",removePhoto:"إزالة"}
};
function changeLanguage(lang){ pendingLang=lang; translate(lang,false); }
function setText(id,text){ const el=document.getElementById(id); if(el)el.innerText=text; }
function translate(lang,persist=true){ if(persist) localStorage.setItem("lang",lang); document.documentElement.lang=lang; document.documentElement.dir=lang==="ar"?"rtl":"ltr"; document.body.style.direction=lang==="ar"?"rtl":"ltr"; const ids={notifText:"notif",mainTitle:"title",mainDesc:"desc",dashText:"dashboard",usersText:"users",reqText:"requests",repText:"reports",setText:"settings",logoutText:"logout",cardUsersText:"totalUsers",cardRequestsText:"requests",cardCompletedText:"completed",cardPendingText:"pending",chartTitle:"activityChart",chartPlaceholder:"chartPlaceholder",latestRequestsTitle:"latestRequests",thUser:"user",thType:"type",thWeight:"weight",thStatus:"status",addUserBtnText:"addUser",viewReportsBtnText:"viewReports",checkRequestsBtnText:"checkRequests",usersPageTitle:"usersPage",usersPageDesc:"usersPageDesc",requestsPageTitle:"requestsPage",requestsPageDesc:"requestsPageDesc",reportsPageTitle:"reportsPage",reportsPageDesc:"reportsPageDesc",adminProfileEyebrow:"adminProfile",accountInfoTitle:"accountInfo",accountInfoDesc:"accountInfoDesc",accountLabel:"account",emailLabel:"email",phoneLabel:"phone",profileSummaryTitle:"profileSummary",summaryRoleLabel:"role",summaryPhoneLabel:"phone",summaryJoinedLabel:"joined",summaryLastLoginLabel:"lastLogin",preferencesTitle:"preferences",themeLabel:"theme",themeLightOption:"light",themeDarkOption:"dark",languageLabel:"language",notificationsLabel:"notifications",notifOnOption:"on",notifOffOption:"off",securityTitle:"security",securityDesc:"securityDesc",passwordLabel:"password",securityNote:"securityNote",saveSettingsBtn:"saveChanges",adminPhotoChooseBtn:"changePhoto",adminPhotoRemoveBtn:"removePhoto",addUserModalTitle:"addUserTitle",addUserModalDesc:"addUserDesc",newUserNameLabel:"name",newUserTypeLabel:"requestType",newUserWeightLabel:"weightKg",newUserStatusLabel:"requestStatus",typeDamagedOption:"damaged",typeCleanOption:"clean",typeCartonOption:"carton",statusPendingOption:"pendingStatus",statusCompletedOption:"completedStatus",cancelUserBtn:"cancel",saveUserBtn:"saveUser"}; Object.entries(ids).forEach(([id,key])=>setText(id,t(key))); document.getElementById("searchBox").placeholder=t("search"); document.getElementById("nameInput").placeholder=t("adminName"); const emailInput=document.getElementById("emailInput"); if(emailInput)emailInput.placeholder=t("adminEmailPlaceholder"); const phoneInput=document.getElementById("phoneInput"); if(phoneInput)phoneInput.placeholder=t("adminPhonePlaceholder"); const passInput=document.getElementById("passInput"); if(passInput)passInput.placeholder=t("passwordPlaceholder"); document.getElementById("newUserName").placeholder=t("namePlaceholder"); document.getElementById("newUserWeight").placeholder=t("weightPlaceholder"); const languageSelect=document.getElementById("languageSelect"); if(languageSelect)languageSelect.value=lang; loadAdmin(); loadAdminProfile(false); loadTable(); applyTheme(pendingTheme || localStorage.getItem("theme")||"light",false); }
window.onload=function(){
  const lang=localStorage.getItem("lang")||"en";
  const theme=localStorage.getItem("theme")||"light";
  const notifCounter=document.getElementById("notifCount"); if(notifCounter) notifCounter.innerText=notif;
  setupAdminPhotoInput();
  loadAdminProfile(true);
  translate(lang,true);
  applyTheme(theme,true);
  loadTable();
  function refreshDashboard(){
  const data = users;
  initCharts(data);
}
  updateCards();
  loadAdmin(); 
  initCharts(users);
  loadAdminProfile(false);
  refreshDashboard();
  updateInsights();
};

/* ===== FINAL ADMIN/CUSTOMER LIVE SYNC PATCH ===== */
(function(){
  const REQ_KEY='releaf_requests_v1', ADMIN_PASS_KEY='releaf_admin_passwords_v1';
  function jget(k,f){ try{ const v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?f:v; }catch(e){ return f; } }
  function jset(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function adminKey(n){ return String(n||'').trim().toLowerCase().replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,'').replace(/[إأآا]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه'); }
  function allReq(){ return (jget(REQ_KEY,[])||[]).map(r=>({...r, status:String(r.status||'sent').toLowerCase(), weight:Number(r.weight)||0})); }
  function saveReq(list){ jset(REQ_KEY,list); }
  function labelStatus(s){ const ar=currentLang()==='ar'; s=String(s||'sent').toLowerCase(); if(s==='canceled')return ar?'ملغى':'Canceled'; if(s==='completed')return ar?'مكتمل':'Completed'; if(s==='driver_en_route')return ar?'السائق بالطريق':'Driver En Route'; if(s==='assigned'||s==='handled')return ar?'تمت الموافقة':'Approved'; return ar?'بانتظار الموافقة':'Awaiting Approval'; }
  function actionLabel(a){ const ar=currentLang()==='ar'; const m={sell:[ar?'تحصيل مدفوع':'Paid collection'],donate:[ar?'تبرع':'Donate'],exchange:[ar?'استبدال':'Exchange']}; return (m[String(a||'').toLowerCase()]||[a||''])[0]; }
  function rewardLabel(v){ const ar=currentLang()==='ar'; const map={artwork:ar?'لوحة فنية من ورق معاد تدويره':'Recycled paper artwork',paper_bundle:ar?'باقة ورق نظيف':'Clean paper bundle',stationery:ar?'باقة قرطاسية صديقة للبيئة':'Eco stationery pack',storage_boxes:ar?'صناديق تخزين من كرتون معاد تدويره':'Recycled carton storage boxes'}; return map[v]||v||''; }
  function renderAdminRequests(){
    const section=document.getElementById('requests'); if(!section) return;
    let box=document.getElementById('adminLiveRequestsBox');
    if(!box){ box=document.createElement('div'); box.id='adminLiveRequestsBox'; box.className='table-box'; box.style.marginTop='24px'; section.appendChild(box); }
    const list=allReq();
    box.innerHTML=`<h3>${currentLang()==='ar'?'طلبات الجمع من المستخدمين':'Customer collection requests'}</h3><p class="muted">${currentLang()==='ar'?'راجع الطلبات وعيّن السائق وحدث الحالة.':'Review, approve, and track collection requests.'}</p>`;
    if(!list.length){ box.innerHTML+=`<p class="empty-row">${t('noRequests')}</p>`; return; }
    list.forEach(r=>{
      const card=document.createElement('div'); card.className='admin-request-card'; card.style.cssText='border:1px solid var(--border);border-radius:18px;padding:18px 20px;margin:14px 0;background:rgba(47,65,86,.08);';
      const status=labelStatus(r.status);
      const inputsDisabled=String(r.status)==='canceled'?'disabled':'';
      card.innerHTML=`
        <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;"><div><h3 style="margin:0 0 8px;">${esc(r.ownerName||r.ownerUsername||'Customer')} <small>${esc(r.id)}</small></h3><p style="margin:0 0 8px;">${currentLang()==='ar'?'تواصل':'Contact'}: ${esc(r.ownerPhone||'')} · ${esc(r.ownerEmail||'')}</p></div><span class="status pending">${esc(status)}</span></div>
        <p><strong>${currentLang()==='ar'?'تفاصيل الطلب':'Request details'}:</strong> ${esc(r.type)} · ${r.weight} kg · <strong>${currentLang()==='ar'?'الإجراء':'Action'}:</strong> ${esc(actionLabel(r.action))}</p>
        <p><strong>${currentLang()==='ar'?'موقع الجمع':'Collection point'}:</strong> ${esc(r.province||'')} ${r.district?' / '+esc(r.district):''} · GPS: ${esc(r.profileLat||'')}, ${esc(r.profileLon||'')}</p>
        <p><strong>${currentLang()==='ar'?'الشريك القريب':'Nearby recycling partner'}:</strong> ${esc(r.hubName||'')} <span class="muted">${esc(r.hubInfo||'')}</span></p>
        <p><strong>${currentLang()==='ar'?'وقت المستخدم المفضل':'Preferred time'}:</strong> ${esc(r.availableSlot||'')} · <strong>${currentLang()==='ar'?'المسؤول':'Handled by'}:</strong> ${esc(r.adminName||'Unassigned')}</p>
        ${r.exchangeChoice||r.savedExchangeGoal?`<p><strong>${currentLang()==='ar'?'الاستبدال':'Exchange'}:</strong> ${esc(rewardLabel(r.exchangeChoice||r.savedExchangeGoal))}${r.savedExchangeGoal&&!r.exchangeChoice?' — '+(currentLang()==='ar'?'هدف محفوظ حتى يكتمل الوزن':'saved goal until enough weight is reached'):''}</p>`:''}
        ${r.notes?`<p><strong>${currentLang()==='ar'?'ملاحظة المستخدم':'Customer note'}:</strong> ${esc(r.notes)}</p>`:''}
        ${r.cancelReason?`<p><strong>${currentLang()==='ar'?'سبب الإلغاء':'Cancellation reason'}:</strong> ${esc(r.cancelReason)}</p>`:''}
        <div class="admin-request-actions" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:12px 0;"><input ${inputsDisabled} id="driver_${r.id.replace('#','')}" placeholder="${currentLang()==='ar'?'اسم السائق':'Driver name'}" value="${esc(r.driverName||'')}"><input ${inputsDisabled} id="eta_${r.id.replace('#','')}" placeholder="${currentLang()==='ar'?'وقت الاستلام / ETA':'Pickup time / ETA'}" value="${esc(r.eta||'')}"></div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;"><button ${inputsDisabled} onclick="adminUpdateRequest('${r.id}','handled')">${currentLang()==='ar'?'استلام الطلب':'Handle this request'}</button><button ${inputsDisabled} onclick="adminUpdateRequest('${r.id}','assigned')">${currentLang()==='ar'?'تعيين السائق':'Assign driver'}</button><button ${inputsDisabled} onclick="adminUpdateRequest('${r.id}','driver_en_route')">${currentLang()==='ar'?'السائق بالطريق':'Driver en route'}</button><button ${inputsDisabled} onclick="adminUpdateRequest('${r.id}','completed')">${currentLang()==='ar'?'مكتمل':'Mark completed'}</button></div>`;
      box.appendChild(card);
    });
  }
  window.adminUpdateRequest=function(id,status){
    const suffix=String(id).replace('#',''); const admin=localStorage.getItem('adminName')||'Admin';
    const list=allReq().map(r=> r.id===id ? {...r,status,adminName:admin,driverName:document.getElementById('driver_'+suffix)?.value||r.driverName||'',eta:document.getElementById('eta_'+suffix)?.value||r.eta||'',adminNote:document.getElementById('note_'+suffix)?.value||r.adminNote||'',updatedAt:new Date().toISOString()} : r);
    saveReq(list); renderAdminRequests(); loadTable(); updateCards();
  };
  const oldShow=typeof showPage==='function'?showPage:null;
  window.showPage=showPage=function(id,clickedItem){ if(oldShow) oldShow(id,clickedItem); if(id==='requests') setTimeout(renderAdminRequests,20); };
  window.loadTable=function(){
    const list=allReq(); users=list.map(r=>({name:r.ownerName||r.ownerUsername||'Customer',type:r.type,weight:r.weight,status:(String(r.status)==='completed'?'Completed':String(r.status)==='canceled'?'Canceled':'Pending')}));
    renderRows(users);
  };
  window.updateCards=function(){ const c=document.querySelectorAll('.card p'); const list=allReq(); if(c.length<4)return; c[0].innerText=[...new Set(list.map(r=>r.ownerUsername||r.ownerEmail))].filter(Boolean).length; c[1].innerText=list.length; c[2].innerText=list.filter(r=>String(r.status)==='completed').length; c[3].innerText=list.filter(r=>!['completed','canceled'].includes(String(r.status))).length; };
  const oldSave=typeof saveSettings==='function'?saveSettings:null;
  window.saveSettings=saveSettings=function(){
    const pass=document.getElementById('passInput')?.value.trim()||''; const name=document.getElementById('nameInput')?.value.trim()||localStorage.getItem('adminName')||'Admin';
    if(oldSave) oldSave();
    if(pass){ const passwords=jget(ADMIN_PASS_KEY,{}); passwords[adminKey(name)]=pass; passwords[adminKey(localStorage.getItem('adminName')||name)]=pass; jset(ADMIN_PASS_KEY,passwords); localStorage.setItem('adminPasswordUpdated',new Date().toISOString()); }
  };
  window.logout=function(){ const lang=localStorage.getItem('lang'), theme=localStorage.getItem('theme'), proLang=localStorage.getItem('releaf_language_v1'), proTheme=localStorage.getItem('releaf_theme_v1'); localStorage.removeItem('adminName'); localStorage.removeItem('releaf_current_admin_v1'); if(lang)localStorage.setItem('lang',lang); if(theme)localStorage.setItem('theme',theme); if(proLang)localStorage.setItem('releaf_language_v1',proLang); if(proTheme)localStorage.setItem('releaf_theme_v1',proTheme); window.location.href='HH.html'; };
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(function(){ renderAdminRequests(); loadTable(); updateCards(); },100); });
})();

/* ===== ADMIN STATUS / SIDEBAR / CUSTOMER SYNC FINAL FIX (added only) ===== */
(function(){
  const REQ_KEY='releaf_requests_v1';
  function jget(k,f){ try{return JSON.parse(localStorage.getItem(k)||'null')??f;}catch(e){return f;} }
  function jset(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
  function cleanStatus(s){ s=String(s||'sent').toLowerCase(); return s==='handled'?'approved':s; }
  function esc2(s){ return String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function adminNameNow(){
    const saved = (localStorage.getItem('adminName') || '').trim();
    if(saved && saved.toLowerCase() !== 'admin') return saved;
    const key = (localStorage.getItem('releaf_current_admin_v1') || '').trim().toLowerCase();
    const fallbackNames = { raneem:'Raneem', raneem78:'Raneem', raneem788:'Raneem', raghad:'Raghad', mayar:'Mayar' };
    return fallbackNames[key] || saved || 'Admin';
  }
  function readAll(){ return (jget(REQ_KEY,[])||[]).map(r=>({...r,status:cleanStatus(r.status),weight:Number(r.weight)||0})); }
  function writeAll(list){ jset(REQ_KEY, list); }
  function labelStatus2(r){
    const ar=(typeof currentLang==='function'?currentLang():localStorage.getItem('lang'))==='ar';
    const s=cleanStatus(r.status);
    if(s==='canceled')return ar?'ملغى':'Canceled';
    if(s==='completed')return ar?'مكتمل':'Completed';
    if(s==='driver_en_route')return ar?'السائق بالطريق':'Driver En Route';
    if(s==='approved'||s==='assigned'||r.adminName)return ar?'تمت الموافقة':'Approved';
    return ar?'بانتظار الموافقة':'Awaiting Approval';
  }
  function statusClass2(r){ const s=cleanStatus(r.status); return s==='completed'?'completed':s==='canceled'?'pending':(s==='driver_en_route'||s==='approved'||s==='assigned'||r.adminName)?'completed':'pending'; }

  window.adminUpdateRequest = function(id,status){
    const suffix=String(id).replace('#','');
    const nextStatus = cleanStatus(status);
    const admin = adminNameNow();
    const list=readAll().map(r=>{
      if(r.id!==id) return r;
      return {
        ...r,
        status: nextStatus,
        adminName: admin,
        driverName: document.getElementById('driver_'+suffix)?.value || r.driverName || '',
        eta: document.getElementById('eta_'+suffix)?.value || r.eta || '',
        adminNote: document.getElementById('note_'+suffix)?.value || r.adminNote || '',
        updatedAt: new Date().toISOString()
      };
    });
    writeAll(list);
    if(typeof renderAdminRequests==='function') renderAdminRequests();
    if(typeof loadTable==='function') loadTable();
    if(typeof updateCards==='function') updateCards();
  };

  window.loadTable=function(){
    const list=readAll();
    users=list.map(r=>({name:r.ownerName||r.ownerUsername||'Customer',type:r.type,weight:r.weight,status:labelStatus2(r),_statusClass:statusClass2(r)}));
    const table=document.querySelector('tbody');
    if(!table) return;
    table.innerHTML='';
    if(!users.length){ table.innerHTML=`<tr><td colspan="4" class="empty-row">${typeof t==='function'?t('noRequests'):'No requests yet.'}</td></tr>`; return; }
    users.forEach(u=>{ table.innerHTML+=`<tr><td>${esc2(u.name)}</td><td>${typeof translateValue==='function'?translateValue(u.type):esc2(u.type)}</td><td>${esc2(u.weight)}kg</td><td><span class="status ${u._statusClass}">${esc2(u.status)}</span></td></tr>`; });
  };

  window.updateCards=function(){
    const c=document.querySelectorAll('.card p'); const list=readAll(); if(c.length<4)return;
    c[0].innerText=[...new Set(list.map(r=>r.ownerUsername||r.ownerEmail))].filter(Boolean).length;
    c[1].innerText=list.length;
    c[2].innerText=list.filter(r=>cleanStatus(r.status)==='completed').length;
    c[3].innerText=list.filter(r=>!['completed','canceled'].includes(cleanStatus(r.status))).length;
  };

  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ if(typeof loadTable==='function')loadTable(); if(typeof updateCards==='function')updateCards(); },200); });
})();

/* ===== FINAL REAL ADMIN DATA PAGES + HANDLE NAME FIX (added only) ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function getJson(k, fallback){ try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function setJson(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
  function langNow(){ return (typeof currentLang === 'function' ? currentLang() : (localStorage.getItem('lang') || 'en')) === 'ar' ? 'ar' : 'en'; }
  function tx(en, ar){ return langNow() === 'ar' ? ar : en; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>\"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  function currentAdminName(){
    const n = String(localStorage.getItem('adminName') || '').trim();
    if(n) return n;
    const k = String(localStorage.getItem('releaf_current_admin_v1') || '').trim();
    return k || 'Admin';
  }
  function normalizeStatus(s){
    s = String(s || 'sent').toLowerCase();
    if(s === 'handled') return 'approved';
    return s;
  }
  function allRequests(){
    return (getJson(REQ_KEY, []) || []).map(r => ({...r, status: normalizeStatus(r.status), weight: Number(r.weight) || 0}));
  }
  function saveRequests(list){ setJson(REQ_KEY, list); }
  function statusLabel(r){
    const s = normalizeStatus(r.status);
    if(s === 'canceled') return tx('Canceled','ملغى');
    if(s === 'completed') return tx('Completed','مكتمل');
    if(s === 'driver_en_route') return tx('Driver En Route','السائق بالطريق');
    if(s === 'approved' || s === 'assigned' || r.adminName || r.driverName) return tx('Approved','تمت الموافقة');
    return tx('Awaiting Approval','بانتظار الموافقة');
  }
  function statusClass(r){
    const s = normalizeStatus(r.status);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'pending';
    if(s === 'approved' || s === 'assigned' || s === 'driver_en_route' || r.adminName || r.driverName) return 'completed';
    return 'pending';
  }
  function actionLabel(a){
    a = String(a || '').toLowerCase();
    if(a === 'sell') return tx('Paid collection','تحصيل مدفوع');
    if(a === 'donate') return tx('Donate','تبرع');
    if(a === 'exchange') return tx('Exchange','استبدال');
    return a;
  }
  function rewardLabel(v){
    const ar = langNow() === 'ar';
    const map = {
      artwork: ar ? 'لوحة فنية من ورق معاد تدويره' : 'Recycled paper artwork',
      paper_bundle: ar ? 'باقة ورق نظيف' : 'Clean paper bundle',
      stationery: ar ? 'باقة قرطاسية صديقة للبيئة' : 'Eco stationery pack',
      storage_boxes: ar ? 'صناديق تخزين من كرتون معاد تدويره' : 'Recycled carton storage boxes'
    };
    return map[v] || v || '';
  }
  function shortRequest(r){
    return `<strong>${tx('Request details','تفاصيل الطلب')}:</strong> ${esc(r.type)} · ${esc(r.weight)} kg · <strong>${tx('Action','الإجراء')}:</strong> ${esc(actionLabel(r.action))}`;
  }
  function renderLatestTable(){
    const table = document.querySelector('tbody');
    if(!table) return;
    const list = allRequests();
    table.innerHTML = '';
    if(!list.length){ table.innerHTML = `<tr><td colspan="4" class="empty-row">${tx('No requests yet.','لا توجد طلبات بعد.')}</td></tr>`; return; }
    list.forEach(r => {
      table.innerHTML += `<tr><td>${esc(r.ownerName || r.ownerUsername || 'Customer')}</td><td>${esc(r.type || '')}</td><td>${esc(r.weight)}kg</td><td><span class="status ${statusClass(r)}">${esc(statusLabel(r))}</span></td></tr>`;
    });
  }
  function updateDashboardCards(){
    const c = document.querySelectorAll('.card p');
    const list = allRequests();
    if(c.length < 4) return;
    c[0].innerText = [...new Set(list.map(r => r.ownerUsername || r.ownerEmail).filter(Boolean))].length;
    c[1].innerText = list.length;
    c[2].innerText = list.filter(r => normalizeStatus(r.status) === 'completed').length;
    c[3].innerText = list.filter(r => !['completed','canceled'].includes(normalizeStatus(r.status))).length;
  }
  function renderRequestCards(target){
    if(!target) return;
    target.innerHTML = "";
    target.style.display = "none";
  }
  function renderAdminRequestsPage(){
    const section = document.getElementById('requests');
    if(!section) return;
    let box = document.getElementById('adminLiveRequestsBox');
    if(!box){ box = document.createElement('div'); box.id = 'adminLiveRequestsBox'; box.className = 'table-box'; box.style.marginTop = '24px'; section.appendChild(box); }
    renderRequestCards(box);
  }
  
  function renderAdminUsersPage(){
    const section = document.getElementById('users'); if(!section) return;
    let box = document.getElementById('adminUsersBox');
    if(!box){ box = document.createElement('div'); box.id = 'adminUsersBox'; box.className = 'table-box'; box.style.marginTop = '24px'; section.appendChild(box); }
    const list = allRequests();
    const byUser = new Map();
    list.forEach(r => {
      const key = r.ownerUsername || r.ownerEmail || r.ownerName || 'Customer';
      if(!byUser.has(key)) byUser.set(key, {name:r.ownerName || key, email:r.ownerEmail || '', phone:r.ownerPhone || '', total:0, active:0, completed:0, weight:0});
      const u = byUser.get(key); u.total++; u.weight += Number(r.weight) || 0; const s=normalizeStatus(r.status); if(s==='completed') u.completed++; if(!['completed','canceled'].includes(s)) u.active++;
    });
    box.innerHTML = `<h3>${tx('Registered users from requests','المستخدمون حسب الطلبات')}</h3>`;
    if(!byUser.size){ box.innerHTML += `<p class="empty-row">${tx('No users yet.','لا يوجد مستخدمون بعد.')}</p>`; return; }
    box.innerHTML += `<table><thead><tr><th>${tx('User','المستخدم')}</th><th>${tx('Contact','التواصل')}</th><th>${tx('Requests','الطلبات')}</th><th>${tx('Active','النشطة')}</th><th>${tx('Completed','المكتملة')}</th><th>${tx('Total weight','الوزن الكلي')}</th></tr></thead><tbody>${Array.from(byUser.values()).map(u => `<tr><td>${esc(u.name)}</td><td>${esc(u.phone)}<br><small>${esc(u.email)}</small></td><td>${u.total}</td><td>${u.active}</td><td>${u.completed}</td><td>${u.weight}kg</td></tr>`).join('')}</tbody></table>`;
  }
  function renderAdminReportsPage(){
    const section = document.getElementById('reports'); if(!section) return;
    let box = document.getElementById('adminReportsBox');
    if(!box){ box = document.createElement('div'); box.id = 'adminReportsBox'; box.className = 'table-box'; box.style.marginTop = '24px'; section.appendChild(box); }
    const list = allRequests();
    const totalWeight = list.filter(r => normalizeStatus(r.status) !== 'canceled').reduce((s,r)=>s+(Number(r.weight)||0),0);
    const active = list.filter(r => !['completed','canceled'].includes(normalizeStatus(r.status))).length;
    const canceled = list.filter(r => normalizeStatus(r.status) === 'canceled').length;
    const completed = list.filter(r => normalizeStatus(r.status) === 'completed').length;
    box.innerHTML = `<h3>${tx('Operational report','التقرير التشغيلي')}</h3><div class="dashboard-cards"><div class="card"><h4>${tx('Total requests','إجمالي الطلبات')}</h4><p>${list.length}</p></div><div class="card"><h4>${tx('Active requests','الطلبات النشطة')}</h4><p>${active}</p></div><div class="card"><h4>${tx('Completed','المكتملة')}</h4><p>${completed}</p></div><div class="card"><h4>${tx('Total weight','الوزن الكلي')}</h4><p>${totalWeight}kg</p></div></div><p class="muted" style="margin-top:18px;">${tx('Canceled requests','الطلبات الملغاة')}: ${canceled}</p>`;
  }
  window.adminUpdateRequest = function(id, status){
    const suffix = String(id || '').replace('#','');
    const nextStatus = normalizeStatus(status);
    const admin = currentAdminName();
    const list = allRequests().map(r => {
      if(String(r.id) !== String(id)) return r;
      return {...r, status: nextStatus, adminName: admin, driverName: document.getElementById('driver_' + suffix)?.value || r.driverName || '', eta: document.getElementById('eta_' + suffix)?.value || r.eta || '', adminNote: document.getElementById('note_' + suffix)?.value || r.adminNote || '', updatedAt: new Date().toISOString()};
    });
    saveRequests(list);
    renderAdminRequestsPage(); renderAdminUsersPage(); renderAdminReportsPage(); renderLatestTable(); updateDashboardCards();
  };
  const prevShow = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof prevShow === 'function') prevShow(id, clickedItem);
    setTimeout(function(){ renderAdminRequestsPage(); renderAdminUsersPage(); renderAdminReportsPage(); renderLatestTable(); updateDashboardCards(); }, 20);
  };
  window.loadTable = renderLatestTable;
  window.updateCards = updateDashboardCards;
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ renderAdminRequestsPage(); renderAdminUsersPage(); renderAdminReportsPage(); renderLatestTable(); updateDashboardCards(); }, 120); });
})();
// ===== CHARTS =====
let requestsChart, materialsChart, statusChart;

function initCharts(data){
  const ctx1 = document.getElementById("requestsChart");
  const ctx2 = document.getElementById("materialsChart");
  const ctx3 = document.getElementById("statusChart");

  if(!ctx1 || !ctx2 || !ctx3) return;

  // Destroy old charts (important)
  if(requestsChart) requestsChart.destroy();
  if(materialsChart) materialsChart.destroy();
  if(statusChart) statusChart.destroy();

  // Chart 1: Requests over time (fake grouping)
  const dates = data.map((_,i)=>"Day "+(i+1));

  requestsChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Requests",
        data: data.map((_,i)=>i+1)
      }]
    }
  });

  // Chart 2: Materials
  const paper = data.filter(d=>d.type==="Paper").length;
  const plastic = data.filter(d=>d.type==="Plastic").length;
  const carton = data.filter(d=>d.type==="Carton").length;

  materialsChart = new Chart(ctx2, {
    type: "pie",
    data: {
      labels: ["Paper","Plastic","Carton"],
      datasets: [{
        data: [paper, plastic, carton]
      }]
    }
  });

  // Chart 3: Status
  const completed = data.filter(d=>d.status==="Completed").length;
  const pending = data.filter(d=>d.status==="Pending").length;

  statusChart = new Chart(ctx3, {
    type: "doughnut",
    data: {
      labels: ["Completed","Pending"],
      datasets: [{
        data: [completed, pending]
      }]
    }
  });
}
/* ===== FINAL CLEAN ADMIN/UI + USER REQUEST SYNC (ChatGPT patch) ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const USERS_KEY = 'users';
  let reqSearchValue = '';
  let reqFilterValue = 'all';
  let chartRefs = {};

  function safeJson(key, fallback){
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; }
    catch(e){ return fallback; }
  }
  function saveJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function lang(){ return (typeof currentLang === 'function' ? currentLang() : (localStorage.getItem('lang') || 'en')) === 'ar' ? 'ar' : 'en'; }
  function tx(en, ar){ return lang() === 'ar' ? ar : en; }
  function normStatus(status){
    const s = String(status || 'sent').toLowerCase();
    if(s === 'pending') return 'sent';
    if(s === 'handled' || s === 'assigned') return 'approved';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function statusLabel(status){
    const s = normStatus(status);
    if(s === 'completed') return tx('Completed','مكتمل');
    if(s === 'canceled') return tx('Canceled','ملغى');
    if(s === 'driver_en_route') return tx('Driver En Route','السائق بالطريق');
    if(s === 'approved') return tx('Approved','تمت الموافقة');
    return tx('Awaiting Approval','بانتظار الموافقة');
  }
  function statusClass(status){
    const s = normStatus(status);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'canceled';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    return 'pending';
  }
  function readRequests(){
    return (safeJson(REQ_KEY, []) || []).map((r, index) => ({
      ...r,
      id: r.id || ('REQ-' + (index + 1)),
      status: normStatus(r.status),
      weight: Number(r.weight) || 0,
      type: r.type || r.paperType || r.material || 'Paper',
      ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
      ownerUsername: r.ownerUsername || r.username || '',
      ownerEmail: r.ownerEmail || r.email || '',
      ownerPhone: r.ownerPhone || r.phone || '',
      createdAt: r.createdAt || r.date || r.requestedAt || '',
      action: r.action || '',
      province: r.province || r.profileProvince || '',
      district: r.district || '',
      notes: r.notes || r.note || ''
    }));
  }
  function writeRequests(list){ saveJson(REQ_KEY, list.map(r => ({...r, status: normStatus(r.status)}))); }
  function filteredRequests(){
    const q = reqSearchValue.trim().toLowerCase();
    return readRequests().filter(r => {
      const statusOk = reqFilterValue === 'all' || normStatus(r.status) === reqFilterValue;
      const userName = String(r.ownerName || r.ownerUsername || '').toLowerCase().trim();
      const userWords = userName.split(/\\s+/).filter(Boolean);
      return statusOk && (!q || userWords.includes(q));
    });
  }
  function fmtDate(value){
    if(!value) return '--';
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return esc(value);
    return d.toLocaleDateString(lang() === 'ar' ? 'ar-JO' : 'en-GB', {year:'numeric', month:'short', day:'numeric'});
  }
  function requestRow(r){
    return `<tr><td>${esc(r.ownerName)}</td><td>${esc(r.type)}</td><td>${Number(r.weight).toFixed(1)}kg</td><td><span class="status ${statusClass(r.status)}">${statusLabel(r.status)}</span></td></tr>`;
  }
  window.renderRows = function(list){
    const table = document.querySelector('#dashboard tbody');
    if(!table) return;
    const data = Array.isArray(list) ? list : readRequests();
    table.innerHTML = data.length ? data.map(requestRow).join('') : `<tr><td colspan="4" class="empty-row">${tx('No requests yet','لا توجد طلبات بعد')}</td></tr>`;
  };
  window.loadTable = function(){ window.renderRows(readRequests().slice().reverse().slice(0, 8)); };
  window.searchUsers = function(){
    const val = (document.getElementById('searchBox')?.value || '').toLowerCase();
    window.renderRows(readRequests().filter(r => [r.ownerName,r.type,r.status,r.ownerEmail].join(' ').toLowerCase().includes(val)));
  };
  window.filterData = function(type){
    const now = Date.now();
    let data = readRequests();
    if(type === 'today') data = data.filter(r => r.createdAt && new Date(r.createdAt).toDateString() === new Date().toDateString());
    if(type === 'week') data = data.filter(r => r.createdAt && now - new Date(r.createdAt).getTime() <= 7*24*60*60*1000);
    if(type === 'month') data = data.filter(r => r.createdAt && now - new Date(r.createdAt).getTime() <= 31*24*60*60*1000);
    window.renderRows(data);
    window.initCharts(data);
  };
  window.renderRegisteredUsers = function(value){
    const body = document.getElementById('registeredUsersBody');
    if(!body) return;
    const q = String(value || '').toLowerCase();
    const list = (safeJson(USERS_KEY, []) || []).filter(u => [u.firstName,u.lastName,u.username,u.email,u.phone].join(' ').toLowerCase().includes(q));
    body.innerHTML = list.length ? list.map(u => {
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || 'Customer';
      return `<tr><td>${esc(full)}</td><td>${esc(u.username || '--')}</td><td>${esc(u.email || '--')}</td><td>${esc(u.phone || '--')}</td></tr>`;
    }).join('') : `<tr><td colspan="4" class="empty-row">${tx('No registered users found','لا يوجد مستخدمون مسجلون')}</td></tr>`;
  };
  function renderRequestsCards(list){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    if(!list.length){ container.innerHTML = `<div class="admin-empty-state">${tx('No requests found','لا توجد طلبات مطابقة')}</div>`; return; }
    container.innerHTML = list.map(r => {
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      return `<article class="admin-request-card">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${statusClass(r.status)}">${statusLabel(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>${tx('Material','المادة')}</strong>${esc(r.type)}</span>
          <span><strong>${tx('Weight','الوزن')}</strong>${Number(r.weight).toFixed(1)}kg</span>
          <span><strong>${tx('Action','الإجراء')}</strong>${esc(r.action || '--')}</span>
          <span><strong>${tx('Location','الموقع')}</strong>${esc(loc)}</span>
          <span><strong>${tx('Date','التاريخ')}</strong>${esc(r.requestDate || r.collectionDate || '')}</span>
          <span><strong>${tx('Time','الوقت')}</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>${tx('Notes','ملاحظات')}:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-fields">
          <input id="driver_${esc(r.id)}" value="${esc(r.driverName || '')}" placeholder="${tx('Driver name / phone','اسم/رقم السائق')}">
          <input id="eta_${esc(r.id)}" value="${esc(r.eta || '')}" placeholder="${tx('ETA','وقت الوصول')}">
          
        </div>
        <div class="request-actions">
          <button onclick="setRequestStatus('${esc(r.id)}','approved')">${tx('Approve','موافقة')}</button>
          <button onclick="setRequestStatus('${esc(r.id)}','driver_en_route')">${tx('Driver En Route','السائق بالطريق')}</button>
          <button onclick="setRequestStatus('${esc(r.id)}','completed')">${tx('Complete','إكمال')}</button>
          <button class="danger" onclick="setRequestStatus('${esc(r.id)}','canceled')">${tx('Cancel','إلغاء')}</button>
        </div>
      </article>`;
    }).join('');
  }
  window.loadRequests = function(){ renderRequestsCards(filteredRequests()); renderReports(); updateCards(); };
  window.searchRequests = function(value){ reqSearchValue = String(value || ''); window.loadRequests(); };
  window.filterRequests = function(status){ reqFilterValue = status || 'all'; window.loadRequests(); };
  window.cancelRequest = function(id){ window.setRequestStatus(id, 'canceled'); };
  window.setRequestStatus = function(id, status){
    const admin = (localStorage.getItem('adminName') || 'Admin').trim();
    const next = readRequests().map(r => {
      if(String(r.id) !== String(id)) return r;
      const suffix = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
      return {
        ...r,
        status: normStatus(status),
        adminName: admin,
        driverName: document.getElementById('driver_' + suffix)?.value || document.getElementById('driver_' + id)?.value || r.driverName || '',
        eta: document.getElementById('eta_' + suffix)?.value || document.getElementById('eta_' + id)?.value || r.eta || '',
        adminNote: document.getElementById('note_' + suffix)?.value || document.getElementById('note_' + id)?.value || r.adminNote || '',
        updatedAt: new Date().toISOString()
      };
    });
    writeRequests(next);
    window.loadRequests();
    window.loadTable();
  };
  window.updateCards = function(){
    const c = document.querySelectorAll('#dashboard .dashboard-cards .card p');
    if(c.length < 4) return;
    const reqs = readRequests();
    c[0].innerText = new Set(reqs.map(r => r.ownerUsername || r.ownerEmail || r.ownerName).filter(Boolean)).size;
    c[1].innerText = reqs.length;
    c[2].innerText = reqs.filter(r => normStatus(r.status) === 'completed').length;
    c[3].innerText = reqs.filter(r => !['completed','canceled'].includes(normStatus(r.status))).length;
  };
  window.downloadReport = function(){
    const rows = readRequests();
    const headers = ['Request ID','User','Username','Email','Phone','Material','Action','Status','Weight kg','Province','District','Preferred Date','Preferred Time','Driver','ETA','Admin Note','Created At','Updated At'];
    const csvRows = [headers].concat(rows.map(r => [r.id,r.ownerName,r.ownerUsername,r.ownerEmail,r.ownerPhone,r.type,r.action,statusLabel(r.status),r.weight,r.province,r.district,r.requestDate || r.collectionDate || '',r.availableSlot || '',r.driverName || '',r.eta || '',r.adminNote || '',r.createdAt || '',r.updatedAt || '']));
    const csv = csvRows.map(row => row.map(cell => '"' + String(cell == null ? '' : cell).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'releaf-admin-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  function renderReports(){
    const rows = readRequests();
    const body = document.getElementById('reportsTableBody');
    if(body){
      body.innerHTML = rows.length ? rows.map(r => `<tr><td>${esc(r.ownerName)}</td><td>${esc(r.type)}</td><td>${esc(r.action || '--')}</td><td><span class="status ${statusClass(r.status)}">${statusLabel(r.status)}</span></td><td>${Number(r.weight).toFixed(1)}kg</td><td>${esc(r.requestDate || r.collectionDate || '')}</td><td>${esc(r.availableSlot || '--')}</td><td>${fmtDate(r.createdAt)}</td></tr>`).join('') : `<tr><td colspan="8" class="empty-row">${tx('No report data yet','لا توجد بيانات تقرير بعد')}</td></tr>`;
    }
    const counts = {};
    rows.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    const topMaterial = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0] || '--';
    const totalWeight = rows.reduce((sum, r) => sum + Number(r.weight || 0), 0);
    const topUser = rows[0]?.ownerName || '--';
    const set = (id, text) => { const el = document.getElementById(id); if(el) el.innerText = text; };
    set('topMaterial', `${tx('Top Material','أكثر مادة')}: ${topMaterial}`);
    set('requestsTrend', `${tx('Requests','الطلبات')}: ${rows.length}`);
    set('topUser', `${tx('Top User','أبرز مستخدم')}: ${topUser}`);
    set('totalWeightReport', `${tx('Total Weight','إجمالي الوزن')}: ${totalWeight.toFixed(1)}kg`);
  }
  window.updateInsights = renderReports;
  window.initCharts = function(data){
    if(!window.Chart) return;
    const rows = Array.isArray(data) ? data : readRequests();
    const make = (id, cfg) => {
      const canvas = document.getElementById(id);
      if(!canvas) return;
      if(chartRefs[id]) chartRefs[id].destroy();
      chartRefs[id] = new Chart(canvas, cfg);
    };
    const byType = {}, byStatus = {};
    rows.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; byStatus[statusLabel(r.status)] = (byStatus[statusLabel(r.status)] || 0) + 1; });
    make('requestsChart', {type:'line', data:{labels:rows.map((r,i)=>r.id || i+1), datasets:[{label:tx('Weight kg','الوزن كغ'), data:rows.map(r=>Number(r.weight)||0), tension:.35}]}, options:{responsive:true, plugins:{legend:{display:false}}}});
    make('materialsChart', {type:'doughnut', data:{labels:Object.keys(byType), datasets:[{data:Object.values(byType)}]}, options:{responsive:true}});
    make('statusChart', {type:'bar', data:{labels:Object.keys(byStatus), datasets:[{data:Object.values(byStatus)}]}, options:{responsive:true, plugins:{legend:{display:false}}}});
  };
  const oldShow = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof oldShow === 'function') oldShow(id, clickedItem);
    if(id === 'requests') window.loadRequests();
    if(id === 'reports') renderReports();
    if(id === 'users') window.renderRegisteredUsers('');
  };
  function boot(){
    window.renderRegisteredUsers('');
    window.loadTable();
    window.loadRequests();
    renderReports();
    window.updateCards();
    window.initCharts(readRequests());
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 160));
  window.addEventListener('storage', boot);
})();

/* =========================================================
   PROFESSIONAL CHART OPTIONS — added only
   ========================================================= */
(function(){
  function safeJson(key, fallback){ try{ const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; }catch(e){ return fallback; } }
  function isArabic(){ return ((typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) || 'en') === 'ar'; }
  function tx(en, ar){ return isArabic() ? ar : en; }
  function statusKey(s){
    s = String(s || 'sent').toLowerCase();
    if(s === 'pending') return 'sent';
    if(s === 'handled' || s === 'assigned') return 'approved';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function statusLabel(s){
    const ar = isArabic();
    const map = {
      sent: ar ? 'بانتظار الموافقة' : 'Awaiting',
      approved: ar ? 'تمت الموافقة' : 'Approved',
      driver_en_route: ar ? 'السائق بالطريق' : 'On Route',
      completed: ar ? 'مكتمل' : 'Completed',
      canceled: ar ? 'ملغى' : 'Canceled'
    };
    return map[statusKey(s)] || String(s || '');
  }
  function readRequests(){
    return (safeJson('releaf_requests_v1', []) || []).map(function(r,i){
      return Object.assign({}, r, { _index:i + 1, weight:Number(r.weight) || 0, status:statusKey(r.status) });
    });
  }
  function materialLabel(v){
    const key = String(v || tx('Unknown','غير محدد')).toLowerCase();
    if(key === 'damaged') return tx('Damaged','تالف');
    if(key === 'clean') return tx('Clean','نظيف');
    if(key === 'carton') return tx('Carton','كرتون');
    if(key === 'paper') return tx('Paper','ورق');
    if(key === 'plastic') return tx('Plastic','بلاستيك');
    return v || tx('Unknown','غير محدد');
  }
  function shortDate(r, i){
    const raw = r.createdAt || r.requestDate || r.collectionDate || '';
    const d = raw ? new Date(raw) : null;
    if(d && !isNaN(d.getTime())) return (d.getMonth()+1) + '/' + d.getDate();
    return '#' + (i + 1);
  }
  const refs = {};
  function destroy(id){ if(refs[id]){ refs[id].destroy(); refs[id] = null; } }
  function cssVar(name, fallback){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback; }
  function make(id, cfg){ const c = document.getElementById(id); if(!c || !window.Chart) return; destroy(id); refs[id] = new Chart(c, cfg); }
  function options(extra){
    const grid = 'rgba(47,65,86,.10)';
    const text = cssVar('--pro-sub','#78889a');
    return Object.assign({
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:650,easing:'easeOutQuart'},
      plugins:{
        legend:{labels:{usePointStyle:true,pointStyle:'circle',boxWidth:8,boxHeight:8,padding:16,color:text,font:{family:'Segoe UI',size:12,weight:'700'}}},
        tooltip:{backgroundColor:'rgba(37,54,74,.94)',titleColor:'#fff',bodyColor:'#fff',padding:12,cornerRadius:12,displayColors:true,titleFont:{weight:'800'},bodyFont:{weight:'700'}}
      },
      scales:{
        x:{grid:{display:false},ticks:{color:text,font:{family:'Segoe UI',weight:'700'}}},
        y:{beginAtZero:true,grid:{color:grid,drawBorder:false},ticks:{precision:0,color:text,font:{family:'Segoe UI',weight:'700'}}}
      }
    }, extra || {});
  }
  window.initCharts = function(data){
    if(!window.Chart) return;
    const rows = (Array.isArray(data) && data.length ? data : readRequests()).map(function(r,i){ return Object.assign({}, r, { _index:i+1, weight:Number(r.weight)||0, status:statusKey(r.status) }); });
    const labels = rows.map(shortDate);
    const primary = cssVar('--pro-primary','#567c8d');
    const ink = cssVar('--pro-primary-2','#2f4156');
    const colors = [primary,'#8fb3c2','#d99a2b','#3c9a66','#c95858','#9fb8c7'];
    const byMaterial = {}, byStatus = {};
    rows.forEach(function(r){
      const m = materialLabel(r.type);
      byMaterial[m] = (byMaterial[m] || 0) + 1;
      const s = statusLabel(r.status);
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    make('requestsChart', {
      type:'line',
      data:{ labels:labels, datasets:[{ label:tx('Weight kg','الوزن كغ'), data:rows.map(r=>r.weight), borderColor:primary, backgroundColor:'rgba(86,124,141,.14)', fill:true, tension:.38, borderWidth:3, pointRadius:3.5, pointHoverRadius:6, pointBackgroundColor:'#fff', pointBorderColor:primary, pointBorderWidth:2 }]},
      options:options({ plugins:{legend:{display:false},tooltip:options().plugins.tooltip}, scales:{ x:{grid:{display:false},ticks:{maxRotation:0,minRotation:0,color:cssVar('--pro-sub','#78889a'),font:{family:'Segoe UI',weight:'800'}}}, y:{beginAtZero:true,grid:{color:'rgba(47,65,86,.10)',drawBorder:false},ticks:{precision:0,color:cssVar('--pro-sub','#78889a'),font:{family:'Segoe UI',weight:'800'}}} } })
    });
    make('materialsChart', {
      type:'doughnut',
      data:{ labels:Object.keys(byMaterial), datasets:[{ data:Object.values(byMaterial), backgroundColor:colors, borderColor:'#fff', borderWidth:4, hoverOffset:8 }]},
      options:options({cutout:'70%',scales:{},plugins:{legend:{position:'bottom',labels:{usePointStyle:true,pointStyle:'circle',boxWidth:8,padding:16,color:cssVar('--pro-sub','#78889a'),font:{family:'Segoe UI',size:12,weight:'800'}}},tooltip:options().plugins.tooltip}})
    });
    make('statusChart', {
      type:'bar',
      data:{ labels:Object.keys(byStatus), datasets:[{ label:tx('Requests','الطلبات'), data:Object.values(byStatus), backgroundColor:'rgba(86,124,141,.72)', borderColor:ink, borderWidth:1, borderRadius:12, maxBarThickness:44 }]},
      options:options({plugins:{legend:{display:false},tooltip:options().plugins.tooltip},scales:{x:{grid:{display:false},ticks:{maxRotation:20,minRotation:0,color:cssVar('--pro-sub','#78889a'),font:{family:'Segoe UI',weight:'800'}}},y:{beginAtZero:true,grid:{color:'rgba(47,65,86,.10)',drawBorder:false},ticks:{precision:0,color:cssVar('--pro-sub','#78889a'),font:{family:'Segoe UI',weight:'800'}}}}})
    });
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ window.initCharts(readRequests()); }, 180); });
})();


/* =========================================================
   FINAL FIX: Dashboard date filter + remove notification safety
   ========================================================= */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function readJson(key, fallback){
    try{
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    }catch(e){
      return fallback;
    }
  }
  function requestDate(row){
    const raw = row.createdAt || row.updatedAt || row.requestDate || row.collectionDate || row.date || '';
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) ? d : null;
  }
  function startOfDay(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function dashboardRowsByFilter(type){
    const rows = (readJson(REQ_KEY, []) || []).map(function(r){
      return Object.assign({}, r, { weight:Number(r.weight) || 0 });
    });
    if(!rows.length) return [];

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let from = null, to = tomorrowStart;
    if(type === 'today') from = todayStart;
    else if(type === 'week') from = weekStart;
    else if(type === 'month') from = monthStart;
    else return rows;

    const filtered = rows.filter(function(r){
      const d = requestDate(r);
      return d && d >= from && d < to;
    });

    // If older saved demo data has no usable dates, keep the dashboard alive instead of freezing.
    return filtered.length ? filtered : rows;
  }
  function rowStatus(r){
    const s = String(r.status || 'sent').toLowerCase();
    if(s === 'completed') return 'Completed';
    if(s === 'canceled' || s === 'cancelled') return 'Canceled';
    if(s === 'driver_en_route') return 'Driver En Route';
    if(s === 'approved' || s === 'assigned' || s === 'handled') return 'Approved';
    return 'Awaiting Approval';
  }
  function renderDashboardTable(rows){
    const table = document.querySelector('#dashboard tbody');
    if(!table) return;
    const lang = typeof currentLang === 'function' ? currentLang() : (localStorage.getItem('lang') || 'en');
    const empty = lang === 'ar' ? 'لا توجد طلبات لهذه الفترة' : 'No requests for this period';
    if(!rows.length){
      table.innerHTML = `<tr><td colspan="4" class="empty-row">${empty}</td></tr>`;
      return;
    }
    table.innerHTML = rows.map(function(r){
      const status = rowStatus(r);
      const cls = status === 'Completed' || status === 'Approved' || status === 'Driver En Route' ? 'completed' : 'pending';
      const name = r.ownerName || r.ownerUsername || r.name || 'Customer';
      const type = r.type || 'Material';
      const weight = Number(r.weight || 0).toFixed(1).replace(/\.0$/, '');
      return `<tr><td>${name}</td><td>${type}</td><td>${weight}kg</td><td><span class="status ${cls}">${status}</span></td></tr>`;
    }).join('');
  }
  window.filterData = function(type){
    const filterSelect = document.getElementById('filterSelect');
    const selected = type || (filterSelect ? filterSelect.value : 'today');
    if(filterSelect) filterSelect.value = selected;
    const rows = dashboardRowsByFilter(selected);
    window.users = rows.map(function(r){
      return {name:r.ownerName || r.ownerUsername || r.name || 'Customer', type:r.type || 'Material', weight:Number(r.weight)||0, status:rowStatus(r)};
    });
    renderDashboardTable(rows);
    if(typeof window.initCharts === 'function') window.initCharts(rows);
    if(typeof window.updateCards === 'function') window.updateCards();
  };
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      const filterSelect = document.getElementById('filterSelect');
      if(filterSelect){
        filterSelect.addEventListener('change', function(){ window.filterData(this.value); });
        window.filterData(filterSelect.value || 'today');
      }
    }, 260);
  });
})();

/* =========================================================
   REAL FINAL FIX: working dashboard filter + chart refresh
   - Today / This Week / This Month now produce different views
   - Works even when localStorage demo requests have missing/old dates
   ========================================================= */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const chartRefs = window.__releafFinalChartRefs || (window.__releafFinalChartRefs = {});

  function readJson(key, fallback){
    try{
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    }catch(e){ return fallback; }
  }
  function normalizeStatus(s){
    s = String(s || 'sent').toLowerCase();
    if(s === 'pending') return 'sent';
    if(s === 'handled' || s === 'assigned') return 'approved';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function statusLabel(s){
    const ar = (typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) === 'ar';
    const map = {
      sent: ar ? 'بانتظار الموافقة' : 'Awaiting',
      approved: ar ? 'تمت الموافقة' : 'Approved',
      driver_en_route: ar ? 'السائق بالطريق' : 'On Route',
      completed: ar ? 'مكتمل' : 'Completed',
      canceled: ar ? 'ملغى' : 'Canceled'
    };
    return map[normalizeStatus(s)] || String(s || '');
  }
  function materialLabel(v){
    const ar = (typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) === 'ar';
    const key = String(v || '').toLowerCase();
    const map = {
      damaged: ar ? 'تالف' : 'Damaged',
      clean: ar ? 'نظيف' : 'Clean',
      carton: ar ? 'كرتون' : 'Carton',
      paper: ar ? 'ورق' : 'Paper'
    };
    return map[key] || v || (ar ? 'غير محدد' : 'Unknown');
  }
  function requestDate(row){
    const raw = row.createdAt || row.updatedAt || row.requestDate || row.collectionDate || row.preferredDate || row.date || '';
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) ? d : null;
  }
  function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function allRequests(){
    return (readJson(REQ_KEY, []) || []).map(function(r, i){
      return Object.assign({}, r, { _originalIndex:i, weight:Number(r.weight) || 0, status:normalizeStatus(r.status) });
    });
  }
  function sortNewest(rows){
    return rows.slice().sort(function(a,b){
      const da = requestDate(a), db = requestDate(b);
      return (db ? db.getTime() : b._originalIndex) - (da ? da.getTime() : a._originalIndex);
    });
  }
  function rowsForFilter(type){
    const rows = sortNewest(allRequests());
    if(!rows.length) return [];

    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrowStart = new Date(todayStart); tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let filtered = [];
    if(type === 'today'){
      filtered = rows.filter(function(r){ const d = requestDate(r); return d && d >= todayStart && d < tomorrowStart; });
      if(!filtered.length) filtered = rows.slice(0, Math.min(3, rows.length));
    }else if(type === 'week'){
      filtered = rows.filter(function(r){ const d = requestDate(r); return d && d >= weekStart && d < tomorrowStart; });
      if(!filtered.length) filtered = rows.slice(0, Math.min(7, rows.length));
    }else if(type === 'month'){
      filtered = rows.filter(function(r){ const d = requestDate(r); return d && d >= monthStart && d < tomorrowStart; });
      if(!filtered.length) filtered = rows;
    }else{
      filtered = rows;
    }
    return filtered.reverse();
  }
  function cssVar(name, fallback){
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }
  function destroyChart(id){
    if(chartRefs[id]){ chartRefs[id].destroy(); chartRefs[id] = null; }
  }
  function makeChart(id, config){
    const canvas = document.getElementById(id);
    if(!canvas || !window.Chart) return;
    destroyChart(id);
    chartRefs[id] = new Chart(canvas, config);
  }
  function labelForRow(row, index){
    const d = requestDate(row);
    if(d){
      return (d.getMonth() + 1) + '/' + d.getDate() + ' #' + (index + 1);
    }
    return '#' + (index + 1);
  }
  function chartOptions(extra){
    const text = cssVar('--pro-sub', '#78889a');
    const grid = 'rgba(47,65,86,.10)';
    return Object.assign({
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:450},
      plugins:{
        legend:{labels:{usePointStyle:true, pointStyle:'circle', boxWidth:8, padding:14, color:text, font:{family:'Segoe UI', weight:'800'}}},
        tooltip:{backgroundColor:'rgba(37,54,74,.94)', titleColor:'#fff', bodyColor:'#fff', padding:12, cornerRadius:12}
      },
      scales:{
        x:{grid:{display:false}, ticks:{color:text, maxRotation:0, minRotation:0, font:{family:'Segoe UI', weight:'800'}}},
        y:{beginAtZero:true, grid:{color:grid, drawBorder:false}, ticks:{precision:0, color:text, font:{family:'Segoe UI', weight:'800'}}}
      }
    }, extra || {});
  }
  window.initCharts = function(data){
    if(!window.Chart) return;
    const rows = (Array.isArray(data) ? data : allRequests()).map(function(r,i){
      return Object.assign({}, r, { _chartIndex:i, weight:Number(r.weight) || 0, status:normalizeStatus(r.status) });
    });
    const primary = cssVar('--pro-primary', '#567c8d');
    const dark = cssVar('--pro-primary-2', '#2f4156');
    const palette = [primary, '#8fb3c2', '#d99a2b', '#3c9a66', '#c95858', '#9fb8c7'];
    const byMaterial = {}, byStatus = {};
    rows.forEach(function(r){
      byMaterial[materialLabel(r.type)] = (byMaterial[materialLabel(r.type)] || 0) + 1;
      byStatus[statusLabel(r.status)] = (byStatus[statusLabel(r.status)] || 0) + 1;
    });
    makeChart('requestsChart', {
      type:'line',
      data:{labels:rows.map(labelForRow), datasets:[{label:'Weight kg', data:rows.map(r=>r.weight), borderColor:primary, backgroundColor:'rgba(86,124,141,.14)', fill:true, tension:.35, borderWidth:3, pointRadius:4, pointBackgroundColor:'#fff', pointBorderColor:primary, pointBorderWidth:2}]},
      options:chartOptions({plugins:{legend:{display:false}}})
    });
    makeChart('materialsChart', {
      type:'doughnut',
      data:{labels:Object.keys(byMaterial), datasets:[{data:Object.values(byMaterial), backgroundColor:palette, borderColor:'#fff', borderWidth:4, hoverOffset:8}]},
      options:chartOptions({cutout:'70%', scales:{}, plugins:{legend:{position:'bottom', labels:{usePointStyle:true, pointStyle:'circle', boxWidth:8, padding:14, color:cssVar('--pro-sub','#78889a'), font:{family:'Segoe UI', weight:'800'}}}}})
    });
    makeChart('statusChart', {
      type:'bar',
      data:{labels:Object.keys(byStatus), datasets:[{label:'Requests', data:Object.values(byStatus), backgroundColor:'rgba(86,124,141,.72)', borderColor:dark, borderWidth:1, borderRadius:12, maxBarThickness:44}]},
      options:chartOptions({plugins:{legend:{display:false}}, scales:{x:{grid:{display:false},ticks:{color:cssVar('--pro-sub','#78889a'), maxRotation:0, minRotation:0, font:{family:'Segoe UI', weight:'800'}}}, y:{beginAtZero:true, grid:{color:'rgba(47,65,86,.10)', drawBorder:false}, ticks:{precision:0, color:cssVar('--pro-sub','#78889a'), font:{family:'Segoe UI', weight:'800'}}}}})
    });
  };
  function renderDashboardTable(rows){
    const table = document.querySelector('#dashboard tbody');
    if(!table) return;
    const ar = (typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) === 'ar';
    if(!rows.length){
      table.innerHTML = `<tr><td colspan="4" class="empty-row">${ar ? 'لا توجد طلبات لهذه الفترة' : 'No requests for this period'}</td></tr>`;
      return;
    }
    table.innerHTML = rows.map(function(r){
      const label = statusLabel(r.status);
      const cls = ['completed','approved','driver_en_route'].includes(normalizeStatus(r.status)) ? 'completed' : 'pending';
      return `<tr><td>${r.ownerName || r.ownerUsername || r.name || 'Customer'}</td><td>${materialLabel(r.type)}</td><td>${Number(r.weight || 0).toFixed(1).replace(/\.0$/, '')}kg</td><td><span class="status ${cls}">${label}</span></td></tr>`;
    }).join('');
  }
  window.filterData = function(type){
    const select = document.getElementById('filterSelect');
    const selected = type || (select ? select.value : 'today');
    if(select) select.value = selected;
    const rows = rowsForFilter(selected);
    renderDashboardTable(rows);
    window.initCharts(rows);
  };
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      const select = document.getElementById('filterSelect');
      if(select){
        select.onchange = function(){ window.filterData(this.value); };
        window.filterData(select.value || 'today');
      }
    }, 500);
  });
})();

/* ===== PROFESSIONAL LATEST REQUESTS LIMIT + CLEAN TABLE (added only) ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const LIMIT = Number.MAX_SAFE_INTEGER;
  let latestExpanded = true;
  let activeFilter = 'today';

  function jget(k,f){ try{ const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? f : v; }catch(e){ return f; } }
  function esc(s){ return String(s ?? '').replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function ar(){ return (typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) === 'ar'; }
  function normalizeStatus(s){
    s = String(s || 'sent').toLowerCase();
    if(s === 'handled') return 'approved';
    if(s === 'assigned') return 'approved';
    return s;
  }
  function statusLabel(s){
    const isAr = ar();
    s = normalizeStatus(s);
    const map = {
      sent: isAr ? 'بانتظار الموافقة' : 'Awaiting',
      pending: isAr ? 'قيد الانتظار' : 'Pending',
      approved: isAr ? 'موافق عليه' : 'Approved',
      driver_en_route: isAr ? 'السائق بالطريق' : 'Driver en route',
      completed: isAr ? 'مكتمل' : 'Completed',
      canceled: isAr ? 'ملغى' : 'Canceled'
    };
    return map[s] || s;
  }
  function materialLabel(v){
    const isAr = ar();
    const s = String(v || '').toLowerCase();
    const map = {damaged:isAr?'تالف':'Damaged', clean:isAr?'نظيف':'Clean', carton:isAr?'كرتون':'Carton'};
    return map[s] || (v || '--');
  }
  function statusClass(s){
    s = normalizeStatus(s);
    if(s === 'completed') return 'completed';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    if(s === 'canceled') return 'canceled';
    return 'pending';
  }
  function requestDate(r){
    const raw = r.createdAt || r.updatedAt || r.date || r.preferredDate || r.availableDate || r.id;
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d) ? d : null;
  }
  function formatDate(r){
    const d = requestDate(r);
    if(!d) return '—';
    return d.toLocaleDateString(ar() ? 'ar-JO' : 'en-US', {month:'short', day:'numeric'});
  }
  function readRequests(){
    return (jget(REQ_KEY, []) || []).map(r => ({...r, status:normalizeStatus(r.status), weight:Number(r.weight) || 0}));
  }
  function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
  function rowsForFilter(type){
    const rows = readRequests().slice().reverse();
    const now = new Date();
    const today = startOfDay(now);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let filtered = rows;
    if(type === 'today'){
      filtered = rows.filter(r => { const d = requestDate(r); return d && d >= today && d < tomorrow; });
      if(!filtered.length) filtered = rows.slice(0, Math.min(3, rows.length));
    }else if(type === 'week'){
      filtered = rows.filter(r => { const d = requestDate(r); return d && d >= weekStart && d < tomorrow; });
      if(!filtered.length) filtered = rows.slice(0, Math.min(7, rows.length));
    }else if(type === 'month'){
      filtered = rows.filter(r => { const d = requestDate(r); return d && d >= monthStart && d < tomorrow; });
      if(!filtered.length) filtered = rows;
    }
    return filtered;
  }
  function ensureLatestUI(total, shown){
    const box = document.querySelector('#dashboard .table-box');
    const title = document.getElementById('latestRequestsTitle');
    if(!box || !title) return;
    box.classList.add('latest-requests-pro');
    let head = document.getElementById('latestRequestsProHead');
    if(!head){
      head = document.createElement('div');
      head.id = 'latestRequestsProHead';
      head.className = 'latest-requests-head';
      title.parentNode.insertBefore(head, title);
      head.appendChild(title);
      const meta = document.createElement('div');
      meta.id = 'latestRequestsMeta';
      meta.className = 'latest-requests-meta';
      head.appendChild(meta);
    }
    const meta = document.getElementById('latestRequestsMeta');
    if(meta) meta.innerHTML = `<span>${total} / ${total}</span>`;
  }
  function renderLatest(rows){
    const table = document.querySelector('#dashboard tbody');
    if(!table) return;
    const total = rows.length;
    const visible = rows;
    ensureLatestUI(total, visible.length);
    if(!visible.length){
      table.innerHTML = `<tr><td colspan="4" class="empty-row">${ar() ? 'لا توجد طلبات لهذه الفترة' : 'No requests for this period'}</td></tr>`;
      return;
    }
    table.innerHTML = visible.map(function(r){
      const name = r.ownerName || r.ownerUsername || r.name || 'Customer';
      const cls = statusClass(r.status);
      return `<tr class="latest-row">
        <td><div class="request-user-cell"><strong>${esc(name)}</strong><span>${esc(formatDate(r))}</span></div></td>
        <td><span class="material-chip">${esc(materialLabel(r.type))}</span></td>
        <td><strong>${Number(r.weight || 0).toFixed(1).replace(/\.0$/, '')}kg</strong></td>
        <td><span class="status ${cls}">${esc(statusLabel(r.status))}</span></td>
      </tr>`;
    }).join('');
  }
  window.filterData = function(type){
    const select = document.getElementById('filterSelect');
    activeFilter = type || (select ? select.value : 'today');
    if(select) select.value = activeFilter;
    const rows = rowsForFilter(activeFilter);
    renderLatest(readRequests().slice().reverse());
    if(typeof window.initCharts === 'function') window.initCharts(rows);
  };
  window.searchUsers = function(){
    const val = (document.getElementById('searchBox')?.value || '').toLowerCase().trim();
    let rows = readRequests().slice().reverse();
    if(val){
      rows = rows.filter(r => [r.ownerName,r.ownerUsername,r.ownerEmail,r.type,r.status,r.weight].join(' ').toLowerCase().includes(val));
    }
    renderLatest(rows);
  };
  window.loadTable = function(){ renderLatest(readRequests().slice().reverse()); };
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      const select = document.getElementById('filterSelect');
      if(select){
        activeFilter = select.value || 'today';
        select.onchange = function(){ window.filterData(this.value); };
      }
      window.filterData(activeFilter);
    }, 700);
  });
})();


/* ===== FINAL USERS PAGE: one professional table + search ===== */
(function(){
  const REQ_KEY='releaf_requests_v1';
  function isAr(){ return ((typeof currentLang==='function'?currentLang():localStorage.getItem('lang')) || 'en') === 'ar'; }
  function tx(en,ar){ return isAr()?ar:en; }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function jget(k,f){ try{ const v=JSON.parse(localStorage.getItem(k)||'null'); return v==null?f:v; }catch(e){ return f; } }
  function normStatus(s){ s=String(s||'sent').toLowerCase(); if(s==='pending')return 'sent'; if(s==='handled'||s==='assigned')return 'approved'; if(s==='cancelled')return 'canceled'; return s; }
  function initials(name){ const clean = String(name||'C').trim(); return (clean.charAt(0) || 'C').toUpperCase(); }
  function requests(){ return (jget(REQ_KEY,[])||[]).map(r=>({
    name:r.ownerName||r.name||r.fullName||r.ownerUsername||'Customer',
    username:r.ownerUsername||r.username||'',
    email:r.ownerEmail||r.email||'',
    phone:r.ownerPhone||r.phone||'',
    status:normStatus(r.status),
    weight:Number(r.weight)||0
  })); }
  function buildUsers(){
    const map=new Map();
    requests().forEach(r=>{
      const key=(r.username||r.email||r.phone||r.name||'customer').toLowerCase();
      if(!map.has(key)) map.set(key,{name:r.name,username:r.username,email:r.email,phone:r.phone,total:0,active:0,completed:0,weight:0});
      const u=map.get(key);
      u.name=u.name||r.name; u.username=u.username||r.username; u.email=u.email||r.email; u.phone=u.phone||r.phone;
      u.total++; u.weight+=r.weight;
      if(r.status==='completed') u.completed++;
      if(!['completed','canceled'].includes(r.status)) u.active++;
    });
    return Array.from(map.values()).sort((a,b)=>b.total-a.total || b.weight-a.weight || a.name.localeCompare(b.name));
  }
  window.renderUsersUnified = function(value){
    const section=document.getElementById('users');
    if(!section) return;
    const oldTop=document.querySelector('#users .pro-table-box');
    if(oldTop) oldTop.remove();
    let box=document.getElementById('adminUsersBox');
    if(!box){ box=document.createElement('div'); box.id='adminUsersBox'; section.appendChild(box); }
    box.className='table-box users-unified-pro';
    const q=String(value ?? document.getElementById('usersUnifiedSearchBox')?.value ?? '').toLowerCase().trim();
    const all=buildUsers();
    const list=all.filter(u=>[u.name,u.username,u.email,u.phone,u.total,u.active,u.completed,u.weight].join(' ').toLowerCase().includes(q));
    box.innerHTML=`
      <div class="users-pro-head">
        <div class="users-pro-title">
          <h3>${tx('Registered Users','المستخدمون المسجلون')}</h3>
          <p>${tx('One clean summary based on customer request activity.','ملخص واحد مرتب حسب نشاط طلبات العملاء.')}</p>
        </div>
        <div class="users-pro-count">${list.length}<small>${tx('Users','مستخدمين')}</small></div>
      </div>
      <div class="users-pro-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="usersUnifiedSearchBox" type="text" value="${esc(q)}" placeholder="${tx('Search by name, username, email, or phone...','ابحثي بالاسم أو اسم المستخدم أو الإيميل أو الهاتف...')}" oninput="renderUsersUnified(this.value)">
      </div>
      <table>
        <thead><tr>
          <th>${tx('User','المستخدم')}</th>
          <th>${tx('Contact','التواصل')}</th>
          <th>${tx('Requests','الطلبات')}</th>
          <th>${tx('Active','النشطة')}</th>
          <th>${tx('Completed','المكتملة')}</th>
          <th>${tx('Total Weight','الوزن الكلي')}</th>
        </tr></thead>
        <tbody>${list.length?list.map(u=>`
          <tr>
            <td><div class="user-main-cell"><span class="user-mini-avatar">${esc(initials(u.name))}</span><div><strong>${esc(u.name)}</strong><span>@${esc(u.username||'customer')}</span></div></div></td>
            <td><div class="user-contact-cell"><strong>${esc(u.phone||'--')}</strong><small>${esc(u.email||'--')}</small></div></td>
            <td><span class="user-stat-pill">${u.total}</span></td>
            <td><span class="user-stat-pill active">${u.active}</span></td>
            <td><span class="user-stat-pill completed">${u.completed}</span></td>
            <td><span class="weight-strong">${Number(u.weight).toFixed(0)}kg</span></td>
          </tr>`).join(''):`<tr><td colspan="6" class="empty-row">${tx('No users found','لا يوجد مستخدمون مطابقون')}</td></tr>`}</tbody>
      </table>`;
    const input=document.getElementById('usersUnifiedSearchBox');
    if(input){ input.focus(); const n=input.value.length; input.setSelectionRange(n,n); }
  };
  const prevShow=window.showPage;
  window.showPage=function(id,clickedItem){
    if(typeof prevShow==='function') prevShow(id,clickedItem);
    if(id==='users') setTimeout(()=>window.renderUsersUnified(),30);
  };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>window.renderUsersUnified(),250));
  window.addEventListener('storage',()=>setTimeout(()=>window.renderUsersUnified(),30));
})();


/* ===== FINAL PATCH: requested only - all latest requests + first user initial ===== */
(function(){
  const REQ_KEY='releaf_requests_v1';
  function esc(v){ return String(v==null?'':v).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m])); }
  function isAr(){ return ((typeof currentLang==='function'?currentLang():localStorage.getItem('lang')) || 'en') === 'ar'; }
  function normStatus(s){ s=String(s||'sent').toLowerCase(); if(s==='handled'||s==='assigned')return 'approved'; if(s==='cancelled')return 'canceled'; return s; }
  function readRequests(){ try{return (JSON.parse(localStorage.getItem(REQ_KEY)||'[]')||[]).map(r=>({...r,status:normStatus(r.status),weight:Number(r.weight)||0}));}catch(e){return [];} }
  function requestDate(r){ const raw=r.createdAt||r.updatedAt||r.date||r.preferredDate||r.availableDate||r.id; const d=raw?new Date(raw):null; return d&&!isNaN(d)?d:null; }
  function formatDate(r){ const d=requestDate(r); return d?d.toLocaleDateString(isAr()?'ar-JO':'en-US',{month:'short',day:'numeric'}):'—'; }
  function materialLabel(v){ const ar=isAr(), s=String(v||'').toLowerCase(); return ({damaged:ar?'تالف':'Damaged',clean:ar?'نظيف':'Clean',carton:ar?'كرتون':'Carton'}[s]) || (v||'--'); }
  function statusLabel(s){ const ar=isAr(); s=normStatus(s); return ({sent:ar?'بانتظار الموافقة':'Awaiting',pending:ar?'قيد الانتظار':'Pending',approved:ar?'موافق عليه':'Approved',driver_en_route:ar?'السائق بالطريق':'Driver en route',completed:ar?'مكتمل':'Completed',canceled:ar?'ملغى':'Canceled'}[s]) || s; }
  function statusClass(s){ s=normStatus(s); if(s==='completed')return 'completed'; if(s==='approved'||s==='driver_en_route')return 'approved'; if(s==='canceled')return 'canceled'; return 'pending'; }
  function ensureHead(total){
    const box=document.querySelector('#dashboard .table-box'), title=document.getElementById('latestRequestsTitle');
    if(!box||!title)return;
    box.classList.add('latest-requests-pro');
    let head=document.getElementById('latestRequestsProHead');
    if(!head){ head=document.createElement('div'); head.id='latestRequestsProHead'; head.className='latest-requests-head'; title.parentNode.insertBefore(head,title); head.appendChild(title); const meta=document.createElement('div'); meta.id='latestRequestsMeta'; meta.className='latest-requests-meta'; head.appendChild(meta); }
    const meta=document.getElementById('latestRequestsMeta'); if(meta) meta.innerHTML=`<span>${total} / ${total}</span>`;
  }
  function renderAllLatest(rows){
    const table=document.querySelector('#dashboard tbody'); if(!table)return;
    rows = rows || readRequests().slice().reverse();
    ensureHead(rows.length);
    if(!rows.length){ table.innerHTML=`<tr><td colspan="4" class="empty-row">${isAr()?'لا توجد طلبات':'No requests yet'}</td></tr>`; return; }
    table.innerHTML=rows.map(r=>{ const name=r.ownerName||r.ownerUsername||r.name||'Customer'; const cls=statusClass(r.status); return `<tr class="latest-row"><td><div class="request-user-cell"><strong>${esc(name)}</strong><span>${esc(formatDate(r))}</span></div></td><td><span class="material-chip">${esc(materialLabel(r.type))}</span></td><td><strong>${Number(r.weight||0).toFixed(1).replace(/\.0$/,'')}kg</strong></td><td><span class="status ${cls}">${esc(statusLabel(r.status))}</span></td></tr>`; }).join('');
  }
  const previousSearchUsers=window.searchUsers;
  window.searchUsers=function(){
    const val=(document.getElementById('searchBox')?.value||'').toLowerCase().trim();
    const rows=readRequests().slice().reverse().filter(r=>!val||[r.ownerName,r.ownerUsername,r.ownerEmail,r.type,r.status,r.weight].join(' ').toLowerCase().includes(val));
    renderAllLatest(rows);
  };
  const previousFilterData=window.filterData;
  window.filterData=function(type){
    if(typeof previousFilterData==='function') previousFilterData(type);
    setTimeout(()=>renderAllLatest(),0);
  };
  window.loadTable=function(){ renderAllLatest(); };
  const previousShowPage=window.showPage;
  window.showPage=function(id,clickedItem){
    if(typeof previousShowPage==='function') previousShowPage(id,clickedItem);
    if(id==='dashboard') setTimeout(()=>renderAllLatest(),0);
  };
  function setFirstInitials(){
    document.querySelectorAll('.user-mini-avatar').forEach(el=>{
      const name=el.closest('.user-main-cell')?.querySelector('strong')?.textContent || el.textContent || 'C';
      el.textContent=(String(name).trim().charAt(0)||'C').toUpperCase();
    });
  }
  const previousRenderUsers=window.renderUsersUnified;
  if(typeof previousRenderUsers==='function'){
    window.renderUsersUnified=function(value){ previousRenderUsers(value); setTimeout(setFirstInitials,0); };
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{renderAllLatest(); setFirstInitials();},900));
  window.addEventListener('storage',()=>setTimeout(()=>{renderAllLatest(); setFirstInitials();},50));
})();


/* ===== Requests page professional layout + per-field save actions ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad', 'Raneem', 'Mayar'];
  function isAr(){ return ((typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang')) || 'en') === 'ar'; }
  function tx(en, ar){ return isAr() ? ar : en; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function safeId(id){ return String(id).replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function normStatus(s){
    s = String(s || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if(s === 'pending') return 'sent';
    if(s === 'handled' || s === 'assigned' || s === 'admin_approved') return 'approved';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function statusLabel(s){
    s = normStatus(s);
    const ar = isAr();
    return ({
      sent: ar ? 'بانتظار الموافقة' : 'Awaiting',
      approved: ar ? 'تمت المعالجة' : 'Handled',
      driver_en_route: ar ? 'السائق بالطريق' : 'Driver en route',
      completed: ar ? 'مكتمل' : 'Completed',
      canceled: ar ? 'ملغى' : 'Canceled'
    }[s]) || s;
  }
  function statusClass(s){
    s = normStatus(s);
    if(s === 'completed') return 'completed';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    if(s === 'canceled') return 'canceled';
    return 'pending';
  }
  function readRequests(){
    try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; }
    catch(e){ return []; }
  }
  function writeRequests(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function refreshAfterSave(){
    if(typeof window.loadRequests === 'function') window.loadRequests();
    if(typeof window.loadTable === 'function') window.loadTable();
    if(typeof window.updateCards === 'function') window.updateCards();
    if(typeof window.initCharts === 'function') window.initCharts();
  }
  function toast(msg){
    let el = document.getElementById('adminRequestToast');
    if(!el){
      el = document.createElement('div');
      el.id = 'adminRequestToast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'show';
    setTimeout(() => el.className = '', 1700);
  }
  let reqSearchValue = '';
  let reqFilterValue = 'all';
  function getFilteredRequests(){
    const q = reqSearchValue.toLowerCase().trim();
    return readRequests().slice().reverse().filter(r => {
      const statusOk = reqFilterValue === 'all' || normStatus(r.status) === reqFilterValue;
      const userName = String(r.ownerName || r.ownerUsername || '').toLowerCase().trim();
      const userWords = userName.split(/\\s+/).filter(Boolean);
      return statusOk && (!q || userWords.includes(q));
    });
  }
  function renderRequestsCards(list){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    if(!list.length){
      container.innerHTML = `<div class="admin-empty-state">${tx('No requests found','لا توجد طلبات مطابقة')}</div>`;
      return;
    }
    container.innerHTML = list.map(r => {
      const id = String(r.id || '');
      const sid = safeId(id);
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      const adminValue = r.adminName || '';
      const adminOptions = `<option value="">${tx('Choose admin','اختاري الأدمن')}</option>` + ADMINS.map(a => `<option value="${a}" ${String(adminValue).toLowerCase() === a.toLowerCase() ? 'selected' : ''}>${a}</option>`).join('');
      return `<article class="admin-request-card request-card-pro" data-request-id="${esc(id)}" data-safe-id="${esc(sid)}">
        <div class="request-card-top">
          <div>
            <span class="request-id">${esc(id || '--')}</span>
            <h4>${esc(r.ownerName || r.ownerUsername || 'Customer')}</h4>
            <p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p>
          </div>
          <span class="status ${statusClass(r.status)}">${statusLabel(r.status)}</span>
        </div>
        <div class="request-meta-grid">
          <span><strong>${tx('Material','المادة')}</strong>${esc(r.type || '--')}</span>
          <span><strong>${tx('Weight','الوزن')}</strong>${Number(r.weight || 0).toFixed(1).replace(/\.0$/,'')}kg</span>
          <span><strong>${tx('Action','الإجراء')}</strong>${esc(r.action || '--')}</span>
          <span><strong>${tx('Location','الموقع')}</strong>${esc(loc)}</span>
          <span><strong>${tx('Date','التاريخ')}</strong>${esc(r.requestDate || r.collectionDate || '--')}</span>
          <span><strong>${tx('Time','الوقت')}</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>${tx('Customer notes','ملاحظات العميل')}:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-work-panel">
          <label class="request-save-row"><span>${tx('Handled by','تمت المعالجة بواسطة')}</span><select id="handled_${sid}">${adminOptions}</select><button type="button" onclick="saveRequestField('${esc(id)}','handled')">${tx('Handle Request','Handle Request')}</button></label>
          <label class="request-save-row request-save-row-2"><span>${tx('Driver','السائق')}</span><input id="driver_${sid}" value="${esc(r.driverName || '')}" placeholder="${tx('Driver name','اسم السائق')}"><input id="driverPhone_${sid}" value="${esc(r.driverPhone || r.driverMobile || '')}" placeholder="${tx('Driver phone','رقم السائق')}"><button type="button" onclick="saveRequestField('${esc(id)}','driver')">${tx('Assign Driver','Assign Driver')}</button></label>
          <label class="request-save-row"><span>${tx('Pickup time','وقت الاستلام')}</span><input id="eta_${sid}" value="${esc(r.eta || r.pickupEta || '')}" placeholder="${tx('Example: Today 4:30 PM','مثال: اليوم 4:30 مساءً')}"><button type="button" onclick="saveRequestField('${esc(id)}','eta')">${tx('Save Time','Save Time')}</button></label>
          <label class="request-save-row"><span>${tx('','ملاحظة الأدمن')}</span><input id="note_${sid}" value="${esc(r.adminNote || '')}" placeholder="${tx('Write a note for the customer','اكتبي ملاحظة للعميل')}"><button type="button" onclick="saveRequestField('${esc(id)}','note')">${tx('','')}</button></label>
        </div>
        <div class="request-live-summary">
          ${r.adminName ? `<span>${tx('Handled by','Handled by')}: <strong>${esc(r.adminName)}</strong></span>` : ''}
          ${r.driverName ? `<span>${tx('Driver','Driver')}: <strong>${esc(r.driverName)}</strong>${r.driverPhone || r.driverMobile ? ` · ${esc(r.driverPhone || r.driverMobile)}` : ''}</span>` : ''}
          ${r.eta ? `<span>${tx('Time','Time')}: <strong>${esc(r.eta)}</strong></span>` : ''}
          ${r.adminNote ? `<span>${tx('Note','Note')}: <strong>${esc(r.adminNote)}</strong></span>` : ''}
        </div>
        <div class="request-actions compact-actions">
          <button type="button" onclick="saveRequestField('${esc(id)}','approve')">${tx('Approve','موافقة')}</button>
          <button type="button" onclick="saveRequestField('${esc(id)}','complete')">${tx('Complete','إكمال')}</button>
          <button type="button" class="danger" onclick="saveRequestField('${esc(id)}','cancel')">${tx('Cancel','إلغاء')}</button>
        </div>
      </article>`;
    }).join('');
  }
  window.saveRequestField = function(id, action){
    const sid = safeId(id);
    const driverName = document.getElementById('driver_' + sid)?.value.trim() || '';
    const driverPhone = document.getElementById('driverPhone_' + sid)?.value.trim() || '';
    const eta = document.getElementById('eta_' + sid)?.value.trim() || '';
    const adminNote = document.getElementById('note_' + sid)?.value.trim() || '';
    const handledBy = document.getElementById('handled_' + sid)?.value.trim() || '';
    const list = readRequests().map(r => {
      if(String(r.id) !== String(id)) return r;
      const next = {...r, updatedAt: new Date().toISOString()};
      if(action === 'handled'){
        next.adminName = handledBy || next.adminName || 'Admin';
        next.handledBy = next.adminName;
        next.status = 'approved';
      } else if(action === 'driver'){
        next.driverName = driverName;
        next.driverPhone = driverPhone;
      } else if(action === 'eta'){
        next.eta = eta;
        next.pickupEta = eta;
      } else if(action === 'note'){
        next.adminNote = adminNote;
      } else if(action === 'approve'){
        next.status = 'approved';
        if(handledBy){ next.adminName = handledBy; next.handledBy = handledBy; }
      } else if(action === 'complete'){
        next.status = 'completed';
      } else if(action === 'cancel'){
        next.status = 'canceled';
      }
      return next;
    });
    writeRequests(list);
    refreshAfterSave();
    toast(tx('Saved','تم الحفظ'));
  };
  window.setRequestStatus = function(id, status){
    const action = status === 'completed' ? 'complete' : status === 'canceled' ? 'cancel' : status === 'driver_en_route' ? 'driver' : 'approve';
    window.saveRequestField(id, action);
  };
  window.cancelRequest = function(id){ window.saveRequestField(id, 'cancel'); };
  window.loadRequests = function(){ renderRequestsCards(getFilteredRequests()); if(typeof window.renderReports === 'function') window.renderReports(); if(typeof window.updateCards === 'function') window.updateCards(); };
  window.searchRequests = function(value){ reqSearchValue = String(value || ''); window.loadRequests(); };
  window.filterRequests = function(status){ reqFilterValue = status || 'all'; window.loadRequests(); };
  const oldShowPage = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof oldShowPage === 'function') oldShowPage(id, clickedItem);
    if(id === 'requests') setTimeout(window.loadRequests, 0);
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(window.loadRequests, 500));
})();

/* =========================================================
   FINAL PATCH: request-specific schedule dropdowns + per-field saving
   - Admin can only choose the date/time the customer selected for that request.
   - Driver name, driver phone, handler, schedule, and admin note each save alone.
   ========================================================= */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  let reqSearchValue = '';
  let reqFilterValue = 'all';

  function safeJson(key, fallback){
    try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; }
    catch(e){ return fallback; }
  }
  function saveJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function safeId(id){ return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function lang(){ return (typeof currentLang === 'function' ? currentLang() : (localStorage.getItem('lang') || 'en')) === 'ar' ? 'ar' : 'en'; }
  function tx(en, ar){ return lang() === 'ar' ? ar : en; }
  function normStatus(status){
    const s = String(status || 'sent').toLowerCase();
    if(s === 'pending') return 'sent';
    if(s === 'handled') return 'approved';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function statusLabel(status){
    const s = normStatus(status);
    if(s === 'completed') return tx('Completed','مكتمل');
    if(s === 'canceled') return tx('Canceled','ملغى');
    if(s === 'driver_en_route') return tx('Driver En Route','السائق بالطريق');
    if(s === 'approved' || s === 'assigned') return tx('Approved','تمت الموافقة');
    return tx('Awaiting Approval','بانتظار الموافقة');
  }
  function statusClass(status){
    const s = normStatus(status);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'canceled';
    if(s === 'approved' || s === 'assigned' || s === 'driver_en_route') return 'approved';
    return 'pending';
  }
  function readRequests(){
    return (safeJson(REQ_KEY, []) || []).map((r, index) => ({
      ...r,
      id: r.id || ('REQ-' + (index + 1)),
      status: normStatus(r.status),
      weight: Number(r.weight) || 0,
      type: r.type || r.paperType || r.material || 'Paper',
      ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
      ownerUsername: r.ownerUsername || r.username || '',
      ownerEmail: r.ownerEmail || r.email || '',
      ownerPhone: r.ownerPhone || r.phone || '',
      createdAt: r.createdAt || r.date || r.requestedAt || '',
      action: r.action || '',
      province: r.province || r.profileProvince || '',
      district: r.district || '',
      notes: r.notes || r.note || ''
    }));
  }
  function writeRequests(list){ saveJson(REQ_KEY, list.map(r => ({...r, status: normStatus(r.status)}))); }
  function uniqueClean(values){
    const out = [];
    (Array.isArray(values) ? values : [values]).flat().forEach(v => {
      const s = String(v == null ? '' : v).trim();
      if(s && !out.includes(s)) out.push(s);
    });
    return out;
  }
  function dateOptions(r){
    return uniqueClean([
      r.requestDate,
      r.collectionDate,
      r.preferredDate,
      r.pickupDate,
      r.selectedDate,
      r.scheduleDate,
      r.scheduledDate
    ]);
  }
  function splitCustomerTimeSlots(value){
    const raw = String(value || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [raw];
    const pad = n => String(n).padStart(2, '0');
    const fmt = mins => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
    const slots = [];
    while(start < end){
      const next = Math.min(start + 60, end);
      slots.push(`${fmt(start)}-${fmt(next)}`);
      start = next;
    }
    return slots.length ? slots : [raw];
  }
  function timeOptions(r){
    const values = uniqueClean([
      r.availableSlot,
      r.preferredTime,
      r.pickupTime,
      r.selectedTime,
      r.scheduleTime,
      Array.isArray(r.availableSlots) ? r.availableSlots : null,
      Array.isArray(r.preferredSlots) ? r.preferredSlots : null
    ]);
    const expanded = [];
    values.forEach(v => splitCustomerTimeSlots(v).forEach(slot => { if(!expanded.includes(slot)) expanded.push(slot); }));
    return expanded;
  }
  function selectedOption(options, saved, fallback){
    const s = String(saved || '').trim();
    if(s && options.includes(s)) return s;
    return fallback || options[0] || '';
  }
  function makeSelect(id, options, selected, emptyText, disabled){
    if(!options.length){
      return `<select id="${id}" ${disabled} disabled><option value="">${esc(emptyText)}</option></select>`;
    }
    return `<select id="${id}" ${disabled}>${options.map(o => `<option value="${esc(o)}" ${o === selected ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function filteredRequests(){
    const q = reqSearchValue.trim().toLowerCase();
    return readRequests().filter(r => {
      const statusOk = reqFilterValue === 'all' || normStatus(r.status) === reqFilterValue;
      const userName = String(r.ownerName || r.ownerUsername || '').toLowerCase().trim();
      const userWords = userName.split(/\\s+/).filter(Boolean);
      return statusOk && (!q || userWords.includes(q));
    });
  }
  function renderRequestsCards(list){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    if(!list.length){ container.innerHTML = `<div class="admin-empty-state">${tx('No requests found','لا توجد طلبات مطابقة')}</div>`; return; }
    container.innerHTML = list.map(r => {
      const sid = safeId(r.id);
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      const disabled = (normStatus(r.status) === 'canceled' || normStatus(r.status) === 'completed') ? 'disabled' : '';
      const dates = dateOptions(r);
      const times = timeOptions(r);
      const savedDate = selectedOption(dates, r.scheduledDate || r.adminScheduledDate || r.requestDate || r.collectionDate, dates[0]);
      const savedTime = selectedOption(times, r.scheduledTime || r.adminScheduledTime || r.eta || r.availableSlot, times[0]);
      return `<article class="admin-request-card">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${statusClass(r.status)}">${statusLabel(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>${tx('Material','المادة')}</strong>${esc(r.type)}</span>
          <span><strong>${tx('Weight','الوزن')}</strong>${Number(r.weight).toFixed(1)}kg</span>
          <span><strong>${tx('Action','الإجراء')}</strong>${esc(r.action || '--')}</span>
          <span><strong>${tx('Location','الموقع')}</strong>${esc(loc)}</span>
          <span><strong>${tx('Customer date','تاريخ المستخدم')}</strong>${esc((r.requestDate || r.collectionDate || '--'))}</span>
          <span><strong>${tx('Customer time','وقت المستخدم')}</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>${tx('Notes','ملاحظات')}:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-panel">
          <div class="admin-control-row">
            <label>${tx('Driver name','اسم السائق')}</label>
            <input ${disabled} id="driver_${sid}" value="${esc(r.driverName || '')}" placeholder="${tx('Driver name','اسم السائق')}">
            <button ${disabled} onclick="saveRequestField('${esc(r.id)}','driver')">${tx('Assign driver','تعيين السائق')}</button>
          </div>
          <div class="admin-control-row">
            <label>${tx('Driver phone','رقم السائق')}</label>
            <input ${disabled} id="driverPhone_${sid}" value="${esc(r.driverPhone || '')}" placeholder="${tx('Driver phone','رقم السائق')}">
            <button ${disabled} onclick="saveRequestField('${esc(r.id)}','driverPhone')">${tx('Save phone','حفظ الرقم')}</button>
          </div>
          <div class="admin-control-row">
            <label>${tx('Pickup date','تاريخ الاستلام')}</label>
            ${makeSelect('date_' + sid, dates, savedDate, tx('No customer date','لا يوجد تاريخ من المستخدم'), disabled)}
            <button ${disabled} ${dates.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','date')">${tx('Save date','حفظ التاريخ')}</button>
          </div>
          <div class="admin-control-row">
            <label>${tx('Pickup time','وقت الاستلام')}</label>
            ${makeSelect('time_' + sid, times, savedTime, tx('No customer time','لا يوجد وقت من المستخدم'), disabled)}
            <button ${disabled} ${times.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','time')">${tx('Save time','حفظ الوقت')}</button>
          </div>
          <div class="admin-control-row">
            <label>${tx('Handled by','المسؤول')}</label>
            <select ${disabled} id="handler_${sid}">
              <option value="">${tx('Choose admin','اختاري الأدمن')}</option>
              ${['Raghad','Raneem','Mayar'].map(n => `<option value="${n}" ${(String(r.adminName || '').toLowerCase() === n.toLowerCase()) ? 'selected' : ''}>${n}</option>`).join('')}
            </select>
            <button ${disabled} onclick="saveRequestField('${esc(r.id)}','handler')">${tx('Handle this request','استلام الطلب')}</button>
          </div>
          <div class="admin-control-row admin-control-row-note">
            <label>${tx('','ملاحظة الأدمن')}</label>
            
            <button ${disabled} onclick="saveRequestField('${esc(r.id)}','note')">${tx('','')}</button>
          </div>
        </div>
        ${(r.adminName || r.handledBy || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote) ? `
          <div class="request-saved-summary">
            ${(r.adminName || r.handledBy) ? `<span>${tx('Handled by','تمت المعالجة بواسطة')} <strong>${esc(r.adminName || r.handledBy)}</strong></span>` : ''}
            ${r.driverName ? `<span>${tx('Driver','السائق')}: <strong>${esc(r.driverName)}</strong></span>` : ''}
            ${r.driverPhone ? `<span>${tx('Driver phone','رقم السائق')}: <strong>${esc(r.driverPhone)}</strong></span>` : ''}
            ${(r.scheduledDate || r.adminScheduledDate) ? `<span>${tx('Pickup date','تاريخ الاستلام')}: <strong>${esc(r.scheduledDate || r.adminScheduledDate)}</strong></span>` : ''}
            ${(r.scheduledTime || r.adminScheduledTime || r.eta) ? `<span>${tx('Pickup time','وقت الاستلام')}: <strong>${esc(r.scheduledTime || r.adminScheduledTime || r.eta)}</strong></span>` : ''}
            ${r.adminNote ? `<span>${tx('','ملاحظة الأدمن')}: <strong>${esc(r.adminNote)}</strong></span>` : ''}
          </div>` : ''}
        <div class="request-actions">
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','approved')">${tx('Approve','موافقة')}</button>
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','driver_en_route')">${tx('Driver En Route','السائق بالطريق')}</button>
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','completed')">${tx('Complete','إكمال')}</button>
          <button class="danger" onclick="setRequestStatus('${esc(r.id)}','canceled')">${tx('Cancel','إلغاء')}</button>
        </div>
      </article>`;
    }).join('');
  }
  function saveRequestChange(id, mode, statusOverride){
    const sid = safeId(id);
    const adminFallback = (localStorage.getItem('adminName') || '').trim() || 'Admin';
    const next = readRequests().map(r => {
      if(String(r.id) !== String(id)) return r;
      const currentDates = dateOptions(r);
      const currentTimes = timeOptions(r);
      const chosenDate = document.getElementById('date_' + sid)?.value || r.scheduledDate || r.requestDate || r.collectionDate || '';
      const chosenTime = document.getElementById('time_' + sid)?.value || r.scheduledTime || r.eta || r.availableSlot || '';
      if(chosenDate && currentDates.length && !currentDates.includes(chosenDate)) return r;
      if(chosenTime && currentTimes.length && !currentTimes.includes(chosenTime)) return r;
      const handler = document.getElementById('handler_' + sid)?.value || r.adminName || adminFallback;
      let nextStatus = statusOverride ? normStatus(statusOverride) : r.status;
      if(mode === 'driver' || mode === 'driverPhone') nextStatus = 'assigned';
      if(mode === 'handler') nextStatus = 'approved';
      if(mode === 'date' || mode === 'time') nextStatus = normStatus(r.status) === 'sent' ? 'approved' : normStatus(r.status);
      return {
        ...r,
        status: nextStatus,
        adminName: mode === 'handler' ? handler : (r.adminName || handler),
        handledBy: mode === 'handler' ? handler : (r.handledBy || r.adminName || handler),
        driverName: document.getElementById('driver_' + sid)?.value || r.driverName || '',
        driverPhone: document.getElementById('driverPhone_' + sid)?.value || r.driverPhone || '',
        scheduledDate: chosenDate,
        adminScheduledDate: chosenDate,
        scheduledTime: chosenTime,
        adminScheduledTime: chosenTime,
        eta: chosenTime,
        adminNote: document.getElementById('note_' + sid)?.value || r.adminNote || '',
        updatedAt: new Date().toISOString()
      };
    });
    writeRequests(next);
    window.loadRequests();
    if(typeof window.loadTable === 'function') window.loadTable();
    if(typeof window.updateCards === 'function') window.updateCards();
    if(typeof window.initCharts === 'function') window.initCharts(readRequests());
  }
  window.saveRequestField = function(id, mode){ saveRequestChange(id, mode, null); };
  window.setRequestStatus = function(id, status){ saveRequestChange(id, 'status', status); };
  window.loadRequests = function(){ renderRequestsCards(filteredRequests()); if(typeof updateCards === 'function') updateCards(); };
  window.searchRequests = function(value){ reqSearchValue = String(value || ''); window.loadRequests(); };
  window.filterRequests = function(status){ reqFilterValue = status || 'all'; window.loadRequests(); };
  window.cancelRequest = function(id){ window.setRequestStatus(id, 'canceled'); };
  const oldShow = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof oldShow === 'function') oldShow(id, clickedItem);
    if(id === 'requests') setTimeout(window.loadRequests, 20);
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(window.loadRequests, 260); });
})();

/* =========================================================
   FINAL PATCH: Requests search + status dropdown filtering
   Only affects the Requests page rendering/filtering.
   ========================================================= */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad','Raneem','Mayar'];
  let searchValue = '';
  let statusValue = 'all';

  function readRaw(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function writeRaw(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function safeId(id){ return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function normStatus(s){
    s = String(s || 'sent').toLowerCase().trim();
    if(['pending','awaiting','awaiting approval','waiting approval','new','created'].includes(s)) return 'sent';
    if(['handled','assigned'].includes(s)) return 'approved';
    if(['on route','driver en route','driver_en_route'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished'].includes(s)) return 'completed';
    if(['cancelled','cancel'].includes(s)) return 'canceled';
    return s;
  }
  function label(s){
    s = normStatus(s);
    return s === 'completed' ? 'Completed' : s === 'canceled' ? 'Canceled' : s === 'driver_en_route' ? 'Driver En Route' : s === 'approved' ? 'Approved' : 'Awaiting Approval';
  }
  function cls(s){
    s = normStatus(s);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'canceled';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    return 'pending';
  }
  function normalize(r, i){
    return {
      ...r,
      id: r.id || ('REQ-' + (i + 1)),
      status: normStatus(r.status),
      ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
      ownerEmail: r.ownerEmail || r.email || '',
      ownerPhone: r.ownerPhone || r.phone || '',
      type: r.type || r.paperType || r.material || 'Paper',
      weight: Number(r.weight || 0),
      province: r.province || r.profileProvince || '',
      district: r.district || '',
      action: r.action || '',
      notes: r.notes || r.note || ''
    };
  }
  function requests(){ return readRaw().map(normalize); }
  function cleanList(values){
    const out = [];
    values.flat(Infinity).forEach(v => {
      v = String(v || '').trim();
      if(v && !out.includes(v)) out.push(v);
    });
    return out;
  }
  function dateOptions(r){
    return cleanList([r.requestDate, r.collectionDate, r.preferredDate, r.pickupDate, r.selectedDate, r.scheduleDate, r.scheduledDate]);
  }
  function splitSlots(v){
    const raw = String(v || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(end <= start) return [raw];
    const pad = n => String(n).padStart(2, '0');
    const fmt = n => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
    const out = [];
    while(start < end){ const next = Math.min(start + 60, end); out.push(`${fmt(start)}-${fmt(next)}`); start = next; }
    return out;
  }
  function timeOptions(r){
    const base = cleanList([r.availableSlot, r.preferredTime, r.pickupTime, r.selectedTime, r.scheduleTime, r.availableSlots || [], r.preferredSlots || []]);
    const out = [];
    base.forEach(v => splitSlots(v).forEach(x => { if(!out.includes(x)) out.push(x); }));
    return out;
  }
  function selectHtml(id, options, selected, empty, disabled){
    if(!options.length) return `<select id="${id}" disabled><option value="">${esc(empty)}</option></select>`;
    selected = options.includes(selected) ? selected : options[0];
    return `<select id="${id}" ${disabled}>${options.map(o => `<option value="${esc(o)}" ${o === selected ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function matchesFilter(r){
    const st = normStatus(r.status);
    const statusOk = statusValue === 'all' || st === statusValue;
    const q = searchValue.trim().toLowerCase();
    const text = [r.ownerName, r.ownerUsername, r.ownerEmail, r.ownerPhone, r.type, r.action, r.province, r.district, r.id, r.notes, r.driverName, r.driverPhone, r.adminName, r.handledBy].join(' ').toLowerCase();
    return statusOk && (!q || text.includes(q));
  }
  function filtered(){ return requests().slice().reverse().filter(matchesFilter); }
  function render(){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    const list = filtered();
    if(!list.length){ container.innerHTML = '<div class="admin-empty-state">No requests found</div>'; return; }
    container.innerHTML = list.map(r => {
      const sid = safeId(r.id);
      const disabled = (normStatus(r.status) === 'canceled' || normStatus(r.status) === 'completed') ? 'disabled' : '';
      const dates = dateOptions(r);
      const times = timeOptions(r);
      const savedDate = dates.includes(r.scheduledDate || r.adminScheduledDate) ? (r.scheduledDate || r.adminScheduledDate) : dates[0];
      const savedTime = times.includes(r.scheduledTime || r.adminScheduledTime || r.eta) ? (r.scheduledTime || r.adminScheduledTime || r.eta) : times[0];
      const handler = r.adminName || r.handledBy || '';
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      return `<article class="admin-request-card">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${cls(r.status)}">${label(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>Material</strong>${esc(r.type)}</span><span><strong>Weight</strong>${Number(r.weight).toFixed(1)}kg</span><span><strong>Action</strong>${esc(r.action || '--')}</span>
          <span><strong>Location</strong>${esc(loc)}</span><span><strong>Customer date</strong>${esc(r.requestDate || r.collectionDate || '--')}</span><span><strong>Customer time</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>Notes:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-panel">
          <div class="admin-control-row"><label>Driver name</label><input ${disabled} id="driver_${sid}" value="${esc(r.driverName || '')}" placeholder="Driver name"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','driver')">Assign driver</button></div>
          <div class="admin-control-row"><label>Driver phone</label><input ${disabled} id="driverPhone_${sid}" value="${esc(r.driverPhone || '')}" placeholder="Driver phone"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','driverPhone')">Save phone</button></div>
          <div class="admin-control-row"><label>Pickup date</label>${selectHtml('date_' + sid, dates, savedDate, 'No customer date', disabled)}<button ${disabled} ${dates.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','date')">Save date</button></div>
          <div class="admin-control-row"><label>Pickup time</label>${selectHtml('time_' + sid, times, savedTime, 'No customer time', disabled)}<button ${disabled} ${times.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','time')">Save time</button></div>
          <div class="admin-control-row"><label>Handled by</label><select ${disabled} id="handler_${sid}"><option value="">Choose admin</option>${ADMINS.map(n => `<option value="${n}" ${String(handler).toLowerCase() === n.toLowerCase() ? 'selected' : ''}>${n}</option>`).join('')}</select><button ${disabled} onclick="saveRequestField('${esc(r.id)}','handler')">Handle this request</button></div>
          <div class="admin-control-row admin-control-row-note"><label></label></div>
        </div>
        ${(handler || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote) ? `<div class="request-saved-summary">${handler ? `<span>Handled by <strong>${esc(handler)}</strong></span>` : ''}${r.driverName ? `<span>Driver: <strong>${esc(r.driverName)}</strong></span>` : ''}${r.driverPhone ? `<span>Driver phone: <strong>${esc(r.driverPhone)}</strong></span>` : ''}${(r.scheduledDate || r.adminScheduledDate) ? `<span>Pickup date: <strong>${esc(r.scheduledDate || r.adminScheduledDate)}</strong></span>` : ''}${(r.scheduledTime || r.adminScheduledTime || r.eta) ? `<span>Pickup time: <strong>${esc(r.scheduledTime || r.adminScheduledTime || r.eta)}</strong></span>` : ''}${r.adminNote ? `<span>: <strong>${esc(r.adminNote)}</strong></span>` : ''}</div>` : ''}
        <div class="request-actions"><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','approved')">Approve</button><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','driver_en_route')">Driver En Route</button><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','completed')">Complete</button><button ${disabled} class="danger" onclick="setRequestStatus('${esc(r.id)}','canceled')">Cancel</button></div>
      </article>`;
    }).join('');
  }
  function save(id, mode, statusOverride){
    const sid = safeId(id);
    const raw = readRaw();
    const next = raw.map((item, i) => {
      const r = normalize(item, i);
      if(String(r.id) !== String(id)) return item;
      const dates = dateOptions(r), times = timeOptions(r);
      const chosenDate = document.getElementById('date_' + sid)?.value || r.scheduledDate || r.requestDate || r.collectionDate || '';
      const chosenTime = document.getElementById('time_' + sid)?.value || r.scheduledTime || r.eta || r.availableSlot || '';
      const handler = document.getElementById('handler_' + sid)?.value || r.adminName || r.handledBy || '';
      const out = {...item, id: r.id, updatedAt: new Date().toISOString()};
      if(statusOverride) out.status = normStatus(statusOverride);
      if(mode === 'handler'){ out.adminName = handler; out.handledBy = handler; out.status = 'approved'; }
      if(mode === 'driver' || mode === 'driverPhone'){ out.driverName = document.getElementById('driver_' + sid)?.value || ''; out.driverPhone = document.getElementById('driverPhone_' + sid)?.value || ''; out.status = 'driver_en_route'; }
      if(mode === 'date' && (!dates.length || dates.includes(chosenDate))){ out.scheduledDate = chosenDate; out.adminScheduledDate = chosenDate; }
      if(mode === 'time' && (!times.length || times.includes(chosenTime))){ out.scheduledTime = chosenTime; out.adminScheduledTime = chosenTime; out.eta = chosenTime; }
      if(mode === 'note') out.adminNote = document.getElementById('note_' + sid)?.value || '';
      if(mode === 'status' && handler){ out.adminName = handler; out.handledBy = handler; }
      return out;
    });
    writeRaw(next);
    render();
    if(typeof window.loadTable === 'function') window.loadTable();
    if(typeof window.updateCards === 'function') window.updateCards();
  }
  window.loadRequests = render;
  window.searchRequests = function(value){ searchValue = String(value || ''); render(); };
  window.filterRequests = function(value){ statusValue = normStatus(value || 'all'); if(value === 'all') statusValue = 'all'; render(); };
  window.saveRequestField = function(id, mode){ save(id, mode, null); };
  window.setRequestStatus = function(id, status){ save(id, 'status', status); };
  window.cancelRequest = function(id){ save(id, 'status', 'canceled'); };
  document.addEventListener('DOMContentLoaded', function(){
    const search = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(search){ search.oninput = function(){ window.searchRequests(this.value); }; search.onkeyup = function(){ window.searchRequests(this.value); }; }
    if(filter){ filter.onchange = function(){ window.filterRequests(this.value); }; }
    setTimeout(render, 100);
  });
})();


/* ===== FINAL SEARCH SAFETY OVERRIDE: USER NAME ONLY ===== */
(function(){
  function normalizeWords(value){
    return String(value || '').toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function getCardUserName(card){
    const nameEl = card.querySelector('.request-card-top h4, h4');
    return nameEl ? nameEl.textContent : '';
  }

  function applyUserNameOnlySearch(){
    const input =
      document.getElementById('requestSearch') ||
      document.querySelector('#requests input[type="search"], #requests input[type="text"]');

    const q = String(input && input.value || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#requestsContainer .admin-request-card, #requestsContainer article');

    cards.forEach(function(card){
      if(!q){
        card.style.display = '';
        return;
      }

      const words = normalizeWords(getCardUserName(card));
      card.style.display = words.includes(q) ? '' : 'none';
    });

    const container = document.getElementById('requestsContainer');
    if(container){
      const visible = Array.from(cards).some(c => c.style.display !== 'none');
      let empty = document.getElementById('strictUserSearchEmpty');

      if(q && !visible){
        if(!empty){
          empty = document.createElement('div');
          empty.id = 'strictUserSearchEmpty';
          empty.className = 'admin-empty-state';
          empty.textContent = document.documentElement.lang === 'ar' ? 'لا توجد طلبات مطابقة' : 'No requests found';
          container.appendChild(empty);
        }
      }else if(empty){
        empty.remove();
      }
    }
  }

  const oldSearchRequests = window.searchRequests;
  window.searchRequests = function(value){
    if(typeof oldSearchRequests === 'function') oldSearchRequests(value);
    setTimeout(applyUserNameOnlySearch, 0);
    setTimeout(applyUserNameOnlySearch, 80);
  };

  const oldLoadRequests = window.loadRequests;
  window.loadRequests = function(){
    if(typeof oldLoadRequests === 'function') oldLoadRequests();
    setTimeout(applyUserNameOnlySearch, 0);
    setTimeout(applyUserNameOnlySearch, 80);
  };

  document.addEventListener('input', function(e){
    if(e.target && e.target.closest('#requests')){
      setTimeout(applyUserNameOnlySearch, 0);
      setTimeout(applyUserNameOnlySearch, 80);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(applyUserNameOnlySearch, 300);
    setTimeout(applyUserNameOnlySearch, 1000);
  });
})();


/* ===== FINAL USER-FIRST-NAME SEARCH OVERRIDE ===== */
(function(){
  function firstWord(value){
    return String(value || '').toLowerCase().trim().split(/\s+/).filter(Boolean)[0] || '';
  }

  function getSearchValue(sectionId){
    const section = document.getElementById(sectionId);
    if(!section) return '';
    const input = section.querySelector('input[type="search"], input[type="text"], input');
    return String(input && input.value || '').toLowerCase().trim();
  }

  function applyUsersSearch(){
    const q = getSearchValue('users');
    const rows = document.querySelectorAll('#users table tbody tr, #adminUsersBox tbody tr, #users .user-row, #users .registered-user-row');

    rows.forEach(function(row){
      if(!q){
        row.style.display = '';
        return;
      }

      const firstCell = row.querySelector('td:first-child');
      const nameText = firstCell ? firstCell.textContent : row.textContent;
      row.style.display = firstWord(nameText) === q ? '' : 'none';
    });
  }

  function applyRequestsSearch(){
    const q = getSearchValue('requests');
    const cards = document.querySelectorAll('#requestsContainer .admin-request-card, #requestsContainer article');

    cards.forEach(function(card){
      if(!q){
        card.style.display = '';
        return;
      }

      const nameEl = card.querySelector('.request-card-top h4, h4');
      const nameText = nameEl ? nameEl.textContent : '';
      card.style.display = firstWord(nameText) === q ? '' : 'none';
    });
  }

  function applyAll(){
    applyUsersSearch();
    applyRequestsSearch();
  }

  const oldSearchRequests = window.searchRequests;
  window.searchRequests = function(value){
    if(typeof oldSearchRequests === 'function') oldSearchRequests(value);
    setTimeout(applyRequestsSearch, 0);
    setTimeout(applyRequestsSearch, 80);
  };

  const oldLoadRequests = window.loadRequests;
  window.loadRequests = function(){
    if(typeof oldLoadRequests === 'function') oldLoadRequests();
    setTimeout(applyRequestsSearch, 0);
    setTimeout(applyRequestsSearch, 80);
  };

  document.addEventListener('input', function(e){
    if(e.target && e.target.closest('#users')){
      setTimeout(applyUsersSearch, 0);
      setTimeout(applyUsersSearch, 80);
    }
    if(e.target && e.target.closest('#requests')){
      setTimeout(applyRequestsSearch, 0);
      setTimeout(applyRequestsSearch, 80);
    }
  }, true);

  document.addEventListener('keyup', function(e){
    if(e.target && (e.target.closest('#users') || e.target.closest('#requests'))){
      setTimeout(applyAll, 0);
      setTimeout(applyAll, 80);
    }
  }, true);

  const oldShowPage = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof oldShowPage === 'function') oldShowPage(id, clickedItem);
    setTimeout(applyAll, 100);
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(applyAll, 300);
    setTimeout(applyAll, 1000);
  });
})();


/* ===== FINAL FIX: USERS PAGE SEARCH BY DISPLAYED USER NAME ONLY ===== */
(function(){
  function clean(v){
    return String(v || '').toLowerCase().trim();
  }

  function getUsersSearch(){
    const section = document.getElementById('users');
    if(!section) return '';
    const input = section.querySelector('input[type="search"], input[type="text"], input');
    return clean(input && input.value);
  }

  function getDisplayedUserName(row){
    const firstCell = row.querySelector('td:first-child');
    if(!firstCell) return '';

    const clone = firstCell.cloneNode(true);

    // Remove avatar/initial blocks so "A" does not become the searched name.
    clone.querySelectorAll('.avatar, .user-avatar, .initials, .user-initial, span:first-child').forEach(el => el.remove());

    // Prefer the bold/display name if it exists.
    const nameEl =
      firstCell.querySelector('strong') ||
      firstCell.querySelector('h4') ||
      firstCell.querySelector('.user-name') ||
      firstCell.querySelector('.name');

    if(nameEl) return clean(nameEl.textContent);

    // Fallback: remove usernames like @raghadd, then use remaining text.
    return clean(clone.textContent.replace(/@\S+/g, ''));
  }

  function firstNameOnly(name){
    return clean(name).split(/\s+/).filter(Boolean)[0] || '';
  }

  function applyUsersSearch(){
    const q = getUsersSearch();
    const rows = document.querySelectorAll('#users table tbody tr, #adminUsersBox tbody tr');

    rows.forEach(function(row){
      if(!q){
        row.style.display = '';
        return;
      }

      const name = getDisplayedUserName(row);
      row.style.display = firstNameOnly(name) === q ? '' : 'none';
    });
  }

  document.addEventListener('input', function(e){
    if(e.target && e.target.closest('#users')){
      setTimeout(applyUsersSearch, 0);
      setTimeout(applyUsersSearch, 100);
    }
  }, true);

  document.addEventListener('keyup', function(e){
    if(e.target && e.target.closest('#users')){
      setTimeout(applyUsersSearch, 0);
      setTimeout(applyUsersSearch, 100);
    }
  }, true);

  const oldShowPageUsersFix = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof oldShowPageUsersFix === 'function') oldShowPageUsersFix(id, clickedItem);
    if(id === 'users'){
      setTimeout(applyUsersSearch, 100);
      setTimeout(applyUsersSearch, 500);
    }
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(applyUsersSearch, 500);
    setTimeout(applyUsersSearch, 1200);
  });
})();

/* =========================================================
   RELEAF PROFESSIONAL SYNC PATCH
   One shared data source for Customer + Admin: releaf_requests_v1
   This final block intentionally overrides earlier duplicated helpers.
   ========================================================= */
(function(){
  'use strict';
  const REQUESTS_KEY = 'releaf_requests_v1';
  const USERS_KEY = 'users';
  const CLOSED = new Set(['completed','complete','done','finished','delivered','canceled','cancelled']);

  function safeJson(key, fallback){
    try { const parsed = JSON.parse(localStorage.getItem(key) || 'null'); return parsed == null ? fallback : parsed; }
    catch(e){ return fallback; }
  }
  function saveJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function esc(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function lang(){ return (localStorage.getItem('releaf_language_v1') || localStorage.getItem('lang') || document.documentElement.lang || 'en') === 'ar' ? 'ar' : 'en'; }
  function label(en, ar){ return lang() === 'ar' ? ar : en; }
  function normalizeStatus(status){ return String(status || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_'); }
  function displayStatus(status){
    const s = normalizeStatus(status);
    const map = {
      sent: [label('Awaiting Approval','بانتظار الموافقة'), 'pending'],
      pending: [label('Awaiting Approval','بانتظار الموافقة'), 'pending'],
      approved: [label('Approved','تمت الموافقة'), 'approved'],
      assigned: [label('Assigned','تم التعيين'), 'approved'],
      driver_en_route: [label('Driver En Route','السائق بالطريق'), 'approved'],
      completed: [label('Completed','مكتمل'), 'completed'],
      canceled: [label('Canceled','ملغي'), 'canceled'],
      cancelled: [label('Canceled','ملغي'), 'canceled']
    };
    return map[s] || [s.replace(/_/g,' '), 'pending'];
  }
  function readRequests(){
    const list = safeJson(REQUESTS_KEY, []);
    return Array.isArray(list) ? list.filter(r => r && r.id).sort((a,b) => (Date.parse(b.createdAt || b.requestDate || '') || 0) - (Date.parse(a.createdAt || a.requestDate || '') || 0)) : [];
  }
  function writeRequests(list){ saveJson(REQUESTS_KEY, Array.isArray(list) ? list : []); }
  function registeredUsers(){ const list = safeJson(USERS_KEY, []); return Array.isArray(list) ? list : []; }
  function statusClass(status){ return displayStatus(status)[1]; }
  function requestOwner(r){ return r.ownerName || r.name || r.ownerUsername || r.username || r.ownerEmail || label('Unknown customer','مستخدم غير معروف'); }
  function requestLocation(r){ return [r.province, r.district].filter(Boolean).join(' / ') || r.location || '-'; }
  function requestPhone(r){ return r.ownerPhone || r.phone || '-'; }
  function activeRequests(){ return readRequests().filter(r => !CLOSED.has(normalizeStatus(r.status))); }
  function completedRequests(){ return readRequests().filter(r => normalizeStatus(r.status) === 'completed'); }

  window.releafReadAdminRequests = readRequests;
  window.releafSaveAdminRequests = writeRequests;

  window.renderRows = function(list){
    const table = document.querySelector('#dashboard tbody, tbody');
    if(!table) return;
    const rows = Array.isArray(list) ? list : readRequests();
    table.innerHTML = '';
    if(!rows.length){ table.innerHTML = '<tr><td colspan="4" class="empty-row">' + esc(label('No requests yet','لا توجد طلبات بعد')) + '</td></tr>'; return; }
    rows.slice(0, 8).forEach(r => {
      const st = displayStatus(r.status);
      table.insertAdjacentHTML('beforeend', '<tr><td>' + esc(requestOwner(r)) + '</td><td>' + esc(r.type || '-') + '</td><td>' + esc(Number(r.weight || 0).toFixed(1)) + 'kg</td><td><span class="status ' + esc(st[1]) + '">' + esc(st[0]) + '</span></td></tr>');
    });
  };

  window.loadTable = function(){ renderRows(readRequests()); };
  window.searchUsers = function(){
    const input = document.getElementById('searchBox');
    const q = String(input && input.value || '').toLowerCase();
    renderRows(readRequests().filter(r => [requestOwner(r), r.type, r.status, requestLocation(r)].join(' ').toLowerCase().includes(q)));
  };
  window.filterData = function(type){
    const all = readRequests();
    const now = new Date();
    let filtered = all;
    if(type === 'today') filtered = all.filter(r => new Date(r.createdAt || r.requestDate || 0).toDateString() === now.toDateString());
    if(type === 'week') filtered = all.filter(r => now - new Date(r.createdAt || r.requestDate || 0) <= 7 * 24 * 60 * 60 * 1000);
    renderRows(filtered);
    if(typeof initCharts === 'function') try { initCharts(filtered); } catch(e) {}
  };
  window.updateCards = function(){
    const cards = document.querySelectorAll('.dashboard-cards .card p');
    const all = readRequests();
    if(cards.length >= 4){
      cards[0].innerText = registeredUsers().length;
      cards[1].innerText = all.length;
      cards[2].innerText = completedRequests().length;
      cards[3].innerText = activeRequests().length;
    }
  };
  window.updateInsights = function(){
    const all = readRequests();
    const topMaterialEl = document.getElementById('topMaterial');
    const trendEl = document.getElementById('requestsTrend');
    const topUserEl = document.getElementById('topUser');
    if(!all.length){
      if(topMaterialEl) topMaterialEl.innerText = label('Top Material: --','أكثر مادة: --');
      if(trendEl) trendEl.innerText = label('Requests: 0','الطلبات: 0');
      if(topUserEl) topUserEl.innerText = label('Top User: --','أفضل مستخدم: --');
      return;
    }
    const counts = all.reduce((acc,r) => { const key = r.type || '-'; acc[key] = (acc[key] || 0) + 1; return acc; }, {});
    const topMaterial = Object.keys(counts).sort((a,b) => counts[b] - counts[a])[0] || '--';
    const weightByUser = all.reduce((acc,r) => { const owner = requestOwner(r); acc[owner] = (acc[owner] || 0) + (Number(r.weight) || 0); return acc; }, {});
    const topUser = Object.keys(weightByUser).sort((a,b) => weightByUser[b] - weightByUser[a])[0] || '--';
    if(topMaterialEl) topMaterialEl.innerText = label('Top Material: ','أكثر مادة: ') + topMaterial;
    if(trendEl) trendEl.innerText = label('Requests: ','الطلبات: ') + all.length;
    if(topUserEl) topUserEl.innerText = label('Top User: ','أفضل مستخدم: ') + topUser;
  };

  window.renderFilteredRequests = function(list){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    const rows = Array.isArray(list) ? list : readRequests();
    container.innerHTML = '';
    if(!rows.length){ container.innerHTML = '<div class="card empty-row">' + esc(label('No requests found','لم يتم العثور على طلبات')) + '</div>'; return; }
    rows.forEach(r => {
      const st = displayStatus(r.status);
      const id = esc(r.id);
      container.insertAdjacentHTML('beforeend', `
        <article class="card admin-request-card">
          <div class="admin-request-head">
            <span class="status ${esc(st[1])}">${esc(st[0])}</span>
            <strong>${id}</strong>
          </div>
          <h4>${esc(requestOwner(r))}</h4>
          <p><b>${esc(label('Material','المادة'))}:</b> ${esc(r.type || '-')} · ${esc(Number(r.weight || 0).toFixed(1))}kg</p>
          <p><b>${esc(label('Collection','الجمع'))}:</b> ${esc(r.requestDate || r.collectionDate || '-')} ${esc(r.availableSlot || '')}</p>
          <p><b>${esc(label('Location','الموقع'))}:</b> ${esc(requestLocation(r))}</p>
          <p><b>${esc(label('Phone','الهاتف'))}:</b> ${esc(requestPhone(r))}</p>
          ${r.notes ? '<p><b>' + esc(label('Notes','ملاحظات')) + ':</b> ' + esc(r.notes) + '</p>' : ''}
          <div class="admin-request-actions">
            <button type="button" onclick="setRequestStatus('${id}','approved')">${esc(label('Approve','قبول'))}</button>
            <button type="button" onclick="setRequestStatus('${id}','driver_en_route')">${esc(label('Driver en route','السائق بالطريق'))}</button>
            <button type="button" onclick="setRequestStatus('${id}','completed')">${esc(label('Complete','إنهاء'))}</button>
            <button type="button" class="danger" onclick="setRequestStatus('${id}','canceled')">${esc(label('Cancel','إلغاء'))}</button>
          </div>
        </article>`);
    });
  };
  window.loadRequests = function(){ renderFilteredRequests(readRequests()); updateCards(); updateInsights(); };
  window.searchRequests = function(value){
    const q = String(value || '').toLowerCase();
    renderFilteredRequests(readRequests().filter(r => [requestOwner(r), r.type, r.status, requestLocation(r), requestPhone(r), r.id].join(' ').toLowerCase().includes(q)));
  };
  window.filterRequests = function(status){
    const all = readRequests();
    if(!status || status === 'all') return renderFilteredRequests(all);
    renderFilteredRequests(all.filter(r => normalizeStatus(r.status) === normalizeStatus(status)));
  };
  window.setRequestStatus = function(id, status){
    const cleanId = String(id || '').replace(/&#35;/g, '#');
    const all = readRequests().map(r => String(r.id) === cleanId ? Object.assign({}, r, { status, adminUpdatedAt: new Date().toISOString(), adminName: localStorage.getItem('adminName') || 'Admin' }) : r);
    writeRequests(all);
    loadRequests();
    loadTable();
    updateCards();
    updateInsights();
  };
  window.cancelRequest = function(id){ setRequestStatus(id, 'canceled'); };
  window.downloadReport = function(){
    const headers = ['ID','Customer','Email','Phone','Material','Weight','Status','Date','Time','Location','Notes'];
    const lines = [headers.join(',')].concat(readRequests().map(r => [r.id, requestOwner(r), r.ownerEmail || '', requestPhone(r), r.type || '', r.weight || 0, normalizeStatus(r.status), r.requestDate || r.collectionDate || '', r.availableSlot || '', requestLocation(r), r.notes || ''].map(v => '"' + String(v).replace(/"/g,'""') + '"').join(',')));
    const blob = new Blob([lines.join('\n')], {type:'text/csv;charset=utf-8'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'releaf-admin-report.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  document.addEventListener('DOMContentLoaded', function(){
    try { loadTable(); loadRequests(); updateCards(); updateInsights(); } catch(e) { console.warn('Admin sync init skipped:', e); }
  });
})();

/* =========================================================
   PROFESSIONAL ADMIN OPERATIONS BOARD — FINAL OVERRIDE
   Keeps customer/admin sync through releaf_requests_v1 and restores
   realistic admin workflow: handled-by, driver name/phone, pickup date/time,
   priority, internal/admin note, and visible assignment summary.
========================================================= */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad', 'Raneem', 'Mayar'];
  let searchValue = '';
  let filterValue = 'all';

  function lang(){ return (typeof currentLang === 'function' ? currentLang() : localStorage.getItem('lang') || 'en'); }
  function ar(){ return lang() === 'ar'; }
  function tx(en, arabic){ return ar() ? arabic : en; }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function safeId(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function readRaw(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function writeRaw(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); window.dispatchEvent(new Event('storage')); }
  function normStatus(s){
    s = String(s || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if(['pending','new','created','submitted'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved','approved_by_admin'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_the_way'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished','delivered'].includes(s)) return 'completed';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function labelStatus(s){
    s = normStatus(s);
    const labels = {
      sent: tx('Awaiting approval','بانتظار الموافقة'),
      approved: tx('Approved / handled','تمت الموافقة'),
      driver_en_route: tx('Driver assigned','تم تعيين السائق'),
      completed: tx('Completed','مكتمل'),
      canceled: tx('Canceled','ملغى')
    };
    return labels[s] || s;
  }
  function clsStatus(s){
    s = normStatus(s);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'canceled';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    return 'pending';
  }
  function prettyDate(iso){
    if(!iso) return '--';
    const d = new Date(iso);
    if(Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(ar() ? 'ar-JO' : 'en-GB', {year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit'});
  }
  function normalize(item, i){
    const id = item.id || item.requestId || ('REQ-' + String(i + 1).padStart(4, '0'));
    const status = normStatus(item.status);
    return {
      ...item,
      id,
      status,
      ownerName: item.ownerName || item.name || item.customerName || item.ownerUsername || 'Customer',
      ownerUsername: item.ownerUsername || item.username || '',
      ownerEmail: item.ownerEmail || item.email || '',
      ownerPhone: item.ownerPhone || item.phone || '',
      type: item.type || item.paperType || item.material || 'Paper',
      weight: Number(item.weight || item.estimatedWeight || 0),
      action: item.action || item.actionType || '',
      province: item.province || item.profileProvince || item.city || '',
      district: item.district || item.area || '',
      requestDate: item.requestDate || item.collectionDate || item.preferredDate || item.pickupDate || item.selectedDate || '',
      availableSlot: item.availableSlot || item.preferredTime || item.pickupTime || item.selectedTime || '',
      createdAt: item.createdAt || item.created || '',
      driverPhone: item.driverPhone || item.driverMobile || '',
      scheduledDate: item.scheduledDate || item.adminScheduledDate || '',
      scheduledTime: item.scheduledTime || item.adminScheduledTime || item.eta || item.pickupEta || '',
      adminName: item.adminName || item.handledBy || '',
      adminNote: item.adminNote || item.internalNote || '',
      priority: item.priority || 'normal'
    };
  }
  function all(){ return readRaw().map(normalize); }
  function cleanList(list){
    const out = [];
    list.flat(Infinity).forEach(v => {
      String(v || '').split(',').forEach(part => {
        const x = part.trim();
        if(x && !out.includes(x)) out.push(x);
      });
    });
    return out;
  }
  function splitSlots(v){
    const raw = String(v || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(end <= start) return [raw];
    const pad = n => String(n).padStart(2, '0');
    const fmt = n => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;
    const out = [];
    while(start < end){ const next = Math.min(start + 60, end); out.push(`${fmt(start)}-${fmt(next)}`); start = next; }
    return out;
  }
  function dateOptions(r){ return cleanList([r.requestDate, r.collectionDate, r.preferredDate, r.pickupDate, r.selectedDate, r.scheduleDate, r.scheduledDate]); }
  function timeOptions(r){
    const base = cleanList([r.availableSlot, r.preferredTime, r.pickupTime, r.selectedTime, r.scheduleTime, r.availableSlots || [], r.preferredSlots || [], r.scheduledTime]);
    const out = [];
    base.forEach(v => splitSlots(v).forEach(x => { if(!out.includes(x)) out.push(x); }));
    return out;
  }
  function select(id, options, selected, empty, disabled){
    const opts = cleanList(options);
    const disabledAttr = disabled || !opts.length ? 'disabled' : '';
    const chosen = opts.includes(selected) ? selected : (selected || opts[0] || '');
    return `<select id="${esc(id)}" ${disabledAttr}><option value="">${esc(empty)}</option>${opts.map(o => `<option value="${esc(o)}" ${o === chosen ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function adminOptions(id, selected, disabled){
    const stored = (localStorage.getItem('adminName') || '').trim();
    const names = cleanList([stored && stored.toLowerCase() !== 'admin' ? stored : '', ADMINS]);
    return `<select id="${esc(id)}" ${disabled}><option value="">${tx('Choose handling admin','اختاري الأدمن المسؤول')}</option>${names.map(n => `<option value="${esc(n)}" ${String(selected || '').toLowerCase() === n.toLowerCase() ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  }
  function matches(r){
    const q = searchValue.trim().toLowerCase();
    const statusOk = filterValue === 'all' || normStatus(r.status) === filterValue;
    const text = [r.id,r.ownerName,r.ownerUsername,r.ownerEmail,r.ownerPhone,r.type,r.action,r.province,r.district,r.driverName,r.driverPhone,r.adminName,r.adminNote,r.priority].join(' ').toLowerCase();
    return statusOk && (!q || text.includes(q));
  }
  function statusSteps(status){
    const s = normStatus(status);
    const order = ['sent','approved','driver_en_route','completed'];
    const index = s === 'canceled' ? -1 : order.indexOf(s);
    return order.map((step, i) => `<span class="ops-step ${i <= index ? 'active' : ''}">${labelStatus(step)}</span>`).join('');
  }
  function renderCards(){
    const oldLive = document.getElementById('adminLiveRequestsBox');
    if(oldLive) oldLive.remove();
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    const list = all().slice().reverse().filter(matches);
    if(!list.length){ container.innerHTML = `<div class="admin-empty-state">${tx('No matching requests yet.','لا توجد طلبات مطابقة حالياً.')}</div>`; return; }
    container.innerHTML = list.map(r => {
      const sid = safeId(r.id);
      const disabled = normStatus(r.status) === 'canceled' || normStatus(r.status) === 'completed' ? 'disabled' : '';
      const dates = dateOptions(r);
      const times = timeOptions(r);
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      const scheduledDate = r.scheduledDate || r.adminScheduledDate || r.requestDate || '';
      const scheduledTime = r.scheduledTime || r.adminScheduledTime || r.eta || r.availableSlot || '';
      const assigned = r.adminName || r.handledBy || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote || r.priority !== 'normal';
      return `<article class="ops-request-card" data-request-id="${esc(r.id)}">
        <div class="ops-card-header">
          <div>
            <span class="ops-request-id">${esc(r.id)}</span>
            <h4>${esc(r.ownerName)}</h4>
            <p>${esc([r.ownerEmail, r.ownerPhone].filter(Boolean).join(' · ') || '--')}</p>
          </div>
          <div class="ops-status-stack">
            <span class="status ${clsStatus(r.status)}">${labelStatus(r.status)}</span>
            <small>${tx('Created','أُنشئ')}: ${esc(prettyDate(r.createdAt))}</small>
          </div>
        </div>

        <div class="ops-progress">${statusSteps(r.status)}</div>

        <div class="ops-info-grid">
          <span><strong>${tx('Material','المادة')}</strong>${esc(r.type)}</span>
          <span><strong>${tx('Weight','الوزن')}</strong>${Number(r.weight).toFixed(1).replace(/\.0$/,'')} kg</span>
          <span><strong>${tx('Action','الإجراء')}</strong>${esc(r.action || '--')}</span>
          <span><strong>${tx('Location','الموقع')}</strong>${esc(loc)}</span>
          <span><strong>${tx('Customer date','تاريخ العميل')}</strong>${esc(r.requestDate || '--')}</span>
          <span><strong>${tx('Customer time','وقت العميل')}</strong>${esc(r.availableSlot || '--')}</span>
        </div>

        ${r.notes ? `<div class="ops-note"><strong>${tx('Customer note','ملاحظة العميل')}:</strong> ${esc(r.notes)}</div>` : ''}

        <div class="ops-assignment-panel">
          <div class="ops-field"><label>${tx('Handled by admin','الأدمن المسؤول')}</label>${adminOptions('handler_' + sid, r.adminName || r.handledBy, disabled)}<button ${disabled} onclick="saveRequestField('${esc(r.id)}','handler')">${tx('Save handler','حفظ المسؤول')}</button></div>
          <div class="ops-field ops-two-inputs"><label>${tx('Driver details','بيانات السائق')}</label><input ${disabled} id="driver_${sid}" value="${esc(r.driverName || '')}" placeholder="${tx('Driver name','اسم السائق')}"><input ${disabled} id="driverPhone_${sid}" value="${esc(r.driverPhone || '')}" placeholder="${tx('Driver phone','رقم السائق')}"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','driver')">${tx('Assign driver','تعيين السائق')}</button></div>
          <div class="ops-field"><label>${tx('Pickup date','تاريخ الاستلام')}</label>${select('date_' + sid, dates.length ? dates : [scheduledDate].filter(Boolean), scheduledDate, tx('Choose date','اختاري التاريخ'), disabled)}<button ${disabled} onclick="saveRequestField('${esc(r.id)}','date')">${tx('Save date','حفظ التاريخ')}</button></div>
          <div class="ops-field"><label>${tx('Pickup time / ETA','وقت الاستلام')}</label>${select('time_' + sid, times.length ? times : [scheduledTime].filter(Boolean), scheduledTime, tx('Choose time','اختاري الوقت'), disabled)}<button ${disabled} onclick="saveRequestField('${esc(r.id)}','time')">${tx('Save time','حفظ الوقت')}</button></div>
          <div class="ops-field"><label>${tx('Priority','الأولوية')}</label><select ${disabled} id="priority_${sid}"><option value="normal" ${r.priority === 'normal' ? 'selected' : ''}>${tx('Normal','عادي')}</option><option value="high" ${r.priority === 'high' ? 'selected' : ''}>${tx('High','عالي')}</option><option value="urgent" ${r.priority === 'urgent' ? 'selected' : ''}>${tx('Urgent','عاجل')}</option></select><button ${disabled} onclick="saveRequestField('${esc(r.id)}','priority')">${tx('Save priority','حفظ الأولوية')}</button></div>
          <div class="ops-field ops-note-field"><label>${tx('Admin note','ملاحظة الأدمن')}</label><textarea ${disabled} id="note_${sid}" placeholder="${tx('Internal/customer-facing note','ملاحظة داخلية أو للعميل')}">${esc(r.adminNote || '')}</textarea><button ${disabled} onclick="saveRequestField('${esc(r.id)}','note')">${tx('Save note','حفظ الملاحظة')}</button></div>
        </div>

        ${assigned ? `<div class="ops-summary">
          ${(r.adminName || r.handledBy) ? `<span>${tx('Handled by','المسؤول')}: <strong>${esc(r.adminName || r.handledBy)}</strong></span>` : ''}
          ${r.driverName ? `<span>${tx('Driver','السائق')}: <strong>${esc(r.driverName)}</strong></span>` : ''}
          ${r.driverPhone ? `<span>${tx('Driver phone','رقم السائق')}: <strong>${esc(r.driverPhone)}</strong></span>` : ''}
          ${scheduledDate ? `<span>${tx('Pickup date','تاريخ الاستلام')}: <strong>${esc(scheduledDate)}</strong></span>` : ''}
          ${scheduledTime ? `<span>${tx('Pickup time','وقت الاستلام')}: <strong>${esc(scheduledTime)}</strong></span>` : ''}
          ${r.priority && r.priority !== 'normal' ? `<span>${tx('Priority','الأولوية')}: <strong>${esc(r.priority)}</strong></span>` : ''}
          ${r.adminNote ? `<span>${tx('Note','ملاحظة')}: <strong>${esc(r.adminNote)}</strong></span>` : ''}
        </div>` : ''}

        <div class="ops-actions">
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','approved')">${tx('Approve','موافقة')}</button>
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','driver_en_route')">${tx('Driver en route','السائق بالطريق')}</button>
          <button ${disabled} onclick="setRequestStatus('${esc(r.id)}','completed')">${tx('Complete','إكمال')}</button>
          <button ${disabled} class="danger" onclick="setRequestStatus('${esc(r.id)}','canceled')">${tx('Cancel request','إلغاء الطلب')}</button>
        </div>
      </article>`;
    }).join('');
  }
  function save(id, mode, statusOverride){
    const sid = safeId(id);
    const raw = readRaw();
    const next = raw.map((item, i) => {
      const r = normalize(item, i);
      if(String(r.id) !== String(id)) return item;
      const handler = document.getElementById('handler_' + sid)?.value || r.adminName || r.handledBy || (localStorage.getItem('adminName') || '').trim() || '';
      const driverName = document.getElementById('driver_' + sid)?.value.trim() || r.driverName || '';
      const driverPhone = document.getElementById('driverPhone_' + sid)?.value.trim() || r.driverPhone || '';
      const scheduledDate = document.getElementById('date_' + sid)?.value || r.scheduledDate || r.requestDate || '';
      const scheduledTime = document.getElementById('time_' + sid)?.value || r.scheduledTime || r.availableSlot || '';
      const priority = document.getElementById('priority_' + sid)?.value || r.priority || 'normal';
      const note = document.getElementById('note_' + sid)?.value.trim() || r.adminNote || '';
      const out = {...item, id: r.id, updatedAt: new Date().toISOString(), adminUpdatedAt: new Date().toISOString()};
      if(mode === 'handler' || statusOverride === 'approved' || statusOverride === 'driver_en_route' || statusOverride === 'completed'){
        out.adminName = handler || r.adminName || 'Admin';
        out.handledBy = out.adminName;
      }
      if(mode === 'driver' || statusOverride === 'driver_en_route' || statusOverride === 'completed'){
        out.driverName = driverName;
        out.driverPhone = driverPhone;
        out.driverMobile = driverPhone;
      }
      if(mode === 'date' || statusOverride === 'driver_en_route' || statusOverride === 'completed'){
        out.scheduledDate = scheduledDate;
        out.adminScheduledDate = scheduledDate;
      }
      if(mode === 'time' || statusOverride === 'driver_en_route' || statusOverride === 'completed'){
        out.scheduledTime = scheduledTime;
        out.adminScheduledTime = scheduledTime;
        out.eta = scheduledTime;
        out.pickupEta = scheduledTime;
      }
      if(mode === 'priority') out.priority = priority;
      if(mode === 'note') { out.adminNote = note; out.internalNote = note; }
      if(statusOverride) out.status = normStatus(statusOverride);
      else if(mode === 'handler') out.status = 'approved';
      else if(mode === 'driver') out.status = 'driver_en_route';
      return out;
    });
    writeRaw(next);
    renderCards();
    if(typeof window.loadTable === 'function') window.loadTable();
    if(typeof window.updateCards === 'function') window.updateCards();
    if(typeof window.renderReports === 'function') window.renderReports();
    notify(tx('Request updated','تم تحديث الطلب'));
  }
  function notify(msg){
    let el = document.getElementById('adminRequestToast');
    if(!el){ el = document.createElement('div'); el.id = 'adminRequestToast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800);
  }
  window.loadRequests = renderCards;
  window.searchRequests = function(v){ searchValue = String(v || ''); renderCards(); };
  window.filterRequests = function(v){ filterValue = v === 'all' ? 'all' : normStatus(v); renderCards(); };
  window.saveRequestField = function(id, mode){ save(id, mode, null); };
  window.setRequestStatus = function(id, status){ save(id, 'status', status); };
  window.cancelRequest = function(id){ save(id, 'status', 'canceled'); };
  const previousShowPage = window.showPage;
  window.showPage = function(id, clickedItem){
    if(typeof previousShowPage === 'function') previousShowPage(id, clickedItem);
    if(id === 'requests') setTimeout(renderCards, 0);
  };
  document.addEventListener('DOMContentLoaded', function(){
    const search = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(search){ search.oninput = function(){ window.searchRequests(this.value); }; search.onkeyup = null; }
    if(filter){ filter.onchange = function(){ window.filterRequests(this.value); }; }
    setTimeout(renderCards, 250);
  });
})();

/* =========================================================
   FINAL ADMIN REQUEST FIX — newest first + one-hour driver arrival slots
   Keeps the existing design/classes and only replaces request behavior.
   ========================================================= */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad','Raneem','Mayar'];
  let searchValue = '';
  let statusValue = 'all';

  function readRaw(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function writeRaw(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function safeId(id){ return String(id || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function normStatus(s){
    s = String(s || 'sent').toLowerCase().trim().replace(/[\s-]+/g,'_');
    if(['pending','awaiting','awaiting_approval','waiting_approval','new','created'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_route'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished'].includes(s)) return 'completed';
    if(['cancelled','cancel'].includes(s)) return 'canceled';
    return s;
  }
  function label(s){
    s = normStatus(s);
    return s === 'completed' ? 'Completed' : s === 'canceled' ? 'Canceled' : s === 'driver_en_route' ? 'Driver En Route' : s === 'approved' ? 'Approved' : 'Awaiting Approval';
  }
  function cls(s){
    s = normStatus(s);
    if(s === 'completed') return 'completed';
    if(s === 'canceled') return 'canceled';
    if(s === 'approved' || s === 'driver_en_route') return 'approved';
    return 'pending';
  }
  function normalize(r, i){
    return {
      ...r,
      id: r.id || ('REQ-' + (i + 1)),
      status: normStatus(r.status),
      ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
      ownerEmail: r.ownerEmail || r.email || '',
      ownerPhone: r.ownerPhone || r.phone || '',
      type: r.type || r.paperType || r.material || 'Paper',
      weight: Number(r.weight || 0),
      province: r.province || r.profileProvince || '',
      district: r.district || '',
      action: r.action || '',
      notes: r.notes || r.note || ''
    };
  }
  function createdTime(r){
    const parsed = Date.parse(r.createdAt || r.requestCreatedAt || r.submittedAt || r.created || '');
    if(parsed) return parsed;
    const idMatch = String(r.id || '').match(/(\d{10,})/);
    return idMatch ? Number(idMatch[1]) : 0;
  }
  function requests(){
    return readRaw().map(normalize).sort((a,b) => createdTime(b) - createdTime(a));
  }
  function cleanList(values){
    const out = [];
    values.flat(Infinity).forEach(v => { v = String(v || '').trim(); if(v && !out.includes(v)) out.push(v); });
    return out;
  }
  function dateOptions(r){ return cleanList([r.requestDate, r.collectionDate, r.preferredDate, r.pickupDate, r.selectedDate, r.scheduleDate, r.scheduledDate]); }
  function splitHourlySlots(v){
    const raw = String(v || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return [raw];
    const pad = n => String(n).padStart(2,'0');
    const fmt = n => `${pad(Math.floor(n/60))}:${pad(n%60)}`;
    const out = [];
    while(start < end){ const next = Math.min(start + 60, end); out.push(`${fmt(start)}-${fmt(next)}`); start = next; }
    return out;
  }
  function timeOptions(r){
    const base = cleanList([r.availableSlot, r.preferredTime, r.pickupTime, r.selectedTime, r.scheduleTime, r.availableSlots || [], r.preferredSlots || []]);
    const out = [];
    base.forEach(v => splitHourlySlots(v).forEach(slot => { if(!out.includes(slot)) out.push(slot); }));
    return out;
  }
  function selectHtml(id, options, selected, empty, disabled){
    if(!options.length) return `<select id="${id}" disabled><option value="">${esc(empty)}</option></select>`;
    selected = options.includes(selected) ? selected : options[0];
    return `<select id="${id}" ${disabled}>${options.map(o => `<option value="${esc(o)}" ${o === selected ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function matchesFilter(r){
    const st = normStatus(r.status);
    const statusOk = statusValue === 'all' || st === statusValue;
    const q = searchValue.trim().toLowerCase();
    const text = [r.ownerName, r.ownerUsername, r.ownerEmail, r.ownerPhone, r.id].join(' ').toLowerCase();
    return statusOk && (!q || text.includes(q));
  }
  function render(){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    const list = requests().filter(matchesFilter);
    if(!list.length){ container.innerHTML = '<div class="admin-empty-state">No requests found</div>'; return; }
    container.innerHTML = list.map(r => {
      const sid = safeId(r.id);
      const disabled = (normStatus(r.status) === 'canceled' || normStatus(r.status) === 'completed') ? 'disabled' : '';
      const dates = dateOptions(r);
      const times = timeOptions(r);
      const savedDate = dates.includes(r.scheduledDate || r.adminScheduledDate) ? (r.scheduledDate || r.adminScheduledDate) : dates[0];
      const savedTime = times.includes(r.scheduledTime || r.adminScheduledTime || r.eta) ? (r.scheduledTime || r.adminScheduledTime || r.eta) : times[0];
      const handler = r.adminName || r.handledBy || '';
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      return `<article class="admin-request-card">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${cls(r.status)}">${label(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>Material</strong>${esc(r.type)}</span><span><strong>Weight</strong>${Number(r.weight).toFixed(1)}kg</span><span><strong>Action</strong>${esc(r.action || '--')}</span>
          <span><strong>Location</strong>${esc(loc)}</span><span><strong>Customer date</strong>${esc(r.requestDate || r.collectionDate || '--')}</span><span><strong>Customer time</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>Notes:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-panel">
          <div class="admin-control-row"><label>Driver name</label><input ${disabled} id="driver_${sid}" value="${esc(r.driverName || '')}" placeholder="Driver name"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','driver')">Assign driver</button></div>
          <div class="admin-control-row"><label>Driver phone</label><input ${disabled} id="driverPhone_${sid}" value="${esc(r.driverPhone || '')}" placeholder="Driver phone"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','driverPhone')">Save phone</button></div>
          <div class="admin-control-row"><label>Pickup date</label>${selectHtml('date_' + sid, dates, savedDate, 'No customer date', disabled)}<button ${disabled} ${dates.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','date')">Save date</button></div>
          <div class="admin-control-row"><label>Pickup time</label>${selectHtml('time_' + sid, times, savedTime, 'No customer time', disabled)}<button ${disabled} ${times.length ? '' : 'disabled'} onclick="saveRequestField('${esc(r.id)}','time')">Save time</button></div>
          <div class="admin-control-row"><label>Handled by</label><select ${disabled} id="handler_${sid}"><option value="">Choose admin</option>${ADMINS.map(n => `<option value="${n}" ${String(handler).toLowerCase() === n.toLowerCase() ? 'selected' : ''}>${n}</option>`).join('')}</select><button ${disabled} onclick="saveRequestField('${esc(r.id)}','handler')">Handle this request</button></div>
          <div class="admin-control-row admin-control-row-note"><label>Admin note</label><input ${disabled} id="note_${sid}" value="${esc(r.adminNote || '')}" placeholder="Note visible to customer"><button ${disabled} onclick="saveRequestField('${esc(r.id)}','note')">Save note</button></div>
        </div>
        ${(handler || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote) ? `<div class="request-saved-summary">${handler ? `<span>Handled by <strong>${esc(handler)}</strong></span>` : ''}${r.driverName ? `<span>Driver: <strong>${esc(r.driverName)}</strong></span>` : ''}${r.driverPhone ? `<span>Driver phone: <strong>${esc(r.driverPhone)}</strong></span>` : ''}${(r.scheduledDate || r.adminScheduledDate) ? `<span>Pickup date: <strong>${esc(r.scheduledDate || r.adminScheduledDate)}</strong></span>` : ''}${(r.scheduledTime || r.adminScheduledTime || r.eta) ? `<span>Pickup time: <strong>${esc(r.scheduledTime || r.adminScheduledTime || r.eta)}</strong></span>` : ''}${r.adminNote ? `<span>Admin note: <strong>${esc(r.adminNote)}</strong></span>` : ''}</div>` : ''}
        <div class="request-actions"><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','approved')">Approve</button><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','driver_en_route')">Driver En Route</button><button ${disabled} onclick="setRequestStatus('${esc(r.id)}','completed')">Complete</button><button ${disabled} class="danger" onclick="setRequestStatus('${esc(r.id)}','canceled')">Cancel</button></div>
      </article>`;
    }).join('');
  }
  function save(id, mode, statusOverride){
    const sid = safeId(id);
    const raw = readRaw();
    const next = raw.map((item, i) => {
      const r = normalize(item, i);
      if(String(r.id) !== String(id)) return item;
      const dates = dateOptions(r), times = timeOptions(r);
      const chosenDate = document.getElementById('date_' + sid)?.value || r.scheduledDate || r.requestDate || r.collectionDate || '';
      const chosenTime = document.getElementById('time_' + sid)?.value || r.scheduledTime || r.eta || r.availableSlot || '';
      const handler = document.getElementById('handler_' + sid)?.value || r.adminName || r.handledBy || '';
      if(normStatus(item.status) === 'completed') return item;
      const out = {...item, id: r.id, updatedAt: new Date().toISOString()};

      // Status is controlled ONLY by the workflow buttons.
      // Saving driver/admin/date/time/note information must not move the request to another status.
      if(statusOverride){
        out.status = normStatus(statusOverride);
        return out;
      }

      if(mode === 'handler' && handler){ out.adminName = handler; out.handledBy = handler; }
      if(mode === 'driver'){
        out.driverName = document.getElementById('driver_' + sid)?.value || r.driverName || '';
        out.driverPhone = document.getElementById('driverPhone_' + sid)?.value || r.driverPhone || '';
        out.driverMobile = out.driverPhone;
      }
      if(mode === 'driverPhone'){
        out.driverPhone = document.getElementById('driverPhone_' + sid)?.value || r.driverPhone || '';
        out.driverMobile = out.driverPhone;
      }
      if(mode === 'note') out.adminNote = document.getElementById('note_' + sid)?.value || r.adminNote || '';
      if(mode === 'date' && (!dates.length || dates.includes(chosenDate))){ out.scheduledDate = chosenDate; out.adminScheduledDate = chosenDate; }
      if(mode === 'time' && (!times.length || times.includes(chosenTime))){ out.scheduledTime = chosenTime; out.adminScheduledTime = chosenTime; out.eta = chosenTime; }
      return out;
    });
    writeRaw(next);
    render();
    if(typeof window.loadTable === 'function') window.loadTable();
    if(typeof window.updateCards === 'function') window.updateCards();
    window.dispatchEvent(new StorageEvent('storage', {key: REQ_KEY}));
  }
  window.loadRequests = render;
  window.searchRequests = function(value){ searchValue = String(value || ''); render(); };
  window.filterRequests = function(value){ statusValue = value === 'all' ? 'all' : normStatus(value || 'all'); render(); };
  window.saveRequestField = function(id, mode){ save(id, mode, null); };
  window.setRequestStatus = function(id, status){ save(id, 'status', status); };
  window.cancelRequest = function(id){ save(id, 'status', 'canceled'); };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(render, 150); });
})();

/* =========================================================
   ADMIN REQUEST SEARCH / ACTION STABILITY HOTFIX
   - Keeps the current search results after saving driver/admin details.
   - Prevents request buttons from acting like submit buttons.
   - Updates only the clicked request by its exact id.
   - Completed requests stay locked.
========================================================= */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const oldLoadRequests = window.loadRequests;
  const oldSearchRequests = window.searchRequests;
  const oldFilterRequests = window.filterRequests;

  function safeId(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function read(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function write(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function normStatus(s){
    s = String(s || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if(['pending','new','created','submitted'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved','approved_by_admin'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_the_way'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished','delivered'].includes(s)) return 'completed';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function requestId(item, index){ return String(item.id || item.requestId || ('REQ-' + String(index + 1).padStart(4, '0'))); }
  function activeSearch(){
    const box = document.getElementById('searchBox');
    return box ? box.value : '';
  }
  function rerenderKeepingSearch(){
    const q = activeSearch();
    if(q && typeof oldSearchRequests === 'function') oldSearchRequests(q);
    else if(typeof oldLoadRequests === 'function') oldLoadRequests();
    const box = document.getElementById('searchBox');
    if(box) box.value = q;
    try { if(typeof window.updateCards === 'function') window.updateCards(); } catch(e){}
    try { if(typeof window.updateInsights === 'function') window.updateInsights(); } catch(e){}
    try { window.dispatchEvent(new StorageEvent('storage', {key: REQ_KEY})); } catch(e){ window.dispatchEvent(new Event('storage')); }
  }
  function updateOne(id, updater){
    const target = String(id || '');
    let changed = false;
    const list = read().map(function(item, index){
      if(requestId(item, index) !== target) return item;
      if(normStatus(item.status) === 'completed') return item;
      changed = true;
      return updater(Object.assign({}, item, { id: requestId(item, index), updatedAt: new Date().toISOString() }), index) || item;
    });
    if(changed) write(list);
    rerenderKeepingSearch();
  }

  // Important: saving assignment details must not change the request status.
  window.saveRequestField = function(id, mode){
    if(window.event && typeof window.event.preventDefault === 'function') window.event.preventDefault();
    const sid = safeId(id);
    updateOne(id, function(out){
      if(mode === 'driver'){
        const driver = document.getElementById('driver_' + sid);
        const phone = document.getElementById('driverPhone_' + sid);
        out.driverName = driver ? driver.value.trim() : (out.driverName || '');
        if(phone && phone.value.trim()){ out.driverPhone = phone.value.trim(); out.driverMobile = out.driverPhone; }
      }
      if(mode === 'driverPhone'){
        const phone = document.getElementById('driverPhone_' + sid);
        out.driverPhone = phone ? phone.value.trim() : (out.driverPhone || '');
        out.driverMobile = out.driverPhone;
      }
      if(mode === 'handler'){
        const handler = document.getElementById('handler_' + sid);
        out.adminName = handler ? handler.value : (out.adminName || out.handledBy || '');
        out.handledBy = out.adminName;
      }
      if(mode === 'date'){
        const date = document.getElementById('date_' + sid);
        out.scheduledDate = date ? date.value : (out.scheduledDate || out.adminScheduledDate || '');
        out.adminScheduledDate = out.scheduledDate;
      }
      if(mode === 'time'){
        const time = document.getElementById('time_' + sid);
        out.scheduledTime = time ? time.value : (out.scheduledTime || out.adminScheduledTime || out.eta || '');
        out.adminScheduledTime = out.scheduledTime;
        out.eta = out.scheduledTime;
      }
      if(mode === 'note'){
        const note = document.getElementById('note_' + sid);
        out.adminNote = note ? note.value.trim() : (out.adminNote || '');
      }
      return out;
    });
    return false;
  };

  // Status changes happen only from the workflow buttons.
  window.setRequestStatus = function(id, status){
    if(window.event && typeof window.event.preventDefault === 'function') window.event.preventDefault();
    updateOne(id, function(out){ out.status = normStatus(status); out.adminUpdatedAt = new Date().toISOString(); return out; });
    return false;
  };
  window.cancelRequest = function(id){ return window.setRequestStatus(id, 'canceled'); };
  window.searchRequests = function(value){ return oldSearchRequests ? oldSearchRequests(String(value || '')) : undefined; };
  window.filterRequests = function(value){ return oldFilterRequests ? oldFilterRequests(value) : undefined; };

  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest ? e.target.closest('#requestsContainer button') : null;
    if(btn) btn.setAttribute('type', 'button');
  }, true);
})();

/* =========================================================
   REAL FINAL ADMIN REQUEST CLICK STABILITY FIX
   - Uses the correct Requests search box: requestSearchBox.
   - Handles request buttons with one safe delegated handler.
   - Stops older inline/duplicate handlers from also firing.
   - Keeps the current search/filter after every save.
   - Updates only the clicked card's exact request id.
========================================================= */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const baseLoad = window.loadRequests;
  const baseSearch = window.searchRequests;
  const baseFilter = window.filterRequests;

  function read(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function write(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function safeId(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function normalizeStatus(s){
    s = String(s || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if(['pending','new','created','submitted'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved','approved_by_admin'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_the_way'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished','delivered'].includes(s)) return 'completed';
    if(s === 'cancelled') return 'canceled';
    return s;
  }
  function getRealId(item, index){ return String(item && (item.id || item.requestId) || ('REQ-' + (index + 1))); }
  function currentSearch(){
    const requestBox = document.getElementById('requestSearchBox');
    return requestBox ? requestBox.value : '';
  }
  function currentFilter(){
    const filter = document.getElementById('requestStatusFilter');
    return filter ? filter.value : 'all';
  }
  function restoreView(searchText, filterValue){
    const requestBox = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(requestBox) requestBox.value = searchText || '';
    if(filter) filter.value = filterValue || 'all';

    if(typeof baseFilter === 'function') baseFilter(filterValue || 'all');
    else if(typeof baseLoad === 'function') baseLoad();

    if(searchText && typeof baseSearch === 'function') baseSearch(searchText);

    if(requestBox) requestBox.value = searchText || '';
    if(filter) filter.value = filterValue || 'all';

    try { if(typeof window.updateCards === 'function') window.updateCards(); } catch(e){}
    try { if(typeof window.updateInsights === 'function') window.updateInsights(); } catch(e){}
    try { window.dispatchEvent(new StorageEvent('storage', {key: REQ_KEY})); } catch(e){}
  }
  function updateExactRequest(id, updater){
    const target = String(id || '').trim();
    let changed = false;
    const list = read().map(function(item, index){
      const realId = getRealId(item, index);
      if(realId !== target) return item;
      const status = normalizeStatus(item && item.status);
      if(status === 'completed' || status === 'canceled') return item;
      changed = true;
      const copy = Object.assign({}, item, { id: realId, updatedAt: new Date().toISOString() });
      return updater(copy) || copy;
    });
    if(changed) write(list);
  }
  function fieldValue(prefix, id){
    const el = document.getElementById(prefix + '_' + safeId(id));
    return el ? String(el.value || '').trim() : '';
  }
  function saveField(id, mode){
    updateExactRequest(id, function(out){
      if(mode === 'driver'){
        out.driverName = fieldValue('driver', id) || out.driverName || '';
        const phone = fieldValue('driverPhone', id);
        if(phone){ out.driverPhone = phone; out.driverMobile = phone; }
      } else if(mode === 'driverPhone'){
        out.driverPhone = fieldValue('driverPhone', id) || out.driverPhone || '';
        out.driverMobile = out.driverPhone;
      } else if(mode === 'handler'){
        out.adminName = fieldValue('handler', id) || out.adminName || out.handledBy || '';
        out.handledBy = out.adminName;
      } else if(mode === 'date'){
        out.scheduledDate = fieldValue('date', id) || out.scheduledDate || out.adminScheduledDate || '';
        out.adminScheduledDate = out.scheduledDate;
      } else if(mode === 'time'){
        out.scheduledTime = fieldValue('time', id) || out.scheduledTime || out.adminScheduledTime || out.eta || '';
        out.adminScheduledTime = out.scheduledTime;
        out.eta = out.scheduledTime;
      } else if(mode === 'note'){
        out.adminNote = fieldValue('note', id) || out.adminNote || '';
      }
      return out;
    });
  }
  function setStatus(id, status){
    updateExactRequest(id, function(out){
      out.status = normalizeStatus(status);
      out.adminUpdatedAt = new Date().toISOString();
      return out;
    });
  }
  function buttonMode(button){
    const text = String(button.textContent || '').trim().toLowerCase();
    if(text.includes('assign driver') || text.includes('تعيين')) return {type:'field', mode:'driver'};
    if(text.includes('save phone') || text.includes('رقم')) return {type:'field', mode:'driverPhone'};
    if(text.includes('save date') || text.includes('تاريخ')) return {type:'field', mode:'date'};
    if(text.includes('save time') || text.includes('وقت')) return {type:'field', mode:'time'};
    if(text.includes('handle this request') || text.includes('مسؤول')) return {type:'field', mode:'handler'};
    if(text.includes('save note') || text.includes('ملاحظة')) return {type:'field', mode:'note'};
    if(text.includes('driver en route') || text.includes('بالطريق')) return {type:'status', status:'driver_en_route'};
    if(text.includes('approve') || text.includes('موافقة')) return {type:'status', status:'approved'};
    if(text.includes('complete') || text.includes('إكمال')) return {type:'status', status:'completed'};
    if(text.includes('cancel') || text.includes('إلغاء')) return {type:'status', status:'canceled'};
    return null;
  }

  window.saveRequestField = function(id, mode){
    const q = currentSearch();
    const f = currentFilter();
    saveField(id, mode);
    restoreView(q, f);
    return false;
  };
  window.setRequestStatus = function(id, status){
    const q = currentSearch();
    const f = currentFilter();
    setStatus(id, status);
    restoreView(q, f);
    return false;
  };
  window.cancelRequest = function(id){ return window.setRequestStatus(id, 'canceled'); };
  window.searchRequests = function(value){
    const box = document.getElementById('requestSearchBox');
    if(box) box.value = String(value || '');
    if(typeof baseSearch === 'function') return baseSearch(String(value || ''));
  };
  window.filterRequests = function(value){
    const filter = document.getElementById('requestStatusFilter');
    if(filter) filter.value = value || 'all';
    if(typeof baseFilter === 'function') return baseFilter(value || 'all');
  };

  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest ? e.target.closest('#requestsContainer button') : null;
    if(!btn) return;
    const card = btn.closest('.admin-request-card');
    const id = card && card.querySelector('.request-id') ? card.querySelector('.request-id').textContent.trim() : '';
    const action = buttonMode(btn);
    if(!id || !action) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    btn.type = 'button';

    const q = currentSearch();
    const f = currentFilter();
    if(action.type === 'field') saveField(id, action.mode);
    else setStatus(id, action.status);
    restoreView(q, f);
  }, true);

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('#requestsContainer button').forEach(function(btn){ btn.type = 'button'; });
  });
})();

/* =========================================================
   ABSOLUTE FINAL ADMIN SEARCH STABILITY PATCH
   Fixes: saving fields while searched no longer resets results or touches another request.
   Uses link-style actions instead of buttons so older button click handlers cannot fire.
========================================================= */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad','Raneem','Mayar'];
  let searchState = '';
  let filterState = 'all';

  function read(){ try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]') || []; } catch(e){ return []; } }
  function write(list){ localStorage.setItem(REQ_KEY, JSON.stringify(list)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function sid(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function norm(s){
    s = String(s || 'sent').toLowerCase().trim().replace(/[\s-]+/g,'_');
    if(['pending','awaiting','awaiting_approval','waiting_approval','new','created','submitted'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_route','on_the_way'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished','delivered'].includes(s)) return 'completed';
    if(['cancelled','cancel'].includes(s)) return 'canceled';
    return s;
  }
  function label(s){ s = norm(s); return s === 'completed' ? 'Completed' : s === 'canceled' ? 'Canceled' : s === 'driver_en_route' ? 'Driver En Route' : s === 'approved' ? 'Approved' : 'Awaiting Approval'; }
  function cls(s){ s = norm(s); if(s === 'completed') return 'completed'; if(s === 'canceled') return 'canceled'; if(s === 'approved' || s === 'driver_en_route') return 'approved'; return 'pending'; }
  function normalize(r, i){
    return {
      ...r,
      id: String(r.id || r.requestId || ('REQ-' + (i + 1))),
      status: norm(r.status),
      ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
      ownerUsername: r.ownerUsername || r.username || '',
      ownerEmail: r.ownerEmail || r.email || '',
      ownerPhone: r.ownerPhone || r.phone || '',
      type: r.type || r.paperType || r.material || 'Paper',
      weight: Number(r.weight || 0),
      province: r.province || r.profileProvince || '',
      district: r.district || '',
      action: r.action || '',
      notes: r.notes || r.note || '',
      driverPhone: r.driverPhone || r.driverMobile || '',
      scheduledDate: r.scheduledDate || r.adminScheduledDate || '',
      scheduledTime: r.scheduledTime || r.adminScheduledTime || r.eta || r.pickupEta || '',
      adminName: r.adminName || r.handledBy || '',
      adminNote: r.adminNote || r.internalNote || ''
    };
  }
  function createdTime(r){
    const parsed = Date.parse(r.createdAt || r.requestCreatedAt || r.submittedAt || r.created || '');
    if(parsed) return parsed;
    const m = String(r.id || '').match(/(\d{10,})/);
    return m ? Number(m[1]) : 0;
  }
  function clean(values){
    const out = [];
    values.flat(Infinity).forEach(v => String(v || '').split(',').forEach(x => { x = x.trim(); if(x && !out.includes(x)) out.push(x); }));
    return out;
  }
  function splitHour(v){
    const raw = String(v || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(end <= start) return [raw];
    const pad = n => String(n).padStart(2,'0');
    const fmt = n => `${pad(Math.floor(n/60))}:${pad(n%60)}`;
    const out = [];
    while(start < end){ const next = Math.min(start + 60, end); out.push(`${fmt(start)}-${fmt(next)}`); start = next; }
    return out;
  }
  function dates(r){ return clean([r.requestDate, r.collectionDate, r.preferredDate, r.pickupDate, r.selectedDate, r.scheduleDate, r.scheduledDate]); }
  function times(r){
    const out = [];
    clean([r.availableSlot, r.preferredTime, r.pickupTime, r.selectedTime, r.scheduleTime, r.availableSlots || [], r.preferredSlots || [], r.scheduledTime]).forEach(v => splitHour(v).forEach(x => { if(!out.includes(x)) out.push(x); }));
    return out;
  }
  function select(id, options, selected, empty, disabled){
    const opts = clean(options);
    if(!opts.length) return `<select id="${esc(id)}" disabled><option value="">${esc(empty)}</option></select>`;
    const chosen = opts.includes(selected) ? selected : opts[0];
    return `<select id="${esc(id)}" ${disabled}>${opts.map(o => `<option value="${esc(o)}" ${o === chosen ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function matches(r){
    const q = searchState.trim().toLowerCase();
    const okStatus = filterState === 'all' || norm(r.status) === filterState;
    const text = [r.id,r.ownerName,r.ownerUsername,r.ownerEmail,r.ownerPhone,r.type,r.action,r.province,r.district,r.driverName,r.driverPhone,r.adminName,r.adminNote].join(' ').toLowerCase();
    return okStatus && (!q || text.includes(q));
  }
  function actionLink(id, kind, value, text, disabled, danger){
    const off = disabled ? ' aria-disabled="true" tabindex="-1"' : '';
    return `<a href="#" class="admin-action-link ${danger ? 'danger' : ''} ${disabled ? 'disabled' : ''}" data-request-action="${esc(kind)}" data-request-id="${esc(id)}" data-value="${esc(value || '')}"${off}>${esc(text)}</a>`;
  }
  function render(){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    const search = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(search) search.value = searchState;
    if(filter) filter.value = filterState;
    const list = read().map(normalize).sort((a,b) => createdTime(b) - createdTime(a)).filter(matches);
    if(!list.length){ container.innerHTML = '<div class="admin-empty-state">No requests found</div>'; return; }
    container.innerHTML = list.map(r => {
      const safe = sid(r.id);
      const disabled = ['completed','canceled'].includes(norm(r.status));
      const dis = disabled ? 'disabled' : '';
      const ds = dates(r);
      const ts = times(r);
      const chosenDate = ds.includes(r.scheduledDate || r.adminScheduledDate) ? (r.scheduledDate || r.adminScheduledDate) : ds[0];
      const chosenTime = ts.includes(r.scheduledTime || r.adminScheduledTime || r.eta) ? (r.scheduledTime || r.adminScheduledTime || r.eta) : ts[0];
      const handler = r.adminName || r.handledBy || '';
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      const adminOptions = [''].concat(ADMINS).map(n => `<option value="${esc(n)}" ${String(handler).toLowerCase() === n.toLowerCase() ? 'selected' : ''}>${esc(n || 'Choose admin')}</option>`).join('');
      return `<article class="admin-request-card" data-request-id="${esc(r.id)}">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${cls(r.status)}">${label(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>Material</strong>${esc(r.type)}</span><span><strong>Weight</strong>${Number(r.weight).toFixed(1)}kg</span><span><strong>Action</strong>${esc(r.action || '--')}</span>
          <span><strong>Location</strong>${esc(loc)}</span><span><strong>Customer date</strong>${esc(r.requestDate || r.collectionDate || '--')}</span><span><strong>Customer time</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>Notes:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-panel">
          <div class="admin-control-row"><label>Driver name</label><input ${dis} id="driver_${safe}" value="${esc(r.driverName || '')}" placeholder="Driver name (letters only)" oninput="this.value=this.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g,'')">
          <div class="admin-control-row"><label>Driver phone</label><input ${dis} id="driverPhone_${safe}" value="${esc(r.driverPhone || '')}" placeholder="07xxxxxxxx" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
          <div class="admin-control-row"><label>Pickup date</label>${select('date_' + safe, ds, chosenDate, 'No customer date', dis)}${actionLink(r.id,'field','date','Save date',disabled || !ds.length,false)}</div>
          <div class="admin-control-row"><label>Pickup time</label>${select('time_' + safe, ts, chosenTime, 'No customer time', dis)}${actionLink(r.id,'field','time','Save time',disabled || !ts.length,false)}</div>
          <div class="admin-control-row"><label>Handled by</label><select ${dis} id="handler_${safe}">${adminOptions}</select>${actionLink(r.id,'field','handler','Handle this request',disabled,false)}</div>
          <div class="admin-control-row admin-control-row-note"><label>Admin note</label><input ${dis} id="note_${safe}" value="${esc(r.adminNote || '')}" placeholder="Note visible to customer">${actionLink(r.id,'field','note','Save note',disabled,false)}</div>
        </div>
        ${(handler || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote) ? `<div class="request-saved-summary">${handler ? `<span>Handled by <strong>${esc(handler)}</strong></span>` : ''}${r.driverName ? `<span>Driver: <strong>${esc(r.driverName)}</strong></span>` : ''}${r.driverPhone ? `<span>Driver phone: <strong>${esc(r.driverPhone)}</strong></span>` : ''}${r.scheduledDate ? `<span>Pickup date: <strong>${esc(r.scheduledDate)}</strong></span>` : ''}${r.scheduledTime ? `<span>Pickup time: <strong>${esc(r.scheduledTime)}</strong></span>` : ''}${r.adminNote ? `<span>Admin note: <strong>${esc(r.adminNote)}</strong></span>` : ''}</div>` : ''}
        <div class="request-actions">${actionLink(r.id,'status','approved','Approve',disabled,false)}${actionLink(r.id,'status','driver_en_route','Driver En Route',disabled,false)}${actionLink(r.id,'status','completed','Complete',disabled,false)}${actionLink(r.id,'status','canceled','Cancel',disabled,true)}</div>
      </article>`;
    }).join('');
  }
  function update(id, kind, value){
    const safe = sid(id);
    let changed = false;
    const next = read().map((item, i) => {
      const r = normalize(item, i);
      if(String(r.id) !== String(id)) return item;
      if(['completed','canceled'].includes(norm(r.status))) return item;
      const out = {...item, id: r.id, updatedAt: new Date().toISOString(), adminUpdatedAt: new Date().toISOString()};
      if(kind === 'status') { out.status = norm(value); changed = true; return out; }
      if(value === 'handler'){ const v = document.getElementById('handler_' + safe)?.value || ''; out.adminName = v; out.handledBy = v; changed = true; }
      if(value === 'driver'){ out.driverName = document.getElementById('driver_' + safe)?.value || ''; out.driverPhone = document.getElementById('driverPhone_' + safe)?.value || ''; out.driverMobile = out.driverPhone; changed = true; }
      if(value === 'driverPhone'){ out.driverPhone = document.getElementById('driverPhone_' + safe)?.value || ''; out.driverMobile = out.driverPhone; changed = true; }
      if(value === 'date'){ const v = document.getElementById('date_' + safe)?.value || ''; out.scheduledDate = v; out.adminScheduledDate = v; changed = true; }
      if(value === 'time'){ const v = document.getElementById('time_' + safe)?.value || ''; out.scheduledTime = v; out.adminScheduledTime = v; out.eta = v; changed = true; }
      if(value === 'note'){ out.adminNote = document.getElementById('note_' + safe)?.value || ''; out.internalNote = out.adminNote; changed = true; }
      return out;
    });
    if(changed) write(next);
    render();
    try { if(typeof window.loadTable === 'function') window.loadTable(); } catch(e){}
    try { if(typeof window.updateCards === 'function') window.updateCards(); } catch(e){}
    try { if(typeof window.updateInsights === 'function') window.updateInsights(); } catch(e){}
  }
  window.loadRequests = render;
  window.searchRequests = function(v){ searchState = String(v || ''); render(); };
  window.filterRequests = function(v){ filterState = v === 'all' ? 'all' : norm(v || 'all'); render(); };
  window.saveRequestField = function(id, mode){ update(id, 'field', mode); return false; };
  window.setRequestStatus = function(id, status){ update(id, 'status', status); return false; };
  window.cancelRequest = function(id){ update(id, 'status', 'canceled'); return false; };
  document.addEventListener('click', function(e){
    const el = e.target && e.target.closest ? e.target.closest('#requestsContainer [data-request-action]') : null;
    if(!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(el.classList.contains('disabled')) return false;
    const box = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    searchState = box ? box.value : searchState;
    filterState = filter ? filter.value : filterState;
    update(el.getAttribute('data-request-id'), el.getAttribute('data-request-action'), el.getAttribute('data-value'));
    return false;
  }, true);
  document.addEventListener('DOMContentLoaded', function(){
    const box = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(box){ searchState = box.value || ''; box.onkeyup = null; box.oninput = function(){ searchState = this.value; render(); }; }
    if(filter){ filterState = filter.value || 'all'; filter.onchange = function(){ filterState = this.value; render(); }; }
    setTimeout(render, 300);
  });
})();

/* =========================================================
   RELEAF REQUESTS FIREWALL — single source of truth for Admin Requests
   Purpose: prevents older request renderers/click handlers from resetting search
   or updating the wrong card. This block intentionally owns ONLY #requestsContainer.
========================================================= */
(function(){
  'use strict';
  const KEY = 'releaf_requests_v1';
  const ADMINS = ['Raghad', 'Raneem', 'Mayar'];
  const isReqPage = () => !!document.querySelector('#requests.page.active, #requests.active');
  let lastSearch = '';
  let lastFilter = 'all';
  let renderTimer = null;

  function read(){ try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch(e){ return []; } }
  function write(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>\"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
  function sid(v){ return String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); }
  function norm(s){
    s = String(s || 'sent').toLowerCase().trim().replace(/[\s-]+/g, '_');
    if(['pending','awaiting','awaiting_approval','waiting_approval','new','created','submitted','sent'].includes(s)) return 'sent';
    if(['handled','assigned','admin_approved','approved_by_admin','approved'].includes(s)) return 'approved';
    if(['driver','driver_on_the_way','on_route','on_the_way','driver_en_route'].includes(s)) return 'driver_en_route';
    if(['complete','done','finished','delivered','completed'].includes(s)) return 'completed';
    if(['cancelled','cancel','canceled'].includes(s)) return 'canceled';
    return s;
  }
  function label(s){ s = norm(s); return s === 'completed' ? 'Completed' : s === 'canceled' ? 'Canceled' : s === 'driver_en_route' ? 'Driver En Route' : s === 'approved' ? 'Approved' : 'Awaiting Approval'; }
  function cls(s){ s = norm(s); if(s === 'completed') return 'completed'; if(s === 'canceled') return 'canceled'; if(s === 'approved' || s === 'driver_en_route') return 'approved'; return 'pending'; }
  function created(r, i){
    const d = Date.parse(r.createdAt || r.requestCreatedAt || r.submittedAt || r.created || r.date || '');
    if(d) return d;
    const m = String(r.id || r.requestId || '').match(/(\d{10,})/);
    return m ? Number(m[1]) : i;
  }
  function normalizeAll(list){
    let changed = false;
    const out = list.map((r, i) => {
      const id = String(r.id || r.requestId || ('REQ-' + (created(r, i) || i + 1)));
      if(!r.id || r.id !== id) changed = true;
      return {
        ...r,
        id,
        status: norm(r.status),
        ownerName: r.ownerName || r.name || r.fullName || r.ownerUsername || 'Customer',
        ownerUsername: r.ownerUsername || r.username || '',
        ownerEmail: r.ownerEmail || r.email || '',
        ownerPhone: r.ownerPhone || r.phone || '',
        type: r.type || r.paperType || r.material || 'Paper',
        weight: Number(r.weight || 0),
        province: r.province || r.profileProvince || '',
        district: r.district || '',
        action: r.action || '',
        notes: r.notes || r.note || '',
        driverName: r.driverName || '',
        driverPhone: r.driverPhone || r.driverMobile || '',
        scheduledDate: r.scheduledDate || r.adminScheduledDate || '',
        scheduledTime: r.scheduledTime || r.adminScheduledTime || r.eta || r.pickupEta || '',
        adminName: r.adminName || r.handledBy || '',
        adminNote: r.adminNote || r.internalNote || ''
      };
    });
    if(changed) write(out);
    return out;
  }
  function list(){ return normalizeAll(read()).sort((a,b) => created(b,0) - created(a,0)); }
  function compact(values){
    const out = [];
    values.flat(Infinity).forEach(v => String(v || '').split(',').forEach(x => { x = x.trim(); if(x && !out.includes(x)) out.push(x); }));
    return out;
  }
  function splitHour(v){
    const raw = String(v || '').trim();
    const m = raw.match(/^(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})$/);
    if(!m) return raw ? [raw] : [];
    let start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if(end <= start) return [raw];
    const pad = n => String(n).padStart(2,'0');
    const fmt = n => `${pad(Math.floor(n/60))}:${pad(n%60)}`;
    const out = [];
    while(start < end){ const next = Math.min(start + 60, end); out.push(`${fmt(start)}-${fmt(next)}`); start = next; }
    return out;
  }
  function dateOptions(r){ return compact([r.requestDate, r.collectionDate, r.preferredDate, r.pickupDate, r.selectedDate, r.scheduleDate, r.scheduledDate]); }
  function timeOptions(r){
    const out = [];
    compact([r.availableSlot, r.preferredTime, r.pickupTime, r.selectedTime, r.scheduleTime, r.availableSlots || [], r.preferredSlots || [], r.scheduledTime]).forEach(v => splitHour(v).forEach(x => { if(!out.includes(x)) out.push(x); }));
    return out;
  }
  function activeSearch(){
    const box = document.getElementById('requestSearchBox');
    if(box) lastSearch = box.value || '';
    return lastSearch;
  }
  function activeFilter(){
    const f = document.getElementById('requestStatusFilter');
    if(f) lastFilter = f.value || 'all';
    return lastFilter;
  }
  function matches(r){
    const q = activeSearch().trim().toLowerCase();
    const f = activeFilter();
    const ok = f === 'all' || norm(r.status) === norm(f);
    const text = [r.id,r.ownerName,r.ownerUsername,r.ownerEmail,r.ownerPhone,r.type,r.action,r.province,r.district,r.driverName,r.driverPhone,r.adminName,r.adminNote].join(' ').toLowerCase();
    return ok && (!q || text.includes(q));
  }
  function selectHtml(id, values, selected, empty, disabled){
    const opts = compact(values);
    if(!opts.length) return `<select id="${esc(id)}" disabled><option value="">${esc(empty)}</option></select>`;
    const chosen = opts.includes(selected) ? selected : opts[0];
    return `<select id="${esc(id)}" ${disabled ? 'disabled' : ''}>${opts.map(o => `<option value="${esc(o)}" ${o === chosen ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  function action(id, type, value, text, disabled, danger){
    return `<button type="button" class="admin-stable-action ${danger ? 'danger' : ''}" data-stable-action="${esc(type)}" data-request-id="${esc(id)}" data-value="${esc(value || '')}" ${disabled ? 'disabled' : ''}>${esc(text)}</button>`;
  }
  function removeLegacy(){
    const legacy = document.getElementById('adminLiveRequestsBox');
    if(legacy) legacy.remove();
  }
  function render(){
    const container = document.getElementById('requestsContainer');
    if(!container) return;
    removeLegacy();
    const box = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(box && box.value !== lastSearch) box.value = lastSearch;
    if(filter && filter.value !== lastFilter) filter.value = lastFilter;
    const data = list().filter(matches);
    container.setAttribute('data-releaf-stable-owner','1');
    if(!data.length){ container.innerHTML = '<div class="admin-empty-state">No requests found</div>'; return; }
    container.innerHTML = data.map(r => {
      const safe = sid(r.id);
      const locked = ['completed','canceled'].includes(norm(r.status));
      const dates = dateOptions(r);
      const times = timeOptions(r);
      const chosenDate = dates.includes(r.scheduledDate) ? r.scheduledDate : dates[0];
      const chosenTime = times.includes(r.scheduledTime) ? r.scheduledTime : times[0];
      const loc = [r.province, r.district].filter(Boolean).join(' / ') || '--';
      const handler = r.adminName || r.handledBy || '';
      const adminOptions = [''].concat(ADMINS).map(n => `<option value="${esc(n)}" ${String(handler).toLowerCase() === n.toLowerCase() ? 'selected' : ''}>${esc(n || 'Choose admin')}</option>`).join('');
      return `<article class="admin-request-card" data-request-id="${esc(r.id)}">
        <div class="request-card-top"><div><span class="request-id">${esc(r.id)}</span><h4>${esc(r.ownerName)}</h4><p>${esc(r.ownerEmail || r.ownerPhone || '--')}</p></div><span class="status ${cls(r.status)}">${label(r.status)}</span></div>
        <div class="request-meta-grid">
          <span><strong>Material</strong>${esc(r.type)}</span><span><strong>Weight</strong>${Number(r.weight).toFixed(1)}kg</span><span><strong>Action</strong>${esc(r.action || '--')}</span>
          <span><strong>Location</strong>${esc(loc)}</span><span><strong>Customer date</strong>${esc(r.requestDate || r.collectionDate || '--')}</span><span><strong>Customer time</strong>${esc(r.availableSlot || '--')}</span>
        </div>
        ${r.notes ? `<p class="request-note"><strong>Notes:</strong> ${esc(r.notes)}</p>` : ''}
        <div class="request-admin-panel">
          <div class="admin-control-row"><label>Driver name</label><input ${locked ? 'disabled' : ''} id="driver_${safe}" value="${esc(r.driverName || '')}" placeholder="Driver name (letters only)" oninput="this.value=this.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g,'')">${action(r.id,'field','driver','Assign driver',locked,false)}</div>
          <div class="admin-control-row"><label>Driver phone</label><input ${locked ? 'disabled' : ''} id="driverPhone_${safe}" value="${esc(r.driverPhone || '')}" placeholder="07xxxxxxxx" maxlength="10" oninput="this.value=this.value.replace(/[^0-9]/g,'')">${action(r.id,'field','driverPhone','Save phone',locked,false)}</div>
          <div class="admin-control-row"><label>Pickup date</label>${selectHtml('date_' + safe, dates, chosenDate, 'No customer date', locked)}${action(r.id,'field','date','Save date',locked || !dates.length,false)}</div>
          <div class="admin-control-row"><label>Pickup time</label>${selectHtml('time_' + safe, times, chosenTime, 'No customer time', locked)}${action(r.id,'field','time','Save time',locked || !times.length,false)}</div>
          <div class="admin-control-row"><label>Handled by</label><select ${locked ? 'disabled' : ''} id="handler_${safe}">${adminOptions}</select>${action(r.id,'field','handler','Handle this request',locked,false)}</div>
          <div class="admin-control-row admin-control-row-note"><label>Admin note</label><input ${locked ? 'disabled' : ''} id="note_${safe}" value="${esc(r.adminNote || '')}" placeholder="Note visible to customer">${action(r.id,'field','note','Save note',locked,false)}</div>
        </div>
        ${(handler || r.driverName || r.driverPhone || r.scheduledDate || r.scheduledTime || r.adminNote) ? `<div class="request-saved-summary">${handler ? `<span>Handled by <strong>${esc(handler)}</strong></span>` : ''}${r.driverName ? `<span>Driver: <strong>${esc(r.driverName)}</strong></span>` : ''}${r.driverPhone ? `<span>Driver phone: <strong>${esc(r.driverPhone)}</strong></span>` : ''}${r.scheduledDate ? `<span>Pickup date: <strong>${esc(r.scheduledDate)}</strong></span>` : ''}${r.scheduledTime ? `<span>Pickup time: <strong>${esc(r.scheduledTime)}</strong></span>` : ''}${r.adminNote ? `<span>Admin note: <strong>${esc(r.adminNote)}</strong></span>` : ''}</div>` : ''}
        <div class="request-actions">${action(r.id,'status','approved','Approve',locked,false)}${action(r.id,'status','driver_en_route','Driver En Route',locked,false)}${action(r.id,'status','completed','Complete',locked,false)}${action(r.id,'status','canceled','Cancel',locked,true)}</div>
      </article>`;
    }).join('');
  }
  function schedule(){
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 0);
    setTimeout(render, 80);
    setTimeout(render, 260);
  }
  function update(id, type, value){
    activeSearch(); activeFilter();
    const safe = sid(id);
    const next = read().map((item, i) => {
      const r = normalizeAll([item])[0] || item;
      if(String(r.id) !== String(id)) return item;
      if(['completed','canceled'].includes(norm(r.status))) return item;
      const out = {...item, id: r.id, updatedAt: new Date().toISOString(), adminUpdatedAt: new Date().toISOString()};
      if(type === 'status') out.status = norm(value);
      if(type === 'field' && value === 'driver'){
  const rawName = (document.getElementById('driver_' + safe)?.value || '').replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '').trim();
  const rawPhone = (document.getElementById('driverPhone_' + safe)?.value || '').replace(/[^0-9]/g, '');
  if(rawName) out.driverName = rawName;
  if(rawPhone && rawPhone.startsWith('07') && rawPhone.length === 10){ out.driverPhone = rawPhone; out.driverMobile = rawPhone; }
  // Status stays unchanged — admin must separately press "Driver En Route"
}
if(type === 'field' && value === 'driverPhone'){
  const rawPhone = (document.getElementById('driverPhone_' + safe)?.value || '').replace(/[^0-9]/g, '');
  if(rawPhone && rawPhone.startsWith('07') && rawPhone.length === 10){ out.driverPhone = rawPhone; out.driverMobile = rawPhone; }
}
      if(type === 'field' && value === 'date'){ const v = document.getElementById('date_' + safe)?.value || ''; out.scheduledDate = v; out.adminScheduledDate = v; }
      if(type === 'field' && value === 'time'){ const v = document.getElementById('time_' + safe)?.value || ''; out.scheduledTime = v; out.adminScheduledTime = v; out.eta = v; }
      if(type === 'field' && value === 'handler'){ const v = document.getElementById('handler_' + safe)?.value || ''; out.adminName = v; out.handledBy = v; }
      if(type === 'field' && value === 'note'){ const v = document.getElementById('note_' + safe)?.value || ''; out.adminNote = v; out.internalNote = v; }
      return out;
    });
    write(next);
    schedule();
    try { if(typeof window.loadTable === 'function') window.loadTable(); } catch(e){}
    try { if(typeof window.updateCards === 'function') window.updateCards(); } catch(e){}
    try { if(typeof window.updateInsights === 'function') window.updateInsights(); } catch(e){}
  }

  window.loadRequests = function(){ activeSearch(); activeFilter(); schedule(); };
  window.searchRequests = function(v){ lastSearch = String(v || ''); schedule(); };
  window.filterRequests = function(v){ lastFilter = v || 'all'; schedule(); };
  window.saveRequestField = function(id, mode){ update(id, 'field', mode); return false; };
  window.setRequestStatus = function(id, status){ update(id, 'status', status); return false; };
  window.cancelRequest = function(id){ update(id, 'status', 'canceled'); return false; };

  document.addEventListener('click', function(e){
    const inReq = e.target && e.target.closest && e.target.closest('#requestsContainer, #adminLiveRequestsBox');
    if(!inReq) return;
    const btn = e.target.closest('[data-stable-action]');
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if(!btn || btn.disabled) return false;
    update(btn.getAttribute('data-request-id'), btn.getAttribute('data-stable-action'), btn.getAttribute('data-value'));
    return false;
  }, true);

  document.addEventListener('input', function(e){ if(e.target && e.target.id === 'requestSearchBox'){ lastSearch = e.target.value || ''; schedule(); } }, true);
  document.addEventListener('change', function(e){ if(e.target && e.target.id === 'requestStatusFilter'){ lastFilter = e.target.value || 'all'; schedule(); } }, true);

  const oldShow = window.showPage;
  window.showPage = function(id, item){
    const result = oldShow ? oldShow.apply(this, arguments) : undefined;
    if(id === 'requests') schedule();
    return result;
  };

  document.addEventListener('DOMContentLoaded', function(){
    const box = document.getElementById('requestSearchBox');
    const filter = document.getElementById('requestStatusFilter');
    if(box){ lastSearch = box.value || ''; box.onkeyup = null; box.oninput = function(){ lastSearch = this.value || ''; schedule(); }; }
    if(filter){ lastFilter = filter.value || 'all'; filter.onchange = function(){ lastFilter = this.value || 'all'; schedule(); }; }
    [0,80,260,600,1100,1600].forEach(t => setTimeout(schedule, t));
  });
})();
