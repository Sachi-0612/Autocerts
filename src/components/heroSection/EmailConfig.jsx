import { useState, useMemo } from "react";
import { sendBulkEmails } from "../../services/emailService";
import { useData } from "../../contexts/DataContext";

export default function EmailConfig() {
  const { recipients, certificates, emailSubject, setEmailSubject, emailBody, setEmailBody } = useData();
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  const recipientCount = recipients.length;

  const MAX_SUBJECT = 120;
  const MAX_BODY = 5000;

  const validate = () => {
    const e = {};
    if (!emailSubject.trim()) e.subject = "Subject is required";
    if (!emailBody.trim()) e.body = "Email body is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const previewText = useMemo(() => {
    return emailBody
      .replaceAll("{name}", "John Doe")
      .replaceAll("{email}", "john@example.com")
      .replaceAll("{position}", "Developer");
  }, [emailBody]);

  const handlePreview = () => {
    if (!validate()) return;
    setShowPreview(true);
  };

  const handleSend = async () => {
    if (!validate()) return;

    if (recipients.length === 0) {
      setErrors({ general: "No recipients found" });
      return;
    }

    setIsSending(true);
    setSendResults(null);
    setErrors({});

    try {
      const results = await sendBulkEmails(recipients, emailSubject, emailBody, certificates);
      setSendResults(results);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        alert(`Emails sent successfully! ${successCount} sent, ${failureCount} failed.`);
      } else {
        alert("Failed to send any emails. Please check your EmailJS configuration.");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      setErrors({ general: "Failed to send emails. Please try again." });
    } finally {
      setIsSending(false);
    }
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
            value={emailSubject}
            maxLength={MAX_SUBJECT}
            onChange={(e) => setEmailSubject(e.target.value)}
            aria-invalid={!!errors.subject}
            className="border-none p-3 w-full my-1 bg-gray-200 rounded-lg font-mono"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{errors.subject}</span>
            <span>{emailSubject.length}/{MAX_SUBJECT}</span>
          </div>
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="font-medium">
            Email Body
          </label>
          <textarea
            id="body"
            value={emailBody}
            maxLength={MAX_BODY}
            onChange={(e) => setEmailBody(e.target.value)}
            aria-invalid={!!errors.body}
            className="p-3 w-full mt-1 h-44 bg-gray-200 border-none rounded-lg resize-y font-mono"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{errors.body}</span>
            <span>{emailBody.length}/{MAX_BODY}</span>
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
          disabled={isSending || !recipientCount || !emailSubject.trim() || !emailBody.trim()}
          className={`px-4 py-2 rounded-lg shadow-md ${
            recipientCount && emailSubject.trim() && emailBody.trim() && !isSending
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSending ? "Sending..." : `Send to ${recipientCount} recipients`}
        </button>
      </div>

      {/* Send Results */}
      {sendResults && (
        <div className="bg-white p-4 rounded-lg shadow-md w-1/2 sm:w-auto m-3">
          <h3 className="font-medium text-lg mb-3">Send Results</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sendResults.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm ${
                  result.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <div className="font-medium">{result.email}</div>
                <div className="text-xs">
                  {result.success ? "✓ Sent successfully" : `✗ Failed: ${result.error}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md m-3">
          {errors.general}
        </div>
      )}
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

            <h4 className="font-medium mb-2">{emailSubject}</h4>
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
