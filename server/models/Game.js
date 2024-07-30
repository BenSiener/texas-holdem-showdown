const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  player: {
    username: { type: String, required: true },
    money: { type: Number, required: true }
  },
  bots: [
    {
      name: { type: String, required: true },
      money: { type: Number, required: true }
    }
  ],
  pot: { type: Number, default: 0 },
  currentTurn: { type: String, required: true },
  playerCards: { type: Array, required: true },
  communityCards: { type: Array, required: true },
  gameState: { type: String, required: true } // e.g., "pre-flop", "flop", "turn", "river", "showdown"
});

module.exports = mongoose.model('Game', gameSchema);
