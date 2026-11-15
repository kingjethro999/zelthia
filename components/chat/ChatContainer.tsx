"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  PhoneCall,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { BiometricProfile, ChatMessage } from "@/lib/ai/types";
import { BiometricsDrawer } from "./BiometricsDrawer";
import { BiometricsBanner } from "./BiometricsBanner";
import { ChatMessageItem } from "./ChatMessageItem";
import { QuickStarters } from "./QuickStarters";

const STORAGE_KEY_BIO = "zelthia_biometrics_profile_v1";

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome-1",
  role: "assistant",
  content: `### Welcome to Zelthia AI Health Companion

I am your clinical triage companion and local care navigator. I can assist you with:

- **Symptom Assessment & Triage**: Evaluating fever, rashes, infections, or acute discomfort with safety guardrails.
- **Biometric Safety Cross-Checks**: Screening medications against your allergies, chronic conditions, and active prescriptions.
- **Local Care & Inventory Navigation**: Directing you to verified community pharmacies and clinics with step-by-step landmark directions.

> **Emergency Notice**: If you or someone with you experiences crushing chest pain, difficulty breathing, or sudden numbness, call **112 / 911** or visit the nearest emergency room immediately.

Select a quick starter below or describe what you are experiencing.`,
  timestamp: "Just now",
  triageLevel: "low",
};

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_WELCOME_MESSAGE,
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [biometrics, setBiometrics] = useState<BiometricProfile>({
    age: "",
    biologicalSex: "",
    bloodGroup: "",
    allergies: [],
    chronicConditions: [],
    currentMedications: [],
    notes: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load biometrics from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BIO);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setBiometrics(parsed);
        }
      }
    } catch {
      // LocalStorage unavailable or invalid JSON
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSaveBiometrics = (updated: BiometricProfile) => {
    setBiometrics(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BIO, JSON.stringify(updated));
    } catch {
      // LocalStorage write error
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          biometrics,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API responded with status ${res.status}`);
      }

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.message || "Zelthia processed your request.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        triageLevel: data.triageLevel || "low",
        referral: data.referral,
        modelUsed: data.model,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `### ⚠️ Connection Notice

I am experiencing temporary difficulty connecting to the remote medical engine.

For immediate symptom evaluation, please check your connection or consult a verified healthcare provider at your nearest local clinic or pharmacy. In an emergency, dial **112 / 911** immediately.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        triageLevel: "moderate",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("Start a new health consultation session?")) {
      setMessages([INITIAL_WELCOME_MESSAGE]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation & Health Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
                Zelthia AI Companion
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                Live Triage
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Biometric-aware clinical guidance & pharmacy navigator
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Emergency Alert Tag */}
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <PhoneCall className="h-3.5 w-3.5 text-red-600" />
            <span>Emergency: 112 / 911</span>
          </div>

          {/* Biometrics Setup Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Configure personal health biometrics"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Biometrics Profile</span>
            <span className="sm:hidden">Profile</span>
          </button>

          {/* Reset chat */}
          <button
            onClick={handleResetChat}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title="Start new consultation"
            aria-label="Reset chat"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Active Biometric Context Banner */}
      <BiometricsBanner
        profile={biometrics}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* Main Chat Message Feed */}
      <main className="flex-1 overflow-y-auto pb-4">
        <div className="mx-auto max-w-4xl py-2">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start gap-2.5 my-3 px-4 animate-fade-in">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                  <span>
                    Evaluating symptoms against clinical protocols &
                    biometrics...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Sticky Bottom Input Bar */}
      <footer className="sticky bottom-0 z-20 border-t border-slate-200/90 bg-white/95 px-4 pt-2 pb-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Quick Prompts */}
          <QuickStarters
            onSelectPrompt={(prompt) => handleSendMessage(prompt)}
            disabled={isLoading}
          />

          {/* Input field & Submit */}
          <div className="relative mt-1 flex items-center rounded-2xl border border-slate-300 bg-slate-50 shadow-xs focus-within:border-teal-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:focus-within:bg-slate-800">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, ask about medications, or check local pharmacy stock..."
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden dark:text-white dark:placeholder-slate-500"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs transition-all hover:bg-teal-700 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Safety Disclaimer Subtext */}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Zelthia AI provides informational health guidance and verified
              care referrals. In emergencies, call your local medical emergency
              service (112 / 911).
            </p>
          </div>
        </div>
      </footer>

      {/* Biometrics Setup Modal / Drawer */}
      <BiometricsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        profile={biometrics}
        onSave={handleSaveBiometrics}
      />
    </div>
  );
};
