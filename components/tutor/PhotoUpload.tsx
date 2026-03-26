'use client';
import { useState, useRef } from 'react';
import { Camera, Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

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
const MAX_FILES = 5;

interface FileEntry {
  file: File;
  preview: string; // data URL for images, 'doc' for documents
  name: string;
  status: 'pending' | 'processing' | 'done' | 'error';
}

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

export function PhotoUpload({ onTextExtracted, labels }: PhotoUploadProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const l = { ...defaultLabels, ...labels };

  const addFiles = async (fileList: FileList) => {
    setError('');
    const incoming = Array.from(fileList);
    const totalAfter = files.length + incoming.length;

    if (totalAfter > MAX_FILES) {
      setError(`Máximo de ${MAX_FILES} arquivos. Você tem ${files.length}, tentou adicionar ${incoming.length}.`);
      return;
    }

    const newEntries: FileEntry[] = await Promise.all(
      incoming.map(
        (file) =>
          new Promise<FileEntry>((resolve) => {
            if (isImageFile(file)) {
              const reader = new FileReader();
              reader.onload = (e) =>
                resolve({
                  file,
                  preview: e.target?.result as string,
                  name: file.name,
                  status: 'pending',
                });
              reader.readAsDataURL(file);
            } else {
              resolve({ file, preview: 'doc', name: file.name, status: 'pending' });
            }
          })
      )
    );

    setFiles((prev) => [...prev, ...newEntries]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      addFiles(fileList);
    }
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processAllFiles = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError('');

    const texts: string[] = [];

    for (let i = 0; i < files.length; i++) {
      // Mark current file as processing
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: 'processing' } : f))
      );

      try {
        const formData = new FormData();
        formData.append('image', files[i].file);

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
          texts.push(data.text);
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'done' } : f))
          );
        } else {
          setFiles((prev) =>
            prev.map((f, idx) => (idx === i ? { ...f, status: 'error' } : f))
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: 'error' } : f))
        );
      }
    }

    if (texts.length > 0) {
      const separator = texts.length > 1;
      const combined = separator
        ? texts.map((t, i) => `--- Página ${i + 1} ---\n\n${t}`).join('\n\n')
        : texts[0];
      onTextExtracted(combined);
    } else {
      setError(l.error);
    }

    setProcessing(false);
  };

  const clearAll = () => {
    setFiles([]);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (docInputRef.current) docInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const hasFiles = files.length > 0;
  const allDone = hasFiles && files.every((f) => f.status === 'done' || f.status === 'error');
  const hasPending = hasFiles && files.some((f) => f.status === 'pending');

  return (
    <div className="space-y-3">
      {/* Upload buttons — always visible when not processing */}
      {!processing && (
        <div className="flex gap-2">
          {/* Camera button (mobile) — single capture */}
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

          {/* Upload image button — multiple */}
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload document button — multiple */}
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* File previews grid */}
      {hasFiles && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {files.map((entry, index) => (
              <div
                key={`${entry.name}-${index}`}
                className="relative group rounded-xl border border-white/20 overflow-hidden bg-white/5 aspect-square flex items-center justify-center"
              >
                {entry.preview === 'doc' ? (
                  <div className="flex flex-col items-center gap-1 p-2">
                    <FileText size={24} className="text-purple-400" />
                    <span className="text-white/60 text-[10px] truncate max-w-full text-center leading-tight">
                      {entry.name}
                    </span>
                  </div>
                ) : (
                  <img
                    src={entry.preview}
                    alt={entry.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Status overlay */}
                {entry.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
                {entry.status === 'done' && (
                  <div className="absolute top-1 right-1">
                    <CheckCircle size={16} className="text-green-400 drop-shadow" />
                  </div>
                )}
                {entry.status === 'error' && (
                  <div className="absolute top-1 right-1">
                    <AlertCircle size={16} className="text-red-400 drop-shadow" />
                  </div>
                )}

                {/* Remove button — only when not processing */}
                {!processing && (
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 left-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {hasPending && !processing && (
              <button
                onClick={processAllFiles}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl transition-colors font-medium"
              >
                Ler {files.filter((f) => f.status === 'pending').length} arquivo{files.filter((f) => f.status === 'pending').length > 1 ? 's' : ''}
              </button>
            )}
            {processing && (
              <div className="flex-1 py-2 flex items-center justify-center gap-2 text-white/70 text-sm">
                <Loader2 size={14} className="animate-spin" />
                {l.processing}
              </div>
            )}
            {allDone && !processing && (
              <button
                onClick={clearAll}
                className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white/70 text-sm rounded-xl transition-colors"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-300 text-xs text-center">{error}</p>
      )}
    </div>
  );
}
