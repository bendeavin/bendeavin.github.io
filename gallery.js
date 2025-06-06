// Store all photos and current selection
let allPhotos = [];
let currentPhotos = [];
let currentLightboxIndex = 0;
let preloadedImages = new Map(); // Store preloaded low-quality images

// Fetch and display random photos
async function loadGallery(showMore = false) {
  try {
    if (allPhotos.length === 0) {
      const response = await fetch("data/photos.json");
      allPhotos = await response.json();
    }

    // Get random photos
    const numPhotos = showMore ? 24 : 12;
    currentPhotos = allPhotos
      .sort(() => 0.5 - Math.random())
      .slice(0, numPhotos);

    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // Clear existing content

    // Preload low-quality versions of all images in the current set
    preloadedImages.clear();
    currentPhotos.forEach((photo) => {
      const lowQualityUrl = `https://bendeavin.imgix.net/${photo.sourceFile}?q=10&auto=format&w=240`;
      const img = new Image();
      img.src = lowQualityUrl;
      preloadedImages.set(photo.sourceFile, img);
    });

    currentPhotos.forEach((photo, index) => {
      const imgUrl = `https://bendeavin.imgix.net/${photo.sourceFile}?w=400&h=400&fit=crop&auto=format,compress`;

      const photoElement = document.createElement("div");
      photoElement.className = "gallery-item";
      photoElement.innerHTML = `
        <img 
          src="${imgUrl}" 
          alt="Photo by Ben Deavin"
          loading="lazy"
        />
        <div class="photo-info">
          <span class="date">${formatDate(photo.dateTimeOriginal)}</span>
          <span class="camera">${photo.model}</span>
        </div>
      `;

      photoElement.addEventListener("click", () => openLightbox(index));
      gallery.appendChild(photoElement);
    });

    // Add or update show more button
    updateShowMoreButton();
  } catch (error) {
    console.error("Error loading gallery:", error);
  }
}

function updateShowMoreButton() {
  let showMoreBtn = document.querySelector(".show-more-btn");
  if (!showMoreBtn) {
    showMoreBtn = document.createElement("button");
    showMoreBtn.className = "show-more-btn";
    document.querySelector(".gallery").after(showMoreBtn);
  }

  showMoreBtn.textContent =
    currentPhotos.length === 12 ? "Show More Photos" : "Show Different Photos";
  showMoreBtn.onclick = () => loadGallery(currentPhotos.length === 12);
}

// Format date from EXIF format to readable format
function formatDate(dateStr) {
  if (!dateStr) return "";
  const [date, time] = dateStr.split(" ");
  const [year, month, day] = date.split(":");
  return `${day}/${month}/${year}`;
}

// Format camera settings
function formatCameraSettings(photo) {
  const settings = [];
  if (photo.focalLength) settings.push(`${photo.focalLength}`);
  if (photo.fNumber) settings.push(`f/${photo.fNumber}`);
  if (photo.exposureTime) settings.push(`${photo.exposureTime}s`);
  if (photo.iso) settings.push(`ISO ${photo.iso}`);
  return settings.join(" · ");
}

// Lightbox functionality
function openLightbox(index) {
  currentLightboxIndex = index;
  const photo = currentPhotos[index];
  const lowQualityUrl = `https://bendeavin.imgix.net/${photo.sourceFile}?q=10`;
  const highQualityUrl = `https://bendeavin.imgix.net/${photo.sourceFile}`;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <button class="lightbox-nav lightbox-prev" aria-label="Previous photo">←</button>
      <div class="lightbox-main">
        <img src="${lowQualityUrl}" alt="Full size photo" />
        <button class="lightbox-close" aria-label="Close lightbox">×</button>
      </div>
      <button class="lightbox-nav lightbox-next" aria-label="Next photo">→</button>
      <div class="lightbox-sidebar">
        <div class="camera-settings">
          <h3>Camera Settings</h3>
          <p>${formatCameraSettings(photo)}</p>
          <p class="camera-model">${photo.model}</p>
          <p class="photo-date">${formatDate(photo.dateTimeOriginal)}</p>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(lightbox);
  document.body.style.overflow = "hidden";

  // Load high quality image
  const img = lightbox.querySelector("img");
  const highQualityImg = new Image();
  highQualityImg.src = highQualityUrl;
  highQualityImg.onload = () => {
    img.src = highQualityUrl;
  };

  // Navigation handlers
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  prevBtn.addEventListener("click", () => navigateLightbox(-1));
  nextBtn.addEventListener("click", () => navigateLightbox(1));

  // Close on click outside or close button
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.className === "lightbox-close") {
      lightbox.remove();
      document.body.style.overflow = "";
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", function handleKeyNav(e) {
    if (e.key === "Escape") {
      lightbox.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyNav);
    } else if (e.key === "ArrowLeft") {
      navigateLightbox(-1);
    } else if (e.key === "ArrowRight") {
      navigateLightbox(1);
    }
  });
}

function navigateLightbox(direction) {
  currentLightboxIndex =
    (currentLightboxIndex + direction + currentPhotos.length) %
    currentPhotos.length;
  const newPhoto = currentPhotos[currentLightboxIndex];
  const lowQualityUrl = `https://bendeavin.imgix.net/${newPhoto.sourceFile}?q=10&auto=format&w=240`;
  const highQualityUrl = `https://bendeavin.imgix.net/${newPhoto.sourceFile}?auto=format&w=1200`;

  const lightbox = document.querySelector(".lightbox");
  const img = lightbox.querySelector("img");
  const settings = lightbox.querySelector(".camera-settings");

  // Show low quality image immediately
  img.src = lowQualityUrl;

  // Load high quality image
  const highQualityImg = new Image();
  highQualityImg.src = highQualityUrl;
  highQualityImg.onload = () => {
    img.src = highQualityUrl;
  };

  // Update settings
  settings.innerHTML = `
    <h3>Camera Settings</h3>
    <p>${formatCameraSettings(newPhoto)}</p>
    <p class="camera-model">${newPhoto.model}</p>
    <p class="photo-date">${formatDate(newPhoto.dateTimeOriginal)}</p>
  `;
}

// Initialize gallery when DOM is loaded
document.addEventListener("DOMContentLoaded", () => loadGallery(false));
