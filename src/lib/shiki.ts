import { createHighlighterCoreSync } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { HighlighterCore } from "shiki/core";

// Language grammar imports — static so Vite bundles only these 9 grammars
import bashGrammar from "shiki/dist/langs/bash.mjs";
import cssGrammar from "shiki/dist/langs/css.mjs";
import htmlGrammar from "shiki/dist/langs/html.mjs";
import jsGrammar from "shiki/dist/langs/javascript.mjs";
import jsonGrammar from "shiki/dist/langs/json.mjs";
import mdGrammar from "shiki/dist/langs/markdown.mjs";
import rustGrammar from "shiki/dist/langs/rust.mjs";
import tsxGrammar from "shiki/dist/langs/tsx.mjs";
import tsGrammar from "shiki/dist/langs/typescript.mjs";

// Theme imports — static so Vite bundles only these themes
import githubLight from "shiki/dist/themes/github-light.mjs";
import githubDark from "shiki/dist/themes/github-dark.mjs";
import dracula from "shiki/dist/themes/dracula.mjs";
import minLight from "shiki/dist/themes/min-light.mjs";
import minDark from "shiki/dist/themes/min-dark.mjs";
import monokai from "shiki/dist/themes/monokai.mjs";
import nord from "shiki/dist/themes/nord.mjs";
import oneDarkPro from "shiki/dist/themes/one-dark-pro.mjs";
import solarizedLight from "shiki/dist/themes/solarized-light.mjs";
import tokyoNight from "shiki/dist/themes/tokyo-night.mjs";

/** Union of valid syntax theme identifiers. */
export type SyntaxTheme =
  | "auto"
  | "github-light"
  | "github-dark"
  | "min-light"
  | "min-dark"
  | "solarized-light"
  | "dracula"
  | "monokai"
  | "nord"
  | "one-dark-pro"
  | "tokyo-night";

/** Available syntax highlight themes (value = Shiki theme id, or "auto"). */
export const SYNTAX_THEMES: { value: SyntaxTheme; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "github-light", label: "GitHub Light" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "min-light", label: "Min Light" },
  { value: "min-dark", label: "Min Dark" },
  { value: "solarized-light", label: "Solarized Light" },
  { value: "dracula", label: "Dracula" },
  { value: "monokai", label: "Monokai" },
  { value: "nord", label: "Nord" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "tokyo-night", label: "Tokyo Night" },
];

/** Set of valid SyntaxTheme values for runtime validation. */
export const SYNTAX_THEME_VALUES: ReadonlySet<SyntaxTheme> = new Set(
  SYNTAX_THEMES.map((t) => t.value),
);

/**
 * Resolves the effective Shiki theme name from the user's syntax theme setting.
 * "auto" (or undefined) follows the app theme; any other value is used directly.
 */
export function resolveSyntaxTheme(
  syntaxTheme: SyntaxTheme | undefined,
  isDark: boolean,
): string {
  if (!syntaxTheme || syntaxTheme === "auto") {
    return isDark ? "github-dark" : "github-light";
  }
  return syntaxTheme;
}

// Language aliases (e.g. ```js -> javascript)
const LANG_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  sh: "bash",
  shell: "bash",
  md: "markdown",
  htm: "html",
};

const SUPPORTED_LANGS = new Set([
  "bash",
  "css",
  "html",
  "javascript",
  "json",
  "markdown",
  "rust",
  "tsx",
  "typescript",
]);

/** Normalises a fenced code-block language tag to a Shiki lang id, or null for plain text. */
export function normalizeLanguage(lang: string | null | undefined): string | null {
  if (!lang) return null;
  const lower = lang.toLowerCase().trim();
  const resolved = LANG_ALIASES[lower] ?? lower;
  return SUPPORTED_LANGS.has(resolved) ? resolved : null;
}

// Synchronous singleton — created once at module load time
let _highlighter: HighlighterCore | null = null;

function getHighlighter(): HighlighterCore {
  if (!_highlighter) {
    _highlighter = createHighlighterCoreSync({
      engine: createJavaScriptRegexEngine(),
      themes: [
        githubLight,
        githubDark,
        dracula,
        minLight,
        minDark,
        monokai,
        nord,
        oneDarkPro,
        solarizedLight,
        tokyoNight,
      ],
      langs: [
        bashGrammar,
        cssGrammar,
        htmlGrammar,
        jsGrammar,
        jsonGrammar,
        mdGrammar,
        rustGrammar,
        tsxGrammar,
        tsGrammar,
      ],
    });
  }
  return _highlighter;
}

// Kick off creation eagerly so it's ready before the first keystroke
let _ready = false;

export function initHighlighter(): void {
  if (!_ready) {
    try {
      getHighlighter(); // synchronous — runs immediately
      _ready = true;
    } catch (error) {
      console.error("Failed to initialize Shiki highlighter:", error);
    }
  }
}

/** Returns the cached highlighter (always available after initHighlighter()). */
export function getHighlighterSync(): HighlighterCore | null {
  return _highlighter;
}

