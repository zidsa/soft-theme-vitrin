/**
 * Theme Editor Iframe Communication
 *
 * This script handles communication between the storefront preview iframe
 * and the Zid theme editor. It listens for events from the editor and
 * sends events back when merchants interact with sections.
 *
 * Message Types:
 * - Editor → Storefront:
 *   - SECTION_ADDED: Scroll to the newly added section
 *   - SECTION_EDITED: Scroll to the edited section
 *   - SCROLL_TO_TOP: Scroll to the top of the page (for header sections)
 *   - SCROLL_TO_BOTTOM: Scroll to the bottom of the page (for footer sections)
 *
 * - Storefront → Editor:
 *   - SECTION_CLICKED: Notify editor when a section is clicked
 */

(() => {
  "use strict";

  const THEME_EDITOR_MESSAGE_SOURCE = "zid-theme-editor";

  const ThemeEditorMessageType = {
    SECTION_ADDED: "SECTION_ADDED",
    SECTION_EDITED: "SECTION_EDITED",
    SECTION_CLICKED: "SECTION_CLICKED",
    SCROLL_TO_TOP: "SCROLL_TO_TOP",
    SCROLL_TO_BOTTOM: "SCROLL_TO_BOTTOM",
  };

  // Check if we're running inside an iframe
  const isInThemeEditorIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      // Cross-origin error means we're in an iframe
      return true;
    }
  };

  // Send a message to the parent theme editor
  const sendMessageToEditor = (type, payload) => {
    if (!isInThemeEditorIframe()) return;

    window.parent.postMessage(
      {
        source: THEME_EDITOR_MESSAGE_SOURCE,
        message: {
          type,
          payload,
        },
      },
      "*",
    );
  };

  // Add a temporary highlight effect to a section
  const highlightSection = (section) => {
    section.style.transition = "outline 0.3s ease-in-out";
    section.style.outline = "2px solid #1976d2";
    section.style.outlineOffset = "2px";

    setTimeout(() => {
      section.style.outline = "none";
      section.style.outlineOffset = "0";
    }, 2500);
  };

  // Calculate the height of the sticky header
  const getStickyHeaderHeight = () => {
    const fixedHeader = document.getElementById("fixed-header");
    if (fixedHeader) {
      return fixedHeader.offsetHeight + 20; 
    }

    const screenWidth = window.innerWidth;
    if (screenWidth < 576) {
      return 120;
    }
    return 150;
  };

  // Scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Highlight the header section if it exists
    const header = document.querySelector("header[section-id]");
    if (header) {
      highlightSection(header);
    }
  };

  // Scroll to the bottom of the page
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });

    // Highlight the footer section if it exists
    const footer = document.querySelector("footer[section-id]");
    if (footer) {
      highlightSection(footer);
    }
  };

  const scrollToSection = (sectionId) => {
    let section = document.getElementById(sectionId);
    if (!section) {
      // Try finding by section-id attribute
      section = document.querySelector(`[section-id="${sectionId}"]`);
    }

    if (!section) return;

    const scrollOffset = getStickyHeaderHeight();
    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - scrollOffset;

    window.scrollTo({
      top: sectionTop,
      behavior: "smooth",
      
    });

    // Add a highlight effect to indicate the section
    highlightSection(section);
  };

  // Handle messages from the theme editor
  const handleEditorMessage = (event) => {
    // Verify the message is from the theme editor
    if (!event.data || event.data.source !== THEME_EDITOR_MESSAGE_SOURCE) {
      return;
    }

    const message = event.data.message;
    if (!message || !message.type) return;

    switch (message.type) {
      case ThemeEditorMessageType.SCROLL_TO_TOP:
        setTimeout(() => {
          scrollToTop();
        }, 500);
        break;

      case ThemeEditorMessageType.SCROLL_TO_BOTTOM:
        setTimeout(() => {
          scrollToBottom();
        }, 500);
        break;

      case ThemeEditorMessageType.SECTION_ADDED:
      case ThemeEditorMessageType.SECTION_EDITED: {
        const sectionId = message.payload && message.payload.sectionId;
        if (sectionId) {
          setTimeout(() => {
            scrollToSection(sectionId);
          }, 500);
        }
        break;
      }

      default:
        console.warn("[Iframe] Unknown message type:", message.type);
        break;
    }
  };

  // Set up click handlers on all sections to notify the editor
  const setupSectionClickHandlers = () => {
    // Find all sections with section-id attribute
    const sections = document.querySelectorAll("[section-id]");

    sections.forEach((section) => {
      // Add click handler to the entire section
      section.addEventListener("click", (event) => {
        event.stopPropagation();

        const sectionId = section.getAttribute("section-id") || section.id;

        if (sectionId) {
          sendMessageToEditor(ThemeEditorMessageType.SECTION_CLICKED, {
            sectionId,
          });
        }
      });
    });
  };

  // Initialize the theme editor communication
  const init = () => {
    if (!isInThemeEditorIframe()) return;

    // Listen for messages from the editor
    window.addEventListener("message", handleEditorMessage);

    // Set up section click handlers when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupSectionClickHandlers);
    } else {
      setupSectionClickHandlers();
    }
  };

  // Initialize
  init();
})();
