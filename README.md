# CheckCheck Security App
![Thumnail](https://ik.imagekit.io/stephanie/git-thum/security.png?updatedAt=1786472617335)

A mobile security check for people who would never run one.

Most people never audit their own phone or network. Not because they do not care, but because the tools assume you already speak the language: open a terminal, read a CVE, interpret a port scan. CheckCheck runs the check for them and answers in plain sentences.

> **Merit Award, Sungshin Women's University AI Polytechnic Competition (2025)**
> Recognized for creativity and technical implementation in improving digital security awareness.

<img width="300" height="583" alt="checkcheck-demo" src="https://github.com/user-attachments/assets/29d9fbf3-ca47-40e8-bf6c-a3bff2e0ca01" />


*Full walkthrough, sped up: security survey, device scan, phishing analysis, and the carrier store map.*

## What it does

**Security survey.** An interactive questionnaire on the user's actual habits, scored into a risk assessment of Safe, Recommendation, or Danger. The point is not the score. It is that answering the questions makes people notice what they do.

**Device and network scan.** Reads real state from the device rather than simulating it:

| Checked | How |
|---|---|
| Device model, OS version, root or jailbreak status | `expo-device`, `react-native-device-info` |
| Screen lock and biometric availability | `expo-local-authentication` |
| Wi-Fi safety, connection type, IP exposure | `expo-network`, `@react-native-community/netinfo` |
| Carrier and cellular details | `expo-cellular` |

**Phishing analysis.** Separate screens for email and SMS, so a user can check a suspicious message before acting on it rather than after.

**Store locator.** Finds nearby telecom stores on a map, for the cases where the answer is "go talk to your carrier."

**Authentication.** Sign-up and sign-in through Clerk.

## The interesting problem: one app, two map ecosystems

The app ships to native and to web. `react-native-maps` does not run in a browser, and the Google Maps web libraries do not run on a device. Importing either one unconditionally breaks the other build.

Solved with platform-resolved modules rather than runtime branching:

```
app/(tabs)/search.native.tsx   →  react-native-maps
app/(tabs)/search.web.tsx      →  @vis.gl/react-google-maps
app/(tabs)/search.tsx          →  shared shell
stubs/react-native-maps.web.js →  no-op stub, aliased in next.config.js
```

The bundler picks the right file per platform, and the web stub keeps `react-native-maps` from being pulled into the web bundle at all. The feature is written once at the screen level, and the map implementation is swapped underneath it.

## Built with

| | |
|---|---|
| Framework | React Native, Expo, Expo Router, TypeScript |
| Web target | Next.js, `react-native-web` |
| Authentication | Clerk (`@clerk/clerk-expo`) |
| Device and network | `expo-device`, `expo-cellular`, `expo-network`, `expo-local-authentication`, `netinfo`, `react-native-device-info` |
| Maps, native | `react-native-maps`, Google Maps SDK |
| Maps, web | `@vis.gl/react-google-maps`, `@react-google-maps/api` |
| Location | `expo-location` |
| Secure storage | `expo-secure-store` |

## Run it locally

```bash
git clone https://github.com/hurabono/check-check-security-app.git
cd check-check-security-app
npm install

npx expo start        # native, open in Expo Go
npm run dev           # web
```



## What I took from it

I came into this as the front end and the security analysis, and expected the hard part to be the scanning. It was not. Reading device state is a documented API call.

The hard part was deciding what to tell someone. A jailbroken device, an open Wi-Fi network, and an outdated OS are not equally urgent, and saying all three in the same tone teaches a user to ignore all three. Most of the real work went into what gets surfaced, in what order, and in whose words.

---

Built by Stephanie (Heesu) Cho with a project team. September 2025.
