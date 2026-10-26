/**
 * ──────────────────────────────────────────────────────────────────────
 *  네이처 멘토 2.0 (Nature Mentor) – JSON API 백엔드
 *  Google Apps Script + Google Sheets + Gemini API
 *  프런트엔드(GitHub Pages)  →  fetch(POST, text/plain JSON)  →  이 스크립트
 * ──────────────────────────────────────────────────────────────────────
 *  설치 (10분)
 *   1) script.google.com → 새 프로젝트 → 이 파일 전체를 Code.gs 에 붙여넣기 (Index.html 필요 없음)
 *   2) 프로젝트 설정(⚙) → 스크립트 속성:
 *        GEMINI_API_KEY = (aistudio.google.com 발급 키)      ← 없으면 '규칙 기반 멘토'로 자동 동작(그림 생성만 꺼짐)
 *        TEACHER_PIN    = (선생님 메뉴 비밀번호, 직접 정한 숫자)
 *        (선택) TEXT_MODEL = gemini-2.5-flash   IMAGE_MODEL = gemini-2.5-flash-image
 *   3) 함수 setup 선택 → ▶ 실행 → 권한 허용 → 실행 로그에 데이터 스프레드시트 URL
 *   4) 배포 → 새 배포 → 유형: 웹 앱 → 실행 계정: 나 / 액세스: 모든 사용자 → 배포 → '웹 앱 URL' 복사
 *   5) GitHub Pages의 config.js 에  API_URL: '복사한 URL'  로 넣고 커밋 → 끝
 *   ※ 코드를 고친 뒤에는 반드시 배포 → 배포 관리 → 연필 → 버전: 새 버전 → 배포 (안 하면 이전 코드가 돌아감)
 * ──────────────────────────────────────────────────────────────────────
 */

const APP = {
  SHEET_NAME: '네이처멘토_데이터',
  ROUND_CAP: 6,       // 학생 1인당 멘토 질문 상한(관찰 단계)
  IMAGE_CAP: 3,       // 학생 1인당 그림 생성 상한
  MAX_INPUT: 400,
  TEXT_MODEL_DEFAULT: 'gemini-2.5-flash',
  IMAGE_MODEL_DEFAULT: 'gemini-2.5-flash-image',
};

// ───────────── 생물 카드 30종 ─────────────
const ORGANISMS = [
  ['상어', '동물', '🦈', '피부(비늘)', '피부의 작은 돌기가 물의 저항을 줄여 빠르게 헤엄침', '전신 수영복, 배 바닥 코팅'],
  ['물총새', '동물', '🐦', '부리', '길고 뾰족한 부리로 물에 소리 없이 쏙 들어감', '고속열차 앞부분'],
  ['도마뱀붙이(게코)', '동물', '🦎', '발바닥', '발바닥의 아주 작은 털이 벽에 달라붙음', '벽 타는 로봇, 게코 테이프'],
  ['딱따구리', '동물', '🐦‍⬛', '머리와 부리', '머리뼈와 부리가 충격을 흡수해 수천 번 쪼아도 안전', '안전 헬멧'],
  ['올빼미', '동물', '🦉', '날개 깃털 가장자리', '톱니 모양 깃털이 바람 소리를 흩어 조용히 낢', '조용한 선풍기·풍력 날개'],
  ['모기', '동물', '🦟', '입(침)', '톱니가 있는 가는 침으로 거의 느끼지 못하게 찌름', '아프지 않은 주사바늘'],
  ['혹등고래', '동물', '🐋', '지느러미 앞쪽 혹', '혹이 물 흐름을 정리해 적은 힘으로 움직임', '풍력 발전기 날개'],
  ['흰개미', '동물', '🐜', '집(굴뚝)', '굴뚝과 바람길로 집 안 온도를 일정하게 유지', '에어컨 없는 건물'],
  ['거미', '동물', '🕷️', '거미줄', '가늘지만 매우 질겨 잘 끊어지지 않음', '튼튼한 실·그물'],
  ['나미브사막 딱정벌레', '동물', '🪲', '등껍질', '울퉁불퉁한 등에 안개 물방울을 모아 입으로 흘림', '안개로 물 모으는 그물'],
  ['북극곰', '동물', '🐻‍❄️', '털과 피부', '속이 빈 털 속 공기와 두꺼운 지방이 열이 빠져나가지 않게 막음', '보온 옷감'],
  ['문어', '동물', '🐙', '빨판', '빨판이 어떤 모양의 물건도 꽉 잡음', '흡착 로봇 손'],
  ['고양이', '동물', '🐱', '혀', '거친 돌기가 있는 혀로 털을 빗음', '털 빗'],
  ['꿀벌', '동물', '🐝', '벌집', '육각형 벌집은 적은 재료로 튼튼하고 가벼움', '허니콤 구조 판'],
  ['박쥐', '동물', '🦇', '귀와 소리', '초음파가 되돌아오는 것을 듣고 어두워도 길을 찾음', '초음파 센서 지팡이'],
  ['반딧불이', '동물', '✨', '배의 발광 부분', '특별한 표면이 적은 힘으로 밝게 빛남', '더 밝은 LED'],
  ['코끼리', '동물', '🐘', '코', '뼈 없이 자유롭게 움직여 큰 것도 작은 것도 집음', '부드러운 로봇 팔'],
  ['오리', '동물', '🦆', '발', '물갈퀴가 물을 많이 밀어 빠르게 헤엄침', '물놀이 오리발'],
  ['돌고래', '동물', '🐬', '소리', '소리를 내고 되돌아오는 소리로 물체 위치를 앎', '소나(음파 탐지기)'],
  ['몰포나비', '동물', '🦋', '날개 비늘', '작은 비늘 구조가 빛을 반사해 물감 없이 파란색을 냄', '염료 없는 색 옷감'],
  ['도꼬마리', '식물', '🌰', '열매의 가시', '갈고리 모양 가시가 동물 털에 붙어 씨앗을 멀리 보냄', '찍찍이(벨크로)'],
  ['연잎', '식물', '🪷', '잎 표면', '아주 작은 돌기와 왁스가 물방울을 굴려 먼지까지 씻어 냄', '방수 옷, 스스로 깨끗해지는 페인트'],
  ['단풍나무 씨앗', '식물', '🍁', '씨앗의 날개', '한쪽 날개 때문에 빙글빙글 돌며 천천히 멀리 날아감', '드론·헬리콥터 날개'],
  ['민들레 씨앗', '식물', '🌼', '갓털', '솜털 낙하산이 가벼워 바람 타고 멀리 감', '낙하산'],
  ['솔방울', '식물', '🌲', '비늘', '습도에 따라 열리고 닫혀 씨앗을 보호', '스스로 열리는 옷·환기창'],
  ['해바라기', '식물', '🌻', '꽃의 방향', '해를 따라 돌아 햇빛을 가장 많이 받음', '해를 따라 움직이는 태양광 판'],
  ['선인장', '식물', '🌵', '가시와 줄기', '가시와 두꺼운 줄기로 물을 모으고 아낌', '안개 물 모으기, 물 저장통'],
  ['장미', '식물', '🌹', '줄기의 가시', '가시가 동물이 먹지 못하게 지킴', '가시 철조망'],
  ['대나무', '식물', '🎋', '줄기', '속이 비고 마디가 있어 가볍지만 잘 휘고 안 부러짐', '가볍고 튼튼한 기둥'],
  ['파리지옥', '식물', '🪴', '잎', '벌레가 닿으면 순식간에 잎을 닫아 잡음', '빠르게 잡는 로봇 집게'],
];

// ───────────── 생물별 구체 정보(모습→하는 일→까닭→발명) + 검색어 ─────────────
const FACTS = {"상어": {"facts": ["상어 피부를 확대하면 작은 이빨 모양 비늘이 기와처럼 빽빽해요. 비늘마다 가는 줄무늬 홈이 있어요.", "줄무늬 홈 덕분에 물이 피부에 덜 달라붙어서 물의 저항이 줄고 빠르게 헤엄쳐요.", "작은 홈이 피부 바로 옆의 작은 소용돌이를 줄여 줘요. 울퉁불퉁해서 따개비 같은 생물도 잘 붙지 못해요.", "이 비밀을 흉내 내어 빠른 전신 수영복, 배 바닥 코팅, 세균이 덜 붙는 병원 표면 필름을 만들었어요."], "kw": ["상어 피부 확대", "상어 피부 비늘 역할", "상어 비늘 물 저항", "상어 피부 생체모방 수영복"]}, "물총새": {"facts": ["물총새 부리는 길고 끝이 뾰족해요. 끝에서 머리 쪽으로 갈수록 조금씩 천천히 두꺼워져요.", "공기에서 물속으로 다이빙할 때 물이 거의 튀지 않아서 물고기가 눈치채지 못해요.", "부리가 천천히 굵어지는 모양이라 물을 갑자기 밀지 않고 부드럽게 갈라요.", "일본 신칸센 고속열차 앞부분을 물총새 부리처럼 만들자 터널의 \"펑\" 소리가 줄고 전기도 덜 썼어요."], "kw": ["물총새 부리", "물총새 사냥 다이빙", "물총새 부리 모양", "물총새 신칸센"]}, "도마뱀붙이(게코)": {"facts": ["발가락 아래에 가로 주름이 있고, 주름마다 아주 가는 털이 수십만 개 나 있어요. 털 끝은 더 가늘게 갈라져 있어요.", "끈끈한 풀이 없는데도 유리 벽이나 천장에 붙어서 거꾸로 걸어 다녀요.", "아주 가는 털 끝이 벽에 아주 가까이 닿으면 작은 끌어당기는 힘이 생기고, 털이 아주 많아서 힘이 모여요. 발가락을 말아 올리면 쉽게 떨어져요.", "여러 번 붙였다 뗄 수 있는 게코 테이프와 벽을 타는 로봇을 만들었어요."], "kw": ["도마뱀붙이 발바닥 확대", "도마뱀붙이 벽 타기", "도마뱀붙이 발 털 원리", "게코 테이프"]}, "딱따구리": {"facts": ["머리뼈 일부가 스펀지처럼 구멍이 숭숭 나 있고, 혀를 받치는 긴 뼈가 머리를 한 바퀴 감싸고 있어요.", "1초에 20번 가까이 나무를 쪼아도 머리를 다치지 않아요.", "스펀지 같은 뼈와 머리를 감싼 뼈, 단단한 부리가 쿵 하는 충격을 나누어 받는다고 과학자들이 연구하고 있어요.", "충격을 줄이는 안전 헬멧과 비행기 블랙박스를 보호하는 장치를 연구했어요."], "kw": ["딱따구리 머리뼈", "딱따구리 나무 쪼기", "딱따구리 충격 흡수", "딱따구리 헬멧 생체모방"]}, "올빼미": {"facts": ["날개 앞쪽 깃털 가장자리가 빗살처럼 톱니 모양으로 갈라져 있고, 깃털 겉이 벨벳처럼 부드러워요.", "밤에 날갯짓을 해도 소리가 거의 나지 않아서 먹이가 눈치채지 못해요.", "톱니 모양 가장자리가 공기를 잘게 나누어 \"휙휙\" 하는 바람 소리를 줄여요.", "조용한 선풍기 날개, 풍력 발전기 날개, 신칸센 고속열차의 전기 받는 장치를 만들었어요."], "kw": ["올빼미 깃털 톱니", "올빼미 조용한 비행", "올빼미 깃털 소리", "올빼미 선풍기 날개"]}, "모기": {"facts": ["모기 침은 머리카락보다 가늘고, 여러 개의 가는 바늘이 한 묶음이에요. 끝에는 아주 작은 톱니가 있어요.", "사람이 거의 느끼지 못하게 피부를 찔러 피를 빨아요.", "톱니 때문에 피부에 닿는 부분이 적고, 침을 살짝 떨면서 조금씩 들어가서 덜 아파요.", "모기 침을 흉내 낸 덜 아픈 주사바늘을 만들었어요."], "kw": ["모기 침 확대", "모기 침 안 아픈 이유", "모기 침 톱니", "모기 주사바늘"]}, "혹등고래": {"facts": ["아주 긴 가슴지느러미 앞쪽 가장자리에 울퉁불퉁한 혹이 줄지어 있어요.", "몸이 버스보다 큰데도 방향을 날렵하게 바꾸며 물고기를 잡아요.", "혹 사이로 물이 나뉘어 흐르면서 지느러미에 물이 잘 붙어 있어, 기울여도 힘을 잃지 않아요.", "혹을 붙인 풍력 발전기 날개와 선풍기 날개를 만들었어요."], "kw": ["혹등고래 지느러미 혹", "혹등고래 사냥", "혹등고래 지느러미 원리", "혹등고래 풍력 발전기"]}, "흰개미": {"facts": ["아프리카·호주의 흰개미는 사람 키보다 높은 흙탑 집을 짓고, 집 안에 바람이 다니는 굴이 많아요.", "바깥이 아주 덥거나 추워도 집 안 온도가 비슷하게 유지돼요.", "따뜻한 공기는 위로 올라가 빠져나가고 시원한 공기가 들어오는 바람길이 있어요.", "짐바브웨의 \"이스트게이트 센터\" 건물은 흰개미 집을 흉내 내어 에어컨을 적게 써요."], "kw": ["흰개미 집 흙탑", "흰개미 집 온도", "흰개미 집 바람길", "이스트게이트 센터 흰개미"]}, "거미": {"facts": ["거미줄은 머리카락보다 훨씬 가늘어요. 바퀴살 같은 줄과 끈끈한 방울이 달린 동그란 줄이 있어요.", "날아오는 곤충이 세게 부딪혀도 끊어지지 않고 붙잡아요.", "거미줄 실은 단단하면서도 고무줄처럼 늘어나서 충격을 흡수해요. 같은 굵기라면 강철보다 질기다고 해요.", "가볍고 질긴 인공 거미줄 옷감과 수술용 실을 연구하고 있어요."], "kw": ["거미줄 확대", "거미줄 곤충", "거미줄 강철보다 질긴", "인공 거미줄"]}, "나미브사막 딱정벌레": {"facts": ["등에 작은 돌기가 오돌토돌 나 있어요. 돌기 끝은 물이 잘 붙고, 돌기 사이는 물을 튕겨요.", "비가 거의 오지 않는 사막에서 아침 안개로 물을 모아 마셔요.", "안개 물방울이 돌기에 붙어 점점 커지면 데굴데굴 굴러 입 쪽으로 흘러내려요.", "안개에서 물을 모으는 그물과 물병 표면을 연구했어요."], "kw": ["나미브사막 딱정벌레 등", "나미브사막 딱정벌레 안개", "딱정벌레 안개 물 모으기", "안개 수집 그물"]}, "북극곰": {"facts": ["하얗게 보이는 털은 사실 속이 빈 투명한 털이에요. 털 아래 피부는 검은색이고, 피부 밑에 두꺼운 지방이 있어요.", "영하 수십 도의 얼음 위에서도 몸이 따뜻해요.", "속이 빈 털 안의 공기가 열이 빠져나가는 것을 막고, 두꺼운 지방층이 몸을 감싸 줘요.", "속이 빈 실로 만든 가볍고 따뜻한 옷감을 만들었어요."], "kw": ["북극곰 털 속", "북극곰 추위", "북극곰 털 지방", "북극곰 털 옷감"]}, "문어": {"facts": ["다리마다 동그란 빨판이 수백 개 있고, 빨판 가운데가 오목하게 들어가 있어요.", "울퉁불퉁한 돌이나 매끈한 유리에도 꽉 붙고, 물건을 단단히 쥐어요.", "빨판을 붙인 뒤 안쪽 공간을 넓히면 안쪽이 바깥보다 누르는 힘이 약해져서, 바깥 물이 빨판을 꾹 눌러 줘요.", "물건을 부드럽게 잡는 로봇 손과 젖은 피부에도 붙는 패치를 만들었어요."], "kw": ["문어 빨판", "문어 빨판 붙는 힘", "문어 빨판 원리", "문어 빨판 로봇"]}, "고양이": {"facts": ["고양이 혀를 확대하면 작은 갈고리 모양 돌기가 목구멍 쪽을 향해 빽빽하게 나 있어요. 돌기 끝에는 작은 홈이 있어요.", "혀로 핥으면 털이 빗질한 것처럼 정리되고 침이 털 깊숙이 들어가요.", "갈고리 돌기가 엉킨 털을 풀어 주고, 홈에 담긴 침이 피부까지 닿아 털을 깨끗하게 해요.", "엉킨 털을 잘 풀고 청소도 쉬운 빗을 연구했어요."], "kw": ["고양이 혀 확대", "고양이 그루밍", "고양이 혀 돌기", "고양이 혀 빗"]}, "꿀벌": {"facts": ["벌집 방은 모두 똑같은 육각형이고, 방들이 빈틈없이 다닥다닥 붙어 있어요.", "적은 밀랍으로 꿀과 알을 많이 담을 수 있는 튼튼한 집을 지어요.", "육각형은 빈틈없이 이어 붙일 수 있으면서 벽 재료가 적게 들고, 누르는 힘을 골고루 나눠 받아요.", "비행기 날개나 문 속에 넣는 가볍고 튼튼한 \"허니콤 판\"을 만들었어요."], "kw": ["벌집 육각형", "벌집 구조", "벌집 육각형 이유", "허니콤 구조"]}, "박쥐": {"facts": ["박쥐는 사람이 들을 수 없는 아주 높은 소리(초음파)를 내고, 큰 귀로 되돌아오는 소리를 들어요.", "깜깜한 밤에도 부딪히지 않고 날면서 작은 곤충을 잡아요.", "소리가 물체에 부딪혀 되돌아오는 시간과 방향으로 물체가 어디에, 얼마나 크게 있는지 알아내요.", "시각장애인을 돕는 초음파 지팡이와 자동차 후방 감지기를 만들었어요."], "kw": ["박쥐 귀", "박쥐 초음파 사냥", "박쥐 초음파 원리", "초음파 지팡이"]}, "반딧불이": {"facts": ["배 끝에 빛을 내는 부분이 있고, 그 겉껍질에 아주 작은 비늘 같은 울퉁불퉁한 무늬가 있어요.", "뜨겁지 않은 차가운 빛을 깜빡여 친구에게 신호를 보내요.", "몸속 물질이 반응해 빛을 내고, 울퉁불퉁한 겉면 덕분에 빛이 안에 갇히지 않고 밖으로 잘 나가요.", "반딧불이 겉면 무늬를 흉내 내어 더 밝은 LED를 만들었어요."], "kw": ["반딧불이 빛", "반딧불이 빛 신호", "반딧불이 빛 원리", "반딧불이 LED"]}, "코끼리": {"facts": ["코끼리 코에는 뼈가 하나도 없고, 아주 많은 근육 다발로만 되어 있어요.", "큰 통나무를 들 수도 있고, 땅콩 한 알도 집을 수 있어요.", "뼈 없이 근육만 있어서 어느 방향으로든 휘고, 늘어나고, 감을 수 있어요.", "부드럽게 휘어지는 로봇 팔을 공장과 병원에서 쓰려고 만들었어요."], "kw": ["코끼리 코", "코끼리 코 물건 집기", "코끼리 코 근육", "코끼리 코 로봇 팔"]}, "오리": {"facts": ["발가락 사이에 얇은 막(물갈퀴)이 있어서 펼치면 부채처럼 넓어져요.", "물을 힘차게 밀어서 앞으로 헤엄쳐요.", "뒤로 밀 때는 물갈퀴를 활짝 펴서 물을 많이 밀고, 앞으로 당길 때는 접어서 물의 저항을 줄여요.", "물놀이용 오리발(핀)을 만들었어요."], "kw": ["오리 물갈퀴", "오리 헤엄", "오리 물갈퀴 원리", "오리발 발명"]}, "돌고래": {"facts": ["돌고래는 머리에서 \"딸깍딸깍\" 소리를 내고, 아래턱으로 되돌아오는 소리를 느껴요.", "흐린 바닷물 속에서도 물고기와 바위가 어디 있는지 알아요.", "소리가 물체에 부딪혀 돌아오는 시간으로 거리를 알아내요. 가까우면 빨리, 멀면 늦게 돌아와요.", "바닷속을 살피는 음파 탐지기(소나)와 바닷속 통신 장치를 만들었어요."], "kw": ["돌고래 소리", "돌고래 반향정위", "돌고래 소리로 거리", "소나 음파 탐지기"]}, "몰포나비": {"facts": ["날개를 아주 크게 확대하면 작은 비늘이 기와처럼 겹쳐 있고, 비늘에 아주 작은 주름 구조가 있어요.", "파란 물감(색소)이 없는데도 반짝이는 파란색으로 보여요.", "아주 작은 주름이 빛을 여러 번 반사해서 파란빛만 세게 보여요. 보는 방향에 따라 색이 조금씩 달라져요.", "물감 없이 색이 나는 옷감과 위조를 막는 무늬를 만들었어요."], "kw": ["몰포나비 날개 확대", "몰포나비 파란색", "구조색 원리", "몰포나비 생체모방"]}, "도꼬마리": {"facts": ["열매 겉에 끝이 갈고리처럼 구부러진 가시가 빽빽하게 나 있어요.", "지나가는 동물 털이나 사람 옷에 착 달라붙어서 씨앗이 멀리 이동해요.", "갈고리가 털이나 옷의 실 고리에 걸려서 잘 떨어지지 않아요.", "1941년 스위스의 메스트랄이 개 털에 붙은 열매를 보고 찍찍이(벨크로)를 만들었어요."], "kw": ["도꼬마리 열매 가시", "도꼬마리 씨앗 퍼짐", "도꼬마리 갈고리", "벨크로 발명 도꼬마리"]}, "연잎": {"facts": ["연잎 겉에는 아주 작은 돌기가 빽빽하고, 그 위를 더 작은 왁스 알갱이가 덮고 있어요.", "물방울이 구슬처럼 동그랗게 맺혀 굴러떨어지면서 먼지까지 데려가요.", "돌기 때문에 물방울이 잎에 닿는 면이 아주 작고, 왁스가 물을 밀어내요.", "젖지 않는 옷감, 스스로 깨끗해지는 페인트와 유리를 만들었어요."], "kw": ["연잎 물방울", "연잎 효과", "연잎 표면 돌기", "연잎 효과 생체모방"]}, "단풍나무 씨앗": {"facts": ["씨앗 한쪽에 얇고 넓은 날개가 하나 붙어 있어요. 씨앗 쪽은 무겁고 날개 끝은 가벼워요.", "떨어질 때 헬리콥터처럼 빙글빙글 돌며 천천히 내려와 바람을 타고 멀리 가요.", "한쪽으로 치우친 날개가 돌면서 공기를 받아 떨어지는 속도를 늦춰요.", "작은 드론, 씨앗을 뿌리는 장치, 공기를 재는 작은 센서를 연구했어요."], "kw": ["단풍나무 씨앗 날개", "단풍나무 씨앗 떨어지는 모습", "단풍나무 씨앗 회전 원리", "단풍나무 씨앗 드론"]}, "민들레 씨앗": {"facts": ["씨앗 위에 가는 솜털(갓털) 약 100가닥이 우산살처럼 둥글게 펼쳐져 있어요.", "작은 바람에도 둥실 떠서 아주 멀리 날아가요.", "솜털 사이로 공기가 지나가면서 바로 위에 작은 공기 소용돌이 고리가 생겨 씨앗을 붙잡아 줘요.", "작은 센서를 멀리 날려 보내는 낙하산과 가벼운 비행 장치를 연구했어요."], "kw": ["민들레 씨앗 갓털", "민들레 씨앗 날아가기", "민들레 씨앗 비행 원리", "민들레 씨앗 낙하산"]}, "솔방울": {"facts": ["솔방울 비늘은 두 겹으로 되어 있고, 두 겹은 물을 머금었을 때 늘어나는 정도가 달라요.", "맑은 날에는 비늘을 활짝 열고, 비 오는 날에는 꼭 닫아요.", "물을 먹으면 한쪽 층이 더 많이 늘어나서 비늘이 휘어 닫히고, 마르면 다시 열려요.", "땀이 나면 저절로 틈이 열리는 운동복, 습도에 따라 열리는 창문을 만들었어요."], "kw": ["솔방울 비늘", "솔방울 비 오는 날", "솔방울 열리고 닫히는 원리", "솔방울 생체모방 옷"]}, "해바라기": {"facts": ["어린 해바라기는 꽃봉오리가 해를 따라 동쪽에서 서쪽으로 고개를 돌려요. 다 피면 동쪽을 바라봐요.", "햇빛을 많이 받아 쑥쑥 자라요.", "줄기의 해 반대쪽이 더 빨리 자라서 고개가 해 쪽으로 기울어요. 밤에는 다시 동쪽으로 돌아가요.", "해를 따라 움직여 전기를 더 많이 만드는 태양광 판을 만들었어요."], "kw": ["해바라기 해 따라", "해바라기 자라기", "해바라기 고개 돌리는 이유", "해바라기 태양광"]}, "선인장": {"facts": ["잎 대신 뾰족한 가시가 있고, 줄기는 통통하며 겉이 왁스로 반질반질해요.", "비가 거의 없는 사막에서도 물을 모으고 오래 아껴 써요.", "가시 끝에 맺힌 안개 물방울이 가시를 타고 줄기 쪽으로 이동하고, 통통한 줄기에 물을 저장해요. 잎이 없어 물이 덜 날아가요.", "안개에서 물을 모으는 장치와 물을 저장하는 건물 설계를 연구했어요."], "kw": ["선인장 가시", "선인장 물 저장", "선인장 가시 안개 물", "선인장 생체모방"]}, "장미": {"facts": ["줄기에 끝은 뾰족하고 아래쪽은 넓은 가시가 있어요. 가시는 줄기 겉껍질이 변한 거예요.", "동물이 줄기를 먹거나 밟지 못하게 지켜요. 다른 식물에 걸쳐 기어오를 때도 써요.", "뾰족한 끝이 콕 찌르고, 아래쪽이 넓어서 잘 부러지지 않아요.", "울타리의 가시철사(철조망)처럼 \"찔려서 못 들어오게 하는\" 발명과 같은 생각이에요."], "kw": ["장미 가시", "장미 가시 역할", "장미 가시 모양", "가시철사 발명"]}, "대나무": {"facts": ["줄기 속이 비어 있고, 일정한 간격으로 마디(막힌 벽)가 있어요.", "아주 가볍지만 바람에 크게 휘어도 잘 부러지지 않고 하늘 높이 자라요.", "속이 빈 관 모양은 재료가 적어도 튼튼하고, 마디가 관이 찌그러지지 않게 받쳐 줘요.", "가볍고 튼튼한 기둥, 높은 건물의 뼈대, 자전거 틀을 만들었어요."], "kw": ["대나무 마디 속", "대나무 바람 휘어짐", "대나무 튼튼한 이유", "대나무 구조 건축"]}, "파리지옥": {"facts": ["잎이 조개처럼 두 쪽으로 벌어져 있고, 안쪽에 짧은 감각털이 3개씩 있어요. 가장자리에는 긴 가시털이 있어요.", "벌레가 감각털을 짧은 시간에 두 번 건드리면 0.1초 만에 잎을 닫아요.", "볼록하던 잎이 \"딸깍\" 하고 오목하게 뒤집히면서 순식간에 닫혀요. 두 번 건드려야 닫혀서 빗방울에는 헛닫히지 않아요.", "빠르게 잡는 로봇 집게와 순간적으로 모양이 바뀌는 장치를 연구했어요."], "kw": ["파리지옥 감각털", "파리지옥 벌레 잡기", "파리지옥 닫히는 원리", "파리지옥 로봇"]}};
// FACTS_END

// ───────────── 검사 문항(사전·사후 공용 27문항) ─────────────
const ITEMS = [
  ['CNI01', 'CNI', '자연 즐기기', '나는 자연에서 나는 여러 가지 소리(새소리, 바람 소리 등)를 듣는 것이 좋다.'],
  ['CNI02', 'CNI', '자연 즐기기', '나는 자연에서 피어 있는 들꽃을 보는 것이 좋다.'],
  ['CNI03', 'CNI', '자연 즐기기', '나는 슬플 때 밖에 나가서 자연을 즐기는 것이 좋다.'],
  ['CNI04', 'CNI', '자연 즐기기', '자연 속에 있으면 마음이 편안해진다.'],
  ['CNI05', 'CNI', '자연 즐기기', '나는 식물을 가꾸는 것(화분, 텃밭 등)이 좋다.'],
  ['CNI06', 'CNI', '자연 즐기기', '돌이나 조개껍데기를 모으는 것은 재미있다.'],
  ['CNI07', 'CNI', '생물 공감', '야생 동물이 다치면 나는 슬프다.'],
  ['CNI08', 'CNI', '생물 공감', '나는 야생 동물이 깨끗한 환경에서 사는 것을 보는 것이 좋다.'],
  ['CNI09', 'CNI', '생물 공감', '나는 동물이나 식물을 만져 보는 것을 즐긴다.'],
  ['CNI10', 'CNI', '생물 공감', '동물을 돌보는 것은 나에게 중요하다.'],
  ['CNI11', 'CNI', '하나됨', '사람은 자연의 한 부분이다.'],
  ['CNI12', 'CNI', '하나됨', '사람은 식물과 동물 없이는 살 수 없다.'],
  ['CNI13', 'CNI', '자연 즐기기', '밖(자연)에 나가 있으면 나는 행복하다.'],
  ['CNI14', 'CNI', '책임감', '내가 하는 행동은 자연을 다르게 만들 수 있다.'],
  ['CNI15', 'CNI', '책임감', '땅에 떨어진 쓰레기를 줍는 것은 환경을 돕는 일이다.'],
  ['CNI16', 'CNI', '책임감', '사람은 자연을 마음대로 바꿀 권리가 없다.'],
  ['CSE01', 'CSE', '창의적 자기효능감', '나는 새로운 생각(아이디어)을 잘 떠올린다.'],
  ['CSE02', 'CSE', '창의적 자기효능감', '나는 좋은 생각이 많다.'],
  ['CSE03', 'CSE', '창의적 자기효능감', '나는 상상력이 풍부하다.'],
  ['CSE04', 'CSE', '창의적 자기효능감', '나는 어려운 문제도 새로운 방법으로 풀 수 있다.'],
  ['CSE05', 'CSE', '창의적 자기효능감', '나는 내 생각(아이디어)이 좋은 생각이라고 믿는다.'],
  ['CSE06', 'CSE', '창의적 자기효능감', '나는 문제를 풀 때 남들과 다른 특별한 방법을 생각해 낼 수 있다.'],
  ['AIP01', 'AIP', 'AI 생각 파트너', '인공지능은 내가 스스로 생각하도록 도와주는 친구가 될 수 있다.'],
  ['AIP02', 'AIP', 'AI 생각 파트너', '인공지능이 질문을 하면 나는 더 깊이 생각하게 된다.'],
  ['AIP03', 'AIP', 'AI 생각 파트너', '인공지능과 함께 공부하는 것은 재미있다.'],
  ['AIP04', 'AIP', '생각의 주인', '인공지능이 말한 것이 맞는지 나는 스스로 확인해 본다.'],
  ['AIP05', 'AIP', '생각의 주인', '인공지능이 도와주어도 내 생각이 더 중요하다.'],
];
const OPEN_Q = ['6번의 수업 중에서 가장 기억에 남는 활동은 무엇인가요? 왜 그런가요?', 'AI 네이처 멘토와 함께 공부할 때 좋았던 점과 어려웠던 점을 써 주세요.', '수업을 하고 나서 동물이나 식물을 보는 내 마음이 달라진 점이 있나요?'];

// ───────────── 시스템 프롬프트 ─────────────
const SYS_MENTOR = `너는 '네이처 멘토'야. 자연 선생님의 조수로서 9살(초등학교 3학년) 어린이가 생물의 비밀(생체모방)을 찾도록 도와.
규칙:
1) 어린이의 관찰 기록을 읽고, 아래 '정보 카드'의 [이번 단계] 내용을 바탕으로 구체적인 과학 정보를 1~2문장으로 쉽게 알려 준다(info). 정보 카드에 없는 사실은 지어내지 않는다.
2) 응답은 반드시 JSON: {"praise":"...","info":"...","q1":"...","keyword":"..."}
   - praise: 어린이가 쓴 내용 중 구체적인 부분을 칭찬하는 한 문장(30자 이내)
   - info: 이번 단계의 구체적인 정보 1~2문장(70자 이내, 숫자·모양·크기 같은 구체적 사실 포함)
   - q1: 그 정보를 내 말로 기록 칸에 정리하도록 돕는 질문 한 문장(30자 이내)
   - keyword: 어린이가 네이버·구글에서 더 찾아볼 검색어(2~4단어)
3) 3학년이 아는 쉬운 말, 다정한 존댓말. 어린이가 틀리게 썼으면 "틀렸다" 대신 정보로 부드럽게 바로잡는다.
4) 생물을 잡거나 해치는 방법, 위험한 실험, 개인정보, 수업과 관계없는 주제는 답하지 않고 활동으로 되돌린다.
5) 모든 생물을 존중하는 말로 표현한다.
정보 카드(생물: {{ORG}})
- 모습: {{F0}}
- 하는 일: {{F1}}
- 까닭: {{F2}}
- 발명: {{F3}}
[이번 단계] {{LEVEL}}`;
const SYS_CONNECT = `너는 '네이처 멘토'야. 9살 어린이가 쓴 '생활 속 불편한 문제'를 읽고, 그 문제를 해결하는 데 어울리는 생물의 비밀 후보 3개를 추천해.
규칙: 1) 반드시 아래 생물 목록 중에서만 고른다. 목록: {{LIST}}
2) 응답은 JSON: {"candidates":[{"organism":"생물 이름(목록과 똑같이)","feature":"특별한 부분","principle":"비밀을 3학년 말로 한 문장(25자 이내)","why_fit":"이 문제에 왜 어울리는지 한 문장(25자 이내)"}, ... 3개]}
3) 답을 정해 주지 말고 후보만 준다. 어린이가 '왜 이 생물을 골랐는지' 스스로 쓰게 하는 것이 목적이다.
4) 쉬운 말, 다정한 존댓말, 생물 존중. 위험하거나 수업과 무관한 입력이면 candidates를 빈 배열로 주고 "redirect" 키에 활동으로 되돌리는 한 문장을 넣는다.`;
const SYS_FEEDBACK = `너는 '네이처 멘토'야. 9살 어린이가 쓴 생체모방 발명품 설명문을 읽고 JSON으로 답해: {"praise":"구체적 칭찬 한 문장","check":"설명문에 '어떤 생물의 어떤 비밀을 어디에 썼는지'가 들어 있는지 다정하게 짚어 주는 한 문장","q":"발명품을 더 좋게 만들 질문 한 문장"}. 모든 문장 30자 이내, 쉬운 말, 존댓말, 답을 대신 써 주지 않는다.`;
const IMAGE_PROMPT_PREFIX = `A friendly children's picture-book illustration (soft watercolor, pastel colors, clean white background, no text, no letters, no logos, no real people) of an invention designed by a 9-year-old child. Draw exactly what the child describes, keeping the part that imitates the organism clearly visible and cute. Child's description (Korean): `;

// ───────────── HTTP 진입점 ─────────────
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (!p.action) return json_({ ok: true, app: 'nature-mentor', version: '2.0', time: now_(), mentor: hasKey_() ? 'gemini' : 'rule' });
  return handle_(p);
}
function doPost(e) {
  let body = {};
  try { body = JSON.parse((e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ error: 'JSON 형식이 아니에요.' }); }
  return handle_(body);
}
function handle_(p) {
  try {
    const a = String(p.action || '');
    const map = {
      ping: function () { return { ok: true, mentor: hasKey_() ? 'gemini' : 'rule', image_on: hasKey_() && setting_('image_on'), mentor_on: setting_('mentor_on') }; },
      organisms: function () { return { organisms: getOrganisms() }; },
      items: function () { return { items: ITEMS.map(function (r) { return { code: r[0], scale: r[1], factor: r[2], text: r[3] }; }), open: OPEN_Q }; },
      login: function () { return login(p.class, p.seat); },
      progress: function () { return progress_(p.student_id); },
      survey: function () { return saveSurvey(p); },
      quiz: function () { return saveQuiz(p); },
      askMentor: function () { return askMentor(p); },
      saveSecret: function () { return saveSecret(p); },
      connect: function () { return connectProblem(p); },
      saveChoice: function () { return saveChoice(p); },
      feedback: function () { return inventionFeedback(p); },
      generateImage: function () { return generateImage(p); },
      saveInvention: function () { return saveInvention(p); },
      gallery: function () { return { items: getGallery(p.class) }; },
      image: function () { return { data_url: getImageData(p.file_id) }; },
      react: function () { return react(p); },
      protect: function () { return saveProtect(p); },
      reflect: function () { return saveReflect(p); },
      track: function () { return track(p); },
      teacher: function () { return teacher_(p); },
    };
    if (!map[a]) return json_({ error: '알 수 없는 요청: ' + a });
    return json_(map[a]());
  } catch (err) {
    return json_({ error: String(err.message || err).slice(0, 200) });
  }
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

// ───────────── 기본 유틸 ─────────────
function props_() { return PropertiesService.getScriptProperties(); }
function hasKey_() { return !!props_().getProperty('GEMINI_API_KEY'); }
function apiKey_() { const k = props_().getProperty('GEMINI_API_KEY'); if (!k) throw new Error('GEMINI_API_KEY 없음'); return k; }
function textModel_() { return props_().getProperty('TEXT_MODEL') || APP.TEXT_MODEL_DEFAULT; }
function imageModel_() { return props_().getProperty('IMAGE_MODEL') || APP.IMAGE_MODEL_DEFAULT; }
function now_() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }

const SHEETS = {
  '학생': ['student_id', 'class', 'seat', 'first_seen', 'last_seen'],
  '설문': ['timestamp', 'student_id', 'class', 'seat', 'phase', 'gender'].concat(ITEMS.map(function (r) { return r[0]; }), ['M_CNI', 'M_CSE', 'M_AIP', 'open1', 'open2', 'open3']),
  '퀴즈': ['timestamp', 'student_id', 'class', 'seat', 'score', 'answers', 'teacher_sentence'],
  '로그': ['timestamp', 'student_id', 'class', 'seat', 'stage', 'round', 'input', 'output', 'model', 'latency_ms'],
  '비밀': ['timestamp', 'student_id', 'organism', 'what', 'how', 'why', 'secret', 'version'],
  '연결': ['timestamp', 'student_id', 'problem', 'candidates', 'chosen', 'reason'],
  '발명': ['timestamp', 'invention_id', 'student_id', 'class', 'organism', 'name', 'description', 'diff_note', 'image_file_id', 'image_count'],
  '반응': ['timestamp', 'student_id', 'invention_id', 'type'],
  '지킴이': ['timestamp', 'student_id', 'class', 'species', 'lost_invention', 'promise', 'letter'],
  '소감': ['timestamp', 'student_id', 'class', 'sentence_organism', 'sentence_secret', 'sentence_use', 'reflection', 'nature_is'],
  '생물카드': ['name', 'type', 'emoji', 'look', 'secret_ref', 'invention_ref', 'photo_url'],
  '설정': ['key', 'value'],
};

/** 최초 1회 실행 */
function setup() {
  let id = props_().getProperty('SHEET_ID');
  let ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.create(APP.SHEET_NAME);
  props_().setProperty('SHEET_ID', ss.getId());
  Object.keys(SHEETS).forEach(function (name) {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) { sh.appendRow(SHEETS[name]); sh.setFrozenRows(1); }
  });
  const cards = ss.getSheetByName('생물카드');
  if (cards.getLastRow() < 2) cards.getRange(2, 1, ORGANISMS.length, 6).setValues(ORGANISMS);
  const s1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
  if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  const cfg = ss.getSheetByName('설정');
  if (cfg.getLastRow() < 2) cfg.getRange(2, 1, 3, 2).setValues([['mentor_on', 'TRUE'], ['image_on', 'TRUE'], ['survey_phase', 'pre']]);
  if (!props_().getProperty('TEACHER_PIN')) props_().setProperty('TEACHER_PIN', String(Math.floor(100000 + Math.random() * 900000)));
  Logger.log('데이터 시트: ' + ss.getUrl());
  return ss.getUrl();
}
function ss_() { const id = props_().getProperty('SHEET_ID'); if (!id) throw new Error('setup()을 먼저 실행하세요.'); return SpreadsheetApp.openById(id); }
function sheet_(name) { let sh = ss_().getSheetByName(name); if (!sh) { sh = ss_().insertSheet(name); sh.appendRow(SHEETS[name] || ['data']); } return sh; }
function setting_(key) {
  const rows = sheet_('설정').getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === key) return String(rows[i][1]).toUpperCase() !== 'FALSE';
  return true;
}
function settingValue_(key, def) {
  const rows = sheet_('설정').getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === key) return String(rows[i][1]);
  return def;
}
function setSetting_(key, value) {
  const sh = sheet_('설정'); const rows = sh.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === key) { sh.getRange(i + 1, 2).setValue(value); return; }
  sh.appendRow([key, value]);
}

// ───────────── 안전 처리 ─────────────
const BLOCK = ['죽이', '잡는 법', '죽는', '독약', '칼로', '불 지', '때리', '주소', '전화번호', '카톡', '아이디', '비밀번호'];
function sanitize_(t) {
  t = String(t || '').trim().slice(0, APP.MAX_INPUT);
  return t.replace(/\d{2,3}-\d{3,4}-\d{4}/g, '[번호]').replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '[메일]');
}
function isBlocked_(t) { t = String(t || ''); return BLOCK.some(function (w) { return t.indexOf(w) >= 0; }); }
const REDIRECT = { praise: '궁금한 게 많군요!', q1: '지금은 생물의 비밀을 찾아볼까요?', q2: '고른 생물의 어디가 특별해 보이나요?', hint: '사진에서 가장 눈에 띄는 부분을 다시 봐요.' };

// ───────────── Gemini ─────────────
function gemini_(systemText, userText, schema) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + textModel_() + ':generateContent?key=' + apiKey_();
  const body = {
    system_instruction: { parts: [{ text: systemText }] },
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    safetySettings: ['HARM_CATEGORY_HARASSMENT', 'HARM_CATEGORY_HATE_SPEECH', 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'HARM_CATEGORY_DANGEROUS_CONTENT'].map(function (c) { return { category: c, threshold: 'BLOCK_LOW_AND_ABOVE' }; }),
  };
  if (schema) { body.generationConfig.responseMimeType = 'application/json'; body.generationConfig.responseSchema = schema; }
  const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) throw new Error('Gemini ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  const parts = (((JSON.parse(res.getContentText()).candidates || [])[0] || {}).content || {}).parts || [];
  return parts.map(function (p) { return p.text || ''; }).join('');
}
function parseJson_(text, fallback) {
  try { return JSON.parse(text); } catch (e) { const m = String(text).match(/\{[\s\S]*\}/); if (m) { try { return JSON.parse(m[0]); } catch (e2) {} } return fallback; }
}
function log_(sid, cls, seat, stage, round, input, output, model, ms) {
  sheet_('로그').appendRow([now_(), sid, cls, seat, stage, round, JSON.stringify(input), JSON.stringify(output), model, ms]);
}

// ───────────── 학생 ─────────────
function login(classNo, seatNo) {
  classNo = parseInt(classNo, 10); seatNo = parseInt(seatNo, 10);
  if (!(classNo >= 1 && classNo <= 20 && seatNo >= 1 && seatNo <= 99)) throw new Error('반과 번호를 다시 확인해 주세요.');
  const sid = classNo + '-' + seatNo;
  const sh = sheet_('학생'); const rows = sh.getDataRange().getValues(); let found = false;
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === sid) { sh.getRange(i + 1, 5).setValue(now_()); found = true; break; }
  if (!found) sh.appendRow([sid, classNo, seatNo, now_(), now_()]);
  const prog = progress_(sid);
  return { student_id: sid, class: classNo, seat: seatNo, mentor_on: setting_('mentor_on'), image_on: hasKey_() && setting_('image_on'), survey_phase: settingValue_('survey_phase', 'pre'), progress: prog };
}
function progress_(sid) {
  const secret = lastRow_('비밀', 1, sid), conn = lastRow_('연결', 1, sid), inv = lastRow_('발명', 2, sid);
  const surveys = sheet_('설문').getDataRange().getValues();
  let pre = false, post = false;
  for (var i = 1; i < surveys.length; i++) if (surveys[i][1] === sid) { if (surveys[i][4] === 'pre') pre = true; if (surveys[i][4] === 'post') post = true; }
  return {
    pre_done: pre, post_done: post,
    quiz_done: !!lastRow_('퀴즈', 1, sid),
    organism: secret ? secret[2] : '', secret: secret ? secret[6] : '', what: secret ? secret[3] : '', how: secret ? secret[4] : '', why: secret ? secret[5] : '',
    problem: conn ? conn[2] : '', chosen: conn ? conn[4] : '', reason: conn ? conn[5] : '',
    invention_id: inv ? inv[1] : '', invention_name: inv ? inv[5] : '', description: inv ? inv[6] : '', file_id: inv ? inv[8] : '',
    protect_done: !!lastRow_('지킴이', 1, sid), reflect_done: !!lastRow_('소감', 1, sid),
    rounds: countRows_('로그', 1, sid, 4, 'observe'), images: countRows_('로그', 1, sid, 4, 'image'),
  };
}
function lastRow_(name, col, value) { const rows = sheet_(name).getDataRange().getValues(); for (var i = rows.length - 1; i >= 1; i--) if (String(rows[i][col]) === String(value)) return rows[i]; return null; }
function countRows_(name, col, value, col2, value2) { const rows = sheet_(name).getDataRange().getValues(); let n = 0; for (var i = 1; i < rows.length; i++) if (String(rows[i][col]) === String(value) && (col2 === undefined || rows[i][col2] === value2)) n++; return n; }

// ───────────── 설문(사전·사후) ─────────────
function saveSurvey(p) {
  const phase = p.phase === 'post' ? 'post' : 'pre';
  const ans = p.answers || {};
  const scores = ITEMS.map(function (r) { const v = parseInt(ans[r[0]], 10); return v >= 1 && v <= 5 ? v : ''; });
  const missing = scores.filter(function (s) { return s === ''; }).length;
  if (missing > 0) return { error: '아직 답하지 않은 문항이 ' + missing + '개 있어요.' };
  function mean(prefix) { var v = []; ITEMS.forEach(function (r, i) { if (r[1] === prefix) v.push(scores[i]); }); return (v.reduce(function (a, b) { return a + b; }, 0) / v.length).toFixed(3); }
  const open = (p.open || []).map(sanitize_);
  sheet_('설문').appendRow([now_(), p.student_id, p.class, p.seat, phase, p.gender || ''].concat(scores, [mean('CNI'), mean('CSE'), mean('AIP'), open[0] || '', open[1] || '', open[2] || '']));
  return { ok: true, phase: phase };
}

// ───────────── 1차시 퀴즈 ─────────────
function saveQuiz(p) {
  sheet_('퀴즈').appendRow([now_(), p.student_id, p.class, p.seat, p.score, JSON.stringify(p.answers || []), sanitize_(p.teacher_sentence)]);
  return { ok: true };
}

// ───────────── 생물 카드 ─────────────
function getOrganisms() {
  const rows = sheet_('생물카드').getDataRange().getValues(); const out = [];
  for (var i = 1; i < rows.length; i++) if (rows[i][0]) out.push({ name: rows[i][0], type: rows[i][1], emoji: rows[i][2], look: rows[i][3], photo: rows[i][6] || '' });
  return out;
}
function orgRef_(name) {
  const rows = sheet_('생물카드').getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][0] === name) return { look: rows[i][3], secret: rows[i][4], invention: rows[i][5] };
  return { look: '', secret: '(참고 없음)', invention: '(참고 없음)' };
}

// ───────────── 2차시 관찰·비밀 찾기 ─────────────
const LEVELS = ['모습', '하는 일', '까닭', '발명'];
const LEVEL_Q = [
  '사진에서 그 모습을 찾아 "무엇이 특별해?" 칸에 내 말로 더 써 볼까요?',
  '그 모습 덕분에 하는 일을 "어떻게?" 칸에 써 볼까요?',
  '왜 그런 모양인지 "왜 그럴까?" 칸에 내 말로 써 볼까요?',
  '이 비밀을 우리 생활 어디에 또 쓸 수 있을까요?',
];
function factOf_(organism) { return FACTS[organism] || null; }
function ruleMentor_(organism, what, how, why, level) {
  // API 키가 없거나 오류일 때: 정보 카드 기반 구체 정보 + 질문
  const f = factOf_(organism);
  const praise = why ? '"왜"까지 생각했군요, 멋져요!' : how ? '"어떻게"까지 잘 썼어요!' : what ? '"' + what.slice(0, 14) + '" 잘 관찰했어요!' : organism + '을(를) 골랐군요!';
  if (!f) return { praise: praise, info: '사진을 자세히 보고 특별한 부분을 찾아봐요.', q1: LEVEL_Q[level], keyword: organism + ' 특징', level: level, mode: 'rule' };
  return { praise: praise, info: f.facts[level], q1: LEVEL_Q[level], keyword: f.kw[level], level: level, mode: 'rule' };
}
function askMentor(p) {
  const sid = p.student_id, cls = p.class, seat = p.seat;
  if (!setting_('mentor_on')) return { praise: '지금은 멘토가 쉬는 시간이에요.', info: '사진과 검색으로 직접 찾아봐요.', q1: '찾은 내용을 내 말로 써 볼까요?', keyword: String(p.organism || '') + ' 특징' };
  // 단계는 '생물별'로 셉니다(생물을 바꾸면 모습부터 다시). 전체 상한은 ROUND_CAP × 3
  const rows = sheet_('로그').getDataRange().getValues(); let total = 0, orgRound = 0;
  const tag = '"organism":' + JSON.stringify(String(p.organism || ''));
  for (var r = 1; r < rows.length; r++) if (rows[r][1] === sid && rows[r][4] === 'observe') { total++; if (String(rows[r][6]).indexOf(tag) >= 0) orgRound++; }
  const round = orgRound + 1;
  if (round > APP.ROUND_CAP || total >= APP.ROUND_CAP * 3) return { praise: '정말 열심히 생각했어요!', info: '지금까지 알게 된 정보를 모으면 비밀 1문장이 돼요.', q1: '이제 내 말로 비밀을 정리해 볼까요?', keyword: String(p.organism || '') + ' 생체모방', capped: true, round: round, cap: APP.ROUND_CAP };
  const what = sanitize_(p.what), how = sanitize_(p.how), why = sanitize_(p.why);
  const input = { organism: p.organism, what: what, how: how, why: why };
  if (isBlocked_(what + how + why)) { log_(sid, cls, seat, 'observe', round, input, { redirect: true }, 'rule', 0); return { praise: '궁금한 게 많군요!', info: '지금은 생물의 특별한 모습을 찾아보는 시간이에요.', q1: '고른 생물의 어디가 특별해 보이나요?', keyword: String(p.organism || '') + ' 특징' }; }
  const level = Math.min(round - 1, 3);
  const f = factOf_(p.organism);
  let out = null, model = 'rule'; const t0 = Date.now();
  if (hasKey_() && f) {
    try {
      const sys = SYS_MENTOR.replace('{{ORG}}', p.organism).replace('{{F0}}', f.facts[0]).replace('{{F1}}', f.facts[1]).replace('{{F2}}', f.facts[2]).replace('{{F3}}', f.facts[3]).replace('{{LEVEL}}', LEVELS[level]);
      const user = '생물: ' + p.organism + '\n무엇이 특별해?: ' + (what || '(아직 안 씀)') + '\n어떻게 그런 일을 해?: ' + (how || '(아직 안 씀)') + '\n왜 그럴까?: ' + (why || '(아직 안 씀)') + '\n(질문 횟수: ' + round + '회째)';
      const schema = { type: 'OBJECT', properties: { praise: { type: 'STRING' }, info: { type: 'STRING' }, q1: { type: 'STRING' }, keyword: { type: 'STRING' } }, required: ['praise', 'info', 'q1', 'keyword'] };
      out = parseJson_(gemini_(sys, user, schema), null); model = textModel_();
      if (out) out.level = level;
    } catch (e) { out = null; model = 'rule(fallback)'; }
  }
  if (!out || !out.info) out = ruleMentor_(p.organism, what, how, why, level);
  log_(sid, cls, seat, 'observe', round, input, out, model, Date.now() - t0);
  out.round = round; out.cap = APP.ROUND_CAP;
  return out;
}
/** 검색 링크 클릭 기록(연구용) */
function track(p) {
  log_(p.student_id, p.class, p.seat, 'search', 0, { engine: sanitize_(p.engine), query: sanitize_(p.query), organism: sanitize_(p.organism) }, {}, 'click', 0);
  return { ok: true };
}
function saveSecret(p) {
  const version = countRows_('비밀', 1, p.student_id) + 1;
  sheet_('비밀').appendRow([now_(), p.student_id, p.organism, sanitize_(p.what), sanitize_(p.how), sanitize_(p.why), sanitize_(p.secret), version]);
  return { ok: true, version: version };
}

// ───────────── 3차시 연결하기 ─────────────
function ruleConnect_(problem) {
  const kw = [
    [['물', '비', '젖', '우산', '신발', '방수'], ['연잎', '오리', '나미브사막 딱정벌레']],
    [['미끄', '넘어', '붙', '떨어', '벽'], ['도마뱀붙이(게코)', '문어', '도꼬마리']],
    [['시끄', '소리', '소음', '조용'], ['올빼미', '물총새', '박쥐']],
    [['무거', '가방', '튼튼', '부러', '가벼'], ['대나무', '꿀벌', '거미']],
    [['더워', '추워', '덥', '춥', '온도'], ['흰개미', '북극곰', '선인장']],
    [['어두', '불', '밤', '빛'], ['반딧불이', '박쥐', '몰포나비']],
    [['아프', '다치', '머리', '안전', '헬멧'], ['딱따구리', '모기', '꿀벌']],
    [['빨리', '느려', '달리', '헤엄'], ['상어', '물총새', '혹등고래']],
  ];
  let picks = null;
  for (var i = 0; i < kw.length; i++) if (kw[i][0].some(function (w) { return problem.indexOf(w) >= 0; })) { picks = kw[i][1]; break; }
  if (!picks) picks = ['연잎', '도마뱀붙이(게코)', '단풍나무 씨앗'];
  return { candidates: picks.map(function (n) { const r = orgRef_(n); return { organism: n, feature: r.look, principle: r.secret.slice(0, 30), why_fit: '이 비밀이 문제에 어울릴지 생각해 봐요.' }; }), mode: 'rule' };
}
function connectProblem(p) {
  const sid = p.student_id; const problem = sanitize_(p.problem);
  if (!problem) return { error: '불편한 문제를 먼저 써 주세요.' };
  if (isBlocked_(problem)) return { candidates: [], redirect: '그 이야기 말고, 학교나 집에서 불편했던 일을 써 볼까요?' };
  let out = null, model = 'rule'; const t0 = Date.now();
  if (hasKey_()) {
    try {
      const list = getOrganisms().map(function (o) { return o.name + '(' + o.look + ')'; }).join(', ');
      const schema = { type: 'OBJECT', properties: { candidates: { type: 'ARRAY', items: { type: 'OBJECT', properties: { organism: { type: 'STRING' }, feature: { type: 'STRING' }, principle: { type: 'STRING' }, why_fit: { type: 'STRING' } }, required: ['organism', 'feature', 'principle', 'why_fit'] } }, redirect: { type: 'STRING' } }, required: ['candidates'] };
      out = parseJson_(gemini_(SYS_CONNECT.replace('{{LIST}}', list), '불편한 문제: ' + problem, schema), null); model = textModel_();
      if (out && out.candidates) out.candidates = out.candidates.slice(0, 3);
    } catch (e) { out = null; model = 'rule(fallback)'; }
  }
  if (!out || !out.candidates || !out.candidates.length) out = ruleConnect_(problem);
  log_(sid, p.class, p.seat, 'connect', 1, { problem: problem }, out, model, Date.now() - t0);
  return out;
}
function saveChoice(p) {
  sheet_('연결').appendRow([now_(), p.student_id, sanitize_(p.problem), JSON.stringify(p.candidates || []), sanitize_(p.chosen), sanitize_(p.reason)]);
  return { ok: true };
}

// ───────────── 4차시 발명하기 ─────────────
function inventionFeedback(p) {
  const desc = sanitize_(p.description);
  if (desc.length < 10) return { error: '발명품을 세 문장으로 조금 더 자세히 써 주세요.' };
  if (isBlocked_(desc)) return { error: '그 내용 말고, 생물의 비밀을 쓴 발명품을 써 볼까요?' };
  let out = null; const t0 = Date.now(); let model = 'rule';
  if (hasKey_()) {
    try {
      const schema = { type: 'OBJECT', properties: { praise: { type: 'STRING' }, check: { type: 'STRING' }, q: { type: 'STRING' } }, required: ['praise', 'check', 'q'] };
      out = parseJson_(gemini_(SYS_FEEDBACK, '발명품 이름: ' + sanitize_(p.name) + '\n흉내 낸 생물: ' + sanitize_(p.organism) + '\n설명문: ' + desc, schema), null); model = textModel_();
    } catch (e) { out = null; }
  }
  if (!out) {
    const hasOrg = p.organism && desc.indexOf(String(p.organism).split('(')[0]) >= 0;
    out = { praise: '발명품 이름이 멋져요!', check: hasOrg ? '어떤 생물을 흉내 냈는지 잘 썼어요.' : '어떤 생물의 비밀을 썼는지 한 문장 더 써 볼까요?', q: '이 발명품은 누가, 언제 쓰면 좋을까요?', mode: 'rule' };
  }
  log_(sid_(p), p.class, p.seat, 'feedback', 1, { description: desc }, out, model, Date.now() - t0);
  return out;
}
function sid_(p) { return p.student_id || (p.class + '-' + p.seat); }
function generateImage(p) {
  const sid = p.student_id;
  if (!hasKey_()) return { error: '지금은 그림 선생님이 없어서 내 스케치로 발표해요!', unavailable: true };
  if (!setting_('image_on')) return { error: '지금은 그림 그리기를 쉬고 있어요. 내 스케치를 더 다듬어 볼까요?' };
  const used = countRows_('로그', 1, sid, 4, 'image');
  if (used >= APP.IMAGE_CAP) return { error: '그림은 ' + APP.IMAGE_CAP + '번까지만 그릴 수 있어요. 그린 그림과 내 스케치를 비교해 봐요.', capped: true };
  const desc = sanitize_(p.description);
  if (desc.length < 10) return { error: '발명품을 세 문장으로 조금 더 자세히 써 주세요.' };
  if (isBlocked_(desc)) return { error: '그 내용은 그릴 수 없어요. 생물의 비밀을 쓴 발명품을 써 볼까요?' };
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + imageModel_() + ':generateContent?key=' + apiKey_();
  const body = { contents: [{ role: 'user', parts: [{ text: IMAGE_PROMPT_PREFIX + desc + (p.organism ? ' (imitating: ' + p.organism + ')' : '') }] }], generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } };
  const t0 = Date.now();
  const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
  if (res.getResponseCode() !== 200) { log_(sid, p.class, p.seat, 'image', used + 1, { description: desc }, { error: res.getContentText().slice(0, 200) }, imageModel_(), Date.now() - t0); return { error: '그림 선생님이 잠깐 자리를 비웠어요. 잠시 뒤 다시 눌러 봐요.' }; }
  const parts = (((JSON.parse(res.getContentText()).candidates || [])[0] || {}).content || {}).parts || [];
  let img = null; parts.forEach(function (pt) { if (pt.inlineData && !img) img = pt.inlineData; });
  if (!img) { log_(sid, p.class, p.seat, 'image', used + 1, { description: desc }, { error: 'no image' }, imageModel_(), Date.now() - t0); return { error: '그림이 나오지 않았어요. 설명을 조금 바꿔서 다시 해 볼까요?' }; }
  const ext = (img.mimeType || 'image/png').split('/')[1] || 'png';
  const file = imageFolder_().createFile(Utilities.newBlob(Utilities.base64Decode(img.data), img.mimeType, sid + '_' + (used + 1) + '.' + ext));
  log_(sid, p.class, p.seat, 'image', used + 1, { description: desc }, { file_id: file.getId() }, imageModel_(), Date.now() - t0);
  return { data_url: 'data:' + img.mimeType + ';base64,' + img.data, file_id: file.getId(), count: used + 1, cap: APP.IMAGE_CAP };
}
function imageFolder_() { const it = DriveApp.getFoldersByName('NatureMentor_images'); return it.hasNext() ? it.next() : DriveApp.createFolder('NatureMentor_images'); }
function getImageData(fileId) {
  if (!fileId) return '';
  try { const blob = DriveApp.getFileById(fileId).getBlob(); return 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()); } catch (e) { return ''; }
}
function saveInvention(p) {
  const id = 'INV-' + p.student_id + '-' + Date.now().toString(36);
  sheet_('발명').appendRow([now_(), id, p.student_id, p.class, sanitize_(p.organism), sanitize_(p.name), sanitize_(p.description), sanitize_(p.diff_note), p.file_id || '', p.image_count || 0]);
  return { ok: true, invention_id: id };
}

// ───────────── 5차시 지킴이 ─────────────
function saveProtect(p) {
  sheet_('지킴이').appendRow([now_(), p.student_id, p.class, sanitize_(p.species), sanitize_(p.lost_invention), sanitize_(p.promise), sanitize_(p.letter)]);
  return { ok: true };
}

// ───────────── 6차시 박람회 ─────────────
function getGallery(classNo) {
  classNo = parseInt(classNo, 10);
  const rows = sheet_('발명').getDataRange().getValues(); const latest = {};
  for (var i = 1; i < rows.length; i++) if (parseInt(rows[i][3], 10) === classNo) latest[rows[i][2]] = rows[i];
  const reacts = sheet_('반응').getDataRange().getValues(); const count = {};
  for (var j = 1; j < reacts.length; j++) { const key = reacts[j][2] + '|' + reacts[j][3]; count[key] = (count[key] || 0) + 1; }
  return Object.keys(latest).map(function (sid) {
    const r = latest[sid];
    return { invention_id: r[1], student_id: sid, seat: sid.split('-')[1], organism: r[4], name: r[5], description: r[6], file_id: r[8], likes: count[r[1] + '|like'] || 0, curious: count[r[1] + '|curious'] || 0 };
  }).sort(function (a, b) { return parseInt(a.seat, 10) - parseInt(b.seat, 10); });
}
function react(p) {
  const rows = sheet_('반응').getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) if (rows[i][1] === p.student_id && rows[i][2] === p.invention_id && rows[i][3] === p.type) return { ok: false, msg: '이미 눌렀어요!' };
  sheet_('반응').appendRow([now_(), p.student_id, p.invention_id, p.type === 'like' ? 'like' : 'curious']);
  return { ok: true };
}
function saveReflect(p) {
  sheet_('소감').appendRow([now_(), p.student_id, p.class, sanitize_(p.s_organism), sanitize_(p.s_secret), sanitize_(p.s_use), sanitize_(p.reflection), sanitize_(p.nature_is)]);
  return { ok: true };
}

// ───────────── 선생님 메뉴 ─────────────
function teacher_(p) {
  const pin_ = props_().getProperty('TEACHER_PIN');
  if (!pin_ || String(p.pin) !== String(pin_)) return { error: '비밀번호가 달라요.' };
  const op = p.op || 'summary';
  if (op === 'toggle') { setSetting_(p.key, p.value ? 'TRUE' : 'FALSE'); return { ok: true }; }
  if (op === 'phase') { setSetting_('survey_phase', p.value === 'post' ? 'post' : 'pre'); return { ok: true, phase: p.value }; }
  if (op === 'export') { exportAll(); return { ok: true, url: ss_().getUrl() }; }
  // summary
  const students = sheet_('학생').getDataRange().getValues().length - 1;
  const surveys = sheet_('설문').getDataRange().getValues(); let pre = 0, post = 0;
  for (var i = 1; i < surveys.length; i++) { if (surveys[i][4] === 'pre') pre++; else post++; }
  const logs = sheet_('로그').getDataRange().getValues(); const stage = {};
  for (var j = 1; j < logs.length; j++) stage[logs[j][4]] = (stage[logs[j][4]] || 0) + 1;
  return {
    ok: true, students: students, pre: pre, post: post, quiz: sheet_('퀴즈').getLastRow() - 1, secrets: sheet_('비밀').getLastRow() - 1, connects: sheet_('연결').getLastRow() - 1,
    inventions: sheet_('발명').getLastRow() - 1, protects: sheet_('지킴이').getLastRow() - 1, reflects: sheet_('소감').getLastRow() - 1,
    stage: stage, mentor_on: setting_('mentor_on'), image_on: setting_('image_on'), survey_phase: settingValue_('survey_phase', 'pre'),
    mentor_mode: hasKey_() ? 'gemini' : 'rule', sheet_url: ss_().getUrl(),
  };
}

/** 연구용 내보내기: SPSS_사전·SPSS_사후(wide), 로그요약 */
function exportAll() {
  const sv = sheet_('설문').getDataRange().getValues();
  const head = sv[0];
  ['pre', 'post'].forEach(function (phase) {
    const out = [head.slice(1)];
    for (var i = 1; i < sv.length; i++) if (sv[i][4] === phase) out.push(sv[i].slice(1));
    const dst = ss_().getSheetByName('SPSS_' + (phase === 'pre' ? '사전' : '사후')) || ss_().insertSheet('SPSS_' + (phase === 'pre' ? '사전' : '사후'));
    dst.clear(); dst.getRange(1, 1, out.length, out[0].length).setValues(out); dst.setFrozenRows(1);
  });
  const logs = sheet_('로그').getDataRange().getValues(); const secrets = sheet_('비밀').getDataRange().getValues(); const per = {};
  for (var i = 1; i < logs.length; i++) {
    const sid = logs[i][1]; per[sid] = per[sid] || { rounds: 0, connect: 0, images: 0, feedback: 0, rule: 0, search: 0, cls: logs[i][2] };
    if (logs[i][4] === 'observe') per[sid].rounds++;
    if (logs[i][4] === 'connect') per[sid].connect++;
    if (logs[i][4] === 'image') per[sid].images++;
    if (logs[i][4] === 'feedback') per[sid].feedback++;
    if (logs[i][4] === 'search') per[sid].search++;
    if (String(logs[i][8]).indexOf('rule') === 0) per[sid].rule++;
  }
  for (var j = 1; j < secrets.length; j++) { const sid = secrets[j][1]; per[sid] = per[sid] || { rounds: 0, connect: 0, images: 0, feedback: 0, rule: 0, search: 0, cls: '' }; per[sid].versions = Math.max(per[sid].versions || 0, secrets[j][7]); per[sid].record_len = (String(secrets[j][3]) + String(secrets[j][4]) + String(secrets[j][5])).length; }
  const out = [['student_id', 'class', 'question_rounds', 'revisions', 'connect_requests', 'feedback_requests', 'image_generations', 'rule_mode_responses', 'search_clicks', 'record_length']];
  Object.keys(per).forEach(function (sid) { const v = per[sid]; out.push([sid, v.cls, v.rounds, Math.max((v.versions || 1) - 1, 0), v.connect, v.feedback, v.images, v.rule, v.search || 0, v.record_len || 0]); });
  const sh = ss_().getSheetByName('로그요약') || ss_().insertSheet('로그요약');
  sh.clear(); sh.getRange(1, 1, out.length, out[0].length).setValues(out);
  Logger.log('내보내기 완료: ' + ss_().getUrl());
}
