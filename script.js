const elements = {
  envelope: document.getElementById("envelope-container"),
  letter: document.getElementById("letter-container"),
  letterWindow: null, // Will be set after letter is displayed
  noBtn: null,
  yesBtn: null,
  title: document.getElementById("letter-title"),
  catImg: document.getElementById("letter-cat"),
  buttons: document.getElementById("letter-buttons"),
  finalText: document.getElementById("final-text"),
};

// Configuration
const CONFIG = {
  noBtnMoveDistance: { min: 150, max: 250 },
  transitionDelay: 50,
  animationDuration: 300,
};

// State management
let isEnvelopeOpen = false;
let hasAnswered = false;

/**
 * Opens the envelope and displays the letter
 */
function openEnvelope() {
  if (isEnvelopeOpen) return;

  isEnvelopeOpen = true;

  // Hide envelope
  elements.envelope.style.display = "none";
  elements.letter.style.display = "flex";
  elements.letter.setAttribute("aria-hidden", "false");

  // Cache letter window element
  elements.letterWindow = document.querySelector(".letter-window");
  elements.noBtn = document.querySelector(".no-btn");
  elements.yesBtn = document.querySelector(".yes-btn");

  // Trigger opening animation
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (elements.letterWindow) {
        elements.letterWindow.classList.add("open");
      }
    }, CONFIG.transitionDelay);
  });

  // Set focus to yes button for accessibility
  setTimeout(() => {
    if (elements.yesBtn) {
      elements.yesBtn.focus();
    }
  }, 700);
}

/**
 * Moves the NO button to a random position
 */
function moveNoButton() {
  if (!elements.noBtn || hasAnswered) return;

  const { min, max } = CONFIG.noBtnMoveDistance;
  const distance = Math.random() * (max - min) + min;
  const angle = Math.random() * Math.PI * 2;

  const moveX = Math.cos(angle) * distance;
  const moveY = Math.sin(angle) * distance;

  // Use transform for better performance
  elements.noBtn.style.transition = `transform ${CONFIG.animationDuration}ms ease`;
  elements.noBtn.style.transform = `translate(${moveX}px, ${moveY}px)`;
}

/**
 * Handles the YES button click
 */
function handleYesClick() {
  if (hasAnswered) return;

  hasAnswered = true;

  // Replace title text in same position
  elements.title.textContent = "Yippeeee!";

  // Replace cat image in same position
  elements.catImg.src = "assets/img/cat_dance.gif";
  elements.catImg.alt = "Cute pixel art cat dancing with joy";

  // Replace buttons with final message in same position
  elements.buttons.innerHTML = `
    <p id="final-text" class="final-text" role="status" aria-live="assertive">
      <strong>My message:</strong> I love you the most p.rin ^^
    </p>
  `;

  // Add final class for styling
  if (elements.letterWindow) {
    elements.letterWindow.classList.add("final");
  }

  // Optional: Confetti or celebration effect could be added here
}

/**
 * Reset NO button position (for touch devices)
 */
function resetNoButtonPosition() {
  if (!elements.noBtn || hasAnswered) return;

  setTimeout(() => {
    if (elements.noBtn && !elements.noBtn.matches(":hover")) {
      elements.noBtn.style.transform = "translate(0, 0)";
    }
  }, 2000);
}

/**
 * Handle keyboard navigation
 */
function handleKeyboard(event) {
  // Open envelope with Enter or Space
  if (!isEnvelopeOpen && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openEnvelope();
    return;
  }

  // Handle YES button with keyboard
  if (
    isEnvelopeOpen &&
    !hasAnswered &&
    event.target.classList.contains("yes-btn")
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleYesClick();
    }
  }

  // Handle NO button with keyboard (move it)
  if (
    isEnvelopeOpen &&
    !hasAnswered &&
    event.target.classList.contains("no-btn")
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      moveNoButton();
      resetNoButtonPosition();
    }
  }
}

/**
 * Initialize event listeners
 */
function init() {
  // Envelope click event
  elements.envelope.addEventListener("click", openEnvelope);
  elements.envelope.addEventListener("keydown", handleKeyboard);

  // Use event delegation for better performance
  document.addEventListener("keydown", handleKeyboard);

  // Lazy load images after page load
  if ("loading" in HTMLImageElement.prototype) {
    // Browser supports lazy loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      img.loading = "lazy";
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    loadImagesLazily();
  }

  // Use passive event listeners for better scroll performance
  document.addEventListener("touchstart", () => {}, { passive: true });
  document.addEventListener("touchmove", () => {}, { passive: true });
}

/**
 * Fallback lazy loading implementation
 */
function loadImagesLazily() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        }
      });
    });

    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => imageObserver.observe(img));
  }
}

/**
 * Setup event listeners after DOM is ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Setup delegated event listeners after letter opens
document.addEventListener("click", (event) => {
  // Handle YES button click
  if (event.target.classList.contains("yes-btn")) {
    handleYesClick();
  }
});

// Handle NO button hover/touch
document.addEventListener("mouseover", (event) => {
  if (event.target.classList.contains("no-btn") && !hasAnswered) {
    moveNoButton();
  }
});

// Handle touch events for mobile
document.addEventListener(
  "touchstart",
  (event) => {
    if (event.target.classList.contains("no-btn") && !hasAnswered) {
      event.preventDefault();
      moveNoButton();
      resetNoButtonPosition();
    }
  },
  { passive: false },
);

// Performance optimization: Preload critical images
function preloadCriticalImages() {
  const criticalImages = ["assets/img/window.png", "assets/img/cat_heart.gif"];

  criticalImages.forEach((src) => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = src;
    link.as = "image";
    document.head.appendChild(link);
  });
}

// Run after initial load
if (document.readyState === "complete") {
  preloadCriticalImages();
} else {
  window.addEventListener("load", preloadCriticalImages);
}

// Register Service Worker for PWA support and offline functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered successfully:",
          registration.scope,
        );

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.log("Service Worker registration failed:", error);
      });
  });
}

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    openEnvelope,
    moveNoButton,
    handleYesClick,
  };
}
