class Player {
  constructor(name, money) {
    this.name = name;
    this.money = money;
    this.hand = [];
    this.currentBet = 0;
  }

  bet(amount) {
    if (this.money >= amount) {
      this.money -= amount;
      this.currentBet += amount;
      return amount;
    } else {
      throw new Error('Insufficient funds');
    }
  }

  win(amount) {
    this.money += amount;
  }

  clearBet() {
    this.currentBet = 0;
  }
}

class Deck {
  constructor() {
    this.cards = [];
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    for (let suit of suits) {
      for (let value of values) {
        this.cards.push({ suit, value });
      }
    }
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

function rankHand(hand) {
  const cardValues = hand.map(card => cardValue(card));
  const suits = hand.map(card => card.suit);
  const uniqueValues = [...new Set(cardValues)];
  const isFlush = new Set(suits).size === 1;
  const isStraight = isConsecutive(cardValues.sort((a, b) => a - b));

  const valueCounts = countValues(cardValues);
  const isFourOfAKind = valueCounts.includes(4);
  const isFullHouse = valueCounts.includes(3) && valueCounts.includes(2);
  const isThreeOfAKind = valueCounts.includes(3);
  const isTwoPair = valueCounts.filter(count => count === 2).length === 2;
  const isOnePair = valueCounts.includes(2);

  if (isStraight && isFlush) return { rank: 9, highCard: Math.max(...cardValues) }; // Straight Flush
  if (isFourOfAKind) return { rank: 8, highCard: getFourOfAKindHighCard(cardValues) }; // Four of a Kind
  if (isFullHouse) return { rank: 7, highCard: getFullHouseHighCard(cardValues) }; // Full House
  if (isFlush) return { rank: 6, highCard: Math.max(...cardValues) }; // Flush
  if (isStraight) return { rank: 5, highCard: Math.max(...cardValues) }; // Straight
  if (isThreeOfAKind) return { rank: 4, highCard: getThreeOfAKindHighCard(cardValues) }; // Three of a Kind
  if (isTwoPair) return { rank: 3, highCard: getTwoPairHighCard(cardValues) }; // Two Pair
  if (isOnePair) return { rank: 2, highCard: getOnePairHighCard(cardValues) }; // One Pair
  return { rank: 1, highCard: Math.max(...cardValues) }; // High Card
}

function cardValue(card) {
  const values = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
  return values[card.value];
}

function isConsecutive(values) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) return false;
  }
  return true;
}

function countValues(values) {
  const counts = {};
  values.forEach(value => {
    counts[value] = (counts[value] || 0) + 1;
  });
  return Object.values(counts);
}

function getFourOfAKindHighCard(values) {
  const counts = countValues(values);
  return Math.max(...counts.filter(count => count === 4));
}

function getFullHouseHighCard(values) {
  const counts = countValues(values);
  const threeOfAKind = Math.max(...counts.filter(count => count === 3));
  const pair = Math.max(...counts.filter(count => count === 2));
  return threeOfAKind * 15 + pair;
}

function getThreeOfAKindHighCard(values) {
  const counts = countValues(values);
  return Math.max(...counts.filter(count => count === 3));
}

function getTwoPairHighCard(values) {
  const counts = countValues(values);
  const pairs = counts.filter(count => count === 2).sort((a, b) => b - a);
  return pairs[0] * 15 + pairs[1];
}

function getOnePairHighCard(values) {
  const counts = countValues(values);
  const pair = Math.max(...counts.filter(count => count === 2));
  return pair;
}

function getHandRank(hand) {
  return rankHand(hand);
}

function compareHands(hand1, hand2) {
  const rank1 = getHandRank(hand1);
  const rank2 = getHandRank(hand2);
  if (rank1.rank !== rank2.rank) return rank2.rank - rank1.rank;
  return rank2.highCard - rank1.highCard;
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

  function botBet(bot, betAmount) {
    if (betAmount > 0) {
      bot.bet(betAmount);
      updatePot(betAmount);
      updateChat(`${bot.name} bets $${betAmount}.`);
      currentBet = betAmount;
      highestBet = Math.max(highestBet, betAmount);
    }
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
    const raiseAmount = highestBet + Math.floor(Math.random() * 100);
    botBet(bot, raiseAmount);
    updateChat(`${bot.name} raises to $${raiseAmount}.`);
  }

  function botAction(bot) {
    if (highestBet === 0) {
      botPass(bot);
    } else if (Math.random() > 0.5) {
      botCall(bot);
    } else {
      botRaise(bot);
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

  function drawCommunityCards() {
    round++;
    if (round === 1) {
      drawFlop();
    } else if (round === 2) {
      drawTurn();
    } else if (round === 3) {
      drawRiver();
    }
  }

  function resetBets() {
    currentBet = 0;
    highestBet = 0;
    players.forEach(player => player.clearBet());
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

    initLeaderboard();
  }

  function allPlayersActed() {
    return (
      player.currentBet === highestBet &&
      bot1.currentBet === highestBet &&
      bot2.currentBet === highestBet
    );
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

  function checkRoundEnd() {
    if (allPlayersActed()) {
      drawCommunityCards();
    } else {
      nextTurn();
    }
  }

  document.getElementById('bet-btn').addEventListener('click', () => {
    const betAmount = parseInt(prompt('Enter bet amount:', '100'), 10);
    try {
      player.bet(betAmount);
      updatePot(betAmount);
      updateChat(`${player.name} bets $${betAmount}.`);
      highestBet = betAmount;
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      nextTurn();
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
        nextTurn();
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
      nextTurn();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById('pass-btn').addEventListener('click', () => {
    updateChat(`${player.name} passes.`);
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    nextTurn();
  });

  document.getElementById('fold-btn').addEventListener('click', () => {
    updateChat(`${player.name} folds.`);
    endGame(player);
  });

  function endGame(player) {
    determineWinner();
  }

  drawCommunityCards(); // Initial draw for community cards
}

window.initGame = initGame;


