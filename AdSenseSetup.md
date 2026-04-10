# PillScan — Google AdSense & Search Console 설정 가이드

## 현재 상태 (2026-04-10)
- ✅ AdSense 승인 요건 콘텐츠 모두 준비됨 (About, Privacy, Terms, How-to-Use, FAQ)
- ✅ SEO 메타태그 + Sitemap + robots.txt + 구조화 데이터 완료
- ✅ Live: https://pillscan-ai.vercel.app

## 1. Google Search Console 등록 (5분)

### 단계
1. https://search.google.com/search-console 접속
2. **속성 추가** → **URL 접두어** 선택
3. URL 입력: `https://pillscan-ai.vercel.app`
4. **확인 방법: HTML 태그** 선택
5. 표시된 메타태그에서 `content="..."` 값 복사
6. 아래 명령어 실행:
   ```bash
   cd D:/PillScan/webapp
   echo "복사한_값" | vercel env add GOOGLE_SITE_VERIFICATION production
   npx vercel --prod --yes
   ```
7. Search Console로 돌아가 **확인** 클릭
8. 승인되면 좌측 메뉴 **Sitemaps** → `sitemap.xml` 입력 → **제출**

## 2. Google AdSense 신청

### 단계
1. https://www.google.com/adsense 접속
2. **시작하기** → 사이트 URL 입력: `https://pillscan-ai.vercel.app`
3. 결제 정보 입력 (한국 주소/계좌)
4. AdSense 코드를 복사 (pub-XXXXXXXXXXXXXXXX 형식)
5. 명령어:
   ```bash
   cd D:/PillScan/webapp
   echo "ca-pub-XXXXXXXXXXXXXXXX" | vercel env add GOOGLE_ADSENSE_ID production
   npx vercel --prod --yes
   ```
6. AdSense 대시보드에서 **확인** 클릭
7. **검토 대기 (보통 1-14일)**

### ads.txt 업데이트
승인되면 `webapp/public/ads.txt` 파일에서 pub-XXXX 부분을 실제 ID로 교체:
```
google.com, pub-실제ID, DIRECT, f08c47fec0942fa0
```

## 3. Google Analytics 설정 (선택)

1. https://analytics.google.com 에서 GA4 속성 생성
2. 측정 ID 복사 (G-XXXXXXXXXX)
3. ```bash
   echo "G-XXXXXXXXXX" | vercel env add NEXT_PUBLIC_GA_ID production
   npx vercel --prod --yes
   ```

## AdSense 승인을 위한 콘텐츠 체크리스트

| 요건 | 상태 |
|------|------|
| About Us 페이지 (영문, 상세) | ✅ /about |
| Privacy Policy (GDPR, 쿠키 포함) | ✅ /privacy |
| Terms of Service | ✅ /terms |
| How to Use + FAQ | ✅ /how-to-use |
| 의료 면책 조항 | ✅ Footer + Terms |
| 연락처 정보 (Footer) | ✅ taeshinkim11@gmail.com |
| 모바일 반응형 | ✅ |
| HTTPS | ✅ |
| 빠른 로딩 (Lighthouse) | ✅ Next.js SSR |
| 고유 콘텐츠 | ✅ AI 식별 + 25,000+ DB |
