import { countingSystems, suits, ranks, rankValues, countingNumShown, countingSystem } from './init.js';

const back1 = document.getElementById('back1');
const back2 = document.getElementById('back2');
const front1 = document.getElementById('front1');
const front2 = document.getElementById('front2');

const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalCount = document.getElementById('modal-count');
const modalCountDetail = document.getElementById('modal-count-detail');
const modalCloser = document.getElementById('modal-close');

modalCloser.addEventListener('click', e => {
    e.stopPropagation();
    modal.style.display = "none";
});


const countingStrategy = Object.fromEntries(
    countingSystems[countingSystem].countValues.map(
        (count, i) => [rankValues[i], count]
    ));


const spliceAmount = 4;
const deck = [];
let currentDeck;
let currentIndex;
let timeStart;

for (const suit of suits) {
    for (const rank of ranks) {
        deck.push([rank, suit]);
    }
}


function createDeck(deck) {
    const newDeck = [...deck];
    
    for (let i = deck.length; i > 1; i--) {
        const index = Math.floor(Math.random() * i);
        [newDeck[i - 1], newDeck[index]] = [newDeck[index], newDeck[i - 1]];
    }
    
    return newDeck;
}


function resetCount() {
    currentDeck = [];
    currentIndex = spliceAmount;
    back1.classList.remove('display-none');
    back2.classList.remove('display-none');
    front1.classList.add('display-none');
    front2.classList.add('display-none');
}


function processClick() {
    if (currentIndex === spliceAmount) {
        currentDeck = createDeck(deck);
        back1.classList.add('display-none');
        back2.classList.add('display-none');
        front1.classList.remove('display-none');
        front2.classList.remove('display-none');
        timeStart = Date.now();

    } else if (currentIndex >= currentDeck.length) {
        const timeTaken = ((Date.now() - timeStart) / 1000).toFixed(1);

        let count = 0;

        const cardsRemoved = currentDeck.slice(0, spliceAmount).map(([rank, suit]) => {
            return `${rank}${suit}`;
        });

        const countDetail = currentDeck.slice(spliceAmount).map(([rank, suit]) => {
			count += countingStrategy[['J', 'Q', 'K'].includes(rank) ? '10' : rank];
            return `${rank}${suit} ${count}`;
        });

        modal.style.display = "block";
        modalText.textContent = `You took ${timeTaken} seconds. The final count is `;
        modalCount.textContent = count;
        modalCountDetail.textContent = 'Cards removed: ' + cardsRemoved.join(', ') + '\n' + countDetail.join('\n');
        resetCount();

        setTimeout(() => {
            window.addEventListener('click', e => {
                if (e.target !== modal) return;
                e.stopPropagation();
                modal.style.display = "none";
            }, {once: true})
        }, 3000);

        return;
    }
    

    front1.textContent = `${currentDeck[currentIndex][0]}${currentDeck[currentIndex][1]}`;
    if (['♥', '♦'].includes(currentDeck[currentIndex][1])) {
        front1.classList.remove('black');
        front1.classList.add('red');
    } else {
        front1.classList.add('black');
        front1.classList.remove('red');
    }

    front2.textContent = `${currentDeck[currentIndex + 1][0]}${currentDeck[currentIndex + 1][1]}`;
    if (['♥', '♦'].includes(currentDeck[currentIndex + 1][1])) {
        front2.classList.remove('black');
        front2.classList.add('red');
    } else {
        front2.classList.add('black');
        front2.classList.remove('red');
    }

    currentIndex += countingNumShown;
}


resetCount();
back1.addEventListener('click', processClick);
back2.addEventListener('click', processClick);
front1.addEventListener('click', processClick);
front2.addEventListener('click', processClick);