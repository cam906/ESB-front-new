"use client";
import React from "react";

type TeamImageProps = {
  name: string;
  logo?: string | null;
  size?: number;
};

export default function TeamImage({ name, logo, size = 40 }: TeamImageProps) {
  const base = process.env.NEXT_PUBLIC_ESB_COMPETITOR_ASSETS || "";
  const src = logo ? `${base}${logo}` : undefined;
  return (
    <div className="flex items-center gap-2">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" />
      ) : (
        <div style={{ width: size, height: size }} className="rounded-full bg-gray-300 dark:bg-gray-700" />
      )}
      <span className="text-sm md:text-base truncate" title={name}>{name}</span>
    </div>
  );
}


