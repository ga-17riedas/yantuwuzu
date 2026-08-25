@echo off
chcp 65001 >nul
cd /d "%~dp0server"
if not exist "node_modules" (
  echo 正在安装依赖，请稍候...
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败，请先安装 Node.js 18 或以上。
    pause
    exit /b 1
  )
)
echo 正在启动后端 http://127.0.0.1:3000
call npm start
pause
