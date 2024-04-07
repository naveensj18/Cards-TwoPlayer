import { Server } from "socket.io";
import { players } from "./constants/ipl.js";
import { shuffleDeck } from "./utils/shuffleDeck.js";
import { reassignCards } from "./utils/reassignCards.js";
import { decideWinner } from "./utils/decideWinner.js";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let cards = shuffleDeck(players);
let user1Cards = cards.slice(0, 5);
let user2Cards = cards.slice(5, 10);

const usersConnected = [];

io.on("connection", (socket) => {
  socket.on("init", () => {
    console.log("an user connected", socket.id);
  });

  socket.on("name", (requestor) => {
    usersConnected.push({
      name: requestor,
      socketId: socket.id,
    });
    console.log(usersConnected);
    const currentUser = usersConnected[usersConnected.length - 1];
    io.to(currentUser.socketId).emit("name", currentUser.name);
  });

  socket.on("myCards", (gameState) => {
    console.log(gameState.userName, "requested to show his cards");

    const firstUser = usersConnected[0];
    const secondUser = usersConnected[1];
    let prevRoundWinner;
    if (gameState.userName === usersConnected[0].name) {
      prevRoundWinner = "user1";
    } else {
      prevRoundWinner = "user2";
    }

    if (user1Cards.length === 0 || user2Cards.length === 0) {
      io.emit("myCards", {
        ...gameState,
        gameOver: true,
        winner:
          user1Cards.length === 0
            ? usersConnected[1].name
            : usersConnected[0].name,
      });
      cards = shuffleDeck(players);
      user1Cards = cards.slice(0, 5);
      user2Cards = cards.slice(5, 10);
    } else {
      io.to(firstUser.socketId).emit("myCards", {
        ...gameState,
        userName: usersConnected[0].name,
        opponentName: usersConnected[1].name,
        myCards: user1Cards[0],
        opponentCards: [],
        winner: gameState.winner == null ? true : prevRoundWinner === "user1",
        currentAttribute: null,
        gameOver: gameState.gameOver,
        myCardsLeft: user1Cards.length,
        opponentCardsLeft: user2Cards.length,
      });
      io.to(secondUser.socketId).emit("myCards", {
        ...gameState,
        userName: usersConnected[1].name,
        opponentName: usersConnected[0].name,
        myCards: user2Cards[0],
        opponentCards: [],
        winner: prevRoundWinner === "user2",
        currentAttribute: null,
        gameOver: gameState.gameOver,
        myCardsLeft: user2Cards.length,
        opponentCardsLeft: user1Cards.length,
      });
    }
  });

  socket.on("opponentCards", (gameState) => {
    const requestor = gameState.userName;
    console.log(gameState.userName, "requested to show opponent cards");
    const firstUser = usersConnected[0];
    const secondUser = usersConnected[1];
    console.log("before reassign -> ", user1Cards.length, user2Cards.length);
    const currentRoundWinner = decideWinner(
      user1Cards[0]["Attributes"],
      user2Cards[0]["Attributes"],
      gameState.currentAttribute
    );
    console.log(
      "attribute clicked",
      gameState.currentAttribute,
      "winner",
      currentRoundWinner,
      currentRoundWinner === "user1",
      currentRoundWinner === "user2"
    );
    io.to(firstUser.socketId).emit("opponentCards", {
      ...gameState,
      userName: usersConnected[0].name,
      opponentName: usersConnected[1].name,
      myCards: user1Cards[0],
      opponentCards: user2Cards[0],
      winner: currentRoundWinner === "user1",
    });
    io.to(secondUser.socketId).emit("opponentCards", {
      ...gameState,
      userName: usersConnected[1].name,
      opponentName: usersConnected[0].name,
      myCards: user2Cards[0],
      opponentCards: user1Cards[0],
      winner: currentRoundWinner === "user2",
    });
    const reassignedCards = reassignCards(
      user1Cards,
      user2Cards,
      currentRoundWinner
    );
    user1Cards = reassignedCards.user1Cards;
    user2Cards = reassignedCards.user2Cards;
    console.log("after reassign -> ", user1Cards.length, user2Cards.length);
  });

  socket.on("disconnect", () => {
    console.log("an user disconnected");
    usersConnected.pop(1);
    console.log(usersConnected);
  });
});

io.listen(5000);
