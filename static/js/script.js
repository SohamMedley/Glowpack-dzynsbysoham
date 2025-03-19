document.addEventListener("DOMContentLoaded", () => {
  const imageGrid = document.getElementById("imageGrid");
  const modal = document.getElementById("imagePreviewModal");
  const previewImage = document.getElementById("previewImage");
  const downloadBtn = document.getElementById("downloadBtn");
  const closeModal = document.querySelector(".close-modal");
  const downloadAllBtn = document.getElementById("downloadAllBtn");
  const thankMeBtn = document.getElementById("thankMeBtn");

  // Create image cards
  for (let i = 1; i <= 10; i++) {
    const imageCard = document.createElement("div");
    imageCard.className = "image-card";

    const img = document.createElement("img");
    // Make sure the path matches your actual folder structure
    img.src = `./static/images/glow${i}.png`;
    img.alt = `Glow ${i}`;
    img.dataset.id = i;

    // Overlay with download icon
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

    // Click to open modal
    img.addEventListener("click", () => {
      showImagePreview(img.src, img.alt);
    });

    // Download single image
    downloadIcon.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent modal from opening
      downloadImage(img.src, `glow-effect-${img.dataset.id}.png`);
    });
  }

  // Show image preview in modal
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

  // Close modal if clicked outside of content
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal.click();
    }
  });

  // Download all images (zip)
  downloadAllBtn.addEventListener("click", async () => {
    const originalText = downloadAllBtn.innerHTML;
    downloadAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
    downloadAllBtn.disabled = true;

    try {
      // Load JSZip
      const JSZip = await loadJSZip();
      const zip = new JSZip();

      const promises = [];
      for (let i = 1; i <= 10; i++) {
        const url = `./static/images/glow${i}.png`;
        const promise = fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            zip.file(`glow-effect-${i}.png`, blob);
          });
        promises.push(promise);
      }

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });

      // Save ZIP
      saveBlob(content, "glowpack-dzynsbysoham.zip");

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

  // Single image download
  function downloadImage(src, filename) {
    const link = document.createElement("a");
    link.href = src;
    link.download = filename;
    link.click();
  }

  // Save blob with fallback
  function saveBlob(blob, filename) {
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement("a");
      if (typeof a.download === "undefined") {
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

  // Dynamically load JSZip
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

  // Thank Me -> redirect to thank.html
  thankMeBtn.addEventListener("click", () => {
    window.location.href = "./thank.html";
  });
});
