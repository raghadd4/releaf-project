/* ========================================================
   firebase-init.js  -  Firebase initialization for ReLeaf
   Load AFTER Firebase CDN scripts, BEFORE app scripts.
   ======================================================== */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: "AIzaSyBL6Mhzh7Yq7qFUAO4QRmzUxIdmw7F1JHs",
    authDomain: "releaf-1d8a4.firebaseapp.com",
    projectId: "releaf-1d8a4",
    storageBucket: "releaf-1d8a4.firebasestorage.app",
    messagingSenderId: "209175486442",
    appId: "1:209175486442:web:eb40c81299c1230cf9dc93",
    measurementId: "G-Q9WFHHDS8F"
  };

  if (typeof firebase === 'undefined') {
    console.error('[ReLeaf] Firebase SDK not loaded. Include the CDN scripts first.');
    return;
  }

  firebase.initializeApp(firebaseConfig);
  window.fbAuth = firebase.auth();
  window.fbDb = firebase.firestore();

  // Offline persistence
  window.fbDb.enablePersistence({ synchronizeTabs: true }).catch(function (err) {
    if (err.code === 'failed-precondition') {
      console.warn('[ReLeaf] Firestore persistence: multiple tabs open.');
    } else if (err.code === 'unimplemented') {
      console.warn('[ReLeaf] Firestore persistence not supported in this browser.');
    }
  });

  /* ---- localStorage write interceptor ----
     Catches writes to key data stores and syncs them to Firestore.
     firebase-sync.js provides the actual sync functions. */
  var SYNCED_KEYS = ['releaf_requests_v1', 'releaf_profile_v1'];
  var _isSyncing = false;
  var _origSetItem = localStorage.setItem.bind(localStorage);

  localStorage.setItem = function (key, value) {
    _origSetItem(key, value);
    if (_isSyncing) return;
    if (SYNCED_KEYS.indexOf(key) === -1) return;

    try {
      if (key === 'releaf_requests_v1') {
        var list = JSON.parse(value);
        if (Array.isArray(list) && typeof window._fbSyncRequests === 'function') {
          window._fbSyncRequests(list);
        }
      }
      if (key === 'releaf_profile_v1') {
        var user = window.fbAuth && window.fbAuth.currentUser;
        if (user && typeof window._fbSyncProfile === 'function') {
          var profile = JSON.parse(value);
          window._fbSyncProfile(user.uid, profile);
        }
      }
    } catch (e) { /* ignore parse errors */ }
  };

  // Expose helpers for firebase-sync.js
  window._fbIsSyncing = function (v) { _isSyncing = v; };
  window._fbOrigSetItem = _origSetItem;

  // Placeholder sync functions (overridden by firebase-sync.js)
  window._fbSyncRequests = function () {};
  window._fbSyncProfile = function () {};

  console.log('[ReLeaf] Firebase initialized.');
})();
