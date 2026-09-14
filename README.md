# ReLeaf

**Smart paper & carton recycling management platform for Jordan.**

ReLeaf is a bilingual (Arabic/English) web platform that connects
individuals and institutions with recycling collection — replacing manual,
unorganized pickup arrangements with a centralized system where customers
can schedule and track recycling requests, and admins can manage
collections, users, and reporting through a dedicated dashboard.

Built as a graduation project at Al-Balqa Applied University, Prince
Abdullah Bin Ghazi Faculty of Information and Communication Technology
(2025–2026).

**Live demo:** [raghadd4.github.io/releaf-project](https://raghadd4.github.io/releaf-project/)

---

## The problem

Paper and carton recycling in Jordan is still largely manual: no
centralized way to request a pickup, no tracking once a request is made,
and no easy way for recycling centers to manage requests or see collection
activity at a glance. That friction discourages participation even from
people who want to recycle.

## Features

### Customer
- Registration and login (Firebase Authentication)
- Arabic & English language support, with full RTL/LTR layout switching
- Dark / light mode
- Profile management
- GPS-based pickup location, plus interactive map pin selection
  (Leaflet.js + OpenStreetMap)
- Submit and track paper/carton recycling requests
- Recycling stats: total weight recycled, trees saved, request history
- Rank / progress system that rewards continued participation
- Contact admin support

### Admin
- Admin dashboard: total users, total requests, completed requests
- User and request management, with filtering/search
- Approve, update, or reject requests
- Recycling reports and analytics, with CSV export
- Notifications
- Theme & language settings

## Tech stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Front-end      | HTML5, CSS3, JavaScript (vanilla)                 |
| Backend / BaaS | Firebase Authentication, Firebase Firestore       |
| Maps           | Leaflet.js, OpenStreetMap API                     |
| Icons          | Font Awesome, Lucide                              |
| i18n           | Custom translation system with RTL/LTR support    |

## Project structure

```
ReLeaf/
├── HH.html              # Landing page
├── login.html            # Login page
├── signup.html            # Registration page
├── customer.html           # Customer dashboard
├── admin.html               # Admin dashboard
│
├── style.css              # Customer dashboard styles
├── styleM.css              # Landing page styles
├── styleR.css               # Admin dashboard styles
├── csss.css                  # Authentication page styles
│
├── script.js               # Customer dashboard logic
├── jj.js                     # Landing/auth logic + translations
├── jsR.js                     # Admin dashboard logic
│
├── firebase-init.js         # Firebase configuration
├── firebase-sync.js          # Firestore synchronization
├── i18n-pro.js                 # Translation system
│
└── assets/
    ├── logo.jpg
    ├── top.png
    └── icons/
```

## How to run

**Option 1 — Simple local run**
1. Download the project files.
2. Open `HH.html` in a browser.

**Option 2 — VS Code Live Server (recommended)**
1. Open the project folder in VS Code.
2. Install the Live Server extension.
3. Right-click `HH.html` → "Open with Live Server".

## Current limitations

- The system currently relies heavily on client-side logic.
- Some data is stored using `localStorage`.
- Firestore security rules would need hardening for a production deployment.
- The JavaScript could be further modularized.

## Future plans

- Native mobile app version
- Real-time push notifications
- Driver / collection tracking
- QR-code pickup verification
- Cloud image uploads
- A proper backend API instead of client-side-only logic
- Partnerships with recycling companies, municipalities, and environmental
  organizations

## Team

Graduation project by:
- Raghad Ahmad Abdelrahman
- Raneem Ashraf Alwrikat
- Mayar Ahmad Alajrami

Supervised by Dr. Khalid Alkharabsheh, Al-Balqa Applied University.

## Documentation

The full academic report (`ReLeaf documentation.docx`) and project
presentation (`ReLeaf presentation.pdf`) are included in this repo, covering
the complete SDLC: planning, feasibility study, SWOT analysis, requirements,
UML diagrams (use case, ER, flowcharts), and UI/UX design process.

## License

Developed for educational and academic purposes.
