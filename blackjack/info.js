import { countingSystems, rankValues, countingSystem, numDecks, dealerHitSoft17, doubleAfterSplit, basicStrategies } from './init.js';


const countingSystemInput = document.getElementById('countingSystem');
const numDecksInput = document.getElementById('numDecks');
const dealerHitSoft17Input = document.getElementById('dealerHitSoft17');
const doubleAfterSplitInput = document.getElementById('doubleAfterSplit');

countingSystemInput.value = countingSystem;
numDecksInput.value = Math.min(numDecks, 4);
dealerHitSoft17Input.checked = dealerHitSoft17;
doubleAfterSplitInput.checked = doubleAfterSplit;

countingSystemInput.addEventListener('change', () => {
    updateCountingSystem(countingSystemInput.value, numDecksInput.value);
});

numDecksInput.addEventListener('change', () => {
    updateCountingSystem(countingSystemInput.value, numDecksInput.value);
    updateBasicStrategy(numDecksInput.value, dealerHitSoft17Input.checked, doubleAfterSplitInput.checked);
});

dealerHitSoft17Input.addEventListener('input', () => {
    updateBasicStrategy(numDecksInput.value, dealerHitSoft17Input.checked, doubleAfterSplitInput.checked);
});

doubleAfterSplitInput.addEventListener('input', () => {
    updateBasicStrategy(numDecksInput.value, dealerHitSoft17Input.checked, doubleAfterSplitInput.checked);
});



updateCountingSystem(countingSystem, numDecks);
updateBasicStrategy(numDecks, dealerHitSoft17, doubleAfterSplit)


function updateCountingSystem(countingSystem, numDecks) {
    const countingSystemNameDiv = document.getElementById('countingSystemName');
    const rampCountsDiv = document.getElementById('rampCounts');
    const rampUnitsDiv = document.getElementById('rampUnits');
    const indexesDiv = document.getElementById('indexes');
    const countingSystemDescriptionDiv = document.getElementById('countingSystemDescription');
    const countingSystemObj = countingSystems[countingSystem];

    countingSystemNameDiv.textContent = countingSystemObj.name;
    countingSystemDescriptionDiv.textContent = `${countingSystemObj.description} Count for ${numDecks} deck${numDecks === 1 ? '' : 's'} starts at ${countingSystemObj.startingCount[numDecks]}.`;

    rankValues.forEach((rank, i) => {
        document.getElementById('countingValue' + rank).textContent = countingSystemObj.countValues[i];
    });


    [...rampCountsDiv.children].slice(2).forEach(child => child.remove());
    [...rampUnitsDiv.children].slice(2).forEach(child => child.remove());
    [...indexesDiv.children].forEach(child => child.remove());


    const bettingRamp = countingSystemObj.bettingRamps[numDecks];

    bettingRamp.units.forEach((unit, i) => {
        const countDiv = document.createElement('div');
        countDiv.textContent = bettingRamp.start + i;
        countDiv.className = 'col-xs-1 col-s-1 col-1 table-cell';
        rampCountsDiv.append(countDiv);
        
        const unitDiv = document.createElement('div');
        unitDiv.textContent = unit + i;
        unitDiv.className = 'col-xs-1 col-s-1 col-1 table-cell';
        rampUnitsDiv.append(unitDiv);
    });


    const indexes = countingSystemObj.indexes;

    indexes.forEach(index => {
        const indexDiv = document.createElement('div');
        indexDiv.textContent = `${index.counts[numDecks]}: ${index.description}`;
        indexDiv.className = 'col-xs-6 col-s-3 col-2 table-cell';
        indexesDiv.append(indexDiv);
    });
}


function updateBasicStrategy(numDecks, dealerHitSoft17, doubleAfterSplit) {
    const basicStrategy = basicStrategies[`${Math.min(numDecks, 4)},${dealerHitSoft17},${doubleAfterSplit}`];

    for (const player of Object.keys(basicStrategy.hard)) {
        basicStrategy.hard[player].map((decision, index) => {
            const strategyNode = document.getElementById(`hard${player}v${rankValues[index]}`);
            if (strategyNode.textContent) strategyNode.classList.remove(strategyNode.textContent);
            strategyNode.textContent = decision;
            strategyNode.classList.add(decision);
        });
    }

    for (const player of Object.keys(basicStrategy.soft)) {
        basicStrategy.soft[player].map((decision, index) => {
            const strategyNode = document.getElementById(`soft${player}v${rankValues[index]}`);
            if (strategyNode.textContent) strategyNode.classList.remove(strategyNode.textContent);
            strategyNode.textContent = decision;
            strategyNode.classList.add(decision);
        });
    }

    for (const player of Object.keys(basicStrategy.pair)) {
        basicStrategy.pair[player].map((decision, index) => {
            const strategyNode = document.getElementById(`pair${player}v${rankValues[index]}`);
            if (strategyNode.textContent) strategyNode.classList.remove(strategyNode.textContent);
            strategyNode.textContent = decision;
            strategyNode.classList.add(decision);
        });
    }
}