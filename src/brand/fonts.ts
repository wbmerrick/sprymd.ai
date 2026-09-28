/**
 * Shared SpryMD type stacks.
 * Load Fraunces + DM Sans once from index.html; use these tokens everywhere else.
 */

export const FONT_DISPLAY = "'Fraunces', Georgia, 'Times New Roman', serif";
export const FONT_BODY = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** CSS `font-family` value for display / headlines (no outer quotes). */
export const FONT_DISPLAY_CSS = "Fraunces, Georgia, 'Times New Roman', serif";
/** CSS `font-family` value for body / UI. */
export const FONT_BODY_CSS = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Tailwind / array form. */
export const FONT_DISPLAY_TAILWIND = ["Fraunces", "Georgia", "Times New Roman", "serif"] as const;
export const FONT_BODY_TAILWIND = ["DM Sans", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"] as const;
