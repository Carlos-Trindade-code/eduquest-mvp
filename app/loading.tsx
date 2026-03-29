export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1E1046 0%, #3B0764 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}
