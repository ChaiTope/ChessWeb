// src/App.js
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import StatusMessage from './StatusMessage';
import History from './History';
import AnalysisPanel from './AnalysisPanel';

const BOARD_WIDTH     = 350;
const BOARD_MAX_WIDTH = 800;

function getGameStatus(game) {
  if (game.isCheckmate()) return '🛑 체크메이트! 게임 종료';
  if (game.isStalemate()) return '스테일메이트! 무승부';
  if (game.isDraw()) return '무승부';
  if (game.isGameOver()) return '게임 종료';
  if (game.isCheck()) return '🔔 체크!';
  return '';
}

export default function App() {
  const game = useRef(new Chess());
  const [fen, setFen]         = useState(game.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus]   = useState('');
  const [engine, setEngine]   = useState(null);

  // === 사용자 설정: 탐색 깊이 및 타깃 Elo ===
  const [depth, setDepth] = useState(15);
  const ELO_OPTIONS = [1320, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3190];
  const [elo, setElo] = useState(2000);

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

  // === Elo 변경 시 엔진 옵션 업데이트 ===
  useEffect(() => {
    if (!engine) return;
    engine.postMessage(`setoption name UCI_Elo value ${elo}`);
  }, [engine, elo]);

  // ==== 피스 드롭 처리 =====================================
  const onPieceDrop = useCallback(({ sourceSquare, targetSquare }) => {
    if (sourceSquare === targetSquare) {
      setStatus('⚠️ 같은 칸으로는 이동할 수 없습니다.');
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

    // 성공 처리
    setFen(game.current.fen());
    setHistory(old => [...old, move.san]);
    setStatus(getGameStatus(game.current));
    return true;
  }, []);

  // ==== 렌더링 ===========================================
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'center',
        alignItems:     'flex-start',
        padding:        20,
      }}
    >
      {/* 왼쪽: 설정 UI + 보드 + 수 기록 */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column',
          alignItems:    'center',
          maxWidth:      BOARD_MAX_WIDTH,
        }}
      >
        {/* Depth & Elo 설정 */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
          <label>
            Depth:&nbsp;
            <select value={depth} onChange={e => setDepth(+e.target.value)}>
              {[8, 12, 15, 18, 20].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Target Elo:&nbsp;
            <select value={elo} onChange={e => setElo(+e.target.value)}>
              {ELO_OPTIONS.map(e => (
                <option key={e} value={e}>{e} Elo</option>
              ))}
            </select>
          </label>
        </div>

        {/* 체스판 */}
        <Board
          width={BOARD_WIDTH}
          fen={fen}
          onPieceDrop={onPieceDrop}
        />


      </div>

      {/* 오른쪽: 상태 메시지 + 분석 패널 */}
      <div
        style={{
          marginLeft:  40,
          width:       400,
          maxHeight:   BOARD_MAX_WIDTH,
          border:     '1px solid #ccc',
          overflowY:  'auto',
          padding:    8,
        }}
      >
        <StatusMessage status={status} />
        <AnalysisPanel engine={engine} fen={fen} depth={depth} />
      </div>
      {/* 수 기록 (세로 스크롤) */}
      <div
        style={{
          width:      BOARD_WIDTH,
          maxHeight:  BOARD_WIDTH,
          overflowY:  'auto',
          border:     '1px solid #ccc',
          padding:    8,
        }}
      >
        <History history={history} />
      </div>
    </div>
  );
}
