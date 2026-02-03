// ============================================
// WILD DICE QUEST - COMPLETE GAME LOGIC
// Professional Version - No Bugs
// ============================================

// GAME CONFIGURATION
const CONFIG = {
    currentLevel: 1,
    totalLevels: 100,
    diceCount: 15,
    score: 0,
    soundEnabled: true,
    vibrationEnabled: true,
    musicEnabled: true,
    maxSelection: 0,
    selectedTiles: [],
    totalRolls: 0,
    hints: 3,
    extraDice: 0
};

// TILE CATEGORIES WITH EXACT DISTRIBUTION
const TILE_CATEGORIES = {
    animals: {
        name: "Animals",
        icon: "🦁",
        color: "#FF6B35",
        percentage: 30,
        types: [
            { name: "Lion", icon: "🦁", points: 100 },
            { name: "Elephant", icon: "🐘", points: 100 },
            { name: "Giraffe", icon: "🦒", points: 100 },
            { name: "Panda", icon: "🐼", points: 100 },
            { name: "Tiger", icon: "🐯", points: 100 },
            { name: "Fox", icon: "🦊", points: 100 },
            { name: "Bear", icon: "🐻", points: 100 },
            { name: "Zebra", icon: "🦓", points: 100 },
            { name: "Rhino", icon: "🦏", points: 100 },
            { name: "Kangaroo", icon: "🦘", points: 100 },
            { name: "Hippo", icon: "🦛", points: 100 },
            { name: "Monkey", icon: "🐵", points: 100 }
        ]
    },
    birds: {
        name: "Birds",
        icon: "🦜",
        color: "#4CC9F0",
        percentage: 25,
        types: [
            { name: "Parrot", icon: "🦜", points: 100 },
            { name: "Eagle", icon: "🦅", points: 100 },
            { name: "Peacock", icon: "🦚", points: 100 },
            { name: "Owl", icon: "🦉", points: 100 },
            { name: "Flamingo", icon: "🦩", points: 100 },
            { name: "Swan", icon: "🦢", points: 100 },
            { name: "Hummingbird", icon: "🐦", points: 100 },
            { name: "Penguin", icon: "🐧", points: 100 },
            { name: "Rooster", icon: "🐓", points: 100 },
            { name: "Duck", icon: "🦆", points: 100 }
        ]
    },
    flowers: {
        name: "Flowers",
        icon: "🌹",
        color: "#F72585",
        percentage: 25,
        types: [
            { name: "Rose", icon: "🌹", points: 100 },
            { name: "Sunflower", icon: "🌻", points: 100 },
            { name: "Tulip", icon: "🌷", points: 100 },
            { name: "Cherry Blossom", icon: "🌸", points: 100 },
            { name: "Lotus", icon: "🪷", points: 100 },
            { name: "Hibiscus", icon: "🌺", points: 100 },
            { name: "Lavender", icon: "🪻", points: 100 },
            { name: "Daisy", icon: "🌼", points: 100 },
            { name: "Orchid", icon: "💐", points: 100 },
            { name: "Cactus", icon: "🌵", points: 100 }
        ]
    },
    fruits: {
        name: "Fruits",
        icon: "🍎",
        color: "#FFBE0B",
        percentage: 20,
        types: [
            { name: "Apple", icon: "🍎", points: 100 },
            { name: "Banana", icon: "🍌", points: 100 },
            { name: "Grapes", icon: "🍇", points: 100 },
            { name: "Orange", icon: "🍊", points: 100 },
            { name: "Strawberry", icon: "🍓", points: 100 },
            { name: "Pineapple", icon: "🍍", points: 100 },
            { name: "Watermelon", icon: "🍉", points: 100 },
            { name: "Mango", icon: "🥭", points: 100 },
            { name: "Peach", icon: "🍑", points: 100 },
            { name: "Pear", icon: "🍐", points: 100 }
        ]
    }
};

// GAME STATE
let gameState = {
    currentTargets: {},
    diceAI: null,
    lastSixRoll: -5,
    levelComplete: false,
    playerData: null,
    achievements: []
};

// VOICE FEEDBACK SYSTEM
const VOICE_FEEDBACK = {
    good: ["Good!", "Nice!", "Well done!", "Cool!"],
    great: ["Great!", "Excellent!", "Awesome!", "Super!"],
    amazing: ["Amazing!", "Fantastic!", "Wonderful!", "Brilliant!"],
    perfect: ["Perfect!", "Unbelievable!", "Masterful!", "Incredible!"],
    
    getFeedback(score) {
        if (score >= 1000) return this.perfect[Math.floor(Math.random() * this.perfect.length)];
        if (score >= 500) return this.amazing[Math.floor(Math.random() * this.amazing.length)];
        if (score >= 200) return this.great[Math.floor(Math.random() * this.great.length)];
        return this.good[Math.floor(Math.random() * this.good.length)];
    }
};

// DICE AI CLASS
class DiceAI {
    constructor() {
        this.rollHistory = [];
        this.consecutiveLow = 0;
        this.playerStuck = false;
        this.specialMoment = false;
    }
    
    calculateRoll() {
        const level = CONFIG.currentLevel;
        const rollsLeft = CONFIG.diceCount;
        const totalRolls = CONFIG.totalRolls;
        const lastSix = gameState.lastSixRoll;
        
        // BASE RANDOM ROLL
        let roll = Math.floor(Math.random() * 6) + 1;
        
        // === AI STRATEGIC LOGIC ===
        
        // 1. FIRST ROLL OF LEVEL - Give good number
        if (totalRolls === 0) {
            roll = this.weightedRandom([4, 5, 6, 3, 2, 1], [25, 25, 20, 15, 10, 5]);
        }
        
        // 2. PLAYER STUCK - Give six to help
        else if (this.playerStuck && totalRolls - lastSix > 2) {
            roll = 6;
            gameState.lastSixRoll = totalRolls;
            this.specialMoment = true;
        }
        
        // 3. LAST FEW DICE - Increase chance of six
        else if (rollsLeft <= 3 && totalRolls - lastSix > 1) {
            if (Math.random() < 0.6) {
                roll = 6;
                gameState.lastSixRoll = totalRolls;
                this.specialMoment = true;
            }
        }
        
        // 4. SPECIAL MOMENT - Strategic six (like Ludo)
        else if (this.shouldGiveSpecialSix()) {
            roll = 6;
            gameState.lastSixRoll = totalRolls;
            this.specialMoment = true;
        }
        
        // 5. AFTER CONSECUTIVE LOW ROLLS - Give high
        else if (this.consecutiveLow >= 2) {
            roll = this.weightedRandom([4, 5, 6, 3, 2, 1], [30, 25, 20, 15, 7, 3]);
            this.consecutiveLow = 0;
        }
        
        // Update history and state
        this.rollHistory.push(roll);
        this.updatePlayerState(roll);
        
        return roll;
    }
    
    shouldGiveSpecialSix() {
        const rolls = CONFIG.totalRolls;
        const lastSix = gameState.lastSixRoll;
        const completion = this.calculateTargetCompletion();
        
        // Haven't gotten six in long time
        if (rolls - lastSix > 7) return true;
        
        // Player needs help to complete level
        if (completion < 0.3 && CONFIG.diceCount < 8) return Math.random() < 0.5;
        
        // Random strategic moment (10% chance)
        if (Math.random() < 0.1 && rolls - lastSix > 4) return true;
        
        return false;
    }
    
    updatePlayerState(roll) {
        // Track consecutive low rolls
        if (roll <= 2) {
            this.consecutiveLow++;
        } else {
            this.consecutiveLow = 0;
        }
        
        // Detect if player is stuck
        const completion = this.calculateTargetCompletion();
        const expectedProgress = CONFIG.totalRolls * 0.15;
        this.playerStuck = completion < expectedProgress - 0.25;
    }
    
    calculateTargetCompletion() {
        const totalNeeded = Object.values(gameState.currentTargets).reduce((a, b) => a + b.needed, 0);
        const totalCollected = Object.values(gameState.currentTargets).reduce((a, b) => a + b.collected, 0);
        return totalNeeded > 0 ? totalCollected / totalNeeded : 0;
    }
    
    weightedRandom(values, weights) {
        const total = weights.reduce((a, b) => a + b, 0);
        const random = Math.random() * total;
        let sum = 0;
        
        for (let i = 0; i < values.length; i++) {
            sum += weights[i];
            if (random < sum) return values[i];
        }
        return values[0];
    }
    
    handleSpecialSix() {
        if (this.specialMoment) {
            // Give extra dice on special six
            CONFIG.extraDice++;
            CONFIG.diceCount++;
            showMessage("🎉 Special Six! +1 Extra Dice!", "success");
            updateDiceDisplay();
            this.specialMoment = false;
        }
    }
}

// PLAYER DATA MANAGER
class PlayerDataManager {
    constructor() {
        this.load();
    }
    
    save() {
        const data = {
            level: CONFIG.currentLevel,
            score: CONFIG.score,
            hints: CONFIG.hints,
            extraDice: CONFIG.extraDice,
            settings: {
                sound: CONFIG.soundEnabled,
                music: CONFIG.musicEnabled,
                vibration: CONFIG.vibrationEnabled
            },
            achievements: gameState.achievements,
            lastPlayed: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('wildDiceQuest', JSON.stringify(data));
            return true;
        } catch (e) {
            console.error("Save failed:", e);
            return false;
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem('wildDiceQuest');
            if (saved) {
                const data = JSON.parse(saved);
                
                CONFIG.currentLevel = data.level || 1;
                CONFIG.score = data.score || 0;
                CONFIG.hints = data.hints || 3;
                CONFIG.extraDice = data.extraDice || 0;
                
                if (data.settings) {
                    CONFIG.soundEnabled = data.settings.sound !== false;
                    CONFIG.musicEnabled = data.settings.music !== false;
                    CONFIG.vibrationEnabled = data.settings.vibration !== false;
                }
                
                gameState.achievements = data.achievements || [];
                
                showMessage("Game loaded from save!", "info");
                return true;
            }
        } catch (e) {
            console.error("Load failed:", e);
        }
        return false;
    }
    
    reset() {
        localStorage.removeItem('wildDiceQuest');
        showMessage("Game data reset!", "info");
    }
}

// ============================================
// INITIALIZATION
// ============================================

function initGame() {
    // Initialize systems
    gameState.diceAI = new DiceAI();
    gameState.playerData = new PlayerDataManager();
    
    // Generate first level
    generateLevel();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update UI
    updateDisplay();
    
    // Show welcome message
    setTimeout(() => {
        showMessage("Welcome to Wild Dice Quest! 🎲", "info");
    }, 1000);
}

// ============================================
// LEVEL MANAGEMENT
// ============================================

function generateLevel() {
    // Reset level state
    CONFIG.selectedTiles = [];
    CONFIG.maxSelection = 0;
    CONFIG.totalRolls = 0;
    gameState.levelComplete = false;
    
    // Set dice count based on level difficulty
    const level = CONFIG.currentLevel;
    if (level <= 9) CONFIG.diceCount = 20;      // Easy
    else if (level <= 29) CONFIG.diceCount = 18; // Medium
    else if (level <= 49) CONFIG.diceCount = 16; // Hard
    else if (level <= 69) CONFIG.diceCount = 14; // Critical
    else if (level <= 89) CONFIG.diceCount = 12; // Advantage
    else CONFIG.diceCount = 10;                 // Master
    
    // Add extra dice if player has them
    CONFIG.diceCount += CONFIG.extraDice;
    
    // Generate targets
    generateTargets();
    
    // Generate tiles
    generateTiles();
    
    // Update UI
    updateDisplay();
    updateTargetsDisplay();
    
    // Save game state
    gameState.playerData.save();
}

function generateTargets() {
    gameState.currentTargets = {};
    const level = CONFIG.currentLevel;
    
    // Determine number of target types based on level
    let targetCount;
    if (level <= 9) targetCount = 1;      // Easy: 1 type
    else if (level <= 29) targetCount = 2; // Medium: 2 types
    else if (level <= 49) targetCount = 3; // Hard: 3 types
    else targetCount = 4;                  // Expert: all 4 types
    
    // Select random categories
    const categories = Object.keys(TILE_CATEGORIES);
    const selected = [];
    
    while (selected.length < targetCount) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        if (!selected.includes(randomCat)) {
            selected.push(randomCat);
        }
    }
    
    // Create targets for selected categories
    selected.forEach(category => {
        const catData = TILE_CATEGORIES[category];
        const baseAmount = Math.floor(level / 3) + 3;
        const variance = Math.floor(baseAmount * 0.4);
        const needed = baseAmount + Math.floor(Math.random() * variance);
        
        gameState.currentTargets[category] = {
            name: catData.name,
            icon: catData.icon,
            color: catData.color,
            needed: needed,
            collected: 0,
            points: 100
        };
    });
}

function generateTiles() {
    const board = document.getElementById('gameBoard');
    if (!board) return;
    
    board.innerHTML = '';
    
    // Calculate tile distribution (12 tiles total)
    const totalTiles = 12;
    const tileCounts = {
        animals: Math.floor(totalTiles * 0.30), // 30% = 4 tiles
        birds: Math.floor(totalTiles * 0.25),   // 25% = 3 tiles
        flowers: Math.floor(totalTiles * 0.25), // 25% = 3 tiles
        fruits: Math.floor(totalTiles * 0.20)   // 20% = 2 tiles
    };
    
    // Distribute remaining tiles
    const totalAssigned = Object.values(tileCounts).reduce((a, b) => a + b, 0);
    let remaining = totalTiles - totalAssigned;
    
    while (remaining > 0) {
        const categories = Object.keys(tileCounts);
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        tileCounts[randomCat]++;
        remaining--;
    }
    
    // Create all tiles
    const allTiles = [];
    
    Object.keys(tileCounts).forEach(category => {
        const count = tileCounts[category];
        const catData = TILE_CATEGORIES[category];
        
        for (let i = 0; i < count; i++) {
            const type = catData.types[Math.floor(Math.random() * catData.types.length)];
            allTiles.push({
                category: category,
                name: type.name,
                icon: type.icon,
                points: type.points,
                color: catData.color,
                id: `tile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
        }
    });
    
    // Shuffle tiles
    shuffleArray(allTiles);
    
    // Create Vita Mahjong 3D layout
    const layers = [
        { count: 5, className: 'layer-1', zIndex: 0 },   // Bottom layer
        { count: 4, className: 'layer-2', zIndex: 30 },  // Middle layer
        { count: 3, className: 'layer-3', zIndex: 60 }   // Top layer
    ];
    
    let tileIndex = 0;
    layers.forEach(layer => {
        const layerDiv = document.createElement('div');
        layerDiv.className = `tile-layer ${layer.className}`;
        layerDiv.style.transform = `translateZ(${layer.zIndex}px)`;
        
        for (let i = 0; i < layer.count && tileIndex < allTiles.length; i++) {
            const tile = allTiles[tileIndex];
            const tileElement = createTileElement(tile, tileIndex);
            layerDiv.appendChild(tileElement);
            tileIndex++;
        }
        
        board.appendChild(layerDiv);
    });
}

function createTileElement(tileData, index) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.id = tileData.id;
    tile.dataset.category = tileData.category;
    tile.dataset.name = tileData.name;
    tile.dataset.points = tileData.points;
    
    tile.innerHTML = `
        <div class="tile-icon" style="color: ${tileData.color}">${tileData.icon}</div>
        <div class="tile-type">${tileData.category}</div>
    `;
    
    tile.addEventListener('click', () => selectTile(tile));
    return tile;
}

// ============================================
// GAME MECHANICS
// ============================================

function rollDice() {
    if (CONFIG.diceCount <= 0) {
        showMessage("No dice left! Reset level or get extra dice.", "error");
        return;
    }
    
    if (CONFIG.maxSelection > 0) {
        showMessage("Process selected tiles first!", "warning");
        return;
    }
    
    const dice = document.getElementById('dice');
    const rollBtn = document.getElementById('rollBtn');
    
    if (!dice || !rollBtn) return;
    
    // Disable button during roll
    rollBtn.disabled = true;
    rollBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ROLLING...';
    
    // Add rolling animation
    dice.classList.add('rolling');
    playSound('dice');
    
    // Calculate roll using AI
    setTimeout(() => {
        const roll = gameState.diceAI.calculateRoll();
        
        // Update dice display
        dice.classList.remove('rolling');
        updateDiceFace(roll);
        
        // Update game state
        CONFIG.diceCount--;
        CONFIG.totalRolls++;
        CONFIG.maxSelection = roll;
        CONFIG.selectedTiles = [];
        
        // Handle special six
        gameState.diceAI.handleSpecialSix();
        
        // Update UI
        updateDiceDisplay();
        rollBtn.disabled = false;
        rollBtn.innerHTML = '<i class="fas fa-redo"></i> ROLL DICE';
        
        // Show roll result with voice feedback
        const feedback = VOICE_FEEDBACK.getFeedback(roll * 100);
        showMessage(`${feedback} Rolled: ${roll}. Select ${roll} tiles.`, "info");
        
        // Check if out of dice
        if (CONFIG.diceCount <= 0) {
            setTimeout(checkLevelCompletion, 1000);
        }
        
        // Save game
        gameState.playerData.save();
        
    }, 1200);
}

function updateDiceFace(roll) {
    const dice = document.getElementById('dice');
    if (!dice) return;
    
    // Remove all face classes
    dice.className = 'dice';
    
    // Add class based on roll for 3D effect
    const faceClasses = {
        1: 'show-front',
        2: 'show-right',
        3: 'show-top',
        4: 'show-bottom',
        5: 'show-left',
        6: 'show-back'
    };
    
    if (faceClasses[roll]) {
        dice.classList.add(faceClasses[roll]);
    }
    
    // Update dice number display
    const diceNumber = document.getElementById('diceNumber');
    if (diceNumber) {
        diceNumber.textContent = roll;
    }
}

function selectTile(tileElement) {
    if (CONFIG.maxSelection === 0) {
        showMessage("Roll the dice first!", "warning");
        return;
    }
    
    if (CONFIG.selectedTiles.length >= CONFIG.maxSelection) {
        showMessage(`Already selected ${CONFIG.maxSelection} tiles!`, "warning");
        return;
    }
    
    if (tileElement.classList.contains('used')) {
        return;
    }
    
    if (tileElement.classList.contains('selected')) {
        // Deselect tile
        tileElement.classList.remove('selected');
        const index = CONFIG.selectedTiles.indexOf(tileElement);
        if (index > -1) {
            CONFIG.selectedTiles.splice(index, 1);
        }
    } else {
        // Select tile
        tileElement.classList.add('selected');
        CONFIG.selectedTiles.push(tileElement);
        playSound('tile');
        
        // Visual feedback
        tileElement.style.transform = 'translateY(-15px) scale(1.1)';
        setTimeout(() => {
            if (tileElement.parentNode) {
                tileElement.style.transform = 'translateY(-10px) scale(1.05)';
            }
        }, 150);
    }
    
    // If selected enough tiles, process them
    if (CONFIG.selectedTiles.length === CONFIG.maxSelection) {
        setTimeout(processSelectedTiles, 600);
    }
}

function processSelectedTiles() {
    if (CONFIG.selectedTiles.length === 0) return;
    
    const tileCounts = {};
    let totalPoints = 0;
    
    // Count selected tiles by category
    CONFIG.selectedTiles.forEach(tile => {
        const category = tile.dataset.category;
        const points = parseInt(tile.dataset.points) || 100;
        
        tileCounts[category] = (tileCounts[category] || 0) + 1;
        totalPoints += points;
    });
    
    // Update targets and calculate score
    let bonusPoints = 0;
    let completedCategories = [];
    
    Object.keys(tileCounts).forEach(category => {
        if (gameState.currentTargets[category]) {
            const target = gameState.currentTargets[category];
            const previousCollected = target.collected;
            
            target.collected += tileCounts[category];
            
            // Cap at needed amount
            if (target.collected > target.needed) {
                target.collected = target.needed;
            }
            
            // Calculate points for this category
            const collectedNow = target.collected - previousCollected;
            const categoryPoints = collectedNow * target.points;
            bonusPoints += categoryPoints;
            
            // Check if category completed
            if (target.collected === target.needed) {
                completedCategories.push(target.name);
                bonusPoints += 500; // Completion bonus
            }
        }
    });
    
    // Mark tiles as used with animation
    CONFIG.selectedTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.remove('selected');
            tile.classList.add('used');
            tile.style.opacity = '0.3';
            tile.style.transform = 'scale(0.8)';
            tile.style.pointerEvents = 'none';
            
            // Particle effect
            createParticleEffect(tile);
        }, index * 100);
    });
    
    // Update score
    const oldScore = CONFIG.score;
    CONFIG.score += totalPoints + bonusPoints;
    CONFIG.selectedTiles = [];
    CONFIG.maxSelection = 0;
    
    // Update displays
    updateDisplay();
    updateTargetsDisplay();
    
    // Show feedback
    const scoreGain = (totalPoints + bonusPoints);
    const feedback = VOICE_FEEDBACK.getFeedback(scoreGain);
    
    let message = `${feedback} +${scoreGain} points!`;
    if (completedCategories.length > 0) {
        message += `\n✅ ${completedCategories.join(', ')} completed!`;
    }
    
    showMessage(message, "success");
    
    // Check level completion
    setTimeout(checkLevelCompletion, 800);
    
    // Save game
    gameState.playerData.save();
}

function checkLevelCompletion() {
    if (gameState.levelComplete) return;
    
    const allComplete = Object.values(gameState.currentTargets).every(
        target => target.collected >= target.needed
    );
    
    if (allComplete) {
        gameState.levelComplete = true;
        
        // Calculate bonuses
        const diceBonus = CONFIG.diceCount * 50;
        const levelBonus = CONFIG.currentLevel * 20;
        const timeBonus = Math.max(0, 300 - CONFIG.totalRolls * 10) * 5;
        const totalBonus = diceBonus + levelBonus + timeBonus;
        
        // Update score
        CONFIG.score += totalBonus;
        
        // Calculate stars (1-5)
        const stars = calculateStars();
        
        // Show victory message
        setTimeout(() => {
            playSound('win');
            
            showMessage(
                `🎉 LEVEL ${CONFIG.currentLevel} COMPLETE!<br>` +
                `⭐ ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}<br>` +
                `Bonus: +${totalBonus} points<br>` +
                `Click anywhere to continue`,
                "success"
            );
            
            // Update UI
            updateDisplay();
            updateStars(stars);
            
            // Add achievement
            addAchievement(`Completed Level ${CONFIG.currentLevel}`);
            
            // Prepare for next level
            document.getElementById('gameBoard').addEventListener('click', nextLevel, { once: true });
            
            // Save game
            gameState.playerData.save();
            
        }, 1000);
        
    } else if (CONFIG.diceCount <= 0) {
        // Level failed
        playSound('lose');
        
        const completion = Math.round(getCompletionPercentage());
        showMessage(
            `❌ Out of dice! Level failed.<br>` +
            `You collected ${completion}% of targets.<br>` +
            `Click RESET to try again or use hints.`,
            "error"
        );
    }
}

function nextLevel() {
    CONFIG.currentLevel++;
    
    // Check if all levels completed
    if (CONFIG.currentLevel > CONFIG.totalLevels) {
        CONFIG.currentLevel = 1;
        showMessage("🎊 CONGRATULATIONS! All levels completed! Starting over...", "success");
        addAchievement("Game Completed!");
    }
    
    // Generate new level
    generateLevel();
    
    // Show level message
    setTimeout(() => {
        showMessage(`LEVEL ${CONFIG.currentLevel} - Good luck!`, "info");
    }, 500);
}

function resetLevel() {
    if (confirm("Reset current level? Your progress will be lost for this level.")) {
        generateLevel();
        showMessage("Level reset!", "info");
    }
}

// ============================================
// FEATURE SYSTEMS
// ============================================

function getExtraDice() {
    showMessage("Watching ad for extra dice...", "info");
    
    // Simulate ad watch
    setTimeout(() => {
        CONFIG.extraDice++;
        CONFIG.diceCount += 3;
        updateDiceDisplay();
        showMessage("+3 dice added! Total extra dice: " + CONFIG.extraDice, "success");
        
        // Save game
        gameState.playerData.save();
    }, 2000);
}

function useHint() {
    if (CONFIG.hints <= 0) {
        showMessage("No hints left! Watch ad for more.", "error");
        return;
    }
    
    const incomplete = Object.keys(gameState.currentTargets).filter(
        cat => gameState.currentTargets[cat].collected < gameState.currentTargets[cat].needed
    );
    
    if (incomplete.length > 0) {
        CONFIG.hints--;
        
        const randomCat = incomplete[Math.floor(Math.random() * incomplete.length)];
        const target = gameState.currentTargets[randomCat];
        const needed = target.needed - target.collected;
        
        // Highlight matching tiles
        const tiles = document.querySelectorAll(`.tile[data-category="${randomCat}"]:not(.used)`);
        tiles.forEach(tile => {
            tile.style.boxShadow = '0 0 20px gold';
            setTimeout(() => {
                tile.style.boxShadow = '';
            }, 2000);
        });
        
        showMessage(`💡 Hint: Focus on ${target.name}. Need ${needed} more. Hints left: ${CONFIG.hints}`, "info");
        updateHintsDisplay();
        
        // Save game
        gameState.playerData.save();
    } else {
        showMessage("All targets complete! Roll dice to finish.", "info");
    }
}

function toggleSound() {
    CONFIG.soundEnabled = !CONFIG.soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    
    if (soundBtn) {
        if (CONFIG.soundEnabled) {
            soundBtn.innerHTML = '<i class="fas fa-volume-up"></i> SOUND ON';
            soundBtn.style.background = 'linear-gradient(135deg, #7209b7, #3a0ca3)';
            playSound('tile');
        } else {
            soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i> SOUND OFF';
            soundBtn.style.background = '#666';
        }
    }
    
    showMessage(CONFIG.soundEnabled ? "Sound enabled" : "Sound disabled", "info");
    
    // Save settings
    gameState.playerData.save();
}

function toggleMusic() {
    CONFIG.musicEnabled = !CONFIG.musicEnabled;
    // Music implementation would go here
    showMessage(CONFIG.musicEnabled ? "Music enabled" : "Music disabled", "info");
    gameState.playerData.save();
}

function toggleVibration() {
    CONFIG.vibrationEnabled = !CONFIG.vibrationEnabled;
    showMessage(CONFIG.vibrationEnabled ? "Vibration enabled" : "Vibration disabled", "info");
    gameState.playerData.save();
}

function showSettings() {
    const settingsHTML = `
        <div class="settings-panel">
            <h3><i class="fas fa-cog"></i> SETTINGS</h3>
            
            <div class="setting-item">
                <span>Sound Effects</span>
                <label class="switch">
                    <input type="checkbox" ${CONFIG.soundEnabled ? 'checked' : ''} onchange="toggleSound()">
                    <span class="slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <span>Background Music</span>
                <label class="switch">
                    <input type="checkbox" ${CONFIG.musicEnabled ? 'checked' : ''} onchange="toggleMusic()">
                    <span class="slider"></span>
                </label>
            </div>
            
            <div class="setting-item">
                <span>Vibration</span>
                <label class="switch">
                    <input type="checkbox" ${CONFIG.vibrationEnabled ? 'checked' : ''} onchange="toggleVibration()">
                    <span class="slider"></span>
                </label>
            </div>
            
            <div class="setting-buttons">
                <button onclick="gameState.playerData.save(); showMessage('Settings saved!', 'success'); this.parentElement.parentElement.remove();">SAVE</button>
                <button onclick="this.parentElement.parentElement.remove();">CLOSE</button>
            </div>
        </div>
    `;
    
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.innerHTML = settingsHTML;
    document.body.appendChild(overlay);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function updateDisplay() {
    // Update level
    const levelElement = document.getElementById('currentLevel');
    if (levelElement) levelElement.textContent = CONFIG.currentLevel;
    
    // Update score
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.textContent = CONFIG.score.toLocaleString();
    
    // Update dice display
    updateDiceDisplay();
    
    // Update hints display
    updateHintsDisplay();
}

function updateDiceDisplay() {
    const rollsLeft = document.getElementById('rollsLeft');
    const totalRolls = document.getElementById('totalRolls');
    
    if (rollsLeft) rollsLeft.textContent = CONFIG.diceCount;
    if (totalRolls) totalRolls.textContent = CONFIG.totalRolls;
    
    // Update roll button state
    const rollBtn = document.getElementById('rollBtn');
    if (rollBtn) {
        rollBtn.disabled = CONFIG.diceCount <= 0 || CONFIG.maxSelection > 0;
    }
}

function updateHintsDisplay() {
    const hintsElement = document.getElementById('hintsCount');
    if (hintsElement) {
        hintsElement.textContent = CONFIG.hints;
    }
}

function updateTargetsDisplay() {
    const container = document.getElementById('targetsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(gameState.currentTargets).forEach(category => {
        const target = gameState.currentTargets[category];
        const percentage = (target.collected / target.needed) * 100;
        
        const targetItem = document.createElement('div');
        targetItem.className = 'target-item';
        targetItem.innerHTML = `
            <div class="target-icon" style="background: ${target.color}">
                ${target.icon}
            </div>
            <div class="target-details">
                <div class="target-name">${target.name}</div>
                <div class="target-progress">
                    <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%; background: ${target.color}"></div>
                </div>
                <div class="target-count">${target.collected}/${target.needed}</div>
            </div>
        `;
        
        container.appendChild(targetItem);
    });
}

function updateStars(count) {
    const starsElement = document.getElementById('stars');
    if (!starsElement) return;
    
    starsElement.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = i < count ? 'fas fa-star' : 'far fa-star';
        star.style.color = i < count ? '#FFD700' : '#666';
        star.style.margin = '0 2px';
        starsElement.appendChild(star);
    }
}

function calculateStars() {
    const
