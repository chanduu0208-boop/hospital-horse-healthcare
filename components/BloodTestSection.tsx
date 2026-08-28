"use client";

import React, { useMemo, useRef, useState } from "react";
import { Plus, Camera, Image as ImageIcon, Trash2, TestTube2, AlertCircle, Calendar, X } from "lucide-react";
import { Horse, BloodTestRecord, BloodTestItemValue } from "@/lib/types";
import { BLOOD_TEST_PRESETS, findPreset } from "@/lib/bloodTestConfig";
import PhotoCapture from "./PhotoCapture";

const PHOTO_MAX_DIMENSION = 1280;

// AIを使わず、検査票の写真をそのまま記録に添付するための軽量リサイズ（localStorage節約のため）
function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > PHOTO_MAX_DIMENSION || height > PHOTO_MAX_DIMENSION) {
          const scale = PHOTO_MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(reader.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PRESET_CATEGORIES = ["血球計算", "生化学"] as const;
const CUSTOM_CATEGORY = "その他";

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDate(d: string) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${y}/${m}/${day}`;
}
function formatShortDate(d: string) {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${parseInt(m)}/${parseInt(day)}`;
}
function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

interface ItemRow {
  uid: string;
  key: string;
  label: string;
  value: string;
  unit: string;
  flagged: boolean;
}

function blankRow(): ItemRow {
  return { uid: generateId(), key: "", label: "", value: "", unit: "", flagged: false };
}

interface BloodTestFormProps {
  initialDate?: string;
  initialItems?: BloodTestItemValue[];
  initialNotes?: string;
  onSave: (r: Omit<BloodTestRecord, "id">) => void;
  onClose: () => void;
}

function BloodTestForm({ initialDate, initialItems, initialNotes, onSave, onClose }: BloodTestFormProps) {
  const [date, setDate] = useState(initialDate ?? getToday());
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [rows, setRows] = useState<ItemRow[]>(
    initialItems && initialItems.length > 0
      ? initialItems.map((it) => ({ uid: generateId(), key: it.key, label: it.label, value: String(it.value), unit: it.unit ?? "", flagged: !!it.flagged }))
      : [blankRow()]
  );
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhotoLoading(true);
    try {
      const dataUrl = await compressImageToDataUrl(f);
      setPhoto(dataUrl);
    } finally {
      setPhotoLoading(false);
      e.target.value = "";
    }
  };

  const updateRow = (uid: string, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));
  };

  const handlePresetSelect = (uid: string, presetKey: string) => {
    if (presetKey === "__custom__") {
      updateRow(uid, { key: "", label: "", unit: "" });
      return;
    }
    const preset = findPreset(presetKey);
    if (preset) updateRow(uid, { key: preset.key, label: preset.label, unit: preset.unit });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items: BloodTestItemValue[] = [];
    for (const r of rows) {
      const label = r.label.trim() || r.key.trim();
      if (!label && !r.value.trim()) continue;
      const num = parseFloat(r.value);
      if (!label || isNaN(num)) continue;
      items.push({ key: r.key.trim() || label, label, value: num, unit: r.unit.trim() || undefined, flagged: r.flagged || undefined });
    }
    if (items.length === 0 && !photo) {
      setError("少なくとも1項目、名称と数値を入力するか、写真を添付してください。");
      return;
    }
    onSave({ date, items, notes: notes.trim() || undefined, photo: photo ?? undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">血液検査を記録</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検査日</label>
              <div className="relative">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 pointer-events-none">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{date === getToday() ? `今日 (${formatDate(date)})` : formatDate(date)}</span>
                </div>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value || getToday())}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">検査項目</label>
              <div className="space-y-2.5">
                {rows.map((row) => (
                  <div key={row.uid} className={`p-2.5 rounded-xl border space-y-2 ${row.flagged ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
                    <div className="flex items-center gap-2">
                      <select
                        value={BLOOD_TEST_PRESETS.some((p) => p.key === row.key) ? row.key : "__custom__"}
                        onChange={(e) => handlePresetSelect(row.uid, e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <option value="__custom__">項目を選択（自由入力も可）</option>
                        {PRESET_CATEGORIES.map((cat) => (
                          <optgroup key={cat} label={cat}>
                            {BLOOD_TEST_PRESETS.filter((p) => p.category === cat).map((p) => (
                              <option key={p.key} value={p.key}>{p.label}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {rows.length > 1 && (
                        <button type="button" onClick={() => setRows((prev) => prev.filter((r) => r.uid !== row.uid))}
                          className="p-1.5 hover:bg-red-100 rounded-lg flex-shrink-0">
                          <Trash2 size={14} className="text-red-300 hover:text-red-500" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="text" value={row.label} onChange={(e) => updateRow(row.uid, { label: e.target.value })}
                        placeholder="項目名"
                        className="flex-[2] border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      <input type="number" value={row.value} onChange={(e) => updateRow(row.uid, { value: e.target.value })}
                        placeholder="数値" step="0.01" inputMode="decimal"
                        className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300" />
                      <input type="text" value={row.unit} onChange={(e) => updateRow(row.uid, { unit: e.target.value })}
                        placeholder="単位"
                        className="w-20 border border-gray-200 rounded-lg px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-300" />
                    </div>
                    <button
                      type="button"
                      onClick={() => updateRow(row.uid, { flagged: !row.flagged })}
                      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                        row.flagged ? "bg-red-100 text-red-600 border-red-300" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <AlertCircle size={13} />
                      要注意の値としてハイライト
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setRows((prev) => [...prev, blankRow()])}
                className="mt-2 flex items-center gap-1 text-xs text-purple-600 font-medium bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg">
                <Plus size={13} />
                項目を追加
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">検査票の写真（任意・AIは使いません）</label>
              {!photo ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={photoLoading}
                    className="flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors disabled:opacity-60">
                    <Camera size={20} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">写真を撮る</span>
                  </button>
                  <button type="button" onClick={() => libraryInputRef.current?.click()} disabled={photoLoading}
                    className="flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50/40 transition-colors disabled:opacity-60">
                    <ImageIcon size={20} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500">保存済みの画像</span>
                  </button>
                </div>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="検査票プレビュー" className="w-full rounded-xl border border-gray-200 max-h-64 object-contain bg-gray-50" />
                  <button type="button" onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/75 rounded-lg text-white">
                    <X size={14} />
                  </button>
                </div>
              )}
              {photoLoading && <p className="text-xs text-gray-400 mt-1">読み込み中...</p>}
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
              <input ref={libraryInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
              <p className="text-xs text-gray-400 mt-1">写真を見ながら、上の項目を手入力してください。</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="所見など（任意）" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none" />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 shadow-md shadow-purple-200">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 項目タップ → 過去の値の推移（履歴モーダル）
// ============================================================

interface ItemHistoryModalProps {
  label: string;
  history: { date: string; value: number; unit?: string; flagged?: boolean }[];
  onClose: () => void;
}

function ItemHistoryModal({ label, history, onClose }: ItemHistoryModalProps) {
  return (
    <div className="fixed inset-0 z-[55] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">{label}の推移</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto overflow-x-hidden p-4 pb-8">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">まだこの項目の記録がありません</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((row, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${row.flagged ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">{formatDate(row.date)}</span>
                  <span className={`flex-1 text-sm font-semibold ${row.flagged ? "text-red-600" : i === 0 ? "text-purple-700" : "text-gray-700"}`}>
                    {row.value} {row.unit}
                  </span>
                  {row.flagged && <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 添付写真のフルサイズ表示
// ============================================================

function PhotoViewModal({ photo, onClose }: { photo: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[55] flex flex-col items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo} alt="検査票" className="max-w-full max-h-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

// ============================================================
// メイン：BloodTestSection
// ============================================================

const DEFAULT_VISIBLE_DATES = 3;

export default function BloodTestSection({ horse, onUpdate }: { horse: Horse; onUpdate: (h: Horse) => void }) {
  const [modal, setModal] = useState<"add" | "photo" | null>(null);
  const [prefill, setPrefill] = useState<{ date?: string; items?: BloodTestItemValue[]; notes?: string } | undefined>(undefined);
  const [selectedItemKey, setSelectedItemKey] = useState<string | null>(null);
  const [showRecordList, setShowRecordList] = useState(false);
  const [visibleDateCount, setVisibleDateCount] = useState(DEFAULT_VISIBLE_DATES);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const records = horse.bloodTestRecords ?? [];
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const displayedRecords = sorted.slice(0, visibleDateCount);
  const displayedMaps = useMemo(
    () => displayedRecords.map((r) => new Map(r.items.map((it) => [it.key, it]))),
    [displayedRecords]
  );

  // プリセット全項目 ＋ 記録に登場したカスタム項目 をまとめたチェックリスト
  const checklist = useMemo(() => {
    const items: { key: string; label: string; unit: string; category: string }[] = BLOOD_TEST_PRESETS.map((p) => ({
      key: p.key, label: p.label, unit: p.unit, category: p.category,
    }));
    const seen = new Set(items.map((i) => i.key));
    records.forEach((r) => {
      r.items.forEach((it) => {
        if (!seen.has(it.key)) {
          seen.add(it.key);
          items.push({ key: it.key, label: it.label, unit: it.unit ?? "", category: CUSTOM_CATEGORY });
        }
      });
    });
    return items;
  }, [records]);

  const categories = useMemo(() => {
    const cats = [...PRESET_CATEGORIES] as string[];
    if (checklist.some((i) => i.category === CUSTOM_CATEGORY)) cats.push(CUSTOM_CATEGORY);
    return cats;
  }, [checklist]);

  const selectedItem = selectedItemKey ? checklist.find((i) => i.key === selectedItemKey) : null;
  const selectedHistory = useMemo(() => {
    if (!selectedItemKey) return [];
    return [...records]
      .sort((a, b) => b.date.localeCompare(a.date))
      .flatMap((r) => {
        const it = r.items.find((v) => v.key === selectedItemKey);
        return it ? [{ date: r.date, value: it.value, unit: it.unit, flagged: it.flagged }] : [];
      });
  }, [records, selectedItemKey]);

  const handleSave = (r: Omit<BloodTestRecord, "id">) => {
    onUpdate({ ...horse, bloodTestRecords: [...records, { ...r, id: generateId() }] });
    setModal(null);
    setPrefill(undefined);
  };

  const handleDelete = (id: string) => {
    onUpdate({ ...horse, bloodTestRecords: records.filter((r) => r.id !== id) });
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <TestTube2 size={16} className="text-purple-500" />
          <h2 className="font-bold text-gray-700 text-sm">血液検査</h2>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setModal("photo")} className="flex items-center gap-1 text-xs text-violet-600 font-medium bg-violet-50 hover:bg-violet-100 px-2 py-1.5 rounded-lg transition-colors">
            <Camera size={13} />
          </button>
          <button onClick={() => { setPrefill(undefined); setModal("add"); }} className="flex items-center gap-1 text-xs text-purple-600 font-medium bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-lg transition-colors">
            <Plus size={13} />
            記録
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-gray-400 mb-3">まだ記録がありません（記録すると、項目をタップして推移を見られます）</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-2">項目をタップすると全期間の推移を見られます</p>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col style={{ width: "40%" }} />
                {displayedRecords.map((r) => <col key={r.id} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left text-[10px] font-semibold text-gray-400 pb-1.5 pl-1 sticky left-0 bg-white">項目</th>
                  {displayedRecords.map((r, i) => (
                    <th key={r.id} className={`text-center text-[11px] font-bold pb-1.5 ${i === 0 ? "text-purple-600" : "text-gray-400"}`}>
                      {formatShortDate(r.date)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <React.Fragment key={cat}>
                    <tr>
                      <td colSpan={displayedRecords.length + 1} className="pt-2.5 pb-1 pl-1 text-[10px] font-bold text-gray-400">
                        {cat}
                      </td>
                    </tr>
                    {checklist.filter((i) => i.category === cat).map((item, idx) => (
                      <tr key={item.key} className={idx % 2 === 1 ? "bg-gray-50" : ""}>
                        <td
                          onClick={() => setSelectedItemKey(item.key)}
                          className="py-1.5 pl-1 pr-1 cursor-pointer sticky left-0"
                          style={{ backgroundColor: idx % 2 === 1 ? "#f9fafb" : "#fff" }}
                        >
                          <div className="text-xs text-gray-700 leading-tight truncate">{item.label}</div>
                          <div className="text-[9px] text-gray-400 leading-tight">{item.unit}</div>
                        </td>
                        {displayedMaps.map((map, i) => {
                          const val = map.get(item.key);
                          return (
                            <td
                              key={i}
                              onClick={() => setSelectedItemKey(item.key)}
                              className={`text-center text-sm font-bold py-1.5 cursor-pointer ${
                                val?.flagged ? "bg-red-50 text-red-600" : val ? "text-gray-700" : "text-gray-300"
                              }`}
                            >
                              {val ? val.value : "－"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {sorted.length > visibleDateCount && (
            <button
              onClick={() => setVisibleDateCount((n) => Math.min(n + 3, sorted.length))}
              className="mt-2 text-xs text-purple-600 font-medium hover:text-purple-700"
            >
              もっと見る（+{Math.min(3, sorted.length - visibleDateCount)}日分）
            </button>
          )}

          {displayedRecords.some((r) => r.notes) && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              {displayedRecords.filter((r) => r.notes).map((r) => (
                <p key={r.id} className="text-xs text-gray-500 whitespace-pre-wrap">
                  <span className="font-semibold text-gray-600">{formatShortDate(r.date)}：</span>{r.notes}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {sorted.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button onClick={() => setShowRecordList((v) => !v)} className="text-xs text-gray-400 hover:text-gray-600">
            {showRecordList ? "過去の検査記録を閉じる ▲" : `過去の検査記録を管理 (${sorted.length}件) ▼`}
          </button>
          {showRecordList && (
            <div className="mt-2 space-y-1.5">
              {sorted.map((r) => (
                <div key={r.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                  {r.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo}
                      alt="検査票"
                      onClick={() => setViewingPhoto(r.photo!)}
                      className="w-8 h-8 rounded object-cover border border-gray-200 cursor-pointer flex-shrink-0"
                    />
                  )}
                  <span className="text-xs text-gray-500 flex-1">{formatDate(r.date)}（{r.items.length}項目）</span>
                  <button onClick={() => handleDelete(r.id)} className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <ItemHistoryModal label={selectedItem.label} history={selectedHistory} onClose={() => setSelectedItemKey(null)} />
      )}

      {viewingPhoto && (
        <PhotoViewModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} />
      )}

      {modal === "add" && (
        <BloodTestForm
          initialDate={prefill?.date}
          initialItems={prefill?.items}
          initialNotes={prefill?.notes}
          onSave={handleSave}
          onClose={() => { setModal(null); setPrefill(undefined); }}
        />
      )}
      {modal === "photo" && (
        <PhotoCapture
          kind="bloodtest"
          title="血液検査を写真から自動入力"
          onClose={() => setModal(null)}
          onExtracted={(result) => {
            const items = Array.isArray(result.items)
              ? (result.items as BloodTestItemValue[]).filter((it) => it && typeof it.value === "number")
              : [];
            setPrefill({
              date: typeof result.date === "string" ? result.date : getToday(),
              items,
              notes: typeof result.notes === "string" ? result.notes : undefined,
            });
            setModal("add");
          }}
        />
      )}
    </section>
  );
}
