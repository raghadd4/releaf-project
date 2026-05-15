/* ========================================================
   firebase-sync.js  -  Firebase data sync + auth for ReLeaf
   Load AFTER all other app scripts (jj.js / script.js / jsR.js).
   ======================================================== */
(function () {
  'use strict';

  var db = window.fbDb;
  var auth = window.fbAuth;
  if (!db || !auth) { console.error('[ReLeaf] Firebase not ready.'); return; }

  var _origSetItem = window._fbOrigSetItem || localStorage.setItem.bind(localStorage);

  /* ===== HELPERS ===== */
  function norm(u) { return String(u || '').replace(/^@/, '').trim().toLowerCase(); }
  function safeJson(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key) || 'null'); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function setMsgSafe(id, text, color) {
    if (typeof setMsg === 'function') { setMsg(id, text, color); return; }
    var el = document.getElementById(id);
    if (el) { el.innerText = text || ''; if (color) el.style.color = color; }
  }

  /* ===== FIRESTORE OPERATIONS ===== */

  function reqDocId(id) { return String(id || 'unknown').replace(/#/g, 'R').replace(/[^a-zA-Z0-9_-]/g, '_'); }

  function fbSaveAllRequests(list) {
    if (!Array.isArray(list) || !list.length) return Promise.resolve();
    // Batch write (max 500 per batch, fine for this app)
    var batch = db.batch();
    list.forEach(function (req) {
      var ref = db.collection('requests').doc(reqDocId(req.id));
      // Don't store undefined values
      var clean = JSON.parse(JSON.stringify(req));
      batch.set(ref, clean, { merge: true });
    });
    return batch.commit().catch(function (e) { console.error('[fb] save requests:', e); });
  }

  function fbDeleteRequest(id) {
    return db.collection('requests').doc(reqDocId(id)).delete()
      .catch(function (e) { console.error('[fb] delete request:', e); });
  }

  function fbLoadRequests() {
    return db.collection('requests').get().then(function (snap) {
      var list = snap.docs.map(function (d) { return d.data(); });
      list.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
      window._fbIsSyncing(true);
      _origSetItem('releaf_requests_v1', JSON.stringify(list));
      window._fbIsSyncing(false);
      return list;
    }).catch(function (e) { console.error('[fb] load requests:', e); return []; });
  }

  function fbSaveProfile(uid, profile) {
    if (!uid || !profile) return Promise.resolve();
    var clean = JSON.parse(JSON.stringify(profile));
    return db.collection('users').doc(uid).set({ profile: clean }, { merge: true })
      .catch(function (e) { console.error('[fb] save profile:', e); });
  }

  function fbLoadProfile(uid) {
    if (!uid) return Promise.resolve(null);
    return db.collection('users').doc(uid).get().then(function (doc) {
      if (!doc.exists) return null;
      var data = doc.data();
      window._fbIsSyncing(true);
      if (data.profile) _origSetItem('releaf_profile_v1', JSON.stringify(data.profile));
      _origSetItem('currentUser', JSON.stringify(data));
      window._fbIsSyncing(false);
      return data;
    }).catch(function (e) { console.error('[fb] load profile:', e); return null; });
  }

  function fbSaveUser(uid, userData) {
    var clean = JSON.parse(JSON.stringify(userData));
    // Never store password in Firestore
    delete clean.password;
    var p1 = db.collection('users').doc(uid).set(clean, { merge: true });
    var username = norm(userData.username);
    var p2 = username
      ? db.collection('usernames').doc(username).set({ uid: uid, username: userData.username })
      : Promise.resolve();
    return Promise.all([p1, p2]).catch(function (e) { console.error('[fb] save user:', e); });
  }

  function fbLookupUser(input) {
    var n = norm(input);
    return db.collection('usernames').doc(n).get().then(function (doc) {
      if (doc.exists) {
        return db.collection('users').doc(doc.data().uid).get().then(function (uDoc) {
          return uDoc.exists ? Object.assign({}, uDoc.data(), { uid: uDoc.id }) : null;
        });
      }
      // Try email lookup
      return db.collection('users').where('email', '==', input.toLowerCase().trim()).limit(1).get().then(function (snap) {
        return snap.empty ? null : Object.assign({}, snap.docs[0].data(), { uid: snap.docs[0].id });
      });
    }).catch(function (e) { console.error('[fb] lookup user:', e); return null; });
  }

  function fbUsernameExists(username) {
    return db.collection('usernames').doc(norm(username)).get()
      .then(function (d) { return d.exists; }).catch(function () { return false; });
  }

  function fbEmailExists(email) {
    return db.collection('users').where('email', '==', email.toLowerCase().trim()).limit(1).get()
      .then(function (snap) { return !snap.empty; }).catch(function () { return false; });
  }

  /* ===== Wire interceptor sync functions ===== */
  window._fbSyncRequests = fbSaveAllRequests;
  window._fbSyncProfile = fbSaveProfile;

  /* ===== PAGE DETECTION ===== */
  var hasFirstName = !!document.getElementById('firstName');
  var hasRoleSelect = !!document.getElementById('roleSelect');
  var isSignup = hasFirstName;
  var isLogin = hasRoleSelect && !hasFirstName;
  var isCustomer = !!document.getElementById('recycleForm');
  var isAdmin = !!document.querySelector('.sidebar') && !isCustomer && !isSignup && !isLogin;

  /* ==========================================================
     REGISTER OVERRIDE (signup page only)
     ========================================================== */
  if (isSignup) {
    window.register = function () {
      var firstName = (document.getElementById('firstName').value || '').trim();
      var lastName = (document.getElementById('lastName') ? document.getElementById('lastName').value || '' : '').trim();
      var username = (document.getElementById('username').value || '').trim();
      var emailRaw = (document.getElementById('email').value || '').trim();
      var email = typeof normalizeEmail === 'function' ? normalizeEmail(emailRaw) : emailRaw.toLowerCase();
      var phoneEl = document.getElementById('phone');
      var phone = typeof normalizeJordanPhone === 'function'
        ? normalizeJordanPhone(phoneEl ? phoneEl.value || '' : '')
        : (phoneEl ? phoneEl.value || '' : '').trim();
      var password = document.getElementById('password') ? document.getElementById('password').value || '' : '';
      var confirmEl = document.getElementById('confirmPassword');
      var confirmPassword = confirmEl ? confirmEl.value || '' : '';

      // Clear messages
      ['userMsg', 'emailMsg', 'phoneMsg', 'passMsg', 'confirmMsg'].forEach(function (id) {
        setMsgSafe(id, '', '');
      });

      // Local validation
      var isAr = document.documentElement.lang === 'ar';
      if (!firstName) { setMsgSafe('userMsg', isAr ? '❌ الاسم الأول مطلوب' : '❌ First name is required', '#d9534f'); return; }
      if (!username) { setMsgSafe('userMsg', isAr ? '❌ اسم المستخدم مطلوب' : '❌ Username is required', '#d9534f'); return; }
      if (typeof validUsernameValue === 'function' && !validUsernameValue(username)) {
        setMsgSafe('userMsg', typeof tr === 'function' ? tr('invalidUsername') : '❌ Invalid username', '#d9534f'); return;
      }
      if (!email) { setMsgSafe('emailMsg', isAr ? '❌ البريد الإلكتروني مطلوب' : '❌ Email is required', '#d9534f'); return; }
      if (typeof validEmailValue === 'function' && !validEmailValue(email)) {
        setMsgSafe('emailMsg', typeof tr === 'function' ? tr('invalidEmail') : '❌ Invalid email', '#d9534f'); return;
      }
      if (!phone) { setMsgSafe('phoneMsg', isAr ? '❌ رقم الهاتف مطلوب' : '❌ Phone is required', '#d9534f'); return; }
      if (typeof validPhoneValue === 'function' && !validPhoneValue(phone)) {
        setMsgSafe('phoneMsg', typeof tr === 'function' ? tr('invalidPhone') : '❌ Invalid phone', '#d9534f'); return;
      }
      if (phoneEl) phoneEl.value = phone;
      var emailInput = document.getElementById('email');
      if (emailInput) emailInput.value = email;
      if (!password) { setMsgSafe('passMsg', isAr ? '❌ كلمة المرور مطلوبة' : '❌ Password is required', '#d9534f'); return; }
      if (typeof passwordScore === 'function' && passwordScore(password) === 1) {
        setMsgSafe('passMsg', typeof tr === 'function' ? tr('passwordTooWeak') : '❌ Password too weak', '#d9534f'); return;
      }
      if (confirmEl) {
        if (!confirmPassword) { setMsgSafe('confirmMsg', typeof tr === 'function' ? tr('confirmPasswordRequired') : '❌ Confirm password', '#d9534f'); return; }
        if (confirmPassword !== password) { setMsgSafe('confirmMsg', typeof tr === 'function' ? tr('passwordsMismatch') : '❌ Passwords don\'t match', '#d9534f'); return; }
      }

      // Async: check Firestore + create Firebase Auth user
      Promise.all([fbUsernameExists(username), fbEmailExists(email)]).then(function (results) {
        if (results[0]) { setMsgSafe('userMsg', typeof tr === 'function' ? tr('usernameExists') : '❌ Username taken', '#d9534f'); return; }
        if (results[1]) { setMsgSafe('emailMsg', typeof tr === 'function' ? tr('emailExists') : '❌ Email already used', '#d9534f'); return; }

        return auth.createUserWithEmailAndPassword(email, password).then(function (cred) {
          var uid = cred.user.uid;
          var fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || username;
          var userData = {
            firstName: firstName, lastName: lastName, username: username,
            email: email, phone: phone, role: 'customer',
            createdAt: new Date().toISOString(),
            profile: {
              fullName: fullName, email: email, phone: phone, username: username,
              passwordUpdatedAt: Date.now(), photo: null,
              profileProvince: '', profileLat: null, profileLon: null, profileLocationSource: ''
            }
          };

          return fbSaveUser(uid, userData).then(function () {
            // Also save to localStorage for backward compat
            var users = safeJson('users', []);
            users.push({ firstName: firstName, lastName: lastName, username: username, email: email, phone: phone, role: 'customer' });
            _origSetItem('users', JSON.stringify(users));
            _origSetItem('currentUser', JSON.stringify(userData));
            _origSetItem('releaf_profile_v1', JSON.stringify(userData.profile));

            if (typeof releafSetLoggedInCustomer === 'function') releafSetLoggedInCustomer(userData);
            alert(typeof tr === 'function' ? tr('accountCreated') : 'Account created successfully!');
            if (typeof releafPersistCurrentLanguage === 'function') releafPersistCurrentLanguage();
            location.href = 'customer.html';
          });
        });
      }).catch(function (e) {
        console.error('[fb] register error:', e);
        if (e.code === 'auth/email-already-in-use') {
          setMsgSafe('emailMsg', '❌ Email already in use', '#d9534f');
        } else if (e.code === 'auth/weak-password') {
          setMsgSafe('passMsg', '❌ Password too weak (min 6 characters)', '#d9534f');
        } else if (e.code === 'auth/operation-not-allowed') {
          alert('Error: Email/Password sign-in is not enabled in Firebase Console. Go to Authentication → Sign-in method → Enable Email/Password.');
        } else {
          alert('Registration error: ' + (e.message || e));
        }
      });
    };
  }

  /* ==========================================================
     LOGIN OVERRIDE (login page only)
     ========================================================== */
  if (isLogin) {
    window.login = function () {
      var username = (document.getElementById('username').value || '').trim();
      var password = document.getElementById('password') ? document.getElementById('password').value || '' : '';
      var role = document.getElementById('roleSelect') ? document.getElementById('roleSelect').value || 'customer' : 'customer';

      setMsgSafe('userMsg', '', '');
      setMsgSafe('passMsg', '', '');

      if (!username || !password) {
        setMsgSafe('userMsg', typeof tr === 'function' ? tr('emptyLogin') : '❌ Enter username and password', '#d9534f');
        return;
      }

      // Admin flow (keep existing logic)
      if (role === 'admin') {
        if (typeof releafApprovedAdminName === 'function' && !releafApprovedAdminName(username)) {
          if (typeof releafStoreAdminAccessRequest === 'function') releafStoreAdminAccessRequest(username);
          var adminMsg = typeof tr === 'function' ? tr('adminNameNotAllowed') : 'Admin name not approved';
          setMsgSafe('userMsg', adminMsg, '#d99200');
          alert(adminMsg);
          return;
        }
        localStorage.setItem('adminName', username);
        db.collection('admins').doc(username.toLowerCase().trim()).set(
          { name: username, lastLogin: new Date().toISOString() },
          { merge: true }
        ).catch(function () {});
        alert(typeof tr === 'function' ? tr('loginSuccess', { name: username }) : 'Login successful!');
        if (typeof releafPersistCurrentLanguage === 'function') releafPersistCurrentLanguage();
        location.href = 'admin.html';
        return;
      }

      // Customer flow: lookup user in Firestore, then sign in with Firebase Auth
      fbLookupUser(username).then(function (user) {
        if (!user) {
          setMsgSafe('userMsg', typeof tr === 'function' ? tr('usernameNotFound') : '❌ Username not found', '#d9534f');
          return;
        }
        return auth.signInWithEmailAndPassword(user.email, password).then(function (cred) {
          return fbLoadProfile(cred.user.uid).then(function () {
            _origSetItem('currentUser', JSON.stringify(user));
            if (user.profile) _origSetItem('releaf_profile_v1', JSON.stringify(user.profile));
            if (typeof releafSetLoggedInCustomer === 'function') releafSetLoggedInCustomer(user);

            var name = user.firstName || user.username || 'User';
            alert(typeof tr === 'function' ? tr('loginSuccess', { name: name }) : 'Login successful!');
            if (typeof releafPersistCurrentLanguage === 'function') releafPersistCurrentLanguage();
            location.href = 'customer.html';
          });
        });
      }).catch(function (e) {
        console.error('[fb] login error:', e);
        if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
          setMsgSafe('passMsg', typeof tr === 'function' ? tr('wrongPassword') : '❌ Wrong password', '#d9534f');
        } else if (e.code === 'auth/user-not-found') {
          setMsgSafe('userMsg', typeof tr === 'function' ? tr('usernameNotFound') : '❌ User not found', '#d9534f');
        } else if (e.code === 'auth/too-many-requests') {
          setMsgSafe('passMsg', '❌ Too many attempts. Try again later.', '#d9534f');
        } else {
          setMsgSafe('userMsg', '❌ ' + (e.message || 'Login failed'), '#d9534f');
        }
      });
    };
  }

  /* ==========================================================
     LOGOUT OVERRIDE (all pages)
     ========================================================== */
  window.logout = function () {
    auth.signOut().catch(function () {});
    // Preserve preferences
    var lang = localStorage.getItem('lang');
    var theme = localStorage.getItem('theme');
    var proLang = localStorage.getItem('releaf_language_v1');
    var proTheme = localStorage.getItem('releaf_theme_v1');
    // Clear auth/data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('releaf_profile_v1');
    localStorage.removeItem('releaf_requests_v1');
    localStorage.removeItem('releaf_username_registry_v1');
    localStorage.removeItem('adminName');
    localStorage.removeItem('releaf_current_admin_v1');
    // Restore preferences
    if (lang) localStorage.setItem('lang', lang);
    if (theme) localStorage.setItem('theme', theme);
    if (proLang) localStorage.setItem('releaf_language_v1', proLang);
    if (proTheme) localStorage.setItem('releaf_theme_v1', proTheme);
    location.href = 'HH.html';
  };

  /* ==========================================================
     CUSTOMER PAGE: load data from Firestore + real-time sync
     ========================================================== */
  if (isCustomer) {
    auth.onAuthStateChanged(function (user) {
      if (!user) return;
      Promise.all([fbLoadProfile(user.uid), fbLoadRequests()]).then(function () {
        // Re-trigger the existing hydration functions
        if (typeof hydrateOrdersFromStorage === 'function') setTimeout(hydrateOrdersFromStorage, 100);
        if (typeof hydrateLocationFromProfile === 'function') setTimeout(hydrateLocationFromProfile, 100);
        if (typeof applyDashboardFromSavedProfile === 'function') setTimeout(applyDashboardFromSavedProfile, 100);
        if (typeof initProfilePage === 'function') setTimeout(initProfilePage, 150);
      });
    });

    // Real-time listener: when requests change in Firestore, update localStorage
    db.collection('requests').onSnapshot(function (snap) {
      var list = snap.docs.map(function (d) { return d.data(); });
      list.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
      window._fbIsSyncing(true);
      _origSetItem('releaf_requests_v1', JSON.stringify(list));
      window._fbIsSyncing(false);
    }, function (err) {
      console.warn('[fb] requests listener error:', err);
    });
  }

  /* ==========================================================
     ADMIN PAGE: load data from Firestore + real-time sync
     ========================================================== */
  if (isAdmin) {
    // Initial data load
    fbLoadRequests().then(function () {
      if (typeof loadTable === 'function') loadTable();
      if (typeof updateCards === 'function') updateCards();
      if (typeof loadRequests === 'function') loadRequests();
      if (typeof initCharts === 'function') initCharts();
      if (typeof renderUsersUnified === 'function') renderUsersUnified();
    });

    // Load registered users from Firestore
    db.collection('users').get().then(function (snap) {
      var usersList = snap.docs.map(function (d) { return d.data(); });
      window._fbIsSyncing(true);
      _origSetItem('users', JSON.stringify(usersList));
      window._fbIsSyncing(false);
      if (typeof renderRegisteredUsers === 'function') renderRegisteredUsers('');
      if (typeof renderUsersUnified === 'function') renderUsersUnified();
    }).catch(function (e) { console.error('[fb] load users:', e); });

    // Real-time listener for requests
    db.collection('requests').onSnapshot(function (snap) {
      var list = snap.docs.map(function (d) { return d.data(); });
      list.sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
      window._fbIsSyncing(true);
      _origSetItem('releaf_requests_v1', JSON.stringify(list));
      window._fbIsSyncing(false);
      if (typeof loadTable === 'function') loadTable();
      if (typeof updateCards === 'function') updateCards();
      if (typeof loadRequests === 'function') loadRequests();
    }, function (err) {
      console.warn('[fb] admin requests listener error:', err);
    });
  }

  /* ==========================================================
     MIGRATION: upload existing localStorage data to Firestore
     (runs once per user, on first login after Firebase is added)
     ========================================================== */
  auth.onAuthStateChanged(function (user) {
    if (!user) return;
    var metaKey = 'migrated_' + user.uid;
    db.collection('_meta').doc(metaKey).get().then(function (doc) {
      if (doc.exists) return; // already migrated

      console.log('[ReLeaf] Migrating existing data to Firestore...');

      // Migrate requests
      var requests = safeJson('releaf_requests_v1', []);
      if (requests.length) fbSaveAllRequests(requests);

      // Migrate profile
      var profile = safeJson('releaf_profile_v1', null);
      if (profile) fbSaveProfile(user.uid, profile);

      // Migrate user data
      var currentUser = safeJson('currentUser', null);
      if (currentUser) {
        var userData = Object.assign({}, currentUser, { profile: profile || {} });
        delete userData.password;
        fbSaveUser(user.uid, userData);
      }

      // Mark as migrated
      db.collection('_meta').doc(metaKey).set({ migratedAt: new Date().toISOString() });
      console.log('[ReLeaf] Migration complete.');
    }).catch(function (e) {
      console.warn('[fb] migration check error:', e);
    });
  });

  // Expose for debugging
  window.fbLoadRequests = fbLoadRequests;
  window.fbSaveAllRequests = fbSaveAllRequests;
  window.fbLoadProfile = fbLoadProfile;
  window.fbSaveProfile = fbSaveProfile;

  console.log('[ReLeaf] Firebase sync layer active.');
})();
