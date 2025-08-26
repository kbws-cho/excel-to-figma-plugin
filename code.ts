figma.showUI(__html__, { width: 400, height: 300 });

console.log("🚀 [PLUGIN] code.ts 로드됨");

figma.ui.onmessage = async (msg: { type: string; rows?: Record<string, unknown>[] }) => {
  console.log("📩 [PLUGIN] 메시지 수신:", msg);

  if (msg.type !== "apply-data") {
    return;
  }

  const rows = msg.rows || [];
  console.log("📊 [PLUGIN] rows 개수:", rows.length);

  const selectedFrames = figma.currentPage.selection.filter(
    (n) => n.type === "FRAME"
  ) as FrameNode[];
  console.log("🖼 [PLUGIN] 선택된 프레임 개수:", selectedFrames.length);

  if (selectedFrames.length === 0) {
    figma.notify("⚠️ 먼저 적용할 프레임을 선택하세요.");
    return;
  }

  for (const row of rows) {
    const frameName = `${row["구좌명"]}_${row["size"]}`.toLowerCase().trim();
    console.log("🔍 [PLUGIN] 처리 중인 frameName:", frameName);

    const frame = selectedFrames.find(
      (f) => f.name.toLowerCase().trim() === frameName
    );

    if (!frame) {
      console.warn(`❌ [PLUGIN] 선택된 프레임 중 이름 불일치: ${frameName}`);
      continue;
    }
    console.log(`✅ [PLUGIN] Frame found: ${frameName}`);

    for (const [keyRaw, value] of Object.entries(row)) {
      if (!value) continue;

      const key = String(keyRaw);
      const normalizedKey = key.toLowerCase().trim();
      const skipKeys = ["구좌명", "size", "구분(pc/mo)"].map((k) => k.toLowerCase());
      if (skipKeys.includes(normalizedKey)) continue;

      const textNodes = frame.findAll(
        (n) =>
          n.type === "TEXT" &&
          n.name.replace(/^#/, "").toLowerCase().trim() === normalizedKey
      ) as TextNode[];

      console.log(`🔎 [PLUGIN] ${key} → textNodes 개수:`, textNodes.length);

      if (textNodes.length === 0) {
        console.warn(`⚠️ [PLUGIN] Layer not found in ${frameName}: ${key}`);
        continue;
      }

      for (const targetLayer of textNodes) {
        try {
          const fontNames = targetLayer.getRangeAllFontNames(
            0,
            targetLayer.characters.length
          );
          for (const font of fontNames) {
            await figma.loadFontAsync(font);
            console.log(`🔤 [PLUGIN] Font loaded:`, font);
          }

          targetLayer.characters = String(value);
          console.log(`✏️ [PLUGIN] Updated text in ${frameName}.${key}: ${value}`);
        } catch (e) {
          console.error(`❌ [PLUGIN] Font load failed for ${frameName}.${key}`, e);
        }
      }
    }
  }

  figma.notify("엑셀 데이터 적용 완료 ✅ (선택된 프레임 기준)");
  console.log("🎉 [PLUGIN] 모든 데이터 적용 완료");
};
