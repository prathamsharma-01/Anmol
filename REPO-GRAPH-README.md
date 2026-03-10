# Repository Structure Graphs — Openwork

This folder contains visual representations and helper notes for the repository structure of `openwork/`.

Files in this folder

- `repo-structure.dot` — (existing high-level DOT) Graphviz DOT file you can render with Graphviz.
- `REPO-STRUCTURE.mmd` — Mermaid flowchart (high-level). Paste into https://mermaid.live/ to render.

New graph added

- `project-structure.dot` — Graphviz DOT file created at repository root:
  `/Users/prathamsharma/Documents/test applications/openwork/project-structure.dot`
  - Purpose: a compact, human-friendly high-level graph showing top-level files, `mobile/`, `openwork-platform/` (backend + frontend), `frontend/`, `shared-ui/`, and a note that many backend folders are stubs.
  - It intentionally omits every single `src/` file to remain readable.

How to render `project-structure.dot`

Run these in a zsh terminal from the repository root:

```bash
# generate PNG
dot -Tpng "project-structure.dot" -o "project-structure.png"

# generate SVG
dot -Tsvg "project-structure.dot" -o "project-structure.svg"

# open the image on macOS
open "project-structure.png"
```

ASCII preview (condensed)

- openwork/
  - AGENT-MANAGEMENT-SYSTEM.md
  - package.json
  - README.md
  - mobile/
    - customer-app/
  - openwork-platform/
    - backend/
      - database/init-mongo.js
    - frontend/
      - customer-app/
      - shared-ui/
  - frontend/
  - .github/
    - copilot-instructions.md

Summary of changes made

- Created `project-structure.dot` (Graphviz) at repository root to provide a clear, high-level map of the repo.
- Updated `.github/copilot-instructions.md` with a concise, actionable guide for AI agents (run commands, shared-ui pattern, gotchas).

Next steps (optional)

- Generate a deeper, file-by-file DOT for one subsystem (frontend or backend). Warning: large graphs can be hard to read.
- Produce separate focused graphs (e.g., full `frontend/customer-app` only) for maintainability.
- Add a tiny helper script (`scripts/render-graphs.sh`) that calls `dot` and opens output files.

If you'd like any of the next steps, tell me which one and I'll generate it.
# Repository Structure Graphs — Openwork

This folder contains two visual representations of the repository structure for `openwork/`.

Files:

- `repo-structure.dot` — Graphviz DOT file (high-level). Render with Graphviz:

  dot -Tpng repo-structure.dot -o repo-structure.png

- `REPO-STRUCTURE.mmd` — Mermaid flowchart (high-level). Copy the content into https://mermaid.live/ or any Markdown viewer that supports Mermaid to render.

Notes:

- The graphs highlight the canonical project root `openwork-platform/` and show duplicated/nested copies (e.g., `openwork-platform/frontend/openwork-platform/` and top-level `shared-ui/`).
- These are high-level graphs meant to make it easy to spot where duplicate copies live. They intentionally do not list every single file.

If you want:

- A full, file-by-file DOT that includes every file (large) — I can generate it but it will be big.
- A script to automatically diff the duplicated folders and produce a report of differing files.
- A cleaned branch that removes exact duplicate folders after you confirm diffs.
