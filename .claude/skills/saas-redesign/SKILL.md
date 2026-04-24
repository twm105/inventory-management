---
name: saas-redesign
description: Redesigns a Vue 3 application's UI into a modern SaaS-style interface with a vertical navigation sidebar on the left instead of a top nav bar, consistent spacing, and a polished professional look.
---

# SaaS UI Redesign Guidelines

This skill transforms the current top-navigation layout into a modern SaaS-style application with a fixed vertical sidebar on the left, a clean content area, and polished professional styling.

## Overview of Changes

The redesign involves three main areas:

1. **Layout restructuring** — Convert the `flex-column` app shell to a CSS Grid with a fixed-width sidebar column and a fluid content column
2. **Sidebar construction** — Replace the horizontal `.top-nav` with a vertical `.sidebar` containing logo, nav links, and a footer zone for profile/language controls
3. **Content area polish** — Adjust the main content and FilterBar to fit the new layout with consistent spacing

**MANDATORY**: Every `.vue` file change MUST be delegated to the `vue-expert` agent. Never modify `.vue` files directly when invoking this skill.

---

## Step 1: Read Before Writing

Before making any changes, read the following files in full:

- `client/src/App.vue` — Root layout, global CSS, navigation structure
- `client/src/components/FilterBar.vue` — Shared filter bar positioning
- `client/src/components/ProfileMenu.vue` — Profile dropdown trigger
- `client/src/components/LanguageSwitcher.vue` — Language toggle

Understand the existing CSS class names, composable imports, and component event signatures before instructing the vue-expert agent to make changes.

---

## Step 2: Layout Architecture

### Before (column stack)
```
┌─────────────────────────────────┐
│         .top-nav (sticky)       │
├─────────────────────────────────┤
│         FilterBar (sticky)      │
├─────────────────────────────────┤
│         .main-content           │
└─────────────────────────────────┘
```

### After (sidebar + content grid)
```
┌──────────┬──────────────────────┐
│          │  FilterBar           │
│ .sidebar │──────────────────────│
│  (fixed) │  .main-content       │
│          │  (scrollable)        │
│          │                      │
│ [footer] │                      │
└──────────┴──────────────────────┘
```

### CSS Grid on `.app`

```css
.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}
```

- Column 1: sidebar (240px fixed width)
- Column 2: content area (fluid)

---

## Step 3: Sidebar Design

### Template Structure (replace `.top-nav`)

```html
<aside class="sidebar">
  <!-- Logo / branding at top -->
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <h1>{{ t('nav.companyName') }}</h1>
      <span class="sidebar-subtitle">{{ t('nav.subtitle') }}</span>
    </div>
  </div>

  <!-- Navigation links -->
  <nav class="sidebar-nav">
    <router-link to="/" :class="{ active: $route.path === '/' }">
      {{ t('nav.overview') }}
    </router-link>
    <router-link to="/inventory" :class="{ active: $route.path === '/inventory' }">
      {{ t('nav.inventory') }}
    </router-link>
    <router-link to="/orders" :class="{ active: $route.path === '/orders' }">
      {{ t('nav.orders') }}
    </router-link>
    <router-link to="/spending" :class="{ active: $route.path === '/spending' }">
      {{ t('nav.finance') }}
    </router-link>
    <router-link to="/demand" :class="{ active: $route.path === '/demand' }">
      {{ t('nav.demandForecast') }}
    </router-link>
    <router-link to="/reports" :class="{ active: $route.path === '/reports' }">
      Reports
    </router-link>
  </nav>

  <!-- Footer zone: language switcher + profile -->
  <div class="sidebar-footer">
    <LanguageSwitcher />
    <ProfileMenu
      @show-profile-details="showProfileDetails = true"
      @show-tasks="showTasks = true"
    />
  </div>
</aside>
```

### Sidebar CSS

```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.sidebar-logo h1 {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: -0.025em;
  line-height: 1.3;
}

.sidebar-subtitle {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
  font-weight: 400;
}

.sidebar-nav {
  flex: 1;
  padding: 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  overflow-y: auto;
}

.sidebar-nav a {
  display: block;
  padding: 0.625rem 0.875rem;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.sidebar-nav a:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.07);
}

.sidebar-nav a.active {
  color: #f8fafc;
  background: #2563eb;
}

.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
```

---

## Step 4: Content Area

### Template Structure

Replace the current `<header>` + `<FilterBar />` + `<main>` with:

```html
<div class="content-area">
  <div class="content-topbar">
    <FilterBar />
  </div>
  <main class="main-content">
    <router-view />
  </main>
</div>
```

### Content Area CSS

```css
.content-area {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 240px;
}

.content-topbar {
  position: sticky;
  top: 0;
  z-index: 90;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}

.main-content {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1360px;
  width: 100%;
}
```

Remove the old `.top-nav`, `.nav-container`, `.nav-tabs`, and `.logo` CSS blocks entirely — they are replaced by the sidebar styles above.

---

## Step 5: FilterBar Adjustments

`FilterBar.vue` currently uses `position: sticky; top: 0` with its own background and border. After the redesign it sits inside `.content-topbar` which already provides stickiness and border. Update `FilterBar.vue`'s root element to remove the redundant sticky positioning and let the parent handle it:

```css
/* In FilterBar.vue <style scoped> */
.filter-bar {
  background: transparent;   /* parent provides background */
  border-bottom: none;       /* parent provides border */
  position: static;          /* parent provides sticky */
  padding: 0.75rem 2rem;     /* match horizontal padding of main-content */
}
```

---

## Step 6: ProfileMenu & LanguageSwitcher in Sidebar Footer

These components are currently styled assuming a dark header. In the dark sidebar footer, ensure their text and icon colors work on a dark background. If needed, pass a `dark` prop or apply a `.sidebar-footer` descendant CSS override:

```css
/* In App.vue <style> — override child component styles inside footer */
.sidebar-footer :deep(.language-switcher button),
.sidebar-footer :deep(.profile-trigger) {
  color: #94a3b8;
}

.sidebar-footer :deep(.language-switcher button:hover),
.sidebar-footer :deep(.profile-trigger:hover) {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.07);
}
```

Use `:deep()` selectors — never edit the child component files just to satisfy sidebar coloring.

---

## Step 7: Global Body & App Shell

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
```

---

## Step 8: Design Tokens to Preserve

Do NOT change these — they are used across all view components via global CSS:

| Token | Value | Usage |
|-------|-------|-------|
| Primary dark | `#0f172a` | Sidebar bg, headings |
| Slate-500 | `#64748b` | Secondary text |
| Slate-200 | `#e2e8f0` | Borders |
| Blue-600 | `#2563eb` | Active nav, accent |
| White | `#ffffff` | Cards, content bg |
| Off-white | `#f8fafc` | Page bg, table headers |

Status badge classes (`.badge.success`, `.badge.warning`, `.badge.danger`, `.badge.info`) and stat card modifier classes (`.stat-card.success`, etc.) must remain unchanged.

---

## Step 9: Spacing & Polish Details

- **Sidebar width**: 240px — do not use 220px or 260px; consistency matters
- **Border radius on nav items**: 6px (matches existing card/button radius)
- **Transition duration**: 0.15s ease (slightly snappier than the existing 0.2s for sidebar items)
- **Content horizontal padding**: 2rem (matches current `.main-content` padding)
- **No emojis** anywhere in the UI
- **No external CSS libraries** — custom CSS only

---

## Implementation Checklist

When invoking the vue-expert agent to implement this skill, confirm each item:

- [ ] `App.vue` template: `.top-nav` replaced with `.sidebar` (aside element)
- [ ] `App.vue` template: content wrapped in `.content-area` div with `.content-topbar` + `.main-content`
- [ ] `App.vue` CSS: old `.top-nav`, `.nav-container`, `.nav-tabs`, `.logo`, `.subtitle` rules removed
- [ ] `App.vue` CSS: new `.sidebar`, `.sidebar-header`, `.sidebar-nav`, `.sidebar-footer` rules added
- [ ] `App.vue` CSS: `.app` uses `display: grid; grid-template-columns: 240px 1fr`
- [ ] `App.vue` CSS: `.content-area` has `margin-left: 240px` to clear fixed sidebar
- [ ] `FilterBar.vue`: removed redundant sticky/border/background — parent provides these
- [ ] Sidebar footer: ProfileMenu + LanguageSwitcher render correctly on dark background via `:deep()` overrides
- [ ] All existing global classes preserved (`.card`, `.badge.*`, `.stat-card.*`, `.table-container`, etc.)
- [ ] No new npm packages installed

---

## Common Mistakes to Avoid

1. **Don't remove FilterBar** — it must remain, just repositioned inside `.content-topbar`
2. **Don't break the `<router-view />`** — it must remain inside `.main-content`
3. **Don't hardcode route names** — keep using `$route.path` checks for active state
4. **Don't remove modal components** — `<ProfileDetailsModal>` and `<TasksModal>` must stay in the template
5. **Don't set `overflow: hidden` on `.content-area`** — content views need to scroll
6. **Don't change `.main-content` max-width** to more than 1600px
7. **Don't replace the dark sidebar with a white sidebar** — a dark sidebar distinguishes the nav from the content area and is the key SaaS visual pattern
