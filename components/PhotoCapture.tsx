"use client";

import React, { useRef, useState } from "react";
import { Camera, X, AlertCircle, Loader2, Sparkles } from "lucide-react";

export type ExtractKind = "auto" | "temperature" | "bloodtest" | "weight" | "feeding" | "treatment";

interface PhotoCaptureProps {
  kind: ExtractKind;
  title?: string;
  onExtracted: (result: Record<string, unknown>) => void;
  onClose: () => void;
}

const MAX_DIMENSION = 1600;

// スマホ撮影の大きな写真をAPI送信前に縮小・圧縮する（リクエストサイズ超過やタイムアウトを防ぐため）
function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const [meta, data] = result.split(",");
          const mediaType = meta.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
          resolve({ data, mediaType });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const [, data] = dataUrl.split(",");
        resolve({ data, mediaType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PhotoCapture({ kind, title = "写真から自動入力", onExtracted, onClose }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const { data, mediaType } = await fileToBase64(file);
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: data, mediaType, kind }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "解析に失敗しました。");
        return;
      }
      onExtracted(json.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
            <Sparkles size={16} className="text-violet-500" />
            {title}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!previewUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 py-12 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 hover:bg-violet-100 transition-colors"
            >
              <Camera size={32} className="text-violet-500" />
              <span className="text-sm font-semibold text-violet-700">タップして撮影・写真を選択</span>
              <span className="text-xs text-violet-400">カルテ、血液検査票、体重計、体温計などを撮影</span>
            </button>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="プレビュー" className="w-full rounded-xl border border-gray-200 max-h-72 object-contain bg-gray-50" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreviewUrl(null); setError(""); }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                  disabled={loading}
                >
                  撮り直す
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 shadow-md shadow-violet-200 flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      解析中...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      AIで解析する
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleSelect}
            className="hidden"
          />

          <p className="text-xs text-gray-400 text-center">
            解析結果は保存前に内容を確認できます。読み取り間違いがあれば修正してください。
          </p>
        </div>
      </div>
    </div>
  );
}
