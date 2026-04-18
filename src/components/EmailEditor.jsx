import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useData } from '../contexts/DataContext';
import { sendBulkEmails } from '../services/emailService';

export default function EmailEditor() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // 'generate', 'generate-send', 'send-only'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  
  const { 
    recipients, 
    certificates, 
    setCertificates,
    emailSubject, 
    setEmailSubject,
    emailBody, 
    setEmailBody,
    templateFile,
    templatePreview,
    templateWidth,
    templateHeight,
    textElements,
    excelData
  } = useData();

  const generateCertificates = async () => {
    if (!templateFile || textElements.length === 0 || recipients.length === 0) {
      alert('Missing template, text elements, or recipient data');
      return;
    }

    setProgress('Generating certificates...');
    setIsProcessing(true);

    try {
      // Load fonts if needed
      const fontsToLoad = [...new Set(textElements.map(el => el.fontFamily))];
      for (const font of fontsToLoad) {
        if (font !== 'Arial' && font !== 'Times New Roman' && font !== 'Georgia' && font !== 'Courier New' && font !== 'Verdana') {
          // Load Google Font
          const formattedName = font.replace(/ /g, '+');
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${formattedName}:wght@400;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
          await document.fonts.load(`16px "${font}"`);
        }
      }

      const zip = new JSZip();
      const baseImg = new Image();
      baseImg.src = templatePreview;

      await new Promise((res) => (baseImg.onload = res));

      const generatedCertificates = [];

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        setProgress(`Generating certificate ${i + 1} of ${recipients.length}...`);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = templateWidth;
        canvas.height = templateHeight;

        ctx.drawImage(baseImg, 0, 0, templateWidth, templateHeight);

        // Draw each text element with recipient data
        for (const element of textElements) {
          if (!element.columnName) continue;

          const value = String(recipient[element.columnName] || '');
          
          ctx.font = `${element.isItalic ? 'italic ' : ''}${element.isBold ? 'bold ' : ''}${element.fontSize}px "${element.fontFamily}"`;
          ctx.fillStyle = element.fontColor;
          ctx.textAlign = element.textAlign;
          ctx.textBaseline = 'middle';

          ctx.fillText(value, element.x, element.y);
        }

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, 'image/png')
        );

        const safeName = String(recipient.name || recipient.Name || `Certificate_${i + 1}`).replace(/[^\w\s]/gi, '');
        zip.file(`${safeName}.png`, blob);

        generatedCertificates.push({
          name: safeName,
          blob: blob,
          filename: `${safeName}.png`,
          recipient: recipient,
          recipientIndex: i
        });
      }

      setCertificates(generatedCertificates);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'certificates.zip');

      setProgress('Certificates generated and downloaded successfully!');
      
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate certificates: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendEmails = async () => {
    if (certificates.length === 0) {
      alert('No certificates available. Please generate certificates first.');
      return;
    }

    setProgress('Sending emails...');
    setIsProcessing(true);

    try {
      // For now, we'll send emails without attachments since Firebase Functions
      // doesn't handle file uploads easily. In a production app, you'd upload
      // certificates to cloud storage and include download links.
      
      const results = await sendBulkEmails(
        recipients.map(recipient => ({
          ...recipient,
          email: recipient.email,
          name: recipient.name || recipient.Name || 'Recipient'
        })),
        emailSubject,
        emailBody
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      setProgress(`Emails sent! ${successCount} successful, ${failCount} failed.`);
      
      if (failCount > 0) {
        console.log('Failed emails:', results.filter(r => !r.success));
      }

    } catch (error) {
      console.error('Email sending failed:', error);
      alert('Failed to send emails: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAction = async () => {
    if (mode === 'generate') {
      await generateCertificates();
    } else if (mode === 'generate-send') {
      await generateCertificates();
      if (certificates.length > 0) {
        await sendEmails();
      }
    } else if (mode === 'send-only') {
      await sendEmails();
    }
  };

  if (mode === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Certificate Options</h2>
          <p className="mb-6 text-slate-600">Choose how you want to process your certificates:</p>

          <div className="space-y-3">
            <button
              onClick={() => setMode('generate')}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
            >
              Generate Only
            </button>
            <button
              onClick={() => setMode('generate-send')}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
            >
              Generate and Send
            </button>
            <button
              onClick={() => setMode('send-only')}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
            >
              Send Only
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2 text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'generate') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="max-w-lg w-full rounded-3xl bg-white p-8 shadow-2xl">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            {isProcessing ? 'Generating Certificates' : 'Generate Certificates'}
          </h2>
          <div className="mb-6 rounded-lg bg-slate-100 p-4">
            <p className="text-slate-600">
              {isProcessing ? progress : `Ready to generate ${recipients.length} certificates.`}
            </p>
          </div>
          {!isProcessing && (
            <div className="flex gap-4">
              <button
                onClick={() => setMode(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={generateCertificates}
                className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
              >
                Generate
              </button>
            </div>
          )}
          {isProcessing && (
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {mode === 'send-only' ? 'Email Template' : 'Email Configuration'}
          </h1>
          <p className="mt-2 text-slate-600">
            {mode === 'send-only'
              ? 'Customize the email that will be sent to recipients'
              : 'Customize the email to be sent with the certificates'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          {isProcessing && (
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <p className="text-blue-600 font-medium">{progress}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Email Subject
            </label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Your Certificate"
              className="w-full rounded-lg border border-slate-200 px-4 py-2"
            />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Email Body
            </label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-slate-200 px-4 py-3 font-mono text-sm"
              placeholder="Enter email body..."
            />
            <p className="mt-2 text-xs text-slate-500">
              Use {'{name}'} to insert recipient names, {'{email}'} for emails, etc.
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-yellow-50 p-4">
            <h3 className="mb-2 font-semibold text-slate-900">Preview</h3>
            <div className="whitespace-pre-wrap rounded bg-white p-3 font-mono text-sm text-slate-600">
              {emailBody}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={isProcessing}
              className="flex-1 rounded-xl bg-yellow-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-yellow-500 active:bg-yellow-600 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : (mode === 'send-only' ? 'Send Emails' : 'Generate and Send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
