# JTravel 분석 서버 🧠

유튜브 링크를 받아 **자막 → Claude AI → 장소 목록(JSON)** 으로 바꿔 앱에 돌려주는 작은 서버입니다.
(Phase 1: 진짜 AI 분석. 지도/예약 연동은 다음 단계.)

```
아이폰 앱 → [이 서버 /analyze] → 유튜브 자막 + Claude API → 일정 JSON
                  (열쇠는 여기 .env 에만 보관)
```

## 필요한 것
- Node.js (앱과 동일)
- **Claude API 열쇠** (sk-ant-... ) — https://console.anthropic.com 에서 발급
- (유튜브 제목·자막은 열쇠 없이 자동으로 가져옵니다)

---

## 1) 열쇠 넣기

1. `server` 폴더 안의 **`.env.example`** 파일을 복사해서 이름을 **`.env`** 로 바꾸세요.
2. `.env` 를 메모장으로 열고 본인 열쇠를 붙여넣으세요:
   ```
   ANTHROPIC_API_KEY=sk-ant-여기에-본인-열쇠
   PORT=8787
   ```
   > ⚠️ `.env` 파일은 절대 남에게 주거나 깃허브에 올리지 마세요 (열쇠가 들어있어요). 이미 `.gitignore`로 보호돼 있습니다.

## 2) 서버 켜기 (윈도우 PowerShell)

`server` 폴더에서:
```
npm install
npm run dev
```
👉 `JTravel 분석 서버 실행 중 → http://localhost:8787` 가 보이면 성공 ✅
(이 창은 켜둔 채로 두세요. 앱 쓰는 동안 계속 실행돼야 해요.)

**확인:** 브라우저에서 `http://localhost:8787/health` 열어 `{"ok":true,"hasKey":true}` 가 나오면 열쇠까지 정상.

## 3) 앱이 이 서버를 보게 하기

1. 노트북의 **인터넷 IP 주소**를 확인하세요. Expo를 켜면 나오는 `exp://192.168.0.3:8081` 의 **192.168.0.3** 부분이에요. (PowerShell에서 `ipconfig` 의 IPv4 주소와 같습니다.)
2. 앱 코드 `src/config.ts` 를 열고 주소를 넣으세요 (포트는 **8787**):
   ```ts
   export const API_BASE_URL = 'http://192.168.0.3:8787';
   ```
   > 숫자는 본인 노트북 IP로 바꾸세요. `localhost`는 아이폰에선 안 됩니다(아이폰 자신을 가리켜서).
3. 앱(Expo)을 `npx expo start -c` 로 다시 켜고 아이폰에서 새로고침.

## 4) 써보기 🎉

아이폰 앱에서 **아무 여행 유튜브 링크**(자막 있는 영상)를 붙여넣고 "일정 만들기" →
이제 도쿄 샘플이 아니라 **진짜 그 영상에서 뽑아낸 장소들**이 나옵니다!

---

## 자주 막히는 곳

| 증상 | 해결 |
|------|------|
| `hasKey:false` | `.env` 파일 이름/열쇠 확인 후 서버 재시작 |
| 앱에서 "서버에 연결 못함" | 노트북·아이폰 같은 Wi-Fi? `config.ts` 주소가 노트북 IP? 서버 켜져 있나? |
| "자막을 찾지 못했어요" | 그 영상에 자막이 없어요. 자막 있는 다른 영상으로 시도 |
| "Overloaded" | Claude 서버 일시 혼잡. 잠시 후 다시 시도 |

## 비용
영상 1개 분석 = Claude API 사용량 과금(보통 수십~수백 원 수준). 테스트엔 $5 충전이면 충분합니다.

## 작동 방식 (참고)
- `src/youtube.ts` — 자막(youtube-transcript) + 제목(oEmbed) 가져오기, 둘 다 열쇠 불필요
- `src/extract.ts` — Claude(`claude-opus-4-8`)로 구조화 추출 (Structured Outputs로 형식 보장)
- `src/geocode.ts` — 무료 지도(OpenStreetMap)로 진짜 좌표 채우기 + 거리 계산, **열쇠 불필요**
- `src/schema.ts` — AI가 채워야 할 데이터 형식 (docs/MVP_DESIGN.md §3 기반)
- `src/index.ts` — `POST /analyze` 엔드포인트

> ⏱️ 좌표 조회는 지도 서버 정책상 장소당 약 1초씩 걸려요. 장소가 많은 영상은
> 분석이 조금 더 오래 걸릴 수 있어요(정상).
