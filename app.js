const currentDateEl = document.getElementById("current-date");
const caveCountEl = document.getElementById("cave-count");
const slider = document.getElementById("date-slider");
const playButton = document.getElementById("play-button");
const yearsSelect = document.getElementById("years-select");
const intervalSelect = document.getElementById("interval-select");
const layerSelect = document.getElementById("layer-select");
const radiusInput = document.getElementById("radius-input");
const strokeInput = document.getElementById("stroke-input");
const fillColorInput = document.getElementById("fill-color-input");
const strokeColorInput = document.getElementById("stroke-color-input");
const logoToggle = document.getElementById("logo-toggle");
const logoOverlay = document.getElementById("logo-overlay");
const exportButton = document.getElementById("export-button");
const yearToggle = document.getElementById("year-toggle");
const yearOverlay = document.getElementById("year-overlay");
const visualModeSelect = document.getElementById("visual-mode-select");
const heatRadiusInput = document.getElementById("heat-radius-input");
const heatBlurInput = document.getElementById("heat-blur-input");
const sloveniaOnlyToggle = document.getElementById("slovenia-only-toggle");
const exportVideoButton = document.getElementById("export-video-button");
const displaySettingsButton = document.getElementById(
  "display-settings-button",
);
const styleSettingsButton = document.getElementById("style-settings-button");
const exportSettingsButton = document.getElementById("export-settings-button");
const displaySettings = document.getElementById("display-settings");
const styleSettings = document.getElementById("style-settings");
const exportSettings = document.getElementById("export-settings");
const maskOpacityInput = document.getElementById("mask-opacity-input");
const logoColorSelect = document.getElementById("logo-color-select");
const yearColorSelect = document.getElementById("year-color-select");
const yearOpacityInput = document.getElementById("year-opacity-input");
const aboutButton = document.getElementById("about-button");
const languageButton = document.getElementById("language-button");
const aboutModal = document.getElementById("about-modal");
const aboutCloseButton = document.getElementById("about-close-button");

let allFeatures = [];
let minDate;
let maxDate;
let currentDate;
let isPlaying = false;
let playTimer = null;

const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible: true,
});

const orthoLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri",
    crossOrigin: "anonymous",
  }),
  visible: false,
});

const hybridLabelsLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attributions: "Tiles © Esri",
    crossOrigin: "anonymous",
  }),
  visible: false,
});

const caveSource = new ol.source.Vector();

const heatmapSource = new ol.source.Vector();

const heatmapLayer = new ol.layer.Heatmap({
  source: heatmapSource,
  radius: Number(heatRadiusInput.value),
  blur: Number(heatBlurInput.value),
  visible: false,
});

const sloveniaMaskSource = new ol.source.Vector({
  url: "data/slovenia-mask.geojson",
  format: new ol.format.GeoJSON({
    dataProjection: "EPSG:4326",
    featureProjection: "EPSG:3857",
  }),
});

const sloveniaMaskLayer = new ol.layer.Vector({
  source: sloveniaMaskSource,
  visible: false,
});

const caveLayer = new ol.layer.Vector({
  source: caveSource,
  style: createStyle(),
});

const view = new ol.View({
  center: ol.proj.fromLonLat([14.8, 46.1]),
  zoom: 9,
});

const map = new ol.Map({
  target: "map",
  layers: [
    osmLayer,
    orthoLayer,
    hybridLabelsLayer,
    heatmapLayer,
    sloveniaMaskLayer,
    caveLayer,
  ],
  view: view,
});

fetch("data/caves.geojson")
  .then((response) => response.json())
  .then((data) => {
    const format = new ol.format.GeoJSON();

    allFeatures = format.readFeatures(data, {
      featureProjection: "EPSG:3857",
    });

    const extent = ol.extent.createEmpty();

    allFeatures.forEach((feature) => {
      ol.extent.extend(extent, feature.getGeometry().getExtent());
    });

    view.fit(extent, {
      padding: [150, 150, 150, 150],
      maxZoom: 10,
      duration: 1000,
    });

    const dates = allFeatures.map((feature) => new Date(feature.get("date")));

    minDate = new Date(Math.min(...dates));
    maxDate = new Date(Math.max(...dates));
    currentDate = new Date(minDate);

    slider.min = minDate.getTime();
    slider.max = maxDate.getTime();
    slider.value = currentDate.getTime();

    updateMap();
  });

function createStyle() {
  const radius = Number(radiusInput?.value || 2);
  const strokeWidth = Number(strokeInput?.value || 0);

  const fillColor = fillColorInput?.value || "#ff5000";
  const strokeColor = strokeColorInput?.value || "#ffffff";

  return new ol.style.Style({
    image: new ol.style.Circle({
      radius: radius,

      fill: new ol.style.Fill({
        color: fillColor,
      }),

      stroke:
        strokeWidth > 0
          ? new ol.style.Stroke({
              color: strokeColor,
              width: strokeWidth,
            })
          : null,
    }),
  });
}

function updateMap() {
  caveSource.clear();
  heatmapSource.clear();

  const visibleFeatures = allFeatures.filter((feature) => {
    const caveDate = new Date(feature.get("date"));
    return caveDate <= currentDate;
  });

  caveSource.addFeatures(visibleFeatures);
  heatmapSource.addFeatures(visibleFeatures);

  currentDateEl.textContent = formatDate(currentDate);
  caveCountEl.textContent = `${visibleFeatures.length} / ${allFeatures.length}`;
  yearOverlay.textContent = currentDate.getFullYear();
  slider.value = currentDate.getTime();
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}. ${month}. ${year}`;
}

slider.addEventListener("input", () => {
  currentDate = new Date(Number(slider.value));
  updateMap();
});

playButton.addEventListener("click", () => {
  if (isPlaying) {
    stopAnimation();
    return;
  }

  if (currentDate >= maxDate) {
    currentDate = new Date(minDate);
    updateMap();
  }

  startAnimation();
});

function startAnimation() {
  isPlaying = true;
  playButton.textContent = t("pause");

  const yearsStep = Number(yearsSelect.value);
  const interval = Number(intervalSelect.value);

  playTimer = setInterval(() => {
    currentDate.setFullYear(currentDate.getFullYear() + yearsStep);

    if (currentDate >= maxDate) {
      currentDate = new Date(maxDate);
      updateMap();
      stopAnimation();
      return;
    }

    updateMap();
  }, interval);
}

function stopAnimation() {
  isPlaying = false;
  playButton.textContent = t("play");

  if (playTimer) {
    clearInterval(playTimer);
    playTimer = null;
  }
}

layerSelect.addEventListener("change", () => {
  const selectedLayer = layerSelect.value;

  // Reset all
  osmLayer.setVisible(false);
  orthoLayer.setVisible(false);
  hybridLabelsLayer.setVisible(false);

  // OSM
  if (selectedLayer === "osm") {
    osmLayer.setVisible(true);
  }

  // Pure orthophoto
  if (selectedLayer === "ortho") {
    orthoLayer.setVisible(true);
  }

  // Hybrid
  if (selectedLayer === "hybrid") {
    orthoLayer.setVisible(true);
    hybridLabelsLayer.setVisible(true);
  }
});

[radiusInput, strokeInput, fillColorInput, strokeColorInput].forEach(
  (control) => {
    control.addEventListener("input", () => {
      caveLayer.setStyle(createStyle());
    });
  },
);

logoToggle.addEventListener("change", () => {
  logoOverlay.style.display = logoToggle.checked ? "block" : "none";
});

exportButton.addEventListener("click", () => {
  map.once("rendercomplete", () => {
    const mapCanvas = document.createElement("canvas");
    const size = map.getSize();

    mapCanvas.width = size[0];
    mapCanvas.height = size[1];

    const mapContext = mapCanvas.getContext("2d");

    document
      .querySelectorAll(".ol-layer canvas, canvas.ol-layer")
      .forEach((canvas) => {
        if (canvas.width > 0) {
          const opacity =
            canvas.parentNode.style.opacity || canvas.style.opacity;
          mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);

          const transform = canvas.style.transform;

          let matrix = [1, 0, 0, 1, 0, 0];

          if (transform && transform.startsWith("matrix(")) {
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(",")
              .map(Number);
          }

          mapContext.setTransform(...matrix);

          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix,
          );

          mapContext.drawImage(canvas, 0, 0);
        }
      });

    mapContext.globalAlpha = 1;
    mapContext.setTransform(1, 0, 0, 1, 0, 0);

    // Draw year label if visible
    if (yearToggle.checked) {
      mapContext.save();

      const yearText = String(currentDate.getFullYear());

      mapContext.font = "700 64px Arial";
      mapContext.textAlign = "center";
      mapContext.textBaseline = "top";

      const x = mapCanvas.width / 2;
      const y = 20;

      mapContext.lineWidth = 6;

      const opacity = Number(yearOpacityInput.value) / 100;

      const isWhite = yearColorSelect.value === "white";

      mapContext.fillStyle = isWhite
        ? `rgba(255,255,255,${opacity})`
        : `rgba(0,0,0,${opacity})`;

      //   mapContext.strokeText(yearText, x, y);
      mapContext.fillText(yearText, x, y);

      mapContext.restore();

      //   mapContext.strokeStyle = "rgba(255,255,255,0.9)";
      //   mapContext.strokeText(yearText, x, y);

      //   mapContext.fillStyle = "rgba(0,0,0,0.45)";
      //   mapContext.fillText(yearText, x, y);

      //   mapContext.restore();
    }

    // Draw logo if visible
    if (logoToggle.checked) {
      const logoImg = document.querySelector("#logo-overlay img");

      if (logoImg.complete) {
        const logoWidth = 90;
        const logoHeight =
          logoImg.naturalHeight * (logoWidth / logoImg.naturalWidth);

        const padding = 15;

        const x = mapCanvas.width - logoWidth - padding;
        const y = padding;

        // Background
        // mapContext.fillStyle = "rgba(255,255,255,0.7)";
        // mapContext.fillRect(x - 8, y - 8, logoWidth + 16, logoHeight + 16);

        // Logo
        mapContext.drawImage(logoImg, x, y, logoWidth, logoHeight);
      }
    }

    const selectedDate = formatIsoDate(currentDate);
    const fileName = `jame-${selectedDate}.png`;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = mapCanvas.toDataURL("image/png");
    link.click();
  });

  heatmapLayer.changed();
  map.render();
});

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

yearToggle.addEventListener("change", () => {
  yearOverlay.style.display = yearToggle.checked ? "block" : "none";
});

function updateVisualMode() {
  const mode = visualModeSelect.value;

  caveLayer.setVisible(mode === "dots" || mode === "both");
  heatmapLayer.setVisible(mode === "heatmap" || mode === "both");
}

visualModeSelect.addEventListener("change", updateVisualMode);

heatRadiusInput.addEventListener("input", () => {
  heatmapLayer.setRadius(Number(heatRadiusInput.value));
});

heatBlurInput.addEventListener("input", () => {
  heatmapLayer.setBlur(Number(heatBlurInput.value));
});

updateVisualMode();

sloveniaOnlyToggle.addEventListener("change", () => {
  sloveniaMaskLayer.setVisible(sloveniaOnlyToggle.checked);
});

exportVideoButton.addEventListener("click", async () => {
  stopAnimation();

  exportVideoButton.disabled = true;
  exportVideoButton.textContent = "Exporting...";

  const originalDate = new Date(currentDate);

  const videoCanvas = document.createElement("canvas");
  const size = map.getSize();

  videoCanvas.width = size[0];
  videoCanvas.height = size[1];

  const stream = videoCanvas.captureStream(60);

  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 12000000,
  });

  const chunks = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.download = "jame-casovnica.webm";
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);

    currentDate = originalDate;
    updateMap();

    exportVideoButton.disabled = false;
    exportVideoButton.textContent = "Export video";
  };

  recorder.start();

  currentDate = new Date(minDate);

  const yearsStep = Number(yearsSelect.value);
  const frameDelay = Number(intervalSelect.value);

  while (currentDate <= maxDate) {
    updateMap();

    await waitForMapRender();
    drawCurrentExportFrame(videoCanvas);

    await sleep(frameDelay);

    currentDate.setFullYear(currentDate.getFullYear() + yearsStep);
  }

  recorder.stop();
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForMapRender() {
  return new Promise((resolve) => {
    map.once("rendercomplete", resolve);
    heatmapLayer.changed();
    map.render();
  });
}

function drawCurrentExportFrame(targetCanvas) {
  const ctx = targetCanvas.getContext("2d");

  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

  document
    .querySelectorAll(".ol-layer canvas, canvas.ol-layer")
    .forEach((canvas) => {
      if (canvas.width > 0) {
        const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;

        ctx.globalAlpha = opacity === "" ? 1 : Number(opacity);

        const transform = canvas.style.transform;

        let matrix = [1, 0, 0, 1, 0, 0];

        if (transform && transform.startsWith("matrix(")) {
          matrix = transform
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(",")
            .map(Number);
        }

        ctx.setTransform(...matrix);
        ctx.drawImage(canvas, 0, 0);
      }
    });

  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  drawExportYear(ctx, targetCanvas);
  drawExportLogo(ctx, targetCanvas);
}

function drawExportYear(ctx, canvas) {
  if (!yearToggle.checked) return;

  ctx.save();

  const yearText = String(currentDate.getFullYear());

  ctx.font = "700 64px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const x = canvas.width / 2;
  const y = 20;

  ctx.lineWidth = 6;

  const opacity = Number(yearOpacityInput.value) / 100;

  const isWhite = yearColorSelect.value === "white";

  //   ctx.strokeStyle = isWhite ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.9)";

  ctx.fillStyle = isWhite
    ? `rgba(255,255,255,${opacity})`
    : `rgba(0,0,0,${opacity})`;

  //   ctx.strokeText(yearText, x, y);
  ctx.fillText(yearText, x, y);

  ctx.restore();
}

function drawExportLogo(ctx, canvas) {
  if (!logoToggle.checked) return;

  const logoImg = document.querySelector("#logo-overlay img");

  if (!logoImg || !logoImg.complete) return;

  const logoWidth = 90;
  const logoHeight = logoImg.naturalHeight * (logoWidth / logoImg.naturalWidth);

  const padding = 15;

  const x = canvas.width - logoWidth - padding;
  const y = padding;

  ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
}

function toggleDrawer(drawer) {
  [displaySettings, styleSettings, exportSettings].forEach((item) => {
    if (item !== drawer) item.classList.add("hidden");
  });

  drawer.classList.toggle("hidden");
}

displaySettingsButton.addEventListener("click", () => {
  toggleDrawer(displaySettings);
});

styleSettingsButton.addEventListener("click", () => {
  toggleDrawer(styleSettings);
});

exportSettingsButton.addEventListener("click", () => {
  toggleDrawer(exportSettings);
});

maskOpacityInput.addEventListener("input", updateMaskStyle);
updateMaskStyle();

function updateMaskStyle() {
  const opacity = Number(maskOpacityInput.value) / 100;

  sloveniaMaskLayer.setStyle(
    new ol.style.Style({
      fill: new ol.style.Fill({
        color: `rgba(255, 255, 255, ${opacity})`,
      }),
    }),
  );
}

logoColorSelect.addEventListener("change", () => {
  const logoImg = document.querySelector("#logo-overlay img");

  if (logoColorSelect.value === "white") {
    logoImg.src = "drp_logo_small_w.png";
  } else {
    logoImg.src = "drp_logo_small_b.png";
  }
});

function updateYearStyle() {
  const opacity = Number(yearOpacityInput.value) / 100;

  const color =
    yearColorSelect.value === "white"
      ? `rgba(255,255,255,${opacity})`
      : `rgba(0,0,0,${opacity})`;

  yearOverlay.style.color = color;
}

yearColorSelect.addEventListener("change", updateYearStyle);

yearOpacityInput.addEventListener("input", updateYearStyle);

updateYearStyle();

aboutButton.addEventListener("click", () => {
  aboutModal.classList.remove("hidden");
});

aboutCloseButton.addEventListener("click", () => {
  aboutModal.classList.add("hidden");
});

aboutModal.addEventListener("click", (event) => {
  if (event.target === aboutModal) {
    aboutModal.classList.add("hidden");
  }
});

languageButton.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "sl" : "en";

  languageButton.textContent =
    currentLanguage === "en" ? "Slovenščina" : "English";

  applyTranslations();
});

let currentLanguage = "en";

applyTranslations();

function applyTranslations() {
  document.querySelectorAll("[data-lang]").forEach((element) => {
    const key = element.dataset.lang;

    if (translations[currentLanguage][key]) {
      element.textContent = translations[currentLanguage][key];
    }
  });
}

function t(key) {
  return translations[currentLanguage][key] || key;
}
