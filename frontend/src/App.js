import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import Board from './Board';
import StatusMessage from './StatusMessage';
import History from './History';
import AnalysisPanel from './AnalysisPanel';

const BOARD_WIDTH = 350;
const BOARD_MAX_WIDTH = 800;

export default function App() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('');
  const [engine, setEngine] = useState(null);

  // ==== 엔진 초기화 =======================================
  // stockfish 패키지 설치 시 node_modules/stockfish/src/stockfish.js가 제공됩니다.
  // 아래 파일을 public 폴더로 복사해야 합니다:
  //   cp node_modules/stockfish/src/stockfish.js public/stockfish.js
  useEffect(() => {
    const workerPath = process.env.PUBLIC_URL + '/stockfish.js';
    // (디버깅) 파일 존재 확인
    fetch(workerPath)
      .then(res => {
        if (!res.ok) throw new Error(`Worker 파일을 찾을 수 없습니다: ${workerPath}`);
      })
      .catch(err => console.error(err));

    const eng = new Worker(workerPath);
    eng.postMessage('uci');
    setEngine(eng);
    return () => eng.terminate();
  }, []);

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
    setFen(game.current.fen());
    setHistory(old => [...old, move.san]);
    if (game.current.isCheckmate()) setStatus('🛑 체크메이트! 게임 종료');
    else if (game.current.isCheck()) setStatus('🔔 체크!');
    else setStatus('');
    return true;
  }, []);

  // ==== 렌더링 ===========================================
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
      {/* 왼쪽: 보드 및 수 기록 (좌우 배치) */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}>
        <Board width={BOARD_WIDTH} fen={fen} onPieceDrop={onPieceDrop} />
        <div style={{ marginLeft: 20, width:150, maxHeight: 450, overflowY: 'auto' }}>
          <History history={history} />
        </div>
      </div>

      {/* 오른쪽: 상태 메시지 + 분석 패널 */}
      <div style={{ width: 1200, marginLeft: 20, overflowY: 'auto' }}>
        <StatusMessage status={status} />
        <AnalysisPanel engine={engine} fen={fen} />
      </div>
    </div>
  );
}
