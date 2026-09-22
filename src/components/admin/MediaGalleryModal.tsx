"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Loader2,
  Search,
  Trash2,
  Copy,
  ExternalLink,
  Cloud,
  HardDrive,
  RefreshCw,
  Plus,
  Info,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export interface MediaItem {
  key: string;
  url: string;
  filename: string;
  size: number;
  lastModified: string;
  storage: "r2" | "local";
  folder?: string;
}

interface StorageStatus {
  configured: boolean;
  provider: "r2" | "local";
  bucket: string | null;
  publicUrl: string | null;
}

interface MediaGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedUrls: string[]) => void;
  initialSelectedUrls?: string[];
  multiple?: boolean;
  title?: string;
}

export function MediaGalleryModal({
  isOpen,
  onClose,
  onSelect,
  initialSelectedUrls = [],
  multiple = true,
  title = "Media Studio Gallery",
}: MediaGalleryModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload" | "url">("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storageFilter, setStorageFilter] = useState<"all" | "r2" | "local">("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [storageStatus, setStorageStatus] = useState<StorageStatus | null>(null);

  // Selection
  const [selectedUrls, setSelectedUrls] = useState<string[]>(initialSelectedUrls);
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  // Upload destination state
  const [uploadStorage, setUploadStorage] = useState<"r2" | "local">("r2");
  const [uploadFolder, setUploadFolder] = useState<string>("products");
  const [customFolderInput, setCustomFolderInput] = useState("");

  // Upload state
  const [dragActive, setDragActive] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL state
  const [directUrlInput, setDirectUrlInput] = useState("");
  const [directUrlPreviewError, setDirectUrlPreviewError] = useState(false);

  // Action status
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [migratingKey, setMigratingKey] = useState<string | null>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.media) {
        setMediaList(data.media);
      }
      if (data.storageStatus) {
        setStorageStatus(data.storageStatus);
      }
    } catch (err) {
      console.error("Failed to load media library:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrls(initialSelectedUrls);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        fetchMedia();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  if (!isOpen) return null;

  const toggleSelectUrl = (item: MediaItem) => {
    setActiveItem(item);
    if (!multiple) {
      setSelectedUrls([item.url]);
      return;
    }

    if (selectedUrls.includes(item.url)) {
      setSelectedUrls(selectedUrls.filter((u) => u !== item.url));
    } else {
      setSelectedUrls([...selectedUrls, item.url]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedUrls);
    onClose();
  };

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
        setSelectedUrls((prev) =>
          prev.map((u) => (u === item.url ? data.media.url : u))
        );
        setActiveItem({ ...item, ...data.media });
      } else {
        alert(data.error || "Failed to migrate file to Cloudflare R2");
      }
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Failed to migrate file to Cloudflare R2");
    } finally {
      setMigratingKey(null);
    }
  };

  const handleDeleteItem = async (item: MediaItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${item.filename}" from ${item.storage.toUpperCase()} storage?`)) {
      return;
    }

    setDeletingKey(item.key);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key }),
      });

      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.key !== item.key));
        setSelectedUrls((prev) => prev.filter((u) => u !== item.url));
        if (activeItem?.key === item.key) {
          setActiveItem(null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingKey(null);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
      setPendingFiles((prev) => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setPendingFiles((prev) => [...prev, ...files]);
    }
  };

  const handleStartUpload = async () => {
    if (pendingFiles.length === 0) return;

    setUploading(true);
    setUploadError("");
    const newUploadedUrls: string[] = [];
    const targetFolder =
      uploadFolder === "custom"
        ? customFolderInput.trim() || "products"
        : uploadFolder;

    for (let i = 0; i < pendingFiles.length; i++) {
      const file = pendingFiles[i];
      setUploadProgress(`Uploading ${i + 1} of ${pendingFiles.length}: ${file.name}...`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("storage", uploadStorage);
      formData.append("folder", targetFolder);

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          newUploadedUrls.push(data.url);
        } else {
          setUploadError(data.error || `Failed to upload ${file.name}`);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploadError(message);
      }
    }

    setUploading(false);
    setUploadProgress("");
    setPendingFiles([]);

    // Refresh media list and select newly uploaded files
    await fetchMedia();
    if (newUploadedUrls.length > 0) {
      setSelectedUrls((prev) => (multiple ? [...prev, ...newUploadedUrls] : newUploadedUrls));
      setActiveTab("library");
    }
  };

  const handleAddDirectUrl = () => {
    if (!directUrlInput.trim()) return;
    const url = directUrlInput.trim();
    if (!selectedUrls.includes(url)) {
      setSelectedUrls(multiple ? [...selectedUrls, url] : [url]);
    }
    setDirectUrlInput("");
    setActiveTab("library");
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs font-arial">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#F6F5EE] border-3 border-[#4D3F15] nubb-shadow-lg flex flex-col overflow-hidden text-[#4D3F15]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#E8E6D8] border-b-3 border-[#4D3F15] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#892F1A]" />
                <h2 className="font-spray text-2xl text-[#4D3F15] leading-none">{title}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {storageStatus?.configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 border border-emerald-700 text-emerald-800 font-lekton text-[10px] font-bold uppercase tracking-wider">
                    <Cloud className="w-3 h-3" />
                    Cloudflare R2 Bucket: {storageStatus.bucket}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 border border-amber-700 text-amber-900 font-lekton text-[10px] font-bold uppercase tracking-wider">
                    <HardDrive className="w-3 h-3" />
                    Local Storage Fallback (/public/uploads)
                  </span>
                )}
                <span className="text-[11px] font-lekton text-[#4D3F15]/60 font-bold hidden sm:inline">
                  {mediaList.length} items total
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="self-end sm:self-center p-2 border-2 border-[#4D3F15] bg-white hover:bg-[#892F1A] hover:text-[#E8E6D8] transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b-2 border-[#4D3F15] bg-white px-4 shrink-0 font-lekton text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-4 py-3 border-b-3 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "library"
                  ? "border-[#892F1A] text-[#892F1A] bg-[#E8E6D8]/40"
                  : "border-transparent text-[#4D3F15]/70 hover:text-[#4D3F15]"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media Library ({mediaList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-3 border-b-3 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "upload"
                  ? "border-[#892F1A] text-[#892F1A] bg-[#E8E6D8]/40"
                  : "border-transparent text-[#4D3F15]/70 hover:text-[#4D3F15]"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload New</span>
              {pendingFiles.length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#892F1A] text-white text-[10px] rounded-full">
                  {pendingFiles.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("url")}
              className={`px-4 py-3 border-b-3 transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === "url"
                  ? "border-[#892F1A] text-[#892F1A] bg-[#E8E6D8]/40"
                  : "border-transparent text-[#4D3F15]/70 hover:text-[#4D3F15]"
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Add via Direct URL</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {/* TAB 1: MEDIA LIBRARY */}
            {activeTab === "library" && (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Main Grid Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0 border-r-0 md:border-r-2 border-[#4D3F15]/20">
                  {/* Toolbar with Search, Storage Filter & Folder Filter */}
                  <div className="p-3 bg-[#E8E6D8]/40 border-b border-[#4D3F15]/20 flex flex-wrap items-center gap-2.5 shrink-0">
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#4D3F15]/50" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search images by name or key..."
                        className="w-full pl-9 pr-4 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] placeholder-[#4D3F15]/40 focus:outline-none"
                      />
                    </div>

                    {/* Storage Provider Filter */}
                    <div className="flex items-center gap-1">
                      <select
                        value={storageFilter}
                        onChange={(e) => setStorageFilter(e.target.value as "all" | "r2" | "local")}
                        className="px-2.5 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] focus:outline-none"
                      >
                        <option value="all">All Storage</option>
                        <option value="r2">Cloudflare R2</option>
                        <option value="local">Local Storage</option>
                      </select>
                    </div>

                    {/* Folder Filter */}
                    <div className="flex items-center gap-1">
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
                    </div>

                    <button
                      onClick={fetchMedia}
                      disabled={loading}
                      className="p-2 border-2 border-[#4D3F15] bg-white hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors cursor-pointer disabled:opacity-50"
                      title="Refresh library"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Gallery Grid */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {loading && mediaList.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#892F1A]" />
                        <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70">
                          Loading Media Assets...
                        </p>
                      </div>
                    ) : mediaList.length === 0 ? (
                      <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-[#4D3F15]/40 bg-white/60">
                        <ImageIcon className="w-12 h-12 text-[#4D3F15]/30 mb-2" />
                        <p className="font-spray text-xl text-[#4D3F15]">No Images Found</p>
                        <p className="font-lekton text-xs text-[#4D3F15]/70 mt-1 max-w-sm">
                          {searchQuery
                            ? `No media items matching "${searchQuery}"`
                            : "Upload your first product photo or asset to build your gallery."}
                        </p>
                        <button
                          onClick={() => setActiveTab("upload")}
                          className="mt-4 px-4 py-2 bg-[#4D3F15] text-[#E8E6D8] font-lekton text-xs font-bold uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Images Now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {mediaList
                          .filter((item) => {
                            const matchesStorage =
                              storageFilter === "all" || item.storage === storageFilter;
                            const matchesFolder =
                              folderFilter === "all" || (item.folder || "general") === folderFilter;
                            return matchesStorage && matchesFolder;
                          })
                          .map((item) => {
                            const isSelected = selectedUrls.includes(item.url);
                            const isActive = activeItem?.key === item.key;

                            return (
                              <div
                                key={item.key}
                                onClick={() => toggleSelectUrl(item)}
                                className={`group relative aspect-square bg-white border-2 transition-all cursor-pointer overflow-hidden ${
                                  isSelected
                                    ? "border-[#892F1A] ring-3 ring-[#892F1A]/30 shadow-md"
                                    : isActive
                                    ? "border-[#4D3F15] ring-2 ring-[#4D3F15]/20"
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

                                {/* Selection Indicator Checkbox */}
                                <div className="absolute top-1.5 right-1.5">
                                  <div
                                    className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? "bg-[#892F1A] border-[#892F1A] text-white"
                                        : "bg-white/80 border-[#4D3F15] text-transparent group-hover:text-[#4D3F15]/40"
                                    }`}
                                  >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                </div>

                                {/* Bottom Info Overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white opacity-95 group-hover:opacity-100 transition-opacity">
                                  <p className="font-lekton text-[10px] font-bold truncate leading-tight">
                                    {item.filename}
                                  </p>
                                  <p className="font-lekton text-[9px] text-white/70">
                                    {formatBytes(item.size)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail & Inspector Sidebar */}
                <div className="w-full md:w-80 bg-white border-t md:border-t-0 border-[#4D3F15]/20 flex flex-col overflow-y-auto shrink-0 p-4 font-arial text-xs">
                  {activeItem ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2">
                        <span className="font-lekton font-bold uppercase text-[11px] text-[#892F1A]">
                          Selected Media Details
                        </span>
                        <span
                          className={`px-1.5 py-0.5 font-lekton text-[9px] font-bold uppercase ${
                            activeItem.storage === "r2"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {activeItem.storage.toUpperCase()} Storage
                        </span>
                      </div>

                      {/* Image Preview */}
                      <div className="aspect-video w-full border-2 border-[#4D3F15] bg-[#E8E6D8]/30 overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={activeItem.url}
                          alt={activeItem.filename}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Local File Notice & Manual R2 Migration Button */}
                      {activeItem.storage === "local" && (
                        <div className="p-3 bg-amber-50 border-2 border-amber-300 space-y-2">
                          <div className="flex items-start gap-1.5 text-amber-900">
                            <HardDrive className="w-4 h-4 mt-0.5 shrink-0 text-amber-700" />
                            <div className="font-lekton text-xs font-bold leading-snug">
                              <span>Local Storage Asset</span>
                              <p className="text-[11px] font-normal text-amber-800 mt-0.5">
                                If attached to a product, this will automatically upload to Cloudflare R2 upon saving.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleMigrateToR2(activeItem)}
                            disabled={migratingKey === activeItem.key}
                            className="w-full py-2 bg-[#892F1A] text-white font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#640017] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {migratingKey === activeItem.key ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading to R2...</span>
                              </>
                            ) : (
                              <>
                                <Cloud className="w-3.5 h-3.5" />
                                <span>Upload to Cloudflare R2 Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Metadata Table */}
                      <div className="space-y-2 font-lekton text-xs">
                        <div>
                          <span className="text-[#4D3F15]/60 font-bold block text-[10px] uppercase">
                            Filename
                          </span>
                          <span className="font-bold break-all text-[#4D3F15]">
                            {activeItem.filename}
                          </span>
                        </div>

                        <div>
                          <span className="text-[#4D3F15]/60 font-bold block text-[10px] uppercase">
                            File Key / Path
                          </span>
                          <span className="font-mono text-[10px] break-all text-[#4D3F15]/80">
                            {activeItem.key}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[#4D3F15]/60 font-bold block text-[10px] uppercase">
                              File Size
                            </span>
                            <span className="font-bold text-[#4D3F15]">
                              {formatBytes(activeItem.size)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#4D3F15]/60 font-bold block text-[10px] uppercase">
                              Modified Date
                            </span>
                            <span className="font-bold text-[#4D3F15]">
                              {formatDate(activeItem.lastModified)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-[#4D3F15]/20">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(activeItem.url)}
                          className="w-full py-2 bg-[#E8E6D8] border border-[#4D3F15] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedUrl === activeItem.url ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>URL Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Public URL</span>
                            </>
                          )}
                        </button>

                        <a
                          href={activeItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2 bg-white border border-[#4D3F15] font-lekton font-bold text-xs uppercase tracking-wider text-center hover:bg-[#4D3F15] hover:text-[#E8E6D8] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in New Tab</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleDeleteItem(activeItem)}
                          disabled={deletingKey === activeItem.key}
                          className="w-full py-2 bg-rose-50 border border-rose-700 text-rose-800 font-lekton font-bold text-xs uppercase tracking-wider hover:bg-rose-700 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {deletingKey === activeItem.key ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete from Storage</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#4D3F15]/50 space-y-2">
                      <Info className="w-8 h-8 opacity-40" />
                      <p className="font-lekton text-xs font-bold uppercase">
                        Select an image to inspect details, copy URL, or delete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DRAG & DROP UPLOAD */}
            {activeTab === "upload" && (
              <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-start">
                <div className="w-full max-w-2xl space-y-5">
                  {/* Storage Destination & Folder Configuration */}
                  <div className="bg-white border-2 border-[#4D3F15] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2">
                      <span className="font-lekton font-bold uppercase text-xs text-[#892F1A] flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>Choose Upload Destination</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Storage Target */}
                      <div className="space-y-1.5">
                        <label className="font-lekton text-xs font-bold uppercase text-[#4D3F15]">
                          Storage Target
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setUploadStorage("r2")}
                            className={`py-2 px-2.5 border-2 font-lekton text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
                            className={`py-2 px-2.5 border-2 font-lekton text-xs font-bold uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                              uploadStorage === "local"
                                ? "border-[#892F1A] bg-[#892F1A] text-white"
                                : "border-[#4D3F15]/40 bg-white text-[#4D3F15] hover:border-[#4D3F15]"
                            }`}
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Local Folder</span>
                          </button>
                        </div>
                        <p className="font-lekton text-[10px] text-[#4D3F15]/60">
                          {uploadStorage === "r2"
                            ? "Stores on Cloudflare R2 CDN bucket (media.nubb.store)."
                            : "Saves into local filesystem (/public/uploads/). Auto-uploads to R2 if used in a product."}
                        </p>
                      </div>

                      {/* Folder Destination */}
                      <div className="space-y-1.5">
                        <label className="font-lekton text-xs font-bold uppercase text-[#4D3F15]">
                          Destination Folder
                        </label>
                        <select
                          value={uploadFolder}
                          onChange={(e) => setUploadFolder(e.target.value)}
                          className="w-full px-3 py-2 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] focus:outline-none focus:bg-white"
                        >
                          <option value="products">products (default)</option>
                          <option value="banners">banners</option>
                          <option value="lookbook">lookbook</option>
                          <option value="general">general</option>
                          <option value="custom">Custom local folder...</option>
                        </select>

                        {uploadFolder === "custom" && (
                          <input
                            type="text"
                            value={customFolderInput}
                            onChange={(e) => setCustomFolderInput(e.target.value)}
                            placeholder="e.g. summer-drop"
                            className="w-full px-3 py-1.5 bg-white border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] focus:outline-none mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                      dragActive
                        ? "border-[#892F1A] bg-[#892F1A]/10 scale-[1.01]"
                        : "border-[#4D3F15] bg-white hover:bg-[#E8E6D8]/30"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-[#E8E6D8] border-2 border-[#4D3F15] flex items-center justify-center">
                      <Upload className="w-7 h-7 text-[#892F1A]" />
                    </div>

                    <div>
                      <p className="font-spray text-2xl text-[#4D3F15]">
                        Drop Images Here
                      </p>
                      <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/70 mt-1">
                        Destination: {uploadStorage === "r2" ? "Cloudflare R2" : "Local Storage"} &rarr; /{uploadFolder === "custom" ? (customFolderInput || "custom") : uploadFolder}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-lekton text-[#4D3F15]/60 font-bold mt-1">
                      <span>PNG, JPG, WEBP, GIF, AVIF</span>
                      <span>&bull;</span>
                      <span>Up to 12MB each</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-rose-100 border-2 border-rose-800 text-rose-900 font-arial text-xs font-bold">
                      {uploadError}
                    </div>
                  )}

                  {/* Pending files preview */}
                  {pendingFiles.length > 0 && (
                    <div className="bg-white border-2 border-[#4D3F15] p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#4D3F15]/20 pb-2">
                        <span className="font-lekton font-bold uppercase text-xs text-[#892F1A]">
                          Ready to Upload ({pendingFiles.length} files)
                        </span>
                        <button
                          type="button"
                          onClick={() => setPendingFiles([])}
                          className="font-lekton text-xs text-rose-700 hover:underline font-bold"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto">
                        {pendingFiles.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative border border-[#4D3F15] p-1.5 bg-[#E8E6D8]/20 flex items-center gap-2"
                          >
                            <div className="w-10 h-10 bg-white border border-[#4D3F15] shrink-0 overflow-hidden flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-lekton text-[10px] font-bold truncate">
                                {file.name}
                              </p>
                              <p className="font-lekton text-[9px] text-[#4D3F15]/60">
                                {formatBytes(file.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
                              }}
                              className="p-1 hover:text-rose-700 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleStartUpload}
                        disabled={uploading}
                        className="w-full py-3.5 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-sm uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center justify-center gap-2 nubb-shadow cursor-pointer disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{uploadProgress || "Uploading..."}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload {pendingFiles.length} Images to Cloudflare R2</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DIRECT URL */}
            {activeTab === "url" && (
              <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
                <div className="w-full max-w-xl bg-white border-3 border-[#4D3F15] p-6 sm:p-8 space-y-6">
                  <div>
                    <h3 className="font-spray text-2xl text-[#4D3F15]">Add Image by Direct URL</h3>
                    <p className="font-lekton text-xs font-bold uppercase tracking-wider text-[#4D3F15]/60 mt-1">
                      Paste a public image link (CDN or Cloudflare URL)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="font-lekton text-xs uppercase font-bold text-[#4D3F15]">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={directUrlInput}
                      onChange={(e) => {
                        setDirectUrlInput(e.target.value);
                        setDirectUrlPreviewError(false);
                      }}
                      placeholder="https://pub-xxxx.r2.dev/products/image.jpg"
                      className="w-full px-4 py-2.5 bg-[#E8E6D8]/30 border-2 border-[#4D3F15] font-lekton text-xs font-bold text-[#4D3F15] focus:outline-none focus:bg-white"
                    />
                  </div>

                  {directUrlInput && (
                    <div className="space-y-2">
                      <span className="font-lekton text-xs font-bold uppercase text-[#4D3F15]/70">
                        Live Preview:
                      </span>
                      <div className="aspect-video w-full border-2 border-[#4D3F15] bg-[#E8E6D8]/20 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={directUrlInput}
                          alt="Direct preview"
                          onError={() => setDirectUrlPreviewError(true)}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      {directUrlPreviewError && (
                        <p className="font-lekton text-xs text-rose-700 font-bold">
                          Unable to load image from this URL. Please verify the link.
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddDirectUrl}
                    disabled={!directUrlInput.trim()}
                    className="w-full py-3 bg-[#4D3F15] text-[#E8E6D8] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#892F1A] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Attach this Image URL</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#E8E6D8] border-t-3 border-[#4D3F15] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-lekton text-xs font-bold text-[#4D3F15]">
                {selectedUrls.length === 0 ? (
                  <span className="text-[#4D3F15]/60">No images selected</span>
                ) : (
                  <span className="text-[#892F1A]">{selectedUrls.length} image(s) selected</span>
                )}
              </span>

              {selectedUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedUrls([])}
                  className="font-lekton text-xs font-bold text-[#4D3F15]/70 hover:text-rose-700 underline cursor-pointer"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white border-2 border-[#4D3F15] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSelection}
                disabled={selectedUrls.length === 0}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[#892F1A] text-white border-2 border-[#4D3F15] font-lekton font-bold text-xs uppercase tracking-wider hover:bg-[#640017] transition-all flex items-center justify-center gap-2 nubb-shadow cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Insert {selectedUrls.length > 0 ? `(${selectedUrls.length})` : ""} Into Product</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
