import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ExtractKind = "auto" | "temperature" | "bloodtest" | "weight" | "feeding" | "treatment";

const SCHEMA_HINTS: Record<Exclude<ExtractKind, "auto">, string> = {
  temperature: `{"type":"temperature","date":"YYYY-MM-DD","temperature":38.5,"notes":"任意の所見メモ"}`,
  bloodtest: `{"type":"bloodtest","date":"YYYY-MM-DD","items":[{"key":"WBC","label":"白血球数 (WBC)","value":8.2,"unit":"10^3/μL","flagged":false}],"notes":"任意メモ"}`,
  weight: `{"type":"weight","date":"YYYY-MM-DD","weight":452.5}`,
  feeding: `{"type":"feeding","date":"YYYY-MM-DD","content":"配合飼料2kg、乾草4kg（1日2回）","notes":"任意メモ"}`,
  treatment: `{"type":"treatment","date":"YYYY-MM-DD","condition":"跛行あり","veterinarian":"担当獣医師名","treatment":"処置内容","medication":"投薬内容","notes":"任意メモ"}`,
};

function buildPrompt(kind: ExtractKind): string {
  const today = new Date().toISOString().slice(0, 10);
  if (kind === "auto") {
    return `あなたは競走馬の入院管理アプリのOCR/情報抽出アシスタントです。添付された写真（手書きのボード、カルテ、血液検査の結果票、体重計の表示、体温計の表示など）から、最も当てはまる記録の種類を1つ判定し、内容を抽出してください。

判定できる種類は次の5つです。該当するスキーマの形式でJSONのみを出力してください（説明文やコードブロックは不要）。
- 体温: ${SCHEMA_HINTS.temperature}
- 血液検査: ${SCHEMA_HINTS.bloodtest}
- 体重: ${SCHEMA_HINTS.weight}
- 給餌: ${SCHEMA_HINTS.feeding}
- 処置/往診記録: ${SCHEMA_HINTS.treatment}

注意点:
- 日付が写真から読み取れない場合は "${today}"（今日）を使用してください。
- 数値は写真から読み取れる範囲で正確に抽出し、読み取れない項目は省略してください。
- 血液検査の場合、写っている項目をすべて items 配列に含めてください。項目が赤字・赤背景・太字・アスタリスク(*)・下線などで基準値外（異常値）として強調表示されている場合は、その項目の flagged を true にしてください。強調がなければ flagged は省略するか false としてください。
- 出力は必ず有効なJSONオブジェクト1つのみとしてください。`;
  }
  return `あなたは競走馬の入院管理アプリのOCR/情報抽出アシスタントです。添付された写真から次の形式のJSONを抽出してください。JSONのみを出力し、説明文やコードブロックは含めないでください。

スキーマ: ${SCHEMA_HINTS[kind]}

注意点:
- 日付が写真から読み取れない場合は "${today}"（今日）を使用してください。
- 数値は写真から読み取れる範囲で正確に抽出してください。
- 読み取れない項目は省略してください（null を入れず、キー自体を省略）。${kind === "bloodtest" ? "\n- 項目が赤字・赤背景・太字・アスタリスク(*)・下線などで基準値外（異常値）として強調表示されている場合は、その項目の flagged を true にしてください。強調がなければ flagged は省略するか false としてください。写っている項目はすべて items 配列に含めてください。" : ""}
- 出力は必ず有効なJSONオブジェクト1つのみとしてください。`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  const jsonStr = start >= 0 && end >= 0 ? candidate.slice(start, end + 1) : candidate;
  return JSON.parse(jsonStr);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "サーバーに ANTHROPIC_API_KEY が設定されていません。写真からの自動入力を使うには環境変数を設定してください。" },
      { status: 500 }
    );
  }

  let body: { image?: string; mediaType?: string; kind?: ExtractKind };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストの形式が不正です。" }, { status: 400 });
  }

  const { image, mediaType, kind = "auto" } = body;
  if (!image || !mediaType) {
    return NextResponse.json({ error: "画像データがありません。" }, { status: 400 });
  }

  const model = process.env.CLAUDE_MODEL || "claude-sonnet-5";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: buildPrompt(kind) },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `AI解析リクエストに失敗しました (status ${res.status})`, detail: errText },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text: string = (data.content ?? [])
      .filter((block: { type: string }) => block.type === "text")
      .map((block: { text: string }) => block.text)
      .join("\n");

    let parsed: unknown;
    try {
      parsed = extractJson(text);
    } catch {
      return NextResponse.json(
        { error: "画像から情報を読み取れませんでした。もう一度撮影するか、手動で入力してください。" },
        { status: 422 }
      );
    }

    return NextResponse.json({ result: parsed });
  } catch (e) {
    return NextResponse.json(
      { error: "AI解析中にエラーが発生しました。", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
