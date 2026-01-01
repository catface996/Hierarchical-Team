/**
 * Mermaid Configuration
 *
 * Dark theme configuration for Mermaid diagrams matching the app's slate theme
 * Feature: 017-diagnosis-markdown-mermaid
 */

import mermaid from 'mermaid';

/**
 * Initialize Mermaid with dark theme matching the app's design system
 * Colors based on Tailwind slate palette with cyan accents
 */
export function initializeMermaid(): void {
  mermaid.initialize({
    startOnLoad: false, // We render manually
    suppressErrorRendering: true, // Don't render errors to page
    theme: 'dark',
    themeVariables: {
      // Primary colors (cyan-500 accent)
      primaryColor: '#0ea5e9',
      primaryTextColor: '#e2e8f0', // slate-200
      primaryBorderColor: '#334155', // slate-700

      // Line and connection colors
      lineColor: '#475569', // slate-600

      // Secondary/tertiary backgrounds
      secondaryColor: '#1e293b', // slate-800
      tertiaryColor: '#0f172a', // slate-900

      // Text colors
      textColor: '#e2e8f0', // slate-200

      // Background
      background: '#0f172a', // slate-900
      mainBkg: '#1e293b', // slate-800

      // Node colors
      nodeBorder: '#334155', // slate-700
      clusterBkg: '#1e293b', // slate-800
      clusterBorder: '#334155', // slate-700

      // Edge label background
      edgeLabelBackground: '#1e293b', // slate-800

      // Sequence diagram specific
      actorBkg: '#1e293b', // slate-800
      actorBorder: '#0ea5e9', // cyan-500
      actorTextColor: '#e2e8f0', // slate-200
      actorLineColor: '#475569', // slate-600
      signalColor: '#e2e8f0', // slate-200
      signalTextColor: '#e2e8f0', // slate-200
      labelBoxBkgColor: '#1e293b', // slate-800
      labelBoxBorderColor: '#334155', // slate-700
      labelTextColor: '#e2e8f0', // slate-200
      loopTextColor: '#e2e8f0', // slate-200
      noteBkgColor: '#1e293b', // slate-800
      noteTextColor: '#e2e8f0', // slate-200
      noteBorderColor: '#334155', // slate-700

      // Flowchart specific
      nodeTextColor: '#e2e8f0', // slate-200

      // Gantt chart specific
      sectionBkgColor: '#1e293b', // slate-800
      altSectionBkgColor: '#0f172a', // slate-900
      sectionBkgColor2: '#334155', // slate-700
      taskBorderColor: '#0ea5e9', // cyan-500
      taskBkgColor: '#0ea5e9', // cyan-500
      taskTextColor: '#0f172a', // slate-900
      taskTextOutsideColor: '#e2e8f0', // slate-200
      taskTextClickableColor: '#0ea5e9', // cyan-500
      activeTaskBorderColor: '#0ea5e9', // cyan-500
      activeTaskBkgColor: '#1e293b', // slate-800
      gridColor: '#334155', // slate-700
      doneTaskBkgColor: '#475569', // slate-600
      doneTaskBorderColor: '#64748b', // slate-500
      critBorderColor: '#ef4444', // red-500
      critBkgColor: '#7f1d1d', // red-900
      todayLineColor: '#0ea5e9', // cyan-500
    },
    // Security settings
    securityLevel: 'strict',
    // Font settings
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  });
}

// Initialize on module load
initializeMermaid();

export default mermaid;
