import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const PRESETS = {
  "A4 landscape": { w: 1123, h: 794 },
  "A4 portrait": { w: 794, h: 1123 },
  "ID Card": { w: 1020, h: 640 },
  Custom: null,
};

export default function DesignTemplate({ names }) {
  const [width, setWidth] = useState(1123);
  const [height, setHeight] = useState(794);
  const [presetSize, setPresetSize] = useState("A4 landscape");
  const [templateFile, setTemplateFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const [position, setPosition] = useState({ x: 500, y: 350 });
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Arial");

  const canvasRef = useRef(null);

  const previewName = names?.[0] || "John Doe";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed (PNG, JPG, SVG)");
      e.target.value = "";
      setTemplateFile(null);
      setPreview(null);
      return;
    }

    setError("");
    setTemplateFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handlePresetChange = (e) => {
    const preset = e.target.value;
    setPresetSize(preset);

    if (PRESETS[preset]) {
      setWidth(PRESETS[preset].w);
      setHeight(PRESETS[preset].h);
    }
  };

  const handleWidthChange = (e) => {
    setPresetSize("Custom");
    setWidth(Math.min(3000, Math.max(1, Number(e.target.value) || 1)));
  };

  const handleHeightChange = (e) => {
    setPresetSize("Custom");
    setHeight(Math.min(3000, Math.max(1, Number(e.target.value) || 1)));
  };

  // ---- DRAW CANVAS ----
  useEffect(() => {
    if (!preview) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(previewName, position.x, position.y);
    };
    img.src = preview;
  }, [preview, position, fontSize, fontFamily, width, height, previewName]);

  // ---- GENERATE CERTIFICATES ----
  const generateCertificates = async () => {
    if (!templateFile || !names.length) return;

    const zip = new JSZip();
    const baseImg = new Image();
    baseImg.src = preview;

    await new Promise(res => (baseImg.onload = res));

    for (let i = 0; i < names.length; i++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(baseImg, 0, 0, width, height);
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(names[i], position.x, position.y);

      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/png")
      );

      zip.file(`${names[i]}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "certificates.zip");
  };

  return (
    <div className="w-1/2 m-5 bg-white p-4 rounded-2xl border border-gray-300 h-[75vh] md:w-full">
      <h3 className="text-lg font-medium px-3">Document Size</h3>

      {/* Preset */}
      <div className="flex my-3 px-3 items-center gap-3">
        <label htmlFor="size" className="font-medium">Preset size</label>
        <select
          id="size"
          value={presetSize}
          onChange={handlePresetChange}
          className="bg-gray-300 rounded-lg px-4 py-2"
        >
          {Object.keys(PRESETS).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Dimensions */}
      <div className="px-3">
        <div className="flex justify-between mb-1">
          <label className="w-1/2">Width (px)</label>
          <label className="w-1/2">Height (px)</label>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            value={width}
            onChange={handleWidthChange}
            className="bg-gray-300 rounded-lg px-3 py-1 w-1/2"
          />
          <input
            type="number"
            value={height}
            onChange={handleHeightChange}
            className="bg-gray-300 rounded-lg px-3 py-1 w-1/2"
          />
        </div>
      </div>

      {/* Upload */}
      <div className="my-5 px-3">
        <h3 className="font-medium mb-2">Upload Template Background</h3>

        <input
          type="file"
          id="template-upload"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <label
          htmlFor="template-upload"
          className="inline-block text-blue-700 bg-blue-200 px-4 py-2 rounded-xl border border-blue-400 cursor-pointer hover:opacity-80"
        >
          {templateFile ? templateFile.name : "Choose file"}
        </label>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Canvas Preview */}
      {preview && (
        <div className="px-3 space-y-3">
          <canvas
            ref={canvasRef}
            className="border border-gray-300 rounded-lg max-w-full"
          />

          <div className="flex gap-3 items-center">
            <label>X</label>
            <input
              type="range"
              min={0}
              max={width}
              value={position.x}
              onChange={(e) => setPosition(p => ({ ...p, x: +e.target.value }))}
            />
            <label>Y</label>
            <input
              type="range"
              min={0}
              max={height}
              value={position.y}
              onChange={(e) => setPosition(p => ({ ...p, y: +e.target.value }))}
            />
          </div>

          <div className="flex gap-3 items-center">
            <label>Font</label>
            <input
              type="number"
              value={fontSize}
              min={10}
              max={150}
              onChange={(e) => setFontSize(+e.target.value)}
              className="bg-gray-200 rounded px-2 py-1 w-20"
            />
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="bg-gray-200 rounded px-2 py-1"
            >
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Georgia</option>
              <option>Verdana</option>
            </select>
          </div>

          <p className="text-sm text-gray-600">
            Previewing: <strong>{previewName}</strong>
          </p>

          <button
            onClick={generateCertificates}
            className="mt-3 bg-black text-white px-5 py-2 rounded-lg hover:opacity-80"
          >
            Generate {names.length} Certificates
          </button>
        </div>
      )}
    </div>
  );
}
