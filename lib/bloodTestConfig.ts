// 血液検査でよく使われる項目のプリセット（単位は一般的なもの・参考値は含まない）
export interface BloodTestItemPreset {
  key: string;
  label: string;
  unit: string;
  category: "血球計算" | "生化学";
}

export const BLOOD_TEST_PRESETS: BloodTestItemPreset[] = [
  // ── 血球計算（CBC） ──
  { key: "WBC", label: "白血球数 (WBC)", unit: "10^3/μL", category: "血球計算" },
  { key: "RBC", label: "赤血球数 (RBC)", unit: "10^4/μL", category: "血球計算" },
  { key: "Hb", label: "ヘモグロビン濃度 (Hb/HGB)", unit: "g/dL", category: "血球計算" },
  { key: "Ht", label: "ヘマトクリット (Ht/HCT)", unit: "%", category: "血球計算" },
  { key: "MCV", label: "平均赤血球容積 (MCV)", unit: "fL", category: "血球計算" },
  { key: "MCH", label: "平均赤血球ヘモグロビン量 (MCH)", unit: "pg", category: "血球計算" },
  { key: "MCHC", label: "平均赤血球ヘモグロビン濃度 (MCHC)", unit: "%", category: "血球計算" },
  { key: "RDW", label: "赤血球分布幅 (RDW)", unit: "%", category: "血球計算" },
  { key: "PLT", label: "血小板数 (PLT)", unit: "10^4/μL", category: "血球計算" },
  { key: "NEUp", label: "好中球% (Neu%)", unit: "%", category: "血球計算" },
  { key: "LYMp", label: "リンパ球% (Lym%)", unit: "%", category: "血球計算" },
  { key: "MONp", label: "単球% (Mon%)", unit: "%", category: "血球計算" },
  { key: "EOSp", label: "好酸球% (Eos%)", unit: "%", category: "血球計算" },
  { key: "BASp", label: "好塩基球% (Bas%)", unit: "%", category: "血球計算" },
  { key: "NEU", label: "好中球数 (Neu#)", unit: "/μL", category: "血球計算" },
  { key: "LYM", label: "リンパ球数 (Lym#)", unit: "/μL", category: "血球計算" },
  { key: "MON", label: "単球数 (Mon#)", unit: "/μL", category: "血球計算" },
  { key: "EOS", label: "好酸球数 (Eos#)", unit: "/μL", category: "血球計算" },
  { key: "BAS", label: "好塩基球数 (Bas#)", unit: "/μL", category: "血球計算" },

  // ── 生化学検査 ──
  { key: "TP", label: "総蛋白 (TP)", unit: "g/dL", category: "生化学" },
  { key: "Fib", label: "フィブリノーゲン (Fib)", unit: "mg/dL", category: "生化学" },
  { key: "SAA", label: "血清アミロイドA (SAA)", unit: "μg/mL", category: "生化学" },
  { key: "Alb", label: "アルブミン (Alb)", unit: "g/dL", category: "生化学" },
  { key: "Glob", label: "グロブリン (GLOB)", unit: "g/dL", category: "生化学" },
  { key: "AG", label: "A/G比", unit: "", category: "生化学" },
  { key: "BUN", label: "尿素窒素 (BUN)", unit: "mg/dL", category: "生化学" },
  { key: "BUNCre", label: "BUN/クレアチニン比", unit: "", category: "生化学" },
  { key: "Cre", label: "クレアチニン (Cre)", unit: "mg/dL", category: "生化学" },
  { key: "NH3", label: "アンモニア (NH3)", unit: "μg/dL", category: "生化学" },
  { key: "TCho", label: "総コレステロール", unit: "mg/dL", category: "生化学" },
  { key: "TG", label: "中性脂肪 (TG)", unit: "mg/dL", category: "生化学" },
  { key: "HDL", label: "HDLコレステロール", unit: "mg/dL", category: "生化学" },
  { key: "LDL", label: "LDLコレステロール", unit: "mg/dL", category: "生化学" },
  { key: "Na", label: "ナトリウム (Na)", unit: "mEq/L", category: "生化学" },
  { key: "K", label: "カリウム (K)", unit: "mEq/L", category: "生化学" },
  { key: "Cl", label: "クロール (Cl)", unit: "mEq/L", category: "生化学" },
  { key: "HCO3", label: "重炭酸 (HCO3)", unit: "mEq/L", category: "生化学" },
  { key: "Ca", label: "カルシウム (Ca)", unit: "mg/dL", category: "生化学" },
  { key: "P", label: "リン (P)", unit: "mg/dL", category: "生化学" },
  { key: "ALP", label: "アルカリフォスファターゼ (ALP)", unit: "U/L", category: "生化学" },
  { key: "AST", label: "AST (GOT)", unit: "U/L", category: "生化学" },
  { key: "ALT", label: "ALT (GPT)", unit: "U/L", category: "生化学" },
  { key: "LDH", label: "LDH (LD)", unit: "U/L", category: "生化学" },
  { key: "GGT", label: "γ-GTP (γ-GT)", unit: "U/L", category: "生化学" },
  { key: "ChE", label: "コリンエステラーゼ", unit: "U/L", category: "生化学" },
  { key: "CK", label: "CK (CPK)", unit: "U/L", category: "生化学" },
  { key: "TBil", label: "総ビリルビン", unit: "mg/dL", category: "生化学" },
  { key: "DBil", label: "直接ビリルビン", unit: "mg/dL", category: "生化学" },
  { key: "sAMY", label: "血清アミラーゼ", unit: "U/L", category: "生化学" },
  { key: "uAMY", label: "尿アミラーゼ", unit: "U/L", category: "生化学" },
  { key: "Glu", label: "グルコース／血糖 (Glu)", unit: "mg/dL", category: "生化学" },
  { key: "Lac", label: "乳酸値 (Lactate)", unit: "mmol/L", category: "生化学" },
  { key: "CRP", label: "CRP", unit: "mg/dL", category: "生化学" },
];

export function findPreset(key: string): BloodTestItemPreset | undefined {
  return BLOOD_TEST_PRESETS.find((p) => p.key === key);
}
