'use client';
import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

interface PhotoUploadProps {
  onTextExtracted: (text: string) => void;
  labels?: {
    title: string;
    cameraButton: string;
    uploadButton: string;
    processing: string;
    error: string;
  };
}

const defaultLabels = {
  title: 'Tire uma foto do dever',
  cameraButton: 'Usar câmera',
  uploadButton: 'Enviar foto',
  processing: 'Lendo o exercício...',
  error: 'Não consegui ler. Tenta de novo!',
};

export function PhotoUpload({ onTextExtracted, labels }: PhotoUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const l = { ...defaultLabels, ...labels };

  const processImage = async (file: File) => {
    setError('');
    setLoading(true);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('OCR failed');

      const data = await res.json();
      if (data.text) {
        onTextExtracted(data.text);
      } else {
        setError(l.error);
      }
    } catch {
      setError(l.error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview do dever"
            className="w-full max-h-48 object-contain rounded-xl border border-white/20"
          />
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
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload button */}
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
            accept="image/*,.pdf"
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
