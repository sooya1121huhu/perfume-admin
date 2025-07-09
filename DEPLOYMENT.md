# 배포 가이드

이 프로젝트는 GitHub Actions를 사용하여 자동 배포가 설정되어 있습니다.

## 배포 옵션

### 1. Vercel 배포 (권장)

Vercel은 React 앱에 최적화된 무료 호스팅 서비스입니다.

#### 설정 단계:

1. **Vercel 계정 생성**
   - [vercel.com](https://vercel.com)에서 계정을 만드세요

2. **GitHub 저장소 연결**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소를 선택하고 연결

3. **환경 변수 설정**
   GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 추가:
   - `VERCEL_TOKEN`: Vercel API 토큰
   - `ORG_ID`: Vercel 조직 ID
   - `PROJECT_ID`: Vercel 프로젝트 ID

4. **토큰 생성 방법**
   ```bash
   # Vercel CLI 설치
   npm i -g vercel
   
   # 로그인
   vercel login
   
   # 프로젝트 연결
   vercel link
   ```

### 2. GitHub Pages 배포

GitHub Pages는 무료 정적 사이트 호스팅 서비스입니다.

#### 설정 단계:

1. **package.json 수정**
   ```json
   {
     "homepage": "https://[your-username].github.io/[your-repo-name]"
   }
   ```

2. **GitHub 저장소 설정**
   - 저장소 Settings > Pages
   - Source를 "GitHub Actions"로 설정

3. **배포 활성화**
   - main 또는 master 브랜치에 푸시하면 자동으로 배포됩니다

## 워크플로우 파일

- `.github/workflows/deploy.yml`: Vercel 배포용
- `.github/workflows/deploy-github-pages.yml`: GitHub Pages 배포용

## 배포 트리거

- main/master 브랜치에 푸시할 때 자동 배포
- Pull Request 생성 시 테스트 실행

## 환경 변수

프로덕션 환경에서 필요한 환경 변수는 Vercel 대시보드에서 설정하세요.

## 문제 해결

### 빌드 실패
- Node.js 버전 확인 (18.x 사용)
- 의존성 설치 확인
- 테스트 통과 확인

### 배포 실패
- 시크릿 변수 설정 확인
- Vercel 프로젝트 연결 확인
- 권한 설정 확인 