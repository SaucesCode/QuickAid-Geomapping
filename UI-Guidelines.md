# 🎨 QuickAid-Geomapping UI Guidelines

QuickAid-Geomapping is an **Applicant Management System (AMS)** enhanced with **geomapping** and **analytics**.  
This guide ensures **consistent UI/UX design** across all pages.

---

## 🌈 Color Palette

We stick with a modern, clean, and professional look.

- **Primary (Sidebar + Accents):** `#1a202c` (gray-900)
- **Secondary:** `#2d3748` (gray-800)
- **Highlight (Active states, accents):** `#38b2ac` (teal-500)
- **Background (Main):** `#f7fafc` (gray-50)
- **Surface (Cards, Header):** `#ffffff` (white)
- **Text Primary:** `#2d3748` (gray-800)
- **Text Secondary:** `#a0aec0` (gray-400)

---

## ⚙️ Tailwind + DaisyUI Config

\`\`\`js
// tailwind.config.js
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
content: [
"./index.html",
"./src/**/*.{js,ts,jsx,tsx}",
],
theme: {
extend: {
colors: {
quickaid: {
primary: "#1a202c", // Sidebar bg, headings
secondary: "#2d3748", // Borders, secondary text
accent: "#38b2ac", // CTAs, highlights
bg: "#f7fafc", // App background
surface: "#ffffff", // Cards, header, modals
text: {
primary: "#2d3748",
secondary: "#a0aec0",
},
},
},
},
},
plugins: [require("daisyui")],
daisyui: {
themes: [
{
quickaid: {
"primary": "#1a202c",
"secondary": "#2d3748",
"accent": "#38b2ac",
"neutral": "#2d3748",
"base-100": "#f7fafc",
"info": "#3abff8",
"success": "#36d399",
"warning": "#fbbd23",
"error": "#f87272",
},
},
],
},
};
\`\`\`

---

## 📏 Spacing & Layout

- **Sidebar Width:** Expanded → `w-64` (16rem), Collapsed → `w-20` (5rem)
- **Header Height:** `h-16` (64px)
- **Content Padding:** `p-6` inside main container
- **Card Padding:** `p-4` or `p-6`
- **Button Padding:** `px-4 py-2`
- **Border Radius:** `rounded-xl`

---

## 🔠 Typography

- **Font:** System default (`Inter`, `sans-serif`)
- **Headings:**
  - H1 → `text-3xl font-bold text-quickaid-text-primary`
  - H2 → `text-2xl font-semibold text-quickaid-text-primary`
  - H3 → `text-xl font-medium text-quickaid-text-primary`
- **Body Text:** `text-base text-quickaid-text-primary`
- **Muted/Helper Text:** `text-sm text-quickaid-text-secondary`

---

## 📦 Components

### Sidebar

- **Width:** `w-64` expanded, `w-20` collapsed
- **Colors:** `bg-quickaid-primary text-gray-300`
- **Nav Links:**
  - Default: `flex items-center px-4 py-3 text-gray-400 hover:bg-gray-700 hover:text-white transition`
  - Active: `bg-gray-900 text-white border-l-4 border-quickaid-accent`
- **Footer:** `border-t border-gray-700`

### Header

- **Sticky at top:** `sticky top-0 z-20`
- **Height:** `h-16`
- **Colors:** `bg-quickaid-surface shadow border-b border-gray-200`
- **Left Section:** Sidebar toggle + Page Title
- **Right Section:** Notifications + User Menu

### Buttons

- **Primary:** `btn btn-primary` or `bg-quickaid-accent hover:bg-teal-600 text-white rounded-lg px-4 py-2`
- **Secondary:** `btn btn-outline` or `bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2`
- **Danger:** `btn btn-error` or `bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2`

### Cards

- **Container:** `card bg-base-100 shadow-md rounded-xl p-6`
- **Title:** `text-lg font-semibold text-quickaid-text-primary mb-2`
- **Body:** `text-quickaid-text-secondary`

### Forms

- **Labels:** `block text-sm font-medium text-gray-700 mb-1`
- **Inputs:** `input input-bordered w-full focus:ring-2 focus:ring-quickaid-accent`
- **Selects:** same as inputs, with `appearance-none`
- **Validation/Error:** `text-sm text-error mt-1`

### Tables

- **Header Row:** `bg-gray-100 text-gray-700 font-semibold`
- **Row Hover:** `hover:bg-gray-50`
- **Cell Padding:** `px-4 py-2`

### Modals

- **Backdrop:** `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`
- **Modal Box:** `modal-box bg-quickaid-surface rounded-xl shadow-lg p-6 w-full max-w-lg`

---

## 🔧 Libraries to Use

- **[Lucide React](https://lucide.dev/):** Clean, consistent icon set
- **[React Hot Toast](https://react-hot-toast.com/):** Toast notifications
- **[DaisyUI](https://daisyui.com/):** Pre-built Tailwind components
- **[Headless UI](https://headlessui.dev/):** Accessible modals, dropdowns, popovers
- **[Recharts](https://recharts.org/):** Charts for Analytics Dashboard
- **[React Hook Form](https://react-hook-form.com/):** Form handling

---

## 🧑‍🎨 Design Principles

1. **Consistency first** → follow spacing, colors, and typography.
2. **Minimal but informative** → don’t overload screens, keep actions clear.
3. **Feedback always** → toast for actions, modals for confirmations, hover states for interactables.
4. **Accessibility** → use semantic HTML + ARIA when needed.

---

## Modal to Use Example

{restoreModal.show && (

  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
      {/* Modal Header */}
      <div className="flex items-center gap-3 p-6 border-b">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Confirm Restore</h2>
      </div>

      {/* Modal Content */}
      <div className="p-6">
        <p className="text-gray-600">
          Are you sure you want to restore this applicant? This will move them back to
          the active applicants list.
        </p>
      </div>

      {/* Modal Footer */}
      <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
        <button
          onClick={closeRestoreModal}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleRestore}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
        >
          <Check className="w-4 h-4" />
          Restore
        </button>
      </div>
    </div>

  </div>
)}
