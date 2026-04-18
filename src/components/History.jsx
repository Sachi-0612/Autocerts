import React from 'react';

export default function History() {
  return (
    <div className="min-h-[60vh] px-6 py-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">History</h1>
        <p className="mt-3 text-slate-600">
          Your certificate activity and previous exports will appear here.
        </p>
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500">
          No history is available yet.
        </div>
      </div>
    </div>
  );
}
