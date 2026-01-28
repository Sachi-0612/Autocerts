import React, { useState } from "react";
import Papa from "papaparse";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const PRESETS = {
  "A4 landscape": { w: 1123, h: 794 },
  "A4 portrait": { w: 794, h: 1123 },
  "ID Card": { w: 1020, h: 640 },
  Custom: null,
};

export default function DesignTemplate() {
  const [width, setWidth] = useState(1123);
  const [height, setHeight] = useState(794);
  const [presetSize, setPresetSize] = useState("A4 landscape");
  const [templateFile, setTemplateFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

//   for name automation

const [templateURL, setTemplateURL] = useState(null);
const [names, setNames] = useState([]);
const [previewName, setPreviewName] = useState("");
const [position, setPosition] = useState({ x: 500, y: 350 });
const [fontSize, setFontSize] = useState(48);
const [fontFamily, setFontFamily] = useState("Arial");

const canvasRef = React.useRef(null);



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
    setPreview(URL.createObjectURL(file));
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

  return (
    <div className="w-1/2 m-5 bg-white p-4 rounded-2xl border border-gray-300 h-[65vh] md:w-full">
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
          <label htmlFor="width" className="w-1/2">Width (px)</label>
          <label htmlFor="height" className="w-1/2">Height (px)</label>
        </div>
        <div className="flex gap-3">
          <input
            type="number"
            id="width"
            min={1}
            max={3000}
            value={width}
            onChange={handleWidthChange}
            className="bg-gray-300 rounded-lg px-3 py-1 w-1/2"
          />
          <input
            type="number"
            id="height"
            min={1}
            max={3000}
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

        {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <img
              src={preview}
              alt="Template preview"
              className="max-h-40 rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  );
}
