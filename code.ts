figma.ui.onmessage = async (msg) => {
  console.log("✅ Message received in code.js", msg);

  if (msg.type === "apply-data") {
    console.log("🔥 apply-data 실행 시작", msg.rows);
  }
};

figma.showUI(__html__, { width: 400, height: 300 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "apply-data") {
    const rows = msg.rows;

    for (const row of rows) {
      const frameName = `${row["구좌명"]}_${row["size"]}`;
      const frame = figma.currentPage.findOne(
        (n) =>
          n.type === "FRAME" &&
          n.name.toLowerCase().trim() === frameName.toLowerCase().trim()
      );

      if (!frame) {
        console.warn(`❌ Frame not found: ${frameName}`);
        continue;
      }
      console.log(`✅ Frame found: ${frameName}`);

      // frame 내부 모든 TEXT 노드 찾기
      const textNodes = frame.findAll((n) => n.type === "TEXT") as TextNode[];

      for (const [key, value] of Object.entries(row)) {
        if (!value) continue;
        if (["구좌명", "size", "구분(pc/mo)"].includes(key.toLowerCase())) continue;

        // 엑셀 key랑 같은 이름 가진 TEXT 노드 찾기
        const target = textNodes.find(
          (t) =>
            t.name.replace(/^#/, "").toLowerCase().trim() ===
            key.toLowerCase().trim()
        );

        if (!target) {
          console.warn(`⚠️ Text layer not found in ${frameName}: ${key}`);
          continue;
        }

        try {
          const fonts = target.getRangeAllFontNames(0, target.characters.length);
          for (const f of fonts) await figma.loadFontAsync(f);

          target.characters = String(value);
          console.log(`✏️ Updated text in ${frameName}.${key}: ${value}`);
        } catch (e) {
          console.error(`❌ Font load failed for ${frameName}.${key}`, e);
        }
      }
    }

    figma.notify("엑셀 데이터 적용 완료 ✅ (콘솔 로그 확인하세요)");
  }
};
