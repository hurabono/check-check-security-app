CheckCheck Security App
CheckCheck is a mobile application built with React Native and Expo, designed to help users assess and improve their personal digital security awareness. Through interactive surveys, automated scans, and educational content, the app provides a comprehensive tool for enhancing digital safety.

Key Features
🔐 Security Survey: An interactive questionnaire that evaluates a user's security knowledge and habits, providing a score and a risk assessment (Safe, Recommendation, Danger).

📲 Automated Scan: A feature to initiate a simulated security scan of the device based on the user's survey results, helping to identify potential vulnerabilities.

📚 Security Articles: A curated list of articles and tips on current security trends, such as phishing, password management, and safe browsing, to keep users informed.

📍 Store Locator: A map-based feature allowing users to find nearby telecom stores, integrated with the Google Maps API.

👤 User Authentication: Secure sign-up and sign-in functionality managed by Clerk.

Tech Stack
Framework: React Native with Expo

Authentication: Clerk

Navigation: Expo Router

Maps & Geolocation: Google Maps Platform (Maps SDK, Places API, Geocoding API)

Styling: React Native StyleSheet

Getting Started
Prerequisites
Node.js (LTS version)

Yarn or npm

Expo Go app on your mobile device or an emulator

Installation & Setup
Clone the repository:

git clone https://github.com/your-username/checkcheck-security-app.git
cd checkcheck-security-app

Install dependencies:

npm install

or

yarn install

Set up environment variables:
Create a .env file in the root of the client directory and add your API keys. Remember to prefix them with EXPO_PUBLIC_ to make them accessible within the app.

.env

EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
EXPO_PUBLIC_MAPS_API_KEY="AIzaSy..."

Run the application:

npx expo start

Scan the QR code with the Expo Go app on your device to launch the application.
