'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, ArrowLeft, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeInUp } from '@/lib/design/animations';
import type { ExamData } from './ExamGenerator';

interface ExamPreviewProps {
  exam: ExamData;
  onBack: () => void;
}

export function ExamPreview({ exam, onBack }: ExamPreviewProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = (withAnswers: boolean) => {
    const printContent = buildPrintHTML(exam, withAnswers);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toolbar */}
      <motion.div
        className="flex flex-wrap items-center gap-3 mb-6"
        variants={fadeInUp('high')}
        initial="hidden"
        animate="visible"
      >
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft size={16} />
          Voltar
        </Button>
        <div className="flex-1" />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAnswers(!showAnswers)}
          className="gap-1.5"
        >
          {showAnswers ? <EyeOff size={16} /> : <Eye size={16} />}
          {showAnswers ? 'Ocultar Gabarito' : 'Ver Gabarito'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePrint(false)}
          className="gap-1.5"
        >
          <Printer size={16} />
          Imprimir Prova
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => handlePrint(true)}
          className="gap-1.5"
        >
          <FileText size={16} />
          Imprimir com Gabarito
        </Button>
      </motion.div>

      {/* Preview */}
      <motion.div
        ref={printRef}
        className="glass rounded-[var(--eq-radius-lg)] p-6 sm:p-8"
        variants={fadeInUp('medium')}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-8 pb-6 border-b border-[var(--eq-surface-border)]">
          <h1 className="text-[var(--eq-text)] text-xl sm:text-2xl font-bold mb-1">
            {exam.title}
          </h1>
          <p className="text-[var(--eq-text-secondary)] text-sm">
            {exam.subject} — {exam.questions.length} questões
          </p>
        </div>

        {/* Instructions */}
        {exam.instructions && (
          <div className="mb-6 bg-[var(--eq-surface)]/50 rounded-[var(--eq-radius-sm)] p-4 border border-[var(--eq-surface-border)]">
            <p className="text-[var(--eq-text-secondary)] text-sm italic">
              {exam.instructions}
            </p>
          </div>
        )}

        {/* Student info line */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 border-b border-[var(--eq-surface-border)] pb-1">
            <span className="text-[var(--eq-text-secondary)] text-sm">Nome: </span>
          </div>
          <div className="w-32 border-b border-[var(--eq-surface-border)] pb-1">
            <span className="text-[var(--eq-text-secondary)] text-sm">Data: </span>
          </div>
          <div className="w-24 border-b border-[var(--eq-surface-border)] pb-1">
            <span className="text-[var(--eq-text-secondary)] text-sm">Nota: </span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {exam.questions.map((q, i) => (
            <motion.div
              key={i}
              className="pb-5 border-b border-[var(--eq-surface-border)] last:border-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="text-[var(--eq-text)] text-sm font-medium mb-3 whitespace-pre-wrap">
                <span className="text-[var(--eq-primary)] font-bold mr-1">
                  {q.number}.
                </span>
                {q.text}
              </p>

              {/* Options for multiple choice */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-1.5 ml-4">
                  {q.options.map((opt, j) => (
                    <p
                      key={j}
                      className={`text-sm py-1 px-2 rounded ${
                        showAnswers && opt.startsWith(q.correctAnswer)
                          ? 'text-green-300 bg-green-500/10 font-medium'
                          : 'text-[var(--eq-text-secondary)]'
                      }`}
                    >
                      {opt}
                    </p>
                  ))}
                </div>
              )}

              {/* Essay answer space */}
              {q.type === 'essay' && !showAnswers && (
                <div className="ml-4 mt-2 border border-dashed border-[var(--eq-surface-border)] rounded-[var(--eq-radius-sm)] p-4 min-h-20">
                  <p className="text-[var(--eq-text-muted)] text-xs italic">
                    Espaço para resposta
                  </p>
                </div>
              )}

              {/* Answer key */}
              {showAnswers && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 ml-4 bg-green-500/10 border border-green-500/20 rounded-[var(--eq-radius-sm)] p-3"
                >
                  <p className="text-green-300 text-xs font-bold mb-1">
                    Resposta: {q.correctAnswer}
                  </p>
                  <p className="text-green-200/80 text-xs leading-relaxed">
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function buildPrintHTML(exam: ExamData, withAnswers: boolean): string {
  const questionsHTML = exam.questions
    .map((q) => {
      let html = `
        <div class="question">
          <p class="question-text"><strong>${q.number}.</strong> ${escapeHtml(q.text)}</p>
      `;

      if (q.type === 'multiple_choice' && q.options) {
        html += '<div class="options">';
        q.options.forEach((opt) => {
          const isCorrect = withAnswers && opt.startsWith(q.correctAnswer);
          html += `<p class="option ${isCorrect ? 'correct' : ''}">${escapeHtml(opt)}</p>`;
        });
        html += '</div>';
      }

      if (q.type === 'essay' && !withAnswers) {
        html += '<div class="answer-space"></div>';
      }

      html += '</div>';
      return html;
    })
    .join('');

  let answerKeyHTML = '';
  if (withAnswers) {
    answerKeyHTML = `
      <div class="page-break"></div>
      <div class="answer-key">
        <h2>Gabarito Explicado</h2>
        ${exam.questions
          .map(
            (q) => `
          <div class="answer-item">
            <p class="answer-header"><strong>Questão ${q.number}:</strong> ${escapeHtml(q.correctAnswer)}</p>
            <p class="answer-explanation">${escapeHtml(q.explanation)}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(exam.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #1a1a1a;
      padding: 40px;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header p { font-size: 13px; color: #666; }
    .student-info {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .student-info .field {
      flex: 1;
      border-bottom: 1px solid #999;
      padding-bottom: 4px;
    }
    .student-info .field.small { flex: 0 0 120px; }
    .instructions {
      background: #f5f5f5;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #555;
      font-style: italic;
    }
    .question {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }
    .question:last-child { border-bottom: none; }
    .question-text {
      font-size: 14px;
      margin-bottom: 10px;
      white-space: pre-wrap;
    }
    .options { margin-left: 16px; }
    .option {
      font-size: 13px;
      padding: 3px 8px;
      margin-bottom: 4px;
      border-radius: 4px;
    }
    .option.correct {
      background: #d4edda;
      font-weight: 600;
    }
    .answer-space {
      margin-left: 16px;
      margin-top: 8px;
      border: 1px dashed #ccc;
      border-radius: 6px;
      min-height: 80px;
      padding: 8px;
    }
    .page-break { page-break-before: always; }
    .answer-key { margin-top: 30px; }
    .answer-key h2 {
      font-size: 20px;
      text-align: center;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid #333;
    }
    .answer-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f0fdf4;
      border-radius: 6px;
      border-left: 3px solid #22c55e;
    }
    .answer-header { font-size: 14px; margin-bottom: 4px; }
    .answer-explanation { font-size: 13px; color: #444; }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 12px;
    }
    @media print {
      body { padding: 20px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(exam.title)}</h1>
    <p>${escapeHtml(exam.subject)} — ${exam.questions.length} questões</p>
  </div>

  <div class="student-info">
    <div class="field">Nome: _______________________</div>
    <div class="field small">Data: ___/___/______</div>
    <div class="field small">Nota: ________</div>
  </div>

  ${exam.instructions ? `<div class="instructions">${escapeHtml(exam.instructions)}</div>` : ''}

  ${questionsHTML}

  ${answerKeyHTML}

  <div class="footer">
    Prova gerada por Studdo — www.studdo.com.br
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}
