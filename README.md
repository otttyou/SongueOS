# SoengOS

**A Web-Enabled Linux OS Inspired by Zen Minimalism**

SoengOS is a lightweight, web-first Linux distribution designed for users who seek tranquility, focus, and simplicity in their computing experience.  

The system embodies Zen minimalism — emphasizing calm, essential functionality, and the principle of "less is more." Upon boot, SoengOS immediately enters a full-screen web environment where all applications run as Progressive Web Apps (PWAs) or web-based interfaces. This approach delivers a consistent, portable, and distraction-free experience across devices.

The name **Soeng** draws from the Jyutping romanization of the Cantonese pronunciation of “宋”, elegantly blended with Portuguese-style orthography for a smooth, cross-cultural resonance.

---

## Philosophy

SoengOS follows Zen principles of simplicity and presence:

- **Stillness through space**: Generous negative space and neutral tones reduce visual noise.
- **Essence over excess**: Only core functions are visible by default; advanced options remain hidden until needed.
- **Mindful interaction**: Fluid yet unobtrusive responses encourage focused, single-task workflows.
- **Lightness**: Extremely low resource consumption for sustainable and calm computing.

---

## Key Features

- **Web-Enabled Architecture**: The browser serves as the primary desktop environment. All core tools (file manager, terminal, settings, media player, etc.) are built with web technologies.
- **Ultra-Minimal Footprint**: Idle memory usage typically between 400–600 MB.
- **Cross-Platform Consistency**: Seamless experience on x86_64 and ARM hardware, including laptops, single-board computers, and cloud instances.
- **Offline-First Support**: Core functionality works offline thanks to Service Workers and IndexedDB.
- **Containerized Applications**: Web apps run in isolated Linux containers for enhanced security and stability.
- **Distraction-Free Interface**: Clean lines, soft textures, subtle transitions, and optional focus mode.

---

## Visual Style

- Neutral palette: soft grays, gentle aquas, and warm off-whites.
- Large areas of intentional whitespace.
- Fine, straight lines or gentle rounded corners.
- Minimal icons and typography focused on readability and calm.
- No unnecessary animations or decorative elements.

---

## Getting Started

### Prerequisites
- A modern computer or virtual machine (x86_64 or ARM64 recommended).
- At least 2 GB RAM and 8 GB storage for comfortable use.

### Installation (Prototype Stage)

```bash
# Example commands (update according to final build process)
git clone https://github.com/yourusername/SoengOS.git
cd SoengOS

# Build the minimal base system
./build.sh

# Create bootable image
./create-iso.sh
```

### Prototype Stage Offline Coverage

The checked-in prototype is designed to keep the complete UI app shell available without network access:

- `SoengOS.html` and `soengos-workflow.html` no longer depend on Google Fonts or the Tailwind CDN.
- Local styles live in `assets/styles/`, and typography uses system UI/monospace fallback stacks so the UI remains readable when no web fonts are reachable.
- PWA metadata is provided by `manifest.webmanifest`, with a local SVG icon in `assets/icons/`.
- `service-worker.js` pre-caches the two HTML shells, local CSS, the icon, the manifest, and the font-asset placeholder so repeat visits can load the core app shell offline.
- External quick links inside the workflow browser mock remain navigational placeholders; their remote pages are not cached and require network access.
- Prototype data persistence is limited to in-page state unless a future build wires the documented IndexedDB layer.

For local testing, serve the repository over HTTP (service workers do not register from most `file://` contexts):

```bash
python3 -m http.server 8080
# Open http://localhost:8080/SoengOS.html once, then reload with the network disabled.
```
