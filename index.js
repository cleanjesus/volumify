const slider = document.getElementById("myRange");
const valueDisplay = document.getElementById("sliderValue");
const toggleButton = document.getElementById("modeToggle");

// Load saved volume and theme when popup opens
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get(["volume", "theme"], function (result) {
    if (result.volume !== undefined) {
      slider.value = result.volume;
      valueDisplay.textContent = result.volume;

      // Apply saved volume immediately
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "setVolume",
          value: result.volume,
        });
      });
    }

    // Apply saved theme
    if (result.theme === "dark") {
      document.body.classList.add("dark-mode");
      document.querySelector(".sun-icon").style.display = "none";
      document.querySelector(".moon-icon").style.display = "block";
    } else {
      document.body.classList.remove("dark-mode");
      document.querySelector(".sun-icon").style.display = "block";
      document.querySelector(".moon-icon").style.display = "none";
    }
  });
});

// Update volume when slider moves
slider.addEventListener("input", function () {
  const value = slider.value;
  valueDisplay.textContent = value;

  // Save to storage
  chrome.storage.local.set({ volume: value }, function () {
    console.log("Volume saved:", value);
  });

  // Send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "setVolume",
      value: value,
    });
  });
});

// Dark mode toggle functionality
toggleButton.addEventListener("click", toggleMode);

function toggleMode() {
  const body = document.body;
  const sunIcon = document.querySelector(".sun-icon");
  const moonIcon = document.querySelector(".moon-icon");

  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
    // Save theme preference
    chrome.storage.local.set({ theme: "light" });
  } else {
    body.classList.add("dark-mode");
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
    // Save theme preference
    chrome.storage.local.set({ theme: "dark" });
  }
}

// Update the slider background gradient for vertical orientation
slider.addEventListener("input", function () {
  const value = this.value;
  const percentage = ((value - this.min) / (this.max - this.min)) * 100;
  this.style.background = `linear-gradient(to top, var(--primary, #2563eb) 0%, var(--primary, #2563eb) ${percentage}%, var(--slider-bg, #e2e8f0) ${percentage}%, var(--slider-bg, #e2e8f0) 100%)`;
});

// Initialize slider background on page load
window.addEventListener("load", function () {
  const value = slider.value;
  const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to top, var(--primary, #2563eb) 0%, var(--primary, #2563eb) ${percentage}%, var(--slider-bg, #e2e8f0) ${percentage}%, var(--slider-bg, #e2e8f0) 100%)`;
});
