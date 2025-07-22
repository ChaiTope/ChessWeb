// src/App.js
import React, { useState, useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function App() {
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());
  const [status, setStatus] = useState("");  // 상태 메시지

  const onPieceDrop = ({ sourceSquare, targetSquare }) => {
    const move = game.current.move({
      from: sourceSquare,
      to:   targetSquare,
      promotion: "q",
    });
    if (!move) {
      setStatus("잘못된 수라 되돌려집니다.");
      return false;
    }

    const newFen = game.current.fen();
    setFen(newFen);

    // 체크메이트 먼저 검사
    if (game.current.isCheckmate()) {
      setStatus("체크메이트! 게임 종료");
    }
    // 체크 상태이면
    else if (game.current.isCheck()) {
      setStatus("체크!");
    }
    // 그 외에는 메시지 지우기
    else {
      setStatus("");
    }

    return true;
  };

  return (
    <div style={{ width: 400, margin: "auto", paddingTop: 20 }}>
      <Chessboard
        options={{
          position: fen,
          boardWidth: 400,
          arePiecesDraggable: true,
          onPieceDrop,
        }}
      />
      {/* 상태 메시지 영역 */}
      {status && (
        <div style={{ marginTop: 10, textAlign: "center", fontWeight: "bold" }}>
          {status}
        </div>
      )}
    </div>
  );
}
