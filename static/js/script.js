document.addEventListener("DOMContentLoaded", () => {
  const imageGrid = document.getElementById("imageGrid");
  const modal = document.getElementById("imagePreviewModal");
  const previewImage = document.getElementById("previewImage");
  const downloadBtn = document.getElementById("downloadBtn");
  const closeModal = document.querySelector(".close-modal");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const thankMeBtn = document.getElementById("thankMeBtn");

  // Track long press
  let pressTimer;
  let isLongPress = false;
  const longPressDuration = 500; // ms

  // Create image cards
  for (let i = 1; i <= 10; i++) {
    const imageCard = document.createElement("div");
    imageCard.className = "image-card";

    const img = document.createElement("img");
    img.src = `static/images/glow${i}.png`;
    img.alt = `Glow ${i}`;
    img.dataset.id = i;

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `Glow Effect ${i}`;

    const downloadIcon = document.createElement("div");
    downloadIcon.className = "download-icon";
    downloadIcon.innerHTML = '<i class="fas fa-download"></i>';

    overlay.appendChild(title);
    overlay.appendChild(downloadIcon);

    imageCard.appendChild(img);
    imageCard.appendChild(overlay);
    imageGrid.appendChild(imageCard);

    // Long press event for mobile
    img.addEventListener("touchstart", (e) => {
      isLongPress = false;
      pressTimer = setTimeout(() => {
        isLongPress = true;
        showImagePreview(img.src, img.alt);
      }, longPressDuration);
    });

    img.addEventListener("touchend", () => {
      clearTimeout(pressTimer);
    });

    img.addEventListener("touchmove", () => {
      clearTimeout(pressTimer);
    });

    // Click event for desktop (simulating long press)
    img.addEventListener("click", () => {
      showImagePreview(img.src, img.alt);
    });

    // Download single image
    downloadIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      downloadImage(img.src, `glow-effect-${img.dataset.id}.png`);
    });
  }

  // Show image preview
  function showImagePreview(src, alt) {
    previewImage.src = src;
    previewImage.alt = alt;
    downloadBtn.href = src;
    downloadBtn.download = alt.replace(/\s+/g, "-").toLowerCase() + ".png";
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  // Close modal
  closeModal.addEventListener("click", () => {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal.click();
    }
  });

  // Download all images with mobile fallback
  downloadAllBtn.addEventListener("click", async () => {
    const originalText = downloadAllBtn.innerHTML;
    downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    downloadAllBtn.disabled = true;

    try {
      // Load JSZip dynamically and create a zip file
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      // Add all images to the zip
      const promises = [];
      for (let i = 1; i <= 10; i++) {
        const promise = fetch(`static/images/glow${i}.png`)
          .then((response) => response.blob())
          .then((blob) => {
            zip.file(`glow-effect-${i}.png`, blob);
          });
        promises.push(promise);
      }

      // Wait for all images to be added
      await Promise.all(promises);

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });

      // Use helper function to save the blob with fallback support
      saveBlob(content, "glowpack-dzynsbysoham.zip");

      // Reset button
      downloadAllBtn.innerHTML = originalText;
      downloadAllBtn.disabled = false;
    } catch (error) {
      console.error("Error downloading all images:", error);
      downloadAllBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
      setTimeout(() => {
        downloadAllBtn.innerHTML = originalText;
        downloadAllBtn.disabled = false;
      }, 2000);
    }
  });

  // Download single image
  function downloadImage(src, filename) {
    const link = document.createElement("a");
    link.href = src;
    link.download = filename;
    link.click();
  }

  // Helper function to save blob with fallback for mobile devices
  function saveBlob(blob, filename) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // For IE
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement("a");
      // Check if the download attribute is supported
      if (typeof a.download === "undefined") {
        // Fallback: open the blob URL in a new tab (mobile)
        window.open(URL.createObjectURL(blob), "_blank");
      } else {
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  }

  // Dynamically load JSZip library
  function loadJSZip() {
    return new Promise((resolve, reject) => {
      if (window.JSZip) {
        resolve(window.JSZip);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload = () => resolve(window.JSZip);
      script.onerror = () => reject(new Error("Failed to load JSZip"));
      document.head.appendChild(script);
    });
  }

  // Updated Thank Me button event handler: redirect to the Flask route '/thank'
  thankMeBtn.addEventListener("click", () => {
    window.location.href = "/thank";
  });
});
