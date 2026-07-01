/**
 * Content System component registry — imports and registers all web components.
 *
 * Usage (raw HTML / no build step):
 *   <script type="module" src="{submodule}/06_Code/components/index.js"></script>
 *
 * This file is for the raw-HTML consumer pattern. For Astro/Vite build-time
 * inlining (paradigm.ts pattern), import each component file individually
 * with ?raw so that relative imports survive the string-embedding step.
 */
import './chip-toggle.js';
import './labeled-slider.js';
