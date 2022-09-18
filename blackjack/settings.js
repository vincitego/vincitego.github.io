import { countingSystem, numDecks, penetrationPercent, dealerHitSoft17, doubleAllowed, 
    doubleAfterSplit, only1CardForSplitAces, verifyBasicStrategy, surrenderAllowed } from './init.js';
    

const countingSystemInput = document.getElementById('countingSystem');
const numDecksInput = document.getElementById('numDecks');
const dealerHitSoft17Input = document.getElementById('dealerHitSoft17');
const doubleAllowedInput = document.getElementById('doubleAllowed');
const doubleAfterSplitInput = document.getElementById('doubleAfterSplit');
const only1CardForSplitAcesInput = document.getElementById('only1CardForSplitAces');
const surrenderAllowedInput = document.getElementById('surrenderAllowed');
const verifyBasicStrategyInput = document.getElementById('verifyBasicStrategy');
const penetrationPercentInput = document.getElementById("penetrationPercent");
const penetrationPercentValue = document.getElementById("penetrationPercentValue");

countingSystemInput.value = countingSystem;
numDecksInput.value = numDecks;
dealerHitSoft17Input.checked = dealerHitSoft17;
surrenderAllowedInput.checked = surrenderAllowed;
doubleAllowedInput.value = doubleAllowed;
doubleAfterSplitInput.checked = doubleAfterSplit;
only1CardForSplitAcesInput.checked = only1CardForSplitAces;
verifyBasicStrategyInput.checked = verifyBasicStrategy;
penetrationPercentInput.value = penetrationPercent;
penetrationPercentValue.textContent = penetrationPercent;

countingSystemInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.value);
});

numDecksInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.value);
});

surrenderAllowedInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.checked);
});

dealerHitSoft17Input.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.checked);
});

doubleAllowedInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.value);
});

doubleAfterSplitInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.checked);
});

only1CardForSplitAcesInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.checked);
});

verifyBasicStrategyInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.checked);
});


penetrationPercentValue.textContent = penetrationPercentInput.value;
penetrationPercentInput.addEventListener('input', e => {
    localStorage.setItem(e.target.id, e.target.value);
    penetrationPercentValue.textContent = Number(e.target.value).toFixed(0);
});