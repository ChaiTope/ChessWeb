# ChessWeb

온라인 체스 플레이와 Stockfish 기반 분석을 실험해본 웹 프로젝트입니다.

React로 체스보드 UI를 구성하고, `chess.js`로 기본적인 체스 규칙과 수 기록을 처리합니다. 프론트엔드에서는 Stockfish Web Worker를 사용해 후보 수와 평가 그래프를 표시하고, 백엔드에는 FastAPI 기반의 간단한 `bestmove` API 실험 코드가 포함되어 있습니다.

## Features

* 체스보드에서 말 이동
* `chess.js` 기반 합법 수 처리
* 수 기록 표시
* Stockfish 기반 추천 수 확인
* Depth / target Elo 설정
* Recharts 기반 평가 그래프 표시
* FastAPI를 이용한 Stockfish best move API 실험

## Tech Stack

### Frontend

* React
* JavaScript
* chess.js
* react-chessboard
* Stockfish.js
* Recharts

### Backend

* Python
* FastAPI
* python-chess
* Stockfish UCI engine

## Project Structure

```text
ChessWeb/
├─ backend/
│  └─ main.py              # FastAPI bestmove API experiment
└─ frontend/
   ├─ public/
   │  └─ stockfish.js      # Stockfish worker file
   └─ src/
      ├─ App.js
      ├─ Board.js
      ├─ AnalysisPanel.js
      ├─ History.js
      └─ StatusMessage.js
```

## Run Frontend

```bash
cd frontend
npm install
npm start
```

The React development server runs at:

```text
http://localhost:3000
```

## Run Backend

The backend is an experimental FastAPI server for requesting a Stockfish best move from a FEN string.

```bash
cd backend
uvicorn main:app --reload
```

Current backend code expects a local Windows Stockfish executable path:

```text
C:\Program Files\stockfish\stockfish-windows-x86-64-avx2
```

If Stockfish is installed elsewhere, update the path in `backend/main.py`.

## Notes

This repository is a learning project for connecting a chess UI, move validation, engine analysis, and a simple API. It is not a completed production chess service.
