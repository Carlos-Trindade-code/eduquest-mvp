'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, BookOpen, Copy, Check, Upload, Sparkles, LogOut, Shield,
  ChevronRight, FileText, Trash2, Loader2, X,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { getSubjectById, subjects } from '@/lib/subjects/config';
import { FeedbackButton } from '@/components/feedback/FeedbackButton';

interface Classroom {
  id: string;
  name: string;
  subject: string;
  grade: string | null;
  code: string;
  created_at: string;
}

interface ClassroomMember {
  id: string;
  student_id: string;
  joined_at: string;
  profiles: { name: string; email: string } | null;
}

interface Material {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  content_text: string | null;
  created_at: string;
}

export default function ProfessorPage() {
  const { profile, loading: authLoading, signOut } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!profile) return;
    loadClassrooms();
  }, [profile]);

  useEffect(() => {
    if (!selectedClassroom) return;
    loadClassroomData(selectedClassroom.id);
  }, [selectedClassroom]);

  const loadClassrooms = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', profile.id)
      .order('created_at', { ascending: false });
    setClassrooms((data || []) as Classroom[]);
    if (data && data.length > 0 && !selectedClassroom) setSelectedClassroom(data[0] as Classroom);
    setLoading(false);
  };

  const loadClassroomData = async (classroomId: string) => {
    const [membersRes, materialsRes] = await Promise.all([
      supabase.from('classroom_members').select('*, profiles(name, email)').eq('classroom_id', classroomId),
      supabase.from('classroom_materials').select('*').eq('classroom_id', classroomId).order('created_at', { ascending: false }),
    ]);
    setMembers((membersRes.data || []) as ClassroomMember[]);
    setMaterials((materialsRes.data || []) as Material[]);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-app">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={20} />
            <span className="text-white font-bold text-lg">Studdo</span>
            <span className="text-white/30 text-sm ml-1">/ Professor</span>
          </div>
          <div className="flex items-center gap-2">
            {profile?.email === 'carlostrindade@me.com' && (
              <Link href="/admin" className="px-3 py-1.5 rounded-lg text-sm text-purple-400 hover:bg-purple-500/10 transition-colors">
                <Shield size={14} />
              </Link>
            )}
            <span className="text-white/40 text-sm hidden sm:inline">{profile?.name}</span>
            <button onClick={handleSignOut} className="px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/10">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-bold">Minhas Turmas</h1>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            Nova turma
          </motion.button>
        </div>

        {classrooms.length === 0 ? (
          <EmptyState onCreateClick={() => setShowCreateModal(true)} />
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar: classroom list */}
            <div className="space-y-2">
              {classrooms.map((c) => {
                const sub = getSubjectById(c.subject);
                const isSelected = selectedClassroom?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClassroom(c)}
                    className={`w-full text-left rounded-xl p-3.5 transition-all ${isSelected ? 'ring-1 ring-purple-500/50' : ''}`}
                    style={{
                      background: isSelected ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub?.icon || '📚'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        <p className="text-white/30 text-xs">{sub?.name || c.subject} · {c.code}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main: classroom detail */}
            {selectedClassroom && (
              <div className="space-y-6">
                <ClassroomHeader classroom={selectedClassroom} memberCount={members.length} />

                {/* Materials */}
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <FileText size={16} className="text-purple-400" />
                      Materiais ({materials.length})
                    </h3>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 transition-colors"
                    >
                      <Upload size={12} />
                      Enviar material
                    </button>
                  </div>
                  {materials.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">
                      Nenhum material ainda. Envie PDFs, imagens ou textos.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {materials.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <FileText size={16} className="text-white/30 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{m.title}</p>
                            {m.description && <p className="text-white/30 text-xs truncate">{m.description}</p>}
                          </div>
                          <span className="text-white/20 text-xs shrink-0">
                            {new Date(m.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Students */}
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-4">
                    <Users size={16} className="text-blue-400" />
                    Alunos ({members.length})
                  </h3>
                  {members.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8">
                      Nenhum aluno ainda. Compartilhe o codigo da turma.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(m.profiles?.name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{m.profiles?.name || 'Aluno'}</p>
                            <p className="text-white/30 text-xs truncate">{m.profiles?.email || ''}</p>
                          </div>
                          <span className="text-white/20 text-xs shrink-0">
                            {new Date(m.joined_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Classroom Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateClassroomModal
            profileId={profile?.id || ''}
            onCreated={() => { setShowCreateModal(false); loadClassrooms(); }}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Upload Material Modal */}
      <AnimatePresence>
        {showUploadModal && selectedClassroom && (
          <UploadMaterialModal
            classroomId={selectedClassroom.id}
            onUploaded={() => { setShowUploadModal(false); loadClassroomData(selectedClassroom.id); }}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </AnimatePresence>

      <FeedbackButton />
    </div>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-5xl mb-4">🏫</div>
      <h2 className="text-white text-xl font-bold mb-2">Crie sua primeira turma</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(240,244,248,0.5)' }}>
        Adicione materiais e compartilhe o codigo com seus alunos
      </p>
      <motion.button
        onClick={onCreateClick}
        className="px-6 py-3 rounded-xl font-bold text-sm bg-purple-600 text-white"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={16} className="inline mr-2" />
        Criar turma
      </motion.button>
    </div>
  );
}

function ClassroomHeader({ classroom, memberCount }: { classroom: Classroom; memberCount: number }) {
  const [copied, setCopied] = useState(false);
  const sub = getSubjectById(classroom.subject);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(classroom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${sub?.color || '#8B5CF6'}15` }}>
            {sub?.icon || '📚'}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{classroom.name}</h2>
            <p className="text-white/40 text-xs">{sub?.name || classroom.subject} · {memberCount} aluno{memberCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl px-4 py-2 text-center" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <p className="text-white/40 text-[10px] uppercase tracking-wider">Codigo</p>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-sm tracking-widest">{classroom.code}</span>
              <button onClick={handleCopy} className="text-white/30 hover:text-white transition-colors">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateClassroomModal({ profileId, onCreated, onClose }: { profileId: string; onCreated: () => void; onClose: () => void }) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('math');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    const supabase = createClient();
    const { data: code } = await supabase.rpc('generate_classroom_code');
    await supabase.from('classrooms').insert({
      teacher_id: profileId,
      name: name.trim(),
      subject,
      code,
    });
    setCreating(false);
    onCreated();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0F1D2E', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Nova turma</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Nome da turma</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: 5o Ano A - Matematica"
              className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Materia principal</label>
            <div className="grid grid-cols-4 gap-2">
              {subjects.filter(s => s.id !== 'other').map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubject(s.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all ${
                    subject === s.id ? 'ring-1 ring-purple-500' : ''
                  }`}
                  style={{
                    background: subject === s.id ? `${s.color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${subject === s.id ? `${s.color}30` : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-white/60 truncate w-full text-center" style={{ fontSize: 10 }}>{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 text-white disabled:opacity-30 flex items-center justify-center gap-2"
            whileHover={name.trim() ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {creating ? 'Criando...' : 'Criar turma'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UploadMaterialModal({ classroomId, onUploaded, onClose }: { classroomId: string; onUploaded: () => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentText, setContentText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!title.trim()) return;
    setUploading(true);

    const supabase = createClient();
    let fileUrl = null;
    let fileType = null;
    let extractedText = contentText;

    // Upload file if provided
    if (file) {
      fileType = file.type;
      const ext = file.name.split('.').pop();
      const path = `materials/${classroomId}/${Date.now()}.${ext}`;
      const { data: uploadData } = await supabase.storage.from('materials').upload(path, file);
      if (uploadData) {
        const { data: urlData } = supabase.storage.from('materials').getPublicUrl(path);
        fileUrl = urlData.publicUrl;
      }

      // OCR for images
      if (file.type.startsWith('image/') && !contentText) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/ocr', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.text) extractedText = data.text;
        } catch { /* non-critical */ }
      }
    }

    await supabase.from('classroom_materials').insert({
      classroom_id: classroomId,
      title: title.trim(),
      description: description.trim() || null,
      file_url: fileUrl,
      file_type: fileType,
      content_text: extractedText || null,
    });

    setUploading(false);
    onUploaded();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#0F1D2E', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">Enviar material</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Titulo *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lista de exercicios - Cap. 5"
              className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Descricao</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instrucoes para o aluno (opcional)"
              className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Arquivo (PDF ou imagem)</label>
            <label
              className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/30 cursor-pointer transition-colors"
            >
              <Upload size={16} className="text-white/30" />
              <span className="text-white/40 text-sm">{file ? file.name : 'Clique para selecionar'}</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Ou cole o texto aqui</label>
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Cole o conteudo da tarefa, exercicio ou texto de estudo..."
              rows={4}
              className="w-full bg-white/5 text-white placeholder-white/25 rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-purple-500/50 text-sm resize-none"
            />
          </div>

          <motion.button
            onClick={handleUpload}
            disabled={!title.trim() || uploading}
            className="w-full py-3 rounded-xl font-bold text-sm bg-purple-600 text-white disabled:opacity-30 flex items-center justify-center gap-2"
            whileHover={title.trim() ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Enviando...' : 'Enviar material'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
