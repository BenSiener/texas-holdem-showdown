class Player {
  constructor(name, balance) {
    this.name = name;
    this.balance = balance;
    this.hand = [];
    this.currentBet = 0;
  }

  receiveCard(card) {
    this.hand.push(card);
  }

  bet(amount) {
    if (amount > this.balance) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
    this.currentBet += amount;
  }

  win(amount) {
    this.balance += amount;
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
    for (const suit of suits) {
      for (const value of values) {
        this.cards.push(new Card(suit, value));
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

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
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
      <div id="leaderboard"></div>
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

  function endGame() {
    const playerHand = player.hand.concat(communityCards);
    const bot1Hand = bot1.hand.concat(communityCards);
    const bot2Hand = bot2.hand.concat(communityCards);
    const playerRank = getHandRank(playerHand);
    const bot1Rank = getHandRank(bot1Hand);
    const bot2Rank = getHandRank(bot2Hand);

    const results = [
      { player: player, rank: playerRank },
      { player: bot1, rank: bot1Rank },
      { player: bot2, rank: bot2Rank }
    ];

    results.sort((a, b) => compareHands(b.rank, a.rank));

    const winner = results[0];
    updateChat(`The winner is ${winner.player.name} with ${rankToString(winner.rank.rank)}!`);

    // Distribute winnings
    results.forEach(result => {
      if (result !== winner) {
        result.player.balance -= result.player.currentBet;
      }
    });
    winner.player.balance += pot;

    // Reset for new game
    players.forEach(player => {
      player.hand = [];
      player.clearBet();
    });
    communityCards.length = 0;
    pot = 0;
    potElement.innerText = `Pot: $0`;

    // Update leaderboard
    updateLeaderboard();
  }

  function rankToString(rank) {
    switch (rank) {
      case 9: return 'Straight Flush';
      case 8: return 'Four of a Kind';
      case 7: return 'Full House';
      case 6: return 'Flush';
      case 5: return 'Straight';
      case 4: return 'Three of a Kind';
      case 3: return 'Two Pair';
      case 2: return 'One Pair';
      case 1: return 'High Card';
    }
  }

  function updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = players.map(player => `<p>${player.name}: $${player.balance}</p>`).join('');
  }

  // Game Flow
  function startRound() {
    round++;
    updateChat(`Round ${round} starts.`);

    deck.shuffle();

    // Deal initial cards
    players.forEach(player => {
      player.receiveCard(deck.deal());
      player.receiveCard(deck.deal());
    });

    // Deal community cards
    communityCards.push(deck.deal());
    communityCards.push(deck.deal());
    communityCards.push(deck.deal());
    communityCards.push(deck.deal());
    communityCards.push(deck.deal());

    // Game actions
    players.forEach((player, index) => {
      if (index === currentPlayerIndex) {
        // Player's turn
        document.getElementById('bet-btn').disabled = false;
        document.getElementById('call-btn').disabled = false;
        document.getElementById('raise-btn').disabled = false;
        document.getElementById('pass-btn').disabled = false;
        document.getElementById('fold-btn').disabled = false;
      } else {
        // Bot's turn
        botBet(player);
        botCall(player);
        botPass(player);
      }
    });

    // End round and determine winner
    setTimeout(endGame, 5000); // Delay to simulate end of round
  }

  startRound();
}



