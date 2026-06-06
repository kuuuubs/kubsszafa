/**
 * Speed Insights initialization for vanilla HTML/JS project
 * This script loads and initializes Vercel Speed Insights
 */

// Load the Speed Insights script dynamically
(function() {
  'use strict';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return;
  }

  // Initialize the queue for Speed Insights events
  if (!window.si) {
    window.si = function() {
      (window.siq = window.siq || []).push(arguments);
    };
  }

  // Create and inject the Speed Insights script
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/speed-insights/script.js';
  
  // Optional: Add error handling
  script.onerror = function() {
    console.warn('Failed to load Vercel Speed Insights');
  };

  // Inject the script into the page
  if (document.head) {
    document.head.appendChild(script);
  } else {
    // If head is not available yet, wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      document.head.appendChild(script);
    });
  }
})();
