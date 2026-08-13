"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getPublicForm, submitResponse } from "../../lib/public-api";
import type { Form } from "../../types/form";

export default function PublicFormPage() {
  const params = useParams();
  const publicId = params?.publicId as string;
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (publicId) {
      getPublicForm(publicId)
        .then(setForm)
        .catch(err => {
          console.error(err);
          setError("Form not found or is no longer available.");
        })
        .finally(() => setLoading(false));
    }
  }, [publicId]);

  const isStartPage = currentStep === 0;
  const currentQuestion = form && !isStartPage ? form.questions[currentStep - 1] : null;

  const validateCurrentQuestion = () => {
    if (isStartPage) return true;
    
    if (!currentQuestion) return true;
    
    const ans = answers[currentQuestion.id]?.trim() || "";
    
    if (currentQuestion.required && !ans) {
      setValidationError("This question is required");
      return false;
    }
    
    if (ans) {
      if (currentQuestion.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(ans)) {
          setValidationError("Please enter a valid email address");
          return false;
        }
      } else if (currentQuestion.type === "number") {
        if (isNaN(Number(ans))) {
          setValidationError("Please enter a valid number");
          return false;
        }
      }
    }
    
    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    
    if (form && currentStep < form.questions.length) {
      setCurrentStep(currentStep + 1);
      setValidationError(null);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setValidationError(null);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setValidationError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersPayload = Object.entries(answers).map(([qId, val]) => ({
      question_id: parseInt(qId, 10),
      value: val,
    }));

    try {
      await submitResponse(publicId, { answers: answersPayload });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("Something went wrong while submitting your response.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (submitted) return;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && e.key === 'Enter') {
          e.preventDefault();
          handleNext();
          return;
      }
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      if (e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (currentQuestion) {
        if (currentQuestion.type === "multiple_choice" || currentQuestion.type === "dropdown") {
          const key = e.key.toUpperCase();
          const index = key.charCodeAt(0) - 65; // 'A' is 65
          if (index >= 0 && index < (currentQuestion.options?.length || 0)) {
             const val = currentQuestion.options![index].label;
             setAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
             setValidationError(null);
             setTimeout(handleNext, 300);
          }
        } else if (currentQuestion.type === "yes_no") {
          if (e.key.toLowerCase() === 'y') {
             setAnswers(prev => ({ ...prev, [currentQuestion.id]: "Yes" }));
             setValidationError(null);
             setTimeout(handleNext, 300);
          } else if (e.key.toLowerCase() === 'n') {
             setAnswers(prev => ({ ...prev, [currentQuestion.id]: "No" }));
             setValidationError(null);
             setTimeout(handleNext, 300);
          }
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, currentQuestion, answers, form, submitted]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0445af]/30 border-t-[#0445af] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Oops!</h1>
        <p className="text-gray-500">{error || "This form doesn't exist."}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-8 text-center transition-all">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Thanks for completing this form</h1>
        <p className="text-gray-500 text-lg">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col font-sans transition-all duration-500 relative overflow-hidden">
      
      {!isStartPage && (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-200">
          <div 
            className="h-full bg-[#0445af] transition-all duration-300"
            style={{ width: `${(currentStep / form.questions.length) * 100}%` }}
          />
        </div>
      )}

      <main className="grow flex items-center justify-center p-8 w-full max-w-3xl mx-auto h-full">
        {isStartPage ? (
          <div className="w-full flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-8">{form.title}</h1>
            <button 
              onClick={handleNext}
              className="bg-[#0445af] text-white px-8 py-3.5 rounded-md text-xl font-medium hover:bg-[#03378c] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start
            </button>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              press <span className="font-bold">Enter ↵</span>
            </div>
          </div>
        ) : currentQuestion ? (
          <div key={currentQuestion.id} className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-start gap-4 mb-8">
              <span className="text-2xl text-[#0445af] font-bold mt-0.5 flex items-center gap-1">
                {currentStep}
                <svg className="w-4 h-4 text-[#0445af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
              <div className="grow">
                <h2 className="text-3xl text-gray-900 font-medium leading-snug">
                  {currentQuestion.title}
                  {currentQuestion.required && <span className="text-red-500 ml-2">*</span>}
                </h2>
                {currentQuestion.description && (
                  <p className="text-xl text-gray-500 mt-2">{currentQuestion.description}</p>
                )}
              </div>
            </div>

            <div className="pl-12 w-full">
              {currentQuestion.type === "short_text" && (
                <input 
                  type="text"
                  autoFocus
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border-b-2 border-[#0445af]/30 py-3 bg-transparent text-[#0445af] text-2xl focus:outline-none focus:border-[#0445af] transition-colors placeholder:text-[#0445af]/30"
                />
              )}

              {currentQuestion.type === "long_text" && (
                <textarea
                  autoFocus
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full border-b-2 border-[#0445af]/30 py-3 bg-transparent text-[#0445af] text-2xl focus:outline-none focus:border-[#0445af] transition-colors placeholder:text-[#0445af]/30 min-h-30 resize-y"
                />
              )}
              
              {currentQuestion.type === "email" && (
                <input 
                  type="email"
                  autoFocus
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="name@example.com"
                  className="w-full border-b-2 border-[#0445af]/30 py-3 bg-transparent text-[#0445af] text-2xl focus:outline-none focus:border-[#0445af] transition-colors placeholder:text-[#0445af]/30"
                />
              )}
              
              {currentQuestion.type === "number" && (
                <input 
                  type="number"
                  autoFocus
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="0"
                  className="w-full border-b-2 border-[#0445af]/30 py-3 bg-transparent text-[#0445af] text-2xl focus:outline-none focus:border-[#0445af] transition-colors placeholder:text-[#0445af]/30"
                />
              )}

              {(currentQuestion.type === "multiple_choice" || currentQuestion.type === "dropdown") && (
                <div className="flex flex-col gap-3 max-w-md">
                  {currentQuestion.options?.map((opt, i) => {
                    const isSelected = answers[currentQuestion.id] === opt.label;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, opt.label);
                          setTimeout(handleNext, 300);
                        }}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left group ${isSelected ? 'bg-[#0445af]/10 border-[#0445af]' : 'bg-[#0445af]/5 border-transparent hover:bg-[#0445af]/10'}`}
                      >
                        <div className={`w-7 h-7 rounded border flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${isSelected ? 'bg-[#0445af] border-[#0445af] text-white' : 'bg-white border-[#0445af]/30 text-[#0445af] group-hover:border-[#0445af]/60'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className={`text-xl font-medium ${isSelected ? 'text-[#0445af]' : 'text-[#0445af]/80'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === "yes_no" && (
                <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                  <button
                    onClick={() => {
                      handleAnswerChange(currentQuestion.id, "Yes");
                      setTimeout(handleNext, 300);
                    }}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all group ${answers[currentQuestion.id] === "Yes" ? 'bg-[#0445af]/10 border-[#0445af]' : 'bg-[#0445af]/5 border-transparent hover:bg-[#0445af]/10'}`}
                  >
                    <div className="w-6 h-6 rounded bg-white border border-[#0445af]/30 flex items-center justify-center text-xs font-bold text-[#0445af]">Y</div>
                    <span className="text-xl font-medium text-[#0445af]">Yes</span>
                  </button>
                  <button
                    onClick={() => {
                      handleAnswerChange(currentQuestion.id, "No");
                      setTimeout(handleNext, 300);
                    }}
                    className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all group ${answers[currentQuestion.id] === "No" ? 'bg-[#0445af]/10 border-[#0445af]' : 'bg-[#0445af]/5 border-transparent hover:bg-[#0445af]/10'}`}
                  >
                    <div className="w-6 h-6 rounded bg-white border border-[#0445af]/30 flex items-center justify-center text-xs font-bold text-[#0445af]">N</div>
                    <span className="text-xl font-medium text-[#0445af]">No</span>
                  </button>
                </div>
              )}
              
              {currentQuestion.type === "rating" && (
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map(star => {
                    const currentVal = parseInt(answers[currentQuestion.id] || "0", 10);
                    const isActive = star <= currentVal;
                    return (
                      <button
                        key={star}
                        onClick={() => {
                          handleAnswerChange(currentQuestion.id, star.toString());
                          setTimeout(handleNext, 300);
                        }}
                        className={`transition-colors focus:outline-none hover:scale-110 ${isActive ? 'text-[#0445af]' : 'text-[#0445af]/20 hover:text-[#0445af]/50'}`}
                      >
                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    )
                  })}
                </div>
              )}
              
              {validationError && (
                <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-50 py-2 px-3 rounded-md w-fit animate-in fade-in slide-in-from-left-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-medium">{validationError}</span>
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="bg-[#0445af] text-white px-6 py-2.5 rounded-md text-lg font-medium hover:bg-[#03378c] transition-colors shadow flex items-center gap-2"
                >
                  {currentStep === form.questions.length ? (submitting ? "Submitting..." : "Submit") : "OK"}
                  {currentStep !== form.questions.length && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  )}
                </button>
                <div className="text-sm text-gray-400">
                  press <span className="font-bold">Enter ↵</span>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>

      {!isStartPage && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors disabled:opacity-50"
            title="Up arrow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <button 
            onClick={handleNext}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded flex items-center justify-center transition-colors"
            title="Down arrow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}
