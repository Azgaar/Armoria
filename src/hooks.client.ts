// Compony borders need getPathData during their first render. Initialize the
// polyfill before mounting, without importing browser globals into the API renderer.
import "path-data-polyfill";
