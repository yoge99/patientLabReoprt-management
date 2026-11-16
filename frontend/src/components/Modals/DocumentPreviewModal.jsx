import { X, Download, ExternalLink, FileText } from "lucide-react";
import { API_BASE_URL } from "../../constants/config";

export default function DocumentPreviewModal({ isOpen, onClose, filePath, title }) {
  if (!isOpen || !filePath) return null;

  const fileUrl = filePath.startsWith("http") ? filePath : `${API_BASE_URL}/${filePath}`;
  const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filePath);
  const isPdf = /\.pdf$/i.test(filePath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {title || "Attached Lab Document"}
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate max-w-md">{filePath}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200/60 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Tab
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/50 flex items-center justify-center min-h-[400px]">
          {isImage ? (
            <img
              src={fileUrl}
              alt="Lab document attachment"
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-sm"
            />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title="PDF Report Viewer"
              className="w-full h-[75vh] rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-medium mb-1">Preview not available for this file type</p>
              <p className="text-xs text-slate-500 mb-4">You can download or open the file in a new tab</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
