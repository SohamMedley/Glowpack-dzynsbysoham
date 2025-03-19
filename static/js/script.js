const imageGrid = document.getElementById("imageGrid");
const images = Array.from({ length: 10 }, (_, i) => `./static/images/glow${i + 1}.png`);

images.forEach((src, index) => {
  const img = document.createElement("img");
  img.src = src;
  img.alt = `Glow ${index + 1}`;
  img.classList.add("gallery-img");
  img.addEventListener("click", () => openModal(src));
  imageGrid.appendChild(img);
});

function openModal(src) {
  const modal = document.getElementById("imagePreviewModal");
  const modalImg = document.getElementById("previewImage");
  const downloadBtn = document.getElementById("downloadBtn");
  
  modalImg.src = src;
  downloadBtn.href = src;
  downloadBtn.download = src.split('/').pop();
  modal.style.display = "block";

  document.querySelector(".close-modal").onclick = () => {
    modal.style.display = "none";
  };
}

document.getElementById("downloadAllBtn").addEventListener("click", () => {
  const zip = new JSZip();
  const folder = zip.folder("glowpack-dzynsbysoham");
  
  let count = 0;
  images.forEach((url, index) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        folder.file(`glow${index + 1}.png`, blob);
        count++;
        if (count === images.length) {
          zip.generateAsync({ type: "blob" }).then(content => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = "glowpack-dzynsbysoham.zip";
            link.click();
          });
        }
      })
      .catch(error => console.error("Error downloading:", error));
  });
});
