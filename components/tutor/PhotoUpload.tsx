'use client';
import { useState, useRef } from 'react';
import { Camera, Upload, FileText, X, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  onTextExtracted: (text: string) => void;
  labels?: {
    title: string;
    cameraButton: string;
    uploadButton: string;
    fileButton: string;
    processing: string;
    error: string;
  };
}

const defaultLabels = {
  title: 'Tire uma foto do dever',
  cameraButton: 'Tirar foto',
  uploadButton: 'Enviar foto',
  fileButton: 'Enviar arquivo',
  processing: 'Lendo o exercício...',
  error: 'Não consegui ler. Tenta de novo!',
};

const IMAGE_ACCEPT = 'image/*';
const DOC_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

export function PhotoUpload({ onTextExtracted, labels }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const l = { ...defaultLabels, ...labels };

  const processFile = async (file: File) => {
    setError('');
    setLoading(true);
    setFileName(file.name);

    // Show preview for images; for docs show file name
    if (isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      // Non-image: show file icon + name
      setPreview('doc');
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Falha ao processar arquivo');
      }

      const data = await res.json();
      if (data.text) {
        onTextExtracted(data.text);
      } else {
        setError(l.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : l.error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setFileName(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (docInputRef.current) docInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          {preview === 'doc' ? (
            /* Document preview (PDF/DOCX) */
            <div className="w-full py-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5">
              <FileText size={32} className="text-purple-400" />
              <span className="text-white/70 text-sm truncate max-w-[80%]">{fileName}</span>
            </div>
          ) : (
            /* Image preview */
            <img
              src={preview}
              alt="Preview do dever"
              className="w-full max-h-48 object-contain rounded-xl border border-white/20"
            />
          )}
          {!loading && (
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="flex items-center gap-2 text-white text-sm">
                <Loader2 size={16} className="animate-spin" />
                {l.processing}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Camera button (mobile) */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all text-sm"
          >
            <Camera size={18} />
            {l.cameraButton}
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload image button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all text-sm"
          >
            <Upload size={18} />
            {l.uploadButton}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={`${IMAGE_ACCEPT},.pdf`}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload document button (PDF/DOCX) */}
          <button
            onClick={() => docInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all text-sm"
          >
            <FileText size={18} />
            {l.fileButton}
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept={DOC_ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-red-300 text-xs text-center">{error}</p>
      )}
    </div>
  );
}
