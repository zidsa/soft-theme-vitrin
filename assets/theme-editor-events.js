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
    }, 2000);
  };

  const scrollToSection = (sectionId) => {
    let section = document.getElementById(sectionId);
    if (!section) {
      // Try finding by section-id attribute
      section = document.querySelector(`[section-id="${sectionId}"]`);
    }

    if (!section) return;

    let scrollOffset = 0;
    const screenWidth = window.innerWidth;

    if (screenWidth < 576) {
      scrollOffset = parseInt(
        section.getAttribute("data-sm-scroll-offset") || "94",
        10,
      );
    } else if (screenWidth < 992) {
      scrollOffset = parseInt(
        section.getAttribute("data-md-scroll-offset") || "130",
        10,
      );
    } else {
      scrollOffset = parseInt(
        section.getAttribute("data-lg-scroll-offset") || "130",
        10,
      );
    }

    const sectionTop =
      section.getBoundingClientRect().top + window.pageYOffset - scrollOffset;

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

    const sectionId = message.payload && message.payload.sectionId;
    if (!sectionId) return;

    switch (message.type) {
      case ThemeEditorMessageType.SECTION_ADDED:
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 1000);

        break;

      case ThemeEditorMessageType.SECTION_EDITED:
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 1000);

        break;

      default:
        console.warn("[Iframe] Unknown message type:", message.type);
        break;
    }
  };

  // Set up click handlers on all sections to notify the editor
  const setupSectionClickHandlers = () => {
    // Find all sections with section-id attribute
    const sections = document.querySelectorAll("[section-id]");

    console.log(
      "[Iframe] Setting up click handlers for",
      sections.length,
      "sections",
    );

    sections.forEach((section) => {
      // Find all h2 elements within the section and add click handlers
      const h2Elements = section.querySelectorAll("h2");

      h2Elements.forEach((h2) => {
        h2.addEventListener("click", (event) => {
          event.stopPropagation();

          const sectionId = section.getAttribute("section-id") || section.id;

          console.log("[Iframe] H2 clicked in section:", sectionId);

          if (sectionId) {
            sendMessageToEditor(ThemeEditorMessageType.SECTION_CLICKED, {
              sectionId,
            });
          }
        });

        // Add visual indicator that h2 elements are clickable in editor mode
        h2.style.cursor = "pointer";
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
