"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "../../../contexts/ToastContext";
import { getForm, publishForm, unpublishForm } from "../../../lib/form-api";
import { getResponses, getResponseDetail, getStatistics } from "../../../lib/response-api";
import type { Form } from "../../../types/form";
import type { ResponseListItem, ResponseDetail, FormStatistics } from "../../../lib/response-api";

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params ? parseInt(params.formId as string, 10) : null;
  const { addToast } = useToast();

  const tabParam = searchParams?.get("tab");
  const activeTab = ["insights", "summary", "responses"].includes(tabParam || "") 
    ? tabParam 
    : "insights";

  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseListItem[]>([]);
  const [stats, setStats] = useState<FormStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePublish = async () => {
    if (!form) return;
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
    }
  };
  
  const [selectedResponse, setSelectedResponse] = useState<ResponseDetail | null>(null);

  useEffect(() => {
    if (!formId) return;
    
    Promise.all([
      getForm(formId),
      getResponses(formId),
      getStatistics(formId)
    ])
      .then(([formData, responsesData, statsData]) => {
        setForm(formData);
        setResponses(responsesData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [formId]);

  const handleTabChange = (tab: string) => {
    router.push(`/forms/${formId}/result?tab=${tab}`);
  };

  const handleSelectResponse = async (responseId: number) => {
    if (!formId) return;
    try {
      const detail = await getResponseDetail(formId, responseId);
      setSelectedResponse(detail);
    } catch (e) {
      console.error(e);
      addToast("Failed to load response details", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9]">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!form || !stats) return null;

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col font-sans text-gray-900 overflow-hidden">
      
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-4 w-1/3">
          <Link href="/forms" className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="text-[15px] font-medium px-2 py-1 truncate max-w-50">
            {form.title}
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 w-1/3">
          <Link href={`/forms/${form.id}/create`} className="text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent px-4 py-4">Create</Link>
          <button className="text-sm font-medium text-gray-400 border-b-2 border-transparent px-4 py-4 cursor-not-allowed">Connect</button>
          <Link href={`/forms/${form.id}/result`} className="text-sm font-medium text-gray-900 border-b-2 border-black px-4 py-4">Results</Link>
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

      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-8 px-8">
          <button 
            onClick={() => handleTabChange("insights")}
            className={`text-sm font-medium py-3 border-b-2 transition-colors ${activeTab === 'insights' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Insights
          </button>
          <button 
            onClick={() => handleTabChange("summary")}
            className={`text-sm font-medium py-3 border-b-2 transition-colors ${activeTab === 'summary' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Summary
          </button>
          <button 
            onClick={() => handleTabChange("responses")}
            className={`text-sm font-medium py-3 border-b-2 transition-colors ${activeTab === 'responses' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Responses
          </button>
        </div>
      </div>

      <div className="grow overflow-hidden relative">
        {activeTab === "insights" && (
          <div className="absolute inset-0 overflow-y-auto p-8 flex flex-col items-center animate-in fade-in duration-200">
            <div className="w-full max-w-3xl">
              <h2 className="text-2xl font-medium text-gray-900 mb-8">Performance</h2>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex divide-x divide-gray-200">
                <div className="flex-1 px-4 text-center">
                  <div className="text-4xl font-light text-gray-900 mb-2">{stats.total_responses}</div>
                  <div className="text-sm font-medium text-gray-500">Responses</div>
                </div>
                <div className="flex-1 px-4 text-center">
                  <div className="text-4xl font-light text-gray-900 mb-2">—</div>
                  <div className="text-sm font-medium text-gray-500">Completion</div>
                </div>
                <div className="flex-1 px-4 text-center">
                  <div className="text-4xl font-light text-gray-900 mb-2">{stats.questions.length}</div>
                  <div className="text-sm font-medium text-gray-500">Questions</div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">Question performance</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {stats.questions.map((q, idx) => (
                      <tr key={q.question_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="p-4 w-12 text-gray-400 font-medium">Q{idx + 1}</td>
                        <td className="p-4 text-gray-900 font-medium">{q.question_title}</td>
                        <td className="p-4 text-right text-gray-500 text-sm">{q.total_answers} responses</td>
                      </tr>
                    ))}
                    {stats.questions.length === 0 && (
                      <tr>
                        <td className="p-6 text-center text-gray-500" colSpan={3}>No questions yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="absolute inset-0 overflow-y-auto p-8 flex flex-col items-center animate-in fade-in duration-200">
            <div className="w-full max-w-3xl flex flex-col gap-8">
              {stats.questions.map((q, idx) => {
                const requiresDistribution = q.question_type === "multiple_choice" || q.question_type === "dropdown" || q.question_type === "rating" || q.question_type === "yes_no";
                
                return (
                  <div key={q.question_id} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-4 mb-6">
                      <span className="text-gray-400 font-medium w-6 mt-0.5">{idx + 1}.</span>
                      <div className="grow">
                        <h3 className="text-lg font-medium text-gray-900">{q.question_title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{q.total_answers} answers</p>
                      </div>
                    </div>

                    {requiresDistribution ? (
                      <div className="pl-10 space-y-4 w-full">
                        {Object.entries(q.distribution || {}).map(([answer, count]) => {
                          const percentage = q.total_answers > 0 ? Math.round((count as number / q.total_answers) * 100) : 0;
                          return (
                            <div key={answer} className="flex items-center gap-4">
                              <div className="w-1/3 truncate text-sm text-gray-700 font-medium">{answer}</div>
                              <div className="w-2/3 flex items-center gap-3">
                                <div className="grow h-6 bg-blue-50 rounded overflow-hidden">
                                  <div 
                                    className="h-full bg-[#0445af] rounded"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <div className="text-sm text-gray-500 w-12 text-right">{percentage}%</div>
                                <div className="text-xs text-gray-400 w-8 text-right">({count as number})</div>
                              </div>
                            </div>
                          );
                        })}
                        {Object.keys(q.distribution || {}).length === 0 && (
                          <p className="text-sm text-gray-400 italic">No data to display.</p>
                        )}
                      </div>
                    ) : (
                      <div className="pl-10">
                        <p className="text-sm text-gray-500">Text-based responses. View in <span className="font-medium">Responses tab</span> to read individual answers.</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {stats.questions.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                  No questions found in this form.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "responses" && (
          <div className="absolute inset-0 flex overflow-hidden animate-in fade-in duration-200">
            <div className={`grow flex flex-col transition-all duration-300 ${selectedResponse ? 'mr-96' : ''}`}>
              <div className="p-6 pb-2 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <h2 className="text-lg font-medium text-gray-900">Responses</h2>
                <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">{responses.length}</span>
              </div>
              <div className="grow overflow-auto bg-white">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase tracking-wider w-16">#</th>
                      <th className="p-4 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase tracking-wider">Submitted Date</th>
                      <th className="p-4 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">No responses yet.</td>
                      </tr>
                    ) : (
                      responses.map(res => (
                        <tr 
                          key={res.id} 
                          onClick={() => handleSelectResponse(res.id)}
                          className={`cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                            selectedResponse?.id === res.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="p-4 text-gray-500">{res.id}</td>
                          <td className="p-4 text-gray-900 font-medium">
                            {new Date(res.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" })}
                          </td>
                          <td className="p-4 text-right">
                            <button className="text-sm font-medium text-[#0445af] hover:underline">View details</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedResponse && (
              <div className="absolute top-0 bottom-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-in slide-in-from-right-10 duration-200 z-20">
                <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 shrink-0 bg-gray-50">
                  <h3 className="font-medium text-gray-900">Response #{selectedResponse.id}</h3>
                  <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grow overflow-y-auto p-6 flex flex-col gap-6">
                  {selectedResponse.answers.map((ans, idx) => {
                    const question = form.questions.find(q => q.id === ans.question_id);
                    return (
                      <div key={ans.id} className="border border-gray-100 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Question {idx + 1}</div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">{question?.title || "Unknown question"}</h4>
                        <div className="bg-gray-50 rounded text-[15px] text-gray-700 p-3 whitespace-pre-wrap">
                          {ans.value}
                        </div>
                      </div>
                    );
                  })}
                  {selectedResponse.answers.length === 0 && (
                    <div className="text-center text-gray-500">No answers recorded.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
