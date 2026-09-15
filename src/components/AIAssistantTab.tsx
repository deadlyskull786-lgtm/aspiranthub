import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ExamType, Subject, ClassGrade, MCQQuestion } from '../types';
import { Sparkles, Send, Bot, User, BookOpen, Lightbulb, Zap, HelpCircle } from 'lucide-react';

interface AIAssistantTabProps {
  initialQuestionContext?: MCQQuestion | null;
  onClearQuestionContext?: () => void;
  targetExam: ExamType;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  initialQuestionContext,
  onClearQuestionContext,
  targetExam,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `### 👋 Welcome to your 24/7 AI Study Mentor!
I specialize in **JEE Main/Advanced, NEET-UG, and KCET** across Physics, Chemistry, Mathematics, and Biology (Class 11 & 12).

Here is how I can help you today:
- 📐 **Step-by-step problem derivations & solutions**
- ⚡ **Instant formula recall, sign conventions & dimensional tricks**
- 🧬 **NCERT line-by-line biology concept clarity**
- ⏱️ **KCET 60-second speed-solve elimination techniques**
- 🎯 **High-weightage chapter analysis & revision roadmaps**

Ask me any doubt, or pick one of the quick prompts below to get started!`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedExam, setSelectedExam] = useState<ExamType>(targetExam);
  const [selectedClass, setSelectedClass] = useState<ClassGrade>('12');
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Physics');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If a question context is passed, prepopulate or auto-ask
  useEffect(() => {
    if (initialQuestionContext) {
      const prompt = `Can you explain this ${initialQuestionContext.exam} question from ${initialQuestionContext.chapter} (Class ${initialQuestionContext.classGrade} ${initialQuestionContext.subject}) in detail?\n\n"${initialQuestionContext.question}"\n\nOptions:\nA) ${initialQuestionContext.options[0]}\nB) ${initialQuestionContext.options[1]}\nC) ${initialQuestionContext.options[2]}\nD) ${initialQuestionContext.options[3]}\n\nPlease explain why the correct answer is Option ${String.fromCharCode(65 + initialQuestionContext.correctOptionIndex)}, the core concept, and any exam shortcut to solve it in under 60 seconds.`;
      setInputPrompt(prompt);
      setSelectedExam(initialQuestionContext.exam);
      setSelectedClass(initialQuestionContext.classGrade);
      setSelectedSubject(initialQuestionContext.subject);
      if (onClearQuestionContext) onClearQuestionContext();
    }
  }, [initialQuestionContext, onClearQuestionContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subjectHint: selectedSubject,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          exam: selectedExam,
          classGrade: selectedClass,
          subject: selectedSubject,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help you with your next study question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the AI tutor service. Please check your network connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    {
      title: "King's Rule in Definite Integrals",
      exam: 'JEE',
      prompt: "Explain King's Property ∫_a^b f(x)dx = ∫_a^b f(a+b-x)dx with 2 classic JEE Main examples and when to apply it.",
    },
    {
      title: 'C3 vs C4 Photosynthesis Pathways',
      exam: 'NEET',
      prompt: 'Compare C3 and C4 plants for NEET Biology: Kranz anatomy, primary CO2 acceptor, first stable product, and ATP cost.',
    },
    {
      title: 'Lens Maker Formula KCET Shortcuts',
      exam: 'KCET',
      prompt: 'What are the fastest shortcut formulas for lenses immersed in liquids (water, oil) for KCET Physics?',
    },
    {
      title: 'Thermodynamic Signs in Chemistry vs Physics',
      exam: 'All',
      prompt: 'Clarify the work done (W) sign convention difference between Chemistry (IUPAC) and Physics for JEE/NEET.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top AI Mentor Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-2xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Gemini AI Study Mentor
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Personalized guidance for JEE, NEET & KCET
            </p>
          </div>
        </div>

        {/* Filters for context */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value as ExamType)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 text-xs"
          >
            <option value="JEE">JEE Main & Adv</option>
            <option value="NEET">NEET-UG</option>
            <option value="KCET">KCET</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as ClassGrade)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 text-xs"
          >
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium text-slate-700 text-xs"
          >
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            {selectedExam !== 'NEET' && <option value="Mathematics">Mathematics</option>}
            {selectedExam !== 'JEE' && <option value="Biology">Biology</option>}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isAssistant ? 'justify-start' : 'justify-end'
              }`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1 border border-indigo-200">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-50 border border-slate-200 text-slate-800'
                    : 'bg-indigo-600 text-white shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] mt-2 text-right ${
                    isAssistant ? 'text-slate-400' : 'text-indigo-200'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                  ME
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-1 border border-indigo-200">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Analyzing formula, concept rules & exam shortcuts with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          High-Yield Topics:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            {qp.title}
          </button>
        ))}
      </div>

      {/* Bottom Input Field */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask any doubt in Class ${selectedClass} ${selectedSubject} for ${selectedExam}...`}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
