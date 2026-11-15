# CREW — Companion for Resilience, Evaluation & Wellbeing

> An offline-first health companion for astronauts on long-duration missions.
> Built for the NASA Space Apps Challenge.

## About the project

CREW is an autonomous health monitoring platform for astronauts on missions where Earth is too far away to help in real time. It turns scattered health data into safe, understandable action, so astronauts can manage their own health without waiting for Ground Control.

Space hazards such as isolation, distance and closed environments affect health in combined ways. CREW compares each astronaut against their **own baseline** and uses an **auditable, deterministic rules engine** to detect combinations of signals (for example, less sleep, rising blood pressure and slower reactions).

### Main features

- **Interactive human body dashboard:** tap any body area to see its readings in detail.
- **Four-level alert system:** green, yellow, orange and red, each linked to pre-approved step-by-step procedures that work offline.
- **Four AI companions:**
  - **The Doctor** explains results and prepares reports.
  - **The Psychologist** offers non-clinical wellbeing support.
  - **The Professor** teaches medical concepts and offers mini brain games to keep the mind sharp.
  - **The Pet** motivates healthy habits and quietly collects cognitive data through reflex, memory and attention games.
- **Earth communication:** reports are queued and sent with delay-tolerant networking when a link exists, with urgent messages prioritized.

### Safety-first design

The AI only explains alerts. It never decides severity and never invents diagnoses. If the AI fails, monitoring, alerts and protocols keep running. Medical, psychological and gamification data are kept separate to protect privacy.

### How it works

1. **Data capture:** biomedical sensors, questionnaires and cognitive tests, validated before storage.
2. **Local database:** measurements, mission events and each astronaut's personal baseline.
3. **Medical evaluation engine:** deterministic rules that analyze trends and assign the alert level.
4. **Protocol engine:** links each alert to an offline, step-by-step procedure.
5. **Interface and AI companions:** a 3D body, charts and four characters running on a local AI model.
6. **Earth communication:** queued reports with delay tolerance.

### Built with

HTML, CSS, JavaScript and Three.js. Designed with Figma, GitHub and Visual Studio Code.

> **Note:** this repository contains a demo with simulated data. Thresholds are illustrative and the cognitive games are exploratory, not clinical. Real use would require medical validation.

## Installation

You only need a modern web browser and Git.

1. **Clone the repository**

   ```bash
   git clone https://github.com/KevsCha/Hackaton-SpaceApps.git
   ```

2. **Go into the project folder**

   ```bash
   cd Hackaton-SpaceApps
   ```

3. **Run the project** by opening `index.html` in your browser (double-click the file, or right-click → *Open with* → your browser).

### If the 3D body does not load

Some browsers block scripts when a page is opened directly from the file system. In that case, serve the folder locally instead:

- **VS Code:** install the *Live Server* extension, then right-click `index.html` → *Open with Live Server*.
- **Python:**

  ```bash
  python -m http.server 8000
  ```

  Then open `http://localhost:8000` in your browser.

## Links

- Project demonstration: https://canva.link/g76716trf8e4234
- Web: [https://github.com/KevsCha/Hackaton-SpaceApps](https://kevscha.github.io/Hackaton-SpaceApps/index.html)
