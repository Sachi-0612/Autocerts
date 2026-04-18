import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useData } from '../contexts/DataContext';

export default function Canvas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'template';
  const { 
    setRecipients,
    templateFile, setTemplateFile,
    templatePreview, setTemplatePreview,
    templateWidth, setTemplateWidth,
    templateHeight, setTemplateHeight,
    textElements, setTextElements,
    excelData, setExcelData,
    columns, setColumns
  } = useData();

  const [zoom, setZoom] = useState(1);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      setTemplateWidth(img.naturalWidth);
      setTemplateHeight(img.naturalHeight);
      setZoom(1);
    };

    img.src = url;
    setTemplateFile(file);
    setTemplatePreview(url);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      setExcelData(jsonData);
      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]));
      }

      setRecipients(
        jsonData.map((row, index) => ({
          id: index + 1,
          ...row,
          email: row.email || row.Email || row.EMAIL || '',
          name: row.name || row.Name || row.NAME || row.firstName || row.FirstName || '',
        }))
      );
    };
    reader.readAsBinaryString(file);
  };

  const addTextElement = () => {
    const newElement = {
      id: Date.now(),
      x: templateWidth / 2,
      y: templateHeight / 2,
      fontSize: 48,
      fontFamily: 'Arial',
      isBold: false,
      isItalic: false,
      fontColor: '#000000',
      textAlign: 'center',
      columnName: columns.length > 0 ? columns[0] : '',
    };
    setTextElements([...textElements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (id, updates) => {
    setTextElements(textElements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id) => {
    setTextElements(textElements.filter((el) => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (!templatePreview || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    for (const element of textElements) {
      const distance = Math.sqrt(
        (clickX - element.x) ** 2 + (clickY - element.y) ** 2
      );
      if (distance < 40) {
        setSelectedElementId(element.id);
        setIsDragging(true);
        setDragOffset({
          x: clickX - element.x,
          y: clickY - element.y,
        });
        return;
      }
    }
    setSelectedElementId(null);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const moveX = (e.clientX - rect.left) / zoom;
    const moveY = (e.clientY - rect.top) / zoom;

    updateElement(selectedElementId, {
      x: moveX - dragOffset.x,
      y: moveY - dragOffset.y,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const getPreviewText = (element) => {
    if (element.columnName && excelData.length > 0) {
      return String(excelData[0][element.columnName] || 'Sample');
    }
    return 'Sample';
  };

  const handleProceed = () => {
    if (!templateFile) {
      alert('Please upload a template first');
      return;
    }
    if (textElements.length === 0) {
      alert('Please add at least one text element');
      return;
    }
    navigate('/email-editor');
  };

  return (
    <div className="flex h-screen gap-4 bg-slate-50 p-4">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 overflow-y-auto rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-900">Edit Template</h3>

        {/* Upload Template */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            1. Upload Template
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleTemplateUpload}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-yellow-400"
          />
        </div>

        {/* Upload Data */}
        {mode === 'data' && (
          <div className="mb-6 pb-6 border-b">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              2. Upload Data (Excel)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-yellow-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-900 hover:file:bg-yellow-400"
            />
            {columns.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                Found {columns.length} column(s): {columns.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Tool Selection
        <div className="mb-6 pb-6 border-b">
          <label className="mb-3 block text-sm font-semibold text-slate-700">Tool</label>
          <div className="flex gap-2">
            <button
              onClick={() => setTool('select')}
              className={`w-full rounded-lg px-3 py-2 text-xs font-medium transition ${
                tool === 'select'
                  ? 'bg-yellow-400 text-slate-900'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Select
            </button>
          </div>
        </div> */}

        {/* Add Text Element Button */}
        <button
          onClick={addTextElement}
          className="mb-6 w-full rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
        >
          + Add Text
        </button>

        {/* Text Elements List */}
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            Text Elements ({textElements.length})
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {textElements.map((element) => (
              <div
                key={element.id}
                onClick={() => setSelectedElementId(element.id)}
                className={`rounded-lg border-2 p-3 cursor-pointer transition ${
                  selectedElementId === element.id
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Element {String(element.id).slice(-4)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    ✕
                  </button>
                </div>
                {columns.length > 0 && (
                  <select
                    value={element.columnName}
                    onChange={(e) => updateElement(element.id, { columnName: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded text-xs border border-slate-200 px-2 py-1"
                  >
                    <option value="">Select Column</option>
                    {columns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            {textElements.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No text elements yet</p>
            )}
          </div>
        </div>

        {/* Element Properties */}
        {selectedElementId && (
          <div className="border-t pt-6">
            <h4 className="mb-4 text-sm font-semibold text-slate-700">Properties</h4>

            {/* Font Size */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Font Size: {textElements.find((el) => el.id === selectedElementId)?.fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="120"
                value={textElements.find((el) => el.id === selectedElementId)?.fontSize || 48}
                onChange={(e) =>
                  updateElement(selectedElementId, { fontSize: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Font Family */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Font</label>
              <select
                value={textElements.find((el) => el.id === selectedElementId)?.fontFamily || 'Arial'}
                onChange={(e) => updateElement(selectedElementId, { fontFamily: e.target.value })}
                className="w-full rounded text-xs border border-slate-200 px-3 py-2"
              >
                <option>Arial</option>
                <option>Times New Roman</option>
                <option>Georgia</option>
                <option>Courier New</option>
                <option>Verdana</option>
              </select>
            </div>

            {/* Bold & Italic */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => {
                  const el = textElements.find((e) => e.id === selectedElementId);
                  updateElement(selectedElementId, { isBold: !el?.isBold });
                }}
                className={`flex-1 rounded text-xs font-bold py-2 transition ${
                  textElements.find((el) => el.id === selectedElementId)?.isBold
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                B
              </button>
              <button
                onClick={() => {
                  const el = textElements.find((e) => e.id === selectedElementId);
                  updateElement(selectedElementId, { isItalic: !el?.isItalic });
                }}
                className={`flex-1 rounded text-xs italic py-2 transition ${
                  textElements.find((el) => el.id === selectedElementId)?.isItalic
                    ? 'bg-yellow-400 text-slate-900'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                I
              </button>
            </div>

            {/* Alignment */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Align</label>
              <select
                value={textElements.find((el) => el.id === selectedElementId)?.textAlign || 'center'}
                onChange={(e) => updateElement(selectedElementId, { textAlign: e.target.value })}
                className="w-full rounded text-xs border border-slate-200 px-2 py-1"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="mb-2 block text-xs font-semibold text-slate-700">Color</label>
              <input
                type="color"
                value={textElements.find((el) => el.id === selectedElementId)?.fontColor || '#000000'}
                onChange={(e) => updateElement(selectedElementId, { fontColor: e.target.value })}
                className="h-8 w-full rounded border border-slate-200 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Canvas Area — min-w-0 prevents flex child from overflowing sidebar */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Zoom Controls */}
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm w-fit">
          <button
            onClick={() => setZoom(Math.max(0.3, zoom - 0.2))}
            className="rounded px-3 py-1 text-sm font-medium bg-slate-100 hover:bg-slate-200"
          >
            −
          </button>
          <span className="w-16 text-center text-sm font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.2))}
            className="rounded px-3 py-1 text-sm font-medium bg-slate-100 hover:bg-slate-200"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="rounded px-3 py-1 text-sm font-medium bg-yellow-300 hover:bg-yellow-400"
          >
            Reset
          </button>
        </div>

        {/* Scrollable canvas viewport */}
        <div
          className="flex-1 rounded-2xl bg-white shadow-sm overflow-auto p-4 relative"
          style={{ cursor: isDragging ? 'grabbing' : selectedElementId ? 'grab' : 'default' }}
        >
          {templatePreview ? (
            /*
              Outer div reserves the scaled dimensions so the scrollbar knows how
              big the content is. Inner div uses transform:scale so the actual
              pixels of the image stay sharp.
            */
            <div
              style={{
                width: templateWidth * zoom,
                height: templateHeight * zoom,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: templateWidth,
                  height: templateHeight,
                }}
              >
                <div className="relative" style={{ width: templateWidth, height: templateHeight }}>
                  <img
                    src={templatePreview}
                    alt="Template"
                    width={templateWidth}
                    height={templateHeight}
                    className="select-none block"
                    draggable={false}
                  />

                  {/* Text Elements */}
                  {textElements.map((element) => {
                    const previewText = getPreviewText(element);
                    const isSelected = selectedElementId === element.id;

                    return (
                      <div
                        key={element.id}
                        style={{
                          position: 'absolute',
                          left: `${element.x}px`,
                          top: `${element.y}px`,
                          fontSize: `${element.fontSize}px`,
                          fontFamily: element.fontFamily,
                          fontWeight: element.isBold ? 'bold' : 'normal',
                          fontStyle: element.isItalic ? 'italic' : 'normal',
                          color: element.fontColor,
                          textAlign: element.textAlign,
                          transform: 'translate(-50%, -50%)',
                          maxWidth: '400px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          outline: isSelected ? '2px solid #facc15' : 'none',
                          padding: isSelected ? '2px 6px' : '0',
                        }}
                      >
                        {previewText}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Upload a template to begin</p>
            </div>
          )}
        </div>

        {/* Proceed Button */}
        <button
          onClick={handleProceed}
          disabled={!templateFile || textElements.length === 0}
          className="mt-4 w-full rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-slate-900 transition disabled:opacity-50 hover:bg-yellow-500 active:bg-yellow-600"
        >
          Proceed to Email Options
        </button>
      </div>
    </div>
  );
}