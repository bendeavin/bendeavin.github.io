const initialTheme = document.documentElement.getAttribute("data-theme");

// Theme toggle functionality
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.querySelector(".theme-toggle");
  const sunIcon = document.querySelector(".sun-icon");
  const moonIcon = document.querySelector(".moon-icon");
  const body = document.body;

  // Update icons based on initial theme
  updateIcons(initialTheme);

  // Toggle theme on button click
  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Add transitioning class
    body.classList.remove("no-transition");
    body.classList.add("theme-transitioning");

    // Update theme
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcons(newTheme);

    // Remove transitioning class after animation
    setTimeout(() => {
      body.classList.remove("theme-transitioning");
    }, 1200); // Match transition-duration
  });

  function updateIcons(theme) {
    if (theme === "dark") {
      sunIcon.style.display = "none";
      moonIcon.style.display = "block";
    } else {
      sunIcon.style.display = "block";
      moonIcon.style.display = "none";
    }
  }
});
