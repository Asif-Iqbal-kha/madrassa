@echo off
echo ========================================================
echo   Starting Local MongoDB Server...
echo ========================================================
if not exist "data\db" mkdir "data\db"
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "data\db" --port 27017
pause
