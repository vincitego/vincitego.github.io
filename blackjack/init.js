if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./serviceWorker.js").catch(err => {
        console.error("Service Worker failed to register");
        console.error(err.stack);
    });
}


const appStatus = {
    isOnline: true
}

window.addEventListener('online', () => appStatus.isOnline = true);
window.addEventListener('offline', () => appStatus.isOnline = false);


if (!localStorage.getItem('countingNumShown')) localStorage.setItem('countingNumShown', 2);
if (!localStorage.getItem('countingSystem')) localStorage.setItem('countingSystem', 'Knockout');
if (!localStorage.getItem('numDecks')) localStorage.setItem('numDecks', 2);
if (!localStorage.getItem('penetrationPercent')) localStorage.setItem('penetrationPercent', 70);
if (!localStorage.getItem('dealerHitSoft17')) localStorage.setItem('dealerHitSoft17', true);
if (!localStorage.getItem('doubleAllowed')) localStorage.setItem('doubleAllowed', 'Any 2');
if (!localStorage.getItem('doubleAfterSplit')) localStorage.setItem('doubleAfterSplit', true);
if (!localStorage.getItem('surrenderAllowed')) localStorage.setItem('surrenderAllowed', true);
if (!localStorage.getItem('only1CardForSplitAces')) localStorage.setItem('only1CardForSplitAces', true);
if (!localStorage.getItem('verifyBasicStrategy')) localStorage.setItem('verifyBasicStrategy', true);
if (!localStorage.getItem('lifetimeWinnings')) localStorage.setItem('lifetimeWinnings', 0);

const countingNumShown = Number(localStorage.getItem('countingNumShown'));
const countingSystem = localStorage.getItem('countingSystem');
const numDecks = Number(localStorage.getItem('numDecks'));
const penetrationPercent = Number(localStorage.getItem('penetrationPercent'));
const dealerHitSoft17 = JSON.parse(localStorage.getItem('dealerHitSoft17'));
const surrenderAllowed = JSON.parse(localStorage.getItem('surrenderAllowed'));
const doubleAllowed = localStorage.getItem('doubleAllowed');
const doubleAfterSplit = JSON.parse(localStorage.getItem('doubleAfterSplit'));
const only1CardForSplitAces = JSON.parse(localStorage.getItem('only1CardForSplitAces'));
const verifyBasicStrategy = JSON.parse(localStorage.getItem('verifyBasicStrategy'));
const lifetimeWinnings = Number(localStorage.getItem('lifetimeWinnings'));


const suits = ['♠', '♥', '♣', '♦'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const rankValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
const rankValueMap = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11};

const countingSystems = {
	'Knockout': {
        name: 'Knockout',
        description: 'Knockout is an unbalanced level 1 count created by Olaf Vancura and Ken Fuchs. This is a slightly simplified Knockout system I found that has easier to remember indexes.',
        countValues: [1, 1, 1, 1, 1, 1, 0, 0, -1, -1],
        startingCount: { 1: 0, 2: -4, 4: -12, 6: -20, 8: -28 },
        bettingRamps: {
            1: { start: 2, units: [1, 2, 4, 5] },
            2: { start: 0, units: [1, 2, 3, 5, 6] },
            4: { start: -3, units: [1, 2, 3, 5, 6, 8, 10] },
            6: { start: -5, units: [1, 2, 3, 4, 6, 8, 10, 12] },
            8: { start: -6, units: [1, 2, 3, 6, 8, 8, 10, 12] },
        },
        indexes: [
            { description: '16v10', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '11vA', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '13v2', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '13v3', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '12v4', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '12v5', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: '12v6', counts: { 1: 2, 2: 0, 4: -3, 6: -6, 8: -10 } },
            { description: 'Insurance', counts: { 1: 3, 2: 3, 4: 3, 6: 3, 8: 3 } },
            { description: '15v10', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '12v2', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '12v3', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '10v10', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '10vA', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '9v2', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '9v7', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '8v5', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
            { description: '8v6', counts: { 1: 4, 2: 4, 4: 4, 6: 4, 8: 4 } },
        ]
    },

    'Hi-Lo': {
        name: 'Hi-Lo',
        description: 'Hi-Lo is the most popular counting system. It is a balanced level 1 count. Unfinished, need to complete.',
        countValues: [1, 1, 1, 1, 1, 0, 0, 0, -1, -1],
        startingCount: { 1: 0, 2: 0, 4: 0, 6: 0, 8: 0 },
        bettingRamps: {
            1: { start: 0, units: [1] },
            2: { start: 0, units: [1] },
            4: { start: 0, units: [1] },
            6: { start: 0, units: [1] },
            8: { start: 0, units: [1] },
        },
        indexes: []
    }
};


// basic strategy key: numDecks,dealerHitSoft17,doubleAfterSplit
const basicStrategies = {
    '1,true,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['DH', 'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H'],
            4:   ['H',  'H',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'RS', 'RH'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'P'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '1,true,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['DH', 'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'RS', 'RH'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '1,false,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['DH', 'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'S'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H'],
            4:   ['H',  'H',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'RS', 'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '1,false,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['DH', 'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'S'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'RS', 'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    
    '2,true,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['DS', 'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'RP'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '2,true,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['DS', 'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'RP'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '2,false,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '2,false,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H', 'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H', 'H'],
            4:   ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H', 'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H', 'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H', 'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H', 'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P', 'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S', 'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S', 'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P', 'P']
        }
    },

    '4,true,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['H',  'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'RH', 'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['DS', 'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'RP'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '4,true,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['H',  'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'RH'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'RH', 'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'RS'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['DS', 'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'DS', 'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'RP'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '4,false,true': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['H',  'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'RH', 'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
    '4,false,false': {
        hard: {
            5:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            6:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            7:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            8:  ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            9:  ['H',  'DH', 'DH', 'DH', 'DH', 'H',  'H',  'H',  'H',  'H'],
            10: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            11: ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H'],
            12: ['H',  'H',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            13: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            14: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'H',  'H'],
            15: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'H',  'RH', 'H'],
            16: ['S',  'S',  'S',  'S',  'S',  'H',  'H',  'RH', 'RH', 'RH'],
            17: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            18: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            19: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S']
        },
        soft: {
            13: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            14: ['H',  'H',  'H',  'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            15: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            16: ['H',  'H',  'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            17: ['H',  'DH', 'DH', 'DH', 'DH', 'H', 'H', 'H', 'H', 'H'],
            18: ['S',  'DS', 'DS', 'DS', 'DS', 'S', 'S', 'H', 'H', 'H'],
            19: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            20: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S'],
            21: ['S',  'S',  'S',  'S',  'S',  'S', 'S', 'S', 'S', 'S']
        },
        pair: {
            2:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            3:   ['H',  'H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            4:   ['H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H',  'H'],
            5:   ['DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'DH', 'H',  'H'],
            6:   ['H',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H',  'H'],
            7:   ['P',  'P',  'P',  'P',  'P',  'P',  'H',  'H',  'H',  'H'],
            8:   ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P'],
            9:   ['P',  'P',  'P',  'P',  'P',  'S',  'P',  'P',  'S',  'S'],
            10:  ['S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S',  'S'],
            'A': ['P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P',  'P']
        }
    },
};


export { 
    countingNumShown, countingSystem, numDecks, penetrationPercent, 
    rankValueMap, dealerHitSoft17, doubleAllowed, doubleAfterSplit, surrenderAllowed,
    only1CardForSplitAces, verifyBasicStrategy, lifetimeWinnings,
    appStatus, suits, ranks, rankValues, countingSystems, basicStrategies
};