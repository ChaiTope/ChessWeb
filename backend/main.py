import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
from chess.engine import SimpleEngine, Limit

# Windows에서 subprocess 지원을 위한 이벤트 루프 정책 설정
asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

# FastAPI 앱 생성
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stockfish 엔진 초기화 (Windows 실행 파일 경로)
engine = SimpleEngine.popen_uci(r"C:\Program Files\stockfish\stockfish-windows-x86-64-avx2")

# 요청 모델
class FENIn(BaseModel):
    fen: str

# 루트 엔드포인트
@app.get("/")
async def root():
    return {"message": "Hello from FastAPI!"}

# 엔진 추천 수 반환 엔드포인트
@app.post("/bestmove")
async def bestmove(body: FENIn):
    board = chess.Board(body.fen)
    result = engine.play(board, Limit(time=0.1))  # 100ms 생각
    return {"move": result.move.uci()}
