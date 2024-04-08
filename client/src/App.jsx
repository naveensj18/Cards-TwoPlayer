import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Card } from "./components/Card/Card";
import { Result } from "./components/Result/Result";
import { Home } from "./components/Home/Home";
import { Lobby } from "./components/Lobby/Lobby";

let socket;
function App() {
  const [inputValue, setInputValue] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [numberOfCardsInput, setNumberOfCardsInput] = useState(5);
  const [userName, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [numberOfCards, setNumberOfCards] = useState(null);
  const [disableClick, setDisableClick] = useState(false);
  const [start, setStart] = useState(false);
  const [gameState, setGameState] = useState({
    userName: userName,
    myCards: [],
    opponentCards: [],
    winner: null,
    currentAttribute: null,
    gameOver: false,
  });

  useEffect(() => {
    socket = io.connect("https://nineties-cards.onrender.com/");
    socket.emit("init");
  }, []);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleRoomInput = (event) => {
    setRoomInput(event.target.value);
  };

  const handleNumberOfCards = (event) => {
    setNumberOfCardsInput(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission behavior (reloading the page)
    socket.emit("joinGame", {
      requestor: inputValue,
      numberOfCards: numberOfCardsInput,
      roomCode: roomInput,
    });
    socket.on("joinGame", ({ requestor, roomCode, numberOfCards, start }) => {
      console.log(
        "payload from server",
        requestor,
        roomCode,
        numberOfCards,
        start
      );
      setUsername(requestor);
      setRoomCode(roomCode);
      setNumberOfCards(numberOfCards);
      setStart(start);
    });
  };

  console.log(userName, roomCode, numberOfCards);

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
      {userName === "" && (
        <Home
          handleSubmit={handleSubmit}
          inputValue={inputValue}
          roomInput={roomInput}
          handleChange={handleChange}
          handleRoomInput={handleRoomInput}
          handleNumberOfCards={handleNumberOfCards}
          userName={userName}
          roomCode={roomCode}
          numberOfCards={numberOfCards}
        />
      )}

      {userName && (
        <Lobby
          userName={userName}
          showMyCards={showMyCards}
          gameState={gameState}
          roomCode={roomCode}
          start={start}
        />
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
