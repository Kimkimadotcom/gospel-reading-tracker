# Gospel Reading Tracker

## Version 1.0

A premium Bible reading tracker application designed with an Apple-inspired interface combining:

* Apple Notes style organization
* Apple Health inspired progress tracking
* Apple Reminders simplicity
* Google Sheets level organization
* iOS Liquid Glass design principles

---

# Project Purpose

Gospel Reading Tracker helps users build a consistent Bible reading habit by tracking progress through:

1. Gospel of John
2. Gospel of Mark
3. Gospel of Matthew
4. Gospel of Luke
5. Acts of the Apostles

Total Reading Plan:

```
117 Chapters
```

---

# Version 1.0 Features

## Reading Tracker

The application provides:

* One-tap chapter completion
* Chapter progress tracking
* Automatic saving
* Completion date recording
* Ability to undo completed chapters

---

## Dashboard

The dashboard displays:

* Overall progress percentage
* Completed chapters
* Remaining chapters
* Current book
* Current chapter
* Today's reading
* Reading streak
* Last completed chapter

---

## Statistics

Individual progress tracking is available for:

```
John
Mark
Matthew
Luke
Acts
```

Each book displays:

* Completed chapters
* Total chapters
* Progress percentage

---

## Search

Users can search reading content by:

* Book name
* Chapter number

---

## Backup System

The application supports:

### Export

Creates a backup file:

```
Gospel-Reading-Backup.json
```

The backup contains:

* Reading progress
* Completion dates
* User preferences

### Import

Previously exported backups can be restored anytime.

---

# Offline Support

The application works offline after the first successful loading.

Offline technology:

* Service Worker
* Cache Storage
* Browser Local Storage

The application does not require internet access for normal reading tracking.

---

# Progressive Web App (PWA)

The application supports installation on:

* iPhone
* Android devices
* Desktop browsers

Included:

* manifest.json
* service worker
* standalone app mode
* application icon support

---

# Dark Mode

Supported themes:

* System automatic theme
* Manual dark mode

The interface adapts to:

* Light appearance
* Dark appearance

---

# Project Structure

```
BibleTracker

│
├── index.html
│
├── style.css
│
├── script.js
│
├── manifest.json
│
├── sw.js
│
├── README.md
│
│
├── assets
│   │
│   ├── icons
│   │
│   ├── screenshots
│   │
│   ├── fonts
│   │
│   └── sounds
│
│
└── data
```

---

# Running The Application

## Recommended Method

Use VS Code Live Server.

Install the extension:

```
Live Server
```

After installation:

1. Open `index.html`
2. Right-click inside the editor
3. Select:

```
Open with Live Server
```

The application will open in your browser.

---

# Important Development Note

Do not open the application by double-clicking:

```
index.html
```

because browsers block service workers on local files.

Use:

```
http://localhost
```

through Live Server.

---

# Testing PWA Features

Open browser developer tools:

```
F12
```

Go to:

```
Application
```

Check:

```
Manifest
```

and:

```
Service Workers
```

Verify:

* Manifest loads correctly
* Service worker is active
* Offline mode works

---

# Data Storage

All user data is stored locally using:

```
localStorage
```

Stored information:

* Chapter completion
* Completion dates
* Theme preference
* Reading progress

No account or server connection is required in Version 1.0.

---

# Bible Reading Plan

## John

```
21 Chapters
```

## Mark

```
16 Chapters
```

## Matthew

```
28 Chapters
```

## Luke

```
24 Chapters
```

## Acts

```
28 Chapters
```

Total:

```
117 Chapters
```

---

# Development Standards

This project follows:

* Production-ready code
* Mobile-first development
* iPhone optimization
* Responsive layouts
* Performance-focused animations
* Modular structure
* Offline-first architecture
* Clean maintainable files

---

# Version History

## Version 1.0

Initial production release.

Included:

* Bible reading tracker
* Progress dashboard
* Statistics
* Search
* Backup system
* Offline support
* PWA structure
* Dark mode
* Completion tracking

---

# Future Development Direction

Possible future improvements:

* Complete Bible verse database
* Personal journal system
* Prayer notes
* Daily reminders
* Reading notifications
* Cloud synchronization
* Multiple reading plans
* User accounts

---

# License

Personal Bible study application project.
