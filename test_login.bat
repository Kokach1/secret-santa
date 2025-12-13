@echo off
curl -v -X POST http://localhost:5000/auth/login ^
-H "Content-Type: application/json" ^
-d "{\"email\": \"kokachi\", \"password\": \"kokachi@admin\"}"
pause
