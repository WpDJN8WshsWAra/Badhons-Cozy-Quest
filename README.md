# Badhon's Cozy Quest — English Learning Web App

A cozy, gamified English learning web application (PWA) with 400+ interactive questions across Beginner, Medium, High, and Pro levels, paired with a custom cozy room decorating mini-game.

---

## 🌟 Key Features

1. **Gamified English Learning**:
   - **4 Learning Levels**: Beginner, Medium, High, Pro
   - **Interactive Question Types**:
     - Multiple Choice
     - Word Matching (English - Bengali)
     - Sentence Construction & Reordering
     - Fill in the Blanks
     - Audio feedback and mascot reactions
   - **Heart / Life System & XP / Coin Economy**
   - **Streak Tracker & Daily Challenge Quests**
   - **Mistakes Tab ('ভুলগুলো')** to re-learn tricky concepts
   - **Personal Notes Tab ('নোট')** for quick study notes

2. **Cozy Room Mini-Game ('আমার ঘর')**:
   - 3 Customizable Rooms: Pink Room, Green Room, Cream Room
   - Over 60 collectible furniture items, plants, carpets, wall hangings, lamps, and pets
   - Drag-and-drop placement with collision and placement guides
   - **Day / Night mode switch** with dynamic lighting and background music
   - Snapshot & camera photo export feature

3. **Audio & Sound Effects**:
   - Background cozy lo-fi music (`bgm.mp3` & `night.mp3`)
   - 18 UI and interaction sound effects (`coin.mp3`, `badge.mp3`, `pop.mp3`, `done.mp3`, `snap.mp3`, etc.)

4. **Progress & Persistence**:
   - LocalStorage auto-save
   - Cloud / String backup & restore code system (`NCQ1...`)
   - PWA support with offline caching (`sw.js` and `manifest.webmanifest`)

---

## 📁 Project Structure

```text
├── index.html               # Main application (HTML, CSS styles & interactive game logic)
├── manifest.webmanifest     # Progressive Web App manifest
├── sw.js                    # Service worker with offline asset caching & streaming
├── favicon.ico              # Browser tab icon
├── og-image.png             # Social preview image
├── icons/                   # App launcher and maskable icons (192px, 512px, splash)
└── assets/
    ├── img/                 # 210+ room furniture items, mascot poses, unit badges & icons
    └── snd/                 # Background music & interaction sound effects
```

---

## 🚀 How to Run Locally

You can run this project with any local HTTP server:

### Option 1: Python
```bash
python -m http.server 8080
```
Then open your browser at [http://localhost:8080](http://localhost:8080).

### Option 2: Node.js (npx)
```bash
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` and choose **"Open with Live Server"**.

---

## ☁️ Deployment

This project is 100% static and self-contained:
- **Netlify**: Drag and drop this folder into Netlify Drop, or connect via GitHub.
- **Vercel**: Run `vercel` or link repository.
- **GitHub Pages**: Push to repository and enable GitHub Pages on `main` branch.

---

## 📞 যোগাযোগ ও সাপোর্ট (Contact & Support)

- **ইমেইল (Email)**: [ogbadhon@gmail.com](mailto:ogbadhon@gmail.com)
- **বিকাশ / নগদ / ফোন (bKash / Nagad / Phone)**: `01308390333`
