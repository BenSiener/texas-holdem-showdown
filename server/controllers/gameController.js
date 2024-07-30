const Game = require('../models/Game');

exports.startGame = async (req, res) => {
  const { username, startingMoney } = req.body;
  const game = new Game({
    player: { username, money: startingMoney },
    bots: [
      { name: 'Bot 1', money: startingMoney },
      { name: 'Bot 2', money: startingMoney }
    ],
    currentTurn: username,
    playerCards: [],
    communityCards: [],
    gameState: 'pre-flop'
  });

  await game.save();
  res.status(200).json(game);
};

exports.bet = async (req, res) => {
  const { gameId, amount } = req.body;
  const game = await Game.findById(gameId);

  if (game.currentTurn !== game.player.username) {
    return res.status(400).send('Not your turn');
  }

  game.player.money -= amount;
  game.pot += amount;
  game.currentTurn = 'Bot 1'; // Switch to bot's turn, you can implement a more complex logic

  await game.save();
  res.status(200).json(game);
};

exports.call = async (req, res) => {
  const { gameId, amount } = req.body;
  const game = await Game.findById(gameId);

  if (game.currentTurn !== game.player.username) {
    return res.status(400).send('Not your turn');
  }

  game.player.money -= amount;
  game.pot += amount;
  game.currentTurn = 'Bot 1'; // Switch to bot's turn, you can implement a more complex logic

  await game.save();
  res.status(200).json(game);
};

exports.pass = async (req, res) => {
  const { gameId } = req.body;
  const game = await Game.findById(gameId);

  if (game.currentTurn !== game.player.username) {
    return res.status(400).send('Not your turn');
  }

  // Logic for passing to the next player/bot
  game.currentTurn = 'Bot 1'; // Switch to bot's turn, you can implement a more complex logic

  await game.save();
  res.status(200).json(game);
};

exports.fold = async (req, res) => {
  const { gameId } = req.body;
  const game = await Game.findById(gameId);

  if (game.currentTurn !== game.player.username) {
    return res.status(400).send('Not your turn');
  }

  // Logic for folding
  game.gameState = 'folded';
  game.currentTurn = 'Bot 1'; // Switch to bot's turn, you can implement a more complex logic

  await game.save();
  res.status(200).json(game);
};
