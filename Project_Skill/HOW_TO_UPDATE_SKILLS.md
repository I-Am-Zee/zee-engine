# How to Update Your Skills (Weekly Maintenance Guide)

> You do not need to write skills yourself. Follow this guide and the AI does it for you.
> Read the relevant scenario, type the exact commands shown, and you're done.

---

## Understanding What You Have

You have 5 files that make AI models smart about your codebase:

| File | What it does | Used by |
|---|---|---|
| `AGENTS.md` | Business rules, brand identity, tech decisions | Antigravity IDE (auto-loaded) |
| `GEMINI.md` | Quick-reference context file | Gemini CLI (auto-loaded) |
| `Project_Skill/zelia-vance-engine/SKILL.md` | Core rules — tokens, atomic design, execution protocol | Gemini CLI (skills system) |
| `Project_Skill/zelia-vance-engine-apis/SKILL.md` | Component APIs, debugging, extensibility | Gemini CLI (skills system) |
| `Project_Skill/zelia-vance-engine.md` | Full detailed reference (human readable, for Antigravity) | Antigravity IDE (manual reference) |
| `Project_Skill/zelia-vance-engine-part2.md` | Full detailed reference Part 2 | Antigravity IDE (manual reference) |

---

## Method 1: Update via Antigravity IDE (Recommended — You're Already Here)

This is the easiest. Just ask me (Antigravity) at the end of any coding session.

**What to say:**
```
"We added a new primitive called [ComponentName] today with these props: [list them].
 Update the skill files to include it."
```

```
"We upgraded alpinejs to 3.16.0 today. Update the version table in the skill files."
```

```
"We added a new CMS collection called [name] at [path] today. Update the skill files."
```

I will read the actual source files, extract the truth, and update the correct sections automatically.

**When to do this:** At the end of any session where something new was built or changed.

---

## Method 2: Update via Gemini CLI (Terminal)

Use this when you want to work in the terminal, or when Antigravity isn't available.

### One-time setup (do this once)

1. Open PowerShell or Terminal.
2. Navigate to your project:
   ```
   cd "d:\Workspace\Zaviona_Ecommerce Astro"
   ```
3. Run:
   ```
   gemini
   ```
4. Gemini CLI will read `GEMINI.md` automatically. You're ready.

### To update a skill file

Once inside `gemini`, type:

**Example 1 — New component added:**
```
Read src/components/primitives/MyNewComponent.astro and then update
Project_Skill/zelia-vance-engine-apis/SKILL.md section 1 to add its prop API.
Follow the same format as the other components in that section.
```

**Example 2 — Dependency upgraded:**
```
alpinejs was upgraded to 3.16.0 today.
Update the version table in Project_Skill/zelia-vance-engine-apis/SKILL.md section 6.
```

**Example 3 — New content collection:**
```
We added a new content collection called "testimonials" at src/content/zelia-vance/testimonials/.
Its schema has: quote (string), author (string), role (string).
Update Project_Skill/zelia-vance-engine/SKILL.md section 6 to add it to the collection table.
Also update GEMINI.md to mention it.
```

**Example 4 — New error pattern discovered:**
```
We found a new recurring bug: using x-transition without x-show causes Alpine to crash.
Add this to the error patterns table in Project_Skill/zelia-vance-engine/SKILL.md section 9.
```

### To load the skills in Gemini CLI

Skills need to be registered so Gemini CLI auto-discovers them. Run this once:
```
gemini skill add Project_Skill/zelia-vance-engine
gemini skill add Project_Skill/zelia-vance-engine-apis
```

Or reference them manually in any session:
```
@Project_Skill/zelia-vance-engine/SKILL.md
@Project_Skill/zelia-vance-engine-apis/SKILL.md
Please use these as your rules for this session.
```

---

## Method 3: Use the Skill-Creator (Bootstrap New Skills)

If you ever need a completely new skill for a different topic (e.g., a "deployment" skill), ask Gemini CLI:

```
create a new skill called "zelia-vance-deployment"
that guides agents through the Cloudflare Pages deployment process for this project
```

Gemini CLI will scaffold the folder and `SKILL.md`. Then ask it to fill in the content based on your deployment process.

---

## Weekly Update Checklist

Run through this every week (takes 5–10 minutes):

```
☐ Did we add any new primitive components?
     → Update: Project_Skill/zelia-vance-engine-apis/SKILL.md → Section 1

☐ Did we add any new UI or Feature components?
     → Update: Project_Skill/zelia-vance-engine.md → "Scripts Behaviors" table

☐ Did we add any new CMS collections or settings files?
     → Update: Project_Skill/zelia-vance-engine/SKILL.md → Section 6
     → Update: GEMINI.md → Directory Map

☐ Did we upgrade any dependencies?
     → Update: Project_Skill/zelia-vance-engine-apis/SKILL.md → Section 6 (Version table)

☐ Did we discover any new recurring bugs or error patterns?
     → Update: Project_Skill/zelia-vance-engine/SKILL.md → Section 9 (Error table)

☐ Did we establish any new coding patterns (Alpine, Astro, data-flow)?
     → Update: Project_Skill/zelia-vance-engine-apis/SKILL.md → Section 2

☐ Did any operational rules change (shipping threshold, return policy)?
     → Update: Project_Skill/zelia-vance-engine/SKILL.md → Section 10 / Operational Rules
     → Update: AGENTS.md (the primary source of truth)
```

**Easiest way to run this checklist:** Just paste it into a message to me (Antigravity) and say:
```
"Run the weekly skill update checklist. Check what changed this week and update the skill files."
```
I will audit the codebase against the current skill files and update whatever has drifted.

---

## How Gemini Flash Models Become Smarter

The reason Flash models make mistakes is **context loss** — they don't know your codebase's specific rules. These skill files solve that.

When a model reads your skill files before working, it knows:
- Exactly which Tailwind syntax is correct (v4 vs v3)
- Exactly which component to use (won't create duplicates)
- Exactly which CMS collection to fetch from (won't cross-wire taxonomy)
- Exactly which atomic layer a component belongs to (won't put behaviors in UI)
- Exactly how to serialize data for Alpine (won't pass raw entries)

**The more detailed and up-to-date your skill files are, the smarter the model behaves.**

This is why weekly updates matter — a skill file that's 3 months stale will start producing the same errors again.

---

## What NotebookLM Can Help With

NotebookLM is NOT for writing code or updating files. But it IS useful for:

1. **Generating a first draft of a new skill** — Upload your AGENTS.md and ask NotebookLM to summarize the key rules for a new engineer. Use that summary as the starting point for a new skill.
2. **Reviewing skill quality** — Upload your skill files and ask "What's missing from these rules? What edge cases are not covered?"
3. **Generating onboarding docs** — Upload skill files + AGENTS.md and ask it to write a new-developer onboarding guide.

Whatever NotebookLM produces, paste it into Antigravity or Gemini CLI and say "write this to the correct skill file".

---

## Quick Reference: Which File to Update for What

| What changed | File to update | Section |
|---|---|---|
| New primitive component | `zelia-vance-engine-apis/SKILL.md` | §1 |
| New UI/Feature component | `zelia-vance-engine.md` (Part 1) | §13 behaviors or component list |
| New CMS collection | `zelia-vance-engine/SKILL.md` | §6 |
| New settings YAML | `zelia-vance-engine/SKILL.md` | §6 settings table |
| New behavior file | `zelia-vance-engine/SKILL.md` | §13 |
| Dependency upgrade | `zelia-vance-engine-apis/SKILL.md` | §6 version table |
| New error pattern | `zelia-vance-engine/SKILL.md` | §9 |
| New page pattern | `zelia-vance-engine-apis/SKILL.md` | §2 |
| New brand added | `GEMINI.md` | Brand section |
| Operational rule changed | `AGENTS.md` first, then skill files | Operational Rules |
