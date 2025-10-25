@echo off
chcp 65001 >nul
color 0A

echo.
echo ╔════════════════════════════════════════════╗
echo ║   PANDORA - SCRIPT DE PUBLICAÇÃO           ║
echo ╔════════════════════════════════════════════╗
echo.

REM Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não está instalado!
    echo.
    echo 📥 Instale em: https://git-scm.com/download/win
    pause
    exit /b
)

echo ✅ Git instalado
echo.

REM Menu principal
:MENU
echo ╔════════════════════════════════════════════╗
echo ║  ESCOLHA UMA OPÇÃO:                        ║
echo ╠════════════════════════════════════════════╣
echo ║  1 - 🚀 Primeira publicação (setup inicial)║
echo ║  2 - 📤 Commit e Push (atualizar código)   ║
echo ║  3 - 🔄 Publicar nova versão               ║
echo ║  4 - 🏗️  Build (.exe)                       ║
echo ║  5 - ℹ️  Status do Git                      ║
echo ║  6 - ❌ Sair                                ║
echo ╚════════════════════════════════════════════╝
echo.

set /p choice="Digite sua escolha (1-6): "

if "%choice%"=="1" goto FIRST_PUBLISH
if "%choice%"=="2" goto COMMIT_PUSH
if "%choice%"=="3" goto NEW_VERSION
if "%choice%"=="4" goto BUILD
if "%choice%"=="5" goto STATUS
if "%choice%"=="6" goto END
goto MENU

REM ============================================
REM Primeira Publicação
REM ============================================
:FIRST_PUBLISH
cls
echo.
echo 🚀 PRIMEIRA PUBLICAÇÃO
echo ═══════════════════════════════════════
echo.

REM Verificar se já tem repositório
if exist .git (
    echo ⚠️  Repositório Git já existe!
    echo.
    set /p continue="Deseja continuar mesmo assim? (s/n): "
    if /i not "%continue%"=="s" goto MENU
)

echo 1️⃣  Inicializando Git...
git init
git branch -M main
echo ✅ Git inicializado

echo.
echo 2️⃣  Adicionando arquivos...
git add .
echo ✅ Arquivos adicionados

echo.
set /p commit_msg="Digite a mensagem do commit: "
git commit -m "%commit_msg%"
echo ✅ Commit realizado

echo.
echo 3️⃣  Conectando ao GitHub...
git remote add origin https://github.com/Fish7w7/Pandora.git
echo ✅ Repositório conectado

echo.
echo 4️⃣  Enviando para GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Erro ao fazer push!
    echo.
    echo 💡 Soluções:
    echo    1. Configure Git: gh auth login
    echo    2. Ou use token: git remote set-url origin https://TOKEN@github.com/Fish7w7/Pandora.git
    echo.
    pause
    goto MENU
)

echo.
echo ✅ PUBLICAÇÃO CONCLUÍDA!
echo.
echo 📝 PRÓXIMOS PASSOS:
echo    1. Acesse: https://github.com/Fish7w7/Pandora
echo    2. Verifique se version.json está lá
echo    3. Faça o build: npm run build:win
echo    4. Crie a primeira Release com o .exe
echo.
pause
goto MENU

REM ============================================
REM Commit e Push
REM ============================================
:COMMIT_PUSH
cls
echo.
echo 📤 COMMIT E PUSH
echo ═══════════════════════════════════════
echo.

git status

echo.
set /p commit_msg="Digite a mensagem do commit: "

echo.
echo Adicionando arquivos...
git add .

echo Fazendo commit...
git commit -m "%commit_msg%"

echo Enviando para GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ Erro ao fazer push!
    pause
    goto MENU
)

echo.
echo ✅ Código atualizado no GitHub!
echo.
pause
goto MENU

REM ============================================
REM Nova Versão
REM ============================================
:NEW_VERSION
cls
echo.
echo 🔄 PUBLICAR NOVA VERSÃO
echo ═══════════════════════════════════════
echo.

echo Qual tipo de atualização?
echo.
echo 1 - Patch  (2.0.0 → 2.0.1) - Correções
echo 2 - Minor  (2.0.0 → 2.1.0) - Novas funcionalidades
echo 3 - Major  (2.0.0 → 3.0.0) - Mudanças grandes
echo.

set /p version_type="Escolha (1-3): "

if "%version_type%"=="1" (
    npm version patch
) else if "%version_type%"=="2" (
    npm version minor
) else if "%version_type%"=="3" (
    npm version major
) else (
    echo ❌ Opção inválida!
    pause
    goto MENU
)

echo.
echo ✅ Versão atualizada!
echo.
echo 📝 Não esqueça de:
echo    1. Atualizar version.json manualmente
echo    2. Fazer build: npm run build:win
echo    3. Criar Release no GitHub
echo    4. Anexar o .exe
echo.
pause
goto MENU

REM ============================================
REM Build
REM ============================================
:BUILD
cls
echo.
echo 🏗️  BUILD DO PROJETO
echo ═══════════════════════════════════════
echo.

echo Executando build para Windows...
echo.
call npm run build:win

if errorlevel 1 (
    echo.
    echo ❌ Erro no build!
    pause
    goto MENU
)

echo.
echo ✅ Build concluído!
echo 📦 Arquivo .exe está em: dist/
echo.
pause
goto MENU

REM ============================================
REM Status
REM ============================================
:STATUS
cls
echo.
echo ℹ️  STATUS DO GIT
echo ═══════════════════════════════════════
echo.

echo 📊 Repositório remoto:
git remote -v
echo.

echo 📝 Últimos 5 commits:
git log --oneline -5
echo.

echo 📁 Arquivos modificados:
git status
echo.

pause
goto MENU

REM ============================================
REM Sair
REM ============================================
:END
cls
echo.
echo 👋 Até logo!
echo.
timeout /t 2 >nul
exit