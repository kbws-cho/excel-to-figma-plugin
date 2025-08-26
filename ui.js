console.log("✅ [UI] ui.js 로드됨");

let rows = [];

// 파일 업로드 처리
const uploadInput = document.getElementById("upload");
const applyButton = document.getElementById("apply");

if (!uploadInput || !applyButton) {
  console.error("❌ [UI] 필수 요소가 누락되었습니다. HTML을 확인하세요.");
}

uploadInput?.onchange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) {
    console.warn("⚠️ [UI] 파일이 선택되지 않음");
    return;
  }

  console.log("📂 [UI] 선택된 파일:", file.name);

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  rows = XLSX.utils.sheet_to_json(sheet);
  console.log("📊 [UI] 엑셀 로드 완료. rows:", rows);
};

// 데이터 적용 버튼 클릭
applyButton && (applyButton.onclick = () => {
  console.log("✅ [UI] 데이터 적용 버튼 클릭됨. rows 개수:", rows.length);

  if (rows.length === 0) {
    console.warn("⚠️ [UI] 적용할 데이터 없음. 먼저 파일을 선택해야 함");
    return;
  }

  // Figma로 메시지 전송
  parent.postMessage({ pluginMessage: { type: "apply-data", rows } }, "*");
  console.log("📤 [UI] Figma 플러그인으로 메시지 전송 완료");
};
