"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getForms, createForm, updateForm, deleteForm, duplicateForm, unpublishForm } from "../lib/form-api";
import type { Form } from "../types/form";

export default function WorkspacePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();
    const [showBanner, setShowBanner] = useState(true);
    const [showSuggestion, setShowSuggestion] = useState(true);
    const [forms, setForms] = useState<Form[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [renameForm, setRenameForm] = useState<Form | null>(null);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    useEffect(() => {
        getForms().then(setForms).catch(console.error);
    }, []);

    const handleCreateForm = async () => {
        if (isCreating) return;
        setIsCreating(true);
        try {
            const newForm = await createForm("New form");
            router.push(`/forms/${newForm.id}/create`);
        } catch (error) {
            console.error(error);
            addToast("Failed to create form", "error");
            setIsCreating(false);
        }
    };

    const handleRenameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (renameForm && newTitle && newTitle.trim() !== "" && newTitle !== renameForm.title) {
            try {
                await updateForm(renameForm.id, newTitle);
                setForms(forms.map(f => f.id === renameForm.id ? { ...f, title: newTitle } : f));
                addToast("Form renamed successfully", "success");
            } catch (error) {
                console.error("Failed to rename form", error);
                addToast("Failed to rename form", "error");
            }
        }
        setRenameForm(null);
        setNewTitle("");
    };

    const handleDuplicate = async (form: Form) => {
        try {
            const duplicatedForm = await duplicateForm(form.id);
            setForms([duplicatedForm, ...forms]);
            addToast("Form duplicated successfully", "success");
        } catch (error) {
            console.error("Failed to duplicate form", error);
            addToast("Failed to duplicate form", "error");
        }
    };

    const handleCopyLink = (form: Form) => {
        if (!form.public_id) {
            addToast("This form hasn't been published yet.", "error");
            return;
        }
        const link = `${window.location.origin}/f/${form.public_id}`;
        navigator.clipboard.writeText(link).then(() => {
            addToast("Link copied to clipboard!", "success");
        });
    };

    const handleDelete = async (formId: number) => {
        if (window.confirm("Are you sure you want to delete this form?")) {
            try {
                await deleteForm(formId);
                setForms(forms.filter(f => f.id !== formId));
                addToast("Form deleted successfully", "success");
            } catch (error) {
                console.error("Failed to delete form", error);
                addToast("Failed to delete form", "error");
            }
        }
    };

    const handleUnpublish = async (formId: number) => {
        try {
            const updatedForm = await unpublishForm(formId);
            setForms(forms.map(f => f.id === formId ? updatedForm : f));
            addToast("Form unpublished", "success");
        } catch (error) {
            console.error("Failed to unpublish form", error);
            addToast("Failed to unpublish form", "error");
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div className="min-h-screen bg-[#f9f9f9] text-[#191919] font-sans flex flex-col">
            <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#2d5649] rounded-md flex items-center justify-center text-white text-xs font-medium">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                    </div>
                    <span className="text-sm text-gray-700 font-medium cursor-pointer flex items-center gap-1">
                        {user?.name || "rjranjan2112"}
                        <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                </div>
                <div className="flex items-center gap-6 text-[13px] text-gray-600 font-medium">
                    <button className="flex items-center gap-1.5 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Integrations
                    </button>
                    <button className="flex items-center gap-1.5 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Brand kit
                    </button>
                    <button className="hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                    <div className="w-7 h-7 bg-[#c1e1c1] rounded-full flex items-center justify-center text-xs text-[#2d5649] font-medium ml-2">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                    </div>
                </div>
            </header>

            {showBanner && (
                <div className="px-4 py-3 shrink-0">
                    <div className="bg-[#f8fbfa] border border-[#a2c8c2] rounded-xl px-4 py-2 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3 w-full justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" cursor="unset"><path fill="currentColor" d="M7.468 4a2 2 0 0 0-1.536.72L1.816 9.658a2 2 0 0 0 .123 2.695L10.586 21a2 2 0 0 0 2.828 0l8.647-8.647a2 2 0 0 0 .122-2.695L18.068 4.72A2 2 0 0 0 16.532 4zm0 2h9.064l4.115 4.939L12 19.586l-8.647-8.647zm2.97 3.647a1 1 0 1 0-1.525-1.294l-.425.5-.006.007-1.25 1.5a1 1 0 0 0 .06 1.348l2 2a1 1 0 1 0 1.415-1.415L9.353 10.94l.662-.795z" fillRule="evenodd" clipRule="evenodd"></path></svg>
                            <span className="text-sm text-gray-700">You can collect <span className="font-semibold text-black">10 form responses</span> this month for free.</span>
                            <button className="bg-[#2d5649] text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-[#204036] transition-colors">
                                Get more responses
                            </button>
                        </div>
                        <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="grow flex flex-col px-4 pb-4 overflow-hidden">

                <nav className="flex items-center gap-8 border-b border-gray-200 shrink-0 mb-4 px-2">
                    <button className="border-b-2 border-black pb-3 pt-2 text-sm font-medium text-black flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Forms
                    </button>
                    <button className="border-b-2 border-transparent pb-3 pt-2 text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Contacts
                    </button>
                    <button className="border-b-2 border-transparent pb-3 pt-2 text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Automations
                    </button>
                    <button className="border-b-2 border-transparent pb-3 pt-2 text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Research Flow
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-100 ml-1">Demo</span>
                    </button>
                </nav>

                <div className="grow flex overflow-hidden">

                    <aside className="w-60 flex flex-col shrink-0 overflow-y-auto pr-4 border-r border-gray-200">
                        <button
                            onClick={handleCreateForm}
                            disabled={isCreating}
                            className="w-full bg-[#191919] text-white rounded-lg py-2.5 text-sm font-medium mb-6 hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create form
                        </button>

                        <div className="relative mb-6">
                            <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search"
                                className="w-full pl-9 pr-3 py-2 text-sm bg-transparent placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-300 rounded-md"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-3 text-sm text-gray-700 font-medium px-2">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Workspaces
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 rounded p-0.5 shadow-sm">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>

                        <button className="flex items-center justify-between w-full text-sm text-gray-700 px-2 py-1.5 hover:bg-gray-100 rounded-md mb-1">
                            Private
                            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>

                        <button className="flex items-center justify-between w-full text-sm text-gray-900 bg-[#ebebeb] px-3 py-1.5 rounded-md font-medium">
                            My workspace
                            <span className="text-gray-500 font-normal">1</span>
                        </button>

                        <div className="mt-auto pt-6 border-t border-gray-200 pr-2 pl-1">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Responses collected</h4>
                            <div className="w-full h-1 bg-gray-200 rounded-full mb-2 overflow-hidden">
                                <div className="w-[1%] h-full bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="text-xs text-gray-500 font-medium mb-4">0 / 10</div>
                            <button className="text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.05)] inline-block">
                                Increase response limit
                            </button>
                        </div>

                        <div className="mt-6 mb-2 bg-white border border-purple-200/60 rounded-xl p-1.5 flex items-center shadow-[0_0_15px_rgba(216,180,226,0.25)] relative">
                            <div className="absolute -inset-0.5 bg-linear-to-r from-purple-200 to-pink-200 rounded-xl blur opacity-20"></div>
                            <svg className="w-4 h-4 text-gray-600 ml-1 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Ask Typeform AI"
                                className="grow text-[13px] px-2 py-1 focus:outline-none bg-transparent relative z-10 placeholder:text-gray-400"
                            />
                            <button className="w-7 h-7 flex items-center justify-center bg-gray-50 border border-gray-200 rounded text-gray-400 relative z-10 hover:bg-gray-100">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </aside>

                    <main className="grow flex flex-col pl-8 overflow-y-auto pt-2">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-medium text-gray-900">My workspace</h1>
                                <button className="text-gray-400 hover:text-gray-600 px-1">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                    </svg>
                                </button>
                                <button className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium px-2 py-1 hover:bg-gray-100 rounded-md">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Invite
                                </button>
                                <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center border border-teal-100 ml-1 shadow-sm">
                                    <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Date created
                                    <svg className="w-3 h-3 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div className="flex items-center bg-[#ebebeb] rounded-md p-0.5">
                                    <button className="flex items-center gap-1.5 text-[13px] font-medium bg-white shadow-sm px-3 py-1 rounded">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        List
                                    </button>
                                    <button className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 px-3 py-1 rounded hover:text-gray-700">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Grid
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showSuggestion && (
                            <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-gray-100 rounded-xl p-4 flex items-start gap-4 mb-10 relative">
                                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                </div>
                                <div className="grow pr-10 pt-0.5">
                                    <p className="text-[13px] font-medium text-gray-700 mb-3">Create a Collect opinions and suggestions to enhance group reading experiences.</p>
                                    <button className="text-[11px] font-medium text-gray-700 bg-white border border-gray-200 rounded px-2.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-gray-50">
                                        Use this form
                                    </button>
                                </div>
                                <button onClick={() => setShowSuggestion(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="pb-4 font-normal text-xs text-gray-500 w-[45%]"></th>
                                    <th className="pb-4 font-normal text-xs text-gray-500 text-center">Responses</th>
                                    <th className="pb-4 font-normal text-xs text-gray-500 text-center">Completed</th>
                                    <th className="pb-4 font-normal text-xs text-gray-500 text-center">Updated</th>
                                    <th className="pb-4 font-normal text-xs text-gray-500 text-center">Integrations</th>
                                    <th className="pb-4 font-normal text-xs text-gray-500 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {forms.map(form => (
                                    <tr key={form.id} className="bg-white group">
                                        <td className="p-3 rounded-l-xl border-t border-b border-l border-gray-100 group-hover:border-gray-200 transition-colors relative shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center justify-between pr-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-[10px] bg-[#558a5e] flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
                                                        <div className="absolute inset-0 bg-black/10"></div>
                                                        <svg className="w-5 h-5 text-white/90 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <span
                                                        onClick={() => router.push(`/forms/${form.id}/create`)}
                                                        className="text-[15px] font-medium text-gray-900 group-hover:underline cursor-pointer"
                                                    >
                                                        {form.title}
                                                    </span>
                                                </div>
                                                <div>
                                                    {form.status === "published" ? (
                                                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-200">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-semibold tracking-wider uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded-md border border-gray-200">
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center text-[13px] text-gray-400 border-t border-b border-gray-100 group-hover:border-gray-200 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                            {form.response_count > 0 ? <span className="text-gray-900 font-medium">{form.response_count}</span> : "-"}
                                        </td>
                                        <td className="p-3 text-center text-[13px] text-gray-400 border-t border-b border-gray-100 group-hover:border-gray-200 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">-</td>
                                        <td className="p-3 text-center text-[13px] text-gray-500 border-t border-b border-gray-100 group-hover:border-gray-200 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">{formatDate(form.updated_at)}</td>
                                        <td className="p-3 text-center border-t border-b border-gray-100 group-hover:border-gray-200 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                            <button className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center p-1 rounded hover:bg-gray-50">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="p-3 rounded-r-xl text-right border-t border-b border-r border-gray-100 group-hover:border-gray-200 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    e.nativeEvent.stopImmediatePropagation();
                                                    setActiveDropdown(activeDropdown === form.id ? null : form.id);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 inline-flex items-center justify-center p-1 rounded hover:bg-gray-50 "
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                                </svg>
                                            </button>
                                            {activeDropdown === form.id && (
                                                <div
                                                    className="absolute right-8 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 text-left overflow-hidden animate-in fade-in zoom-in duration-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => { 
                                                            setActiveDropdown(null); 
                                                            setRenameForm(form); 
                                                            setNewTitle(form.title);
                                                        }}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        onClick={() => { setActiveDropdown(null); handleCopyLink(form); }}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Copy link
                                                    </button>
                                                    <button
                                                        onClick={() => { setActiveDropdown(null); handleDuplicate(form); }}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                                                    >
                                                        Duplicate
                                                    </button>
                                                    {form.status === "published" && (
                                                        <button
                                                            onClick={() => { setActiveDropdown(null); handleUnpublish(form.id); }}
                                                            className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                                                        >
                                                            Unpublish
                                                        </button>
                                                    )}
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button
                                                        onClick={() => { setActiveDropdown(null); handleDelete(form.id); }}
                                                        className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </main>
                </div>
            </div>

            {renameForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5">
                            <h3 className="text-xl font-medium text-gray-900 mb-1">Rename form</h3>
                            <p className="text-sm text-gray-500 mb-6">Choose a new name for your form.</p>
                            <form onSubmit={handleRenameSubmit}>
                                <input
                                    type="text"
                                    autoFocus
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                                    placeholder="Form name"
                                />
                                <div className="mt-8 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRenameForm(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!newTitle.trim() || newTitle === renameForm.title}
                                        className="px-5 py-2 text-sm font-medium text-white bg-[#191919] hover:bg-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
