"use client";

import Image from "next/image";
import Link from "next/link";

export interface AuthArtPanelProps {
  imageSrc?: string;
  imageAlt?: string;
  badgeText?: string;
  statement?: string;
  description?: string;
  brandName?: string;
}

export function AuthArtPanel({
  imageSrc = "/assets/auth-art.jpg",
  imageAlt = "Studio Art",
  badgeText = "System Authenticated",
  statement = "Turn intuition into verifiable systems.",
  description = "Access high-velocity workspaces, evidence gates, and autonomous execution pipelines.",
  brandName = "Parabox",
}: AuthArtPanelProps) {
  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-[#0a0a0c] lg:block lg:h-screen lg:min-h-0 select-none"
      aria-label="Studio visual art panel"
    >
      {/* Background artwork */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(max-width: 1024px) 0vw, 50vw"
        className="object-cover object-center"
      />

      {/* Smooth bottom-up vignette gradient for impeccable text contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,12,0.15) 0%, rgba(10,10,12,0.4) 45%, rgba(10,10,12,0.88) 85%, rgba(10,10,12,0.98) 100%)",
        }}
      />

      {/* Editorial Content Area */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10 lg:p-14 text-white">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[12px] font-mono uppercase tracking-[0.16em] text-white/70 hover:text-white transition-colors"
          >
            {brandName}
          </Link>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[3px] border border-white/20 bg-black/40 backdrop-blur-md text-[10.5px] font-mono uppercase tracking-[0.12em] text-white/90">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{badgeText}</span>
          </div>
        </div>

        <div className="max-w-[460px] space-y-3 pb-4">
          <h2 className="text-[28px] sm:text-[32px] font-medium tracking-tight text-white leading-[1.2]">
            {statement}
          </h2>
          <p className="text-[14px] leading-relaxed text-white/75">
            {description}
          </p>
        </div>
      </div>
    </aside>
  );
}
