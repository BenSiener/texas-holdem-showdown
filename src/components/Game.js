import { Player } from '../gameLogic/Player.js';
import { Deck } from '../gameLogic/Deck.js';

export function initGame() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Texas Hold'em Showdown</h1>
    <div id="game-area">
      <!-- Game UI goes here -->
      <button id="bet-btn">Bet</button>
      <button id="call-btn">Call</button>
      <button id="pass-btn">Pass</button>
      <button id="fold-btn">Fold</button>
    </div>
  `;

  const player = new Player(localStorage.getItem('username'), 1000);
  const bot1 = new Player('Bot 1', 1000);
  const bot2 = new Player('Bot 2', 1000);

  const deck = new Deck();
  deck.shuffle();

  // Implement the game logic

  document.getElementById('bet-btn').addEventListener('click', () => {
    // Implement bet logic
  });

  document.getElementById('call-btn').addEventListener('click', () => {
    // Implement call logic
  });

  document.getElementById('pass-btn').addEventListener('click', () => {
    // Implement pass logic
  });

  document.getElementById('fold-btn').addEventListener('click', () => {
    // Implement fold logic
  });
}
