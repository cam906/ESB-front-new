"use client";
import React from "react";

type TeamImageProps = {
  name: string;
  logo?: string | null;
  size?: number;
};

export default function TeamImage({ name, logo, size = 84 }: TeamImageProps) {
  const bucket = process.env.NEXT_PUBLIC_ESB_COMPETITOR_ASSETS || "";
  const base = `https://s3-ap-southeast-2.amazonaws.com/${bucket}`;
  const src = logo ? `${base}/competitors/${logo}` : undefined;
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} width={size} height={size} className="object-contain" />
      ) : (
        <div style={{ width: size, height: size }} className="bg-gray-300 dark:bg-gray-700" />
      )}
      <span className="text-sm md:text-base max-w-[12rem] leading-tight break-words" title={name}>{name}</span>
    </div>
  );
}


