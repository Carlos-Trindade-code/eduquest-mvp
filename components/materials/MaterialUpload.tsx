'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { MascotOwl } from '@/components/illustrations/MascotOwl';
import { subjects } from '@/lib/subjects/config';
import { useAgeTheme } from '@/components/providers/AgeThemeProvider';
import { getFileIcon, formatFileSize } from '@/lib/storage/materials';
import type { Material } from '@/lib/auth/types';

const IMAGE_ACCEPT = 'image/*';
const DOC_ACCEPT = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_FILES = 5;

interface FileEntry {
  file: File;
  preview: string;
  name: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

interface MaterialUploadProps {
  onUploaded?: (material: Material) => void;
  kidId?: string | null;
  ownerType?: 'kid' | 'parent';
  compact?: boolean;
}

export function MaterialUpload({ onUploaded, kidId, ownerType = 'kid', compact = false }: MaterialUploadProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [subject, setSubject] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { tokens } = useAgeTheme();
  const isYoungKid = tokens.animationIntensity === 'high';

  const addFiles = useCallback(async (fileList: FileList) => {
    setError('');
    const incoming = Array.from(fileList);
    const totalAfter = files.length + incoming.length;

    if (totalAfter > MAX_FILES) {
      setError(`Maximo ${MAX_FILES} arquivos`);
      return;
    }

    const newEntries: FileEntry[] = await Promise.all(
      incoming.map(
        (file) =>
          new Promise<FileEntry>((resolve) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) =>
                resolve({ file, preview: e.target?.result as string, name: file.name, status: 'pending' });
              reader.readAsDataURL(file);
            } else {
              resolve({ file, preview: 'doc', name: file.name, status: 'pending' });
            }
          })
      )
    );

    setFiles((prev) => [...prev, ...newEntries]);
    if (!title && incoming.length === 1) {
      setTitle(incoming[0].name.replace(/\.[^.]+$/, ''));
    }
  }, [files.length, title]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadAll = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');

    for (let i = 0; i < files.length; i++) {
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));

      try {
        const formData = new FormData();
        formData.append('file', files[i].file);
        formData.append('title', files.length === 1 ? (title || files[i].name) : files[i].name);
        formData.append('owner_type', ownerType);
        if (subject) formData.append('subject', subject);
        if (kidId) formData.append('kid_id', kidId);

        const res = await fetch('/api/materials', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Falha no upload');
        }

        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
        if (data.material && onUploaded) {
          onUploaded(data.material);
        }
      } catch {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }

    setUploading(false);
  };

  const clearAll = () => {
    setFiles([]);
    setError('');
    setTitle('');
    setSubject(null);
  };

  const hasFiles = files.length > 0;
  const allDone = hasFiles && files.every((f) => f.status === 'done' || f.status === 'error');
  const hasPending = hasFiles && files.some((f) => f.status === 'pending');

  // Compact mode for inline use
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all text-sm"
          >
            <Plus size={16} />
            Adicionar material
          </button>
          <input ref={fileInputRef} type="file" accept={`${IMAGE_ACCEPT},${DOC_ACCEPT}`} multiple onChange={handleFileChange} className="hidden" />
        </div>
        {hasFiles && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {files.map((entry, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg text-xs text-white/70">
                  {getFileIcon(entry.file.type)} {entry.name.slice(0, 20)}
                  {entry.status === 'uploading' && <Loader2 size={12} className="animate-spin" />}
                  {entry.status === 'done' && <CheckCircle size={12} className="text-green-400" />}
                  {!uploading && <button aria-label="Remover arquivo" onClick={() => removeFile(i)}><X size={12} /></button>}
                </span>
              ))}
            </div>
            {hasPending && !uploading && (
              <button onClick={uploadAll} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl font-medium transition-colors">
                Salvar {files.filter(f => f.status === 'pending').length} arquivo(s)
              </button>
            )}
            {allDone && (
              <button onClick={clearAll} className="w-full py-2 bg-white/10 hover:bg-white/15 text-white/70 text-sm rounded-xl transition-colors">
                Limpar
              </button>
            )}
          </div>
        )}
        {error && <p className="text-red-300 text-xs text-center">{error}</p>}
      </div>
    );
  }

  // Full mode with drag-and-drop
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all ${
          dragOver
            ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
            : 'border-white/20 bg-white/[0.03] hover:border-white/30'
        } ${isYoungKid ? 'p-8' : 'p-6'}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {isYoungKid && (
            <MascotOwl
              expression={dragOver ? 'celebrating' : hasFiles ? 'reading' : 'encouraging'}
              size="md"
              animated
            />
          )}
          <div className={`${isYoungKid ? 'text-lg' : 'text-sm'} text-white/70`}>
            {dragOver ? (
              <span className="text-purple-300 font-bold">Solte aqui!</span>
            ) : (
              <>Arraste arquivos aqui ou</>
            )}
          </div>

          {!dragOver && (
            <div className={`flex gap-2 ${isYoungKid ? 'flex-col w-full' : ''}`}>
              <button
                onClick={() => cameraInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all ${
                  isYoungKid ? 'py-4 text-base font-bold' : 'py-2.5 px-4 text-sm flex-1'
                }`}
              >
                <Camera size={isYoungKid ? 24 : 18} />
                {isYoungKid ? '📸 Tirar foto' : 'Foto'}
              </button>
              <input ref={cameraInputRef} type="file" accept={IMAGE_ACCEPT} capture="environment" onChange={handleFileChange} className="hidden" />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all ${
                  isYoungKid ? 'py-4 text-base font-bold' : 'py-2.5 px-4 text-sm flex-1'
                }`}
              >
                <Upload size={isYoungKid ? 24 : 18} />
                {isYoungKid ? '🖼️ Imagem' : 'Imagem'}
              </button>
              <input ref={fileInputRef} type="file" accept={`${IMAGE_ACCEPT},.pdf`} multiple onChange={handleFileChange} className="hidden" />

              <button
                onClick={() => docInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl border border-dashed border-white/20 hover:border-purple-400 transition-all ${
                  isYoungKid ? 'py-4 text-base font-bold' : 'py-2.5 px-4 text-sm flex-1'
                }`}
              >
                <FileText size={isYoungKid ? 24 : 18} />
                {isYoungKid ? '📄 Documento' : 'Documento'}
              </button>
              <input ref={docInputRef} type="file" accept={DOC_ACCEPT} multiple onChange={handleFileChange} className="hidden" />
            </div>
          )}
        </div>
      </div>

      {/* File previews */}
      <AnimatePresence>
        {hasFiles && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {/* Title */}
            {files.length === 1 && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome do material..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-400"
              />
            )}

            {/* Subject pills */}
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(subject === s.id ? null : s.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    subject === s.id
                      ? 'text-white shadow-sm'
                      : 'bg-white/5 text-white/50 hover:text-white/70'
                  }`}
                  style={subject === s.id ? { backgroundColor: s.color } : undefined}
                >
                  {s.icon} {s.name}
                </button>
              ))}
            </div>

            {/* Preview grid */}
            <div className={`grid gap-2 ${isYoungKid ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-5'}`}>
              {files.map((entry, index) => (
                <motion.div
                  key={`${entry.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group rounded-xl border border-white/20 overflow-hidden bg-white/5 aspect-square flex items-center justify-center"
                >
                  {entry.preview === 'doc' ? (
                    <div className="flex flex-col items-center gap-1 p-2">
                      <span className={isYoungKid ? 'text-3xl' : 'text-2xl'}>{getFileIcon(entry.file.type)}</span>
                      <span className="text-white/60 text-[10px] truncate max-w-full text-center leading-tight">
                        {entry.name}
                      </span>
                      <span className="text-white/30 text-[9px]">{formatFileSize(entry.file.size)}</span>
                    </div>
                  ) : (
                    <img src={entry.preview} alt={entry.name} className="w-full h-full object-cover" />
                  )}

                  {entry.status === 'uploading' && (
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

                  {!uploading && (
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 left-1 bg-black/60 text-white rounded-full p-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {hasPending && !uploading && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={uploadAll}
                  className={`flex-1 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors ${
                    isYoungKid ? 'py-3 text-base' : 'py-2 text-sm'
                  }`}
                >
                  {isYoungKid ? '✨ Salvar materiais!' : `Salvar ${files.filter(f => f.status === 'pending').length} arquivo(s)`}
                </motion.button>
              )}
              {uploading && (
                <div className="flex-1 py-2 flex items-center justify-center gap-2 text-white/70 text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  Salvando...
                </div>
              )}
              {allDone && !uploading && (
                <button
                  onClick={clearAll}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/15 text-white/70 text-sm rounded-xl transition-colors"
                >
                  {isYoungKid ? '🧹 Limpar' : 'Limpar'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-red-300 text-xs text-center">{error}</p>}
    </motion.div>
  );
}
