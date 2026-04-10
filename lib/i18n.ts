/**
 * Comprehensive i18n system for PillScan.
 * - Single source of truth in Korean (ko)
 * - English (en) hand-translated
 * - Other languages: use English as fallback (auto-translation later via Gemini batch)
 */

export type Locale = "ko" | "en" | "ja" | "zh" | "es" | "fr" | "de";

export const SUPPORTED_LOCALES: Locale[] = ["ko", "en", "ja", "zh", "es", "fr", "de"];

// Master Korean strings
const ko = {
  // Header / general
  title: "PillScan",
  subtitle: "AI 알약 판별 서비스",
  description: "알약 사진을 촬영하거나 업로드하면 AI가 약품 정보를 알려드립니다.",
  feedbackBtn: "개선 제안",
  feedbackEmail: "PillScan 개선 제안",
  medicalDisclaimer: "의료 전문가의 판단을 대체하지 않습니다",

  // Tabs
  tabPhoto: "📷 사진",
  tabManual: "🔍 모양",
  tabCount: "🔢 개수",
  tabHistory: "📖 기록",
  tabGlobal: "🌐 해외약",

  // Upload zone
  uploadPrompt: "사진 촬영 또는 업로드",
  uploadHint: "앞면 + 뒷면 동시 업로드 가능 (최대 4장)",
  uploadHintDrag: "클릭하거나 파일을 드래그하세요 (JPG, PNG, WEBP)",
  cameraBtn: "📷 카메라",
  uploadBtn: "📁 파일",
  analyzeBtn: "알약 분석하기",
  analyzing: "분석 중...",
  privacyNote: "업로드된 이미지는 분석 후 즉시 삭제됩니다.",
  deleteAll: "전체 삭제",
  imageFront: "앞면",
  imageBack: "뒷면",
  addBackHint: "💡 뒷면도 추가하면 식별 정확도가 크게 올라갑니다",
  imagesCounter: "{n}장 / 최대 {max}장",
  fileMultiple: "📁 파일 (여러장 가능)",

  // Photo guide
  photoTipTitle: "📸 정확한 식별을 위한 촬영 팁",
  photoTip1: "알약을 봉지에서 꺼내서 촬영",
  photoTip2: "글씨/각인이 보이는 면을 가까이 촬영",
  photoTip3: "앞면과 뒷면 모두 찍으면 정확도 UP",
  photoTip4: "밝은 곳에서, 배경은 단색으로",

  // Loading stages
  loadingStage1: "이미지 전처리",
  loadingStage2: "AI 시각 분석",
  loadingStage3: "약품 DB 검색",
  loadingStage4: "결과 정리",
  loadingElapsed: "{n}초 경과",

  // Loading tips
  loadingTip1: "💡 알약을 봉지에서 꺼내서 찍으면 더 정확해요",
  loadingTip2: "💡 글씨가 잘 보이는 면을 가까이 찍어보세요",
  loadingTip3: "💡 앞면과 뒷면 모두 찍으면 식별률이 올라가요",
  loadingTip4: "💡 밝은 곳에서 단색 배경으로 찍으세요",
  loadingTip5: "💊 25,409개의 한국 약품 데이터베이스를 검색 중",
  loadingTip6: "🌍 14,900개의 해외 약품 데이터도 확인 중",
  loadingTip7: "🔬 AI가 모양·색상·각인을 분석하고 있어요",
  loadingTip8: "📸 이미지 대비와 선명도를 자동 보정 중",

  // Result card
  resultTitle: "분석 결과",
  mostLikely: "⭐ 가장 가능성 높은 약",
  pillNumber: "알약 #{n}",
  detectedTypes: "💊 {n}종류 알약 감지됨 (총 {total}개)",
  drugName: "약품명",
  manufacturer: "제조사",
  efficacy: "효능/효과",
  dosage: "용법/용량",
  precautions: "주의사항",
  sideEffects: "부작용",
  interactions: "약물 상호작용",
  storage: "보관방법",
  confidence: "신뢰도",
  noResult: "해당 약품 정보를 찾을 수 없습니다.",
  noResultHint: "글씨가 잘 보이는 면을 다시 촬영해 보세요.",
  noDetailTitle: "ℹ️ 상세 효능·용법 정보가 없는 약품입니다",
  noDetailText: "이 약품은 식약처 e약은요 데이터베이스에 등록되지 않았습니다. 정확한 복용 방법은 약사 또는 의사에게 문의해주세요.",
  searchOnGoogle: "🔍 구글에서 검색",
  aiGuess: "AI 추측",
  aiGuessFallback: 'AI 추측: "{name}" — DB 매칭 결과를 우선 표시합니다',
  showMore: "더 보기",
  showLess: "접기",
  imageLabel: "이미지",
  searchMethodAttr: "모양·색상·각인 검색",
  searchMethodName: "이름 검색",
  searchMethodGlobal: "글로벌 DB",
  geminiAnalysis: "AI 시각 분석",
  imprintUnclear: "각인 식별 불가",
  retake: "📷 다시 촬영하기",
  retakeTitle: "📸 더 정확한 결과를 원하시면",
  retakeTip1: "알약을 봉지에서 꺼내서 촬영해주세요",
  retakeTip2: "글씨/각인이 보이는 면을 최대한 가까이 찍어주세요",
  retakeTip3: "앞면과 뒷면 각각 촬영하면 더 정확해요",
  tryAgainBtn: "🔄 다시 시도",

  // Korean DB labels
  koreanDB: "국내 의약품 DB",
  globalDB: "해외 의약품 DB",
  shape: "모양",
  color: "색상",
  imprint: "각인",
  imprintFront: "앞면",
  imprintBack: "뒷면",
  unidentified: "미식별",

  // Contribute
  contributeTitle: "AI 정확도 개선에 도움 주세요",
  contributeText: "이 사진을 PillScan AI 학습 데이터로 기여하시겠어요? 동의하시면 더 정확한 알약 식별 서비스를 만드는 데 직접 활용됩니다.",
  contributeBenefit1: "익명 저장 — 개인정보·IP·계정 연동 없음",
  contributeBenefit2: "완전 옵트인 — 동의 안 해도 모든 기능 사용 가능",
  contributeBenefit3: "오직 모델 학습용 — 외부 공개·판매 없음",
  contributeBenefit4: "언제든 삭제 요청 가능",
  contributeYes: "✓ 기여하기",
  contributeNo: "괜찮아요",
  contributeThanks: "✓ 기여해 주셔서 감사합니다!",

  // Manual search
  manualSearchTitle: "약 모양으로 검색",
  imprintInputLabel: "식별문자 : 약의 앞면이나 뒷면의 문자",
  imprintInputPlaceholder: "예: GS, 500, ER",
  shapeLabel: "모양",
  colorLabel: "색상",
  formLabel: "제형",
  searchAll: "전체",
  searchAllShapes: "모양 전체",
  searchAllColors: "색상 전체",
  searchAllForms: "제형 전체",
  formTablet: "정제류",
  formHardCapsule: "경질캡슐",
  formSoftCapsule: "연질캡슐",
  searchByShapeBtn: "🔍 약 모양으로 검색",
  resetBtn: "다시 입력",
  searchResults: "검색 결과 ({n}건)",
  noManualResult: "일치하는 약품이 없습니다. 조건을 변경해 보세요.",
  searchError: "식별문자, 모양, 색상 중 하나 이상을 선택해주세요.",
  searchFailed: "검색 실패",
  classification: "분류",

  // Pill counter
  countTitle: "약 개수 세기",
  countSubtitle: "약봉지나 알약 사진을 촬영하면 개수를 세어드립니다",
  countCameraBtn: "📷 촬영",
  countUploadBtn: "📁 업로드",
  countingBtn: "세는 중...",
  countBtn: "🔢 약 개수 세기",
  totalCount: "알약 총 개수",
  countDetails: "상세 내역",
  countItems: "{n}개",
  countAgain: "🔄 다시 세기",
  countFailed: "개수 세기 실패",
  resetBack: "✕ 다시",

  // History
  historyTitle: "검색 기록",
  historyEmpty: "검색 기록이 없습니다",
  historyEmptyHint: "사진으로 약을 찾으면 여기에 자동으로 저장됩니다. 기록은 이 브라우저에만 저장되며 외부로 전송되지 않아요.",
  historyTotal: "총 {n}개의 기록",
  historyDelete: "삭제",
  historyDeleteAll: "전체 삭제",
  historyDeleteConfirm: "모든 검색 기록을 삭제하시겠습니까?",
  historyJustNow: "방금 전",
  historyMinAgo: "{n}분 전",
  historyHourAgo: "{n}시간 전",
  historyDayAgo: "{n}일 전",
  historyTypePhoto: "📷 사진",
  historyTypeManual: "🔍 수동",
  historyMore: "외 {n}개",
  historyNoResult: "결과 없음",
  historyPrivacy: "🔒 기록은 이 기기에만 저장됩니다 (서버 전송 없음)",

  // Global drug search
  globalSearchTitle: "해외 의약품 검색",
  globalSearchSubtitle: "FDA 등록 약품 14,900건에서 검색합니다",
  globalSearchPlaceholder: "예: Tylenol, Aspirin, Ibuprofen",
  globalSearchBtn: "🌐 해외약 검색",
  globalGenericName: "성분명",
  globalRoute: "투여경로",
  globalNDC: "NDC",
  globalIndications: "사용 목적",
  globalWarnings: "경고",
  globalDosage: "용법/용량",

  // Footer
  footerBrand: "Produced by SPINAI",
  footerHome: "홈",
  footerAbout: "소개",
  footerHelp: "도움말",
  footerHowToUse: "사용법",
  footerFAQ: "FAQ",
  footerLegal: "법률",
  footerPrivacy: "개인정보처리방침",
  footerTerms: "이용약관",
  footerContact: "연락처",

  // Errors
  errorAnalysisFailed: "분석에 실패했습니다. 다시 시도해주세요.",
  errorServerBusy: "서버가 일시적으로 바쁩니다. 잠시 후 다시 시도해주세요.",
  errorImageTooLarge: "이미지가 너무 큽니다 (최대 10MB)",
  errorInvalidImage: "올바른 이미지 파일이 아닙니다",
  errorRateLimit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  errorParsing: "AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.",
};

const en: typeof ko = {
  title: "PillScan",
  subtitle: "AI Pill Identifier",
  description: "Take or upload a photo of your pill and our AI will identify it instantly.",
  feedbackBtn: "Feedback",
  feedbackEmail: "PillScan Feedback",
  medicalDisclaimer: "Not a substitute for professional medical advice",

  tabPhoto: "📷 Photo",
  tabManual: "🔍 Shape",
  tabCount: "🔢 Count",
  tabHistory: "📖 History",
  tabGlobal: "🌐 Global",

  uploadPrompt: "Take Photo or Upload",
  uploadHint: "Front + back side upload supported (max 4 images)",
  uploadHintDrag: "Click or drag & drop (JPG, PNG, WEBP)",
  cameraBtn: "📷 Camera",
  uploadBtn: "📁 Upload",
  analyzeBtn: "Identify Pill",
  analyzing: "Analyzing...",
  privacyNote: "Uploaded images are deleted immediately after analysis.",
  deleteAll: "Delete All",
  imageFront: "Front",
  imageBack: "Back",
  addBackHint: "💡 Adding the back side significantly improves accuracy",
  imagesCounter: "{n} of {max} images",
  fileMultiple: "📁 Files (multiple OK)",

  photoTipTitle: "📸 Tips for Best Results",
  photoTip1: "Remove pill from packaging before photographing",
  photoTip2: "Get close to the side with text/imprint",
  photoTip3: "Photograph both front and back for better accuracy",
  photoTip4: "Use bright lighting with a plain background",

  loadingStage1: "Image preprocessing",
  loadingStage2: "AI vision analysis",
  loadingStage3: "Drug database search",
  loadingStage4: "Finalizing results",
  loadingElapsed: "{n}s elapsed",

  loadingTip1: "💡 Remove pills from packaging for better accuracy",
  loadingTip2: "💡 Get close to the side with visible text",
  loadingTip3: "💡 Photographing both sides increases accuracy",
  loadingTip4: "💡 Bright lighting and plain backgrounds work best",
  loadingTip5: "💊 Searching 25,409 Korean drug records",
  loadingTip6: "🌍 Also checking 14,900 international records",
  loadingTip7: "🔬 AI analyzing shape, color, and imprint",
  loadingTip8: "📸 Auto-enhancing contrast and sharpness",

  resultTitle: "Analysis Result",
  mostLikely: "⭐ Most Likely Match",
  pillNumber: "Pill #{n}",
  detectedTypes: "💊 {n} pill type(s) detected ({total} total)",
  drugName: "Drug Name",
  manufacturer: "Manufacturer",
  efficacy: "Indications",
  dosage: "Dosage & Administration",
  precautions: "Precautions",
  sideEffects: "Side Effects",
  interactions: "Drug Interactions",
  storage: "Storage",
  confidence: "Confidence",
  noResult: "No matching drug information found.",
  noResultHint: "Try retaking the photo with the text side visible.",
  noDetailTitle: "ℹ️ No detailed information available for this drug",
  noDetailText: "This drug is not registered in the Korean MFDS e-Drug database. Please consult a pharmacist or physician for proper usage information.",
  searchOnGoogle: "🔍 Search on Google",
  aiGuess: "AI Guess",
  aiGuessFallback: 'AI suggested: "{name}" — showing database match instead',
  showMore: "Show more",
  showLess: "Show less",
  imageLabel: "Image",
  searchMethodAttr: "Shape · Color · Imprint",
  searchMethodName: "Name search",
  searchMethodGlobal: "Global DB",
  geminiAnalysis: "AI Visual Analysis",
  imprintUnclear: "Imprint unclear",
  retake: "📷 Retake Photo",
  retakeTitle: "📸 For Better Results",
  retakeTip1: "Remove the pill from any packaging",
  retakeTip2: "Get as close as possible to the text/imprint",
  retakeTip3: "Photograph both front and back",
  tryAgainBtn: "🔄 Try Again",

  koreanDB: "Korean Drug DB",
  globalDB: "Global Drug DB",
  shape: "Shape",
  color: "Color",
  imprint: "Imprint",
  imprintFront: "Front",
  imprintBack: "Back",
  unidentified: "Unidentified",

  contributeTitle: "Help Improve AI Accuracy",
  contributeText: "Would you like to contribute this image to PillScan's AI training? Your data will be used to make pill identification more accurate.",
  contributeBenefit1: "Anonymous storage — no personal info, IP, or account",
  contributeBenefit2: "Fully opt-in — all features work without consent",
  contributeBenefit3: "Used only for model training — never sold or shared",
  contributeBenefit4: "Deletion requests honored anytime",
  contributeYes: "✓ Contribute",
  contributeNo: "No thanks",
  contributeThanks: "✓ Thank you for contributing!",

  manualSearchTitle: "Search by Pill Shape",
  imprintInputLabel: "Imprint: text on front or back of pill",
  imprintInputPlaceholder: "e.g. GS, 500, ER",
  shapeLabel: "Shape",
  colorLabel: "Color",
  formLabel: "Form",
  searchAll: "All",
  searchAllShapes: "All shapes",
  searchAllColors: "All colors",
  searchAllForms: "All forms",
  formTablet: "Tablet",
  formHardCapsule: "Hard Capsule",
  formSoftCapsule: "Soft Capsule",
  searchByShapeBtn: "🔍 Search by Shape",
  resetBtn: "Reset",
  searchResults: "Results ({n})",
  noManualResult: "No matching drugs. Try different criteria.",
  searchError: "Please select at least one of imprint, shape, or color.",
  searchFailed: "Search failed",
  classification: "Class",

  countTitle: "Pill Counter",
  countSubtitle: "Photograph a pill pack and we'll count them for you",
  countCameraBtn: "📷 Camera",
  countUploadBtn: "📁 Upload",
  countingBtn: "Counting...",
  countBtn: "🔢 Count Pills",
  totalCount: "Total Pills",
  countDetails: "Breakdown",
  countItems: "{n} pcs",
  countAgain: "🔄 Count Again",
  countFailed: "Counting failed",
  resetBack: "✕ Reset",

  historyTitle: "Search History",
  historyEmpty: "No search history",
  historyEmptyHint: "Pill identifications are automatically saved here. History is stored only in your browser and never sent externally.",
  historyTotal: "{n} record(s)",
  historyDelete: "Delete",
  historyDeleteAll: "Delete All",
  historyDeleteConfirm: "Delete all search history?",
  historyJustNow: "just now",
  historyMinAgo: "{n}m ago",
  historyHourAgo: "{n}h ago",
  historyDayAgo: "{n}d ago",
  historyTypePhoto: "📷 Photo",
  historyTypeManual: "🔍 Manual",
  historyMore: "+{n} more",
  historyNoResult: "No result",
  historyPrivacy: "🔒 History stored only on this device (no server)",

  globalSearchTitle: "International Drug Search",
  globalSearchSubtitle: "Search 14,900 FDA-registered medications",
  globalSearchPlaceholder: "e.g. Tylenol, Aspirin, Ibuprofen",
  globalSearchBtn: "🌐 Search Global",
  globalGenericName: "Generic Name",
  globalRoute: "Route",
  globalNDC: "NDC",
  globalIndications: "Indications",
  globalWarnings: "Warnings",
  globalDosage: "Dosage",

  footerBrand: "Produced by SPINAI",
  footerHome: "Home",
  footerAbout: "About",
  footerHelp: "Help",
  footerHowToUse: "How to Use",
  footerFAQ: "FAQ",
  footerLegal: "Legal",
  footerPrivacy: "Privacy Policy",
  footerTerms: "Terms of Service",
  footerContact: "Contact",

  errorAnalysisFailed: "Analysis failed. Please try again.",
  errorServerBusy: "Server is busy. Please try again shortly.",
  errorImageTooLarge: "Image too large (max 10MB)",
  errorInvalidImage: "Invalid image file",
  errorRateLimit: "Too many requests. Please try again later.",
  errorParsing: "Failed to parse AI response. Please try again.",
};

// Other languages — fallback to English for now (auto-translation later)
const ja: typeof ko = { ...en, title: "PillScan", subtitle: "AI 錠剤識別", analyzeBtn: "錠剤を識別" };
const zh: typeof ko = { ...en, title: "PillScan", subtitle: "AI 药片识别", analyzeBtn: "识别药片" };
const es: typeof ko = { ...en, title: "PillScan", subtitle: "Identificador de Pastillas IA", analyzeBtn: "Identificar Pastilla" };
const fr: typeof ko = { ...en, title: "PillScan", subtitle: "Identificateur de Pilules IA", analyzeBtn: "Identifier la Pilule" };
const de: typeof ko = { ...en, title: "PillScan", subtitle: "KI Pillen-Identifier", analyzeBtn: "Pille identifizieren" };

export const translations: Record<Locale, typeof ko> = { ko, en, ja, zh, es, fr, de };

export type TranslationKey = keyof typeof ko;

/**
 * Translate a key with optional interpolation.
 * Supports {placeholder} substitution.
 */
export function t(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  const tbl = translations[locale] || translations.en;
  let text = (tbl[key] || translations.en[key] || translations.ko[key] || key) as string;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}

export function detectLocale(acceptLanguage?: string): Locale {
  if (!acceptLanguage) return "ko";
  const lang = acceptLanguage.toLowerCase();
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  return "en";
}
