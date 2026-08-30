"use client";

import React, { useState } from "react";
import { Plus, X, Pill, Syringe, Trash2, Edit2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Horse, MedicationSchedule, MedicationRoute } from "@/lib/types";

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
}

const ROUTES: MedicationRoute[] = ["経口", "静脈注射"];
const ROUTE_STYLE: Record<MedicationRoute, { bg: string; text: string; border: string; icon: typeof Pill }> = {
  経口: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Pill },
  静脈注射: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: Syringe },
};

function RouteBadge({ route }: { route: MedicationRoute }) {
  const s = ROUTE_STYLE[route];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${s.bg} ${s.text} ${s.border}`}>
      <Icon size={10} />
      {route}
    </span>
  );
}

// ============================================================
// 追加・編集フォーム
// ============================================================

interface MedicationFormProps {
  initial?: MedicationSchedule;
  onSave: (s: Omit<MedicationSchedule, "id" | "active">) => void;
  onClose: () => void;
}

function MedicationForm({ initial, onSave, onClose }: MedicationFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [route, setRoute] = useState<MedicationRoute>(initial?.route ?? "経口");
  const [dosage, setDosage] = useState(initial?.dosage ?? "");
  const [times, setTimes] = useState<string[]>(initial?.times && initial.times.length > 0 ? initial.times : ["08:00"]);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");

  const updateTime = (i: number, v: string) => setTimes((prev) => prev.map((t, idx) => (idx === i ? v : t)));
  const removeTime = (i: number) => setTimes((prev) => prev.filter((_, idx) => idx !== i));
  const addTime = () => setTimes((prev) => [...prev, "08:00"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("薬品名を入力してください。"); return; }
    const cleanTimes = [...new Set(times.filter(Boolean))].sort();
    if (cleanTimes.length === 0) { setError("投与時刻を1つ以上設定してください。"); return; }
    onSave({ name: name.trim(), route, dosage: dosage.trim() || undefined, times: cleanTimes, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-base">{initial ? "投薬内容を編集" : "投薬を登録"}</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">薬品名</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：バイトリル"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">投与経路</label>
              <div className="flex gap-2">
                {ROUTES.map((r) => {
                  const s = ROUTE_STYLE[r];
                  const Icon = s.icon;
                  const selected = route === r;
                  return (
                    <button key={r} type="button" onClick={() => setRoute(r)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                        selected ? `${s.bg} ${s.border} ${s.text}` : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      <Icon size={14} />
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用量（任意）</label>
              <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="例：10mg／1錠／5mL"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">投与時刻</label>
              <div className="space-y-2">
                {times.map((t, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="time" value={t} onChange={(e) => updateTime(i, e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
                    {times.length > 1 && (
                      <button type="button" onClick={() => removeTime(i)} className="p-2 hover:bg-red-50 rounded-lg flex-shrink-0">
                        <Trash2 size={14} className="text-red-300 hover:text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTime}
                className="mt-2 flex items-center gap-1 text-xs text-teal-600 font-medium bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg">
                <Plus size={13} />
                時刻を追加
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="注意点など（任意）" rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
              <button type="submit" className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-bold hover:bg-teal-700 shadow-md shadow-teal-200">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 削除確認
// ============================================================

function ConfirmDeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-5 w-full max-w-sm">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-gray-700">「{name}」の投薬予定を削除しますか？記録も削除されます。</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">キャンセル</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">削除する</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// メイン：MedicationSection
// ============================================================

export default function MedicationSection({ horse, onUpdate }: { horse: Horse; onUpdate: (h: Horse) => void }) {
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<MedicationSchedule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicationSchedule | null>(null);
  const [showEnded, setShowEnded] = useState(false);

  const schedules = horse.medicationSchedules ?? [];
  const activeSchedules = schedules.filter((s) => s.active);
  const endedSchedules = schedules.filter((s) => !s.active);

  // 投与予定を時刻順にフラット化（薬名＋時刻のチップ表示用）
  const scheduleItems = activeSchedules
    .flatMap((s) => s.times.map((t) => ({ schedule: s, time: t })))
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleSaveSchedule = (s: Omit<MedicationSchedule, "id" | "active">) => {
    if (editTarget) {
      onUpdate({
        ...horse,
        medicationSchedules: schedules.map((sc) => (sc.id === editTarget.id ? { ...sc, ...s } : sc)),
      });
    } else {
      const newSchedule: MedicationSchedule = { id: generateId(), active: true, ...s };
      onUpdate({ ...horse, medicationSchedules: [...schedules, newSchedule] });
    }
    setModal(null);
    setEditTarget(null);
  };

  const handleEnd = (s: MedicationSchedule) => {
    onUpdate({ ...horse, medicationSchedules: schedules.map((sc) => (sc.id === s.id ? { ...sc, active: false } : sc)) });
  };

  const handleResume = (s: MedicationSchedule) => {
    onUpdate({ ...horse, medicationSchedules: schedules.map((sc) => (sc.id === s.id ? { ...sc, active: true } : sc)) });
  };

  const handleDelete = (s: MedicationSchedule) => {
    onUpdate({ ...horse, medicationSchedules: schedules.filter((sc) => sc.id !== s.id) });
    setDeleteTarget(null);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Pill size={16} className="text-teal-500" />
          <h2 className="font-bold text-gray-700 text-sm">投薬</h2>
        </div>
        <button
          onClick={() => { setEditTarget(null); setModal("add"); }}
          className="flex items-center gap-1 text-xs text-teal-600 font-medium bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Plus size={13} />
          お薬を登録
        </button>
      </div>

      {activeSchedules.length === 0 ? (
        <p className="text-xs text-gray-400">まだ投薬予定が登録されていません。</p>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-2">投与予定（時刻順）</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {scheduleItems.map(({ schedule, time }) => {
              const s = ROUTE_STYLE[schedule.route];
              const Icon = s.icon;
              return (
                <span
                  key={`${schedule.id}_${time}`}
                  className={`inline-flex items-center gap-1 text-xs font-bold pl-2 pr-2.5 py-1.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}
                >
                  <Icon size={11} className="flex-shrink-0" />
                  {schedule.name}
                  <span className="font-normal opacity-70">{schedule.dosage ? ` ${schedule.dosage}` : ""} {time}</span>
                </span>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-1.5">
            {activeSchedules.map((s) => (
              <div key={s.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <RouteBadge route={s.route} />
                <span className="text-xs text-gray-600 flex-1 truncate">
                  {s.name}{s.dosage ? `（${s.dosage}）` : ""} ・ {s.times.join("・")}
                </span>
                <button onClick={() => { setEditTarget(s); setModal("edit"); }} className="p-1 hover:bg-gray-200 rounded-lg flex-shrink-0">
                  <Edit2 size={12} className="text-gray-400 hover:text-gray-600" />
                </button>
                <button onClick={() => handleEnd(s)} className="text-[10px] text-gray-400 hover:text-gray-600 flex-shrink-0 px-1">終了</button>
                <button onClick={() => setDeleteTarget(s)} className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                  <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {endedSchedules.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button onClick={() => setShowEnded((v) => !v)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
            {showEnded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            終了した投薬 ({endedSchedules.length}件)
          </button>
          {showEnded && (
            <div className="mt-2 space-y-1.5">
              {endedSchedules.map((s) => (
                <div key={s.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 opacity-70">
                  <RouteBadge route={s.route} />
                  <span className="text-xs text-gray-500 flex-1 truncate">
                    {s.name}{s.dosage ? `（${s.dosage}）` : ""} ・ {s.times.join("・")}
                  </span>
                  <button onClick={() => handleResume(s)} className="text-[10px] text-teal-600 hover:text-teal-700 flex-shrink-0 px-1">再開</button>
                  <button onClick={() => setDeleteTarget(s)} className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0">
                    <Trash2 size={12} className="text-red-300 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <MedicationForm
          initial={editTarget ?? undefined}
          onSave={handleSaveSchedule}
          onClose={() => { setModal(null); setEditTarget(null); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          name={deleteTarget.name}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}
