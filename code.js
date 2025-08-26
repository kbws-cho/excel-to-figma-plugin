figma.showUI(__html__, { width: 400, height: 300 });

console.log("🚀 [PLUGIN] code.js 로드됨");

figma.ui.onmessage = async (msg) => {
  console.log("📩 [PLUGIN] 메시지 수신:", msg);

  if (msg.type === "apply-data") {
    const rows = msg.rows || [];
    console.log("📊 [PLUGIN] rows 개수:", rows.length);

    // ✅ 현재 선택한 프레임만 대상으로 제한
    const selectedFrames = figma.currentPage.selection.filter(
      (n) => n.type === "FRAME"
    );
    console.log("🖼 [PLUGIN] 선택된 프레임 개수:", selectedFrames.length);

    if (selectedFrames.length === 0) {
      figma.notify("⚠️ 먼저 적용할 프레임을 선택하세요.");
      return;
    }

    for (const row of rows) {
      const frameName = `${row["구좌명"]}_${row["size"]}`.toLowerCase().trim();
      console.log("🔍 [PLUGIN] 처리 중인 frameName:", frameName);

      // 선택된 프레임 중 이름이 일치하는 것 찾기
      const frame = selectedFrames.find(
        (f) => f.name.toLowerCase().trim() === frameName
      );

      if (!frame) {
        console.warn(`❌ [PLUGIN] 선택된 프레임 중 이름 불일치: ${frameName}`);
        continue;
      }
      console.log(`✅ [PLUGIN] Frame found: ${frameName}`);

      // row 데이터 → 프레임 내부 레이어 매핑
      for (const [key, value] of Object.entries(row)) {
        if (!value) continue;

        const normalizedKey = String(key).toLowerCase().trim();
        const skipKeys = ["구좌명", "size", "구분(pc/mo)"].map((k) => k.toLowerCase());
        if (skipKeys.includes(normalizedKey)) continue;

        console.log(`🔑 [PLUGIN] 매핑 시도 → key: ${key}, value: ${value}`);

        // 그룹/하위 프레임 포함 TEXT 탐색
        const textNodes = frame.findAll(
          (n) =>
            n.type === "TEXT" &&
            n.name.replace(/^#/, "").toLowerCase().trim() === normalizedKey
        );

        console.log(`🔎 [PLUGIN] ${key} → textNodes 개수:`, textNodes.length);

        if (textNodes.length === 0) {
          console.warn(`⚠️ [PLUGIN] Layer not found in ${frameName}: ${key}`);
          continue;
        }

        for (const targetLayer of textNodes) {
          try {
            // 폰트 로드: 내용 유무에 따라 분기
            if (targetLayer.characters.length > 0) {
              const fontNames = targetLayer.getRangeAllFontNames(
                0,
                targetLayer.characters.length
              );
              for (const font of fontNames) {
                await figma.loadFontAsync(font);
                console.log(`🔤 [PLUGIN] Font loaded:`, font);
              }
            } else {
              if (targetLayer.fontName !== figma.mixed) {
                await figma.loadFontAsync(targetLayer.fontName);
                console.log(
                  `🔤 [PLUGIN] Font loaded (empty text):`,
                  targetLayer.fontName
                );
              }
            }

            // 텍스트 값 반영
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
  }
};
