// src/AnalysisPanel.js
import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatEval(cp, mate) {
  if (mate !== null) return `M${mate}`;
  if (cp === null) return '—';
  const pawns = cp / 100;
  return `${pawns >= 0 ? '+' : ''}${pawns.toFixed(2)}`;
}

function getWhiteRatio(cp, mate) {
  if (mate !== null) return mate > 0 ? 95 : 5;
  if (cp === null) return 50;
  const normalized = clamp(cp / 600, -1, 1);
  return clamp(50 + normalized * 45, 5, 95);
}

export default function AnalysisPanel({ engine, fen, depth, turnLabel, onBestMoveChange }) {
  const [suggestions, setSuggestions] = useState([null, null, null]);
  const [evaluation, setEvaluation] = useState({ cp: null, mate: null, depth: null });
  const [engineStatus, setEngineStatus] = useState('분석 준비 중');

  useEffect(() => {
    if (!engine) return;

    // 새로운 위치/깊이마다 초기화
    setSuggestions([null, null, null]);
    setEvaluation({ cp: null, mate: null, depth: null });
    setEngineStatus('분석 중...');
    onBestMoveChange(null);

    engine.postMessage('stop');
    engine.postMessage('uci');
    engine.postMessage('setoption name MultiPV value 3');
    engine.postMessage('position fen ' + fen);
    engine.postMessage(`go depth ${depth}`);

    let isCurrentSearch = true;

    const handler = (event) => {
      if (!isCurrentSearch) return;
      const line = (event.data || event).toString();
      if (!line.startsWith('info depth')) return;

      const parts = line.split(/\s+/);
      const d      = parseInt(parts[2], 10);
      const cpIdx  = parts.indexOf('cp');
      const cp     = cpIdx > -1 ? parseInt(parts[cpIdx + 1], 10) : null;
      const mateIdx = parts.indexOf('mate');
      const mate    = mateIdx > -1 ? parseInt(parts[mateIdx + 1], 10) : null;
      const mpIdx  = parts.indexOf('multipv');
      const rank   = mpIdx > -1 ? parseInt(parts[mpIdx + 1], 10) : 1;
      const pvIdx  = parts.indexOf('pv');
      const uci    = pvIdx > -1 ? parts[pvIdx + 1] : null;
      if (isNaN(d) || (cp === null && mate === null) || !uci || rank < 1 || rank > 3) return;

      // **Chess.js 인스턴스 생성**
      const tmp = new Chess(fen);

      // **1) 합법 수 체크**: uci가 legal UCI list에 있으면 적용
      const legalMoves = tmp.moves({ verbose: true }).map(m => m.from + m.to + (m.promotion||''));
      if (!legalMoves.includes(uci)) {
        // 사용자 두기 전 혹은 위치가 바뀐 뒤 들어온 메시지라면 무시
        return;
      }

      // **2) tmp.move()는 이제 안전**
      const mobj = tmp.move({
        from: uci.slice(0, 2),
        to:   uci.slice(2, 4),
        promotion: 'q',
      });
      const san = mobj?.san || uci;
      const score = formatEval(cp, mate);

      // 후보 수 저장
      setSuggestions(prev => {
        const next = [...prev];
        next[rank - 1] = { rank, san, uci, score };
        return next;
      });
      if (rank === 1) {
        onBestMoveChange({ from: uci.slice(0, 2), to: uci.slice(2, 4), san, uci });
        setEngineStatus(`Best: ${san}`);
        setEvaluation({ cp, mate, depth: d });
      }
    };

    engine.addEventListener('message', handler);
    return () => {
      isCurrentSearch = false;
      engine.postMessage('stop');
      engine.removeEventListener('message', handler);
    };
  }, [engine, fen, depth, onBestMoveChange]);

  const whiteRatio = getWhiteRatio(evaluation.cp, evaluation.mate);
  const blackRatio = 100 - whiteRatio;
  const evalText = formatEval(evaluation.cp, evaluation.mate);

  return (
    <div className="analysis-panel">
      <div className="panel-heading">
        <h3>엔진 추천수</h3>
        <span>{engineStatus}</span>
      </div>

      <div className="eval-card">
        <div className="eval-summary">
          <div>
            <span>Best move</span>
            <strong>{suggestions[0]?.san || '—'}</strong>
          </div>
          <div>
            <span>Eval</span>
            <strong>{evalText}</strong>
          </div>
          <div>
            <span>Depth</span>
            <strong>{evaluation.depth || depth}</strong>
          </div>
          <div>
            <span>Turn</span>
            <strong>{turnLabel}</strong>
          </div>
        </div>

        <div className="eval-bar" aria-label={`White ${whiteRatio.toFixed(0)} percent, Black ${blackRatio.toFixed(0)} percent`}>
          <div className="eval-segment eval-white" style={{ width: `${whiteRatio}%` }}>
            <span>White</span>
          </div>
          <div className="eval-segment eval-black" style={{ width: `${blackRatio}%` }}>
            <span>Black</span>
          </div>
        </div>
      </div>

      <ul className="suggestion-list">
        {suggestions.map((s, i) =>
          s ? (
            <li key={i}>
              <strong>{s.rank}. {s.san}</strong>
              <span>{s.score}</span>
            </li>
          ) : (
            <li key={i} className="muted">
              <strong>{i+1}. —</strong>
              <span>대기</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
