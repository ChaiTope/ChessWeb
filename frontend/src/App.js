// src/App.js
import React, { useState, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function App() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");

  const onPieceDrop = useCallback((moveEvent) => {
    const { sourceSquare, targetSquare } = moveEvent;
    // 같은 칸 → snap-back
    if (sourceSquare === targetSquare) return false;

    // 실제 엔진에 move 요청
    const move = game.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    // 불가능한 수 → snap-back
    if (!move) return false;

    // 성공한 수 처리
    setFen(game.current.fen());
    setHistory(old => [...old, move.san]);
    if (game.current.isCheckmate()) setStatus("체크메이트! 게임 종료");
    else if (game.current.isCheck()) setStatus("체크!");
    else setStatus("");

    return true;
  }, []);

  const chessboardOptions = {
    position: fen,
    boardWidth: 400,
    arePiecesDraggable: true,
    onPieceDrop,  // ← 여기
  };

  return (
    <div style={{ width: 400, margin: "auto", paddingTop: 20 }}>
      <Chessboard options={chessboardOptions} />

      {status && (
        <div style={{ marginTop: 10, textAlign: "center", fontWeight: "bold" }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>수 기록</h3>
        <ol>
          {history.map((mv, idx) => (
            <li key={idx}>{mv}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
