🏗️ 프로젝트 파일 구조 도식화

manufacturing_process/
├── 📋 README.md
│   # 프로젝트 전체 사용법 및 설치 가이드
├── 📋 file_structure.md
│   # 파일 구조 설명서
├── 📋 kpi_calculation_method.md
│   # KPI 계산 방식 문서
│
├── 🌐 dashboard_backend/                          # Spring Boot API 서버 (포트: 8080)
│   ├── 📝 build.gradle                            # Gradle 빌드 설정 및 의존성
│   ├── 📝 settings.gradle                         # Gradle 프로젝트 설정
│   ├── 🔧 gradlew, gradlew.bat                    # Gradle Wrapper 실행 스크립트
│   └── src/
│       └── main/
│           ├── java/com/u1mobis/dashboard_backend/
│           │   ├── 🚀 DashboardBackendApplication.java      # Spring Boot 메인 클래스
│           │   ├── config/
│           │   │   ├── 🔐 SecurityConfig.java              # Spring Security 설정
│           │   │   └── 🌐 WebConfig.java                   # CORS 및 웹 설정
│           │   ├── controller/
│           │   │   ├── 📡 IoTDataController.java           # IoT 데이터 REST API 엔드포인트
│           │   │   └── 👤 UserController.java              # 사용자 관리 API
│           │   ├── dto/
│           │   │   ├── 📊 DashboardDto.java                # 대시보드 데이터 전송 객체
│           │   │   ├── 🏭 IoTDataDto.java                  # IoT 데이터 전송 객체
│           │   │   ├── 📈 StationStatusDto.java            # 스테이션 상태 데이터 객체
│           │   │   └── 👤 UserDTO.java                     # 사용자 데이터 객체
│           │   ├── entity/
│           │   │   ├── 📊 IoTData.java                     # IoT 데이터 JPA 엔티티
│           │   │   ├── 🏭 StationStatus.java               # 스테이션 상태 엔티티
│           │   │   └── 👤 User.java                        # 사용자 엔티티
│           │   ├── repository/
│           │   │   ├── 📊 IoTDataRepository.java           # IoT 데이터 DB 액세스
│           │   │   ├── 🏭 StationStatusRepository.java     # 스테이션 상태 DB 액세스
│           │   │   └── 👤 UserRepository.java              # 사용자 DB 액세스
│           │   └── service/
│           │       ├── 📊 IoTDataService.java              # IoT 데이터 비즈니스 로직
│           │       └── 👤 UserService.java                 # 사용자 관리 비즈니스 로직
│           └── resources/
│               ├── ⚙️ application.properties               # Spring Boot 애플리케이션 설정
│               └── 📊 data.sql                             # 초기 데이터베이스 데이터
│
├── 🖥️ dashboard_frontend/                         # React 대시보드 (포트: 5173)
│   ├── 📦 package.json, package-lock.json          # Node.js 의존성 관리
│   ├── ⚙️ vite.config.js                          # Vite 빌드 도구 설정
│   ├── 📄 index.html                              # HTML 템플릿
│   └── src/
│       ├── 🎯 main.jsx                            # React 애플리케이션 진입점
│       ├── 📱 App.jsx                             # 메인 애플리케이션 컴포넌트
│       ├── components/
│       │   ├── 📊 Dashboard.jsx                   # 메인 대시보드 화면
│       │   ├── 🏭 Factory2D.jsx                   # 2D 팩토리 뷰
│       │   ├── 🔄 Factory2DTwin.jsx               # 디지털 트윈 메인 화면
│       │   ├── 📦 Inventory.jsx                   # 재고 관리 화면
│       │   ├── 🏗️ Layout.jsx                      # 공통 레이아웃 컴포넌트
│       │   ├── KPI/                               # 📈 KPI 관련 컴포넌트
│       │   │   ├── ⏱️ CycleTime.jsx               # 사이클 타임 표시
│       │   │   ├── ✅ FTYStatus.jsx               # 일회통과율(FTY) 표시
│       │   │   ├── 📊 HourlyProduction.jsx        # 시간당 생산량 표시
│       │   │   ├── 🎯 OTDStatus.jsx               # 정시납기율(OTD) 표시
│       │   │   ├── ⚡ PowerEfficiency.jsx         # 전력 효율성 표시
│       │   │   ├── 📊 ProductionStatus.jsx        # 생산 상태 표시
│       │   │   └── 🎯 ProductionTarget.jsx        # 생산 목표 표시
│       │   ├── Robot/                             # 🤖 로봇/스테이션 관련 컴포넌트
│       │   │   ├── 🤖 RobotStatus.jsx             # 로봇 상태 표시
│       │   │   └── 📋 RobotTables.jsx             # 스테이션 모니터링 테이블
│       │   ├── Twin/                              # 🔄 디지털 트윈 관련 컴포넌트
│       │   │   ├── 🖱️ ClickRobot.jsx              # 로봇 클릭 인터랙션
│       │   │   ├── 🏭 Factory2DTwin.jsx           # 2D 트윈 뷰
│       │   │   └── 🧭 Navabr.jsx                  # 트윈 네비게이션 바
│       │   └── Inventory/
│       │       └── 📦 InventoryTables.jsx         # 재고 테이블 컴포넌트
│       └── service/
│           ├── 🌐 api.js                          # 기본 API 클라이언트
│           ├── 📊 dashboardSevice.js              # 대시보드 데이터 서비스
│           ├── 📦 inventoryService.js             # 재고 관리 서비스
│           ├── 🏭 productionService.js            # 생산 데이터 서비스
│           ├── 🤖 robotService.js                 # 로봇 데이터 서비스
│           └── 🔌 websocket.js                    # WebSocket 통신 서비스
│
├── 🔄 data_collector/                             # Python 데이터 수집기
│   ├── 📋 requirements.txt                        # Python 의존성 (paho-mqtt, requests 등)
│   ├── ⚙️ config.yaml                             # MQTT 및 API 설정
│   ├── 🚀 main.py                                 # 데이터 수집기 메인 실행 파일
│   ├── logs/
│   │   └── data_collector.log                     # 📝 로그 파일
│   ├── src/
│   │   ├── 📡 mqtt_client.py                      # MQTT 브로커 연결 및 메시지 수신
│   │   ├── 🌐 api_client.py                       # Spring Boot API 클라이언트
│   │   ├── ⚙️ data_processor.py                   # MQTT 데이터 처리 및 변환
│   │   └── models/
│   │       ├── 📊 sensor_data.py                  # 센서 데이터 모델
│   │       └── __init__.py
│   └── tests/
│       └── ...                                   # 테스트 코드
│
└── 🏭 mosquitto_MQTT/                            # MQTT 시뮬레이터 (레거시)
    ├── 📋 requirements.txt                        # Python 의존성
    ├── ⚙️ config.json                            # 시뮬레이터 설정
    ├── 🚀 assembly_simulator.py                  # 조립 공정 시뮬레이터 메인
    ├── logs/                                     # 📝 시뮬레이터 로그들
    ├── assembly/                                 # 🏭 제조 공정별 시뮬레이터 모듈
    │   ├── 🤖 robot.py                           # 로봇 데이터 생성
    │   ├── 🔄 conveyor.py                        # 컨베이어 데이터 생성
    │   ├── ✅ quality_check.py                   # 품질 검사 데이터 생성
    │   ├── 📦 inventory.py                       # 재고 데이터 생성
    │   └── 📊 kpi.py                             # KPI 계산 로직
    └── utils/                                    # 🛠️ 유틸리티 모듈
        ├── 📡 mqtt_publisher.py                  # MQTT 메시지 발송
        └── 🎲 data_generator.py                  # 랜덤 데이터 생성 유틸