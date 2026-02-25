/**
 * Main entry point — initializes background animation and navigation.
 */

import './style.css';
import { initBackground } from './background.js';
import { initNavigation } from './navigation.js';

// Initialize WebGL background
const bgContainer = document.getElementById('bg-canvas');
initBackground(bgContainer);

// Initialize navigation system
initNavigation();
