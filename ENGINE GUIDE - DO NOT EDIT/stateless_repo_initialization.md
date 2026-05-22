# Stateless Repository & Environment Assembly Vision

## 1. The "Logic vs. Machinery" Split
To maintain a lightweight and sovereign codebase, the Zee Engine distinguishes between **Blueprints** and **Machinery**.

*   **Blueprints (Tracked in Git):** The `Project_Skill/` folder. This is the "Sovereign Brain Source." It contains the rules that define the engine. It must be tracked so every environment has the same logic.
*   **Machinery (Ignored in Git):** The `.gemini/` folder. This is the "Local Wiring." It contains machine-specific absolute paths created by the `link` command. It must be ignored to prevent drive-path leakage and broken links in other environments.

---

## 2. Automated Initialization (`setup.bat`)
A future "one-click" initialization script for developers will turn a clean repo into a live engine:
1.  **Dependency Assembly**: Runs `npm install`.
2.  **Body Junction**: Executes `mklink /J "public/images" "PATH_TO_MEDIA"` to bridge the external media drive.
3.  **Brain Ignition**: Executes `gemini skill link Project_Skill/zee-engine-core --scope workspace` (and for apis/tailwind) to wire the logic into the local CLI.

---

## 3. The Rust Orchestrator (Brand Portal)
For non-technical brand operators, the Rust/Tauri app acts as a "Ghost Interface" that automates the engine's assembly:
*   **Sparse Checkout Isolation**: The app pulls only the shared engine code + the operator's specific brand content folder.
*   **Hidden Initialization**: The app runs the Junction and Skill-Linking logic in the background.
*   **The "Sync" Illusion**: Real-world Git commands are wrapped in a single, simple "Sync with Cloud" button.

---

## 4. Environment Agnostic Performance
The engine's speed and builds remain unaffected by the number of brands because:
*   **Build-Time Pruning**: Astro only fetches content for the `PUBLIC_BRAND_ID`, resulting in a tiny production bundle.
*   **Tailwind v4 Trashing**: Irrelevant styles from other brands are automatically discarded during the build.
*   **Decoupled Assets**: Cloudflare R2 + Worker handles the image weight, keeping the build process zero-cost and lightning-fast.

---

**Summary:** The Zee Engine is a self-assembling platform. It exists as a pure "Brain" in the repository and only takes "Form" (The Body) once the initialization wiring is executed in a specific environment.
