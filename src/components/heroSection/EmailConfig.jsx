import { useState, useMemo } from "react";

export default function EmailConfig({ recipientCount = 0 }) {
  const [subject, setSubject] = useState("Your Certificate is ready");
  const [body, setBody] = useState(
    "Dear {name},\nPlease find your certificate attached.\nBest regards"
  );
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const MAX_SUBJECT = 120;
  const MAX_BODY = 5000;

  const validate = () => {
    const e = {};
    if (!subject.trim()) e.subject = "Subject is required";
    if (!body.trim()) e.body = "Email body is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const previewText = useMemo(() => {
    return body
      .replaceAll("{name}", "John Doe")
      .replaceAll("{email}", "john@example.com")
      .replaceAll("{position}", "Developer");
  }, [body]);

  const handlePreview = () => {
    if (!validate()) return;
    setShowPreview(true);
  };

  const handleSend = () => {
    if (!validate()) return;
    console.log({ subject, body });
  };

  return (
    <div className="bg-gray-200 m-0 p-3">
      <div className="bg-white px-5 py-7 w-1/2 sm:w-auto m-3 rounded-lg shadow-md flex flex-col gap-6">
        <h2 className="font-medium text-lg">Email Configuration</h2>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="font-medium">
            Email Subject
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            maxLength={MAX_SUBJECT}
            onChange={(e) => setSubject(e.target.value)}
            aria-invalid={!!errors.subject}
            className="border-none p-3 w-full my-1 bg-gray-200 rounded-lg font-mono"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{errors.subject}</span>
            <span>{subject.length}/{MAX_SUBJECT}</span>
          </div>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="font-medium">
            Email Body
          </label>
          <textarea
            id="body"
            value={body}
            maxLength={MAX_BODY}
            onChange={(e) => setBody(e.target.value)}
            aria-invalid={!!errors.body}
            className="p-3 w-full mt-1 h-44 bg-gray-200 border-none rounded-lg resize-y font-mono"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{errors.body}</span>
            <span>{body.length}/{MAX_BODY}</span>
          </div>
        </div>

        {/* Helper */}
        <p className="text-gray-500 text-sm">
          Use placeholders like <code>{"{name}"}</code>, <code>{"{email}"}</code>,{" "}
          <code>{"{position}"}</code>.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-around items-center bg-white p-4 rounded-lg shadow-md w-1/2 sm:w-auto h-16 m-3">
        <button
          onClick={handlePreview}
          className="bg-gray-200 px-4 py-2 rounded-lg shadow-md hover:bg-gray-300"
        >
          Preview Documents
        </button>

        <button
          onClick={handleSend}
          disabled={!recipientCount || !subject.trim() || !body.trim()}
          className={`px-4 py-2 rounded-lg shadow-md ${
            recipientCount && subject.trim() && body.trim()
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          Send to {recipientCount} recipients
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-lg">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>

            <h4 className="font-medium mb-2">{subject}</h4>
            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700 bg-gray-100 p-4 rounded-lg">
              {previewText}
            </pre>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
