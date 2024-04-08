import React from "react";

export const Lobby = ({ userName, showMyCards, roomCode, start }) => {
  return (
    <div>
      {!start && <p className="message">Hello, {userName}</p>}

      {roomCode && !start && <p> share this {roomCode} to your friend</p>}
      {start && (
        <button onClick={showMyCards} className="submit-button">
          Start Game
        </button>
      )}
    </div>
  );
};
