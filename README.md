# 📱 CheckCheck Security App

**CheckCheck Security App** is a mobile application built with **React Native** and **Expo**, designed to help users assess and improve their personal digital security awareness.  

Through interactive surveys, automated scans, and educational content, the app provides a comprehensive tool for enhancing digital safety.  

---

## 📌 Key Features

- **🔐 Security Survey**  
  An interactive questionnaire that evaluates a user's security knowledge and habits, providing a score and a **risk assessment** (Safe, Recommendation, Danger).  

- **📲 Automated Scan**  
  A simulated security scan based on the user's survey results to help identify potential vulnerabilities.  

- **📚 Security Articles**  
  A curated list of articles and tips on current security trends such as phishing, password management, and safe browsing.  

- **📍 Store Locator**  
  A map-based feature allowing users to find nearby telecom stores, integrated with the **Google Maps API** (Maps SDK, Places API, Geocoding API).  

- **👤 User Authentication**  
  Secure sign-up and sign-in functionality managed by **Clerk**.  

---

## 🛠 Tech Stack

- **Framework**: React Native with Expo  
- **Authentication**: Clerk  
- **Navigation**: Expo Router  
- **Maps & Geolocation**: Google Maps Platform (Maps SDK, Places API, Geocoding API)  
- **Styling**: React Native StyleSheet  

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (LTS version recommended)  
- **Yarn** or **npm**  
- **Expo Go** app installed on your mobile device  
  ![Expo QR Code](assets/qrcode.png)

---

### 2. Installation & Setup
```bash
# 1) Clone the repository
git clone https://github.com/your-username/checkcheck-security-app.git
cd checkcheck-security-app

# 2) Install dependencies
yarn install
# or
npm install

# 3) Start the app
npx expo start
