let audioContext = null;
let gainNode = null;
let savedVolume = 1; // Default volume (100%)

// Function to initialize audio processing
function initializeAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();

    // Enhanced audio element selection
    const audioElements = document.querySelectorAll(
      "audio, video, iframe[src*='youtube'], iframe[src*='vimeo'], embed, object"
    );
    audioElements.forEach(connectToGainNode);

    // Add support for dynamic iframes
    const iframeObserver = new MutationObserver((mutations) => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        try {
          const iframeDoc =
            iframe.contentDocument || iframe.contentWindow.document;
          const iframeAudio = iframeDoc.querySelectorAll("audio, video");
          iframeAudio.forEach(connectToGainNode);
        } catch (e) {
          // Handle cross-origin iframe errors silently
        }
      });
    });

    iframeObserver.observe(document.body, { childList: true, subtree: true });

    // Load saved volume and apply it
    chrome.storage.local.get(["volume"], function (result) {
      if (result.volume !== undefined) {
        savedVolume = result.volume / 100; // Convert to a scale of 0-1
        if (gainNode) {
          gainNode.gain.value = savedVolume;
        }
      }
    });

    // Use MediaElementAudioSourceNode for HTML5 audio/video elements
    function connectToGainNode(element) {
      try {
        if (!element.dataset.volumifyConnected) {
          const source = audioContext.createMediaElementSource(element);
          source.connect(gainNode);
          gainNode.connect(audioContext.destination);
          element.dataset.volumifyConnected = "true";
          element.volume = savedVolume; // Set the volume for the new element
        }
      } catch (e) {
        console.log("Volumify: Already connected or invalid audio element");
      }
    }

    // Monitor DOM for newly added audio/video elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "AUDIO" || node.nodeName === "VIDEO") {
            connectToGainNode(node);
            node.volume = savedVolume; // Set the volume for the new element
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setVolume") {
    if (!audioContext) initializeAudio();

    // Convert slider value (0-500) to gain (0-5)
    savedVolume = request.value / 100; // Save the volume for future use
    if (gainNode) {
      gainNode.gain.value = savedVolume; // This will allow up to 5x gain
    }
    sendResponse({ success: true });
  }
});

// Initialize audio context when page loads
document.addEventListener("DOMContentLoaded", function () {
  initializeAudio();
});
