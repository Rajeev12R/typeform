"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../contexts/ToastContext";
import { getForm, updateForm, publishForm, unpublishForm } from "../../../lib/form-api";
import { createQuestion, updateQuestion, deleteQuestion, reorderQuestions } from "../../../lib/question-api";
import type { Form, Question, QuestionType } from "../../../types/form";

const THEMES: Record<string, { bg: string, text: string, accent: string, border: string, name: string }> = {
  default: { name: 'Default', bg: 'bg-[#f7f7f7]', text: 'text-gray-900', accent: 'text-[#0445af]', border: 'border-[#0445af]/30' },
  inkyBlack: { name: 'Inky Black', bg: 'bg-[#191919]', text: 'text-white', accent: 'text-white', border: 'border-white/30' },
  plainBlue: { name: 'Plain Blue', bg: 'bg-[#0445af]', text: 'text-white', accent: 'text-white', border: 'border-white/30' },
  pearlWhite: { name: 'Pearl White', bg: 'bg-white', text: 'text-gray-900', accent: 'text-[#0445af]', border: 'border-[#0445af]/30' }
};
export default function FormBuilder() {
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [showDesignMenu, setShowDesignMenu] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const formId = params ? parseInt(params.formId as string, 10) : null;

  useEffect(() => {
    if (!formId) return;
    getForm(formId)
      .then((data) => {
        setForm(data);
        if (data.questions.length > 0) {
          setActiveQuestionId(data.questions[0].id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/forms");
      });
  }, [formId, router]);

  const activeQuestion = form?.questions.find((q) => q.id === activeQuestionId);

  const handleTitleChange = async (newTitle: string) => {
    if (!form) return;
    setForm({ ...form, title: newTitle });
    setIsSaving(true);
    try {
      await updateForm(form.id, newTitle);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!form) return;
    setIsSaving(true);
    try {
      if (form.status === "published") {
        const unpublishedForm = await unpublishForm(form.id);
        setForm(unpublishedForm);
        addToast(`Form unpublished successfully!`, "success");
      } else {
        const publishedForm = await publishForm(form.id);
        setForm(publishedForm);
        addToast(`Form published successfully!`, "success");
      }
    } catch (e) {
      console.error(e);
      addToast(`Failed to ${form.status === "published" ? "unpublish" : "publish"} form`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuestion = async (type: string) => {
    if (!form) return;
    setShowQuestionTypes(false);
    setIsSaving(true);
    try {
      const requiresOptions = type === "multiple_choice" || type === "dropdown";

      const payload = {
        type,
        title: "...",
        required: false,
        options: requiresOptions ? [{ label: "Option 1" }] : undefined
      };
      console.log("Creating question payload:", payload);
      const newQ = await createQuestion(form.id, payload);
      setForm({
        ...form,
        questions: [...form.questions, newQ]
      });
      setActiveQuestionId(newQ.id);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateQuestion = async (qId: number, updates: any) => {
    if (!form) return;
    const oldQuestions = [...form.questions];

    const qToUpdate = form.questions.find(q => q.id === qId);
    let finalUpdates = { ...updates };

    if (updates.type && qToUpdate && updates.type !== qToUpdate.type) {
      const requiresOptions = updates.type === "multiple_choice" || updates.type === "dropdown";
      if (requiresOptions && (!qToUpdate.options || qToUpdate.options.length === 0)) {
        finalUpdates.options = [{ label: "Option 1" }];
      } else if (!requiresOptions) {
        finalUpdates.options = [];
      }
    }

    setForm({
      ...form,
      questions: form.questions.map(q => q.id === qId ? { ...q, ...finalUpdates } : q)
    });
    setIsSaving(true);
    try {
      await updateQuestion(qId, finalUpdates);
    } catch (e) {
      console.error(e);
      setForm({ ...form, questions: oldQuestions });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (!form) return;
    if (!confirm("Are you sure you want to delete this question?")) return;

    const newQuestions = form.questions.filter(q => q.id !== qId);
    setForm({ ...form, questions: newQuestions });
    if (activeQuestionId === qId) {
      setActiveQuestionId(newQuestions.length > 0 ? newQuestions[0].id : null);
    }

    setIsSaving(true);
    try {
      await deleteQuestion(qId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === dropIdx || !form) {
      handleDragEnd();
      return;
    }

    const newQuestions = [...form.questions];
    const [draggedQuestion] = newQuestions.splice(draggedIdx, 1);
    newQuestions.splice(dropIdx, 0, draggedQuestion);

    setForm({ ...form, questions: newQuestions });
    handleDragEnd();

    setIsSaving(true);
    try {
      await reorderQuestions(form.id, newQuestions.map(q => q.id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f3f3]">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-gray-900">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <Link href="/forms" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onBlur={(e) => handleTitleChange(e.target.value)}
            className="text-[15px] font-medium bg-transparent focus:outline-none focus:bg-gray-50 px-2 py-1 rounded hover:bg-gray-50 transition-colors w-64"
          />
          {isSaving && <span className="text-xs text-gray-400 font-medium">Saving...</span>}
        </div>

        {/* Center Tabs */}
        <div className="flex items-center justify-center gap-1 w-1/3">
          <Link href={`/forms/${form.id}/create`} className="text-sm font-medium text-gray-900 border-b-2 border-black px-4 py-4">Create</Link>
          <button className="text-sm font-medium text-gray-400 border-b-2 border-transparent px-4 py-4 cursor-not-allowed">Connect</button>
          <Link href={`/forms/${form.id}/result`} className="text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent px-4 py-4">Results</Link>
        </div>

        <div className="flex w-1/3 items-center justify-end gap-3">

          <button
            type="button"
            onClick={() => {
              if (!form.public_id) {
                addToast("Please publish the form first.", "error");
                return;
              }
              const link = `${window.location.origin}/f/${form.public_id}`;
              navigator.clipboard
                .writeText(link)
                .then(() => addToast("Link copied to clipboard!", "success"))
                .catch(() => addToast("Failed to copy link.", "error"));
            }}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 16 16" aria-hidden="true">
              <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M2.55 4.041c-.363-1.45 1.143-2.658 2.48-1.99l8.766 4.384c1.29.645 1.29 2.485 0 3.13L5.03 13.95c-1.337.668-2.843-.54-2.48-1.99L3.54 8zM4.898 8.75l-.893 3.573a.25.25 0 0 0 .354.284l8.767-4.383a.25.25 0 0 0 0-.448L4.359 3.393a.25.25 0 0 0-.354.284l.893 3.573h1.758a.75.75 0 0 1 0 1.5z" />
            </svg>
            Share
          </button>

          <button
            onClick={handlePublish}
            className={`text-sm font-medium text-white rounded-md px-4 py-1.5 transition-colors ${form.status === "published" ? "bg-red-600 hover:bg-red-700" : "bg-[#191919] hover:bg-black"}`}
          >
            {form.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </div>
      </header>

    <div className="grow flex overflow-hidden">
      {!isPreviewMode && (

        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <button className="flex items-center justify-between w-full text-sm font-medium text-gray-900 bg-transparent hover:bg-gray-50 rounded-md py-1.5 transition-colors">
              <span className="flex items-center gap-2">Universal mode</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            <div className="relative">
              {showQuestionTypes && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-250 h-187.5 max-h-[90vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in duration-200">

                    <div className="flex items-center justify-between px-6 border-b border-gray-200 shrink-0 h-14">
                      <div className="flex items-center gap-6 h-full">
                        <button className="text-[13px] font-medium text-black border-b-2 border-black h-full pt-0.5">Add form elements</button>
                        <button className="text-[13px] font-medium text-gray-500 hover:text-gray-800 h-full">Import questions</button>
                        <button className="text-[13px] font-medium text-gray-500 hover:text-gray-800 h-full">Create with AI</button>
                      </div>
                      <button onClick={() => setShowQuestionTypes(false)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex grow overflow-hidden">
                      <div className="w-64 shrink-0 border-r border-gray-100 p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="relative">
                          <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Search form elements"
                            className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-0 rounded-lg placeholder-gray-400 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          />
                        </div>

                        <div>
                          <h4 className="text-[13px] font-medium text-gray-800 mb-3">Recommended</h4>
                          <button className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
                              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                            </div>
                            <span className="text-[13px] text-gray-700">Welcome Screen</span>
                          </button>
                        </div>

                        <div>
                          <h4 className="text-[13px] font-medium text-gray-800 mb-3">Connect to apps</h4>
                          <div className="space-y-2">
                            <button className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div className="w-5 h-5 rounded-full bg-[#ff7a59] flex items-center justify-center shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                              </div>
                              <span className="text-[13px] text-gray-700">Hubspot</span>
                            </button>
                            <button className="flex items-center justify-between w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#00a1e0] flex items-center justify-center shrink-0">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 13.4c-.4-1.2-1.4-2.1-2.7-2.4l-3-.7c-.8-.2-1.1-.5-1.1-1s.4-.9 1.1-.9c.7 0 1.2.4 1.4 1.1l1.7-.5c-.4-1.3-1.6-2.2-3.1-2.2-1.7 0-3 1.1-3 2.7 0 1.5 1 2.3 2.7 2.7l2.8.7c.9.2 1.3.7 1.3 1.2s-.5 1.1-1.3 1.1c-.8 0-1.4-.5-1.6-1.3l-1.8.4c.5 1.6 1.8 2.6 3.4 2.6 1.9 0 3.3-1.2 3.3-3 .1-1.6-1-2.5-2.8-2.9z" /></svg>
                                </div>
                                <span className="text-[13px] text-gray-700">Salesforce</span>
                              </div>
                              <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100">
                                <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                              </div>
                            </button>
                            <button className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                              <span className="text-[13px] text-gray-700 font-medium">Browse all apps</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grow p-8 overflow-y-auto bg-[#fafafa]">
                        <div className="grid grid-cols-3 gap-x-8 gap-y-12">

                          <div className="flex flex-col gap-8">
                            <div>
                              <h3 className="text-[13px] font-medium text-gray-800 mb-4">Contact info</h3>
                              <div className="space-y-1">
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Contact Info</span>
                                </button>
                                <button onClick={() => handleAddQuestion("email")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Email</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Phone Number</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Address</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-pink-100 flex items-center justify-center shrink-0 group-hover:bg-pink-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Website</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-[13px] font-medium text-gray-800 mb-4">Text & Video</h3>
                              <div className="space-y-1">
                                <button onClick={() => handleAddQuestion("long_text")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Long Text</span>
                                </button>
                                <button onClick={() => handleAddQuestion("short_text")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Short Text</span>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Video and Audio</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Clarify with AI</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">FAQ with AI</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                            <div>
                              <h3 className="text-[13px] font-medium text-gray-800 mb-4">Choice</h3>
                              <div className="space-y-1">
                                <button onClick={() => handleAddQuestion("multiple_choice")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Multiple Choice</span>
                                </button>
                                <button onClick={() => handleAddQuestion("dropdown")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Dropdown</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Picture Choice</span>
                                </button>
                                <button onClick={() => handleAddQuestion("yes_no")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Yes/No</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Legal</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center shrink-0 group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Checkbox</span>
                                </button>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-[13px] font-medium text-gray-800 mb-4">Other</h3>
                              <div className="space-y-1">
                                <button onClick={() => handleAddQuestion("number")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                    <span className="text-yellow-600 font-bold text-[10px]">#</span>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Number</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Date</span>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Signature</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Payment</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">File Upload</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-yellow-100 flex items-center justify-center shrink-0 group-hover:bg-yellow-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Scheduler</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                            <div>
                              <h3 className="text-[13px] font-medium text-gray-800 mb-4">Rating & ranking</h3>
                              <div className="space-y-1">
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Net Promoter Score®</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Opinion Scale</span>
                                </button>
                                <button onClick={() => handleAddQuestion("rating")} className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Rating</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Ranking</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-200 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Matrix</span>
                                </button>
                              </div>
                            </div>

                            <div className="mt-auto">
                              <div className="space-y-1">
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Welcome Screen</span>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Partial Submit Point</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                    <span className="font-serif text-gray-600 font-bold text-xs italic">"</span>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Statement</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Question Group</span>
                                </button>
                                <button className="flex items-center gap-3 w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                    <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                  </div>
                                  <span className="text-[13px] text-gray-600 group-hover:text-gray-900">End Screen</span>
                                </button>
                                <button className="flex items-center justify-between w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 transition-colors group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center shrink-0 group-hover:bg-gray-300 transition-colors">
                                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                    </div>
                                    <span className="text-[13px] text-gray-600 group-hover:text-gray-900">Redirect to URL</span>
                                  </div>
                                  <div className="w-4 h-4 bg-teal-50 rounded flex items-center justify-center border border-teal-100 opacity-70">
                                    <svg className="w-2.5 h-2.5 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                  </div>
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grow overflow-y-auto p-2 space-y-1">
            {form.questions.map((q, idx) => (
              <div
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-all group ${activeQuestionId === q.id ? "bg-[#e5f1ed] text-[#2d5649]" : "hover:bg-gray-50 text-gray-700"} ${dragOverIdx === idx ? "border-t-2 border-[#0445af]" : ""} ${draggedIdx === idx ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`text-[11px] font-bold w-4 h-4 flex items-center justify-center rounded-sm shrink-0 ${activeQuestionId === q.id ? "bg-[#2d5649] text-white" : "bg-gray-200 text-gray-600"}`}>
                    {idx + 1}
                  </span>
                  <span className="text-[13px] truncate font-medium">
                    {q.title === "..." ? "New Question" : (q.title || "Untitled")}
                    {q.required && <span className="text-black ml-1">*</span>}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}

      <main className={`grow flex flex-col relative overflow-hidden transition-colors ${THEMES[activeTheme].bg}`}>
        {!isPreviewMode && (
          <div className="h-14 flex items-center justify-between px-6 shrink-0 w-full bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowQuestionTypes(!showQuestionTypes)}
                className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1.5 rounded-md text-[13px] font-medium hover:bg-black transition-colors shadow-sm"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add content
              </button>
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="relative">
                <button
                  onClick={() => setShowDesignMenu(!showDesignMenu)}
                  className="flex items-center gap-2 text-gray-700 text-[13px] font-medium hover:text-gray-900 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  Design
                </button>
                {showDesignMenu && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Themes</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(THEMES).map(([key, t]) => (
                        <button
                          key={key}
                          onClick={() => { setActiveTheme(key); setShowDesignMenu(false); }}
                          className={`flex flex-col items-start p-3 rounded-lg border-2 text-left transition-colors ${activeTheme === key ? 'border-blue-500' : 'border-gray-100 hover:border-gray-300'}`}
                        >
                          <div className={`w-full h-16 rounded mb-2 border border-gray-100 ${t.bg}`}></div>
                          <span className="text-xs font-medium text-gray-700">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-500">
              <button
                onClick={() => setIsMobileMode(!isMobileMode)}
                className={`transition-colors ${isMobileMode ? 'text-gray-900' : 'hover:text-gray-900'}`}
                title="Mobile view"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className="hover:text-gray-900 transition-colors"
                title="Preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" cursor="unset"><path fill="currentColor" d="M2 2.293c0-1.36 1.484-2.2 2.65-1.5l9.506 5.703a1.75 1.75 0 0 1 0 3.001L4.65 15.201C3.484 15.9 2 15.06 2 13.7zm1.879-.214a.25.25 0 0 0-.379.214V13.7a.25.25 0 0 0 .379.215l9.505-5.704a.25.25 0 0 0 0-.429z" fillRule="evenodd" clipRule="evenodd"></path></svg>
              </button>

            </div>
          </div>
        )}

        {isPreviewMode && (
          <div className="absolute top-4 right-4 z-50">
            <button onClick={() => setIsPreviewMode(false)} className="bg-black/50 text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-black/70 transition-colors shadow">
              Close Preview
            </button>
          </div>
        )}

        <div className="grow flex flex-col items-center p-8 overflow-y-auto w-full">
          {isMobileMode && !isPreviewMode && (
            <div className="w-93.75 h-12 bg-white rounded-t-4xl border-8 border-b-0 border-gray-900 flex items-center justify-between px-6 shrink-0 z-10 transition-all shadow-sm">
              <button onClick={() => setIsMobileMode(false)} className="text-gray-500 hover:text-black">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex items-center gap-4">
                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
            </div>
          )}
          {activeQuestion ? (
            <div className={`w-full transition-all flex flex-col justify-center my-auto ${isMobileMode && !isPreviewMode ? 'max-w-93.75 h-166.75 bg-transparent rounded-b-4xl border-8 border-t-0 border-gray-900 shadow-2xl relative overflow-y-auto overflow-x-hidden' : 'max-w-2xl bg-white shadow-xl rounded-xl min-h-[60vh] p-10'}`}>
              <div className={`flex flex-col grow ${isMobileMode && !isPreviewMode ? 'p-8 justify-center' : 'justify-center'}`}>
                <div className="flex items-start gap-4 mb-6">
                  <span className="text-xl text-[#0445af] font-bold mt-1.5 flex items-center gap-1">
                    {form.questions.findIndex(q => q.id === activeQuestion.id) + 1}
                    <svg className="w-3 h-3 text-[#0445af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                  <div className="grow">
                    <div className="flex items-start">
                      <textarea
                        value={activeQuestion.title || ""}
                        onChange={(e) => handleUpdateQuestion(activeQuestion.id, { title: e.target.value === "" ? null : e.target.value })}
                        placeholder="Your question here..."
                        className="w-full text-2xl font-normal text-gray-900 border-none bg-transparent focus:outline-none focus:ring-0 resize-none min-h-10 placeholder:text-gray-300"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                      {activeQuestion.required && <span className="text-black text-2xl leading-none mt-1">*</span>}
                    </div>
                    {(activeQuestion.description !== null || activeQuestion.description === "") && (
                      <textarea
                        value={activeQuestion.description || ""}
                        onChange={(e) => handleUpdateQuestion(activeQuestion.id, { description: e.target.value })}
                        placeholder="Description (optional)"
                        className="w-full text-[15px] font-normal text-gray-500 border-none bg-transparent focus:outline-none focus:ring-0 resize-none mt-2 placeholder:text-gray-300"
                        rows={1}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="pl-9 w-full max-w-md">
                  {activeQuestion.type === "short_text" && (
                    <div>
                      <input type="text" placeholder="Type your answer here..." disabled className="w-full border-b border-[#0445af]/30 py-2 bg-transparent text-[#0445af] text-xl focus:outline-none placeholder:text-[#0445af]/30" />
                      <div className="text-[13px] text-gray-400 mt-2 font-medium">
                        <strong>Shift ⇧</strong> + <strong>Enter ↵</strong> to make a line break
                      </div>
                    </div>
                  )}

                  {activeQuestion.type === "long_text" && (
                    <div>
                      <textarea placeholder="Type your answer here..." disabled className="w-full border-b border-[#0445af]/30 py-2 bg-transparent text-[#0445af] text-xl focus:outline-none resize-none placeholder:text-[#0445af]/30" rows={2} />
                      <div className="text-[13px] text-gray-400 mt-2 font-medium">
                        <strong>Shift ⇧</strong> + <strong>Enter ↵</strong> to make a line break
                      </div>
                    </div>
                  )}

                  {activeQuestion.type === "email" && (
                    <input type="email" placeholder="name@example.com" disabled className="w-full border-b border-[#0445af]/30 py-2 bg-transparent text-[#0445af] text-xl focus:outline-none placeholder:text-[#0445af]/30" />
                  )}

                  {activeQuestion.type === "number" && (
                    <input type="number" placeholder="0" disabled className="w-full border-b border-[#0445af]/30 py-2 bg-transparent text-[#0445af] text-xl focus:outline-none placeholder:text-[#0445af]/30" />
                  )}

                  {(activeQuestion.type === "multiple_choice" || activeQuestion.type === "dropdown") && (
                    <div className="space-y-2">
                      {activeQuestion.options?.map((opt, i) => (
                        <div key={opt.id || `opt-${i}`} className="flex items-center gap-3 bg-[#0445af]/5 border border-[#0445af]/20 rounded-md p-2 group/opt">
                          <div className="w-6 h-6 border border-[#0445af]/30 rounded flex items-center justify-center text-xs text-[#0445af] font-medium bg-white shrink-0">{String.fromCharCode(65 + i)}</div>
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => {
                              const newOptions = [...activeQuestion.options];
                              newOptions[i] = { ...newOptions[i], label: e.target.value };
                              handleUpdateQuestion(activeQuestion.id, { options: newOptions });
                            }}
                            className="text-[#0445af] bg-transparent border-none focus:outline-none focus:ring-0 grow"
                          />
                          {activeQuestion.options.length > 1 && (
                            <button
                              onClick={() => {
                                const newOptions = activeQuestion.options.filter((_, idx) => idx !== i);
                                handleUpdateQuestion(activeQuestion.id, { options: newOptions });
                              }}
                              className="text-[#0445af]/40 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOptions = [...(activeQuestion.options || []), { label: `Option ${(activeQuestion.options?.length || 0) + 1}` }];
                          handleUpdateQuestion(activeQuestion.id, { options: newOptions });
                        }}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add choice
                      </button>
                    </div>
                  )}

                  {activeQuestion.type === "yes_no" && (
                    <div className="flex items-center gap-4 mt-2">
                      <button disabled className="flex-1 py-3 px-4 border border-[#0445af]/30 rounded-md text-[#0445af] font-medium bg-[#0445af]/5 flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border border-[#0445af]/40 rounded-sm flex items-center justify-center text-xs bg-white">Y</span>
                        Yes
                      </button>
                      <button disabled className="flex-1 py-3 px-4 border border-[#0445af]/30 rounded-md text-[#0445af] font-medium bg-[#0445af]/5 flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border border-[#0445af]/40 rounded-sm flex items-center justify-center text-xs bg-white">N</span>
                        No
                      </button>
                    </div>
                  )}

                  {activeQuestion.type === "rating" && (
                    <div className="flex items-center gap-3 mt-4">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className="w-8 h-8 text-[#0445af]/30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <p className="text-sm">Add a question to start building your form</p>
            </div>
          )}
        </div>
      </main>

      {
        !isPreviewMode && (
          <aside className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <h2 className="text-sm font-medium text-gray-900">Settings</h2>
            </div>

            {activeQuestion ? (
              <div className="p-4 space-y-6 overflow-y-auto">
                <div>
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Settings</h3>

                  <label className="flex items-center justify-between cursor-pointer group mb-4">
                    <span className="text-[13px] font-medium text-gray-700">Required</span>
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeQuestion.required ? "bg-[#2d5649]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${activeQuestion.required ? "translate-x-4" : "translate-x-0.5"}`}></div>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={activeQuestion.required}
                      onChange={(e) => handleUpdateQuestion(activeQuestion.id, { required: e.target.checked })}
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group mb-4">
                    <span className="text-[13px] font-medium text-gray-700">Description</span>
                    <div className={`w-8 h-4.5 rounded-full relative transition-colors ${activeQuestion.description !== null ? "bg-[#2d5649]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform ${activeQuestion.description !== null ? "translate-x-4" : "translate-x-0.5"}`}></div>
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={activeQuestion.description !== null}
                      onChange={(e) => handleUpdateQuestion(activeQuestion.id, { description: e.target.checked ? "" : null })}
                    />
                  </label>
                </div>

                <div>
                  <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">Type</h3>
                  <div className="text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 capitalize">
                    {activeQuestion.type.replace("_", " ")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-400 mt-10">
                Select a question to view settings
              </div>
            )}
          </aside>
        )}
    </div>
    </div >
  );
}
