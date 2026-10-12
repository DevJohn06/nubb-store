"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Cloud,
  HardDrive,
  RefreshCw,
  Loader2,
  Check,
  Maximize2,
  Layers,
  X,
} from "lucide-react";
import { BrandLoader } from "@/components/common/BrandLoader";
import { MediaItem } from "@/components/admin/MediaGalleryModal";

interface StorageStatus {
  configured: boolean;
  provider: "r2" | "local";
  bucket: string | null;
  publicUrl: string | null;
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageFilter, setStorageFilter] = useState<"all" | "r2" | "local">("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  // Selection & Details
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [migratingKey, setMigratingKey] = useState<string | null>(null);

  // Upload destination state
  const [uploadStorage, setUploadStorage] = useState<"r2" | "local">("r2");
  const [uploadFolder, setUploadFolder] = useState<string>("products");
  const [customFolderInput, setCustomFolderInput] = useState("");

  // Uploading state
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
      if (data.storageStatus) {
        setStorageStatus(data.storageStatus);
      }
    } catch (err) {
      console.error("Failed to load media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleMigrateToR2 = async (item: MediaItem) => {
    setMigratingKey(item.key);
    try {
      const res = await fetch("/api/admin/media/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, folder: item.folder || "products" }),
      });
      const data = await res.json();
      if (res.ok && data.media) {
        setMediaList((prev) =>
          prev.map((m) => (m.key === item.key ? { ...m, ...data.media } : m))
        );
      } else {
        alert(data.error || "Failed to migrate file to Cloudflare R2");
      }
    } catch (err) {
      console.error("Migration failed", err);
      alert("Failed to migrate file to Cloudflare R2");
    } finally {
      setMigratingKey(null);
    }
  };

  const handleDeleteItem = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.filename}" from ${item.storage.toUpperCase()} storage?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });

      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.key !== item.key));
        setSelectedKeys((prev) => prev.filter((k) => k !== item.key));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeys.length === 0) return;
    if (!confirm(`Delete ${selectedKeys.length} selected images permanently from storage?`)) return;

    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: selectedKeys }),
      });

      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => !selectedKeys.includes(m.key)));
        setSelectedKeys([]);
      }
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  const toggleSelect = (key: string) => {
    if (selectedKeys.includes(key)) {
      setSelectedKeys(selectedKeys.filter((k) => k !== key));
    } else {
      setSelectedKeys([...selectedKeys, key]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDirectUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleDirectUpload = async (files: File[]) => {
    const validImages = files.filter((f) => f.type.startsWith("image/"));
    if (validImages.length === 0) return;

    setUploadingFiles(true);
    const targetFolder =
      uploadFolder === "custom"
        ? customFolderInput.trim() || "products"
        : uploadFolder;

    for (let i = 0; i < validImages.length; i++) {
      const file = validImages[i];
      setUploadProgress(`Uploading ${i + 1} of ${validImages.length}: ${file.name}...`);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storage", uploadStorage);
      formData.append("folder", targetFolder);

      try {
        await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Upload error", err);
      }
    }

    setUploadingFiles(false);
    setUploadProgress("");
    fetchMedia();
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.key.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStorage =
      storageFilter === "all" || item.storage === storageFilter;
    const matchesFolder =
      folderFilter === "all" || (item.folder || "general") === folderFilter;
    return matchesSearch && matchesStorage && matchesFolder;
  });

  return (
    <div className="space-y-6 font-arial">
      {/* Header & Storage Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#4D3F15] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-spray text-3xl sm:text-4xl text-[#4D3F15]">Media Studio</h1>
            <span className="px-2.5 py-0.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase">
              R2 Object Storage
            </span>
          </div>
          <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#892F1A] mt-1">
            Manage Cloudflare R2 images, view asset metadata & copy public URLs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFiles}
            className="px-4 py-2.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center gap-2 nubb-shadow cursor-pointer disabled:opacity-50"
          >
            {uploadingFiles ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadProgress || "Uploading..."}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload Photos</span>
              </>
            )}
          </button>

          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2.5 bg-white border-2 border-[#4D3F15] hover:bg-[#E8E6D8] transition-colors cursor-pointer"
            title="Refresh Library"
          >
            <RefreshCw className={`w-4 h-4 text-[#4D3F15] ${loading ? "animate-spin" : ""}`} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) handleDirectUpload(Array.from(e.target.files));
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Storage Information Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border-2 border-[#4D3F15] nubb-shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-[#892F1A]" />
          </div>
          <div className="min-w-0 flex-1 font-lekton">
            <span className="text-[10px] uppercase font-bold text-[#4D3F15]/60 block">
              Storage Backend
            </span>
            <span className="text-sm font-bold text-[#4D3F15] block truncate">
              {storageStatus?.configured ? "Cloudflare R2 Connected" : "Local Storage (/public/uploads)"}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-[#4D3F15] nubb-shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-[#892F1A]" />
          </div>
          <div className="min-w-0 flex-1 font-lekton">
            <span className="text-[10px] uppercase font-bold text-[#4D3F15]/60 block">
              Total Assets
            </span>
            <span className="text-sm font-bold text-[#4D3F15] block">
              {mediaList.length} Files
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-[#4D3F15] nubb-shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#E8E6D8] border border-[#4D3F15] flex items-center justify-center shrink-0">
            <ExternalLink className="w-5 h-5 text-[#892F1A]" />
          </div>
          <div className="min-w-0 flex-1 font-lekton">
            <span className="text-[10px] uppercase font-bold text-[#4D3F15]/60 block">
              Public CDN Endpoint
            </span>
            <span className="text-xs font-mono font-bold text-[#4D3F15] block truncate">
              {storageStatus?.publicUrl || "Local Server CDN"}
            </span>
          </div>
        </div>
      </div>

      {/* Destination Configuration Card */}
      <div className="bg-white border-2 border-[#4D3F15] p-4 nubb-shadow-sm space-y-3 font-lekton">
        <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2">
          <span className="font-bold uppercase text-xs text-[#892F1A] flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Upload Destination Settings</span>
          </span>
          <span className="text-[11px] text-[#4D3F15]/70 font-bold">
            Target: {uploadStorage === "r2" ? "Cloudflare R2 (media.nubb.store)" : "Local Filesystem (/public/uploads)"} &rarr; /{uploadFolder === "custom" ? (customFolderInput || "custom") : uploadFolder}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
          {/* Storage Destination Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase text-[#4D3F15] block">
              Storage Target
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUploadStorage("r2")}
                className={`py-2 px-3 border-2 uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  uploadStorage === "r2"
                    ? "border-[#892F1A] bg-[#892F1A] text-white"
                    : "border-[#4D3F15]/40 bg-white text-[#4D3F15] hover:border-[#4D3F15]"
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Cloudflare R2</span>
              </button>

              <button
                type="button"
                onClick={() => setUploadStorage("local")}
                className={`py-2 px-3 border-2 uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  uploadStorage === "local"
                    ? "border-[#892F1A] bg-[#892F1A] text-white"
                    : "border-[#4D3F15]/40 bg-white text-[#4D3F15] hover:border-[#4D3F15]"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Local Storage</span>
              </button>
            </div>
            <p className="text-[10px] text-[#4D3F15]/60">
              {uploadStorage === "r2"
                ? "Stores directly on Cloudflare R2 bucket with custom CDN URL."
                : "Saves locally into /public/uploads/. Auto-migrates to R2 when attached to a product."}
            </p>
          </div>

          {/* Folder Target */}
          <div className="space-y-1.5">
            <label className="text-xs uppercase text-[#4D3F15] block">
              Destination Folder
            </label>
            <select
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              className="w-full px-3 py-2 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] text-xs font-bold text-[#4D3F15] focus:outline-none focus:bg-white"
            >
              <option value="products">products (default)</option>
              <option value="banners">banners</option>
              <option value="lookbook">lookbook</option>
              <option value="general">general</option>
              <option value="custom">Custom folder name...</option>
            </select>

            {uploadFolder === "custom" && (
              <input
                type="text"
                value={customFolderInput}
                onChange={(e) => setCustomFolderInput(e.target.value)}
                placeholder="e.g. promotional-2026"
                className="w-full px-3 py-1.5 bg-white border-2 border-[#4D3F15] text-xs font-bold text-[#4D3F15] focus:outline-none mt-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag & Drop Quick Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          dragActive
            ? "border-[#892F1A] bg-[#892F1A]/10 scale-[1.005]"
            : "border-[#4D3F15]/40 bg-white/50 hover:bg-white hover:border-[#4D3F15]"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-[#E8E6D8] border-2 border-[#4D3F15] flex items-center justify-center">
          <Upload className="w-6 h-6 text-[#892F1A]" />
        </div>
        <span className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]">
          Drag & Drop Images here to upload to {uploadStorage === "r2" ? "Cloudflare R2" : "Local Storage"} &rarr; /{uploadFolder === "custom" ? (customFolderInput || "custom") : uploadFolder}
        </span>
        <span className="font-lekton text-[10px] text-[#4D3F15]/60">
          or click to browse files from your computer
        </span>
      </div>

      {/* Search, Filter & Bulk Actions Bar */}
      <div className="p-3 bg-white border-2 border-[#4D3F15] flex flex-col sm:flex-row items-center justify-between gap-3 font-lekton text-xs font-bold">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#4D3F15]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or path..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] focus:outline-none focus:bg-white text-[#4D3F15]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Storage Filter */}
          <div className="flex items-center gap-1 border-2 border-[#4D3F15] p-0.5 bg-[#E8E6D8]/30">
            <button
              onClick={() => setStorageFilter("all")}
              className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                storageFilter === "all" ? "bg-[#4D3F15] text-[#E8E6D8]" : "text-[#4D3F15]"
              }`}
            >
              All ({mediaList.length})
            </button>
            <button
              onClick={() => setStorageFilter("r2")}
              className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                storageFilter === "r2" ? "bg-[#4D3F15] text-[#E8E6D8]" : "text-[#4D3F15]"
              }`}
            >
              R2 ({mediaList.filter((m) => m.storage === "r2").length})
            </button>
            <button
              onClick={() => setStorageFilter("local")}
              className={`px-2.5 py-1 uppercase transition-colors cursor-pointer ${
                storageFilter === "local" ? "bg-[#4D3F15] text-[#E8E6D8]" : "text-[#4D3F15]"
              }`}
            >
              Local ({mediaList.filter((m) => m.storage === "local").length})
            </button>
          </div>

          {/* Folder Filter */}
          <select
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] focus:outline-none"
          >
            <option value="all">All Folders</option>
            {Array.from(
              new Set(
                mediaList
                  .map((m) => m.folder)
                  .filter((f): f is string => Boolean(f && f !== "root"))
              )
            )
              .sort()
              .map((f) => (
                <option key={f} value={f}>
                  /{f}
                </option>
              ))}
          </select>

          {selectedKeys.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-700 text-white font-bold uppercase hover:bg-rose-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedKeys.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Media Grid */}
      <div className="w-full">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <BrandLoader label="Loading Media Assets..." />
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-dashed border-[#4D3F15]/40 space-y-3">
            <ImageIcon className="w-12 h-12 text-[#4D3F15]/30 mx-auto" />
            <h3 className="font-spray text-2xl text-[#4D3F15]">No Images Found</h3>
            <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/60 max-w-sm mx-auto">
              {searchQuery
                ? `No photos matching "${searchQuery}"`
                : "Upload photos to manage your store assets."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {filteredMedia.map((item) => {
              const isSelected = selectedKeys.includes(item.key);

              return (
                <div
                  key={item.key}
                  className={`group relative aspect-square bg-white border-2 transition-all overflow-hidden ${
                    isSelected
                      ? "border-[#892F1A] ring-3 ring-[#892F1A]/30 shadow-md"
                      : "border-[#4D3F15]/40 hover:border-[#4D3F15]"
                  }`}
                >
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.filename}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Storage & Folder Badges */}
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 items-start">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-lekton font-bold uppercase tracking-wider shadow-xs ${
                        item.storage === "r2"
                          ? "bg-emerald-700 text-white"
                          : "bg-amber-700 text-white"
                      }`}
                    >
                      {item.storage === "r2" ? "R2" : "Local"}
                    </span>
                    {item.folder && item.folder !== "root" && (
                      <span className="px-1 py-0.2 bg-black/60 backdrop-blur-xs text-white text-[8px] font-lekton uppercase font-bold">
                        /{item.folder}
                      </span>
                    )}
                  </div>

                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(item.key)}
                    className="absolute top-1.5 right-1.5 cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#892F1A] border-[#892F1A] text-white"
                          : "bg-white/80 border-[#4D3F15] text-transparent group-hover:text-[#4D3F15]/40"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>

                  {/* Hover Quick Actions Overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/90 via-black/65 to-transparent text-white opacity-95 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                    <p className="font-lekton text-[10px] font-bold truncate">
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[9px] font-lekton text-white/70">
                      <span>{formatBytes(item.size)}</span>
                      <div className="flex items-center gap-1.5">
                        {item.storage === "local" && (
                          <button
                            type="button"
                            onClick={() => handleMigrateToR2(item)}
                            disabled={migratingKey === item.key}
                            className="p-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xs transition-colors cursor-pointer"
                            title="Upload to Cloudflare R2"
                          >
                            {migratingKey === item.key ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Cloud className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url)}
                          className="hover:text-white cursor-pointer"
                          title={copiedUrl === item.url ? "URL Copied!" : "Copy Public URL"}
                        >
                          {copiedUrl === item.url ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-white"
                          title="Open in New Tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setPreviewModalUrl(item.url)}
                          className="hover:text-white cursor-pointer"
                          title="Zoom Preview"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="hover:text-rose-400 cursor-pointer"
                          title="Delete from Storage"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
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
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
