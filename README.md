# WSA Sound Preference Tool

A personalised audio experience web application built for audiology research. Users complete a lifestyle questionnaire, receive a recommended story based on their profile, and go through an A/B sound preference experience — helping clinicians understand how patients hear and perceive sound in everyday environments.

**Live:** https://sound-preference-uni-project.onrender.com

---

## What It Does

1. **Onboarding & Lifestyle Quiz** — patients answer questions about their hearing history, lifestyle, medical background and sound preferences
2. **Image Picker** — patients select images representing their daily listening environments
3. **Story Recommendation** — a personalised story of 4 scenes is recommended based on tag weights from quiz answers
4. **Sound Exploration** — patients listen to A/B versions of each scene, interact with sound objects, and indicate their preference
5. **Digital Twin** — a results page showing the patient's sound preference profile for use by the clinician

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build | Vite 8 |
| UI | Chakra UI v3 |
| Routing | React Router v7 |
| Backend | Supabase (Postgres + Auth + Storage) |
| i18n | react-i18next |
| Deployment | Render |

---

## Languages Supported

The app supports multilingual narration audio and UI translations:

- 🇬🇧 English
- 🇩🇰 Danish
- 🇧🇬 Bulgarian
- 🇭🇺 Hungarian
- 🇧🇷 Brazilian Portuguese *(UI only — audio coming soon)*

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (see Environment Variables below)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
Please reach for these details 
```

You can find these in your Supabase dashboard under **Project Settings → API**.

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

Output is in the `dist/` folder.

---

## Project Structure

```
src/
├── components/          # Shared UI components (Header, Sidebar, Footer)
├── contexts/            # React contexts (LanguageContext)
├── features/
│   └── soundSplit/      # Sound exploration experience components
├── hooks/               # Custom hooks (useProfile, useStoryRecommendation, useTranslations...)
├── locales/             # i18n translation files (en, da, bg, hu, pt)
├── Pages/               # Page-level components
└── i18n.ts              # i18next configuration
```

---

## Database

Built on Supabase (PostgreSQL). Key tables:

- `profiles` — user profile and language preference
- `stories` / `scenes` / `scene_versions` / `scene_objects` — content structure
- `lifestyle_questions` / `answer_options` — questionnaire content
- `session_results` — A/B preference results per scene
- `user_tag_weights` — weighted tags driving story recommendation
- `translations` — multilingual DB content (question text, answer labels etc.)

---

## Deployment

The app is deployed on **Render** with auto-deploy enabled on the `main` branch. Every push to `main` triggers a new build automatically.

Environment variables are managed via Render's **Secret Files** feature — a `.env` file is stored securely and injected at build time.

---

## Team

Built as part of a university research project with WSA Audiology.

- **Reka Meszaros** — Master's student
- **Martin Bivolov** — Master's student