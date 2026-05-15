# ReLeaf 🌱  
### Smart Paper Recycling Management Platform

ReLeaf is a web-based recycling management platform designed to connect businesses and institutions with recycling centers in Jordan.  
The system helps users schedule paper and carton recycling pickups, track requests, and promote environmentally sustainable practices through an organized digital workflow.

---

# 📌 Project Overview

Paper waste management is still inefficient in many organizations.  
ReLeaf aims to simplify the recycling process by providing a centralized platform where:

- Customers can submit recycling requests
- Recycling centers/admins can manage collections
- Pickup locations can be tracked
- Recycling activity can be monitored through dashboards

The platform focuses on:
- Sustainability
- Accessibility
- User-friendly experience
- Real-world applicability

---

# ✨ Features

## 👤 Customer Features
- User registration and login
- Arabic & English language support
- Dark/Light mode
- Profile management
- GPS-based pickup location
- Interactive map pin selection
- Submit paper/carton recycling requests
- Request tracking system
- Recycling statistics
- Rank/progress system
- Contact admin support

---

## 🛠️ Admin Features
- Admin dashboard
- User management
- Request management
- Request filtering/search
- Recycling reports
- CSV export
- Notifications
- Theme & language settings

---

# 🌍 Localization Support

ReLeaf supports:
- English 🇺🇸
- Arabic 🇯🇴

The platform dynamically changes:
- Text content
- Layout direction (LTR / RTL)
- UI elements

---

# 🧩 Technologies Used

## Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

## Backend / Database
- Firebase Authentication
- Firebase Firestore

## Libraries & APIs
- Leaflet.js (Interactive Maps)
- Lucide Icons
- Font Awesome
- OpenStreetMap API

---

# 🗂️ Project Structure

ReLeaf/
│
├── HH.html                 # Landing page
├── login.html              # Login page
├── signup.html             # Registration page
├── customer.html           # Customer dashboard
├── admin.html              # Admin dashboard
│
├── style.css               # Customer dashboard styles
├── styleM.css              # Landing page styles
├── styleR.css              # Admin dashboard styles
├── csss.css                # Authentication pages styles
│
├── script.js               # Customer dashboard logic
├── jj.js                   # Landing/auth logic + translations
├── jsR.js                  # Admin dashboard logic
│
├── firebase-init.js        # Firebase configuration
├── firebase-sync.js        # Firestore synchronization
├── i18n-pro.js             # Translation system
│
└── assets/
    ├── logo.jpg
    ├── top.png
    └── icons/

---

# 🔐 Authentication System

The platform uses Firebase Authentication for:
- User login
- User signup
- Role-based access (Customer/Admin)

---

# 🗺️ GPS & Location Features

Users can:
- Use their current GPS location
- Select locations manually on a map
- Choose Jordanian governorates and districts

This helps organize recycling pickups more accurately.

---

# 📊 Dashboard System

## Customer Dashboard
Displays:
- Recycling progress
- Trees saved
- Total recycled weight
- Request history
- User ranking system

## Admin Dashboard
Displays:
- Total users
- Total requests
- Completed requests
- Request reports and analytics

---

# ♻️ Environmental Impact

ReLeaf encourages:
- Sustainable recycling habits
- Reduction of paper waste
- Better recycling logistics
- Environmental awareness

The platform gamifies recycling by rewarding users with progress levels based on recycling activity.

---

# 🚀 Future Improvements

Potential future enhancements include:

- Real-time notifications
- Mobile application version
- AI-based recycling recommendations
- QR-code pickup verification
- Driver tracking system
- Advanced analytics dashboard
- Cloud image uploads
- Secure backend API

---

# ⚠️ Current Limitations

- The system currently relies heavily on client-side logic
- Some data is stored using localStorage
- Security rules can be improved for production deployment
- JavaScript files can be further modularized

---

# 🧪 How to Run the Project

## Option 1 — Simple Local Run
1. Download the project files
2. Open HH.html in a browser

## Option 2 — VS Code Live Server (Recommended)
1. Open the project folder in VS Code
2. Install the Live Server extension
3. Right-click HH.html
4. Select Open with Live Server

---

# 👨‍💻 Team / Authors

Developed as a Graduation Project for Software Engineering / Computer Science.

Project Name: ReLeaf  
Year: 2026

---

# 📄 License

This project was developed for educational and academic purposes.
