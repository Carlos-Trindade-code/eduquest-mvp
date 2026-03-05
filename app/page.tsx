'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Clock, BookOpen, Sparkles, RotateCcw } from 'lucide-react';

export default function Home() {
  const [homework, setHomework] = useState('');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const [messages, setMessages] = useState<{role:string;content:string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      alert('Pausa! Voce estudou 25 minutos. Descanse 5 minutinhos!');
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startSession = () => {
    if (!homework.trim()) return;
    setHomeworkSet(true);
    setMessages([{
      role: 'assistant',
      content: 'Oi! Vamos resolver esse dever juntos!\n\nLi sua tarefa: "' + homework + '"\n\nMe conta: por onde voce acha que devemos comecar?'
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, homework }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ops! Problema tecnico. Tenta de novo!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-black/20 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={22} />
          <span className="text-white font-bold text-xl">EduQuest</span>
          <span className="text-white/30 text-xs ml-1">MVP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={"flex items-center gap-2 px-3 py-2 rounded-full font-mono font-bold text-base " + (timer < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white')}>
            <Clock size={15} />
            {formatTimer(timer)}
          </div>
          <button onClick={() => setTimerActive(a => !a)}
            className={"px-3 py-2 rounded-full text-xs font-semibold transition " + (timerActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')}>
            {timerActive ? 'Pausar' : 'Iniciar'}
          </button>
          <button onClick={() => { setTimer(25 * 60); setTimerActive(false); }}
            className="text-white/40 hover:text-white transition p-2">
            <RotateCcw size={14} />
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-5 overflow-hidden">
        {!homeworkSet ? (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mt-6">
cat > app/page.tsx << 'ENDOFFILE'
'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Clock, BookOpen, Sparkles, RotateCcw } from 'lucide-react';

export default function Home() {
  const [homework, setHomework] = useState('');
  const [homeworkSet, setHomeworkSet] = useState(false);
  const [messages, setMessages] = useState<{role:string;content:string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      alert('Pausa! Voce estudou 25 minutos. Descanse 5 minutinhos!');
      setTimer(25 * 60);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startSession = () => {
    if (!homework.trim()) return;
    setHomeworkSet(true);
    setMessages([{
      role: 'assistant',
      content: 'Oi! Vamos resolver esse dever juntos!\n\nLi sua tarefa: "' + homework + '"\n\nMe conta: por onde voce acha que devemos comecar?'
    }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, homework }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Ops! Problema tecnico. Tenta de novo!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-black/20 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={22} />
          <span className="text-white font-bold text-xl">EduQuest</span>
          <span className="text-white/30 text-xs ml-1">MVP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={"flex items-center gap-2 px-3 py-2 rounded-full font-mono font-bold text-base " + (timer < 300 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-white')}>
            <Clock size={15} />
            {formatTimer(timer)}
          </div>
          <button onClick={() => setTimerActive(a => !a)}
            className={"px-3 py-2 rounded-full text-xs font-semibold transition " + (timerActive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white')}>
            {timerActive ? 'Pausar' : 'Iniciar'}
          </button>
          <button onClick={() => { setTimer(25 * 60); setTimerActive(false); }}
            className="text-white/40 hover:text-white transition p-2">
            <RotateCcw size={14} />
          </button>
        </div>
      </header>
      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-5 overflow-hidden">
        {!homeworkSet ? (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mt-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">📚</div>
              <h1 className="text-white text-2xl font-bold mb-2">Qual e o seu dever?</h1>
              <p className="text-indigo-200 text-sm">Cole a questao ou descreva o que precisa resolver</p>
            </div>
            <textarea
              value={homework}
              onChange={e => setHomework(e.target.value)}
              placeholder="Ex: Quais foram as causas da Revolucao Francesa?"
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 min-h-36 resize-none border border-white/20 focus:outline-none focus:border-purple-400 text-sm leading-relaxed"
            />
            <button onClick={startSession} disabled={!homework.trim()}
              className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
              Comecar com o Tutor IA
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 bg-white/10 rounded-xl p-3 mb-3 shrink-0">
              <BookOpen size={15} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-indigo-200 text-xs flex-1 line-clamp-1">{homework}</p>
              <button onClick={() => { setHomeworkSet(false); setMessages([]); }}
                className="text-white/30 hover:text-white text-xs shrink-0 transition">trocar</button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
              {messages.map((msg, i) => (
                <div key={i} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
                  )}
                  <div className={"max-w-[82%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed " + (msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-sm' : 'bg-white/15 text-white rounded-bl-sm')}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-sm shrink-0">🤖</div>
                  <div className="bg-white/15 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 150, 300].map(d => (
                        <div key={d} className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: d + 'ms' }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 mt-3 shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua resposta..."
                className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 border border-white/20 focus:outline-none focus:border-purple-400 text-sm"
              />
              <button onClick={sendMessage} disabled={loading || !input.trim()}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl px-4 transition">
                <Send size={18} />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
