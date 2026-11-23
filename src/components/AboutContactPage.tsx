import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  Loader2,
  Mail,
  Send,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { submitContactMessage } from '../services/api';
import type { ContactFormInput } from '../types/interview';
import { validateContactForm } from '../utils/interviewLogic';

interface AboutContactPageProps {
  onStartInterview: () => void;
}

const ABOUT_IMAGE_SRC = '/src/assets/images/about_coaching_session_1795415872834.jpg';

const INITIAL_FORM: ContactFormInput = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function AboutContactPage({ onStartInterview }: AboutContactPageProps) {
  const [form, setForm] = useState<ContactFormInput>(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ContactFormInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const check = validateContactForm(form);
    if (!check.valid) {
      setFieldErrors(check.errors);
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await submitContactMessage(form);
      setSubmittedRef(res.referenceId);
      setForm(INITIAL_FORM);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ambient-backdrop min-h-[calc(100vh-65px)] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* About InterviewAce AI */}
        <section id="about" className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-sm font-medium text-[#6994FF]">About InterviewAce AI</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Practical Interview Preparation Powered by Google Gemini
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              InterviewAce AI was built to bridge the gap between textbook learning and high-pressure hiring
              interviews. College students, B.Tech graduates, and working professionals often struggle not
              because they lack knowledge, but because they rarely get honest, structured feedback before a
              real interview loop.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Using structured Google Gemini AI pipelines on a secure server backend, InterviewAce AI generates
              role-calibrated technical and HR questions, grades every written response on technical accuracy
              and communication clarity, highlights specific gaps, writes realistic model answers, and exports
              comprehensive PDF scorecards.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onStartInterview}
                className="rounded-xl bg-[#477BFF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0]"
              >
                Start a Practice Interview
              </button>
              <a
                href="#contact-form"
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative h-full min-h-[260px] overflow-hidden rounded-2xl border border-slate-800 bg-[#111A2E]">
              {!imgFailed ? (
                <img
                  src={ABOUT_IMAGE_SRC}
                  alt="Calm study workspace with technical notebook and laptop prepared for mock interview practice"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[260px] flex-col items-center justify-center bg-gradient-to-br from-[#111A2E] to-[#080D1B] p-6 text-center">
                  <BookOpen className="h-9 w-9 text-[#477BFF]" aria-hidden="true" />
                  <p className="mt-3 font-display text-base font-semibold text-white">
                    InterviewAce AI Coaching Platform
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Customer Support Section */}
        <section className="mt-16 border-t border-slate-800/80 pt-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#8857FF]">Customer Support</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Need Help with Your Practice Sessions?
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="glass-surface rounded-2xl p-6">
              <Mail className="h-5 w-5 text-[#6994FF]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-base font-semibold text-white">Email Support</h3>
              <p className="mt-2 text-sm text-slate-400">
                Reach our team for technical assistance, interview role requests, or feedback.
              </p>
              <a
                href="mailto:support@interviewace.ai"
                className="mt-4 inline-block font-mono text-sm font-medium text-[#6994FF] hover:text-white transition-colors"
              >
                support@interviewace.ai
              </a>
            </div>

            <div className="glass-surface rounded-2xl p-6">
              <Headphones className="h-5 w-5 text-[#A17AFF]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-base font-semibold text-white">
                Student &amp; Placement Support
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Dedicated guidance for college placement cells, B.Tech capstone demos, and student clubs.
              </p>
              <p className="mt-4 font-mono text-sm text-slate-300">campus@interviewace.ai</p>
            </div>

            <div className="glass-surface rounded-2xl p-6">
              <Clock className="h-5 w-5 text-[#6994FF]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-base font-semibold text-white">Response Window</h3>
              <p className="mt-2 text-sm text-slate-400">
                Support messages are answered Monday to Saturday, 9:00 AM – 7:00 PM IST.
              </p>
              <p className="mt-4 text-xs font-medium text-slate-300">Typical reply within 24 hours</p>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="mt-16 border-t border-slate-800/80 pt-14">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-sm font-medium text-[#6994FF]">Send a Message</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Get in Touch with Our Team
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Have a question about evaluation rubrics, PDF reports, or custom interview tracks? Submit the
                form and we will follow up by email.
              </p>
            </div>

            <div className="glass-surface rounded-2xl p-6 sm:p-8 lg:col-span-7">
              {submittedRef ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" aria-hidden="true" />
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">
                    Message Received
                  </h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Thank you for contacting InterviewAce AI. Our support team has logged your inquiry under
                    reference <span className="font-mono font-semibold text-[#6994FF]">{submittedRef}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="mt-6 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 hover:border-slate-500 hover:text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-slate-200">
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, name: e.target.value }));
                          setFieldErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Aarav Patel"
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080D1B] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#477BFF] focus:outline-none"
                      />
                      {fieldErrors.name && (
                        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-slate-200">
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }));
                          setFieldErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="you@example.com"
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080D1B] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#477BFF] focus:outline-none"
                      />
                      {fieldErrors.email && (
                        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-200">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, subject: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                      }}
                      placeholder="Question about mock interview scoring"
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080D1B] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#477BFF] focus:outline-none"
                    />
                    {fieldErrors.subject && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
                        {fieldErrors.subject}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-slate-200">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => {
                        setForm((prev) => ({ ...prev, message: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      placeholder="Tell us how we can help you prepare..."
                      className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-[#080D1B] p-4 text-sm text-white placeholder-slate-500 focus:border-[#477BFF] focus:outline-none"
                    />
                    {fieldErrors.message && (
                      <p role="alert" className="mt-1.5 text-xs font-medium text-rose-400">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-950/35 px-4 py-3 text-xs text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#477BFF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3A6DF0] disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          <span>Sending…</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
