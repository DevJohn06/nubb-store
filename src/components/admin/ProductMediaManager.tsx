"use client";

import React, { useState, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Plus,
  Loader2,
  Layers,
  HardDrive,
} from "lucide-react";
import { MediaGalleryModal } from "./MediaGalleryModal";

interface ProductMediaManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
}

export function ProductMediaManager({
  images,
  onChange,
  error,
}: ProductMediaManagerProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [uploadingDirect, setUploadingDirect] = useState(false);
  const [directUploadError, setDirectUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasLocalImages = images.some(
    (img) =>
      img.startsWith("/uploads/") ||
      img.startsWith("/media/") ||
      (img.startsWith("/") && !img.startsWith("//"))
  );

  const handleGallerySelect = (selectedUrls: string[]) => {
    // Merge without duplicates while preserving order
    const merged = Array.from(new Set([...images, ...selectedUrls]));
    onChange(merged);
  };

  const handleRemoveImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    onChange([target, ...rest]);
  };

  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const next = [...images];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onChange(next);
  };

  const handleDirectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingDirect(true);
    setDirectUploadError("");

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storage", "r2");
      formData.append("folder", "products");

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrls.push(data.url);
        } else {
          setDirectUploadError(data.error || "Upload failed");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload image";
        setDirectUploadError(message);
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    }

    setUploadingDirect(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 font-arial">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4D3F15]/20 pb-2">
        <div>
          <label className="font-lekton text-xs uppercase tracking-wider text-[#4D3F15] font-bold flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#892F1A]" />
            <span>Product Media Gallery ({images.length} photos)</span>
          </label>
          <p className="font-lekton text-[11px] text-[#4D3F15]/60 font-bold">
            First image is primary store cover. Local photos auto-upload to Cloudflare R2 upon save.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Gallery Modal CTA */}
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="px-3 py-1.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center gap-1.5 cursor-pointer nubb-shadow-sm"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Browse Media Gallery</span>
          </button>

          {/* Quick Direct Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingDirect}
            className="px-3 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold uppercase tracking-wider hover:bg-[#E8E6D8] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploadingDirect ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to R2</span>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleDirectFiles}
            className="hidden"
          />
        </div>
      </div>

      {hasLocalImages && (
        <div className="p-2.5 bg-amber-50 border-2 border-amber-300 font-lekton text-xs font-bold text-amber-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            One or more images are stored locally. They will be automatically migrated to Cloudflare R2 CDN when you save this product.
          </span>
        </div>
      )}

      {(error || directUploadError) && (
        <div className="p-2.5 bg-rose-100 border border-rose-800 text-rose-900 text-xs font-bold">
          {error || directUploadError}
        </div>
      )}

      {/* Grid of Images */}
      {images.length === 0 ? (
        <div
          onClick={() => setIsGalleryOpen(true)}
          className="border-2 border-dashed border-[#4D3F15]/50 bg-white/60 p-8 text-center cursor-pointer hover:bg-white transition-colors flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center group-hover:scale-105 transition-transform">
            <ImageIcon className="w-6 h-6 text-[#892F1A]" />
          </div>
          <p className="font-spray text-xl text-[#4D3F15]">No Product Images Attached</p>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
            Click here to open Media Gallery or upload photos to Cloudflare R2
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img, idx) => {
            const isCover = idx === 0;
            const isLocal =
              img.startsWith("/uploads/") ||
              img.startsWith("/media/") ||
              (img.startsWith("/") && !img.startsWith("//"));

            return (
              <div
                key={idx}
                className={`relative aspect-square border-2 bg-white group overflow-hidden ${
                  isCover ? "border-[#892F1A] ring-2 ring-[#892F1A]/30" : "border-[#4D3F15]"
                }`}
              >
                {/* Thumbnail Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Product photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Primary Cover Badge */}
                {isCover ? (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#892F1A] text-white font-lekton text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    <span>Primary Cover</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 hover:bg-[#892F1A] text-white font-lekton text-[9px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1"
                    title="Set as Primary Cover photo"
                  >
                    <Star className="w-2.5 h-2.5" />
                    <span>Make Cover</span>
                  </button>
                )}

                {/* Local Sync Badge */}
                {isLocal && (
                  <div className="absolute bottom-6 left-1.5 px-1.5 py-0.5 bg-amber-700/90 text-white font-lekton text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs z-10 pointer-events-none">
                    <HardDrive className="w-2.5 h-2.5" />
                    <span>Auto-R2 on Save</span>
                  </div>
                )}

                {/* Top Right Actions: Preview & Remove */}
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(img)}
                    className="p-1 bg-black/60 hover:bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Preview High-Res"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 bg-rose-700 hover:bg-rose-800 text-white rounded-full opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove from product"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Bottom Reordering Controls */}
                <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-xs p-1 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveLeft(idx)}
                    className="p-0.5 hover:text-[#E8E6D8] disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-lekton text-[10px] font-bold">
                    #{idx + 1} of {images.length}
                  </span>

                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMoveRight(idx)}
                    className="p-0.5 hover:text-[#E8E6D8] disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                    title="Move Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add More Photos Trigger */}
          <button
            type="button"
            onClick={() => setIsGalleryOpen(true)}
            className="aspect-square border-2 border-dashed border-[#4D3F15] bg-white/50 hover:bg-white flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <Plus className="w-6 h-6 text-[#4D3F15]/60 group-hover:text-[#892F1A] mb-1 transition-colors" />
            <span className="font-lekton text-[10px] font-bold uppercase text-[#4D3F15]">
              Add Photo
            </span>
          </button>
        </div>
      )}

      {/* Modal Dialog for Media Gallery Selection */}
      <MediaGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelect={handleGallerySelect}
        initialSelectedUrls={images}
        multiple={true}
        title="Product Media Picker (Cloudflare R2)"
      />

      {/* Fullscreen Image Preview Lightbox */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white border-3 border-[#4D3F15] p-2">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 p-2 bg-[#892F1A] text-white border-2 border-white cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalUrl}
              alt="High res preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
