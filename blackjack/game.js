import { countingSystems, suits, ranks, rankValues, countingSystem, lifetimeWinnings,
  numDecks, penetrationPercent, basicStrategies, rankValueMap, verifyBasicStrategy,
  dealerHitSoft17, doubleAfterSplit, doubleAllowed, only1CardForSplitAces, surrenderAllowed } from './init.js';


const actionMap = {
  'H': 'Hit',
  'S': 'Stand',
  'R': 'Hit',
  'P': 'Split',
  'D': 'Double',
}


// UI setup
let snackbarTimeout = null;

const snackbarDiv = document.getElementById('snackbar');
const runningCountDiv = document.getElementById('runningCount');
const trueCountDiv = document.getElementById('trueCount');
const lifetimeWinningsDiv = document.getElementById('lifetimeWinnings');
const numCardsLeftDiv = document.getElementById('numCardsLeft');

const bettingDiv = document.getElementById('betting');
const betAmountInput = document.getElementById('betAmount');
const dealButton = document.getElementById('deal');

const insuranceDiv = document.getElementById('insurance');
const insuranceYesButton = document.getElementById('insuranceYes');
const insuranceNoButton = document.getElementById('insuranceNo');

const actionsDiv = document.getElementById('actions');
const surrenderButton = document.getElementById('surrender');
const hitButton = document.getElementById('hit');
const doubleButton = document.getElementById('double');
const splitButton = document.getElementById('split');
const standButton = document.getElementById('stand');

const dealerCardFrontDivs = [];
const dealerCardBackDivs = [];
const playerHandDivs = [];
const playerCardFrontDivs = [];
const playerCardBackDivs = [];
const playerBetDivs = [];


for (let i = 0; i < 11; i++) {
  dealerCardFrontDivs.push(document.getElementById(`dealerFront${i}`));
  dealerCardBackDivs.push(document.getElementById(`dealerBack${i}`));
}

for (let j = 0; j < 4; j++) {
  playerHandDivs.push(document.getElementById(`player${j}Hand`))
  playerCardFrontDivs.push([]);
  playerCardBackDivs.push([]);
  playerBetDivs.push(document.getElementById(`player${j}Bet`));

  for (let i = 0; i < 11; i++) {
    playerCardFrontDivs[j].push(document.getElementById(`player${j}Front${i}`));
    playerCardBackDivs[j].push(document.getElementById(`player${j}Back${i}`));
  }
}


// strat and deck setup
const basicStrategy = basicStrategies[`${Math.min(numDecks, 4)},${dealerHitSoft17},${doubleAfterSplit}`];
const startingCount = countingSystems[countingSystem].startingCount[numDecks];
const countingStrategy = Object.fromEntries(
  countingSystems[countingSystem].countValues.map(
      (count, i) => [rankValues[i], count]
));


const deck = [];
const numCards = numDecks * 52;
const shuffleIndex = Math.round(numCards * penetrationPercent / 100);

for (let i = 0; i < numDecks; i++) {
  for (const suit of suits) {
      for (const rank of ranks) {
          deck.push([rank, suit]);
      }
  }
}


// game data
let currentBalance = lifetimeWinnings;
let currentDeckIndex;
let currentCount;
let currentBet;
let currentHandIndex;
let dealersHiddenCount;
let playerHands;
let playerBets;
let dealerHand;
let currentSnackbarMessage;


updateLifetimeWinnings();
resetGame();


// game ui functions

dealButton.addEventListener('click', () => {
  const betAmount = Number(betAmountInput.value);

  if (Number.isNaN(betAmount) || betAmount < 1 || betAmount > 20000) {
    showSnackbar('Bet amount must be between 1 and 20000');
  } else {
    resetHands();
    currentBet = betAmount;
    playerBetDivs[0].textContent = currentBet;
    currentHandIndex = 0;
    playerHands = [[]];
    playerBets = [currentBet];
    dealerHand = [];

    updateLifetimeWinnings(-currentBet);
    hideNodes(bettingDiv);

    dealCard(true);
    dealersHiddenCount = dealCard(false, 0, false);
    dealCard(true);
    dealCard(false);

    
    if (dealerHand[1][0] === 'A') {
      showNodes(insuranceDiv);
    } else {
      blackjackCheck();
    }
  }
});


insuranceYesButton.addEventListener('click', () => {
  if (calculateHandValue(dealerHand).value === 21) {
    updateLifetimeWinnings(currentBet);
  } else {
    updateLifetimeWinnings(-currentBet/2);
  }

  hideNodes(insuranceDiv);
  blackjackCheck(true);
});


insuranceNoButton.addEventListener('click', () => {
  hideNodes(insuranceDiv);
  blackjackCheck();
});


surrenderButton.addEventListener('click', () => {
  checkPlayerAction('R');
  endRound(currentBet/2, 'Hand surrendered.');
});


hitButton.addEventListener('click', () => {
  checkPlayerAction('H');
  dealCard(true, currentHandIndex);

  if (calculateHandValue(playerHands[currentHandIndex]).value >= 21) {
    standAction();
  } else {
    showActionNodes();
  }
});


doubleButton.addEventListener('click', () => {
  checkPlayerAction('D');
  
  const currentBet = playerBets[currentHandIndex];
  updateLifetimeWinnings(-currentBet);
  playerBets[currentHandIndex] *= 2;
  playerBetDivs[currentHandIndex].textContent = 2*currentBet;
  dealCard(true, currentHandIndex);
  standAction();
});


splitButton.addEventListener('click', () => {
  checkPlayerAction('P');

  const currentHand = playerHands[currentHandIndex];
  const currentBet = playerBets[currentHandIndex];

  playerHands.push([currentHand.pop()]);
  playerBets.push(playerBets[currentHandIndex]);
  playerBetDivs[currentHandIndex + 1].textContent = currentBet;
  updateLifetimeWinnings(-currentBet);


  const [rank, suit] = currentHand[0];
  const frontDiv = playerCardFrontDivs[currentHandIndex + 1][0];
  showNodes(frontDiv);
  frontDiv.textContent = `${rank}${suit}`;

  if (['♥', '♦'].includes(suit)) {
    frontDiv.classList.remove('black');
    frontDiv.classList.add('red');
  } else {
    frontDiv.classList.add('black');
    frontDiv.classList.remove('red');
  }


  dealCard(true, currentHandIndex);
  dealCard(true, currentHandIndex + 1);

  if (currentHand[0][0] === 'A' && only1CardForSplitAces)
    dealerPlay();
  else if (calculateHandValue(currentHand).value === 21)
    standAction();
  else
    showActionNodes();
});


standButton.addEventListener('click', () => {
  checkPlayerAction('S');
  standAction();
});


function standAction() {
  if (currentHandIndex + 1 === playerHands.length) {
    dealerPlay();
  } else {
    playerHandDivs[currentHandIndex].classList.remove('active-hand');
    currentHandIndex++;
    playerHandDivs[currentHandIndex].classList.add('active-hand');
    
    if (calculateHandValue(playerHands[currentHandIndex]).value === 21)
      standAction();
  }
}


// utility functions

function checkPlayerAction(action) {
  if (!verifyBasicStrategy) return;

  const hasSplit = playerHands.length > 1;
  const canSplit = !splitButton.classList.contains('display-none');
  const canDouble = !doubleButton.classList.contains('display-none');

  const hand = playerHands[currentHandIndex];
  const { value: playerValue, isSoft } = calculateHandValue(hand);
  const dealerValue = dealerHand[1][0] === 'A' ? 9 : 
    ['J', 'K', 'Q'].includes(dealerHand[1][0]) ? 8 :
    Number(dealerHand[1][0]) - 2;

  if (hand.length === 2) {
    const strategyLookup = basicStrategy[canSplit ? 'pair' : isSoft ? 'soft' : 'hard'][canSplit ? playerValue/2 : playerValue][dealerValue];
    
    if (strategyLookup.length === 1) {
      if (strategyLookup === action) return;
      showSnackbar(`Correct basic strategy: ${actionMap[strategyLookup]}.`);
    } else {
      const [ firstAction, secondAction ] = strategyLookup.split('');
      
    /*
  if (hasSplit && !doubleAfterSplit)
    return;

  if (
    doubleAllowed === 'Any 2' ||
    (doubleAllowed === '9/10/11' && handValue >= 9 && handValue <= 11) ||
    (doubleAllowed === '10/11' && handValue >= 10 && handValue <= 11)
  )
    showNodes(doubleButton);*/

      if (firstAction === 'P' && action !== 'P') {
        showSnackbar('Correct basic strategy: Split.');

      } else if (firstAction === 'R') {
        if (surrenderAllowed && action !== 'R') {
          showSnackbar('Correct basic strategy: Surrender.');
        } else if (!surrenderAllowed && secondAction !== action) {
          showSnackbar(`Correct basic strategy: ${actionMap[secondAction]}.`);
        }

      } else if (firstAction === 'D') {
        if (canDouble && action !== 'D') {
          showSnackbar('Correct basic strategy: Double.');
        } else if (!canDouble && secondAction !== action) {
          showSnackbar(`Correct basic strategy: ${actionMap[secondAction]}.`);
        }

      }
    }

  } else {
    const strategyLookup = basicStrategy[isSoft ? 'soft' : 'hard'][playerValue][dealerValue];
    const correctStrategy = strategyLookup.length > 1 ? strategyLookup[1] : strategyLookup[0];
    
    if (correctStrategy === action) return;

    showSnackbar(`Correct basic strategy: ${actionMap[correctStrategy]}.`);
  }
}


function dealerPlay() {
  let balanceAdjustment = 0;
  let winAmount = 0;
  let dealerHandValue;
  let results = [];

  hideNodes(actionsDiv);

  if (playerHands.every(hand => calculateHandValue(hand).value > 21)) 
    return endRound(0, 'Player busts.');


  while (true) {
    const { value: handValue, isSoft } = calculateHandValue(dealerHand);
    dealerHandValue = handValue;

    if (handValue >= 18) break;
    if (handValue === 17 && !isSoft) break;
    if (handValue === 17 && isSoft && !dealerHitSoft17) break;

    dealCard(false);
  }


  for (let i = 0; i < playerHands.length; i++) {
    const { value: playerHandValue } = calculateHandValue(playerHands[i]);

    if (playerHandValue > 21) {
      winAmount -= playerBets[i];
      results.push('Player Busts');
    } else if (dealerHandValue > 21) {
      balanceAdjustment += 2 * playerBets[i];
      winAmount += playerBets[i];
      results.push('Dealer Busts');
    } else if (playerHandValue === dealerHandValue) {
      balanceAdjustment += playerBets[i];
      results.push('Push');
    } else if (playerHandValue > dealerHandValue) {
      balanceAdjustment += 2 * playerBets[i];
      winAmount += playerBets[i];
      results.push('Player Wins');
    } else {
      winAmount -= playerBets[i];
      results.push('Dealer Wins');
    }
  }

  endRound(balanceAdjustment, `${results.join(', ')}. Player ${winAmount >= 0 ? 'wins' : 'loses'} ${winAmount}.`);
}


function blackjackCheck(isDuringInsurance = false) {
  if (calculateHandValue(dealerHand).value === 21) {
    if (calculateHandValue(playerHands[0]).value === 21) {
      endRound(currentBet, `${isDuringInsurance ? 'Insurance bet won. ': ''}Player BJ pushes with dealer blackjack`);
    } else {
      endRound(0, `${isDuringInsurance ? 'Insurance bet won. ': ''}Dealer wins with blackjack`);
    }

  } else if (calculateHandValue(playerHands[0]).value === 21) {
    endRound(currentBet * 1.5, `${isDuringInsurance ? 'Insurance bet lost. ': ''}Player wins with blackjack`);

  } else {
    if (isDuringInsurance) showSnackbar('Insurance bet lost');
    showActionNodes();
  }
}


function showActionNodes() {
  const hasSplit = playerHands.length > 1;
  const hand = playerHands[currentHandIndex];
  const { value: handValue } = calculateHandValue(hand);
  showNodes(actionsDiv);
  hideNodes(surrenderButton, doubleButton, splitButton);

  if (hand.length === 2) {
    if (surrenderAllowed)
      showNodes(surrenderButton);

    if (hand[0][0] === hand[1][0] && playerHands.length < 4)
      showNodes(splitButton);

    if (hasSplit && !doubleAfterSplit)
      return;

    if (
      doubleAllowed === 'Any 2' ||
      (doubleAllowed === '9/10/11' && handValue >= 9 && handValue <= 11) ||
      (doubleAllowed === '10/11' && handValue >= 10 && handValue <= 11)
    )
      showNodes(doubleButton);
  }
}


function endRound(winningsChange, snackbarMessage) {
  if (winningsChange > 0)
    updateLifetimeWinnings(winningsChange);

  updateCount(dealersHiddenCount);
  hideNodes(dealerCardBackDivs[0]);
  showNodes(dealerCardFrontDivs[0]);

  if (currentDeckIndex > shuffleIndex) {
    resetGame();
    showSnackbar(snackbarMessage + '\nShuffling.');
  } else {
    resetActions();
    showSnackbar(snackbarMessage);
  }
}


function calculateHandValue(hand) {
  let isSoft = false;
  let value = 0;

  for (const [rank] of hand) {
    if (rank === 'A') {
      if (isSoft) {
        value += 1;
      } else {
        value += 11;
        isSoft = true;
      }
    } else {
      value += rankValueMap[rank];
    }
  }

  if (value > 21 && isSoft) {
    value -= 10;
    isSoft = false;
  }

  return { value, isSoft};
}


function dealCard(dealToPlayer, handIndex = 0, show = true) {
  const [rank, suit] = deck[currentDeckIndex];
  const changeToCount = countingStrategy[['J', 'Q', 'K'].includes(rank) ? '10' : rank];
  const hand = dealToPlayer ? playerHands[handIndex] : dealerHand;
  const handFrontDivs = dealToPlayer ? playerCardFrontDivs[handIndex] : dealerCardFrontDivs;
  const handBackDivs = dealToPlayer ? playerCardBackDivs[handIndex] : dealerCardBackDivs;

  hand.push([rank, suit, show]);
  if (show) updateCount(changeToCount);

  const drawIndex = hand.length - 1;
  const frontDiv = handFrontDivs[drawIndex];
  frontDiv.textContent = `${rank}${suit}`;

  if (['♥', '♦'].includes(suit)) {
    frontDiv.classList.remove('black');
    frontDiv.classList.add('red');
  } else {
    frontDiv.classList.add('black');
    frontDiv.classList.remove('red');
  }

  if (show) {
    showNodes(frontDiv);
  } else {
    showNodes(handBackDivs[drawIndex]);
  }
  
  currentDeckIndex++;
  updateCardsLeft();
  return changeToCount;
}


function hideNodes(...nodes) {
  nodes.forEach(node => node.classList.add('display-none'));
}


function showNodes(...nodes) {
  nodes.forEach(node => node.classList.remove('display-none'));
}


function updateSnackbarMessage(message) {
  currentSnackbarMessage += (currentSnackbarMessage ? ' ' : '') + message
}


function showSnackbar(message = '') {
  if (snackbarTimeout)
    clearTimeout(snackbarTimeout);

  if (message)
    updateSnackbarMessage(message);

  snackbarDiv.textContent = currentSnackbarMessage;
  snackbarDiv.classList.add('show');
  snackbarTimeout = setTimeout(() => {
    snackbarDiv.classList.remove('show');
    currentSnackbarMessage = '';
    snackbarTimeout = null;
  }, 8000);
}


function shuffle(deck) {
  for (let i = deck.length; i > 1; i--) {
    const index = Math.floor(Math.random() * i);
    [deck[i - 1], deck[index]] = [deck[index], deck[i - 1]];
  }
}


function updateCardsLeft() {
  numCardsLeftDiv.textContent = numCards - currentDeckIndex;
}


function updateCount(num) {
  currentCount += num;
  runningCountDiv.textContent = currentCount;
  trueCountDiv.textContent = (currentCount / (numCards - currentDeckIndex) * 52).toFixed(1);
}


function setCount(num) {
  currentCount = num;
  runningCountDiv.textContent = currentCount;
  trueCountDiv.textContent = (currentCount / (numCards - currentDeckIndex) * 52).toFixed(1);
}


function resetGame() {
  shuffle(deck);
  currentDeckIndex = 0;
  currentCount = startingCount;
  currentSnackbarMessage = '';

  updateCardsLeft();
  setCount(startingCount);
  resetActions();
}


function resetHands() {
  hideNodes(...dealerCardFrontDivs);
  hideNodes(...dealerCardBackDivs)
  playerCardFrontDivs.forEach(hand => hideNodes(...hand));
  playerCardBackDivs.forEach(hand => hideNodes(...hand));
  playerBetDivs.forEach(betDiv => betDiv.textContent = "");
  playerHandDivs.forEach(hand => hand.classList.remove('active-hand'));
  playerHandDivs[0].classList.add('active-hand');
}


function resetActions() {
  showNodes(bettingDiv);
  hideNodes(insuranceDiv, actionsDiv, surrenderButton, doubleButton, splitButton);
}


function updateLifetimeWinnings(amount = 0) {
  currentBalance = currentBalance + amount;
  lifetimeWinningsDiv.textContent = currentBalance.toLocaleString();
  if (amount) localStorage.setItem('lifetimeWinnings', currentBalance);
}