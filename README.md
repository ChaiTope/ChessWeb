# ChessWeb

ChessWeb is a learning project for experimenting with a browser-based chess board, legal move handling, and Stockfish analysis in a React frontend.

This project is not a complete online chess service. The current implementation focuses on:

- rendering a chess board in React
- validating moves with `chess.js`
- showing move history and basic game status
- running Stockfish in the frontend through a Web Worker
- displaying simple engine suggestions and an evaluation graph

The backend FastAPI code is kept as an experimental Stockfish `bestmove` API prototype. It is not currently connected to the frontend.

## Main Features

- Chess board UI using `react-chessboard`
- Initial piece placement from `chess.js`
- Drag-and-drop piece movement
- Legal move validation through `chess.js`
- Move history display in SAN notation
- Check and checkmate status messages
- Frontend Stockfish Web Worker integration
- Engine suggestion display with MultiPV-style output
- Depth and target Elo controls for engine analysis
- Evaluation graph rendered with Recharts
- Experimental FastAPI backend endpoint for Stockfish best move lookup

## Tech Stack

### Frontend

- React
- JavaScript
- chess.js
- react-chessboard
- Stockfish.js / Stockfish Web Worker
- Recharts

### Backend Experimental

- Python
- FastAPI
- python-chess
- Local Stockfish UCI engine executable

## Project Structure

```text
ChessWeb/
├─ backend/
│  ├─ main.py              # Experimental FastAPI bestmove API
│  └─ requirements.txt     # Backend dependencies
├─ frontend/
│  ├─ public/
│  │  ├─ index.html
│  │  └─ stockfish.js      # Stockfish worker file used by the frontend
│  ├─ src/
│  │  ├─ App.js            # Main game state, move handling, engine setup
│  │  ├─ AnalysisPanel.js  # Stockfish output parsing and evaluation graph
│  │  ├─ Board.js          # Chessboard rendering
│  │  ├─ History.js        # Move history display
│  │  ├─ StatusMessage.js  # Game status display
│  │  └─ index.js
│  ├─ package.json
│  └─ package-lock.json
└─ README.md
```

## Running the Project

### Frontend

Install dependencies and start the React development server:

```bash
cd frontend
npm install
npm start
```

The frontend development server runs at:

```text
http://localhost:3000
```

On Windows PowerShell, if script execution policy blocks `npm`, use `npm.cmd`:

```bash
npm.cmd install
npm.cmd start
```

### Backend Experimental

The backend is an experimental FastAPI server for requesting a Stockfish best move from a FEN string. It is not currently used by the React frontend.

Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn main:app --reload
```

Current backend code expects a local Windows Stockfish executable at:

```text
C:\Program Files\stockfish\stockfish-windows-x86-64-avx2
```

If Stockfish is installed elsewhere, update the path in `backend/main.py` before running the backend.

## Implemented Behavior

- The board starts from the standard chess initial position.
- Pieces can be moved by drag and drop.
- Move legality, turn order, check, checkmate, castling, en passant, and promotion legality are delegated to `chess.js`.
- Promotion currently uses automatic queen promotion.
- Successful moves update the FEN state and append SAN notation to the move history.
- The frontend creates a Stockfish Web Worker from `frontend/public/stockfish.js`.
- The analysis panel requests engine analysis for the current FEN and selected depth.
- The analysis panel displays up to three suggested moves and a simple evaluation graph.

## Known Issues

- Online and multiplayer features are not implemented.
- Promotion currently always promotes to a queen; there is no promotion piece selection UI.
- Stalemate and draw messages are incomplete or missing.
- Stockfish analysis results may mix with output from a previous search because searches are not explicitly stopped or correlated.
- The backend Stockfish API is experimental and is not connected to the frontend.
- Running the backend requires configuring the local Stockfish executable path.
- There are no test files yet.

## Planned Improvements

- Add clearer draw, stalemate, and game-over status messages.
- Add a promotion selection UI.
- Prevent stale Stockfish analysis output from updating the current position.
- Decide whether to connect, refactor, or remove the experimental backend API.
- Move backend Stockfish path configuration to an environment variable or config file.
- Add focused tests for move handling and analysis output parsing.
- Improve README and setup notes as the project structure becomes more stable.
