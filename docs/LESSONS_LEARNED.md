# Lessons Learned - FishLog Project

## TypeScript Type Management

### Problem: Duplicated Interface Definitions
**När det hände:** Efter att ha implementerat edit-funktionalitet fick vi flera TypeScript build-fel:
- `Property 'species_id' is missing in type 'Catch'`
- `Type 'string | null' is not assignable to type 'string | undefined'`

**Root cause:** Samma `Catch`-interface definierades separat i:
- `Dashboard.tsx`
- `CatchMap.tsx`
- `EditCatchForm.tsx`

När vi uppdaterade en, glömde vi att uppdatera de andra.

### Lösning: Shared Type Definitions
✅ **Best Practice:**
1. **Skapa delad types-fil:** `src/types/catch.ts`
2. **Definiera typer på ett ställe**
3. **Importera samma typ överallt**

```typescript
// ✅ GOOD - Shared type definition
// src/types/catch.ts
export interface Catch {
  id: string
  species_id: string
  // ...
}

// src/components/Dashboard.tsx
import { Catch } from '@/types/catch'

// src/components/CatchMap.tsx
import { Catch } from '@/types/catch'
```

```typescript
// ❌ BAD - Duplicated definitions
// Dashboard.tsx
interface Catch { ... }

// CatchMap.tsx
interface CatchData { ... } // Different name, same data!
```

### Rules Going Forward:

#### 1. **Always use shared types for data models**
   - ✅ Create types in `src/types/`
   - ✅ Export and import, never duplicate
   - ❌ Don't define the same data structure twice

#### 2. **Null vs Undefined consistency**
   - Database nullable fields → `string | null` (not `string | undefined` or `string?`)
   - Optional props → `fieldName?: Type`
   - Be consistent across all files

#### 3. **Test builds before committing**
   - Run `npm run build` locally before pushing
   - Catches TypeScript errors early
   - Saves Vercel build minutes

#### 4. **When adding fields to interfaces:**
   - ✅ Add to shared type in `/types`
   - ✅ All components update automatically
   - ❌ Don't add only in one component

## Example: Current Type Structure

```
src/
├── types/
│   └── catch.ts          # ← Single source of truth
├── components/
│   ├── Dashboard.tsx     # ← imports from types/
│   ├── CatchMap.tsx      # ← imports from types/
│   └── EditCatchForm.tsx # ← imports from types/
```

## Checklist Before Committing:

- [ ] Are you defining a data model interface?
- [ ] Does this interface exist elsewhere?
- [ ] If yes → move to `src/types/` and import
- [ ] If no → create in `src/types/` from the start
- [ ] Run `npm run build` to verify no TypeScript errors
- [ ] Test the feature in browser

## Benefits of This Approach:

1. **Single Source of Truth** - One definition to rule them all
2. **Consistency** - All components use identical types
3. **Maintainability** - Change once, update everywhere
4. **Catch errors early** - TypeScript immediately shows mismatches
5. **Better autocomplete** - IDEs work better with shared types

## Pre-Push Checklist

Before every `git push`, ALWAYS run these commands:

```bash
# 1. Run build to catch TypeScript/ESLint errors
npm run build

# 2. If build succeeds, commit and push
git add -A
git commit -m "Your message"
git push
```

### Common Build Errors to Watch For:

1. **`@typescript-eslint/no-explicit-any`**
   - ❌ `let value: any = ...`
   - ✅ `let value: string | Record<string, unknown> = ...`
   - Always use specific types instead of `any`

2. **Missing imports** after creating new files
   - Check all import paths are correct
   - Verify shared types are imported from `@/types/`

3. **Unused variables**
   - Remove or prefix with underscore: `_unusedVar`

### Why This Matters:
- Vercel build will fail if local build fails
- Wastes deployment time and resources
- Catches errors before they reach production
- ESLint errors that pass in dev can fail in build

---

**Date:** 2025-10-02
**Context:** Implementing edit catch functionality (Fas 4) & i18n support
