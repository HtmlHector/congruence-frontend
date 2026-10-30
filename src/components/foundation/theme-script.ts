export const THEME_STORAGE_KEY = "foundation-theme";

/**
 * Runs before first paint so the stored theme is applied without a flash.
 * Kept dependency-free and defensive about storage access.
 */
export const THEME_SCRIPT = `(function(){try{var mode=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var dark=mode==="dark"||(mode==="system"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";root.dataset.theme=dark?"dark":"light";}catch(e){}})();`;
