import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Card } from "./components/Card/Card";
import { Result } from "./components/Result/Result";

let socket;
function App() {
  const [inputValue, setInputValue] = useState("");
  const [userName, setUsername] = useState("");
  const [disableClick, setDisableClick] = useState(false);
  const [gameState, setGameState] = useState({
    userName: userName,
    myCards: [],
    opponentCards: [],
    winner: null,
    currentAttribute: null,
    gameOver: false,
  });

  useEffect(() => {
    socket = io.connect("http://localhost:5000");
    socket.emit("init");
  }, []);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission behavior (reloading the page)
    socket.emit("name", inputValue);
    socket.on("name", (name) => {
      setUsername(name);
    });
  };

  //This function executes at the start of the game and on each next round click events
  //Frontend send myCards event to server. Inresponse, the gameState will be updated
  const showMyCards = () => {
    console.log("emitting game state on showMycards", gameState);
    socket.emit("myCards", {
      ...gameState,
      userName: userName,
      opponentName: gameState.opponentName,
      gameOver: false,
    });
    setDisableClick(false);
  };

  //Rerenders when gameState updates on the event of myCards
  useEffect(() => {
    socket.on("myCards", (currentGameState) => {
      console.log(currentGameState);
      setGameState(currentGameState);
    });
  }, [gameState]);

  //Whenever user clicks an attribute, Frontend will send opponentCards event to server
  //In response, the server will emit the updated game to all the clients connected
  const showOpponentCards = (attribute) => {
    console.log("clicked attribute", attribute);
    socket.emit("opponentCards", {
      ...gameState,
      userName: userName,
      currentAttribute: attribute,
    });
  };

  //Rerenders when gameState updates on the event of opponentCards
  useEffect(() => {
    socket.on("opponentCards", (currentGameState) => {
      console.log(currentGameState);
      setGameState(currentGameState);
      setDisableClick(true);
    });
  }, [gameState]);

  console.log(gameState);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {userName === "" && (
          <div>
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              placeholder="Enter your name"
            />
            <button type="submit">Submit</button>
          </div>
        )}
      </form>
      {userName && <p>Hello, {userName}</p>}

      {userName !== "" && gameState.myCards.length === 0 && (
        <button onClick={showMyCards}>Start Game</button>
      )}

      <div className="body">
        <div className="board">
          <section className="card">
            {!gameState.gameOver && gameState.myCards.length !== 0 && (
              <Card
                data={gameState.myCards}
                showMyCards={showOpponentCards}
                disableClick={disableClick || !gameState.winner}
                highlight={gameState.winner}
                clickedAttribute={gameState.currentAttribute}
              />
            )}
          </section>

          <section className="card">
            {!gameState.gameOver && gameState.opponentCards.length !== 0 && (
              <Card
                data={gameState.opponentCards}
                highlight={!gameState.winner}
                clickedAttribute={gameState.currentAttribute}
              />
            )}
          </section>

          {gameState.myCards.length !== 0 && !gameState.gameOver && (
            <div>
              <p className="round-results">
                {gameState.userName} have {gameState.myCardsLeft} cards left
              </p>
              <p className="round-results">
                {gameState.opponentName} have {gameState.opponentCardsLeft}{" "}
                cards left
              </p>
              {gameState.winner && disableClick && (
                <p className="round-results">You can choose the next card..</p>
              )}
            </div>
          )}

          <div className="next-round-container">
            {!gameState.gameOver && disableClick && gameState.winner && (
              <button className="next-round" onClick={showMyCards}>
                Next Round
              </button>
            )}
          </div>
          {gameState.gameOver && (
            <Result winner={gameState.winner} onClick={showMyCards} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
