# SoengOS

**A native-ready Mac/Linux hybrid desktop, dressed in Song quiet.**

SoengOS blends the immediacy and polish of macOS-style chrome with the openness, terminal-first workflow, and composability of Linux. The name **Soeng** draws from the Jyutping of 宋, written with a Portuguese-smooth spelling.

This repository now holds two sittings of the same desktop contract:

| Sitting | What it is |
| --- | --- |
| **v1** `SoengOS.html` | The original single-file interactive prototype: window manager, dock, Linux taskbar, hybrid/mac/linux modes, soeng-sh, Workflow Hub, Automation Studio, `soeng://` browser. |
| **v2** React desktop | The same contract, rebuilt as a working Song-dynasty scholar's desk: rice paper, ink, celadon, plus Notes, Music, Photos, Podcasts, TV, Files, and a live `soeng://` garden. Hybrid is still the default. |

v1 is not abandoned. It remains the HTML desktop contract a native Linux runtime can bind to. v2 is the same manners, with the fog painted in.

---

## Product Direction

SoengOS should feel like a **Mac + Linux combination**:

- **Mac-like comfort**: top system bar, dock, centered visual hierarchy, predictable restore/minimize behavior.
- **Linux-like power**: taskbar, right-click desktop menu, terminal, filesystem-oriented workflows.
- **Hybrid by default**: top bar + dock + taskbar + desktop context menu, so you do not have to choose.
- **Usable surfaces**: every visible screen has functional controls, not static mockup-only panels.
- **Song quiet**: rice paper, ink, celadon. Show the file you asked for. Dim the rest.

---

## Desktop modes

Switch from **Settings**, Control Center, Spotlight (`hybrid` / `mac` / `linux`), or in 墨海:

```
mode hybrid
mode mac
mode linux
```

| Mode | Chrome |
| --- | --- |
| **Hybrid** | Menu bar + dock + Linux taskbar |
| **Mac** | Menu bar + dock (taskbar sleeps) |
| **Linux** | Taskbar + right-click menu (no top bar, no dock) |

---

## Apps

**From the original contract**

- **Terminal (墨海)** — `soeng-sh`: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `rm`, `open`, `mode`, `neofetch`, `history`, `help`
- **Workflow Hub (工房)** — kanban with drag-and-drop, New / Run All / Pause All
- **Automation Studio (机心)** — prompt-to-steps, templates, run log
- **Files (书院)** — virtual studio shelves
- **Browser (浏览)** — `soeng://home`, `soeng://welcome`, `soeng://native`, `soeng://poetry`, `soeng://source`, plus the inner garden
- **Settings (设置)** — desktop mode, dawn/dusk, wallpaper, dock magnification

**Scholar's table (v2)**

- **Notes (墨笺)** · **Photos (山水)** · **Music (丝竹)** · **Podcasts (山中对)** · **TV (观影)**

---

## Native Runtime Target

The production system should bind this desktop contract to real OS services:

| Layer | Target responsibility |
| --- | --- |
| Linux base | boot, users, permissions, storage, networking, power |
| Compositor shell | Wayland session, window surfaces, input, display scale |
| Soeng desktop contract | top bar, dock, taskbar, Spotlight, settings, window manager |
| Native bridge | filesystem, process, hardware, package, notification, portal APIs |
| App runtime | PWAs, native Linux apps, sandboxed containers, automation workflows |

---

## Running

### v1 — HTML prototype

Open `SoengOS.html` in a modern browser, or:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/SoengOS.html
```

A compatibility redirect lives at `soengos-workflow.html`.

### GitHub Pages demo

The `Deploy GitHub Pages` workflow publishes the v1 desk on every push to `main`.

**One-time setup (repo owner):** GitHub Actions cannot create a Pages site — `GITHUB_TOKEN` is not allowed to administer the repository. Before the first deploy succeeds:

1. Open **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Re-run the workflow (or push to `main`)

After that, the site is served from the filtered `_site/` artifact (`SoengOS.html`, `media/`, shared JS, etc.). URL: `https://otttyou.github.io/SongueOS/SoengOS.html` (or your org/user Pages root).

### v2 — React desktop

The v2 sitting is the React rewrite of this contract (TanStack Start, Song materials). Source snapshots live in `web/`. The original HTML prototype stays at the repo root so the interaction contract remains cloneable.

The v1 desk now plays sound, tunes YouTube, and loads live pages:

- **Music / Podcast** — Web Audio desk. Play is a real speaker, not a fake bar.
- **TV** — Theater desk with local reels under `media/` (same-origin, always playable). Click a chip to tune with a soft fade. Prev / Next / Space / Theater. Optional YouTube paste still available.
- **Browser** — `http(s)` opens in a sandboxed frame. Wikipedia summaries load live. YouTube watch links play. Sites that send `X-Frame-Options` stay blank in-frame; use **Open tab**.

Useful controls (both sittings):

- `Ctrl/Cmd + K`: Spotlight / command palette
- `Esc`: close overlay or frontmost window
- Right-click desktop: Linux-style context menu
- Dock click: open or restore
- Taskbar click: focus / minimize

---

## Visual style

v1 Fable sitting is a **paper studio**, not a black terminal room:

- Wall: warm paper `#f3ebe0` with peach mist — same light field as [Kengo Fable](https://www.kengoworks.com/fable)
- Ink: espresso `#181410` for type and wells, not the desktop
- Chrome: hairline borders, 18–24px radii, pill dock / top bar / taskbar
- Motion: 420ms ease, windows lift in, dock icons float

v2 still points at rice paper, celadon, and the Song desk. Both sittings stay SoengOS.

---

## Roadmap

1. Keep the HTML desktop contract interactive and complete. **(v1, done)**
2. Extract shell components into a native-rendered frontend when the runtime stabilizes. **(v2 React sitting, this merge)**
3. Add a Linux service bridge for filesystem, process, network, power, audio, Bluetooth, notifications, and packages.
4. Support both web apps and native Linux apps as first-class SoengOS windows.
5. Package a bootable image with a Wayland-based Soeng session.

Apache-2.0. See `LICENSE`.
