import React, { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function DesignTemplate() {
  const canvasRef = useRef(null);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [preview, setPreview] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);

  const [excelData, setExcelData] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");

  const [position, setPosition] = useState({ x: 400, y: 300 });
  const [isDragging, setIsDragging] = useState(false);

  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Poppins");
  const [fontWeight, setFontWeight] = useState("normal");
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontColor, setFontColor] = useState("#000000");

  const [textAlign, setTextAlign] = useState("center");
  const [textBaseline, setTextBaseline] = useState("middle");

  const [showEditor, setShowEditor] = useState(false);
  const [scale, setScale] = useState(1);

  const previewText =
    excelData.length>0 && selectedColumn
      ? excelData[0][selectedColumn]
      : "Preview Text";

  // -------- TEMPLATE UPLOAD --------
  const handleTemplateUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    setWidth(img.naturalWidth);
    setHeight(img.naturalHeight);

    setPosition({
      x: img.naturalWidth / 2,
      y: img.naturalHeight / 2,
    });

    // scale to fit screen
    const maxWidth = window.innerWidth * 0.6;
    const maxHeight = window.innerHeight * 0.8;

    const scaleX = maxWidth / img.naturalWidth;
    const scaleY = maxHeight / img.naturalHeight;

    setScale(Math.min(scaleX, scaleY, 1));
  };

  img.src = url;
  setTemplateFile(file);
  setPreview(url);
};

  // -------- EXCEL UPLOAD --------
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const loadedFonts = new Set();
  
const loadGoogleFont = async (fontName) => {
  if (loadedFonts.has(fontName)) return;

  const formattedName = fontName.replace(/ /g, "+");

  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
  link.rel = "stylesheet";

  document.head.appendChild(link);

  // Wait until font is actually available
  await document.fonts.load(`16px "${fontName}"`);

  loadedFonts.add(fontName);
};

  // -------- DRAW CANVAS --------
  useEffect(() => {
  if (!preview) return;

  const draw = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = async () => {
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      //  Dynamically load selected font
      await loadGoogleFont(fontFamily);

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;

      ctx.fillText(previewText, position.x, position.y);
    };

    img.src = preview;
  };

  draw();
}, [
  preview,
  width,
  height,
  position,
  fontSize,
  fontFamily,
  fontWeight,
  fontStyle,
  fontColor,
  textAlign,
  textBaseline,
  previewText,
]);

  // -------- DRAGGING --------
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
  if (!isDragging) return;

  const rect = canvasRef.current.getBoundingClientRect();

  setPosition({
    x: (e.clientX - rect.left) / scale,
    y: (e.clientY - rect.top) / scale,
  });
};

  // -------- GENERATE CERTIFICATES --------
  const generateCertificates = async () => {
    await loadGoogleFont(fontFamily);

ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
    if (!templateFile || !selectedColumn || excelData.length === 0) {
      alert("Upload template, Excel file and select column.");
      return;
    }

    const values = excelData.map((row) => row[selectedColumn]).filter(Boolean);

    const zip = new JSZip();
    const baseImg = new Image();
    baseImg.src = preview;

    await new Promise((res) => (baseImg.onload = res));

    for (let i = 0; i < values.length; i++) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(baseImg, 0, 0, width, height);

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;

      ctx.fillText(values[i], position.x, position.y);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      const safeName = String(values[i]).replace(/[^\w\s]/gi, "");
      zip.file(`${safeName}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "certificates.zip");
  };

return (

  <div className="w-full h-screen flex flex-col bg-gray-100">

```
{/* HEADER */}
<div className="bg-white border-b px-6 py-4 flex items-center justify-between">
  <h2 className="text-xl font-semibold">
    Certificate Automation Tool
  </h2>

  <button
    onClick={generateCertificates}
    className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-80"
  >
    Generate Certificates
  </button>
</div>

{/* MAIN LAYOUT */}
<div className="flex flex-1 overflow-hidden">

  {/* LEFT SIDE CONTROLS */}
  <div className="w-[320px] bg-white border-r p-5 overflow-y-auto space-y-5">

    {/* TEMPLATE */}
    <div>
      <label className="block font-medium mb-1">
        Upload Template
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleTemplateUpload}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    {/* EXCEL */}
    <div>
      <label className="block font-medium mb-1">
        Upload Excel
      </label>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    {/* COLUMN */}
    {excelData.length > 0 && (
      <div>
        <label className="block font-medium mb-1">
          Select Column
        </label>

        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select Column</option>

          {Object.keys(excelData[0]).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
    )}

    <hr />

    {/* FONT SIZE */}
    <div>
      <label className="block font-medium mb-1">
        Font Size
      </label>

      <input
        type="number"
        value={fontSize}
        min={10}
        max={200}
        onChange={(e) => setFontSize(+e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
    </div>

    {/* FONT FAMILY */}
    <div>
      <label className="block font-medium mb-1">
        Font Family
      </label>

      <select
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="Poppins">Poppins</option>
        <option value="Montserrat">Montserrat</option>
        <option value="Playfair Display">Playfair Display</option>
        <option value="Cinzel">Cinzel</option>
        <option value="Great Vibes">Great Vibes</option>
        <option value="Allura">Allura</option>
        <option value="Dancing Script">Dancing Script</option>
      </select>
    </div>

    {/* FONT WEIGHT */}
    <div>
      <label className="block font-medium mb-1">
        Font Weight
      </label>

      <select
        value={fontWeight}
        onChange={(e) => setFontWeight(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
      </select>
    </div>

    {/* FONT STYLE */}
    <div>
      <label className="block font-medium mb-1">
        Font Style
      </label>

      <select
        value={fontStyle}
        onChange={(e) => setFontStyle(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="normal">Regular</option>
        <option value="italic">Italic</option>
      </select>
    </div>

    {/* TEXT ALIGN */}
    <div>
      <label className="block font-medium mb-1">
        Text Align
      </label>

      <select
        value={textAlign}
        onChange={(e) => setTextAlign(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="left">Left</option>
        <option value="center">Center</option>
        <option value="right">Right</option>
      </select>
    </div>

    {/* TEXT BASELINE */}
    <div>
      <label className="block font-medium mb-1">
        Vertical Align
      </label>

      <select
        value={textBaseline}
        onChange={(e) => setTextBaseline(e.target.value)}
        className="w-full border rounded px-3 py-2"
      >
        <option value="top">Top</option>
        <option value="middle">Middle</option>
        <option value="bottom">Bottom</option>
      </select>
    </div>

    {/* COLOR */}
    <div>
      <label className="block font-medium mb-1">
        Font Color
      </label>

      <input
        type="color"
        value={fontColor}
        onChange={(e) => setFontColor(e.target.value)}
        className="w-full h-10"
      />
    </div>

  </div>

  {/* CANVAS AREA */}
  <div className="flex-1 overflow-auto flex justify-center items-start p-10">

    {preview ? (
      <canvas
  ref={canvasRef}
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onMouseMove={handleMouseMove}
  className="border shadow-lg cursor-move"
  style={{
    width: width * scale,
    height: height * scale
  }}
/>
    ) : (
      <div className="text-gray-500 text-lg mt-20">
        Upload a template to start editing
      </div>
    )}

  </div>

</div>
```

  </div>
);

}