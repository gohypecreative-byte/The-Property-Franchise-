// src/components/ui/ContactSection.tsx
"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { scifiAudio } from "@/lib/audio";

export interface ContactSectionProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  onOpenVideo?: () => void;
}

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ENQUIRY_TYPES = ["Franchise", "Investor", "Acquisition", "General"] as const;
type EnquiryType = (typeof ENQUIRY_TYPES)[number];

const FIELDS = [
  { id: "fullName", label: "Name", type: "text", required: true, autoComplete: "name" },
  { id: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { id: "phone", label: "Phone", type: "tel", required: false, autoComplete: "tel" },
  { id: "company", label: "Company", type: "text", required: false, autoComplete: "organization" },
] as const;

type FieldId = (typeof FIELDS)[number]["id"];

export function ContactSection({ scrollContainerRef }: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax: title drifts slower than the page, the disc rises and turns
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [30, -60]);
  const discY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const discRotate = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const ruleScale = useTransform(scrollYProgress, [0.1, 0.45], [0, 1]);

  const [form, setForm] = useState<Record<FieldId, string>>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
  });
  const [message, setMessage] = useState("");
  const [enquiryType, setEnquiryType] = useState<EnquiryType>("Franchise");
  const [focused, setFocused] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const viewport = { once: true, margin: "-10% 0px", root: scrollContainerRef as React.RefObject<Element> };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scifiAudio.playHoloBeep(980, 0.1);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      scifiAudio.playHoloBeep(1350, 0.16);
    }, 900);
  };

  const handleReset = () => {
    scifiAudio.playHoloBeep(850, 0.08);
    setForm({ fullName: "", email: "", phone: "", company: "" });
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <section
      id="contact-us"
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#F7F9FC] text-[#012169] selection:bg-[#E4002B] selection:text-white"
    >
      {/* Top hairline drawn in as the section enters */}
      <motion.div style={{ scaleX: ruleScale }} className="h-px w-full origin-left bg-[#012169]/20" />

      <div className="relative mx-auto max-w-[1600px] px-5 pt-8 pb-20 md:px-8 md:pt-10 md:pb-28">
        {/* Editorial header row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-2 gap-4 text-[11px] uppercase leading-[1.4] tracking-[0.12em] md:grid-cols-4"
        >
          <span className="font-semibold">04 — Comms</span>
          <span className="hidden text-[#012169]/55 md:block">Contact &amp; enquiries</span>
          <span className="hidden text-[#012169]/55 md:block">Franchise · Investor · General</span>
          <span className="flex items-center justify-end gap-2 text-right">
            Transmitting
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#E4002B]" />
          </span>
        </motion.div>

        {/* Title with parallax drift */}
        <motion.h1
          style={{ y: titleY }}
          className="mt-6 font-medium leading-[0.9] tracking-[-0.055em] text-[clamp(52px,9vw,150px)] md:mt-8"
        >
          {["Let's", "talk."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }}
              >
                {i === 1 ? (
                  <>
                    talk<span className="text-[#E4002B]">.</span>
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <div className="mt-8 grid gap-12 md:mt-10 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          {/* Left: short intro + parallax disc */}
          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="max-w-sm text-base leading-relaxed text-[#012169]/75 md:text-lg"
            >
              Franchise, investor and general enquiries. Tell us a little about what you have in mind.
            </motion.p>

            <motion.div
              style={{ y: discY, rotate: discRotate }}
              className="relative mt-14 hidden aspect-square w-[min(340px,70%)] lg:block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full bg-[#0A1633]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/station-comms.jpg"
                  alt="A deep space network dish antenna"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute inset-0 rounded-full bg-[#012169]/15 mix-blend-multiply" />
              </span>
              <span className="absolute -inset-3 rounded-full border border-dashed border-[#012169]/25 animate-[spin_40s_linear_infinite]" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">
                04 Comms · Signals
              </span>
            </motion.div>
          </div>

          {/* Right: form */}
          <div>
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="border-t border-[#012169]/20 pt-8"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#E4002B]">Message received</p>
                  <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] md:text-6xl">
                    Thank you{form.fullName ? `, ${form.fullName.split(" ")[0]}` : ""}.
                  </h2>
                  <p className="mt-4 max-w-md text-base text-[#012169]/70">
                    We&apos;ll be in touch about your {enquiryType.toLowerCase()} enquiry.
                  </p>
                  <button
                    onClick={handleReset}
                    className="group mt-8 inline-flex items-center gap-2 border-b border-[#012169]/40 pb-1 text-[12px] font-semibold uppercase tracking-[0.12em] hover:border-[#E4002B] hover:text-[#E4002B] transition-colors cursor-pointer"
                  >
                    Send another
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  {/* Enquiry type */}
                  <motion.fieldset
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{ duration: 0.7, ease: EASE }}
                    className="border-t border-[#012169]/20 pt-5"
                  >
                    <legend className="sr-only">Enquiry type</legend>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">Enquiry</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ENQUIRY_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            setEnquiryType(t);
                            scifiAudio.playHoloBeep(880, 0.04);
                          }}
                          aria-pressed={enquiryType === t}
                          className={`rounded-full border px-4 py-2 text-[12px] uppercase tracking-[0.1em] transition-colors cursor-pointer ${
                            enquiryType === t
                              ? "border-[#012169] bg-[#012169] text-white"
                              : "border-[#012169]/20 text-[#012169]/70 hover:border-[#012169]/60 hover:text-[#012169]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </motion.fieldset>

                  {/* Fields: label left, input right, hairline rows */}
                  <div className="mt-8 border-b border-[#012169]/20">
                    {FIELDS.map((f, i) => (
                      <motion.label
                        key={f.id}
                        htmlFor={f.id}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={viewport}
                        transition={{ duration: 0.7, delay: 0.05 * i, ease: EASE }}
                        className="group relative grid cursor-text grid-cols-[110px_1fr] items-baseline gap-4 border-t border-[#012169]/20 py-4 md:grid-cols-[160px_1fr]"
                      >
                        <span
                          className={`text-[11px] uppercase tracking-[0.14em] transition-colors ${
                            focused === f.id ? "text-[#E4002B]" : "text-[#012169]/55"
                          }`}
                        >
                          {f.label}
                          {f.required && " *"}
                        </span>
                        <input
                          id={f.id}
                          type={f.type}
                          required={f.required}
                          autoComplete={f.autoComplete}
                          value={form[f.id]}
                          onFocus={() => setFocused(f.id)}
                          onBlur={() => setFocused(null)}
                          onChange={(e) => setForm({ ...form, [f.id]: e.target.value })}
                          className="w-full bg-transparent text-lg text-[#012169] outline-none placeholder:text-[#012169]/25 md:text-xl"
                        />
                        {/* Focus underline sweep */}
                        <span
                          className={`pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left bg-[#E4002B] transition-transform duration-500 ${
                            focused === f.id ? "scale-x-100" : "scale-x-0"
                          }`}
                        />
                      </motion.label>
                    ))}
                    <motion.label
                      htmlFor="message"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={viewport}
                      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
                      className="relative grid cursor-text grid-cols-[110px_1fr] items-baseline gap-4 border-t border-[#012169]/20 py-4 md:grid-cols-[160px_1fr]"
                    >
                      <span
                        className={`text-[11px] uppercase tracking-[0.14em] transition-colors ${
                          focused === "message" ? "text-[#E4002B]" : "text-[#012169]/55"
                        }`}
                      >
                        Message
                      </span>
                      <textarea
                        id="message"
                        rows={3}
                        value={message}
                        onFocus={() => setFocused("message")}
                        onBlur={() => setFocused(null)}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full resize-none bg-transparent text-lg text-[#012169] outline-none md:text-xl"
                      />
                      <span
                        className={`pointer-events-none absolute -bottom-px left-0 h-px w-full origin-left bg-[#E4002B] transition-transform duration-500 ${
                          focused === "message" ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </motion.label>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={viewport}
                    transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
                    className="mt-8 flex flex-wrap items-center justify-between gap-4"
                  >
                    <span className="text-[11px] uppercase tracking-[0.14em] text-[#012169]/55">* Required</span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group inline-flex items-center gap-3 rounded-full bg-[#012169] py-2 pl-7 pr-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#E4002B] disabled:opacity-60 cursor-pointer"
                    >
                      {isSubmitting ? "Sending…" : "Send enquiry"}
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#012169] transition-transform duration-300 group-hover:translate-x-1">
                        {isSubmitting ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#012169] border-t-transparent" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
