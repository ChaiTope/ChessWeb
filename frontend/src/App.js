// src/App.js
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import StatusMessage from './StatusMessage';
import History from './History';
import AnalysisPanel from './AnalysisPanel';

const BOARD_MAX_WIDTH = 440;
const ELO_OPTIONS = [1320, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3190];

function getGameStatus(game) {
  if (game.isCheckmate()) return '🛑 체크메이트! 게임 종료';
  if (game.isStalemate()) return '스테일메이트! 무승부';
  if (game.isDraw()) return '무승부';
  if (game.isGameOver()) return '게임 종료';
  if (game.isCheck()) return '🔔 체크!';
  return '';
}

function getTurnLabel(game) {
  return game.turn() === 'w' ? 'White to move' : 'Black to move';
}

function getResponsiveBoardWidth() {
  if (typeof window === 'undefined') return BOARD_MAX_WIDTH;
  return Math.max(300, Math.min(BOARD_MAX_WIDTH, window.innerWidth - 32));
}

export default function App() {
  const game = useRef(new Chess());
  const [fen, setFen]         = useState(game.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus]   = useState('');
  const [engine, setEngine]   = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [bestMove, setBestMove] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [boardWidth, setBoardWidth] = useState(getResponsiveBoardWidth);

  // === 사용자 설정: 탐색 깊이 및 타깃 Elo ===
  const [depth, setDepth] = useState(15);
  const [elo, setElo] = useState(2000);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const selectSquare = useCallback((square) => {
    const piece = game.current.get(square);
    if (!piece || piece.color !== game.current.turn()) {
      clearSelection();
      return;
    }

    const moves = game.current.moves({ square, verbose: true }).map(move => ({
      from: move.from,
      to: move.to,
      isCapture: Boolean(move.captured) || move.flags.includes('c') || move.flags.includes('e'),
    }));

    setSelectedSquare(square);
    setLegalMoves(moves);
  }, [clearSelection]);

  const syncGameState = useCallback(() => {
    setFen(game.current.fen());
    setHistory(game.current.history());
    setStatus(getGameStatus(game.current));
    setBestMove(null);
  }, []);

  const makeMove = useCallback((sourceSquare, targetSquare) => {
    if (sourceSquare === targetSquare) {
      setStatus('⚠️ 같은 칸으로는 이동할 수 없습니다.');
      clearSelection();
      return false;
    }

    let move;
    try {
      move = game.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    } catch {
      setStatus('⚠️ 유효하지 않은 수입니다.');
      return false;
    }

    if (!move) {
      setStatus('⚠️ 유효하지 않은 수입니다.');
      return false;
    }

    clearSelection();
    syncGameState();
    return true;
  }, [clearSelection, syncGameState]);

  // ==== 엔진 초기화 =======================================
  useEffect(() => {
    const workerPath = process.env.PUBLIC_URL + '/stockfish.js';
    fetch(workerPath)
      .then(res => {
        if (!res.ok) throw new Error(`Worker 파일을 찾을 수 없습니다: ${workerPath}`);
      })
      .catch(err => console.error(err));

    const eng = new Worker(workerPath);
    eng.postMessage('uci');
    eng.postMessage('setoption name UCI_LimitStrength value true');
    eng.postMessage('setoption name MultiPV value 3');
    setEngine(eng);
    return () => eng.terminate();
  }, []); // 마운트 시 1회

  useEffect(() => {
    const handleResize = () => setBoardWidth(getResponsiveBoardWidth());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // === Elo 변경 시 엔진 옵션 업데이트 ===
  useEffect(() => {
    if (!engine) return;
    engine.postMessage(`setoption name UCI_Elo value ${elo}`);
  }, [engine, elo]);

  // ==== 피스 드롭 처리 =====================================
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    return makeMove(sourceSquare, targetSquare);
  }, [makeMove]);

  const handleBoardSquareClick = useCallback((square) => {
    const selectedMove = legalMoves.find(move => move.to === square);
    if (selectedSquare && selectedMove) {
      makeMove(selectedSquare, square);
      return;
    }

    selectSquare(square);
  }, [legalMoves, makeMove, selectedSquare, selectSquare]);

  const onSquareClick = useCallback(({ square }) => {
    handleBoardSquareClick(square);
  }, [handleBoardSquareClick]);

  const onPieceClick = useCallback(({ square }) => {
    handleBoardSquareClick(square);
  }, [handleBoardSquareClick]);

  const canDragPiece = useCallback(({ square }) => {
    const piece = game.current.get(square);
    return Boolean(piece && piece.color === game.current.turn());
  }, []);

  const undoMove = useCallback(() => {
    const undoneMove = game.current.undo();
    if (!undoneMove) return;
    clearSelection();
    syncGameState();
  }, [clearSelection, syncGameState]);

  const resetGame = useCallback(() => {
    game.current.reset();
    clearSelection();
    syncGameState();
  }, [clearSelection, syncGameState]);

  const squareStyles = useMemo(() => {
    const styles = {};
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: 'inset 0 0 0 4px rgba(33, 150, 136, 0.82)',
      };
    }

    legalMoves.forEach(move => {
      styles[move.to] = move.isCapture
        ? {
            boxShadow: 'inset 0 0 0 5px rgba(201, 69, 69, 0.72)',
            borderRadius: '50%',
          }
        : {
            background: 'radial-gradient(circle, rgba(34, 90, 80, 0.5) 18%, transparent 20%)',
          };
    });

    return styles;
  }, [legalMoves, selectedSquare]);

  const boardArrows = useMemo(() => (
    bestMove ? [{ startSquare: bestMove.from, endSquare: bestMove.to, color: 'rgba(18, 113, 91, 0.72)' }] : []
  ), [bestMove]);

  const turnLabel = getTurnLabel(game.current);
  const canUndo = history.length > 0;

  // ==== 렌더링 ===========================================
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">ChessWeb</p>
          <h1>체스 분석 보드</h1>
        </div>
        <div className="status-strip">
          <span>{turnLabel}</span>
          <span>{bestMove ? `Best: ${bestMove.san}` : '엔진 분석 중'}</span>
        </div>
      </header>

      <section className="workspace">
        <div className="board-column">
          <div className="control-panel">
            <label>
              Depth
              <select value={depth} onChange={e => setDepth(+e.target.value)}>
                {[8, 12, 15, 18, 20].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              Target Elo
              <select value={elo} onChange={e => setElo(+e.target.value)}>
                {ELO_OPTIONS.map(e => (
                  <option key={e} value={e}>{e} Elo</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={resetGame}>새 게임</button>
            <button type="button" onClick={undoMove} disabled={!canUndo}>되돌리기</button>
            <button
              type="button"
              onClick={() => setOrientation(current => current === 'white' ? 'black' : 'white')}
            >
              보드 뒤집기
            </button>
          </div>

          <div className="board-wrap">
            <Board
              width={boardWidth}
              fen={fen}
              orientation={orientation}
              squareStyles={squareStyles}
              arrows={boardArrows}
              onPieceDrop={onPieceDrop}
              onSquareClick={onSquareClick}
              onPieceClick={onPieceClick}
              canDragPiece={canDragPiece}
            />
          </div>

          <StatusMessage status={status} />
        </div>

        <aside className="side-panel">
          <AnalysisPanel
            engine={engine}
            fen={fen}
            depth={depth}
            turnLabel={turnLabel}
            onBestMoveChange={setBestMove}
          />
          <History history={history} />
        </aside>
      </section>
    </main>
  );
}
