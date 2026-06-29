# ChessWeb

ChessWeb is a learning project for experimenting with a browser-based chess board, legal move handling, and Stockfish analysis in a React frontend.

This project is not a complete online chess service. The current implementation focuses on:

- rendering a chess board in React
- validating moves with `chess.js`
- showing move history and basic game status
- running Stockfish in the frontend through a Web Worker
- displaying engine suggestions, a best-move arrow, and a compact evaluation bar

The backend FastAPI code is kept as an experimental Stockfish `bestmove` API prototype. It is not currently connected to the frontend.

## Main Features

- Chess board UI using `react-chessboard`
- Initial piece placement from `chess.js`
- Drag-and-drop piece movement
- Click-based legal move highlights
- Capture-square highlighting
- Undo move support
- Board flip support
- Legal move validation through `chess.js`
- Move history display in SAN notation
- Check, checkmate, stalemate, and draw status messages
- Frontend Stockfish Web Worker integration
- Engine suggestion display with MultiPV-style output
- Best move arrow overlay on the board
- Evaluation bar showing white/black advantage
- Depth and target Elo controls for engine analysis
- Responsive analysis-board layout
- Experimental FastAPI backend endpoint for Stockfish best move lookup

## Tech Stack

### Frontend

- React
- JavaScript
- chess.js
- react-chessboard
- Stockfish.js / Stockfish Web Worker

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
│  │  ├─ AnalysisPanel.js  # Stockfish output parsing, suggestions, evaluation bar
│  │  ├─ App.css           # Frontend layout and board/analysis styling
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
- Clicking a current-turn piece selects it and shows legal destination squares.
- Legal non-capture moves are shown with dot highlights, while capture moves use a stronger capture highlight.
- Selecting another valid current-turn piece updates the highlighted legal moves.
- Clicking an invalid square clears the current selection and highlights.
- Move legality, turn order, check, checkmate, stalemate, draw, castling, en passant, and promotion legality are delegated to `chess.js`.
- Promotion currently uses automatic queen promotion.
- Successful moves update the FEN state, clear highlights, and append SAN notation to the move history.
- Undo uses `chess.js` undo state so the visible board, FEN, turn, move history, and engine position stay synchronized.
- Game status messages are shown for check, checkmate, stalemate, draw, and other game-over states.
- The frontend creates a Stockfish Web Worker from `frontend/public/stockfish.js`.
- The analysis panel requests engine analysis for the current FEN and selected depth.
- The analysis panel displays up to three suggested moves, the current best move, depth, turn, and evaluation.
- The best move is shown on the board with an arrow overlay.
- The evaluation bar maps centipawn scores to a clamped white/black advantage display.
- The board can be flipped, and highlights plus engine arrows follow the current board orientation.

## Known Issues

- Online and multiplayer features are not implemented.
- Promotion currently always promotes to a queen; there is no promotion piece selection UI.
- Mate score display is basic and may need more detailed handling for polished analysis output.
- The backend Stockfish API is experimental and is not connected to the frontend.
- Running the backend requires configuring the local Stockfish executable path.
- There are no test files yet.

## Planned Improvements

- Add a promotion selection UI.
- Refine mate score handling and display.
- Remove unused dependencies if the evaluation graph remains replaced by the evaluation bar.
- Decide whether to connect, refactor, or remove the experimental backend API.
- Move backend Stockfish path configuration to an environment variable or config file.
- Add focused tests for move handling, undo behavior, highlighting, and analysis output parsing.
- Improve README and setup notes as the project structure becomes more stable.
