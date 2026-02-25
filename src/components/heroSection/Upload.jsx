import React, { useState } from "react";
import Papa from "papaparse";

export default function Upload({ onNamesExtracted }) {
  const [active, setActive] = useState(0);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setError("Only CSV or Excel files are allowed");
      setFile(null);
      e.target.value = "";
      return;
    }

    setError("");
    setFile(selected);

    // --- Parse CSV ---
    Papa.parse(selected, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        // expects column called "name"
        const extracted = result.data
          .map(row => row.name || row.Name || row.NAME)
          .filter(Boolean);

        if (!extracted.length) {
          setError("CSV must contain a 'name' column");
          return;
        }

        onNamesExtracted(extracted);
      },
      error: () => setError("Failed to parse CSV"),
    });
  };

  const base = "mx-1 py-2 px-3 font-medium rounded-lg hover:opacity-80";
  const activeClass = `${base} bg-black text-white`;
  const inactiveClass = `${base} bg-white text-black border border-gray-300`;

  return (
    <div className="w-1/2 m-5 bg-white p-3.5 rounded-2xl border border-gray-300">
      <h3 className="text-lg font-medium">Document Type</h3>

      <div className="my-2.5">
        <ul className="flex justify-start">
          <li className={active === 0 ? activeClass : inactiveClass}>
            <button onClick={() => setActive(0)}>Certificate</button>
          </li>
          <li className={active === 1 ? activeClass : inactiveClass}>
            <button onClick={() => setActive(1)}>ID Card</button>
          </li>
        </ul>
      </div>

      <div className="h-90 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-lg px-4">
        <input
          type="file"
          id={`file-${active}`}
          className="hidden"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
        />

        <label
          htmlFor={`file-${active}`}
          className="px-4 py-2 bg-black text-white rounded-xl font-medium cursor-pointer hover:opacity-80"
        >
          Choose File
        </label>

        {file && (
          <div className="text-sm text-gray-700 text-center">
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Rows:</strong> parsed</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
