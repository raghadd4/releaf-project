// 1. FORCED ICON SCALING OBSERVER
const iconObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SVG' && node.classList.contains('lucide')) {
                node.setAttribute('width', '32');
                node.setAttribute('height', '32');
                node.style.width = '32px';
                node.style.height = '32px';
            } else if (node.querySelectorAll) {
                const subIcons = node.querySelectorAll('svg.lucide');
                subIcons.forEach(svg => {
                    svg.setAttribute('width', '32');
                    svg.setAttribute('height', '32');
                    svg.style.width = '32px';
                    svg.style.height = '32px';
                });
            }
        });
    });
});

iconObserver.observe(document.body, { 
    childList: true, 
    subtree: true 
});

const recyclingHubs = {
    "Amman": {
        name: "Green Spot / Tla'a Al-Ali Center",
        info: "Major hub for paper & cardboard collection in Amman.",
        link: "https://greenspotjo.com"
    },
    "Irbid": {
        name: "Greater Irbid Municipality Facility",
        info: "Located in 'Truck City', processes 8 tons of paper daily.",
        link: "https://www.be.jo"
    },
    "Zarqa": {
        name: "Russeifa Collection Points",
        info: "Local municipal sorting centers for industrial paper waste.",
        link: "#"
    },
    "Karak": {
        name: "Karak Star for Recycling",
        info: "Specialized in paper pulp and egg tray production in the Industrial City.",
        link: "https://www.karakstar.com"
    },
    "Default": {
        name: "Al-Hassan Industrial City Factories",
        info: "Major paper and carton factories that accept bulk recyclables.",
        link: "#"
    }
};

const modal = document.getElementById('formModal');
const openBtn = document.getElementById('openFormBtn');
const locCard = document.getElementById('locCard');
const updateLocBtn = document.getElementById('updateLocBtn');
const displayAddress = document.getElementById('displayAddress');
const treeCountDisplay = document.getElementById('treeCount');
const weightDisplay = document.getElementById('weightCount');
const levelDisplay = document.getElementById('userLevel');
const activityTable = document.getElementById('activityTable');
const REQUESTS_STORAGE_KEY = 'releaf_requests_v1';
const LANGUAGE_STORAGE_KEY = 'releaf_language_v1';

const locBtns = document.querySelectorAll('.loc-btn');
const manualFields = document.getElementById('manualLocationFields');
const mapWrapper = document.getElementById('mapWrapper');

const cancelModal = document.getElementById('cancelModal');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');
const abortCancelBtn = document.getElementById('abortCancelBtn');

const cancelReasonSelect = document.getElementById('cancelReason');
const otherReasonText = document.getElementById('otherReasonText');

// Weight Guide Elements
const weightGuideBtn = document.getElementById('weightGuideBtn');
const weightGuideBox = document.getElementById('weightGuideBox');

let activeRequestToCancel = null;
let isLocationSet = false;
let totalWeightAccumulated = 0;

/* --- Jordan District Data --- */
const districtData = {
    "Amman": ["Amman City", "Marka", "Al-Quwaysimah", "University District", "Wadi Al-Seer", "Na'oor", "Sahab", "Al-Jiza", "Al-Muwaqqar"],
    "Irbid": ["Irbid City", "Bani Kenanah", "Al-Kura", "Al-Ramtha", "Northern Ghor", "Bani Obeid", "Mazar Al-Shamali", "Taybeh", "Wastiyyah"],
    "Zarqa": ["Zarqa City", "Russeifa", "Hashemiyah"],
    "Balqa": ["As-Salt", "Shuna al-Janubiyya", "Deir Alla", "Ain al-Basha", "Fuheis & Mahis"],
    "Madaba": ["Madaba City", "Dhiban"],
    "Karak": ["Karak City", "Mazar Al-Janubiyya", "Al-Qasr", "Southern Ghor", "Ayy", "Faqqu'", "Qatraneh"],
    "Mafraq": ["Mafraq City", "Ruwayshid", "Northern Badia", "North-Western Badia"],
    "Jerash": ["Jerash City"],
    "Ajloun": ["Ajloun City", "Kofranjah"],
    "Ma'an": ["Ma'an City", "Petra", "Al-Shoubak", "Al-Husayniyya"],
    "Tafilah": ["Tafilah City", "Al-Hasa", "Birsayra"],
    "Aqaba": ["Aqaba City", "Al-Quwayra"]
};

// Weight Guide Toggle Logic
if (weightGuideBtn && weightGuideBox) {
    weightGuideBtn.addEventListener('click', () => {
        const isHidden = weightGuideBox.style.display === 'none';
        weightGuideBox.style.display = isHidden ? 'block' : 'none';
        weightGuideBtn.innerText = isHidden ? 'Close Guide' : 'Weight Guide?';
    });
}

cancelReasonSelect.onchange = () => {
    if (cancelReasonSelect.value === 'other') {
        otherReasonText.style.display = 'block';
    } else {
        otherReasonText.style.display = 'none';
    }
};

function resetCancelModal() {
    cancelModal.style.display = 'none';
    cancelReasonSelect.value = 'mistake'; 
    otherReasonText.value = '';           
    otherReasonText.style.display = 'none'; 
}

document.getElementById('trackerContainer').addEventListener('click', (e) => {
    const cancelBtn = e.target.closest('.card-cancel-btn');
    if (cancelBtn) {
        activeRequestToCancel = cancelBtn.closest('.arrival-card');
        cancelModal.style.display = 'grid';
    }
});

confirmCancelBtn.onclick = () => {
    if (activeRequestToCancel) {
        const idElement = activeRequestToCancel.querySelector('.trackID');
        const requestID = idElement.innerText;
        const rows = activityTable.querySelectorAll('tr');
        
        rows.forEach(row => {
            if (row.cells[0].innerText === requestID) {
                const statusCell = row.cells[3];
                statusCell.innerHTML = `<span class="status-pill" style="background: #ff4444;">Canceled</span>`;
                const weightText = row.cells[2].innerText.replace('kg', '');
                const weightNum = parseFloat(weightText);
                updateGlobalStats(totalWeightAccumulated - weightNum);
            }
        });

        markRequestCanceled(requestID);

        activeRequestToCancel.style.opacity = '0';
        activeRequestToCancel.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            if (activeRequestToCancel) {
                activeRequestToCancel.remove();
                activeRequestToCancel = null;
                syncSidebarCollectionCardFromProfile();
            }
            const toast = document.getElementById('cancelToast');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }, 300);
    }
    resetCancelModal();
};

abortCancelBtn.onclick = () => {
    resetCancelModal();
};

let locationMode = null; 
let selectedAction = null; 
let map;
let marker;
let userCoords = null; 
let gpsProvince = ""; 
let profileMap = null;
let profileMarker = null;
let profileLocDraftLat = null;
let profileLocDraftLon = null;

const provinceSelect = document.getElementById('province');
const districtSelect = document.getElementById('district');

/**
 * Standalone function to detect province from coordinates 
 * and update the sidebar Collection Point.
 */
async function syncSidebarWithGPS(lat, lon) {
    const sidebarDisplay = document.getElementById('displayAddress');
    const provinceDropdown = document.getElementById('province');
    
    // 1. Show a loading state in the sidebar
    sidebarDisplay.innerHTML = `<span style="color: #ffa500;">Locating...</span>`;

    try {
        // 2. Fetch reverse geocoding data
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
        // 3. Extract the location name (Governorate/City/State)
        const address = data.address || {};
        const rawLocationName = address.state || address.city || address.governorate || address.county || "";

        // 4. Match against your Jordan District Data keys
        let matchedProvince = "Amman"; // Fallback default
        const availableProvinces = Object.keys(districtData);
        
        for (let prov of availableProvinces) {
            if (rawLocationName.toLowerCase().includes(prov.toLowerCase())) {
                matchedProvince = prov;
                break;
            }
        }

        // 5. UPDATE THE SIDEBAR UI
        gpsProvince = matchedProvince; // Update global variable
        sidebarDisplay.innerHTML = `<span style="color: #4caf50;">Location Set: ${matchedProvince} ✅</span>`;

        // 6. Sync the hidden dropdown so the form is valid
        if (provinceDropdown) {
            provinceDropdown.value = matchedProvince;
            // Manually trigger the change event to update districts if needed
            provinceDropdown.dispatchEvent(new Event('change', { bubbles: true }));
        }

        syncPickupLocationToProfile(lat, lon, matchedProvince, 'gps');

        console.log(`GPS Match Found: ${matchedProvince} (from API: ${rawLocationName})`);

    } catch (error) {
        console.error("GPS Sync Error:", error);
        sidebarDisplay.innerHTML = `<span style="color: #ff4444;">Location Error</span>`;
    }
}

if (provinceSelect && districtSelect) {
    const provinces = Object.keys(districtData);
    provinceSelect.innerHTML = provinces.map((prov) => `<option value="${prov}">${prov}</option>`).join('');

    function fillDistrictsForProvince(selectedProvince) {
        districtSelect.innerHTML = '';
        if (selectedProvince && districtData[selectedProvince]) {
            districtSelect.disabled = false;
            districtData[selectedProvince].forEach((district) => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                districtSelect.appendChild(option);
            });
        } else {
            districtSelect.disabled = true;
        }
    }

    provinceSelect.addEventListener('change', function () {
        fillDistrictsForProvince(this.value);
    });

    const prof = readProfile();
    const defaultProv =
        prof.profileProvince && provinces.includes(prof.profileProvince) ? prof.profileProvince : provinces[0];
    provinceSelect.value = defaultProv;
    fillDistrictsForProvince(defaultProv);
}

function resetRecycleFormLocationFields() {
    if (!provinceSelect || !districtSelect) return;
    const provinces = Object.keys(districtData);
    const prof = readProfile();
    const defaultProv =
        prof.profileProvince && provinces.includes(prof.profileProvince) ? prof.profileProvince : provinces[0];
    provinceSelect.value = defaultProv;
    provinceSelect.dispatchEvent(new Event('change', { bubbles: true }));
}

function updateGlobalStats(newWeight) {
    totalWeightAccumulated = newWeight < 0 ? 0 : newWeight;
    weightDisplay.innerText = totalWeightAccumulated.toFixed(1) + "kg";
    treeCountDisplay.innerText = Math.floor(totalWeightAccumulated / 50);

    let rank = "Seedling";
    if (totalWeightAccumulated >= 500) rank = "Forest Guardian";
    else if (totalWeightAccumulated >= 185) rank = "Sapling";
    else if (totalWeightAccumulated >= 50) rank = "Sprout";
    levelDisplay.innerText = rank;
    refreshUserFacingLabels(readProfile());
    renderExchangeIdeas();
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function normalizePhone(raw) {
    return String(raw || '').replace(/[^\d+]/g, '').trim();
}

function isArabicUI() {
    return document.documentElement.lang === 'ar';
}

function tr(en, ar) {
    return isArabicUI() ? ar : en;
}

function validPhone(raw) {
    const p = normalizePhone(raw);
    return /^\+?\d{8,15}$/.test(p);
}


/* ===== Account cumulative exchange helpers (added only) ===== */
function releafCurrentUsernameForRequests() {
    try {
        const profile = typeof readProfile === 'function' ? readProfile() : JSON.parse(localStorage.getItem('releaf_profile_v1') || '{}');
        const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
        return String(profile.username || current.username || '').toLowerCase();
    } catch (e) { return ''; }
}
function releafIsClosedRequestStatus(status) {
    return ['canceled','cancelled','completed','complete','done','delivered','finished'].includes(String(status || '').toLowerCase());
}
function releafStoredActiveWeightForCurrentUser() {
    let list = [];
    try { list = typeof readStoredRequests === 'function' ? readStoredRequests() : JSON.parse(localStorage.getItem('releaf_requests_v1') || '[]'); } catch (e) { list = []; }
    const username = releafCurrentUsernameForRequests();
    return list.reduce((sum, req) => {
        const owner = String(req.ownerUsername || req.username || '').toLowerCase();
        const belongsToCurrentUser = !owner || !username || owner === username;
        if (!belongsToCurrentUser || releafIsClosedRequestStatus(req.status)) return sum;
        const n = parseFloat(req.weight || req.minWeightEstimate || 0);
        return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
}
function releafExchangeAvailableWeight(extraWeight = 0) {
    const extra = parseFloat(extraWeight || 0);
    return releafStoredActiveWeightForCurrentUser() + (Number.isFinite(extra) ? extra : 0);
}

function renderExchangeIdeas() {
    // Exchange options are now shown only inside request form when action is "Exchange".
}

function applyLanguage(langRaw) {
    const lang = langRaw === 'ar' ? 'ar' : 'en';
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const t = {
        en: {
            navDashboard: 'Dashboard',
            navRequests: 'My Requests',
            navProfile: 'Profile',
            navContact: 'Contact Admin',
            logout: 'Sign Out',
            addBtn: 'Add Paper / Carton +',
            recentActivity: 'Recent Activity',
            requestsHistory: 'Requests History',
            exchangeTitle: 'Exchange options by recycled amount',
            exchangeSubtitle: 'As your recycled total grows, you unlock better exchange rewards.',
            ex1Title: 'Art from recycled paper',
            ex1Desc: 'Decent-size handmade paper artwork (A4-A3 style).',
            ex1Meta: 'Unlock at 10 kg',
            ex2Title: 'School/office paper bundle',
            ex2Desc: 'Exchange damaged paper weight for clean-use sheets.',
            ex2Meta: 'Unlock at 20 kg',
            ex3Title: 'Eco stationery pack',
            ex3Desc: 'Recycled notebooks, folders, and desk supplies.',
            ex3Meta: 'Unlock at 35 kg',
            ex4Title: 'Home organizer set',
            ex4Desc: 'Durable storage boxes produced from recycled carton.',
            ex4Meta: 'Unlock at 50 kg',
            newRequest: 'New Request',
            paperType: 'Paper Type',
            source: 'Source',
            weight: 'Weight (kg)',
            minWeightEstimateLabel: 'Minimum estimated weight (kg)',
            minWeightHint: 'Add the minimum weight you estimate you have.',
            availableAt: 'Preferred collection time',
            collectionDate: 'Preferred collection date',
            actionType: 'Action Type',
            locationReq: 'Location for this request',
            locationReqHint: 'Your saved collection address is used for routing. Here, choose whether this request uses the map or a governorate and area list.',
            governorate: 'Governorate',
            district: 'District / area',
            notes: 'Notes',
            submitRequest: 'Submit Request',
            contactAdmin: 'Contact admin',
            contactIntro: 'Send a message to the ReLeaf team. We’ll use your profile email for replies.',
            topic: 'Topic',
            message: 'Message',
            contactNote: 'Opens your mail app with this message filled in. You can edit before sending.',
            collectionAddress: 'Collection address',
            phoneLabel: 'Phone',
            contactCollectionDesc: 'We use this to reach you and to route collections. Edit fields below, then tap Save changes at the bottom to store them on this device.'
        },
        ar: {
            navDashboard: 'الصفحة الرئيسية',
            navRequests: 'طلباتي',
            navProfile: 'الملف الشخصي',
            navContact: 'تواصل مع الإدارة',
            logout: 'تسجيل الخروج',
            addBtn: 'إضافة ورق / كرتون +',
            recentActivity: 'آخر النشاطات',
            requestsHistory: 'سجل الطلبات',
            exchangeTitle: 'خيارات الاستبدال حسب كمية التدوير',
            exchangeSubtitle: 'كلما زادت الكمية المعاد تدويرها، تفتح لك مكافآت استبدال أفضل.',
            ex1Title: 'لوحة فنية من ورق معاد تدويره',
            ex1Desc: 'عمل فني يدوي بحجم مناسب (تقريبًا A4-A3).',
            ex1Meta: 'يتوفر عند 10 كغ',
            ex2Title: 'باقة ورق للمدرسة/المكتب',
            ex2Desc: 'استبدال وزن الورق التالف بورق نظيف قابل للاستخدام.',
            ex2Meta: 'يتوفر عند 20 كغ',
            ex3Title: 'باقة قرطاسية صديقة للبيئة',
            ex3Desc: 'دفاتر ومجلدات ومستلزمات مكتب معاد تدويرها.',
            ex3Meta: 'يتوفر عند 35 كغ',
            ex4Title: 'مجموعة تنظيم منزلية',
            ex4Desc: 'صناديق تخزين متينة مصنوعة من كرتون معاد تدويره.',
            ex4Meta: 'يتوفر عند 50 كغ',
            newRequest: 'طلب جديد',
            paperType: 'نوع الورق',
            source: 'المصدر',
            weight: 'الوزن (كغ)',
            minWeightEstimateLabel: 'أقل وزن تقديري (كغ)',
            minWeightHint: 'أدخل أقل وزن تتوقع أنه متوفر لديك.',
            availableAt: 'وقت الجمع المفضل',
            collectionDate: 'تاريخ الجمع المفضل',
            actionType: 'نوع الإجراء',
            locationReq: 'موقع هذا الطلب',
            locationReqHint: 'يتم استخدام عنوان الجمع المحفوظ للتوجيه. هنا اختر هل تريد تحديد الموقع بالخريطة أو من قائمة المحافظة والمنطقة.',
            governorate: 'المحافظة',
            district: 'المنطقة / الحي',
            notes: 'ملاحظات',
            submitRequest: 'إرسال الطلب',
            contactAdmin: 'التواصل مع الإدارة',
            contactIntro: 'أرسل رسالة إلى فريق ReLeaf. سنستخدم بريد ملفك الشخصي للرد.',
            topic: 'الموضوع',
            message: 'الرسالة',
            contactNote: 'سيفتح تطبيق البريد مع تعبئة الرسالة ويمكنك تعديلها قبل الإرسال.',
            collectionAddress: 'عنوان الجمع',
            phoneLabel: 'رقم الهاتف',
            contactCollectionDesc: 'نستخدم هذه المعلومات للتواصل معك وتوجيه الجمع. عدل البيانات ثم اضغط حفظ التغييرات في الأسفل لحفظها على هذا الجهاز.'
        }
    }[lang];
    const set = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    set('txtNavDashboard', t.navDashboard);
    set('txtNavRequests', t.navRequests);
    set('txtNavProfile', t.navProfile);
    set('txtNavContact', t.navContact);
    set('txtLogout', t.logout);
    set('openFormBtn', t.addBtn);
    set('txtRecentActivity', t.recentActivity);
    set('txtRequestsHistory', t.requestsHistory);
    set('txtExchangeTitle', t.exchangeTitle);
    set('txtExchangeSubtitle', t.exchangeSubtitle);
    set('txtEx1Title', t.ex1Title);
    set('txtEx1Desc', t.ex1Desc);
    set('txtEx1Meta', t.ex1Meta);
    set('txtEx2Title', t.ex2Title);
    set('txtEx2Desc', t.ex2Desc);
    set('txtEx2Meta', t.ex2Meta);
    set('txtEx3Title', t.ex3Title);
    set('txtEx3Desc', t.ex3Desc);
    set('txtEx3Meta', t.ex3Meta);
    set('txtEx4Title', t.ex4Title);
    set('txtEx4Desc', t.ex4Desc);
    set('txtEx4Meta', t.ex4Meta);
    set('txtNewRequestTitle', t.newRequest);
    set('txtPaperTypeLabel', t.paperType);
    set('txtSourceLabel', t.source);
    set('txtWeightLabel', t.weight);
    set('txtMinWeightEstimateLabel', t.minWeightEstimateLabel);
    set('txtMinWeightHint', t.minWeightHint);
    set('txtAvailableAtLabel', t.availableAt);
    set('txtCollectionDateLabel', t.collectionDate);
    set('txtActionTypeLabel', t.actionType);
    set('txtLocationForRequestLabel', t.locationReq);
    set('txtLocationForRequestHint', t.locationReqHint);
    set('txtGovernorateLabel', t.governorate);
    set('txtDistrictLabel', t.district);
    set('txtNotesLabel', t.notes);
    set('txtSubmitRequestBtn', t.submitRequest);
    set('txtFilterAll', lang === 'ar' ? 'الكل' : 'All');
    set('txtFilterActive', lang === 'ar' ? 'نشط' : 'Active');
    set('txtFilterCompleted', lang === 'ar' ? 'مكتمل' : 'Completed');
    set('txtContactAdminTitle', t.contactAdmin);
    set('txtContactAdminIntro', t.contactIntro);
    set('txtContactTopicLabel', t.topic);
    set('txtContactMessageLabel', t.message);
    set('txtContactAdminNote', t.contactNote);
    set('txtCollectionAddressTitle', t.collectionAddress);
    set('txtContactCollectionDesc', t.contactCollectionDesc);
    const applyBtn = document.getElementById('profileEditModalSave');
    if (applyBtn) applyBtn.textContent = lang === 'ar' ? 'تطبيق' : 'Apply';
    const sendBtn = document.getElementById('contactSendBtn');
    if (sendBtn) sendBtn.textContent = lang === 'ar' ? 'إرسال عبر البريد' : 'Send in email app';
    const addrBtn = document.getElementById('profileLocationSaveBtn');
    if (addrBtn) addrBtn.textContent = lang === 'ar' ? 'تطبيق العنوان' : 'Apply address';
    const actionButtons = document.querySelectorAll('#actionToggle .seg-btn');
    if (actionButtons.length >= 3) {
        if (lang === 'ar') {
            actionButtons[0].textContent = 'بيع';
            actionButtons[1].textContent = 'تبرع';
            actionButtons[2].textContent = 'استبدال';
        } else {
            actionButtons[0].textContent = 'Sell';
            actionButtons[1].textContent = 'Donate';
            actionButtons[2].textContent = 'Exchange';
        }
    }

    const statLabels = document.querySelectorAll('.stats-row .stat-card p');
    if (statLabels.length >= 3) {
        if (lang === 'ar') {
            statLabels[0].textContent = 'أشجار تم إنقاذها';
            statLabels[1].textContent = 'تمت إعادة تدويره';
            statLabels[2].textContent = 'الرتبة الحالية';
        } else {
            statLabels[0].textContent = 'Trees Saved';
            statLabels[1].textContent = 'Recycled';
            statLabels[2].textContent = 'Current Rank';
        }
    }

    const setProfileLabel = (field, text) => {
        const el = document.querySelector(`[data-profile-field="${field}"] .profile-field-label`);
        if (el) el.textContent = text;
    };
    if (lang === 'ar') {
        setProfileLabel('fullName', 'الاسم الكامل');
        setProfileLabel('email', 'البريد الإلكتروني');
        setProfileLabel('phone', 'رقم الهاتف');
        setProfileLabel('profileLocation', 'عنوان الجمع');
        setProfileLabel('username', 'اسم المستخدم');
        setProfileLabel('password', 'كلمة المرور');
        const h1 = document.getElementById('profile-personal-heading');
        if (h1) h1.textContent = 'معلومات التواصل والجمع';
        const h2 = document.getElementById('profile-security-heading');
        if (h2) h2.textContent = 'تسجيل الدخول والأمان';
        const saveBtn = document.getElementById('profileSaveBtn');
        if (saveBtn) saveBtn.textContent = 'حفظ التغييرات';
        const backBtn = document.getElementById('profileBackBtn');
        if (backBtn) backBtn.textContent = 'العودة للوحة';
    } else {
        setProfileLabel('fullName', 'Full name');
        setProfileLabel('email', 'Email');
        setProfileLabel('phone', 'Phone number');
        setProfileLabel('profileLocation', 'Collection address');
        setProfileLabel('username', 'Username');
        setProfileLabel('password', 'Password');
        const h1 = document.getElementById('profile-personal-heading');
        if (h1) h1.textContent = 'Contact & collection';
        const h2 = document.getElementById('profile-security-heading');
        if (h2) h2.textContent = 'Sign-in & security';
        const saveBtn = document.getElementById('profileSaveBtn');
        if (saveBtn) saveBtn.textContent = 'Save changes';
        const backBtn = document.getElementById('profileBackBtn');
        if (backBtn) backBtn.textContent = 'Back to dashboard';
    }

    const source = document.getElementById('productSource');
    if (source && source.options.length >= 5) {
        if (lang === 'ar') {
            source.options[0].text = 'المنزل';
            source.options[1].text = 'المدرسة';
            source.options[2].text = 'الجامعة';
            source.options[3].text = 'الشركة';
            source.options[4].text = 'المصنع';
        } else {
            source.options[0].text = 'Home';
            source.options[1].text = 'School';
            source.options[2].text = 'University';
            source.options[3].text = 'Company';
            source.options[4].text = 'Factory';
        }
    }
    const paperType = document.getElementById('paperStatus');
    if (paperType && paperType.options.length >= 3) {
        if (lang === 'ar') {
            paperType.options[0].text = 'تالف';
            paperType.options[1].text = 'نظيف';
            paperType.options[2].text = 'كرتون';
        } else {
            paperType.options[0].text = 'Damaged';
            paperType.options[1].text = 'Clean';
            paperType.options[2].text = 'Carton';
        }
    }
    const exchangeSelect = document.getElementById('exchangeChoice');
    if (exchangeSelect && exchangeSelect.options.length >= 4) {
        if (lang === 'ar') {
            const exLabel = document.getElementById('txtExchangeChoiceLabel');
            if (exLabel) exLabel.textContent = 'اختر مكافأة الاستبدال';
            exchangeSelect.options[0].text = 'لوحة فنية من ورق معاد تدويره';
            exchangeSelect.options[1].text = 'باقة ورق نظيف';
            exchangeSelect.options[2].text = 'باقة قرطاسية صديقة للبيئة';
            exchangeSelect.options[3].text = 'صناديق تخزين من كرتون معاد تدويره';
        } else {
            const exLabel = document.getElementById('txtExchangeChoiceLabel');
            if (exLabel) exLabel.textContent = 'Choose exchange reward';
            exchangeSelect.options[0].text = 'Recycled paper artwork';
            exchangeSelect.options[1].text = 'Clean paper bundle';
            exchangeSelect.options[2].text = 'Eco stationery pack';
            exchangeSelect.options[3].text = 'Recycled carton storage boxes';
        }
    }
    const slot = document.getElementById('availableSlot');
    if (slot) {
        const slots = ['09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00','17:00-19:00','19:00-21:00'];
        const labelsEn = ['09:00 - 11:00','11:00 - 13:00','13:00 - 15:00','15:00 - 17:00','17:00 - 19:00','19:00 - 21:00'];
        const labelsAr = ['09:00 - 11:00 (صباحًا)','11:00 - 13:00 (ظهرًا)','13:00 - 15:00 (بعد الظهر)','15:00 - 17:00 (عصرًا)','17:00 - 19:00 (مساءً)','19:00 - 21:00 (مساءً)'];
        const selected = slot.value;
        slot.innerHTML = slots.map((v, i) => `<option value="${v}">${(lang === 'ar' ? labelsAr : labelsEn)[i]}</option>`).join('');
        if (slots.includes(selected)) slot.value = selected;
    }
    const dateInput = document.getElementById('collectionDate');
    if (dateInput && !dateInput.min) {
        const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        dateInput.min = today.toISOString().slice(0, 10);
    }

    const locButtons = document.querySelectorAll('.location-toggle-group .loc-btn');
    if (locButtons.length >= 2) {
        locButtons[0].textContent = lang === 'ar' ? 'GPS / الخريطة' : 'GPS / Map';
        locButtons[1].textContent = lang === 'ar' ? 'إدخال يدوي' : 'Manual entry';
    }

    const tblHeads = document.querySelectorAll('.table-container thead th');
    if (tblHeads.length >= 4) {
        if (lang === 'ar') {
            tblHeads[0].textContent = 'المعرف';
            tblHeads[1].textContent = 'النوع';
            tblHeads[2].textContent = 'الوزن';
            tblHeads[3].textContent = 'الحالة';
        } else {
            tblHeads[0].textContent = 'ID';
            tblHeads[1].textContent = 'Type';
            tblHeads[2].textContent = 'Weight';
            tblHeads[3].textContent = 'Status';
        }
    }

    const emptyRow = document.getElementById('emptyMsg');
    if (emptyRow && emptyRow.firstElementChild) {
        emptyRow.firstElementChild.textContent =
            lang === 'ar'
                ? 'لا توجد طلبات بعد. أضف أول طلب جمع الآن!'
                : 'No requests yet. Add your first collection request!';
    }

    if (typeof hydrateOrdersFromStorage === 'function') {
        setTimeout(hydrateOrdersFromStorage, 0);
    }
    if (typeof window !== 'undefined' && typeof window.releafRefreshExchangeRewardRules === 'function') {
        setTimeout(window.releafRefreshExchangeRewardRules, 0);
    }
}

function readStoredRequests() {
    try {
        const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
        if (!raw) return [];
        const a = JSON.parse(raw);
        if (!Array.isArray(a)) return [];
        return a
            .filter(
                (r) =>
                    r &&
                    typeof r.id === 'string' &&
                    typeof r.type === 'string' &&
                    typeof r.weight === 'number' &&
                    !Number.isNaN(r.weight)
            )
            .map((r) => ({
                id: r.id,
                type: r.type,
                weight: r.weight,
                createdAt: typeof r.createdAt === 'string' ? r.createdAt : '',
                requestDate: typeof r.requestDate === 'string' ? r.requestDate : (typeof r.collectionDate === 'string' ? r.collectionDate : ''),
                collectionDate: typeof r.collectionDate === 'string' ? r.collectionDate : (typeof r.requestDate === 'string' ? r.requestDate : ''),
                status: r.status === 'canceled' ? 'canceled' : 'sent',
                hubName: typeof r.hubName === 'string' ? r.hubName : '',
                hubInfo: typeof r.hubInfo === 'string' ? r.hubInfo : '',
                availableSlot:
                    typeof r.availableSlot === 'string'
                        ? r.availableSlot
                        : typeof r.availableAt === 'string'
                          ? r.availableAt
                          : '',
                minWeightEstimate:
                    r.minWeightEstimate != null && !Number.isNaN(Number(r.minWeightEstimate))
                        ? Number(r.minWeightEstimate)
                        : typeof r.minBundleSize === 'string' && !Number.isNaN(Number(r.minBundleSize))
                          ? Number(r.minBundleSize)
                          : null,
                exchangeChoice: typeof r.exchangeChoice === 'string' ? r.exchangeChoice : '',
                savedExchangeGoal: typeof r.savedExchangeGoal === 'string' ? r.savedExchangeGoal : ''
            }))
            .sort((a, b) => {
                const ad = Date.parse(a.createdAt || a.requestDate || a.collectionDate || '') || 0;
                const bd = Date.parse(b.createdAt || b.requestDate || b.collectionDate || '') || 0;
                return bd - ad;
            });
    } catch {
        return [];
    }
}

function writeStoredRequests(list) {
    try {
        localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(list));
    } catch {
        console.warn('Could not save orders to storage.');
    }
}

function markRequestCanceled(requestId) {
    const list = readStoredRequests();
    const i = list.findIndex((r) => r.id === requestId);
    if (i < 0) return;
    list[i] = { ...list[i], status: 'canceled' };
    writeStoredRequests(list);
}


function displayExchangeChoice(choice) {
    const key = String(choice || '').trim();
    const isAr = document.documentElement.lang === 'ar';
    const labels = {
        artwork: { en: 'Recycled paper artwork', ar: 'لوحة فنية من ورق معاد تدويره' },
        paper_bundle: { en: 'Clean paper bundle', ar: 'باقة ورق نظيف' },
        stationery: { en: 'Eco stationery pack', ar: 'باقة قرطاسية صديقة للبيئة' },
        storage_boxes: { en: 'Recycled carton storage boxes', ar: 'صناديق تخزين من كرتون معاد تدويره' }
    };
    const aliases = {
        'Recycled paper artwork': 'artwork',
        'لوحة فنية من ورق معاد تدويره': 'artwork',
        'Clean paper bundle': 'paper_bundle',
        'باقة ورق نظيف': 'paper_bundle',
        'Eco stationery pack': 'stationery',
        'باقة قرطاسية صديقة للبيئة': 'stationery',
        'Recycled carton storage boxes': 'storage_boxes',
        'صناديق تخزين من كرتون معاد تدويره': 'storage_boxes'
    };
    const normalized = labels[key] ? key : aliases[key];
    return normalized ? labels[normalized][isAr ? 'ar' : 'en'] : key;
}

function hydrateOrdersFromStorage() {
    if (!activityTable) return;
    const list = readStoredRequests();
    const container = document.getElementById('trackerContainer');
    const template = document.getElementById('trackerTemplate');

    activityTable.innerHTML = '';
    if (container) container.innerHTML = '';

    const emptyRow =
        '<tr id="emptyMsg"><td colspan="4" style="text-align:center; opacity:0.5; padding: 40px;">No requests yet. Add your first collection request!</td></tr>';

    if (list.length === 0) {
        activityTable.innerHTML = emptyRow;
        updateGlobalStats(0);
        return;
    }

    list.forEach((req) => {
        const statusHtml =
            req.status === 'canceled'
                ? `<span class="status-pill" style="background: #ff4444;">${tr('Canceled', 'تم الإلغاء')}</span>`
                : `<span class="status-pill" style="background: #856404;">${tr('Sent to Admin', 'تم الإرسال إلى الإدارة')}</span>`;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${escapeHtml(req.id)}</td><td style="text-transform:capitalize;">${escapeHtml(req.type)}</td><td>${req.weight}kg</td><td>${statusHtml}</td>`;
        activityTable.appendChild(row);
    });

    if (container && template) {
        list.forEach((req) => {
            if (req.status === 'canceled') return;
            const hubName = req.hubName || recyclingHubs.Default.name;
            const hubInfo = req.hubInfo || recyclingHubs.Default.info;
            const clone = template.content.cloneNode(true);
            clone.querySelector('.trackID').innerText = req.id;
            clone.querySelector('.trackType').innerText =
                req.type.charAt(0).toUpperCase() + req.type.slice(1);
            const whenLine = req.availableSlot ? `<br><strong>${tr('Available', 'وقت التوفر')}:</strong> ${escapeHtml(req.availableSlot)}` : '';
            const bundleLine =
                req.minWeightEstimate != null
                    ? `<br><strong>${tr('Minimum estimate', 'الحد الأدنى التقديري')}:</strong> ${escapeHtml(req.minWeightEstimate)} kg`
                    : '';
            const savedGoalLine = req.savedExchangeGoal ? `<br><strong>${tr('Saved exchange goal', 'هدف الاستبدال المحفوظ')}:</strong> ${escapeHtml(displayExchangeChoice(req.savedExchangeGoal))}` : '';
            const exchangeLine = req.exchangeChoice ? `<br><strong>${tr('Exchange', 'الاستبدال')}:</strong> ${escapeHtml(displayExchangeChoice(req.exchangeChoice))}` : savedGoalLine;
            clone.querySelector('.trackHub').innerHTML = `<strong>${tr('Partner', 'الشريك')}:</strong> ${escapeHtml(hubName)}<br><span style="opacity: 0.7;">${escapeHtml(hubInfo)}</span>${whenLine}${bundleLine}${exchangeLine}`;
            container.appendChild(clone);
        });
        refreshIcons();
    }

    const totalActive = list
        .filter((r) => r.status !== 'canceled')
        .reduce((s, r) => s + r.weight, 0);
    updateGlobalStats(totalActive);
}

function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons({ attrs: { 'stroke-width': 2, 'width': 32, 'height': 32 } });
        document.querySelectorAll('svg.lucide').forEach(svg => {
            svg.setAttribute('width', '32');
            svg.setAttribute('height', '32');
            svg.style.width = '32px';
            svg.style.height = '32px';
        });
    }
}

const PROFILE_STORAGE_KEY = 'releaf_profile_v1';
/** Change this to your real support inbox. */
const RELEAF_ADMIN_EMAIL = 'support@releaf.app';
/** Local uniqueness until you have a login API (one registry per browser). */
const USERNAME_REGISTRY_KEY = 'releaf_username_registry_v1';

function profileDefaults() {
    const fallback = {
        fullName: 'ReLeaf User',
        email: '',
        phone: '',
        username: '',
        passwordUpdatedAt: null,
        photo: null,
        profileProvince: '',
        profileLat: null,
        profileLon: null,
        profileLocationSource: ''
    };
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && typeof currentUser === 'object') {
            const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(' ').trim() || currentUser.username || fallback.fullName;
            return {
                ...fallback,
                fullName,
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                username: currentUser.username || '',
                passwordUpdatedAt: currentUser.password ? Date.now() : null
            };
        }
    } catch (_) {}
    return fallback;
}


function readProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) return profileDefaults();
        const parsed = JSON.parse(raw);
        const authDefaults = profileDefaults();
        const merged = { ...authDefaults, ...parsed };
        if (authDefaults.username && !merged.username) {
            merged.username = authDefaults.username;
        }
        if (authDefaults.fullName && (!merged.fullName || merged.fullName === 'ReLeaf User')) {
            merged.fullName = authDefaults.fullName;
        }
        if (authDefaults.email && !merged.email) {
            merged.email = authDefaults.email;
        }
        if (authDefaults.phone && !merged.phone) {
            merged.phone = authDefaults.phone;
        }
        if (authDefaults.passwordUpdatedAt && !merged.passwordUpdatedAt) {
            merged.passwordUpdatedAt = authDefaults.passwordUpdatedAt;
        }
        if (merged.passwordUpdatedAt != null) merged.passwordUpdatedAt = Number(merged.passwordUpdatedAt) || null;
        if (merged.profileLat != null) merged.profileLat = Number(merged.profileLat);
        if (merged.profileLon != null) merged.profileLon = Number(merged.profileLon);
        delete merged.university;
        delete merged.passwordHint;
        delete merged.organization;
        delete merged.roleType;
        delete merged.roleCustom;
        return merged;
    } catch {
        return profileDefaults();
    }
}

let profileState = readProfile();

function writeProfileObject(obj) {
    try {
        const { university, passwordHint, organization, roleType, roleCustom, ...clean } = obj;
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(clean));
        return true;
    } catch {
        alert('Could not save. Storage may be full—try a smaller image or remove your photo.');
        return false;
    }
}

function safePersistProfile() {
    return writeProfileObject(profileState);
}

function normalizeUsername(u) {
    return String(u || '')
        .replace(/^@/, '')
        .trim()
        .toLowerCase();
}

function readUsernameRegistry() {
    try {
        const x = JSON.parse(localStorage.getItem(USERNAME_REGISTRY_KEY) || '{}');
        return x && typeof x === 'object' ? x : {};
    } catch {
        return {};
    }
}

function writeUsernameRegistry(obj) {
    localStorage.setItem(USERNAME_REGISTRY_KEY, JSON.stringify(obj));
}

function bootstrapUsernameRegistryForProfile() {
    const n = normalizeUsername(profileState.username);
    if (!n) return;
    const reg = readUsernameRegistry();
    if (!reg[n]) {
        reg[n] = true;
        writeUsernameRegistry(reg);
    }
}

/** True if candidate is taken by another user (not the same as previously saved username). */
function isUsernameTakenByOther(candidate, previousSavedRaw) {
    const n = normalizeUsername(candidate);
    const p = normalizeUsername(previousSavedRaw);
    if (n.length < 3) return false;
    if (n === p) return false;
    return !!readUsernameRegistry()[n];
}

/** Call only after profile JSON was saved successfully; keeps username registry in sync. */
function applyUsernameRegistryAfterPersist(newRaw, previousSavedRaw) {
    const n = normalizeUsername(newRaw);
    const p = normalizeUsername(previousSavedRaw);
    if (n === p) return;
    const reg = readUsernameRegistry();
    const next = { ...reg };
    if (p && next[p]) delete next[p];
    next[n] = true;
    writeUsernameRegistry(next);
}


function syncAuthUserAfterProfileSave(savedProfile, previousSavedProfile) {
    try {
        const oldUsername = normalizeUsername(previousSavedProfile && previousSavedProfile.username);
        const newUsername = String(savedProfile && savedProfile.username || '').replace(/^@/, '').trim();
        const oldEmail = String(previousSavedProfile && previousSavedProfile.email || '').trim().toLowerCase();
        const newEmail = String(savedProfile && savedProfile.email || '').trim().toLowerCase();
        const fullName = String(savedProfile && savedProfile.fullName || '').trim();
        const parts = fullName.split(/\s+/).filter(Boolean);
        const firstName = parts.shift() || '';
        const lastName = parts.join(' ');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const currentName = current && normalizeUsername(current.username);
        const currentEmail = current && String(current.email || '').trim().toLowerCase();
        let updatedUser = null;
        const nextUsers = users.map((u) => {
            const uName = normalizeUsername(u.username);
            const uEmail = String(u.email || '').trim().toLowerCase();
            const matchesPrevious = (oldUsername && uName === oldUsername) || (oldEmail && uEmail === oldEmail);
            const matchesCurrent = (currentName && uName === currentName) || (currentEmail && uEmail === currentEmail);
            if (!matchesPrevious && !matchesCurrent) return u;
            const patched = {
                ...u,
                firstName: firstName || u.firstName || '',
                lastName: lastName || u.lastName || '',
                username: newUsername || u.username,
                email: newEmail || u.email,
                phone: savedProfile.phone || u.phone || ''
            };
            updatedUser = patched;
            return patched;
        });
        if (updatedUser) {
            localStorage.setItem('users', JSON.stringify(nextUsers));
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        } else if (current && typeof current === 'object') {
            const patched = {
                ...current,
                firstName: firstName || current.firstName || '',
                lastName: lastName || current.lastName || '',
                username: newUsername || current.username,
                email: newEmail || current.email,
                phone: savedProfile.phone || current.phone || ''
            };
            localStorage.setItem('currentUser', JSON.stringify(patched));
            const exists = users.some((u) => normalizeUsername(u.username) === normalizeUsername(patched.username));
            if (!exists) localStorage.setItem('users', JSON.stringify([...users, patched]));
        }
    } catch (_) {}
}

function formatProperName(str) {
    const t = String(str).trim().replace(/\s+/g, ' ');
    if (!t) return '';
    return t
        .split(' ')
        .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');
}

function locationReady(st) {
    return !!(
        st &&
        st.profileProvince &&
        st.profileLat != null &&
        st.profileLon != null &&
        !Number.isNaN(Number(st.profileLat)) &&
        !Number.isNaN(Number(st.profileLon))
    );
}

/** Saved on disk — drives dashboard, requests, and sidebar. */
function isSavedProfileLocationReady() {
    return locationReady(readProfile());
}

/** Draft in profile editor (may differ until Save changes). */
function isDraftProfileLocationReady() {
    return locationReady(profileState);
}

function persistSavedProfileLocation(lat, lon, province, source) {
    const disk = readProfile();
    const merged = {
        ...disk,
        profileProvince: province,
        profileLat: lat,
        profileLon: lon,
        profileLocationSource: source || 'gps'
    };
    if (!writeProfileObject(merged)) return false;
    profileState.profileProvince = province;
    profileState.profileLat = lat;
    profileState.profileLon = lon;
    profileState.profileLocationSource = source || 'gps';
    userCoords = [lat, lon];
    gpsProvince = province;
    isLocationSet = true;
    if (openBtn) openBtn.classList.remove('locked');
    if (locCard) locCard.classList.remove('alert-mode');
    applyDashboardFromSavedProfile();
    applyProfileToPage();
    return true;
}

function syncPickupLocationToProfile(lat, lon, province, source, persist = true) {
    if (lat == null || lon == null || !province) return;
    if (persist) {
        persistSavedProfileLocation(lat, lon, province, source);
        return;
    }
    profileState.profileProvince = province;
    profileState.profileLat = lat;
    profileState.profileLon = lon;
    profileState.profileLocationSource = source || 'gps';
    applyProfileToPage();
}

function syncSidebarCollectionCardFromProfile() {
    if (!displayAddress) return;
    const saved = readProfile();
    if (locationReady(saved)) {
        displayAddress.innerHTML = `<span style="color: #4caf50;">${saved.profileProvince} ✅</span>`;
        if (displayCoords) {
            const how =
                saved.profileLocationSource === 'map'
                    ? 'Map pin'
                    : saved.profileLocationSource === 'gps'
                      ? 'GPS'
                      : 'Saved';
            displayCoords.textContent = `${Number(saved.profileLat).toFixed(4)}, ${Number(saved.profileLon).toFixed(4)} · ${how}`;
        }
        if (openBtn) openBtn.classList.remove('locked');
        if (locCard) locCard.classList.remove('alert-mode');
    } else {
        displayAddress.textContent = 'Set in Profile';
        if (displayCoords) displayCoords.textContent = 'Profile → Collection address';
    }
}

function hydrateLocationFromProfile() {
    const saved = readProfile();
    if (!locationReady(saved)) {
        syncSidebarCollectionCardFromProfile();
        return;
    }
    userCoords = [saved.profileLat, saved.profileLon];
    gpsProvince = saved.profileProvince;
    isLocationSet = true;
    syncSidebarCollectionCardFromProfile();
}

function formatPasswordStatusDisplay() {
    const ts = profileState.passwordUpdatedAt;
    if (ts != null && !Number.isNaN(Number(ts))) {
        const d = new Date(Number(ts));
        if (!Number.isNaN(d.getTime())) {
            return `Updated ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
    }
    return 'Set or update when you are ready (saved on this device)';
}

function formatProfileLocationSummaryFor(st) {
    if (!locationReady(st)) return 'Not set — open to add governorate + GPS or map';
    const src =
        st.profileLocationSource === 'map'
            ? 'Map pin'
            : st.profileLocationSource === 'gps'
              ? 'GPS'
              : 'Saved';
    return `${st.profileProvince} · ${src}`;
}

function fillProfileLocProvinceSelect() {
    const sel = document.getElementById('profileLocProvinceSelect');
    if (!sel) return;
    sel.innerHTML = '';
    Object.keys(districtData).forEach((p) => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        sel.appendChild(opt);
    });
    const keys = Object.keys(districtData);
    const want = profileState.profileProvince;
    if (want && keys.includes(want)) sel.value = want;
    else sel.selectedIndex = 0;
}

function openProfileLocationModal() {
    fillProfileLocProvinceSelect();
    profileLocDraftLat = profileState.profileLat;
    profileLocDraftLon = profileState.profileLon;
    const mapWrap = document.getElementById('profileLocMapWrap');
    if (mapWrap) mapWrap.style.display = 'none';
    const m = document.getElementById('profileLocationModal');
    if (m) {
        m.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }
    refreshIcons();
}

function closeProfileLocationModal() {
    const m = document.getElementById('profileLocationModal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function ensureProfileLocationMap() {
    const wrap = document.getElementById('profileLocMapWrap');
    if (!wrap || wrap.style.display === 'none') return;
    const el = document.getElementById('profileLocMapContainer');
    if (!el || typeof L === 'undefined') return;
    const center =
        profileLocDraftLat != null && profileLocDraftLon != null
            ? [profileLocDraftLat, profileLocDraftLon]
            : userCoords || [31.9454, 35.9284];
    if (!profileMap) {
        profileMap = L.map('profileLocMapContainer').setView(center, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(profileMap);
        profileMarker = L.marker(center, { draggable: true }).addTo(profileMap);
        profileMarker.on('dragend', () => {
            const ll = profileMarker.getLatLng();
            profileLocDraftLat = ll.lat;
            profileLocDraftLon = ll.lng;
        });
    } else {
        profileMap.setView(center, 13);
        profileMarker.setLatLng(center);
    }
    profileLocDraftLat = center[0];
    profileLocDraftLon = center[1];
    setTimeout(() => profileMap.invalidateSize(), 250);
}

function saveProfileLocationFromModal() {
    const prov = document.getElementById('profileLocProvinceSelect')?.value || '';
    if (!prov) {
        alert('Select your province or governorate.');
        return;
    }
    if (profileLocDraftLat == null || profileLocDraftLon == null) {
        alert('Use “Use my current location” or open the map and place the pin where we should collect.');
        return;
    }
    const mapOpen = document.getElementById('profileLocMapWrap')?.style.display === 'block';
    syncPickupLocationToProfile(profileLocDraftLat, profileLocDraftLon, prov, mapOpen ? 'map' : 'gps', false);
    closeProfileLocationModal();
    showProfileToast('Address updated — tap Save changes at the bottom to keep it on this device.');
}

function initialsFromName(name) {
    if (!name || !String(name).trim()) return '?';
    return String(name).trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatUsernameDisplay(u) {
    const s = String(u || '').replace(/^@/, '').trim();
    return s ? '@' + s : '@';
}

function firstNameFromFull(name) {
    const t = String(name || '').trim();
    if (!t) return 'there';
    return t.split(/\s+/)[0];
}

function refreshUserFacingLabels(st) {
    const saved = st || readProfile();
    const fn = firstNameFromFull(saved.fullName);
    const greet = document.getElementById('sidebarGreeting');
    if (greet) greet.textContent = `Hello, ${fn}!`;

    const rank = levelDisplay ? levelDisplay.innerText.trim() : 'Seedling';
    const sub = document.getElementById('sidebarSubtitle');
    if (sub) sub.textContent = `${rank} · ReLeaf member`;

    const wt = document.getElementById('welcomeText');
    if (wt) wt.textContent = `Hi, ${fn}!`;

    const rankPill = document.getElementById('profileHeroRankLabel');
    if (rankPill) rankPill.textContent = rank;
}

function applyDashboardFromSavedProfile() {
    const saved = readProfile();
    const sb = document.getElementById('sidebarAvatar');
    const sbImg = document.getElementById('sidebarAvatarImg');
    const sbIn = document.getElementById('sidebarAvatarInitials');
    if (sbIn) sbIn.textContent = initialsFromName(saved.fullName);
    if (sbImg && sb) {
        if (saved.photo) {
            sbImg.src = saved.photo;
            sbImg.alt = '';
            sb.classList.add('has-photo');
        } else {
            sbImg.removeAttribute('src');
            sb.classList.remove('has-photo');
        }
    }
    syncSidebarCollectionCardFromProfile();
    refreshUserFacingLabels(saved);
}

function setProfileRowValue(field, text, muted) {
    const btn = document.querySelector(`[data-profile-field="${field}"]`);
    if (!btn) return;
    const val = btn.querySelector('.profile-field-value');
    if (!val) return;
    val.textContent = text;
    val.classList.toggle('profile-field-value--muted', !!muted);
}

function applyProfileToPage() {
    const st = profileState;
    const heroAvatar = document.getElementById('profileHeroAvatar');
    const heroImg = document.getElementById('profileHeroAvatarImg');
    const initialsEl = document.getElementById('profileHeroInitials');
    if (initialsEl) initialsEl.textContent = initialsFromName(st.fullName);
    const nameEl = document.getElementById('profileHeroName');
    if (nameEl) nameEl.textContent = st.fullName;
    const emailEl = document.getElementById('profileHeroEmail');
    if (emailEl) emailEl.textContent = st.email;
    const locDd = document.getElementById('profileDdLocation');
    if (locDd) locDd.textContent = formatProfileLocationSummaryFor(st);
    const locRow = document.getElementById('profileLocationRowValue');
    if (locRow) {
        locRow.textContent = formatProfileLocationSummaryFor(st);
        locRow.classList.toggle('profile-field-value--muted', !isDraftProfileLocationReady());
    }

    const sumName = document.getElementById('profileDdSummaryName');
    if (sumName) sumName.textContent = st.fullName || '—';
    const sumEmail = document.getElementById('profileDdSummaryEmail');
    if (sumEmail) sumEmail.textContent = st.email || '—';
    const sumPhone = document.getElementById('profileDdSummaryPhone');
    if (sumPhone) sumPhone.textContent = st.phone || '—';
    const userDd = document.getElementById('profileDdUsername');
    if (userDd) userDd.textContent = formatUsernameDisplay(st.username);

    if (heroImg && heroAvatar) {
        if (st.photo) {
            heroImg.src = st.photo;
            heroImg.alt = 'Profile photo';
            heroAvatar.classList.add('has-photo');
        } else {
            heroImg.removeAttribute('src');
            heroImg.alt = '';
            heroAvatar.classList.remove('has-photo');
        }
    }

    setProfileRowValue('fullName', st.fullName, false);
    setProfileRowValue('email', st.email, true);
    setProfileRowValue('phone', st.phone || 'Add phone number', !st.phone);
    setProfileRowValue('username', String(st.username || '').replace(/^@/, ''), false);
    const ph = document.getElementById('profilePasswordHint');
    if (ph) ph.textContent = formatPasswordStatusDisplay();

    const removeBtn = document.getElementById('profileRemovePhotoBtn');
    if (removeBtn) {
        removeBtn.disabled = !st.photo;
        removeBtn.style.opacity = st.photo ? '1' : '0.45';
    }
}

function showProfileToast(message) {
    const toast = document.getElementById('profileToast');
    const span = document.getElementById('profileToastText');
    if (span) span.textContent = message;
    if (!toast) return;
    toast.classList.add('show');
    refreshIcons();
    setTimeout(() => toast.classList.remove('show'), 2600);
}

function fileToProfileDataUrl(file, maxEdge) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.naturalWidth;
            let h = img.naturalHeight;
            if (w > maxEdge || h > maxEdge) {
                if (w >= h) {
                    h = Math.round((h * maxEdge) / w);
                    w = maxEdge;
                } else {
                    w = Math.round((w * maxEdge) / h);
                    h = maxEdge;
                }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
            try {
                const dataUrl =
                    mime === 'image/png'
                        ? canvas.toDataURL('image/png')
                        : canvas.toDataURL('image/jpeg', 0.88);
                resolve(dataUrl);
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('load'));
        };
        img.src = url;
    });
}

let profileEditField = null;

const profileFieldConfig = {
    fullName: { title: 'Full name', label: 'Full name', inputType: 'text', key: 'fullName' },
    email: { title: 'Email', label: 'Email address', inputType: 'email', key: 'email' },
    phone: { title: 'Phone number', label: 'Phone number', inputType: 'tel', key: 'phone' },
    username: { title: 'Username', label: 'Username (without @)', inputType: 'text', key: 'username' },
    password: { title: 'Update password', label: 'New password', inputType: 'password', confirm: true }
};

function openProfileEditModal(field) {
    if (field === 'profileLocation') {
        openProfileLocationModal();
        return;
    }

    const cfg = profileFieldConfig[field];
    if (!cfg) return;
    profileEditField = field;
    const modalEl = document.getElementById('profileEditModal');
    const std = document.getElementById('profileEditModalStandardFields');
    const label = document.getElementById('profileEditModalLabel');
    const input = document.getElementById('profileEditModalInput');
    const confirmWrap = document.getElementById('profileEditConfirmWrap');
    const confirmInput = document.getElementById('profileEditModalInputConfirm');
    const title = document.getElementById('profileEditModalTitle');
    if (!modalEl || !label || !input || !title) return;

    if (std) std.style.display = 'block';

    title.textContent = cfg.title;
    label.textContent = cfg.label;
    input.type = cfg.inputType || 'text';

    if (field === 'password') {
        input.value = '';
        input.autocomplete = 'new-password';
        if (confirmWrap) confirmWrap.style.display = 'block';
        if (confirmInput) confirmInput.value = '';
    } else {
        if (confirmWrap) confirmWrap.style.display = 'none';
        input.autocomplete = field === 'email' ? 'email' : 'name';
        const raw = profileState[cfg.key] || '';
        input.value = field === 'username' ? String(raw).replace(/^@/, '') : raw;
    }

    modalEl.style.display = 'grid';
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 50);
}

function closeProfileEditModal() {
    const modalEl = document.getElementById('profileEditModal');
    if (modalEl) modalEl.style.display = 'none';
    const std = document.getElementById('profileEditModalStandardFields');
    if (std) std.style.display = 'block';
    document.body.style.overflow = 'auto';
    profileEditField = null;
}

function openContactAdminModal() {
    const m = document.getElementById('contactAdminModal');
    const prev = document.getElementById('contactReplyEmailPreview');
    if (prev) prev.textContent = readProfile().email || 'Add an email in Profile';
    const ta = document.getElementById('contactMessage');
    if (ta) ta.value = '';
    if (m) {
        m.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }
    refreshIcons();
}

function closeContactAdminModal() {
    const m = document.getElementById('contactAdminModal');
    if (m) m.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initContactAdmin() {
    document.getElementById('contactBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openContactAdminModal();
    });
    document.getElementById('contactAdminClose')?.addEventListener('click', closeContactAdminModal);
    document.getElementById('contactSendBtn')?.addEventListener('click', () => {
        const msg = document.getElementById('contactMessage')?.value?.trim() || '';
        if (msg.length < 5) {
            alert('Please enter a short message (at least 5 characters).');
            return;
        }
        const topic = document.getElementById('contactTopic')?.value || 'General question';
        const saved = readProfile();
        const email = String(saved.email || '').trim();
        const phone = String(saved.phone || '').trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Add a valid email address in Profile so we can reply.');
            return;
        }
        if (!validPhone(phone)) {
            alert('Add a valid phone number in Profile so we can contact you quickly.');
            return;
        }
        const locLine = locationReady(saved)
            ? `Collection address: ${saved.profileProvince} (${Number(saved.profileLat).toFixed(5)}, ${Number(saved.profileLon).toFixed(5)})`
            : 'Collection address: not set in profile';
        const body = [
            `Name: ${saved.fullName}`,
            `Email: ${email}`,
            `Phone: ${phone}`,
            `Username: ${formatUsernameDisplay(saved.username)}`,
            locLine,
            '',
            msg
        ].join('\n');
        const url = `mailto:${RELEAF_ADMIN_EMAIL}?subject=${encodeURIComponent('[ReLeaf] ' + topic)}&body=${encodeURIComponent(body)}`;
        closeContactAdminModal();
        window.location.href = url;
    });
}

function commitProfileEdit() {
    const field = profileEditField;

    const cfg = profileFieldConfig[field];
    if (!cfg) return;
    const input = document.getElementById('profileEditModalInput');
    const confirmInput = document.getElementById('profileEditModalInputConfirm');
    if (!input) return;

    if (field === 'password') {
        const a = input.value;
        const b = confirmInput ? confirmInput.value : '';
        if (a.length < 8) {
            alert('Use at least 8 characters for your password.');
            return;
        }
        if (a !== b) {
            alert('Passwords do not match.');
            return;
        }
        profileState.passwordUpdatedAt = Date.now();
        applyProfileToPage();
        closeProfileEditModal();
        showProfileToast('Password timestamp updated — tap Save changes to store it on this device.');
        return;
    }

    let v = input.value.trim();
    if (field === 'email') {
        v = v.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
            alert('Enter a valid email address.');
            return;
        }
    }
    if (field === 'phone') {
        v = normalizePhone(v);
        if (!validPhone(v)) {
            alert('Enter a valid phone number (8-15 digits).');
            return;
        }
    }
    if (field === 'username') {
        v = v.replace(/^@/, '').replace(/\s/g, '');
        if (v.length < 3) {
            alert('Username should be at least 3 characters.');
            return;
        }
        const disk = readProfile();
        if (isUsernameTakenByOther(v, disk.username)) {
            alert('That username is already taken. Choose a different one.');
            return;
        }
    }
    if (field === 'fullName') {
        v = formatProperName(v);
        if (v.length < 2) {
            alert('Please enter a valid name (at least 2 characters).');
            return;
        }
    }

    profileState[cfg.key] = v;
    applyProfileToPage();
    closeProfileEditModal();
    showProfileToast('Applied — tap Save changes at the bottom to keep it on this device.');
}

function profileLocGpsFromModal() {
    if (!navigator.geolocation) {
        alert('Geolocation is not available in this browser.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            profileLocDraftLat = lat;
            profileLocDraftLon = lon;
            try {
                const r = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
                );
                const data = await r.json();
                const address = data.address || {};
                const rawLocationName = address.state || address.city || address.county || '';
                let matched = 'Amman';
                for (const prov of Object.keys(districtData)) {
                    if (rawLocationName.toLowerCase().includes(prov.toLowerCase())) {
                        matched = prov;
                        break;
                    }
                }
                const ps = document.getElementById('profileLocProvinceSelect');
                if (ps) ps.value = matched;
            } catch (_) {
                /* keep draft coords; user can pick province */
            }
            showProfileToast('GPS captured — tap Save collection address');
        },
        () => alert('GPS permission denied.')
    );
}

function initProfilePage() {
    profileState = readProfile();
    bootstrapUsernameRegistryForProfile();
    applyProfileToPage();
    hydrateLocationFromProfile();
    applyDashboardFromSavedProfile();

    document.getElementById('profileChangePhotoBtn')?.addEventListener('click', () => {
        const inp = document.getElementById('profilePhotoInput');
        if (inp) inp.value = '';
        inp?.click();
    });

    document.getElementById('profilePhotoInput')?.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Choose an image file (JPEG, PNG, WebP, or GIF).');
            return;
        }
        try {
            const dataUrl = await fileToProfileDataUrl(file, 512);
            profileState.photo = dataUrl;
            applyProfileToPage();
            showProfileToast('Photo updated — tap Save changes to keep it on this device.');
        } catch {
            alert('Could not use that image. Try another file.');
        }
    });

    document.getElementById('profileRemovePhotoBtn')?.addEventListener('click', () => {
        if (!profileState.photo) return;
        profileState.photo = null;
        applyProfileToPage();
        showProfileToast('Photo removed on this screen — tap Save changes to update storage.');
    });

    document.querySelectorAll('[data-profile-field]').forEach((btn) => {
        btn.addEventListener('click', () => openProfileEditModal(btn.getAttribute('data-profile-field')));
    });

    document.getElementById('profileLocationModalClose')?.addEventListener('click', closeProfileLocationModal);
    document.getElementById('profileLocationSaveBtn')?.addEventListener('click', saveProfileLocationFromModal);
    document.getElementById('profileLocGpsBtn')?.addEventListener('click', profileLocGpsFromModal);
    document.getElementById('profileLocShowMapBtn')?.addEventListener('click', () => {
        const w = document.getElementById('profileLocMapWrap');
        if (w) w.style.display = 'block';
        ensureProfileLocationMap();
    });

    document.getElementById('profileEditModalSave')?.addEventListener('click', commitProfileEdit);

    document.getElementById('profileEditModalClose')?.addEventListener('click', closeProfileEditModal);

    document.getElementById('profileEditModalInput')?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && profileEditField && profileEditField !== 'password') {
            ev.preventDefault();
            commitProfileEdit();
        }
    });

    document.getElementById('profileSaveBtn')?.addEventListener('click', () => {
        const disk = readProfile();
        const name = formatProperName(profileState.fullName || '');
        profileState.fullName = name;
        if (name.length < 2) {
            alert('Please enter your full name (at least 2 characters).');
            return;
        }
        const email = String(profileState.email || '').trim().toLowerCase();
        profileState.email = email;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Enter a valid email address before saving.');
            return;
        }
        const phone = normalizePhone(profileState.phone || '');
        profileState.phone = phone;
        if (!validPhone(phone)) {
            alert('Enter a valid phone number before saving.');
            return;
        }
        let u = String(profileState.username || '').replace(/^@/, '').replace(/\s/g, '');
        profileState.username = u;
        if (u.length < 3) {
            alert('Username should be at least 3 characters.');
            return;
        }
        if (isUsernameTakenByOther(u, disk.username)) {
            alert('That username is already taken. Choose a different one before saving.');
            return;
        }
        if (!safePersistProfile()) return;
        syncAuthUserAfterProfileSave(profileState, disk);
        applyUsernameRegistryAfterPersist(profileState.username, disk.username);
        applyProfileToPage();
        hydrateLocationFromProfile();
        applyDashboardFromSavedProfile();
        showProfileToast('Profile saved on this device');
    });

    document.getElementById('profileBackBtn')?.addEventListener('click', () => {
        document.getElementById('navDashboard')?.click();
    });

    document.addEventListener('keydown', (ev) => {
        if (ev.key !== 'Escape') return;
        const plm = document.getElementById('profileLocationModal');
        if (plm && plm.style.display === 'grid') {
            closeProfileLocationModal();
            return;
        }
        const cam = document.getElementById('contactAdminModal');
        if (cam && cam.style.display === 'grid') {
            closeContactAdminModal();
            return;
        }
        if (!profileEditField) return;
        const modalEl = document.getElementById('profileEditModal');
        if (modalEl && modalEl.style.display === 'grid') closeProfileEditModal();
    });

    initContactAdmin();
}

function initMap() {
    const startPos = userCoords ? userCoords : [31.9454, 35.9284];
    const zoomLevel = userCoords ? 15 : 13;
    if (!map) {
        map = L.map('mapContainer').setView(startPos, zoomLevel);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        marker = L.marker(startPos, {draggable: true}).addTo(map);
    } else {
        map.setView(startPos, zoomLevel);
        marker.setLatLng(startPos);
    }
}

const actionBtns = document.querySelectorAll('#actionToggle .seg-btn');
actionBtns.forEach(btn => {
    btn.onclick = () => {
        actionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAction = btn.getAttribute('data-val');
        const exchangeWrap = document.getElementById('exchangeChoiceWrap');
        if (exchangeWrap) exchangeWrap.style.display = selectedAction === 'exchange' ? 'block' : 'none';
    };
});

locBtns.forEach(btn => {
    btn.onclick = () => {
        locBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        locationMode = btn.getAttribute('data-mode');

        if (locationMode === 'manual') {
            manualFields.style.display = 'block';
            mapWrapper.style.display = 'none';
            provinceSelect.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (locationMode === 'gps') {
            manualFields.style.display = 'none';
            mapWrapper.style.display = 'block';
            districtSelect.disabled = true;
            districtSelect.innerHTML = '';
            setTimeout(() => {
                initMap();
                if(map) map.invalidateSize();
            }, 150);
        }
        refreshIcons();
    };
});

openBtn.onclick = () => {
    if (!isSavedProfileLocationReady()) {
        if (isLocationSet && userCoords && gpsProvince) {
            syncPickupLocationToProfile(userCoords[0], userCoords[1], gpsProvince, 'gps');
        } else {
            /* alert-mode removed to prevent flashing */
            displayAddress.innerText = 'SET LOCATION FIRST! 🚨';
            alert(
                'Set your collection address in Profile (GPS or map pin), or tap “Update GPS” in the sidebar. We need it to collect your paper or carton.'
            );
            return;
        }
    }
    modal.style.display = 'grid';
    document.body.style.overflow = 'hidden';
};

updateLocBtn.onclick = () => {
    updateLocBtn.innerText = "...";
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            userCoords = [lat, lon];
            isLocationSet = true;
            locCard.classList.remove('alert-mode');
            openBtn.classList.remove('locked');

            // --- CALL THE SEPARATE CODE HERE ---
            syncSidebarWithGPS(lat, lon);

            // Update Map UI
            updateLocBtn.innerText = "Update GPS";
            if (map) {
                map.setView(userCoords, 15);
                marker.setLatLng(userCoords);
            }
        }, () => {
            alert("GPS permission denied.");
            updateLocBtn.innerText = "Update GPS";
        });
    }
};

document.getElementById('recycleForm').onsubmit = (e) => {
    e.preventDefault();
    
    // 1. Identify which province was used (GPS variable or Dropdown)
    const finalProvince = (locationMode === 'gps') ? (gpsProvince || provinceSelect.value) : provinceSelect.value;

    if (!finalProvince) { 
        alert("Please select a Province."); 
        return; 
    } 

    // --- THE CRITICAL FIX ---
    // This line forces the sidebar to show the GPS location after the user hits 'Enter/Order'
    displayAddress.innerHTML = `<span style="color: #4caf50;">Location Set: ${finalProvince} ✅</span>`;
    // ----------------------

    if (locationMode === 'manual') {
        if (!districtSelect.value) {
            alert('Choose a district or area for manual entry.');
            return;
        }
    }
    
    const exchangeChoice = document.getElementById('exchangeChoice')?.value || '';
    if (!selectedAction) {
        alert(tr('Please select an Action Type.', 'يرجى اختيار نوع الإجراء.'));
        return;
    }
    if (selectedAction === 'exchange' && !exchangeChoice) {
        alert(tr('Please choose what you want to exchange for.', 'يرجى اختيار مكافأة الاستبدال.'));
        return;
    }
    if (!locationMode) {
        alert(tr('Choose how to specify the location for this request: “GPS / Map” or “Manual entry”.', 'اختر طريقة تحديد الموقع لهذا الطلب: الخريطة/GPS أو الإدخال اليدوي.'));
        return;
    }

    const weightVal = parseFloat(document.getElementById('weight').value);
    if (Number.isNaN(weightVal) || weightVal <= 0) {
        alert(tr('Please enter a valid weight.', 'يرجى إدخال وزن صحيح.'));
        return;
    }
    const minWeightEstimate = weightVal;
    const exchangeRulesForRequest = {
        artwork: { kg: 5, en: 'Recycled paper artwork', ar: 'لوحة فنية من ورق معاد تدويره' },
        paper_bundle: { kg: 10, en: 'Clean paper bundle', ar: 'باقة ورق نظيف' },
        stationery: { kg: 20, en: 'Eco stationery pack', ar: 'باقة قرطاسية صديقة للبيئة' },
        storage_boxes: { kg: 35, en: 'Recycled carton storage boxes', ar: 'صناديق تخزين من كرتون معاد تدويره' }
    };
    const selectedExchangeRuleForRequest = exchangeRulesForRequest[exchangeChoice] || null;
    const exchangeAvailableWeightForRequest = typeof releafExchangeAvailableWeight === 'function' ? releafExchangeAvailableWeight(weightVal) : weightVal;
    const exchangeRewardReadyForRequest = selectedAction === 'exchange' && selectedExchangeRuleForRequest && exchangeAvailableWeightForRequest >= selectedExchangeRuleForRequest.kg;
    if (selectedAction === 'exchange' && selectedExchangeRuleForRequest && !exchangeRewardReadyForRequest) {
        try {
            localStorage.setItem('releaf_exchange_goal_v1', JSON.stringify({ value: exchangeChoice, kg: selectedExchangeRuleForRequest.kg, savedAt: new Date().toISOString() }));
        } catch (err) {}
        alert(tr(
            `Your request will be sent, but this exchange reward will stay saved until your active saved requests reach ${selectedExchangeRuleForRequest.kg} kg.`,
            `سيتم إرسال طلبك، لكن مكافأة الاستبدال ستبقى محفوظة حتى يصل مجموع طلباتك النشطة إلى ${selectedExchangeRuleForRequest.kg} كغ.`
        ));
    }
    const availableSlot = document.getElementById('availableSlot')?.value || '';
    const requestDate = document.getElementById('collectionDate')?.value || '';
    const savedProfile = readProfile();
    if (!validPhone(savedProfile.phone)) {
        alert(tr('Add your phone number in Profile, then save, before submitting a request.', 'أضف رقم الهاتف في الملف الشخصي ثم احفظ قبل إرسال الطلب.'));
        return;
    }
    if (!requestDate) {
        alert(tr('Please choose your preferred collection date.', 'يرجى اختيار تاريخ الجمع المفضل.'));
        return;
    }
    if (!availableSlot) {
        alert(tr('Please choose your preferred collection time.', 'يرجى اختيار وقت الجمع المفضل.'));
        return;
    }
    const type = document.getElementById('paperStatus').value;
    const requestId = "#" + Math.floor(Math.random() * 9000 + 1000);
    const hub = recyclingHubs[finalProvince] || recyclingHubs["Default"];

    updateGlobalStats(totalWeightAccumulated + weightVal);
    
    const row = document.createElement('tr');
    row.innerHTML = `<td>${requestId}</td><td style="text-transform:capitalize;">${type}</td><td>${weightVal}kg</td><td><span class="status-pill" style="background: #856404;">${tr('Sent to Admin', 'تم الإرسال إلى الإدارة')}</span></td>`;
    activityTable.prepend(row);
    
    const container = document.getElementById('trackerContainer');
    const template = document.getElementById('trackerTemplate');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.trackID').innerText = requestId;
    clone.querySelector('.trackType').innerText = type.charAt(0).toUpperCase() + type.slice(1);
    const lblPartner = tr('Partner', 'الشريك');
    const lblAvailable = tr('Available', 'وقت التوفر');
    const lblMinimum = tr('Weight', 'الوزن');
    const lblExchange = tr('Exchange', 'الاستبدال');
    const exchangeLine = exchangeRewardReadyForRequest
        ? `<br><strong>${lblExchange}:</strong> ${escapeHtml(displayExchangeChoice(exchangeChoice))}`
        : (selectedAction === 'exchange' && selectedExchangeRuleForRequest
            ? `<br><strong>${tr('Saved exchange goal', 'هدف الاستبدال المحفوظ')}:</strong> ${escapeHtml(displayExchangeChoice(exchangeChoice))} (${tr('Required', 'المطلوب')}: ${selectedExchangeRuleForRequest.kg} kg · ${tr('Current total', 'المجموع الحالي')}: ${exchangeAvailableWeightForRequest} kg)`
            : '');
    clone.querySelector('.trackHub').innerHTML = `<strong>${lblPartner}:</strong> ${hub.name}<br><span style="opacity: 0.7;">${hub.info}</span><br><strong>${tr('Date', 'التاريخ')}:</strong> ${requestDate}<br><strong>${lblAvailable}:</strong> ${availableSlot}<br><strong>${lblMinimum}:</strong> ${minWeightEstimate} kg${exchangeLine}`;
    container.prepend(clone);

    const emptyRow = document.getElementById('emptyMsg');
    if (emptyRow) emptyRow.remove();

    const list = readStoredRequests();
    list.unshift({
        id: requestId,
        ownerUsername: typeof releafCurrentUsernameForRequests === 'function' ? releafCurrentUsernameForRequests() : '',
        type,
        weight: weightVal,
        status: 'sent',
        createdAt: new Date().toISOString(),
        hubName: hub.name,
        hubInfo: hub.info,
        availableSlot,
        requestDate,
        collectionDate: requestDate,
        minWeightEstimate,
        exchangeChoice: exchangeRewardReadyForRequest ? exchangeChoice : '',
        savedExchangeGoal: selectedAction === 'exchange' && !exchangeRewardReadyForRequest ? exchangeChoice : ''
    });
    writeStoredRequests(list);

    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Reset scrolling on submit
    e.target.reset();
    resetRecycleFormLocationFields();

    // Reset UI states
    actionBtns.forEach(b => b.classList.remove('active'));
    const exchangeWrap = document.getElementById('exchangeChoiceWrap');
    if (exchangeWrap) exchangeWrap.style.display = 'none';
    locBtns.forEach(b => b.classList.remove('active'));
    manualFields.style.display = 'none';
    mapWrapper.style.display = 'none';
    selectedAction = null;
    locationMode = null; 
    refreshIcons();
};

document.getElementById('closeBtn').onclick = () => { 
    modal.style.display = 'none'; 
    document.body.style.overflow = 'auto'; 
};

window.onclick = (e) => { 
    if (e.target == modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    if (e.target == cancelModal) resetCancelModal();
    const profileEditModal = document.getElementById('profileEditModal');
    if (e.target === profileEditModal) closeProfileEditModal();
    const contactAdminModal = document.getElementById('contactAdminModal');
    if (e.target === contactAdminModal) closeContactAdminModal();
    const profileLocationModal = document.getElementById('profileLocationModal');
    if (e.target === profileLocationModal) closeProfileLocationModal();
};



const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const keepLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        const keepLegacyLanguage = localStorage.getItem('lang');
        const keepTheme = localStorage.getItem('theme');
        localStorage.removeItem('currentUser');
        // Keep saved customer profile on sign out; it is removed only by Delete Account.
        localStorage.removeItem('adminName');
        if (keepLanguage) localStorage.setItem(LANGUAGE_STORAGE_KEY, keepLanguage);
        if (keepLegacyLanguage || keepLanguage) localStorage.setItem('lang', keepLegacyLanguage || keepLanguage);
        if (keepTheme) localStorage.setItem('theme', keepTheme);
        window.location.href = 'HH.html';
    });
}

const navLinks = document.querySelectorAll('.nav-links a:not(#contactBtn):not(#logoutBtn)');
const myRequestsPage = document.getElementById('myRequestsPage');

navLinks.forEach(link => {
    link.onclick = (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Identify the sections
        const statsRow = document.querySelector('.stats-row');
        const tableContainer = document.querySelector('.table-container');
        const trackerContainer = document.getElementById('trackerContainer');
        const topNav = document.querySelector('.top-nav');
        const weeklyFlowSection = document.getElementById('weeklyFlowSection'); /* requested no-flicker direct weekly section guard */
        const profileSection = document.getElementById('profileSection');
        const myRequestsPage = document.getElementById('myRequestsPage');

        if (link.id === "navProfile") {
            // HIDE Dashboard & My Requests
            statsRow.style.display = 'none';
            tableContainer.style.display = 'none';
            trackerContainer.style.display = 'none';
            topNav.style.display = 'none';
            myRequestsPage.style.display = 'none';
            if (weeklyFlowSection) weeklyFlowSection.style.display = 'none';
            
            // SHOW Profile
            profileSection.style.display = 'block';
            refreshIcons();
        } 
        else if (link.id === "navRequests") {
            // HIDE Dashboard & Profile
            statsRow.style.display = 'none';
            tableContainer.style.display = 'none';
            trackerContainer.style.display = 'none';
            topNav.style.display = 'none';
            profileSection.style.display = 'none';
            if (weeklyFlowSection) weeklyFlowSection.style.display = 'none';
            
            // SHOW My Requests
            myRequestsPage.style.display = 'block';
            renderDetailedRequests();
        } 
        else if (link.id === "navDashboard") {
            // SHOW Dashboard
            statsRow.style.display = 'grid'; 
            tableContainer.style.display = 'block';
            trackerContainer.style.display = 'flex';
            topNav.style.display = 'flex';
            if (weeklyFlowSection) weeklyFlowSection.style.display = '';
            
            // HIDE Others
            myRequestsPage.style.display = 'none';
            profileSection.style.display = 'none';
            applyDashboardFromSavedProfile();
            refreshIcons();
        }
    };
});

function filterRequests(mode) {
    const wrap = document.getElementById('myRequestsPage');
    if (!wrap) return;
    wrap.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
    const labels = { all: 'All', active: 'Active', completed: 'Completed' };
    wrap.querySelectorAll('.seg-btn').forEach((b) => {
        if (b.innerText.trim() === labels[mode]) b.classList.add('active');
    });
    const cards = document.querySelectorAll('#detailedRequestsList .stat-card');
    cards.forEach((card) => {
        const t = (card.innerText || '').toLowerCase();
        let show = true;
        if (mode === 'active') {
            show = t.includes('cancel') === false && (t.includes('sent') || t.includes('admin') || t.includes('await'));
        }
        if (mode === 'completed') {
            show = t.includes('cancel') || t.includes('complet') || t.includes('done');
        }
        card.style.display = show ? 'flex' : 'none';
    });
}

function renderDetailedRequests() {
    const list = document.getElementById('detailedRequestsList');
    list.innerHTML = ""; 
    const rows = Array.from(activityTable.rows);
    if (rows.length === 0 || (rows[0] && rows[0].id === 'emptyMsg')) {
        list.innerHTML = `<p style="text-align:center; opacity:0.5; padding:50px;">No history found.</p>`;
        return;
    }
    rows.forEach(row => {
        if (row.id === 'emptyMsg') return;
        const id = row.cells[0].innerText;
        const type = row.cells[1].innerText;
        const weight = row.cells[2].innerText;
        const statusHTML = row.cells[3].innerHTML;
        const card = document.createElement('div');
        card.className = "stat-card"; 
        card.style.cssText = "width: 100%; justify-content: space-between; padding: 20px 30px;";
        card.innerHTML = `<div style="display: flex; align-items: center; gap: 20px;"><div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px;"><i data-lucide="package" style="color: #4caf50;"></i></div><div><h4 style="margin:0; text-transform: capitalize;">${type} Recycling</h4><p style="margin:0; opacity:0.6; font-size:0.8rem;">ID: ${id} • ${weight}</p></div></div><div>${statusHTML}</div>`;
        list.appendChild(card);
    });
    refreshIcons();
    filterRequests('all');
}

window.onload = () => {
    hydrateOrdersFromStorage();
    initProfilePage();
    const lang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    const langSelect = document.getElementById('languageToggle');
    if (langSelect) {
        langSelect.value = lang;
        langSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    }
    applyLanguage(lang);
    refreshIcons();
};
/* ===== Exchange reward unlock rules (added only, no existing code removed) ===== */
(function () {
    const EXCHANGE_REWARD_RULES = {
        artwork: { kg: 5, en: 'Recycled paper artwork', ar: 'لوحة فنية من ورق معاد تدويره' },
        paper_bundle: { kg: 10, en: 'Clean paper bundle', ar: 'باقة ورق نظيف' },
        stationery: { kg: 20, en: 'Eco stationery pack', ar: 'باقة قرطاسية صديقة للبيئة' },
        storage_boxes: { kg: 35, en: 'Recycled carton storage boxes', ar: 'صناديق تخزين من كرتون معاد تدويره' }
    };

    function exchangeLang() {
        return document.documentElement.lang === 'ar' ? 'ar' : 'en';
    }

    function exchangeText(en, ar) {
        return exchangeLang() === 'ar' ? ar : en;
    }

    function selectedExchangeRule() {
        const select = document.getElementById('exchangeChoice');
        return select ? EXCHANGE_REWARD_RULES[select.value] : null;
    }

    function exchangeWeightValue() {
        const weightInput = document.getElementById('weight');
        const n = parseFloat(weightInput ? weightInput.value : '0');
        const currentEntry = Number.isFinite(n) ? n : 0;
        return typeof releafExchangeAvailableWeight === 'function' ? releafExchangeAvailableWeight(currentEntry) : currentEntry;
    }

    function ensureExchangeMessageBox() {
        const wrap = document.getElementById('exchangeChoiceWrap');
        if (!wrap) return null;
        let msg = document.getElementById('exchangeUnlockMsg');
        if (!msg) {
            msg = document.createElement('div');
            msg.id = 'exchangeUnlockMsg';
            msg.style.cssText = 'margin-top:10px;padding:10px 12px;border-radius:10px;font-size:.82rem;line-height:1.45;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#9ec3d4;';
            wrap.appendChild(msg);
        }
        return msg;
    }

    function refreshExchangeRewardRules() {
        const select = document.getElementById('exchangeChoice');
        if (!select) return;

        const kg = exchangeWeightValue();
        Array.from(select.options).forEach((option) => {
            const rule = EXCHANGE_REWARD_RULES[option.value];
            if (!rule) return;
            option.textContent = `${rule[exchangeLang()]} — ${exchangeText('requires', 'يتطلب')} ${rule.kg} ${exchangeText('kg', 'كغ')}`;
            option.disabled = false;
        });

        const msg = ensureExchangeMessageBox();
        const rule = selectedExchangeRule();
        if (!msg || !rule) return;

        if (!kg) {
            msg.style.borderColor = 'rgba(255,255,255,.12)';
            msg.style.color = document.documentElement.dataset.theme === 'dark' ? '#9ec3d4' : '#2f4156';
            msg.textContent = exchangeText(
                'Enter the paper/carton weight first. Your saved active request weights are counted together.',
                'أدخل وزن الورق أو الكرتون أولاً. يتم احتساب أوزان طلباتك النشطة المحفوظة معاً.'
            );
        } else if (kg >= rule.kg) {
            msg.style.borderColor = 'rgba(76,175,80,.35)';
            msg.style.color = document.documentElement.dataset.theme === 'dark' ? '#a5d6a7' : '#1f7a4d';
            msg.textContent = exchangeText(
                `Unlocked: this reward needs at least ${rule.kg} kg.`,
                `متاحة: هذه المكافأة تحتاج على الأقل ${rule.kg} كغ.`
            );
        } else {
            msg.style.borderColor = 'rgba(255,193,7,.38)';
            msg.style.color = document.documentElement.dataset.theme === 'dark' ? '#ffd36b' : '#8a6500';
            msg.textContent = exchangeText(
                `Not enough weight yet. This reward needs ${rule.kg} kg, and your current active total is ${kg} kg.`,
                `الوزن غير كافٍ حالياً. هذه المكافأة تحتاج ${rule.kg} كغ، ومجموع طلباتك النشطة الحالي ${kg} كغ.`
            );
        }
    }

    function validateExchangeRewardBeforeSubmit(event) {
        refreshExchangeRewardRules();
        return true;
    }

    window.releafRefreshExchangeRewardRules = refreshExchangeRewardRules;

    function installExchangeRewardRules() {
        const form = document.getElementById('recycleForm');
        const weightInput = document.getElementById('weight');
        const exchangeSelect = document.getElementById('exchangeChoice');
        const actionToggle = document.getElementById('actionToggle');
        if (!form || form.dataset.exchangeRulesInstalled === 'true') return;
        form.dataset.exchangeRulesInstalled = 'true';

        weightInput?.addEventListener('input', refreshExchangeRewardRules);
        exchangeSelect?.addEventListener('change', refreshExchangeRewardRules);
        actionToggle?.addEventListener('click', () => setTimeout(refreshExchangeRewardRules, 0));
        document.getElementById('languageToggle')?.addEventListener('change', () => setTimeout(refreshExchangeRewardRules, 50));

        const originalSubmit = form.onsubmit;
        form.onsubmit = function (event) {
            if (!validateExchangeRewardBeforeSubmit(event)) return false;
            return originalSubmit ? originalSubmit.call(this, event) : true;
        };

        refreshExchangeRewardRules();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installExchangeRewardRules);
    } else {
        installExchangeRewardRules();
    }
})();

/* ===== SAVE EXCHANGE GOAL + DELETE ACCOUNT (added only, no existing code removed) ===== */
(function () {
    const EXCHANGE_GOAL_KEY = 'releaf_exchange_goal_v1';
    const REWARD_RULES = {
        artwork: { kg: 5, en: 'Recycled paper artwork', ar: 'لوحة فنية من ورق معاد تدويره' },
        paper_bundle: { kg: 10, en: 'Clean paper bundle', ar: 'باقة ورق نظيف' },
        stationery: { kg: 20, en: 'Eco stationery pack', ar: 'باقة قرطاسية صديقة للبيئة' },
        storage_boxes: { kg: 35, en: 'Recycled carton storage boxes', ar: 'صناديق تخزين من كرتون معاد تدويره' }
    };
    const TXT = {
        en: { saveGoal: 'Save this reward goal', savedGoalTitle: 'Saved exchange goal', savedGoalEmpty: 'No exchange goal saved yet.', savedGoalReady: 'Ready now: you have enough weight for this saved reward.', savedGoalNeed: 'Saved: {reward}. Required: {need} kg. Current active total: {have} kg.', savedGoalAlert: 'Saved. You can exchange for this reward once your active request total reaches {need} kg.', deleteAccount: 'Delete account', deleteConfirm: 'This will delete your account, profile, saved requests, and sign-in data from this device. Continue?', deleteBlocked: 'You cannot delete your account while you still have an active request. Cancel or finish active requests first.', deleteDone: 'Your account was deleted.', activeHint: 'Account deletion is available only when there are no active requests.' },
        ar: { saveGoal: 'حفظ هدف الاستبدال', savedGoalTitle: 'هدف الاستبدال المحفوظ', savedGoalEmpty: 'لا يوجد هدف استبدال محفوظ حالياً.', savedGoalReady: 'جاهز الآن: لديك وزن كافٍ لهذه المكافأة المحفوظة.', savedGoalNeed: 'تم الحفظ: {reward}. المطلوب: {need} كغ. مجموع الطلبات النشطة الحالي: {have} كغ.', savedGoalAlert: 'تم الحفظ. يمكنك الاستبدال بهذه المكافأة عندما يصل مجموع طلباتك النشطة إلى {need} كغ.', deleteAccount: 'حذف الحساب', deleteConfirm: 'سيتم حذف حسابك وملفك الشخصي وطلباتك وبيانات تسجيل الدخول من هذا الجهاز. هل تريد المتابعة؟', deleteBlocked: 'لا يمكنك حذف الحساب بينما يوجد طلب قيد التنفيذ. ألغِ الطلبات النشطة أو انتظر اكتمالها أولاً.', deleteDone: 'تم حذف حسابك.', activeHint: 'حذف الحساب متاح فقط عند عدم وجود طلبات نشطة.' }
    };
    function curLang(){ return document.documentElement.lang === 'ar' ? 'ar' : 'en'; }
    function t(key, vars){ let out = (TXT[curLang()] && TXT[curLang()][key]) || TXT.en[key] || key; Object.keys(vars || {}).forEach(k => out = out.replace('{' + k + '}', vars[k])); return out; }
    function currentWeight(){ const n = parseFloat(document.getElementById('weight')?.value || '0'); const entry = Number.isFinite(n) ? n : 0; return typeof releafExchangeAvailableWeight === 'function' ? releafExchangeAvailableWeight(entry) : entry; }
    function selectedRewardRule(){ const value = document.getElementById('exchangeChoice')?.value || ''; const rule = REWARD_RULES[value]; return rule ? { value, ...rule } : null; }
    function readGoal(){ try { return JSON.parse(localStorage.getItem(EXCHANGE_GOAL_KEY) || 'null'); } catch(e){ return null; } }
    function writeGoal(goal){ localStorage.setItem(EXCHANGE_GOAL_KEY, JSON.stringify(goal)); }
    function ensureGoalUI(){
        const wrap = document.getElementById('exchangeChoiceWrap');
        if (!wrap) return null;
        let box = document.getElementById('exchangeGoalBox');
        if (!box) {
            const btn = document.createElement('button');
            btn.type = 'button'; btn.id = 'saveExchangeGoalBtn';
            btn.style.cssText = 'width:100%;margin-top:10px;padding:11px 12px;border-radius:12px;border:1px solid rgba(95,143,162,.45);background:rgba(95,143,162,.14);color:var(--text,#2f4156);font-weight:800;cursor:pointer;';
            wrap.appendChild(btn);
            box = document.createElement('div'); box.id = 'exchangeGoalBox';
            box.style.cssText = 'margin-top:10px;padding:10px 12px;border-radius:10px;font-size:.82rem;line-height:1.45;border:1px dashed rgba(95,143,162,.35);background:rgba(95,143,162,.08);color:var(--text,#2f4156);';
            wrap.appendChild(box);
            btn.addEventListener('click', function(){ const rule = selectedRewardRule(); if(!rule){ alert(curLang()==='ar'?'اختر مكافأة الاستبدال أولاً.':'Choose an exchange reward first.'); return; } writeGoal({ value: rule.value, kg: rule.kg, savedAt: new Date().toISOString() }); alert(t('savedGoalAlert', { need: rule.kg })); refreshGoalUI(); });
        }
        return box;
    }
    function refreshGoalUI(){
        const box = ensureGoalUI(); const btn = document.getElementById('saveExchangeGoalBtn'); if (btn) { btn.textContent = t('saveGoal'); btn.disabled=false; btn.removeAttribute('disabled'); btn.style.opacity='1'; btn.style.pointerEvents='auto'; btn.style.cursor='pointer'; btn.style.background=document.documentElement.dataset.theme==='dark'?'rgba(95,143,162,.24)':'rgba(95,143,162,.18)'; btn.style.color=document.documentElement.dataset.theme==='dark'?'#edf7fb':'#243447'; btn.style.border='1px solid rgba(95,143,162,.6)'; } if(!box) return;
        const goal = readGoal();
        if(!goal || !REWARD_RULES[goal.value]) { box.style.color = 'var(--text,#2f4156)'; box.textContent = t('savedGoalEmpty'); return; }
        const have = currentWeight(); const rule = REWARD_RULES[goal.value]; const title = t('savedGoalTitle');
        if(have >= rule.kg){ box.style.borderColor = 'rgba(76,175,80,.38)'; box.style.color = document.documentElement.dataset.theme === 'dark' ? '#a5d6a7' : '#1f7a4d'; box.textContent = `${title}: ${rule[curLang()]} — ${t('savedGoalReady')}`; }
        else { box.style.borderColor = 'rgba(136,205,224,.35)'; box.style.color = 'var(--text,#2f4156)'; box.textContent = `${title}: ` + t('savedGoalNeed', { reward: rule[curLang()], need: rule.kg, have: have || 0 }); }
    }
    function unlockRewardSelectionWithoutRemovingValidation(){ if (typeof window.releafRefreshExchangeRewardRules === 'function') window.releafRefreshExchangeRewardRules(); refreshGoalUI(); }
    function hasActiveRequests(){ let list=[]; try { list = typeof readStoredRequests === 'function' ? readStoredRequests() : JSON.parse(localStorage.getItem('releaf_requests_v1') || '[]'); } catch(e){} const closed = ['canceled','cancelled','completed','complete','done','delivered','finished']; return list.some(r => !closed.includes(String(r.status || '').toLowerCase())); }
    function deleteFromUsers(profile){ const username = String(profile?.username || '').toLowerCase(); const email = String(profile?.email || '').toLowerCase(); const users = JSON.parse(localStorage.getItem('users') || '[]'); const next = users.filter(u => String(u.username || '').toLowerCase() !== username && String(u.email || '').toLowerCase() !== email); localStorage.setItem('users', JSON.stringify(next)); }
    function removeRegistryName(profile){ try { const key = typeof USERNAME_REGISTRY_KEY !== 'undefined' ? USERNAME_REGISTRY_KEY : 'releaf_username_registry_v1'; const username = String(profile?.username || '').toLowerCase(); const registry = JSON.parse(localStorage.getItem(key) || '{}'); if(username && registry[username]) delete registry[username]; localStorage.setItem(key, JSON.stringify(registry)); } catch(e){} }
    function installDeleteAccountUI(){
        const actions = document.querySelector('.profile-footer-actions'); if(!actions || document.getElementById('deleteAccountBtn')) return;
        const btn = document.createElement('button'); btn.type = 'button'; btn.id = 'deleteAccountBtn'; btn.className = 'profile-btn profile-btn--ghost'; btn.style.cssText = 'border-color:rgba(255,68,68,.45);color:#ff8888;';
        const hint = document.createElement('div'); hint.id = 'deleteAccountHint'; hint.style.cssText = 'flex-basis:100%;font-size:.78rem;color:rgba(200,217,230,.65);text-align:right;';
        actions.insertBefore(btn, actions.firstChild); actions.appendChild(hint);
        btn.addEventListener('click', function(){
            if(hasActiveRequests()){ alert(t('deleteBlocked')); return; }
            if(!confirm(t('deleteConfirm'))) return;
            const profile = typeof readProfile === 'function' ? readProfile() : JSON.parse(localStorage.getItem('releaf_profile_v1') || '{}');
            deleteFromUsers(profile); removeRegistryName(profile);
            localStorage.removeItem('currentUser'); localStorage.removeItem('releaf_profile_v1'); localStorage.removeItem('releaf_requests_v1'); localStorage.removeItem(EXCHANGE_GOAL_KEY);
            alert(t('deleteDone')); window.location.href = 'HH.html';
        });
        refreshDeleteAccountUI();
    }
    function refreshDeleteAccountUI(){ const btn = document.getElementById('deleteAccountBtn'); const hint = document.getElementById('deleteAccountHint'); if(btn) btn.textContent = t('deleteAccount'); if(hint) hint.textContent = t('activeHint'); }
    function refreshAllAdditions(){ unlockRewardSelectionWithoutRemovingValidation(); refreshDeleteAccountUI(); }
    function installAdditions(){ installDeleteAccountUI(); document.getElementById('weight')?.addEventListener('input', () => setTimeout(refreshAllAdditions, 0)); document.getElementById('exchangeChoice')?.addEventListener('change', () => setTimeout(refreshAllAdditions, 0)); document.getElementById('actionToggle')?.addEventListener('click', () => setTimeout(refreshAllAdditions, 20)); document.getElementById('languageToggle')?.addEventListener('change', () => setTimeout(refreshAllAdditions, 80)); setInterval(refreshAllAdditions, 800); refreshAllAdditions(); }
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installAdditions); else installAdditions();
})();

/* ===== SAVE REWARD GOAL BUTTON CLICK FIX (added only) ===== */
(function(){
  function fixSaveGoalButton(){
    const btn = document.getElementById('saveExchangeGoalBtn');
    if(!btn) return;
    btn.disabled = false;
    btn.removeAttribute('disabled');
    btn.style.pointerEvents = 'auto';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
    const isDark = document.documentElement.dataset.theme === 'dark';
    btn.style.background = isDark ? 'rgba(95,143,162,.24)' : 'rgba(95,143,162,.18)';
    btn.style.color = isDark ? '#edf7fb' : '#243447';
    btn.style.border = '1px solid rgba(95,143,162,.6)';
  }
  document.addEventListener('DOMContentLoaded', fixSaveGoalButton);
  document.addEventListener('click', function(){ setTimeout(fixSaveGoalButton, 0); });
  document.addEventListener('input', function(){ setTimeout(fixSaveGoalButton, 0); });
  document.addEventListener('change', function(){ setTimeout(fixSaveGoalButton, 0); });
  setInterval(fixSaveGoalButton, 700);
})();


/* ===== Persistent language/theme sync across ReLeaf pages (added only) ===== */
(function(){
  const PRO_LANG='releaf_language_v1', LEGACY_LANG='lang', PRO_THEME='releaf_theme_v1', LEGACY_THEME='theme';
  function normalizeLang(v){ return v === 'ar' ? 'ar' : 'en'; }
  function normalizeTheme(v){ return v === 'dark' ? 'dark' : 'light'; }
  function syncFromAnyStorage(){
    const lang = normalizeLang(localStorage.getItem(PRO_LANG) || localStorage.getItem(LEGACY_LANG) || document.documentElement.lang || 'en');
    const theme = normalizeTheme(localStorage.getItem(PRO_THEME) || localStorage.getItem(LEGACY_THEME) || document.documentElement.dataset.theme || 'light');
    localStorage.setItem(PRO_LANG, lang); localStorage.setItem(LEGACY_LANG, lang);
    localStorage.setItem(PRO_THEME, theme); localStorage.setItem(LEGACY_THEME, theme);
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    const sel = document.getElementById('languageToggle'); if(sel) sel.value = lang;
  }
  syncFromAnyStorage();
  window.addEventListener('storage', syncFromAnyStorage);
  document.addEventListener('DOMContentLoaded', function(){
    syncFromAnyStorage();
    document.getElementById('languageToggle')?.addEventListener('change', function(e){ const lang=normalizeLang(e.target.value); localStorage.setItem(PRO_LANG, lang); localStorage.setItem(LEGACY_LANG, lang); });
    document.getElementById('themeToggle')?.addEventListener('click', function(){ setTimeout(function(){ const theme=normalizeTheme(document.documentElement.dataset.theme || localStorage.getItem(PRO_THEME) || localStorage.getItem(LEGACY_THEME)); localStorage.setItem(PRO_THEME, theme); localStorage.setItem(LEGACY_THEME, theme); }, 30); });
  });
})();

/* ===== Professional action wording + light-mode readable helper text (added only) ===== */
(function(){
  function isAr(){ return document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl'; }
  function professionalSellLabel(){ return isAr() ? 'تحصيل مدفوع' : 'Paid collection'; }
  function improveActionWording(){
    document.querySelectorAll('[data-val="sell"], .seg-btn[data-val="sell"]').forEach(function(btn){
      btn.textContent = professionalSellLabel();
      btn.setAttribute('aria-label', professionalSellLabel());
    });
    document.querySelectorAll('option[value="sell"]').forEach(function(opt){ opt.textContent = professionalSellLabel(); });
  }
  function improveLightText(){
    const light = document.documentElement.dataset.theme !== 'dark';
    if(!light) return;
    ['exchangeGoalBox','deleteAccountHint'].forEach(function(id){
      const el = document.getElementById(id);
      if(el){ el.style.color = id === 'deleteAccountHint' ? '#5f7084' : '#2f4156'; el.style.opacity = '1'; }
    });
  }
  function run(){ improveActionWording(); improveLightText(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  document.addEventListener('click', function(){ setTimeout(run, 20); });
  document.addEventListener('change', function(){ setTimeout(run, 40); });
  document.addEventListener('input', function(){ setTimeout(run, 40); });
  setInterval(run, 700);
})();

/* ===== FINAL CUSTOMER/ADMIN SYNC PATCH: credentials, request status, notes, cancellation reason ===== */
(function(){
  const REQUESTS_KEY = 'releaf_requests_v1';
  const PROFILE_KEY = 'releaf_profile_v1';
  function safeJson(key, fallback){ try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function saveJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function currentUserObj(){ return safeJson('currentUser', null) || {}; }
  function currentOwner(){ const u=currentUserObj(); const p=safeJson(PROFILE_KEY, {}) || {}; return String((p.username || u.username || '')).trim().toLowerCase(); }
  function currentEmail(){ const u=currentUserObj(); const p=safeJson(PROFILE_KEY, {}) || {}; return String((p.email || u.email || '')).trim().toLowerCase(); }
  function normalizeReq(r){
    if(!r || !r.id) return null;
    return {
      ...r,
      id: String(r.id),
      type: String(r.type || ''),
      weight: Number(r.weight) || 0,
      status: String(r.status || 'sent').toLowerCase(),
      ownerUsername: String(r.ownerUsername || '').trim().toLowerCase(),
      ownerEmail: String(r.ownerEmail || '').trim().toLowerCase(),
      ownerName: r.ownerName || '',
      ownerPhone: r.ownerPhone || '',
      notes: r.notes || '',
      action: r.action || (r.exchangeChoice || r.savedExchangeGoal ? 'exchange' : ''),
      adminName: r.adminName || r.handledBy || '',
      driverName: r.driverName || '',
      driverPhone: r.driverPhone || r.driverMobile || '',
      eta: r.eta || r.pickupEta || '',
      adminNote: r.adminNote || '',
      cancelReason: r.cancelReason || ''
    };
  }
  window.readStoredRequests = readStoredRequests = function(){
    const all = (safeJson(REQUESTS_KEY, []) || []).map(normalizeReq).filter(Boolean);
    const owner = currentOwner(); const email = currentEmail();
    if(!owner && !email) return all;
    return all.filter(r => !r.ownerUsername && !r.ownerEmail ? true : (owner && r.ownerUsername === owner) || (email && r.ownerEmail === email));
  };
  window.releafReadAllRequests = function(){ return (safeJson(REQUESTS_KEY, []) || []).map(normalizeReq).filter(Boolean); };
  window.writeStoredRequests = writeStoredRequests = function(list){
    const incoming = (Array.isArray(list) ? list : []).map(normalizeReq).filter(Boolean);
    const all = window.releafReadAllRequests();
    const map = new Map(all.map(r => [r.id, r]));
    incoming.forEach(r => map.set(r.id, r));
    saveJson(REQUESTS_KEY, Array.from(map.values()));
  };
  window.markRequestCanceled = markRequestCanceled = function(requestId){
    const all = window.releafReadAllRequests();
    const reasonSel = document.getElementById('cancelReason');
    const otherTxt = document.getElementById('otherReasonText');
    const reasonValue = reasonSel ? reasonSel.value : '';
    const reason = reasonValue === 'other' ? (otherTxt?.value || 'Other') : (reasonValue || 'Canceled by customer');
    const next = all.map(r => r.id === requestId ? {...r, status:'canceled', cancelReason: reason, canceledAt: new Date().toISOString()} : r);
    saveJson(REQUESTS_KEY, next);
    setTimeout(function(){ if(typeof hydrateOrdersFromStorage==='function') hydrateOrdersFromStorage(); }, 50);
  };
  const oldSync = typeof syncAuthUserAfterProfileSave === 'function' ? syncAuthUserAfterProfileSave : null;
  window.syncAuthUserAfterProfileSave = syncAuthUserAfterProfileSave = function(savedProfile, previousSavedProfile){
    if(oldSync) oldSync(savedProfile, previousSavedProfile);
    try{
      const users = safeJson('users', []) || [];
      const current = safeJson('currentUser', {}) || {};
      const oldU = String(previousSavedProfile?.username || current.username || '').trim().toLowerCase();
      const oldE = String(previousSavedProfile?.email || current.email || '').trim().toLowerCase();
      const newU = String(savedProfile?.username || current.username || '').replace(/^@/,'').trim();
      const newE = String(savedProfile?.email || current.email || '').trim().toLowerCase();
      const fullName = String(savedProfile?.fullName || '').trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const pendingPass = savedProfile?._pendingPassword || '';
      let patchedUser = null;
      const nextUsers = users.map(u => {
        const match = String(u.username || '').trim().toLowerCase() === oldU || String(u.email || '').trim().toLowerCase() === oldE || String(u.username || '').trim().toLowerCase() === String(current.username || '').trim().toLowerCase();
        if(!match) return u;
        patchedUser = {...u, firstName: parts[0] || u.firstName || '', lastName: parts.slice(1).join(' ') || u.lastName || '', username: newU || u.username, email: newE || u.email, phone: savedProfile.phone || u.phone || '', password: pendingPass || u.password};
        return patchedUser;
      });
      if(patchedUser){ localStorage.setItem('users', JSON.stringify(nextUsers)); localStorage.setItem('currentUser', JSON.stringify(patchedUser)); }
      const all = window.releafReadAllRequests();
      const nextReqs = all.map(r => {
        const match = (oldU && r.ownerUsername === oldU) || (oldE && r.ownerEmail === oldE);
        return match ? {...r, ownerUsername: String(newU).toLowerCase(), ownerEmail: newE, ownerName: fullName || r.ownerName, ownerPhone: savedProfile.phone || r.ownerPhone} : r;
      });
      saveJson(REQUESTS_KEY, nextReqs);
      if(savedProfile && savedProfile._pendingPassword){ delete savedProfile._pendingPassword; localStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile)); }
    }catch(e){}
  };
  const oldCommit = typeof commitProfileEdit === 'function' ? commitProfileEdit : null;
  window.commitProfileEdit = commitProfileEdit = function(){
    if(profileEditField === 'password'){
      const input = document.getElementById('profileEditModalInput');
      const confirmInput = document.getElementById('profileEditModalInputConfirm');
      const a = input?.value || '', b = confirmInput?.value || '';
      if(a.length < 8){ alert('Use at least 8 characters for your password.'); return; }
      if(a !== b){ alert('Passwords do not match.'); return; }
      profileState._pendingPassword = a;
      profileState.passwordUpdatedAt = Date.now();
      applyProfileToPage(); closeProfileEditModal(); showProfileToast('Password updated — tap Save changes to use it for your next login.');
      return;
    }
    return oldCommit ? oldCommit() : undefined;
  };
  const oldSubmit = document.getElementById('recycleForm')?.onsubmit;
  document.addEventListener('submit', function(ev){
    if(ev.target && ev.target.id === 'recycleForm'){
      setTimeout(function(){
        const all = window.releafReadAllRequests();
        const owner = currentOwner(); const email = currentEmail(); const p = typeof readProfile === 'function' ? readProfile() : safeJson(PROFILE_KEY, {});
        const notes = document.getElementById('notes')?.value || '';
        const action = typeof selectedAction !== 'undefined' ? selectedAction : '';
        const province = p.profileProvince || '';
        const district = document.getElementById('district')?.value || '';
        const latest = all.find(r => !r.ownerUsername && !r.ownerEmail) || all.find(r => r.ownerUsername===owner || r.ownerEmail===email);
        if(latest){
          const next = all.map(r => r.id === latest.id ? {...r, ownerUsername: owner, ownerEmail: email, ownerName: p.fullName || '', ownerPhone: p.phone || '', notes, action, province, district, profileLat: p.profileLat, profileLon: p.profileLon} : r);
          saveJson(REQUESTS_KEY, next);
        }
      }, 80);
    }
  }, true);
  function statusLabel(req){
    const s=String(req.status||'sent').trim().toLowerCase().replace(/[\s-]+/g,'_');
    if(s==='canceled') return tr('Canceled','تم الإلغاء');
    if(s==='completed') return tr('Completed','مكتمل');
    if(s==='driver_en_route' || s==='driver' || s==='driver_on_the_way') return tr('Driver En Route','السائق بالطريق');
    if(s==='assigned' || s==='handled' || s==='approved' || s==='admin_approved' || req.adminName) return tr('Approved','تمت الموافقة');
    return tr('Awaiting Approval','بانتظار الموافقة');
  }
  window.hydrateOrdersFromStorage = hydrateOrdersFromStorage = function(){
    if(!activityTable) return;
    const list = readStoredRequests(); const container=document.getElementById('trackerContainer'); const template=document.getElementById('trackerTemplate');
    activityTable.innerHTML=''; if(container) container.innerHTML='';
    if(!list.length){ activityTable.innerHTML='<tr id="emptyMsg"><td colspan="4" style="text-align:center; opacity:0.5; padding: 40px;">No requests yet. Add your first collection request!</td></tr>'; updateGlobalStats(0); return; }
    list.forEach(req=>{
      const s=String(req.status||'sent').toLowerCase();
      const bg=s==='canceled'?'#ff4444':s==='completed'?'#2f9e66':(s==='driver_en_route'||s==='assigned'||s==='handled')?'#5f8fa2':'#856404';
      const row=document.createElement('tr'); row.innerHTML=`<td>${escapeHtml(req.id)}</td><td style="text-transform:capitalize;">${escapeHtml(req.type)}</td><td>${req.weight}kg</td><td><span class="status-pill" style="background:${bg};">${escapeHtml(statusLabel(req))}</span></td>`; activityTable.appendChild(row);
    });
    if(container && template){
      list.filter(r=>!['canceled','completed'].includes(String(r.status).toLowerCase())).forEach(req=>{
        const clone=template.content.cloneNode(true); clone.querySelector('.trackID').innerText=req.id; clone.querySelector('.trackType').innerText=statusLabel(req);
        const s=String(req.status||'sent').toLowerCase();
        const steps=clone.querySelectorAll('.progress-dot'); if(steps[0]) steps[0].classList.add('active'); if(['handled','assigned','driver_en_route','completed'].includes(s) && steps[1]) steps[1].classList.add('active'); if(['driver_en_route','completed'].includes(s) && steps[2]) steps[2].classList.add('active');
        const bottom=clone.querySelector('.tracker-note, .arrival-bottom, .card-bottom');
        const exchangeLine=req.exchangeChoice?`<br><strong>${tr('Exchange','الاستبدال')}:</strong> ${escapeHtml(displayExchangeChoice(req.exchangeChoice))}`:req.savedExchangeGoal?`<br><strong>${tr('Saved exchange goal','هدف الاستبدال المحفوظ')}:</strong> ${escapeHtml(displayExchangeChoice(req.savedExchangeGoal))}`:'';
        const adminLines=(req.adminName?`<br><strong>${tr('Assigned admin','الأدمن المسؤول')}:</strong> ${escapeHtml(req.adminName)}`:'')+(req.driverName?`<br><strong>${tr('Driver / ETA','السائق / الوقت')}:</strong> ${escapeHtml(req.driverName)}${(req.driverPhone || req.driverMobile) ? ' · ' + escapeHtml(req.driverPhone || req.driverMobile) : ''}${req.eta?' · '+escapeHtml(req.eta):''}`:'')+(req.adminNote?`<br><strong>${tr('Admin note','ملاحظة الأدمن')}:</strong> ${escapeHtml(req.adminNote)}`:'');
        clone.querySelector('.trackHub').innerHTML=`<strong>${tr('Partner','الشريك')}:</strong> ${escapeHtml(req.hubName||recyclingHubs.Default.name)}<br><span style="opacity:.7;">${escapeHtml(req.hubInfo||recyclingHubs.Default.info)}</span><br><strong>${tr('Available','وقت التوفر')}:</strong> ${escapeHtml(req.availableSlot||'')}<br><strong>${tr('Weight','الوزن')}:</strong> ${req.weight} kg<br><strong>${tr('Action','الإجراء')}:</strong> ${escapeHtml(req.action||'')}${exchangeLine}${adminLines}`;
        const noteEl=clone.querySelector('.templateBottom, .trackBottom, .arrival-note, p:last-child');
        if(noteEl) noteEl.textContent=s==='driver_en_route'?tr('Your pickup driver is on the way.','السائق في الطريق لاستلام الطلب.'):s==='completed'?tr('This request is completed.','تم إكمال هذا الطلب.'):s==='assigned'||s==='handled'?tr('Your request is approved and being prepared.','تمت الموافقة على طلبك ويتم تجهيزه.'):tr('Once the admin reviews your request, your estimated arrival time will appear here.','بعد مراجعة الإدارة سيظهر وقت الوصول المتوقع هنا.');
        container.appendChild(clone);
      }); refreshIcons();
    }
    updateGlobalStats(list.filter(r=>!['canceled'].includes(String(r.status).toLowerCase())).reduce((s,r)=>s+r.weight,0));
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(hydrateOrdersFromStorage, 120); });
})();

/* ===== EXTRA SAFE REQUEST OWNER/NOTE FILL AT SAVE TIME ===== */
(function(){
  const REQUESTS_KEY='releaf_requests_v1', PROFILE_KEY='releaf_profile_v1';
  function safeJson(key, fallback){ try{ const v=JSON.parse(localStorage.getItem(key)||'null'); return v==null?fallback:v; }catch(e){ return fallback; } }
  function saveJson(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  const previousWrite = typeof writeStoredRequests === 'function' ? writeStoredRequests : null;
  window.writeStoredRequests = writeStoredRequests = function(list){
    const profile = typeof readProfile === 'function' ? readProfile() : safeJson(PROFILE_KEY, {});
    const current = safeJson('currentUser', {}) || {};
    const owner = String(profile.username || current.username || '').trim().toLowerCase();
    const email = String(profile.email || current.email || '').trim().toLowerCase();
    const notes = document.getElementById('notes')?.value || '';
    const action = typeof selectedAction !== 'undefined' ? selectedAction : '';
    const district = document.getElementById('district')?.value || '';
    const filled = (Array.isArray(list)?list:[]).map(r => ({
      ...r,
      ownerUsername: r.ownerUsername || owner,
      ownerEmail: r.ownerEmail || email,
      ownerName: r.ownerName || profile.fullName || [current.firstName,current.lastName].filter(Boolean).join(' '),
      ownerPhone: r.ownerPhone || profile.phone || current.phone || '',
      notes: r.notes || notes,
      action: r.action || action,
      province: r.province || profile.profileProvince || '',
      district: r.district || district,
      profileLat: r.profileLat ?? profile.profileLat ?? '',
      profileLon: r.profileLon ?? profile.profileLon ?? ''
    }));
    const all = (safeJson(REQUESTS_KEY, []) || []);
    const map = new Map(all.map(r => [r.id, r]));
    filled.forEach(r => map.set(r.id, {...(map.get(r.id)||{}), ...r}));
    saveJson(REQUESTS_KEY, Array.from(map.values()));
  };
})();

/* ===== CUSTOMER TRACKER VISUAL STATUS BADGE FIX ===== */
(function(){
  function applyTrackerVisuals(){
    const cards=document.querySelectorAll('#trackerContainer .arrival-card');
    const reqs=(window.releafReadAllRequests?window.releafReadAllRequests():[]);
    cards.forEach(card=>{
      const id=card.querySelector('.trackID')?.innerText||'';
      const req=reqs.find(r=>r.id===id); if(!req) return;
      const s=String(req.status||'sent').trim().toLowerCase().replace(/[\s-]+/g,'_');
      const driverLike = ['driver_en_route','driver','driver_on_the_way','completed'].includes(s);
      const approvedLike = driverLike || ['assigned','handled','approved','admin_approved'].includes(s) || !!req.adminName;
      const badge=card.querySelector('.status-badge');
      if(badge){
        badge.textContent = driverLike?tr('DRIVER EN ROUTE','السائق بالطريق'):s==='completed'?tr('COMPLETED','مكتمل'):approvedLike?tr('APPROVED','تمت الموافقة'):tr('AWAITING APPROVAL','بانتظار الموافقة');
        badge.style.background = (approvedLike||s==='completed')?'rgba(95,143,162,.18)':'rgba(255,193,7,.1)';
        badge.style.color = (approvedLike||s==='completed')?'#88cde0':'#ffc107';
      }
      const dots=card.querySelectorAll('div[style*="border-radius: 50%"]');
      if(dots[1] && approvedLike) dots[1].style.background='#4caf50';
      if(dots[2] && driverLike) dots[2].style.background='#4caf50';
      const smalls=card.querySelectorAll('small');
      if(smalls[2] && approvedLike) smalls[2].style.opacity='0.9';
      if(smalls[3] && driverLike) smalls[3].style.opacity='0.9';
    });
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(applyTrackerVisuals,300));
  setInterval(applyTrackerVisuals,1000);
})();

/* ===== CUSTOMER STATUS / ACTIVE FILTER FINAL FIX (added only) ===== */
(function(){
  function reqStatus(req){
    const s = String(req && req.status || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (s === 'handled') return 'approved';
    return s;
  }
  function isApprovedLike(req){
    const s = reqStatus(req);
    return ['approved','assigned','driver_en_route','completed'].includes(s) || !!(req && (req.adminName || req.driverName));
  }
  function isDriverLike(req){
    const s = reqStatus(req);
    return ['driver_en_route','driver','driver_on_the_way','completed'].includes(s);
  }
  function statusText(req){
    const s = reqStatus(req);
    if (s === 'canceled') return tr('Canceled','تم الإلغاء');
    if (s === 'completed') return tr('Completed','مكتمل');
    if (s === 'driver_en_route') return tr('Driver En Route','السائق بالطريق');
    if (isApprovedLike(req)) return tr('Approved','تمت الموافقة');
    return tr('Awaiting Approval','بانتظار الموافقة');
  }
  function statusBg(req){
    const s = reqStatus(req);
    if (s === 'canceled') return '#ff4444';
    if (s === 'completed') return '#2f9e66';
    if (isApprovedLike(req)) return '#5f8fa2';
    return '#856404';
  }
  function allReqs(){
    try { return (window.releafReadAllRequests ? window.releafReadAllRequests() : JSON.parse(localStorage.getItem('releaf_requests_v1') || '[]')) || []; }
    catch(e){ return []; }
  }
  function applyCustomerStatusFixes(){
    const reqs = allReqs();
    const map = new Map(reqs.map(r => [String(r.id || ''), r]));

    document.querySelectorAll('#activityTable tr').forEach(row => {
      const id = row.cells && row.cells[0] ? String(row.cells[0].textContent || '').trim() : '';
      const req = map.get(id);
      if (!req || !row.cells || !row.cells[3]) return;
      row.cells[3].innerHTML = `<span class="status-pill" style="background:${statusBg(req)};">${escapeHtml(statusText(req))}</span>`;
    });

    document.querySelectorAll('#trackerContainer .arrival-card').forEach(card => {
      const id = String(card.querySelector('.trackID')?.textContent || '').trim();
      const req = map.get(id);
      if (!req) return;
      const s = reqStatus(req);
      const badge = card.querySelector('.status-badge');
      if (badge) {
        badge.textContent = statusText(req).toUpperCase();
        if (isApprovedLike(req)) {
          badge.style.background = 'rgba(95,143,162,.22)';
          badge.style.color = '#88cde0';
          badge.style.borderColor = 'rgba(136,205,224,.35)';
        } else if (s === 'canceled') {
          badge.style.background = 'rgba(255,68,68,.14)';
          badge.style.color = '#ff6b6b';
          badge.style.borderColor = 'rgba(255,68,68,.28)';
        } else {
          badge.style.background = 'rgba(255,193,7,.1)';
          badge.style.color = '#ffc107';
          badge.style.borderColor = 'rgba(255,193,7,.2)';
        }
      }
      const title = card.querySelector('h4');
      if (title) {
        title.textContent = isDriverLike(req) ? tr('Driver En Route','السائق بالطريق') : isApprovedLike(req) ? tr('Admin Approved','تمت الموافقة من الإدارة') : tr('Request Sent to Admin','تم إرسال الطلب إلى الإدارة');
      }
      const dots = card.querySelectorAll('div[style*="border-radius: 50%"]');
      if (dots[1] && isApprovedLike(req)) dots[1].style.background = '#4caf50';
      if (dots[2] && isDriverLike(req)) dots[2].style.background = '#4caf50';
      const smalls = card.querySelectorAll('small');
      if (smalls[1] && isApprovedLike(req)) smalls[1].style.opacity = '0.9';
      if (smalls[2] && isDriverLike(req)) smalls[2].style.opacity = '0.9';
      const note = card.querySelector('p:last-child');
      if (note) {
        if (isDriverLike(req)) note.textContent = tr('Your pickup driver is on the way.','السائق في الطريق لاستلام الطلب.');
        else if (isApprovedLike(req)) note.textContent = tr('Your request is approved and being prepared.','تمت الموافقة على طلبك ويتم تجهيزه.');
      }
    });
  }
  const oldHydrate = typeof window.hydrateOrdersFromStorage === 'function' ? window.hydrateOrdersFromStorage : null;
  if (oldHydrate) {
    window.hydrateOrdersFromStorage = hydrateOrdersFromStorage = function(){
      const result = oldHydrate.apply(this, arguments);
      setTimeout(applyCustomerStatusFixes, 20);
      return result;
    };
  }
  window.filterRequests = filterRequests = function(mode) {
    const wrap = document.getElementById('myRequestsPage');
    if (!wrap) return;
    wrap.querySelectorAll('.seg-btn').forEach((b) => b.classList.remove('active'));
    const labels = { all: ['All','الكل'], active: ['Active','نشط'], completed: ['Completed','مكتمل'] };
    wrap.querySelectorAll('.seg-btn').forEach((b) => {
      const txt = (b.innerText || '').trim().toLowerCase();
      if (labels[mode] && labels[mode].some(x => txt === x.toLowerCase())) b.classList.add('active');
    });
    document.querySelectorAll('#detailedRequestsList .stat-card').forEach((card) => {
      const t = (card.innerText || '').toLowerCase();
      let show = true;
      if (mode === 'active') show = !t.includes('cancel') && !t.includes('ملغ') && !t.includes('completed') && !t.includes('مكتمل') && !t.includes('done');
      if (mode === 'completed') show = t.includes('completed') || t.includes('مكتمل') || t.includes('done') || t.includes('cancel') || t.includes('ملغ');
      card.style.display = show ? 'flex' : 'none';
    });
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(applyCustomerStatusFixes, 250); });
  setInterval(applyCustomerStatusFixes, 1200);
})();

/* ===== FINAL CUSTOMER PROGRESS + ACTIVE FILTER SYNC FIX (added only) ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function getJson(k, fallback){ try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? fallback : v; } catch(e){ return fallback; } }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>\"]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]; }); }
  function cleanStatus(s){ s = String(s || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_'); return s === 'handled' ? 'approved' : s; }
  function t2(en, ar){ return (document.documentElement.lang === 'ar') ? ar : en; }
  function currentProfile(){ try { return typeof readProfile === 'function' ? readProfile() : (getJson('releaf_profile_v1', {}) || {}); } catch(e){ return getJson('releaf_profile_v1', {}) || {}; } }
  function currentUser(){ return getJson('currentUser', {}) || {}; }
  function ownerKeys(){ const p=currentProfile(), u=currentUser(); return [p.username, u.username, p.email, u.email].filter(Boolean).map(x => String(x).trim().toLowerCase()); }
  function allRequests(){
    return (getJson(REQ_KEY, []) || [])
      .map(r => ({...r, status: cleanStatus(r.status), weight: Number(r.weight) || 0}))
      .sort((a,b) => {
        const ad = Date.parse(a.createdAt || a.requestDate || a.collectionDate || '') || 0;
        const bd = Date.parse(b.createdAt || b.requestDate || b.collectionDate || '') || 0;
        return bd - ad;
      });
  }
  function myRequests(){
    const keys = ownerKeys();
    return allRequests().filter(r => {
      const vals = [r.ownerUsername, r.ownerEmail].filter(Boolean).map(x => String(x).trim().toLowerCase());
      return !keys.length || vals.some(v => keys.includes(v));
    });
  }
  function isApproved(r){ const s=cleanStatus(r.status); return ['approved','assigned','admin_approved','driver','driver_en_route','driver_on_the_way','completed'].includes(s) || !!(r.adminName || r.driverName); }
  function isDriver(r){ const s=cleanStatus(r.status); return ['driver','driver_en_route','driver_on_the_way','completed'].includes(s); }
  function statusText(r){ const s=cleanStatus(r.status); if(s==='canceled') return t2('Canceled','تم الإلغاء'); if(s==='completed') return t2('Completed','مكتمل'); if(s==='driver_en_route') return t2('Driver En Route','السائق بالطريق'); if(isApproved(r)) return t2('Approved','تمت الموافقة'); return t2('Awaiting Approval','بانتظار الموافقة'); }
  function statusColor(r){ const s=cleanStatus(r.status); if(s==='canceled') return '#ff4444'; if(s==='completed') return '#2f9e66'; if(isApproved(r)) return '#5f8fa2'; return '#856404'; }
  function displayAction(a){ a=String(a||'').toLowerCase(); if(a==='sell') return t2('Paid collection','تحصيل مدفوع'); if(a==='donate') return t2('Donate','تبرع'); if(a==='exchange') return t2('Exchange','استبدال'); return a; }
  function exchangeName(v){
    if(typeof displayExchangeChoice === 'function') return displayExchangeChoice(v);
    const ar = document.documentElement.lang === 'ar';
    const map = {artwork: ar?'لوحة فنية من ورق معاد تدويره':'Recycled paper artwork', paper_bundle: ar?'باقة ورق نظيف':'Clean paper bundle', stationery: ar?'باقة قرطاسية صديقة للبيئة':'Eco stationery pack', storage_boxes: ar?'صناديق تخزين من كرتون معاد تدويره':'Recycled carton storage boxes'};
    return map[v] || v || '';
  }
  function setStepVisual(card, req){
    const steps = card.querySelectorAll('div[style*="z-index: 2"][style*="width: 33%"]');
    function setStep(i, on){
      const wrap = steps[i]; if(!wrap) return;
      const dot = wrap.querySelector('div[style*="border-radius: 50%"]');
      const label = wrap.querySelector('small');
      if(dot) dot.style.background = on ? '#4caf50' : '#333';
      if(label) label.style.opacity = on ? '0.95' : '0.4';
    }
    setStep(0, true); setStep(1, isApproved(req)); setStep(2, isDriver(req));
  }
  function renderActivityAndTracker(){
    const list = myRequests();
    if(typeof activityTable === 'undefined' || !activityTable) return;
    const container = document.getElementById('trackerContainer');
    const template = document.getElementById('trackerTemplate');
    activityTable.innerHTML = '';
    if(container) container.innerHTML = '';
    if(!list.length){ activityTable.innerHTML = `<tr id="emptyMsg"><td colspan="4" style="text-align:center; opacity:0.5; padding: 40px;">${t2('No requests yet. Add your first collection request!','لا توجد طلبات بعد. أضف أول طلب جمع!')}</td></tr>`; if(typeof updateGlobalStats === 'function') updateGlobalStats(0); return; }
    list.forEach(req => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${esc(req.id)}</td><td style="text-transform:capitalize;">${esc(req.type)}</td><td>${esc(req.weight)}kg</td><td><span class="status-pill" style="background:${statusColor(req)};">${esc(statusText(req))}</span></td>`;
      activityTable.appendChild(row);
    });
    if(container && template){
      list.filter(r => !['canceled','completed'].includes(cleanStatus(r.status))).forEach(req => {
        const frag = template.content.cloneNode(true);
        const card = frag.querySelector('.arrival-card');
        frag.querySelector('.trackID').innerText = req.id;
        const title = frag.querySelector('h4');
        if(title) title.textContent = isDriver(req) ? t2('Driver En Route','السائق بالطريق') : isApproved(req) ? t2('Admin Approved','تمت الموافقة من الإدارة') : t2('Request Sent to Admin','تم إرسال الطلب إلى الإدارة');
        const badge = frag.querySelector('.status-badge');
        if(badge){ badge.textContent = statusText(req).toUpperCase(); badge.style.background = isApproved(req) ? 'rgba(95,143,162,.22)' : 'rgba(255,193,7,.1)'; badge.style.color = isApproved(req) ? '#88cde0' : '#ffc107'; badge.style.borderColor = isApproved(req) ? 'rgba(136,205,224,.35)' : 'rgba(255,193,7,.2)'; }
        const exchangeLine = req.exchangeChoice ? `<br><strong>${t2('Exchange','الاستبدال')}:</strong> ${esc(exchangeName(req.exchangeChoice))}` : req.savedExchangeGoal ? `<br><strong>${t2('Saved exchange goal','هدف الاستبدال المحفوظ')}:</strong> ${esc(exchangeName(req.savedExchangeGoal))}` : '';
const adminLines =
(req.adminName
 ? `<br><strong>${t2('Assigned admin','الأدمن المسؤول')}:</strong> ${esc(req.adminName)}`
 : '')
+
(req.driverName
 ? `<br><strong>${t2('Driver','السائق')}:</strong> ${esc(req.driverName)}`
 : '')
+
((req.driverPhone || req.driverMobile)
 ? `<br><strong>${t2('Driver phone','رقم السائق')}:</strong> ${esc(req.driverPhone || req.driverMobile)}`
 : '')
+
((req.scheduledDate || req.adminScheduledDate)
 ? `<br><strong>${t2('Pickup date','تاريخ الاستلام')}:</strong> ${esc(req.scheduledDate || req.adminScheduledDate)}`
 : '')
+
((req.scheduledTime || req.adminScheduledTime || req.eta)
 ? `<br><strong>${t2('Pickup time','وقت الاستلام')}:</strong> ${esc(req.scheduledTime || req.adminScheduledTime || req.eta)}`
 : '')
+
(req.adminNote
 ? `<br><strong>${t2('Admin note','ملاحظة الأدمن')}:</strong> ${esc(req.adminNote)}`
 : '');
        const hub = frag.querySelector('.trackHub');
        if(hub) hub.innerHTML = `<strong>${t2('Partner','الشريك')}:</strong> ${esc(req.hubName || (window.recyclingHubs && recyclingHubs.Default && recyclingHubs.Default.name) || '')}<br><span style="opacity:.7;">${esc(req.hubInfo || (window.recyclingHubs && recyclingHubs.Default && recyclingHubs.Default.info) || '')}</span>${req.requestDate || req.collectionDate ? `<br><strong>${t2('Date','التاريخ')}:</strong> ${esc(req.requestDate || req.collectionDate)}` : ''}<br><strong>${t2('Available','وقت التوفر')}:</strong> ${esc(req.availableSlot || '')}<br><strong>${t2('Weight','الوزن')}:</strong> ${esc(req.weight)} kg<br><strong>${t2('Action','الإجراء')}:</strong> ${esc(displayAction(req.action))}${exchangeLine}${adminLines}`;
        const note = frag.querySelector('p:last-child');
        if(note) note.textContent = isDriver(req) ? t2('Your pickup driver is on the way.','السائق في الطريق لاستلام الطلب.') : isApproved(req) ? t2('Your request is approved and being prepared.','تمت الموافقة على طلبك ويتم تجهيزه.') : t2('Once the admin reviews your request, your estimated arrival time will appear here.','بعد مراجعة الإدارة سيظهر وقت الوصول المتوقع هنا.');
        if(card) {
          setStepVisual(card, req);
          const cancelButton = card.querySelector('.card-cancel-btn');
          const reqStatus = cleanStatus(req.status);
          const canCancel = !isApproved(req) && !isDriver(req) && !['approved','assigned','driver_en_route','completed','canceled'].includes(reqStatus);
          if(cancelButton && !canCancel){
            cancelButton.style.display = 'none';
            cancelButton.disabled = true;
          }
        }
        container.appendChild(frag);
      });
      if(typeof refreshIcons === 'function') refreshIcons();
    }
    if(typeof updateGlobalStats === 'function') updateGlobalStats(list.filter(r => cleanStatus(r.status) !== 'canceled').reduce((s,r)=>s+(Number(r.weight)||0),0));
  }
  window.hydrateOrdersFromStorage = hydrateOrdersFromStorage = renderActivityAndTracker;
  window.renderDetailedRequests = renderDetailedRequests = function(){
    renderActivityAndTracker();
    const listEl = document.getElementById('detailedRequestsList'); if(!listEl) return;
    listEl.innerHTML = '';
    const list = myRequests();
    if(!list.length){ listEl.innerHTML = `<p style="text-align:center; opacity:0.5; padding:50px;">${t2('No history found.','لا يوجد سجل.')}</p>`; return; }
    list.forEach(req => {
      const card = document.createElement('div'); card.className='stat-card'; card.dataset.status = cleanStatus(req.status); card.style.cssText='width:100%; justify-content:space-between; padding:20px 30px;';
      card.innerHTML = `<div style="display:flex;align-items:center;gap:20px;"><div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:12px;"><i data-lucide="package" style="color:#4caf50;"></i></div><div><h4 style="margin:0;text-transform:capitalize;">${esc(req.type)} Recycling</h4><p style="margin:0;opacity:0.6;font-size:0.8rem;">ID: ${esc(req.id)} • ${esc(req.weight)}kg</p></div></div><div><span class="status-pill" style="background:${statusColor(req)};">${esc(statusText(req))}</span></div>`;
      listEl.appendChild(card);
    });
    if(typeof refreshIcons === 'function') refreshIcons();
    filterRequests('all');
  };
  window.filterRequests = filterRequests = function(mode){
    const wrap=document.getElementById('myRequestsPage'); if(!wrap) return;
    wrap.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
    const labelMap = {all:['all','الكل'], active:['active','نشط'], completed:['completed','مكتمل']};
    wrap.querySelectorAll('.seg-btn').forEach(b=>{ const txt=(b.innerText||'').trim().toLowerCase(); if(labelMap[mode].includes(txt)) b.classList.add('active'); });
    document.querySelectorAll('#detailedRequestsList .stat-card').forEach(card=>{
      const s = cleanStatus(card.dataset.status || 'sent');
      let show = true;
      if(mode === 'active') show = ['approved','assigned','driver_en_route','driver','admin_approved','handled'].includes(s);
      if(mode === 'completed') show = ['completed'].includes(s);
      card.style.display = show ? 'flex' : 'none';
    });
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ releafLastCustomerRequestsSnapshot = localStorage.getItem(REQ_KEY) || '[]'; renderActivityAndTracker(); }, 150); });
  let releafLastCustomerRequestsSnapshot = null;
  function renderActivityAndTrackerIfChanged(){
    const snapshot = localStorage.getItem(REQ_KEY) || '[]';
    if (snapshot === releafLastCustomerRequestsSnapshot) return;
    releafLastCustomerRequestsSnapshot = snapshot;
    renderActivityAndTracker();
  }
  window.addEventListener('storage', function(e){ if(e.key === REQ_KEY) renderActivityAndTrackerIfChanged(); });
  setInterval(renderActivityAndTrackerIfChanged, 1500);
})();


/* ===== CUSTOMER DATE/TWO-HOUR SLOT PATCH ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function esc(v){ return String(v == null ? '' : v).replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch])); }
  function label(en, ar){ try { return (document.documentElement.lang === 'ar') ? ar : en; } catch(e){ return en; } }
  function todayIso(){ const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  function setupDateAndSlots(){
    const date = document.getElementById('collectionDate');
    if(date){ date.min = todayIso(); if(!date.value) date.value = todayIso(); }
    const slot = document.getElementById('availableSlot');
    if(slot){
      const vals = ['09:00-11:00','11:00-13:00','13:00-15:00','15:00-17:00','17:00-19:00','19:00-21:00'];
      const old = slot.value;
      slot.innerHTML = vals.map(v => `<option value="${v}">${v.replace('-', ' - ')}</option>`).join('');
      slot.value = vals.includes(old) ? old : vals[0];
    }
  }
  document.addEventListener('DOMContentLoaded', setupDateAndSlots);
  document.addEventListener('click', function(e){ if(e.target && e.target.id === 'openFormBtn') setTimeout(setupDateAndSlots, 50); }, true);
  document.addEventListener('submit', function(e){
    if(!e.target || e.target.id !== 'recycleForm') return;
    const date = document.getElementById('collectionDate')?.value || '';
    const slot = document.getElementById('availableSlot')?.value || '';
    window.__releafPendingSchedule = { requestDate: date, collectionDate: date, availableSlot: slot };
    setTimeout(function(){
      try{
        const all = JSON.parse(localStorage.getItem(REQ_KEY) || '[]');
        if(!all.length || !window.__releafPendingSchedule) return;
        const latest = all[0];
        if(latest && (!latest.requestDate || latest.availableSlot !== window.__releafPendingSchedule.availableSlot)){
          all[0] = Object.assign({}, latest, window.__releafPendingSchedule);
          localStorage.setItem(REQ_KEY, JSON.stringify(all));
        }
      }catch(err){}
    }, 120);
  }, true);
})();


/* ===== Requested fixes only: location alert restore + robust cancel action ===== */
(function(){
  function getReqIdFromCard(card){
    if(!card) return '';
    const idEl = card.querySelector('.trackID');
    return idEl ? String(idEl.textContent || idEl.innerText || '').trim() : '';
  }

  document.addEventListener('click', function(e){
    const open = e.target && e.target.closest ? e.target.closest('#openFormBtn') : null;
    if(!open) return;
    try{
      const ready = (typeof isSavedProfileLocationReady === 'function') ? isSavedProfileLocationReady() : false;
      if(!ready){
        const loc = document.getElementById('locCard');
        const display = document.getElementById('displayAddress');
        if(loc) loc.classList.add('alert-mode');
        if(display) display.innerText = (document.documentElement.lang === 'ar') ? 'حدد موقع الجمع أولاً! 🚨' : 'SET LOCATION FIRST! 🚨';
      }
    }catch(err){}
  }, true);

  document.addEventListener('click', function(e){
    const cancelBtn = e.target && e.target.closest ? e.target.closest('.card-cancel-btn') : null;
    if(!cancelBtn) return;
    const card = cancelBtn.closest('.arrival-card');
    const modal = document.getElementById('cancelModal');
    const reqId = getReqIdFromCard(card);
    try{
      const all = JSON.parse(localStorage.getItem('releaf_requests_v1') || '[]');
      const req = all.find(function(item){ return item && String(item.id || '').trim() === reqId; });
      const status = String((req && req.status) || '').trim().toLowerCase().replace(/\s+/g, '_');
      const locked = ['approved','assigned','handled','admin_approved','driver','driver_en_route','driver_on_the_way','completed'].includes(status) || !!(req && (req.adminName || req.driverName));
      if(locked){
        alert((document.documentElement.lang === 'ar') ? 'لا يمكنك إلغاء الطلب بعد الموافقة عليه أو بعد خروج السائق.' : 'You can only cancel while the request is awaiting approval.');
        return;
      }
    }catch(err){}
    try { activeRequestToCancel = card; } catch(err) {}
    if(modal){
      modal.dataset.requestId = reqId;
      modal.style.display = 'grid';
    }
  }, true);

  document.addEventListener('click', function(e){
    const confirm = e.target && e.target.closest ? e.target.closest('#confirmCancelBtn') : null;
    if(!confirm) return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const modal = document.getElementById('cancelModal');
    let card = null;
    try { card = activeRequestToCancel || null; } catch(err) { card = null; }
    const reqId = (modal && modal.dataset.requestId) || getReqIdFromCard(card);

    if(reqId){
      if(typeof markRequestCanceled === 'function') markRequestCanceled(reqId);
      else {
        try{
          const key = 'releaf_requests_v1';
          const all = JSON.parse(localStorage.getItem(key) || '[]');
          const next = all.map(function(r){ return r && r.id === reqId ? Object.assign({}, r, {status:'canceled', canceledAt:new Date().toISOString()}) : r; });
          localStorage.setItem(key, JSON.stringify(next));
        }catch(err){}
      }
    }

    if(typeof resetCancelModal === 'function') resetCancelModal();
    else if(modal) modal.style.display = 'none';

    setTimeout(function(){
      if(typeof hydrateOrdersFromStorage === 'function') hydrateOrdersFromStorage();
      if(typeof renderDetailedRequests === 'function') renderDetailedRequests();
      const toast = document.getElementById('cancelToast');
      if(toast){
        toast.classList.add('show');
        setTimeout(function(){ toast.classList.remove('show'); }, 3000);
      }
    }, 80);
  }, true);

  document.addEventListener('click', function(e){
    const abort = e.target && e.target.closest ? e.target.closest('#abortCancelBtn') : null;
    if(!abort) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(typeof resetCancelModal === 'function') resetCancelModal();
    else {
      const modal = document.getElementById('cancelModal');
      if(modal) modal.style.display = 'none';
    }
  }, true);
})();

/* ===== REQUESTED ONLY PATCH: delete canceled request + exact active filter ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';

  function safeReadAllRequests(){
    try{
      const all = JSON.parse(localStorage.getItem(REQ_KEY) || '[]');
      return Array.isArray(all) ? all : [];
    }catch(e){
      return [];
    }
  }

  function saveAllRequests(list){
    localStorage.setItem(REQ_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  }

  function normalizeStatus(status){
    return String(status || '').trim().toLowerCase().replace(/\s+/g, '_');
  }

  function isApprovedOrDriver(status){
    const s = normalizeStatus(status);
    return [
      'assigned',
      'handled',
      'approved',
      'admin_approved',
      'driver',
      'driver_en_route',
      'driver_on_the_way',
      'تمت_الموافقة',
      'تمت_الموافقة_عليه',
      'السائق_بالطريق'
    ].includes(s);
  }

  function isCompleted(status){
    const s = normalizeStatus(status);
    return ['completed', 'complete', 'done', 'delivered', 'finished', 'مكتمل'].includes(s);
  }

  window.markRequestCanceled = markRequestCanceled = function(requestId){
    const id = String(requestId || '').trim();
    if(!id) return;
    const next = safeReadAllRequests().map(function(req){
      if(!req || String(req.id || '').trim() !== id) return req;
      return Object.assign({}, req, {
        status: 'canceled',
        canceledAt: req.canceledAt || new Date().toISOString()
      });
    });
    saveAllRequests(next);
    setTimeout(function(){
      if(typeof hydrateOrdersFromStorage === 'function') hydrateOrdersFromStorage();
      if(typeof renderDetailedRequests === 'function') renderDetailedRequests();
      if(typeof renderWeeklyRecyclingFlow === 'function') renderWeeklyRecyclingFlow();
    }, 50);
  };

  window.filterRequests = filterRequests = function(mode){
    const wrap = document.getElementById('myRequestsPage');
    if(!wrap) return;

    wrap.querySelectorAll('.seg-btn').forEach(function(btn){
      btn.classList.remove('active');
    });

    const labelMap = {
      all: ['all', 'الكل'],
      active: ['active', 'نشط'],
      completed: ['completed', 'مكتمل']
    };

    wrap.querySelectorAll('.seg-btn').forEach(function(btn){
      const txt = String(btn.innerText || '').trim().toLowerCase();
      if((labelMap[mode] || []).includes(txt)) btn.classList.add('active');
    });

    document.querySelectorAll('#detailedRequestsList .stat-card').forEach(function(card){
      const s = card.dataset.status || '';
      let show = true;
      if(mode === 'active') show = isApprovedOrDriver(s);
      if(mode === 'completed') show = isCompleted(s);
      card.style.display = show ? 'flex' : 'none';
    });
  };
})();


/* ===== REQUESTED ONLY PATCH: weekly recycling flow chart ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function readRequests(){
    try{ const list = JSON.parse(localStorage.getItem(REQ_KEY) || '[]'); return Array.isArray(list) ? list : []; }
    catch(e){ return []; }
  }
  function normStatus(status){ return String(status || '').trim().toLowerCase().replace(/\s+/g, '_'); }
  function isVisibleWeeklyRequest(req){
    const s = normStatus(req && req.status);
    return !['canceled','cancelled'].includes(s);
  }
  function reqDate(req){
    const raw = req && (req.createdAt || req.requestDate || req.collectionDate || req.date);
    const d = raw ? new Date(raw) : null;
    return d && !isNaN(d.getTime()) ? d : null;
  }
  function keyForDate(d){
    const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
    return local.toISOString().slice(0,10);
  }
  function dayLabel(d){
    return d.toLocaleDateString(document.documentElement.lang === 'ar' ? 'ar' : 'en', { weekday: 'short' });
  }
  window.renderWeeklyRecyclingFlow = function(){
    const wrap = document.getElementById('weeklyFlowChart');
    const totalEl = document.getElementById('weeklyFlowTotal');
    if(!wrap) return;
    const today = new Date();
    const days = [];
    for(let i = 6; i >= 0; i--){
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      days.push({ date: d, key: keyForDate(d), count: 0 });
    }
    readRequests().filter(isVisibleWeeklyRequest).forEach(function(req){
      const d = reqDate(req);
      if(!d) return;
      const key = keyForDate(d);
      const item = days.find(function(day){ return day.key === key; });
      if(item) item.count += 1;
    });
    const max = Math.max(1, ...days.map(function(day){ return day.count; }));
    const total = days.reduce(function(sum, day){ return sum + day.count; }, 0);
    if(totalEl) totalEl.textContent = total;
    wrap.innerHTML = days.map(function(day){
      const h = Math.max(10, Math.round((day.count / max) * 100));
      return '<div class="weekly-flow-day"><div class="weekly-flow-bar-wrap"><span class="weekly-flow-count">' + day.count + '</span><div class="weekly-flow-bar" style="height:' + h + '%"></div></div><small>' + dayLabel(day.date) + '</small></div>';
    }).join('');
  };
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(window.renderWeeklyRecyclingFlow, 200); });
  window.addEventListener('storage', function(e){ if(e.key === REQ_KEY) window.renderWeeklyRecyclingFlow(); });
  /* disabled: old user-operation weekly flow interval replaced by stable Jordan national flow */
})();


/* ===== REQUESTED ONLY FINAL PATCH: cancel hides from dashboard, stays canceled in requests ===== */
(function(){
  const REQ_KEY = 'releaf_requests_v1';
  function ar(){ return document.documentElement.lang === 'ar'; }
  function readAll(){ try{ const v = JSON.parse(localStorage.getItem(REQ_KEY) || '[]'); return Array.isArray(v) ? v : []; }catch(e){ return []; } }
  function saveAll(v){ localStorage.setItem(REQ_KEY, JSON.stringify(Array.isArray(v) ? v : [])); }
  function norm(s){ return String(s || '').trim().toLowerCase().replace(/\s+/g,'_'); }
  function isCanceled(s){ return ['canceled','cancelled','ملغي','تم_الإلغاء','تم_الغاء','تم_إلغاء'].includes(norm(s)); }
  function isCompleted(s){ return ['completed','complete','done','delivered','finished','مكتمل'].includes(norm(s)); }
  function isApprovedOrDriver(s){ return ['approved','assigned','handled','admin_approved','driver','driver_en_route','driver_on_the_way','تمت_الموافقة','تمت_الموافقة_عليه','السائق_بالطريق'].includes(norm(s)); }
  function isPendingCancelable(s){ return ['','sent','pending','awaiting','awaiting_approval','waiting_approval','بانتظار_الموافقة','تم_إرسال_الطلب_إلى_الإدارة'].includes(norm(s)); }
  function cardRequestId(card){ const el = card && card.querySelector ? card.querySelector('.trackID') : null; return el ? String(el.textContent || el.innerText || '').trim() : ''; }

  window.markRequestCanceled = markRequestCanceled = function(requestId){
    const id = String(requestId || '').trim();
    if(!id) return;
    const next = readAll().map(function(req){
      if(!req || String(req.id || '').trim() !== id) return req;
      return Object.assign({}, req, {
        status: 'canceled',
        cancelReason: req.cancelReason || 'Canceled by customer',
        canceledAt: req.canceledAt || new Date().toISOString()
      });
    });
    saveAll(next);
    document.querySelectorAll('#trackerContainer .arrival-card').forEach(function(card){
      if(cardRequestId(card) === id) card.remove();
    });
    setTimeout(function(){
      if(typeof hydrateOrdersFromStorage === 'function') hydrateOrdersFromStorage();
      if(typeof renderDetailedRequests === 'function') renderDetailedRequests();
      if(typeof renderWeeklyRecyclingFlow === 'function') renderWeeklyRecyclingFlow();
    }, 60);
  };

  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest ? e.target.closest('.card-cancel-btn') : null;
    if(!btn) return;
    const card = btn.closest('.arrival-card');
    const id = cardRequestId(card);
    const req = readAll().find(function(r){ return r && String(r.id || '').trim() === id; });
    const status = norm(req && req.status);
    if(req && !isPendingCancelable(status)){
      e.preventDefault();
      e.stopImmediatePropagation();
      alert(ar() ? 'لا يمكنك إلغاء الطلب إلا وهو بانتظار الموافقة.' : 'You can only cancel while the request is awaiting approval.');
      return;
    }
  }, true);

  function cleanDashboardCanceledCards(){
    const all = readAll();
    const statusById = new Map(all.map(function(r){ return [String(r.id || '').trim(), norm(r.status)]; }));
    document.querySelectorAll('#trackerContainer .arrival-card').forEach(function(card){
      const id = cardRequestId(card);
      const st = statusById.get(id);
      if(isCanceled(st) || isCompleted(st)) card.remove();
    });
  }

  const oldHydrate = typeof window.hydrateOrdersFromStorage === 'function' ? window.hydrateOrdersFromStorage : null;
  if(oldHydrate){
    window.hydrateOrdersFromStorage = hydrateOrdersFromStorage = function(){
      const out = oldHydrate.apply(this, arguments);
      setTimeout(cleanDashboardCanceledCards, 30);
      return out;
    };
  }

  window.filterRequests = filterRequests = function(mode){
    const wrap = document.getElementById('myRequestsPage');
    if(!wrap) return;
    wrap.querySelectorAll('.seg-btn').forEach(function(b){ b.classList.remove('active'); });
    const labels = { all:['all','الكل'], active:['active','نشط'], completed:['completed','مكتمل'] };
    wrap.querySelectorAll('.seg-btn').forEach(function(b){
      const txt = String(b.innerText || '').trim().toLowerCase();
      if((labels[mode] || []).includes(txt)) b.classList.add('active');
    });
    document.querySelectorAll('#detailedRequestsList .stat-card').forEach(function(card){
      const s = norm(card.dataset.status || 'sent');
      let show = true;
      if(mode === 'active') show = isApprovedOrDriver(s);
      if(mode === 'completed') show = isCompleted(s);
      card.style.display = show ? 'flex' : 'none';
    });
  };

  function relabelWeeklyFlow(){
    const section = document.getElementById('weeklyFlowSection');
    if(section){
      section.style.display = '';
      section.dataset.dashboardOnly = 'true';
    }
    const title = document.getElementById('weeklyFlowTitle');
    const sub = document.getElementById('weeklyFlowSubtitle');
    if(title) title.textContent = ar() ? 'إعادة تدوير الورق في الأردن هذا الأسبوع' : 'Jordan Paper Recycling This Week';
    if(sub) sub.textContent = ar() ? 'تقدير أسبوعي ثابت لإعادة تدوير الورق والكرتون في الأردن' : 'Stable weekly estimate for paper/cardboard recycling across Jordan';
  }

  document.addEventListener('DOMContentLoaded', function(){ setTimeout(function(){ cleanDashboardCanceledCards(); relabelWeeklyFlow(); }, 160); });
  document.addEventListener('click', function(){ setTimeout(function(){ cleanDashboardCanceledCards(); relabelWeeklyFlow(); }, 120); });
  setInterval(cleanDashboardCanceledCards, 1000);
})();

/* ===== FINAL REQUESTED PATCH: Jordan paper national flow + exact cancel/dashboard behavior ===== */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const JORDAN_FLOW_KEY = 'releaf_jordan_paper_weekly_v1';

  function isArabic(){ return document.documentElement.lang === 'ar'; }
  function t(en, ar){ return isArabic() ? ar : en; }
  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>\"]/g, function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch];
    });
  }
  function readJson(key, fallback){
    try{
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    }catch(e){
      return fallback;
    }
  }
  function saveRequests(list){ localStorage.setItem(REQ_KEY, JSON.stringify(Array.isArray(list) ? list : [])); }
  function readRequests(){
    const list = readJson(REQ_KEY, []);
    return Array.isArray(list) ? list : [];
  }
  function normStatus(status){
    return String(status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }
  function isCanceled(status){
    return ['canceled','cancelled','ملغي','تم_الإلغاء','تم_الغاء','تم_إلغاء'].includes(normStatus(status));
  }
  function isCompleted(status){
    return ['completed','complete','done','delivered','finished','مكتمل'].includes(normStatus(status));
  }
  function isPending(status){
    return ['', 'sent','pending','awaiting','awaiting_approval','waiting_approval','بانتظار_الموافقة','تم_إرسال_الطلب_إلى_الإدارة'].includes(normStatus(status));
  }
  function isActive(status){
    return ['approved','assigned','handled','admin_approved','driver','driver_en_route','driver_on_the_way','تمت_الموافقة','تمت_الموافقة_عليه','السائق_بالطريق'].includes(normStatus(status));
  }
  function requestDateValue(req){
    return Date.parse(req && (req.createdAt || req.requestDate || req.collectionDate || req.date) || '') || 0;
  }
  function sortedRequests(list){
    return (Array.isArray(list) ? list : []).slice().sort(function(a,b){ return requestDateValue(b) - requestDateValue(a); });
  }
  function currentKeys(){
    const profile = readJson('releaf_profile_v1', {}) || {};
    const user = readJson('currentUser', {}) || {};
    return [profile.username, user.username, profile.email, user.email]
      .filter(Boolean)
      .map(function(v){ return String(v).trim().toLowerCase(); });
  }
  function isMine(req){
    const keys = currentKeys();
    if(!keys.length) return true;
    const values = [req.ownerUsername, req.username, req.ownerEmail, req.email]
      .filter(Boolean)
      .map(function(v){ return String(v).trim().toLowerCase(); });
    return !values.length || values.some(function(v){ return keys.includes(v); });
  }
  function myRequests(){ return sortedRequests(readRequests().filter(isMine)); }
  function statusLabel(status){
    if(isCanceled(status)) return t('Canceled','تم الإلغاء');
    if(isCompleted(status)) return t('Completed','مكتمل');
    if(normStatus(status) === 'driver_en_route' || normStatus(status) === 'driver_on_the_way' || normStatus(status) === 'driver' || normStatus(status) === 'السائق_بالطريق') return t('Driver En Route','السائق بالطريق');
    if(isActive(status)) return t('Approved','تمت الموافقة');
    return t('Awaiting Approval','بانتظار الموافقة');
  }
  function isRequestDriver(req){ return normStatus(req && req.status) === 'driver_en_route' || normStatus(req && req.status) === 'driver_on_the_way' || normStatus(req && req.status) === 'driver' || normStatus(req && req.status) === 'السائق_بالطريق'; }
  function isRequestActive(req){ return isRequestDriver(req) || !!(req && req.adminName) || isActive(req && req.status); }
  function requestStatusLabel(req){
    if(isCanceled(req && req.status)) return t('Canceled','تم الإلغاء');
    if(isCompleted(req && req.status)) return t('Completed','مكتمل');
    if(isRequestDriver(req)) return t('Driver En Route','السائق بالطريق');
    if(isRequestActive(req)) return t('Approved','تمت الموافقة');
    return t('Awaiting Approval','بانتظار الموافقة');
  }
  function statusColor(status){
    if(isCanceled(status)) return '#d9534f';
    if(isCompleted(status)) return '#2f9e66';
    if(isActive(status)) return '#5f8fa2';
    return '#b28a00';
  }
  function requestStatusColor(req){
    if(isCanceled(req && req.status)) return '#d9534f';
    if(isCompleted(req && req.status)) return '#2f9e66';
    if(isRequestActive(req)) return '#5f8fa2';
    return '#b28a00';
  }
  function displayType(type){
    const raw = String(type || '').toLowerCase();
    const map = {
      damaged: t('Damaged','تالف'),
      clean: t('Clean','نظيف'),
      carton: t('Carton','كرتون')
    };
    return map[raw] || (type || 'Paper');
  }
  function displayAction(action){
    const raw = String(action || '').toLowerCase();
    const map = {
      sell: t('Paid collection','تحصيل مدفوع'),
      donate: t('Donate','تبرع'),
      exchange: t('Exchange','استبدال')
    };
    return map[raw] || action || '';
  }
  function requestIdFromCard(card){
    const idEl = card && card.querySelector ? card.querySelector('.trackID') : null;
    return idEl ? String(idEl.textContent || idEl.innerText || '').trim() : '';
  }
  function renderDashboardRequests(){
    const activity = document.getElementById('activityTable');
    const tracker = document.getElementById('trackerContainer');
    const template = document.getElementById('trackerTemplate');
    const visible = myRequests().filter(function(req){ return !isCanceled(req.status) && !isCompleted(req.status); });

    if(activity){
      activity.innerHTML = '';
      if(!visible.length){
        activity.innerHTML = '<tr id="emptyMsg"><td colspan="4" style="text-align:center; opacity:0.5; padding:40px;">' + escapeHtml(t('No active requests on the dashboard.','لا توجد طلبات فعالة في الصفحة الرئيسية.')) + '</td></tr>';
      }else{
        visible.forEach(function(req){
          const row = document.createElement('tr');
          row.innerHTML = '<td>' + escapeHtml(req.id || '') + '</td>' +
            '<td style="text-transform:capitalize;">' + escapeHtml(displayType(req.type)) + '</td>' +
            '<td>' + escapeHtml(req.weight || 0) + 'kg</td>' +
            '<td><span class="status-pill" style="background:' + requestStatusColor(req) + ';">' + escapeHtml(requestStatusLabel(req)) + '</span></td>';
          activity.appendChild(row);
        });
      }
    }

    if(tracker && template){
      tracker.innerHTML = '';
      visible.forEach(function(req){
        const frag = template.content.cloneNode(true);
        const card = frag.querySelector('.arrival-card');
        const idEl = frag.querySelector('.trackID');
        if(idEl) idEl.textContent = req.id || '';
        const typeEl = frag.querySelector('.trackType');
        if(typeEl) typeEl.textContent = displayType(req.type);
        const title = frag.querySelector('h4');
        if(title){
          title.textContent = isRequestActive(req) ? requestStatusLabel(req) : t('Request Sent to Admin','تم إرسال الطلب إلى الإدارة');
        }
        const badge = frag.querySelector('.status-badge');
        if(badge){
          badge.textContent = requestStatusLabel(req);
          badge.style.background = isRequestActive(req) ? 'rgba(95,143,162,.22)' : 'rgba(255,193,7,.1)';
          badge.style.color = isRequestActive(req) ? '#88cde0' : '#ffc107';
          badge.style.borderColor = isRequestActive(req) ? 'rgba(136,205,224,.35)' : 'rgba(255,193,7,.2)';
        }
        const hub = frag.querySelector('.trackHub');
        if(hub){
          hub.innerHTML =
            '<strong>' + escapeHtml(t('Partner','الشريك')) + ':</strong> ' + escapeHtml(req.hubName || '') +
            (req.hubInfo ? '<br><span style="opacity:.75;">' + escapeHtml(req.hubInfo) + '</span>' : '') +
            (req.requestDate || req.collectionDate ? '<br><strong>' + escapeHtml(t('Date','التاريخ')) + ':</strong> ' + escapeHtml(req.requestDate || req.collectionDate) : '') +
            (req.availableSlot ? '<br><strong>' + escapeHtml(t('Available','وقت التوفر')) + ':</strong> ' + escapeHtml(req.availableSlot) : '') +
            '<br><strong>' + escapeHtml(t('Weight','الوزن')) + ':</strong> ' + escapeHtml(req.weight || 0) + ' kg' +
            (req.action ? '<br><strong>' + escapeHtml(t('Action','الإجراء')) + ':</strong> ' + escapeHtml(displayAction(req.action)) : '');
        }
        /* Keep tracker dots fixed immediately when the card is created.
           This prevents the grey -> green flicker that happened because
           another timer was recoloring the dots after every dashboard refresh. */
        const stepWraps = frag.querySelectorAll('div[style*="z-index: 2"][style*="width: 33%"]');
        const reqStatusForSteps = normStatus(req.status || 'sent');
        const stepOn = [true, isActive(reqStatusForSteps), reqStatusForSteps === 'driver_en_route' || reqStatusForSteps === 'completed'];
        stepWraps.forEach(function(wrap, index){
          const dot = wrap.querySelector('div[style*="border-radius: 50%"]');
          const label = wrap.querySelector('small');
          if(dot){
            dot.style.background = stepOn[index] ? '#4caf50' : '#333';
            dot.style.boxShadow = 'none';
            dot.style.animation = 'none';
            dot.style.transition = 'none';
          }
          if(label){
            label.style.opacity = stepOn[index] ? '0.95' : '0.4';
            label.style.animation = 'none';
            label.style.transition = 'none';
          }
        });

        const cancelBtn = frag.querySelector('.card-cancel-btn');
        if(cancelBtn && !isPending(req.status)){
          cancelBtn.style.display = 'none';
          cancelBtn.disabled = true;
        }
        tracker.appendChild(frag);
      });
      if(typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  }

  window.renderDetailedRequests = renderDetailedRequests = function(){
    const list = document.getElementById('detailedRequestsList');
    if(!list) return;
    const rows = myRequests();
    list.innerHTML = '';
    if(!rows.length){
      list.innerHTML = '<p style="text-align:center; opacity:0.5; padding:50px;">' + escapeHtml(t('No history found.','لا يوجد سجل طلبات.')) + '</p>';
      return;
    }
    rows.forEach(function(req){
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.dataset.status = normStatus(req.status || 'sent');
      card.dataset.requestId = req.id || '';
      card.style.cssText = 'width:100%; justify-content:space-between; padding:20px 30px;';
      card.innerHTML = '<div style="display:flex; align-items:center; gap:20px;">' +
        '<div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px;"><i data-lucide="package" style="color:#4caf50;"></i></div>' +
        '<div><h4 style="margin:0; text-transform:capitalize;">' + escapeHtml(displayType(req.type)) + ' Recycling</h4>' +
        '<p style="margin:0; opacity:0.6; font-size:0.8rem;">ID: ' + escapeHtml(req.id || '') + ' • ' + escapeHtml(req.weight || 0) + 'kg</p>' +
        '</div></div><div><span class="status-pill" style="background:' + statusColor(req.status) + ';">' + escapeHtml(statusLabel(req.status)) + '</span></div>';
      list.appendChild(card);
    });
    if(typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    window.filterRequests('all');
  };

  window.filterRequests = filterRequests = function(mode){
    const wrap = document.getElementById('myRequestsPage');
    if(!wrap) return;
    wrap.querySelectorAll('.seg-btn').forEach(function(btn){ btn.classList.remove('active'); });
    const labels = { all:['all','الكل'], active:['active','نشط'], completed:['completed','مكتمل'] };
    wrap.querySelectorAll('.seg-btn').forEach(function(btn){
      const text = String(btn.innerText || '').trim().toLowerCase();
      if((labels[mode] || []).includes(text)) btn.classList.add('active');
    });
    document.querySelectorAll('#detailedRequestsList .stat-card').forEach(function(card){
      const status = card.dataset.status || '';
      let show = true;
      if(mode === 'active') show = isActive(status);
      if(mode === 'completed') show = isCompleted(status);
      card.style.display = show ? 'flex' : 'none';
    });
  };

  window.markRequestCanceled = markRequestCanceled = function(requestId){
    const id = String(requestId || '').trim();
    if(!id) return;
    const next = readRequests().map(function(req){
      if(String(req && req.id || '').trim() !== id) return req;
      if(!isPending(req.status)) return req;
      return Object.assign({}, req, {
        status: 'canceled',
        cancelReason: req.cancelReason || 'Canceled by customer',
        canceledAt: new Date().toISOString()
      });
    });
    saveRequests(next);
    renderDashboardRequests();
    window.renderDetailedRequests();
  };

  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest ? e.target.closest('.card-cancel-btn') : null;
    if(!btn) return;
    const card = btn.closest('.arrival-card');
    const id = requestIdFromCard(card);
    const req = readRequests().find(function(item){ return String(item && item.id || '').trim() === id; });
    if(req && !isPending(req.status)){
      e.preventDefault();
      e.stopImmediatePropagation();
      alert(t('You can only cancel while the request is awaiting approval.','لا يمكنك إلغاء الطلب إلا وهو بانتظار الموافقة.'));
    }
  }, true);

  function weekStartMonday(date){
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
  }
  function nationalWeeklyEstimate(){
    const userData = readJson(JORDAN_FLOW_KEY, null);
    if(userData && Array.isArray(userData.days) && userData.days.length === 7){
      return {
        days: userData.days.map(function(v){ return Number(v) || 0; }),
        total: Number(userData.total) || userData.days.reduce(function(a,b){ return a + (Number(b) || 0); }, 0),
        unit: userData.unit || 'tons',
        source: userData.source || 'local data'
      };
    }
    const annualWasteTons = 2700000;
    const paperShare = 0.15;
    const municipalRecyclingRate = 0.07;
    const weeklyTons = Math.round((annualWasteTons * paperShare * municipalRecyclingRate) / 52);
    const pattern = [0.13, 0.15, 0.14, 0.16, 0.15, 0.14, 0.13];
    const start = weekStartMonday(new Date()).getTime();
    const seasonal = 0.94 + ((start / 86400000) % 9) / 100;
    const days = pattern.map(function(pct){ return Math.max(1, Math.round(weeklyTons * seasonal * pct)); });
    const total = days.reduce(function(sum, value){ return sum + value; }, 0);
    return { days: days, total: total, unit: 'tons', source: 'estimated from Jordan waste data' };
  }
  window.renderWeeklyRecyclingFlow = function(){
    const section = document.getElementById('weeklyFlowSection');
    const chart = document.getElementById('weeklyFlowChart');
    const totalEl = document.getElementById('weeklyFlowTotal');
    if(!section || !chart) return;
    const data = nationalWeeklyEstimate();
    const title = document.getElementById('weeklyFlowTitle');
    const sub = document.getElementById('weeklyFlowSubtitle');
    const unitSpan = section.querySelector('.weekly-flow-total span');
    if(title) title.textContent = t('Jordan Paper Recycling This Week','إعادة تدوير الورق في الأردن هذا الأسبوع');
    if(sub) sub.textContent = t('National weekly estimate for paper/cardboard recycling in Jordan','تقدير أسبوعي وطني لإعادة تدوير الورق والكرتون في الأردن');
    if(unitSpan) unitSpan.textContent = t(data.unit, data.unit === 'tons' ? 'طن' : data.unit);
    if(totalEl) totalEl.textContent = data.total.toLocaleString(isArabic() ? 'ar' : 'en');
    const labels = isArabic() ? ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'] : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const max = Math.max(1, Math.max.apply(null, data.days));
    chart.innerHTML = data.days.map(function(value, index){
      const h = Math.max(10, Math.round((value / max) * 100));
      return '<div class="weekly-flow-day"><div class="weekly-flow-bar-wrap" title="' + escapeHtml(value + ' ' + data.unit) + '"><span class="weekly-flow-count">' + escapeHtml(value.toLocaleString(isArabic() ? 'ar' : 'en')) + '</span><div class="weekly-flow-bar" style="height:' + h + '%"></div></div><small>' + labels[index] + '</small></div>';
    }).join('');
  };

  const oldHydrate = typeof window.hydrateOrdersFromStorage === 'function' ? window.hydrateOrdersFromStorage : null;
  if(oldHydrate){
    window.hydrateOrdersFromStorage = hydrateOrdersFromStorage = function(){
      const out = oldHydrate.apply(this, arguments);
      setTimeout(renderDashboardRequests, 20);
      return out;
    };
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      renderDashboardRequests();
      window.renderWeeklyRecyclingFlow();
    }, 180);
  });
  window.addEventListener('storage', function(e){
    if(e.key === REQ_KEY){ renderDashboardRequests(); window.renderDetailedRequests(); }
    if(e.key === JORDAN_FLOW_KEY){ window.renderWeeklyRecyclingFlow(); }
  });
  /* Do not rebuild the dashboard every 1.5s.
     Rebuilding the tracker cards was the cause of the blinking/glitch.
     Now we refresh only when the saved requests actually change. */
  let releafStableDashboardSnapshot = localStorage.getItem(REQ_KEY) || '[]';
  setInterval(function(){
    const nextSnapshot = localStorage.getItem(REQ_KEY) || '[]';
    if(nextSnapshot !== releafStableDashboardSnapshot){
      releafStableDashboardSnapshot = nextSnapshot;
      renderDashboardRequests();
    }
    window.renderWeeklyRecyclingFlow();
  }, 1500);
})();


/* ===== FINAL STABILITY PATCH: dashboard-only stable Jordan flow + cancel dashboard refresh ===== */
(function(){
  'use strict';
  const REQ_KEY = 'releaf_requests_v1';
  const JORDAN_FLOW_KEY = 'releaf_jordan_paper_weekly_v2';

  function isArabic(){ return document.documentElement.lang === 'ar'; }
  function tr(en, ar){ return isArabic() ? ar : en; }
  function readJson(key, fallback){
    try{
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    }catch(e){ return fallback; }
  }
  function writeJson(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
  function todayWeekKey(){
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayFromMonday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayFromMonday);
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function stableJordanWeeklyData(){
    const weekKey = todayWeekKey();
    const saved = readJson(JORDAN_FLOW_KEY, null);
    if(saved && saved.weekKey === weekKey && Array.isArray(saved.days) && saved.days.length === 7){
      return saved;
    }

    /*
      Static national estimate used as a stable weekly baseline.
      It stays fixed for the same week and only changes when a newer weekly value is saved
      or when the calendar moves to a new week.
    */
    const weeklyTons = 528;
    const pattern = [69, 79, 74, 84, 79, 74, 69];
    const total = pattern.reduce(function(sum, n){ return sum + n; }, 0);
    const scale = weeklyTons / total;
    const days = pattern.map(function(n){ return Math.round(n * scale); });
    const diff = weeklyTons - days.reduce(function(sum, n){ return sum + n; }, 0);
    days[3] += diff;

    const data = {
      weekKey: weekKey,
      total: weeklyTons,
      unit: 'tons',
      days: days,
      source: 'stable Jordan weekly paper/cardboard recycling estimate'
    };
    writeJson(JORDAN_FLOW_KEY, data);
    return data;
  }
  function updateWeeklyVisibility(){
    const section = document.getElementById('weeklyFlowSection');
    if(!section) return;
    const requestsPage = document.getElementById('myRequestsPage');
    const profileSection = document.getElementById('profileSection');
    const onRequests = requestsPage && getComputedStyle(requestsPage).display !== 'none';
    const onProfile = profileSection && getComputedStyle(profileSection).display !== 'none';
    section.style.display = (onRequests || onProfile) ? 'none' : '';
  }
  window.renderWeeklyRecyclingFlow = function(){
    const section = document.getElementById('weeklyFlowSection');
    const chart = document.getElementById('weeklyFlowChart');
    const totalEl = document.getElementById('weeklyFlowTotal');
    if(!section || !chart) return;

    updateWeeklyVisibility();

    const data = stableJordanWeeklyData();
    const title = document.getElementById('weeklyFlowTitle');
    const sub = document.getElementById('weeklyFlowSubtitle');
    const unitSpan = section.querySelector('.weekly-flow-total span');

    if(title) title.textContent = tr('Jordan Paper Recycling This Week','إعادة تدوير الورق في الأردن هذا الأسبوع');
    if(sub) sub.textContent = tr('Stable weekly estimate for paper/cardboard recycling across Jordan','تقدير أسبوعي ثابت لإعادة تدوير الورق والكرتون في الأردن');
    if(unitSpan) unitSpan.textContent = tr('tons','طن');
    if(totalEl) totalEl.textContent = Number(data.total || 0).toLocaleString(isArabic() ? 'ar' : 'en');

    const labels = isArabic()
      ? ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد']
      : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const max = Math.max(1, Math.max.apply(null, data.days));
    chart.innerHTML = data.days.map(function(value, index){
      const h = Math.max(12, Math.round((value / max) * 100));
      const safeValue = Number(value || 0).toLocaleString(isArabic() ? 'ar' : 'en');
      return '<div class="weekly-flow-day"><div class="weekly-flow-bar-wrap" title="' + safeValue + ' ' + tr('tons','طن') + '"><span class="weekly-flow-count">' + safeValue + '</span><div class="weekly-flow-bar" style="height:' + h + '%"></div></div><small>' + labels[index] + '</small></div>';
    }).join('');
  };

  function readRequests(){
    const list = readJson(REQ_KEY, []);
    return Array.isArray(list) ? list : [];
  }
  function saveRequests(list){ writeJson(REQ_KEY, Array.isArray(list) ? list : []); }
  function norm(status){ return String(status || '').trim().toLowerCase().replace(/[\s-]+/g,'_'); }
  function isCanceled(status){ return ['canceled','cancelled','ملغي','تم_الإلغاء','تم_الغاء','تم_إلغاء'].includes(norm(status)); }
  function isCompleted(status){ return ['completed','complete','done','delivered','finished','مكتمل'].includes(norm(status)); }
  function isPendingCancelable(status){ return ['', 'sent','pending','awaiting','awaiting_approval','waiting_approval','بانتظار_الموافقة','تم_إرسال_الطلب_إلى_الإدارة'].includes(norm(status)); }
  function cardRequestId(card){
    const el = card && card.querySelector ? card.querySelector('.trackID') : null;
    return el ? String(el.textContent || el.innerText || '').trim() : '';
  }
  function removeDashboardCanceledCards(){
    const requests = readRequests();
    const statusById = new Map(requests.map(function(req){ return [String(req && req.id || '').trim(), req && req.status]; }));
    document.querySelectorAll('#trackerContainer .arrival-card').forEach(function(card){
      const id = cardRequestId(card);
      const status = statusById.get(id);
      if(isCanceled(status) || isCompleted(status)) card.remove();
    });
    const activity = document.getElementById('activityTable');
    if(activity){
      activity.querySelectorAll('tr').forEach(function(row){
        const id = row.cells && row.cells[0] ? String(row.cells[0].textContent || '').trim() : '';
        const status = statusById.get(id);
        if(id && (isCanceled(status) || isCompleted(status))) row.remove();
      });
    }
  }

  window.markRequestCanceled = markRequestCanceled = function(requestId){
    const id = String(requestId || '').trim();
    if(!id) return;
    const next = readRequests().map(function(req){
      if(!req || String(req.id || '').trim() !== id) return req;
      if(!isPendingCancelable(req.status)) return req;
      return Object.assign({}, req, {
        status: 'canceled',
        cancelReason: req.cancelReason || 'Canceled by customer',
        canceledAt: req.canceledAt || new Date().toISOString()
      });
    });
    saveRequests(next);
    removeDashboardCanceledCards();
    if(typeof renderDashboardRequests === 'function') setTimeout(renderDashboardRequests, 10);
    if(typeof renderDetailedRequests === 'function') setTimeout(renderDetailedRequests, 20);
  };

  document.addEventListener('click', function(e){
    setTimeout(function(){
      updateWeeklyVisibility();
      window.renderWeeklyRecyclingFlow();
      removeDashboardCanceledCards();
    }, 80);
  });
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      updateWeeklyVisibility();
      window.renderWeeklyRecyclingFlow();
      removeDashboardCanceledCards();
    }, 250);
  });
  window.addEventListener('storage', function(e){
    if(e.key === JORDAN_FLOW_KEY || e.key === REQ_KEY){
      setTimeout(function(){
        window.renderWeeklyRecyclingFlow();
        removeDashboardCanceledCards();
      }, 50);
    }
  });
})();

/* ===== FINAL USER PAGE PATCH: prevent weekly flow flicker on page switch ===== */
(function(){
  'use strict';

  function weeklySection(){
    return document.getElementById('weeklyFlowSection');
  }

  function isDashboardTarget(target){
    return target && target.id === 'navDashboard';
  }

  function setWeeklyFlowVisible(visible){
    const section = weeklySection();
    if(!section) return;
    section.style.display = visible ? '' : 'none';
    section.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function currentPageIsDashboard(){
    const requestsPage = document.getElementById('myRequestsPage');
    const profileSection = document.getElementById('profileSection');
    const requestsVisible = requestsPage && getComputedStyle(requestsPage).display !== 'none';
    const profileVisible = profileSection && getComputedStyle(profileSection).display !== 'none';
    return !requestsVisible && !profileVisible;
  }

  document.addEventListener('click', function(e){
    const navLink = e.target && e.target.closest ? e.target.closest('.nav-links a') : null;
    if(!navLink || navLink.id === 'contactBtn' || navLink.id === 'logoutBtn') return;

    // Run before the original navigation handler so the chart never flashes on other pages.
    setWeeklyFlowVisible(isDashboardTarget(navLink));
  }, true);

  const oldRenderWeeklyFlow = typeof window.renderWeeklyRecyclingFlow === 'function'
    ? window.renderWeeklyRecyclingFlow
    : null;

  window.renderWeeklyRecyclingFlow = function(){
    if(!currentPageIsDashboard()){
      setWeeklyFlowVisible(false);
      return;
    }
    setWeeklyFlowVisible(true);
    if(oldRenderWeeklyFlow) oldRenderWeeklyFlow.apply(this, arguments);
  };

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      setWeeklyFlowVisible(currentPageIsDashboard());
    }, 0);
  });
})();


/* ===== REQUESTED ONLY PATCH: hard-stop weekly flow flicker outside Dashboard ===== */
(function(){
  'use strict';

  function weeklySection(){
    return document.getElementById('weeklyFlowSection');
  }

  function pageState(){
    const requests = document.getElementById('myRequestsPage');
    const profile = document.getElementById('profileSection');
    const navDashboard = document.getElementById('navDashboard');
    const requestsOpen = requests && getComputedStyle(requests).display !== 'none';
    const profileOpen = profile && getComputedStyle(profile).display !== 'none';
    const dashboardActive = navDashboard && navDashboard.classList.contains('active');
    return dashboardActive && !requestsOpen && !profileOpen;
  }

  function setFlowForDashboard(){
    const section = weeklySection();
    if(!section) return;
    if(pageState()){
      section.style.removeProperty('display');
      section.style.removeProperty('visibility');
      section.style.removeProperty('height');
      section.style.removeProperty('margin');
      section.style.removeProperty('padding');
      section.style.removeProperty('overflow');
      section.style.removeProperty('border');
      section.setAttribute('aria-hidden', 'false');
    } else {
      section.style.setProperty('display', 'none', 'important');
      section.style.setProperty('visibility', 'hidden', 'important');
      section.style.setProperty('height', '0', 'important');
      section.style.setProperty('margin', '0', 'important');
      section.style.setProperty('padding', '0', 'important');
      section.style.setProperty('overflow', 'hidden', 'important');
      section.style.setProperty('border', '0', 'important');
      section.setAttribute('aria-hidden', 'true');
    }
  }

  function hideImmediatelyWhenLeavingDashboard(e){
    const link = e.target && e.target.closest ? e.target.closest('.nav-links a') : null;
    if(!link || link.id === 'navDashboard' || link.id === 'contactBtn' || link.id === 'logoutBtn') return;
    const section = weeklySection();
    if(section){
      section.style.setProperty('display', 'none', 'important');
      section.style.setProperty('visibility', 'hidden', 'important');
      section.setAttribute('aria-hidden', 'true');
    }
  }

  ['pointerdown','mousedown','touchstart','click'].forEach(function(evt){
    document.addEventListener(evt, hideImmediatelyWhenLeavingDashboard, true);
  });

  document.addEventListener('click', function(){
    setTimeout(setFlowForDashboard, 0);
    setTimeout(setFlowForDashboard, 40);
    setTimeout(setFlowForDashboard, 160);
  }, true);

  document.addEventListener('DOMContentLoaded', function(){
    setFlowForDashboard();
    const targets = [
      document.getElementById('myRequestsPage'),
      document.getElementById('profileSection'),
      document.getElementById('navDashboard'),
      document.getElementById('navRequests'),
      document.getElementById('navProfile')
    ].filter(Boolean);

    if(window.MutationObserver){
      const observer = new MutationObserver(setFlowForDashboard);
      targets.forEach(function(el){ observer.observe(el, { attributes: true, attributeFilter: ['style','class'] }); });
    }
  });
})();

/* ===== REQUESTED ONLY PATCH: stop dashboard text/layout movement when returning ===== */
(function(){
  'use strict';

  const JORDAN_FLOW_KEY = 'releaf_jordan_paper_weekly_v2';

  function isArabic(){
    return document.documentElement.lang === 'ar' || localStorage.getItem('releaf_language_v1') === 'ar' || localStorage.getItem('lang') === 'ar';
  }

  function txt(en, ar){
    return isArabic() ? ar : en;
  }

  function weekKey(){
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayFromMonday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dayFromMonday);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function readFlowData(){
    try{
      const saved = JSON.parse(localStorage.getItem(JORDAN_FLOW_KEY) || 'null');
      if(saved && saved.weekKey === weekKey() && Array.isArray(saved.days) && saved.days.length === 7){
        return saved;
      }
    }catch(e){}

    const data = {
      weekKey: weekKey(),
      total: 528,
      unit: 'tons',
      days: [69, 79, 74, 84, 79, 74, 69]
    };

    try{ localStorage.setItem(JORDAN_FLOW_KEY, JSON.stringify(data)); }catch(e){}
    return data;
  }

  function makeFlowMarkup(data){
    const labels = isArabic()
      ? ['الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد']
      : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const max = Math.max(1, Math.max.apply(null, data.days));

    return data.days.map(function(value, index){
      const height = Math.max(12, Math.round((Number(value || 0) / max) * 100));
      const shown = Number(value || 0).toLocaleString(isArabic() ? 'ar' : 'en');
      return '<div class="weekly-flow-day"><div class="weekly-flow-bar-wrap" title="' + shown + ' ' + txt('tons','طن') + '"><span class="weekly-flow-count">' + shown + '</span><div class="weekly-flow-bar" style="height:' + height + '%"></div></div><small>' + labels[index] + '</small></div>';
    }).join('');
  }

  function prepareDashboardFlowBeforeShow(){
    const section = document.getElementById('weeklyFlowSection');
    const title = document.getElementById('weeklyFlowTitle');
    const subtitle = document.getElementById('weeklyFlowSubtitle');
    const total = document.getElementById('weeklyFlowTotal');
    const chart = document.getElementById('weeklyFlowChart');
    if(!section || !chart) return;

    const data = readFlowData();

    if(title) title.textContent = txt('Jordan Paper Recycling This Week','إعادة تدوير الورق في الأردن هذا الأسبوع');
    if(subtitle) subtitle.textContent = txt('Stable weekly estimate for paper/cardboard recycling across Jordan','تقدير أسبوعي ثابت لإعادة تدوير الورق والكرتون في الأردن');
    const unit = section.querySelector('.weekly-flow-total span');
    if(unit) unit.textContent = txt('tons','طن');
    if(total) total.textContent = Number(data.total || 0).toLocaleString(isArabic() ? 'ar' : 'en');
    chart.innerHTML = makeFlowMarkup(data);
  }

  function stabilizeDashboardNow(){
    document.body.classList.add('releaf-dashboard-stabilizing');
    prepareDashboardFlowBeforeShow();

    const section = document.getElementById('weeklyFlowSection');
    if(section){
      section.style.removeProperty('height');
      section.style.removeProperty('margin');
      section.style.removeProperty('padding');
      section.style.removeProperty('border');
      section.style.removeProperty('overflow');
      section.style.removeProperty('visibility');
      section.style.display = '';
      section.setAttribute('aria-hidden', 'false');
    }

    setTimeout(function(){
      prepareDashboardFlowBeforeShow();
      document.body.classList.remove('releaf-dashboard-stabilizing');
    }, 180);
  }

  document.addEventListener('pointerdown', function(e){
    const link = e.target && e.target.closest ? e.target.closest('#navDashboard') : null;
    if(link) stabilizeDashboardNow();
  }, true);

  document.addEventListener('click', function(e){
    const link = e.target && e.target.closest ? e.target.closest('#navDashboard') : null;
    if(!link) return;
    stabilizeDashboardNow();
    setTimeout(stabilizeDashboardNow, 0);
    setTimeout(stabilizeDashboardNow, 60);
  }, true);
})();


/* ===== FINAL SUBMIT FIX ONLY ===== */
(function () {
    const REQUESTS_KEY = 'releaf_requests_v1';
    const CLOSED_STATUSES = new Set(['canceled', 'cancelled', 'completed', 'complete', 'done', 'finished', 'delivered']);

    function safeJson(key, fallback) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || 'null');
            return parsed == null ? fallback : parsed;
        } catch (e) {
            return fallback;
        }
    }

    function profile() {
        try {
            return typeof readProfile === 'function' ? readProfile() : safeJson('releaf_profile_v1', {});
        } catch (e) {
            return safeJson('releaf_profile_v1', {});
        }
    }

    function currentUser() {
        return safeJson('currentUser', {});
    }

    function ownerUsername() {
        const p = profile();
        const u = currentUser();
        return String(p.username || u.username || '').replace(/^@/, '').trim().toLowerCase();
    }

    function ownerEmail() {
        const p = profile();
        const u = currentUser();
        return String(p.email || u.email || '').trim().toLowerCase();
    }

    function ownerName() {
        const p = profile();
        const u = currentUser();
        return String(
            p.fullName ||
            p.name ||
            u.fullName ||
            [u.firstName, u.lastName].filter(Boolean).join(' ') ||
            ''
        ).trim();
    }

    function ownerPhone() {
        const p = profile();
        const u = currentUser();
        return String(p.phone || u.phone || '').trim();
    }

    function normalizeStatus(status) {
        return String(status || 'sent').trim().toLowerCase().replace(/[\s-]+/g, '_');
    }

    function belongsToMe(req) {
        const myUsername = ownerUsername();
        const myEmail = ownerEmail();

        const reqUsername = String(req.ownerUsername || req.username || '').replace(/^@/, '').trim().toLowerCase();
        const reqEmail = String(req.ownerEmail || req.email || '').trim().toLowerCase();

        if (myUsername && reqUsername && reqUsername === myUsername) return true;
        if (myEmail && reqEmail && reqEmail === myEmail) return true;

        return false;
    }

    function activeMineOnly() {
        const all = safeJson(REQUESTS_KEY, []);
        if (!Array.isArray(all)) return [];

        return all
            .filter(function (req) {
                if (!req || !req.id) return false;
                if (!belongsToMe(req)) return false;
                return !CLOSED_STATUSES.has(normalizeStatus(req.status));
            })
            .sort(function (a, b) {
                const ad = Date.parse(a.createdAt || a.requestDate || a.collectionDate || '') || 0;
                const bd = Date.parse(b.createdAt || b.requestDate || b.collectionDate || '') || 0;
                return bd - ad;
            });
    }

    function allRequests() {
        const all = safeJson(REQUESTS_KEY, []);
        return Array.isArray(all) ? all : [];
    }

    function saveAllRequests(list) {
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function text(en, ar) {
        try {
            return document.documentElement.lang === 'ar' ? ar : en;
        } catch (e) {
            return en;
        }
    }

    function redrawRecentActivity() {
        const table = document.getElementById('activityTable');
        if (!table) return;

        const list = activeMineOnly();
        table.innerHTML = '';

        if (!list.length) {
            table.innerHTML =
                '<tr id="emptyMsg"><td colspan="4" style="text-align:center; opacity:0.5; padding:40px;">' +
                text('No requests yet. Add your first collection request!', 'لا توجد طلبات بعد. أضف أول طلب جمع!') +
                '</td></tr>';
            if (typeof updateGlobalStats === 'function') updateGlobalStats(0);
            return;
        }

        list.forEach(function (req) {
            const status = normalizeStatus(req.status);
            let statusText = text('Awaiting Approval', 'بانتظار الموافقة');
            let color = '#856404';

            if (status === 'approved' || status === 'assigned' || req.adminName) {
                statusText = text('Approved', 'تمت الموافقة');
                color = '#5f8fa2';
            }

            if (status === 'driver_en_route' || status === 'driver' || req.driverName) {
                statusText = text('Driver En Route', 'السائق بالطريق');
                color = '#5f8fa2';
            }

            const row = document.createElement('tr');
            row.innerHTML =
                '<td>' + escapeHtml(req.id) + '</td>' +
                '<td style="text-transform:capitalize;">' + escapeHtml(req.type || '') + '</td>' +
                '<td>' + escapeHtml(req.weight || 0) + 'kg</td>' +
                '<td><span class="status-pill" style="background:' + color + ';">' + escapeHtml(statusText) + '</span></td>';
            table.appendChild(row);
        });

        if (typeof updateGlobalStats === 'function') {
            const total = list.reduce(function (sum, req) {
                return sum + (Number(req.weight) || 0);
            }, 0);
            updateGlobalStats(total);
        }
    }

    function submitRequest(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const paperStatus = document.getElementById('paperStatus');
        const weightInput = document.getElementById('weight');
        const dateInput = document.getElementById('collectionDate');
        const slotInput = document.getElementById('availableSlot');
        const notesInput = document.getElementById('notes');
        const provinceInput = document.getElementById('province');
        const districtInput = document.getElementById('district');

        const weight = Number(weightInput && weightInput.value);
        if (!Number.isFinite(weight) || weight <= 0) {
            alert(text('Please enter a valid weight.', 'يرجى إدخال وزن صحيح.'));
            return false;
        }

        const requestDate = dateInput ? dateInput.value : '';
        if (!requestDate) {
            alert(text('Please choose your preferred collection date.', 'يرجى اختيار تاريخ الجمع المفضل.'));
            return false;
        }

        const availableSlot = slotInput ? slotInput.value : '';
        if (!availableSlot) {
            alert(text('Please choose your preferred collection time.', 'يرجى اختيار وقت الجمع المفضل.'));
            return false;
        }

        const p = profile();
        const finalProvince =
            (typeof gpsProvince !== 'undefined' && gpsProvince) ||
            p.profileProvince ||
            p.province ||
            (provinceInput ? provinceInput.value : '') ||
            'Amman';

        const finalDistrict =
            (districtInput ? districtInput.value : '') ||
            p.profileDistrict ||
            p.district ||
            '';

        const action =
            (typeof selectedAction !== 'undefined' && selectedAction) ||
            'sell';

        const type = paperStatus ? paperStatus.value : 'paper';
        const requestId = '#' + Math.floor(Math.random() * 9000 + 1000);

        const hub =
            (typeof recyclingHubs !== 'undefined' && (recyclingHubs[finalProvince] || recyclingHubs.Default)) ||
            { name: '', info: '' };

        const newRequest = {
            id: requestId,
            ownerUsername: ownerUsername(),
            ownerEmail: ownerEmail(),
            ownerName: ownerName(),
            ownerPhone: ownerPhone(),
            type: type,
            weight: weight,
            status: 'sent',
            action: action,
            notes: notesInput ? notesInput.value : '',
            province: finalProvince,
            district: finalDistrict,
            createdAt: new Date().toISOString(),
            requestDate: requestDate,
            collectionDate: requestDate,
            availableSlot: availableSlot,
            minWeightEstimate: weight,
            hubName: hub.name || '',
            hubInfo: hub.info || ''
        };

        const all = allRequests();
        all.unshift(newRequest);
        saveAllRequests(all);

        try {
            if (typeof syncPickupLocationToProfile === 'function') {
                const lat = p.profileLat || null;
                const lon = p.profileLon || null;
                if (lat && lon) syncPickupLocationToProfile(lat, lon, finalProvince, 'manual');
            }
        } catch (e) {}

        if (typeof locationMode !== 'undefined') locationMode = null;
        if (typeof selectedAction !== 'undefined') selectedAction = null;

        const form = document.getElementById('recycleForm');
        if (form) form.reset();

        const modal = document.getElementById('formModal');
        if (modal) modal.style.display = 'none';

        document.body.style.overflow = 'auto';

        try {
            if (typeof resetRecycleFormLocationFields === 'function') resetRecycleFormLocationFields();
        } catch (e) {}

        try {
            document.querySelectorAll('#actionToggle .seg-btn').forEach(function (b) { b.classList.remove('active'); });
            document.querySelectorAll('.loc-btn').forEach(function (b) { b.classList.remove('active'); });
            const exchangeWrap = document.getElementById('exchangeChoiceWrap');
            if (exchangeWrap) exchangeWrap.style.display = 'none';
            const manualFields = document.getElementById('manualLocationFields');
            if (manualFields) manualFields.style.display = 'none';
            const mapWrapper = document.getElementById('mapWrapper');
            if (mapWrapper) mapWrapper.style.display = 'none';
        } catch (e) {}

        redrawRecentActivity();

        alert(text('Request submitted successfully.', 'تم إرسال الطلب بنجاح.'));
        return false;
    }

    function installFix() {
        const form = document.getElementById('recycleForm');
        if (!form) return;

        form.onsubmit = submitRequest;

        const submitButton = document.getElementById('txtSubmitRequestBtn');
        if (submitButton && submitButton.dataset.submitFixBound !== '1') {
            submitButton.dataset.submitFixBound = '1';
            submitButton.addEventListener('click', function () {
                setTimeout(function () {
                    const formNow = document.getElementById('recycleForm');
                    if (formNow) formNow.onsubmit = submitRequest;
                }, 0);
            }, true);
        }

        window.hydrateOrdersFromStorage = redrawRecentActivity;
        try { hydrateOrdersFromStorage = redrawRecentActivity; } catch (e) {}

        redrawRecentActivity();
        setTimeout(redrawRecentActivity, 50);
        setTimeout(redrawRecentActivity, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', installFix);
    } else {
        installFix();
    }

    window.addEventListener('storage', function (event) {
        if (event.key === REQUESTS_KEY) redrawRecentActivity();
    });
})(function () {
  const KEY = 'releaf_requests_v1';

  function esc(v){
    return String(v || '').replace(/[&<>"']/g, m => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[m]));
  }

  function readRequests(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch(e){ return []; }
  }

  function addAdminDetailsToCustomerCards(){
    const requests = readRequests();

    document.querySelectorAll('.arrival-card').forEach(card => {
      const id = card.querySelector('.trackID')?.innerText?.trim();
      if(!id) return;

      const req = requests.find(r => String(r.id).trim() === id);
      if(!req) return;

      const hub = card.querySelector('.trackHub');
      if(!hub) return;

      const old = hub.querySelector('.admin-details-line');
      if(old) old.remove();

      const lines = [];

      if(req.adminName || req.handledBy)
        lines.push(`<strong>Handled by:</strong> ${esc(req.adminName || req.handledBy)}`);

      if(req.driverName)
        lines.push(`<strong>Driver:</strong> ${esc(req.driverName)}`);

      if(req.driverPhone || req.driverMobile)
        lines.push(`<strong>Driver phone:</strong> ${esc(req.driverPhone || req.driverMobile)}`);

      if(req.scheduledDate || req.adminScheduledDate)
        lines.push(`<strong>Pickup date:</strong> ${esc(req.scheduledDate || req.adminScheduledDate)}`);

      if(req.scheduledTime || req.adminScheduledTime || req.eta)
        lines.push(`<strong>Pickup time:</strong> ${esc(req.scheduledTime || req.adminScheduledTime || req.eta)}`);

      if(req.adminNote)
        lines.push(`<strong>Admin note:</strong> ${esc(req.adminNote)}`);

      if(lines.length){
        hub.innerHTML += `<div class="admin-details-line" style="margin-top:10px;">${lines.join('<br>')}</div>`;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addAdminDetailsToCustomerCards, 500);
    setTimeout(addAdminDetailsToCustomerCards, 1200);
  });

  window.addEventListener('storage', addAdminDetailsToCustomerCards);
})();




/* ===== FINAL CUSTOMER DISPLAY: show admin info in each request card ===== */
(function(){
  const KEY = 'releaf_requests_v1';

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, m => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    }[m]));
  }

  function readRaw(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; }
    catch(e){ return []; }
  }

  function cleanId(v){
    return String(v || '').replace(/\s+/g, '').trim();
  }

  function showAdminInfo(){
    const requests = readRaw();

    document.querySelectorAll('.arrival-card').forEach(card => {
      const id = cleanId(card.querySelector('.trackID')?.textContent);
      const hub = card.querySelector('.trackHub');
      if(!id || !hub) return;

      const req = requests.find(r => cleanId(r.id) === id);
      if(!req) return;

      const old = hub.querySelector('.customer-admin-info');
      if(old) old.remove();

      const lines = [];
      const admin = req.adminName || req.handledBy || '';
      const driver = req.driverName || '';
      const phone = req.driverPhone || req.driverMobile || '';
      const date = req.scheduledDate || req.adminScheduledDate || '';
      const time = req.eta || req.pickupEta || req.scheduledTime || req.adminScheduledTime || '';
      const note = req.adminNote || '';

      if(admin) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'الأدمن المسؤول' : 'Handled by'}:</strong> ${esc(admin)}`);
      if(driver) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'السائق' : 'Driver'}:</strong> ${esc(driver)}`);
      if(phone) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'رقم السائق' : 'Driver phone'}:</strong> ${esc(phone)}`);
      if(date) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'تاريخ الاستلام' : 'Pickup date'}:</strong> ${esc(date)}`);
      if(time) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'وقت الاستلام' : 'Pickup time'}:</strong> ${esc(time)}`);
      if(note) lines.push(`<strong>${document.documentElement.lang === 'ar' ? 'ملاحظة الأدمن' : 'Admin note'}:</strong> ${esc(note)}`);

      if(lines.length){
        hub.insertAdjacentHTML('beforeend', `<div class="customer-admin-info" style="margin-top:10px;">${lines.join('<br>')}</div>`);
      }
    });
  }

  function refreshAdminInfoSoon(){
    setTimeout(showAdminInfo, 50);
    setTimeout(showAdminInfo, 300);
    setTimeout(showAdminInfo, 1000);
  }

  document.addEventListener('DOMContentLoaded', refreshAdminInfoSoon);
  window.addEventListener('storage', refreshAdminInfoSoon);

  const oldHydrate = window.hydrateOrdersFromStorage;
  window.hydrateOrdersFromStorage = function(){
    if(typeof oldHydrate === 'function') oldHydrate.apply(this, arguments);
    refreshAdminInfoSoon();
  };

  const target = document.getElementById('trackerContainer');
  if(target && typeof MutationObserver !== 'undefined'){
    new MutationObserver(refreshAdminInfoSoon).observe(target, {childList:true, subtree:true});
  }

  refreshAdminInfoSoon();
})();
