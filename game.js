class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    this.createDeck();
    this.shuffle();
  }

  createDeck() {
    const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    suits.forEach(suit => {
      values.forEach(value => {
        this.cards.push(new Card(value, suit));
      });
    });
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  deal() {
    return this.cards.pop();
  }
}

class Player {
  constructor(name, chips) {
    this.name = name;
    this.chips = chips;
    this.hand = [];
    this.currentBet = 0;
  }

  bet(amount) {
    if (amount > this.chips) throw new Error("Insufficient chips.");
    this.chips -= amount;
    this.currentBet += amount;
  }

  clearBet() {
    this.currentBet = 0;
  }

  win(amount) {
    this.chips += amount;
  }
}

function drawCommunityCards() {
  if (round === 0) { // Flop
    drawFlop();
    round++;
  } else if (round === 1) { // Turn
    drawTurn();
    round++;
  } else if (round === 2) { // River
    drawRiver();
    round++;
    // End game after drawing the fifth card
    endGame();
  }
}

function checkRoundEnd() {
  if (allPlayersActed()) {
    drawCommunityCards();
  } else {
    nextTurn();
  }
}

function nextTurn() {
  const currentPlayer = players[currentPlayerIndex];
  if (currentPlayer === player) {
    document.getElementById('call-btn').disabled = highestBet <= player.currentBet;
    document.getElementById('raise-btn').disabled = false;
  } else {
    botAction(currentPlayer);
  }
}

function initGame() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Texas Hold'em Showdown</h1>
    <div id="game-area">
      <div id="player-hand"></div>
      <div id="bot1-hand"></div>
      <div id="bot2-hand"></div>
      <div id="community-cards"></div>
      <div id="chat"></div>
      <div id="pot">Pot: $0</div>
      <div id="game-buttons">
        <button id="bet-btn">Bet</button>
        <button id="call-btn" disabled>Call</button>
        <button id="raise-btn" disabled>Raise</button>
        <button id="pass-btn">Pass</button>
        <button id="fold-btn">Fold</button>
      </div>
    </div>
  `;

  // Initialize game state
  const username = localStorage.getItem('username');
  const player = new Player(username, 1000);
  const bot1 = new Player('Bot 1', 1000);
  const bot2 = new Player('Bot 2', 1000);

  const deck = new Deck();
  deck.shuffle();

  const communityCards = [];
  const chatBox = document.getElementById('chat');
  const potElement = document.getElementById('pot');
  let pot = 0;
  let round = 0;
  let currentBet = 0;
  let highestBet = 0;
  let players = [player, bot1, bot2];
  let currentPlayerIndex = 0;

  function updateChat(message) {
    chatBox.innerHTML += `<p>${message}</p>`;
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
  }

  function updatePot(amount) {
    pot += amount;
    potElement.innerText = `Pot: $${pot}`;
  }

  function botBet(bot) {
    const betAmount = Math.floor(Math.random() * 100) + 1;
    bot.bet(betAmount);
    updatePot(betAmount);
    updateChat(`${bot.name} bets $${betAmount}.`);
    currentBet = betAmount;
    highestBet = Math.max(highestBet, betAmount);
  }

  function botCall(bot) {
    const callAmount = highestBet - bot.currentBet;
    if (callAmount > 0) {
      bot.bet(callAmount);
      updatePot(callAmount);
      updateChat(`${bot.name} calls $${highestBet}.`);
    } else {
      updateChat(`${bot.name} does not need to call.`);
    }
  }

  function botPass(bot) {
    updateChat(`${bot.name} passes.`);
  }

  function botRaise(bot) {
    const raiseAmount = highestBet + Math.floor(Math.random() * 100) + 1;
    bot.bet(raiseAmount);
    updatePot(raiseAmount);
    updateChat(`${bot.name} raises to $${raiseAmount}.`);
    highestBet = raiseAmount;
  }

  function botFold(bot) {
    updateChat(`${bot.name} folds.`);
    players = players.filter(p => p !== bot);
  }

  function botAction(bot) {
    if (highestBet === 0) {
      const action = Math.random();
      if (action < 0.3) {
        botPass(bot);
      } else if (action < 0.6) {
        botBet(bot);
      } else {
        botFold(bot);
      }
    } else {
      const action = Math.random();
      if (action < 0.5) {
        botCall(bot);
      } else if (action < 0.8) {
        botRaise(bot);
      } else {
        botFold(bot);
      }
    }
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    if (currentPlayerIndex === 0) {
      checkRoundEnd();
    } else {
      nextTurn();
    }
  }

  function drawFlop() {
    communityCards.push(deck.deal(), deck.deal(), deck.deal());
    document.getElementById('community-cards').innerText = `Community Cards: ${communityCards.map(card => `${card.value} of ${card.suit}`).join(', ')}`;
    resetBets();
  }

  function drawTurn() {
    communityCards.push(deck.deal());
    document.getElementById('community-cards').innerText = `Community Cards: ${communityCards.map(card => `${card.value} of ${card.suit}`).join(', ')}`;
    resetBets();
  }

  function drawRiver() {
    communityCards.push(deck.deal());
    document.getElementById('community-cards').innerText = `Community Cards: ${communityCards.map(card => `${card.value} of ${card.suit}`).join(', ')}`;
    resetBets();
  }

  function endGame() {
    // Determine the winner and update the pot
    determineWinner();
  
    // Display the end screen
    const app = document.getElementById('app');
    app.innerHTML += `
      <div id="end-screen">
        <h2>Game Over</h2>
        <p>The game has ended.</p>
        <p>Winner: ${winner.name}</p>
        <p>Pot Amount: $${pot}</p>
        <button id="restart-btn">Restart Game</button>
      </div>
    `;
  
    document.getElementById('restart-btn').addEventListener('click', () => {
      location.reload(); // Restart the game
    });
  }

  function determineWinner() {
    const playerBestHand = [...player.hand, ...communityCards];
    const bot1BestHand = [...bot1.hand, ...communityCards];
    const bot2BestHand = [...bot2.hand, ...communityCards];
  
    let winner = player;
    if (compareHands(playerBestHand, bot1BestHand) < 0) {
      winner = bot1;
    }
    if (compareHands(winner === player ? playerBestHand : bot1BestHand, bot2BestHand) < 0) {
      winner = bot2;
    }
  
    winner.win(pot);
    updateChat(`${winner.name} wins the round with a pot of $${pot}!`);
  
    // Reset pot and bets
    pot = 0;
    updatePot(pot);
    player.clearBet();
    bot1.clearBet();
    bot2.clearBet();
  }

  function allPlayersActed() {
    return (
      player.currentBet === highestBet &&
      bot1.currentBet === highestBet &&
      bot2.currentBet === highestBet
    );
  }

  function startGame() {
    // Deal initial hands
    players.forEach(player => player.hand.push(deck.deal(), deck.deal()));
    
    // Initial round of betting
    nextTurn();
  }

  document.getElementById('bet-btn').addEventListener('click', () => {
    const betAmount = parseInt(prompt('Enter bet amount:', '100'), 10);
    try {
      player.bet(betAmount);
      updatePot(betAmount);
      updateChat(`${player.name} bets $${betAmount}.`);
      currentBet = betAmount;
      highestBet = Math.max(highestBet, betAmount);
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      checkRoundEnd();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('call-btn').addEventListener('click', () => {
    const callAmount = highestBet - player.currentBet;
    if (callAmount > 0) {
      try {
        player.bet(callAmount);
        updatePot(callAmount);
        updateChat(`${player.name} calls $${highestBet}.`);
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        checkRoundEnd();
      } catch (error) {
        alert(error.message);
      }
    } else {
      alert('You do not need to call.');
    }
  });

  document.getElementById('raise-btn').addEventListener('click', () => {
    const raiseAmount = parseInt(prompt('Enter raise amount:', '100'), 10);
    try {
      player.bet(raiseAmount);
      updatePot(raiseAmount);
      updateChat(`${player.name} raises to $${raiseAmount}.`);
      highestBet = raiseAmount;
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      checkRoundEnd();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('pass-btn').addEventListener('click', () => {
    updateChat(`${player.name} passes.`);
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    checkRoundEnd();
  });

  document.getElementById('fold-btn').addEventListener('click', () => {
    updateChat(`${player.name} folds.`);
    endGame();
  });

  startGame(); // Start the game
}

document.addEventListener('DOMContentLoaded', initGame);
