# SoengOS Paper Studio Design QA

**Source visual truth:** kengoworks.com/fable, /work/cool-s, /work/self-portraits, /work/hugging-face-incident — paper walls, hairline chrome, rounded cards, dark only as content.

**Implementation:** `SoengOS.html` on `cursor/fable-paper-studio-f72d`, captured in the cloud browser at `http://127.0.0.1:8000/SoengOS.html`.

**Viewport:** Desktop hybrid, Fable tokens, Files / Terminal / Settings / launcher.

## What the previous sitting got wrong

The espresso/cream tokens were correct. The room was not. The desktop was `#181410`, every surface had a 2px ink outline, and hover inverted to black. That reads as a terminal, not a Kengo wall.

## Full-view comparison

| Surface | Required | Result |
| --- | --- | --- |
| Desktop / boot | Warm paper `#f3ebe0`, peach mist | Passed — light studio, not a black screen |
| Icons | Ink on paper, rounded tiles | Passed |
| Top bar / dock / taskbar | Glass pills, hairline | Passed |
| Windows | 28px radius, hairline, soft warm shadow | Passed |
| Terminal | Dark well inside a cream frame | Passed — desk stays paper |
| Launcher | Soft cards, lift on hover | Passed |
| Motion | 420ms ease, dock lift | Passed |

## Findings

No P0–P2. First-load black flash seen in one session was the previous HTML cached by the browser; a reload showed paper immediately. Body CSS paints `#f3ebe0` on first style.

final result: passed
