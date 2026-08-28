@echo off
chcp 65001 > nul
echo ====================================
echo  入院馬管理アプリ 起動中...
echo ====================================
echo.

:: Node.js のパスを確認して追加
SET NODE_PATH=C:\Program Files\nodejs
SET PATH=%NODE_PATH%;%PATH%

:: 依存パッケージ確認
if not exist "node_modules" (
    echo [準備中] パッケージをインストールしています...
    "%NODE_PATH%\npm.cmd" install
    echo.
)

echo [起動] アプリを起動しています...
echo ブラウザで http://localhost:3001 を開いてください
echo.
echo ※ このウィンドウを閉じるとアプリが停止します
echo.
"%NODE_PATH%\npm.cmd" run dev
pause
