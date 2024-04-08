import React, { useState } from "react";
import "./Home.css";

export const Home = ({
  handleSubmit,
  handleChange,
  handleRoomInput,
  handleNumberOfCards,
  inputValue,
  roomInput,
  userName,
  numberOfCards,
}) => {
  return (
    <div className="home">
      {userName === "" && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your name"
            />
            <label htmlFor="numberOfCards">
              Select number of cards to play:
            </label>
            <select
              id="numberOfCards"
              value={numberOfCards}
              onChange={handleNumberOfCards}
              className="select-field"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
            <input
              type="text"
              value={roomInput}
              onChange={handleRoomInput}
              className="input-field"
              placeholder="Enter Room Code"
            />
            <button type="submit" className="submit-button">
              Create Room
            </button>
            <button type="submit" className="submit-button">
              Join Room
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
