import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Create Certificates in Minutes
          </h1>
          <p className="text-lg text-slate-600">
            Choose how you want to start: upload a template or import recipient data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Upload Template Box */}
          <button
            onClick={() => navigate('/canvas?mode=template')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-yellow-400 to-yellow-300 p-1 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative rounded-3xl bg-white px-8 py-16 sm:px-12 sm:py-20 text-center transition-colors group-hover:bg-yellow-50">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-yellow-300 p-4">
                  <svg
                    className="h-12 w-12 text-slate-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 2v6h6M10 9h4m-4 4h4m-4 4h4"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Upload Template
              </h2>
              <p className="text-slate-600">
                Start with your certificate template and customize it with recipient names
              </p>
            </div>
          </button>

          {/* Upload Data Box */}
          <button
            onClick={() => navigate('/canvas?mode=data')}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-yellow-400 to-yellow-300 p-1 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative rounded-3xl bg-white px-8 py-16 sm:px-12 sm:py-20 text-center transition-colors group-hover:bg-yellow-50">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-yellow-300 p-4">
                  <svg
                    className="h-12 w-12 text-slate-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                    <polyline
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      points="13 3 13 8 18 8"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Upload Data
              </h2>
              <p className="text-slate-600">
                Import your recipient data from an Excel file and apply to certificates
              </p>
            </div>
          </button>
        </div>

        <div className="text-center text-slate-600 text-sm">
          <p>Both options required to generate certificates</p>
        </div>
      </div>
    </div>
  );
}
