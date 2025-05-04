# BedrockIDE Migration Plan

## 1. Project Assessment

**Current Stack:**
- Next.js
- TailwindCSS
- Radix UI
- React 18
- AI integration (Ollama)

**Issue:**  
Styling problems likely stem from missing or misconfigured files (`tailwind.config.js`, `postcss.config.js`).

---

## 2. Migration Strategies

### **Option A: Clean Next.js Setup**

- Scaffold a new Next.js project with TailwindCSS.
- Ensure all config files are generated and correct.
- Systematically transfer:
    - UI components (code editor, blockchain tools)
    - API routes (AI, compilation, deployment)
    - Utility functions and hooks
- **Benefits:**
    - Clean, conflict-free configuration
    - Reliable styling
    - Fresh dependency tree

### **Option B: Lightweight Rewrite**

- Use Vite + React + TailwindCSS for a simpler, faster setup.
- Port only essential features:
    - Code editor with syntax highlighting
    - AI (Ollama) integration
    - Blockchain compilation simulation
- **Benefits:**
    - Faster development
    - Minimal dependencies
    - Retains core features

---

## 3. Recommendation

**Go with Option A.**  
Your current codebase is feature-rich and well-designed. Migrating to a clean Next.js project preserves your UI/UX and minimizes rework.

---

## 4. Implementation Plan

### **Phase 1: Project Setup (1–2 hours)**
- Create new Next.js project
- Add TailwindCSS and dependencies

### **Phase 2: Structure & Layout (2–3 hours)**
- Set up folders: `components/`, `hooks/`, `lib/`
- Implement base layout and styling
- Copy utilities and hooks

### **Phase 3: Component Migration (4–6 hours)**
- Move UI components, preserving structure
- Update imports and fix references
- Verify styling

### **Phase 4: API Integration (2–3 hours)**
- Set up API routes for:
    - AI (Ollama)
    - Compilation
    - Deployment
- Test endpoints

### **Phase 5: Testing & Polish (2–3 hours)**
- End-to-end feature testing
- Fix styling or integration issues
- Add missing features

---

## 5. Key Files to Migrate

**UI Components:**
- `code-editor-with-ai.tsx`
- `theme-provider.tsx`
- `components/ui/*`

**API Routes:**
- `route.ts` (Ollama)
- `route.ts` (Compilation)
- `route.ts` (Deployment)

**Pages:**
- `page.tsx` (Landing)
- `page.tsx` (Editor)
- `layout.tsx` (Root)

---

## 6. Timeline

- **Total:** 1–2 days
- **Core functionality:** 1 day

---

## Conclusion

A clean migration preserves your design and features while resolving configuration issues. Starting fresh with a proper setup is faster and more reliable than debugging the current environment.