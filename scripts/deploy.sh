#!/bin/bash

# 배포 스크립트
echo "🚀 배포를 시작합니다..."

# 의존성 설치
echo "📦 의존성을 설치합니다..."
npm ci

# 테스트 실행
echo "🧪 테스트를 실행합니다..."
npm test -- --watchAll=false

# 빌드
echo "🔨 프로젝트를 빌드합니다..."
npm run build

# Vercel 배포 (선택사항)
if command -v vercel &> /dev/null; then
    echo "🌐 Vercel에 배포합니다..."
    vercel --prod
else
    echo "⚠️  Vercel CLI가 설치되지 않았습니다."
    echo "   npm i -g vercel 명령어로 설치하세요."
fi

echo "✅ 배포가 완료되었습니다!" 