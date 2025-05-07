@echo off
echo Starting Vibe MCP Server...

REM Add FFmpeg to PATH
SET PATH=%PATH%;q:\artifactvirtual\.worxpace-manager\vibe-mcp\ffmpeg\bin

REM Load .env file variables if they exist
if exist "q:\artifactvirtual\.worxpace-manager\vibe-mcp\.env" (
    echo Loading environment variables from .env
    for /F "tokens=*" %%A in ('type "q:\artifactvirtual\.worxpace-manager\vibe-mcp\.env"') do (
        set %%A
    )
)

REM Print API key status
echo STABLE_AUDIO_KEY: %STABLE_AUDIO_KEY:~0,5%***
echo PIAPI_KEY: %PIAPI_KEY:~0,5%***

REM Start the MCP server
node "q:\artifactvirtual\.worxpace-manager\vibe-mcp\build\index.js"