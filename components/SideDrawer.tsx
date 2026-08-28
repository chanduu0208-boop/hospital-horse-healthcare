"use client";

import React, { useState } from "react";
import { X, Search, Trash2, Plus, Settings, CheckSquare, Square } from "lucide-react";
import { Horse, HealthStatus } from "@/lib/types";
import { EXERCISE_STYLE } from "@/lib/exerciseConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  horses: Horse[];
  onSelectHorse: (id: string) => void;
  onDeleteHorses: (ids: string[]) => void;
  onAddHorse: () => void;
}

const STATUS_DOT: Record<HealthStatus, string> = {
  術後入院: "bg-red-400",
  譲渡馬: "bg-emerald-400",
};

const STATUS_LABEL_COLOR: Record<HealthStatus, string> = {
  術後入院: "text-red-600",
  譲渡馬: "text-emerald-600",
};

export default function SideDrawer({
  isOpen,
  onClose,
  horses,
  onSelectHorse,
  onDeleteHorses,
  onAddHorse,
}: Props) {
  const [query, setQuery] = useState("");
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = horses.filter(
    (h) => h.name.includes(query) || h.diagnosis.includes(query)
  );

  const grouped = {
    術後入院: filtered.filter((h) => h.status === "術後入院"),
    譲渡馬: filtered.filter((h) => h.status === "譲渡馬"),
  };

  // ---- 選択操作 ----
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllSelected =
    filtered.length > 0 && filtered.every((h) => selectedIds.has(h.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((h) => h.id)));
    }
  };

  const exitManageMode = () => {
    setIsManageMode(false);
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (window.confirm(`選択した ${count} 頭を削除しますか？\nこの操作は取り消せません。`)) {
      onDeleteHorses(Array.from(selectedIds));
      setSelectedIds(new Set());
      setIsManageMode(false);
    }
  };

  const handleAddHorse = () => {
    exitManageMode();
    onAddHorse();
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => { exitManageMode(); onClose(); }}
      />

      {/* ドロワー本体 */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 flex flex-col overflow-x-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        {isManageMode ? (
          /* 管理モード中ヘッダー */
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-blue-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-700 text-base">
                {selectedIds.size > 0 ? `${selectedIds.size}頭を選択中` : "管理モード"}
              </span>
            </div>
            <button
              onClick={exitManageMode}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              完了
            </button>
          </div>
        ) : (
          /* 通常ヘッダー */
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <h2 className="font-bold text-gray-800 text-base">馬管理メニュー</h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsManageMode(true)}
                className="p-1.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                title="管理モード"
              >
                <Settings size={17} className="text-gray-500" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
              >
                <X size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* 管理モード：全選択バー */}
        {isManageMode && (
          <div className="px-3 py-2 border-b border-blue-100 bg-blue-50/60 flex-shrink-0">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 w-full text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare size={17} className="flex-shrink-0 text-blue-500" />
              ) : (
                <Square size={17} className="flex-shrink-0 text-gray-400" />
              )}
              {isAllSelected ? "全て解除" : "全て選択"}
              <span className="ml-auto text-xs text-gray-400">
                ({filtered.length}頭)
              </span>
            </button>
          </div>
        )}

        {/* 検索 */}
        <div className="px-3 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="馬名・診断名で検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 馬一覧 */}
        <div className="flex-1 overflow-y-auto">
          {/* 通常モード：凡例 */}
          {!isManageMode && (
            <div className="mx-3 mt-3 mb-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-2">ステータス凡例</p>
              <div className="flex gap-3">
                {(["術後入院", "譲渡馬"] as HealthStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
                    <span className={`text-xs font-medium ${STATUS_LABEL_COLOR[s]}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* グループ別一覧 */}
          {(["術後入院", "譲渡馬"] as HealthStatus[]).map((status) => {
            const group = grouped[status];
            if (group.length === 0) return null;
            return (
              <div key={status} className="mb-2">
                <div className="px-3 py-1.5 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {status}
                  </span>
                  <span className="text-xs text-gray-400">({group.length}頭)</span>
                </div>
                {group.map((horse) => {
                  const ex = horse.exercise ?? "完全舎飼い";
                  const exStyle = EXERCISE_STYLE[ex];
                  const isSelected = selectedIds.has(horse.id);

                  return (
                    <button
                      key={horse.id}
                      onClick={() => {
                        if (isManageMode) {
                          toggleSelect(horse.id);
                        } else {
                          onSelectHorse(horse.id);
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${
                        isManageMode && isSelected
                          ? "bg-blue-50"
                          : "hover:bg-gray-50 active:bg-gray-100"
                      }`}
                    >
                      {/* チェックボックス（管理モード） */}
                      {isManageMode && (
                        <span className="flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare size={18} className="text-blue-500" />
                          ) : (
                            <Square size={18} className="text-gray-300" />
                          )}
                        </span>
                      )}

                      {/* ステータスドット（通常モード） */}
                      {!isManageMode && (
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[horse.status]}`} />
                      )}

                      <span className="flex-1 text-sm font-medium text-gray-800 truncate min-w-0">
                        {horse.name}
                      </span>

                      {/* 運動状況バッジ */}
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${exStyle.bg} ${exStyle.text} ${exStyle.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${exStyle.dot}`} />
                        {ex}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">該当する馬が見つかりません</p>
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* フッター */}
        {isManageMode ? (
          /* 管理モードフッター：追加・削除ボタン */
          <div className="px-3 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0 flex gap-2">
            <button
              onClick={handleAddHorse}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 active:bg-blue-800 shadow-sm transition-colors"
            >
              <Plus size={16} />
              追加
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors ${
                selectedIds.size > 0
                  ? "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <Trash2 size={16} />
              削除{selectedIds.size > 0 && `（${selectedIds.size}頭）`}
            </button>
          </div>
        ) : (
          /* 通常フッター：合計 */
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <p className="text-xs text-gray-500 text-center">
              総頭数: <span className="font-bold text-gray-700">{horses.length}頭</span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}
