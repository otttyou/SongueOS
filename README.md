# SoengOS

**A native-ready Mac/Linux hybrid desktop OS concept**

SoengOS is a lightweight Linux operating-system concept that blends the immediacy and polish of macOS-style desktop chrome with the openness, terminal-first workflow, and composability of Linux.

The current repository contains a single-file interactive desktop prototype (`SoengOS.html`) plus a compatibility redirect (`soengos-workflow.html`). The prototype is not intended to remain "just a webpage". It is the desktop contract: the window manager, app surfaces, keyboard model, dock/taskbar behavior, command palette, file interactions, browser shell, settings, workflow hub, automation studio, power menu, and native-runtime readiness panel that a real Linux runtime can bind to system services.

The name **Soeng** draws from the Jyutping romanization of the Cantonese pronunciation of “宋”, blended with Portuguese-style orthography for a smooth, cross-cultural resonance.

---

## Product Direction

SoengOS should feel like a **Mac + Linux combination**:

- **Mac-like comfort**: top system bar, dock, optional left-side window dots, centered visual hierarchy, predictable restore/minimize behavior.
- **Linux-like power**: taskbar option, right-click desktop menu, terminal, filesystem-oriented workflows, containerized apps, native service bridge.
- **Hybrid by default**: SoengOS starts with top bar + dock + taskbar + desktop context menu so users do not have to choose between the two worlds.
- **Usable surfaces**: every visible screen should have functional controls, not static mockup-only panels.

---

## Current Prototype Features

- **Hybrid desktop modes**: switch between Hybrid, Mac, and Linux from Settings or Command Palette.
- **Window manager**: draggable/resizable windows with minimize, maximize, close, focus, dock indicators, and taskbar entries.
- **File Manager**: navigable virtual folders, sidebar shortcuts, path entry, preview, create folder, create file, delete, back/up navigation.
- **Terminal**: Linux-like shell commands including `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `rm`, `open`, `neofetch`, `history`, and more.
- **Browser shell**: back/forward/refresh/home, URL entry, bookmarks, local `soeng://` pages, and sandbox placeholders for external URLs.
- **Settings**: desktop mode, window controls, dock position, taskbar visibility, real toggles for grid/animations/network states, font size, and UI scale.
- **Workflow Hub**: interactive kanban cards with drag-and-drop and workflow counters.
- **Automation Studio**: prompt-to-workflow generation with simulated execution logs.
- **Native Runtime panel**: outlines how the web-shell contract connects to Linux services such as files, power, network, containers, portals, and app runtime.

---

## Native Runtime Target

The production system should bind the current desktop contract to real OS services:

| Layer | Target responsibility |
| --- | --- |
| Linux base | boot, users, permissions, storage, networking, power |
| Compositor shell | Wayland session, window surfaces, input, display scale |
| Soeng desktop contract | top bar, dock, taskbar, command palette, settings, window manager |
| Native bridge | filesystem, process, hardware, package, notification, portal APIs |
| App runtime | PWAs, native Linux apps, sandboxed containers, automation workflows |

The HTML prototype is useful because it makes the interaction contract easy to iterate on before wiring it to the native runtime.

---

## Visual Style

- Neutral palette: black, white, gray, with restrained contrast.
- Mac-style spatial calm plus Linux-style direct control.
- Fine lines, small typography, clear focus states.
- Subtle transitions that can be disabled from Settings.
- No unnecessary decoration beyond functional affordances.

---

## Running the Prototype

Open `SoengOS.html` directly in a modern browser, or serve it locally:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/SoengOS.html
```

Useful controls:

- `Ctrl/Cmd + K`: Command Palette
- `F11`: Focus Mode
- `Esc`: close top overlay or frontmost window
- Right-click desktop: Linux-style context menu
- Dock click: open or restore app
- Taskbar click: focus/minimize app

---

## Roadmap

1. Keep the HTML desktop contract interactive and complete.
2. Extract shell components into a native-rendered frontend when the runtime stabilizes.
3. Add a Linux service bridge for filesystem, process, network, power, audio, Bluetooth, notifications, and packages.
4. Support both web apps and native Linux apps as first-class SoengOS windows.
5. Package a bootable image with a Wayland-based Soeng session.
