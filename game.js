// ============================================
// PROFESSIONAL GAME CONFIGURATION
// ============================================
const CONFIG = {
    // Game Settings
    soundEnabled: true,
    musicEnabled: true,
    vibrationEnabled: false,
    notificationsEnabled: true,
    
    // Game State
    currentLevel: 1,
    totalLevels: 10,
    score: 0,
    diceCount: 10,
    totalRolls: 0,
    maxSelection: 0,
    selectedTiles: [],
    hints: 3,
    extraDice: 0,
    gameTime: 60,
    gameTimer: null,
    
    // Categories with professional images (using Font Awesome icons)
    categories: {
        animals: {
            name: "Animals",
            icon: "🐾",
            color: "#4361ee",
            points: 100,
            tiles: ["🐘", "🦁", "🐼", "🦊", "🐨", "🐯", "🦄", "🐬"]
        },
        birds: {
            name: "Birds",
            icon: "🦜",
            color: "#4cc9f0",
            points: 120,
            tiles: ["🦅", "🦚", "🦢", "🦜", "🦩", "🦉", "🐦", "🦆"]
        },
        fruits: {
            name: "Fruits",
            icon: "🍓",
            color: "#f72585",
            points: 80,
            tiles: ["🍎", "🍌", "🍇", "🍓", "🍉", "🍑", "🍒", "🥭"]
        },
        flowers: {
            name: "Flowers",
            icon: "🌸",
            color: "#06d6a0",
            points: 90,
            tiles: ["🌹", "🌺", "🌻", "🌸", "🌼", "💐", "🥀", "🪷"]
        },
        food: {
            name: "Food",
            icon: "🍕",
            color: "#ffd166",
            points: 70,
            tiles: ["🍕", "🍔", "🍩", "🍦", "🍫", "🧁", "🍭", "🍿"]
        },
        travel: {
            name: "Travel",
            icon: "✈️",
            color: "#7209b7",
            points: 110,
            tiles: ["✈️", "🚀", "🚗", "🚢", "🚂", "🏍️", "🚁", "🛶"]
        }
    }
};

// Game State Management
const gameState = {
    currentTargets: {},
    levelComplete: false,
    playerData: {
        save: function() {
            localStorage.setItem('tileMasterPro_save', JSON.stringify({
                level: CONFIG.currentLevel,
                score: CONFIG.score,
                dice: CONFIG.diceCount,
                hints: CONFIG.hints,
                extraDice: CONFIG.extraDice,
                settings: {
                    sound: CONFIG.soundEnabled,
                    music: CONFIG.musicEnabled,
                    vibration: CONFIG.vibrationEnabled
                }
            }));
        },
        load: function() {
            const saved = localStorage.getItem('tileMasterPro_save');
            if (saved) {
                const data = JSON.parse(saved);
                CONFIG.currentLevel = data.level || 1;
                CONFIG.score = data.score || 0;
                CONFIG.diceCount = data.dice || 10;
                CONFIG.hints = data.hints || 3;
                CONFIG.extraDice = data.extraDice || 0;
                
                if (data.settings) {
                    CONFIG.soundEnabled = data.settings.sound !== false;
                    CONFIG.musicEnabled = data.settings.music !== false;
                    CONFIG.vibrationEnabled = data.settings.vibration || false;
                }
            }
        },
        reset: function() {
            localStorage.removeItem('tileMasterPro_save');
            location.reload();
        }
    }
};

// Voice Feedback System
const VOICE_FEEDBACK = {
    messages: [
        { min: 0, max: 50, text: "Good start!" },
        { min: 51, max: 100, text: "Nice!" },
        { min: 101, max: 200, text: "Great!" },
        { min: 201, max: 300, text: "Excellent!" },
        { min: 301, max: 500, text: "Amazing!" },
        { min: 501, max: 1000, text: "Unbelievable!" },
        { min: 1001, max: Infinity, text: "FANTASTIC!" }
    ],
    
    getFeedback: function(points) {
        for (const msg of this.messages) {
            if (points >= msg.min && points <= msg.max) {
                return msg.text;
            }
        }
        return "Good!";
    }
};

// ============================================
// INITIALIZATION
// ============================================
window.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'flex';
        }, 500);
    }, 1500);
    
    // Load saved game
    gameState.playerData.load();
    
    // Initialize game
    initializeGame();
    
    // Set up event listeners
    setupEventListeners();
});

function initializeGame() {
    // Generate first level
    generateLevel();
    
    // Update displays
    updateDisplay();
    updateTargetsDisplay();
    
    // Update settings toggles
    document.getElementById('soundToggle').checked = CONFIG.soundEnabled;
    document.getElementById('musicToggle').checked = CONFIG.musicEnabled;
    document.getElementById('vibrationToggle').checked = CONFIG.vibrationEnabled;
    
    // Start game timer
    startGameTimer();
}

function setupEventListeners() {
    // Roll dice button
    document.getElementById('rollBtn').addEventListener('click', rollDice);
    
    // Hint button
    document.getElementById('hintBtn').addEventListener('click', useHint);
    
    // AD button for extra dice
    document.getElementById('adBtn').addEventListener('click', getExtraDice);
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetLevel);
    
    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', showSettings);
    
    // Achievements button
    document.getElementById('achievementsBtn').addEventListener('click', showAchievements);
    
    // Sound button
    document.getElementById('soundBtn').addEventListener('click', toggleSound);
    
    // Menu button
    document.getElementById('menuBtn').addEventListener('click', showQuickMenu);
    
    // Message close button
    document.getElementById('closeMessage')?.addEventListener('click', () => {
        document.getElementById('messageOverlay').classList.add('hidden');
    });
    
    // Settings panel buttons
    document.getElementById('saveSettings')?.addEventListener('click', saveSettings);
    document.getElementById('closeSettings')?.addEventListener('click', () => {
        document.getElementById('settingsPanel').classList.add('hidden');
    });
    
    // Achievements panel close
    document.getElementById('closeAchievements')?.addEventListener('click', () => {
        document.getElementById('achievementsPanel').classList.add('hidden');
    });
}

// ============================================
// GAME LOGIC - LEVEL GENERATION
// ============================================
function generateLevel() {
    gameState.levelComplete = false;
    CONFIG.selectedTiles = [];
    CONFIG.maxSelection = 0;
    
    // Clear previous board
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Reset timer
    CONFIG.gameTime = 60 + (CONFIG.currentLevel * 5);
    document.getElementById('gameTime').textContent = CONFIG.gameTime;
    
    // Generate targets for this level
    generateTargets();
    
    // Generate tiles in Vita Mahjong style (layered arrangement)
    generateTiles();
    
    // Update UI
    updateSelectedCount();
    updateStars(calculateStars());
}

function generateTargets() {
    gameState.currentTargets = {};
    
    // Select 3 random categories for this level
    const allCategories = Object.keys(CONFIG.categories);
    const selectedCats = [];
    
    for (let i = 0; i < 3; i++) {
        const randomCat = allCategories[Math.floor(Math.random() * allCategories.length)];
        if (!selectedCats.includes(randomCat)) {
            selectedCats.push(randomCat);
        }
    }
    
    // Create target objects
    selectedCats.forEach((category, index) => {
        const catData = CONFIG.categories[category];
        const needed = 3 + Math.floor(CONFIG.currentLevel / 2); // Increase with level
        
        gameState.currentTargets[category] = {
            name: catData.name,
            icon: catData.icon,
            color: catData.color,
            needed: needed,
            collected: 0,
            points: catData.points
        };
    });
}

function generateTiles() {
    const gameBoard = document.getElementById('gameBoard');
    const totalTiles = 12 + (CONFIG.currentLevel * 2); // More tiles in higher levels
    
    // Create layered effect (like Vita Mahjong)
    let layer = 1;
    let tilesInLayer = 0;
    const maxTilesPerLayer = 8;
    
    for (let i = 0; i < totalTiles; i++) {
        // Get random category from current targets
        const targetCats = Object.keys(gameState.currentTargets);
        const randomCat = targetCats[Math.floor(Math.random() * targetCats.length)];
        const catData = CONFIG.categories[randomCat];
        
        // Create tile element
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.category = randomCat;
        tile.dataset.points = catData.points;
        tile.dataset.layer = layer;
        
        // Random tile from category
        const tileIcon = catData.tiles[Math.floor(Math.random() * catData.tiles.length)];
        
        tile.innerHTML = `
            <div class="tile-icon">${tileIcon}</div>
            <div class="tile-name">${catData.name}</div>
            <div class="tile-points">${catData.points}</div>
        `;
        
        // Add Vita Mahjong style depth
        tile.style.zIndex = layer;
        tile.style.transform = `translateZ(${layer * 5}px)`;
        
        // Click event for tile selection
        tile.addEventListener('click', () => selectTile(tile));
        
        gameBoard.appendChild(tile);
        
        // Update layer tracking
        tilesInLayer++;
        if (tilesInLayer >= maxTilesPerLayer) {
            layer++;
            tilesInLayer = 0;
        }
    }
    
    // Add some locked tiles for challenge
    const allTiles = document.querySelectorAll('.tile');
    const lockedCount = Math.floor(totalTiles * 0.2); // 20% locked tiles
    
    for (let i = 0; i < lockedCount; i++) {
        const randomTile = allTiles[Math.floor(Math.random() * allTiles.length)];
        randomTile.classList.add('locked');
        randomTile.innerHTML = `
            <div class="tile-icon">🔒</div>
            <div class="tile-name">LOCKED</div>
        `;
        randomTile.onclick = null;
    }
}

// ============================================
// GAME LOGIC - CORE MECHANICS
// ============================================
function rollDice() {
    if (CONFIG.diceCount <= 0) {
        showMessage("No dice left! Watch ad to get more dice.", "error");
        return;
    }
    
    if (CONFIG.maxSelection > 0) {
        showMessage("Finish selecting tiles before rolling again!", "info");
        return;
    }
    
    // Deduct dice
    CONFIG.diceCount--;
    CONFIG.totalRolls++;
    
    // Roll animation
    playSound('diceRoll');
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = true;
    rollBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ROLLING...';
    
    // Random dice roll (1-6)
    setTimeout(() => {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        CONFIG.maxSelection = diceRoll;
        
        // Show dice result
        showMessage(`🎲 Dice Roll: ${diceRoll}<br>You can select ${diceRoll} tiles`, "success");
        
        // Update UI
        rollBtn.innerHTML = '<i class="fas fa-redo"></i> ROLL DICE';
        rollBtn.disabled = CONFIG.diceCount <= 0;
        updateSelectedCount();
        updateDisplay();
        
        // Save game
        gameState.playerData.save();
        
    }, 1000);
}

function selectTile(tile) {
    if (CONFIG.maxSelection <= 0) {
        showMessage("Roll the dice first to get selection count!", "info");
        return;
    }
    
    if (CONFIG.selectedTiles.length >= CONFIG.maxSelection) {
        showMessage(`You can only select ${CONFIG.maxSelection} tiles this turn!`, "error");
        return;
    }
    
    if (tile.classList.contains('used') || tile.classList.contains('locked')) {
        return;
    }
    
    if (CONFIG.selectedTiles.includes(tile)) {
        // Deselect tile
        const index = CONFIG.selectedTiles.indexOf(tile);
        CONFIG.selectedTiles.splice(index, 1);
        tile.classList.remove('selected');
        playSound('tile');
    } else {
        // Select tile
        CONFIG.selectedTiles.push(tile);
        tile.classList.add('selected');
        playSound('tile');
    }
    
    updateSelectedCount();
    
    // Auto-process when max selection reached
    if (CONFIG.selectedTiles.length === CONFIG.maxSelection) {
        setTimeout(processSelectedTiles, 800);
    }
}

function processSelectedTiles() {
    if (CONFIG.selectedTiles.length === 0) return;
    
    // Calculate points
    let totalPoints = 0;
    let categoryPoints = {};
    let completedCategories = [];
    
    CONFIG.selectedTiles.forEach(tile => {
        const category = tile.dataset.category;
        const points = parseInt(tile.dataset.points) || 100;
        
        totalPoints += points;
        
        if (!categoryPoints[category]) {
            categoryPoints[category] = 0;
        }
        categoryPoints[category] += points;
    });
    
    // Update targets
    let bonusPoints = 0;
    
    Object.keys(categoryPoints).forEach(category => {
        if (gameState.currentTargets[category]) {
            const target = gameState.currentTargets[category];
            const previousCollected = target.collected;
            
            // Each selected tile counts as 1 collection
            const tilesOfCategory = CONFIG.selectedTiles.filter(t => t.dataset.category === category).length;
            target.collected += tilesOfCategory;
            
            // Cap at needed amount
            if (target.collected > target.needed) {
                target.collected = target.needed;
            }
            
            // Calculate bonus points
            const collectedNow = target.collected - previousCollected;
            const categoryBonus = collectedNow * target.points;
            bonusPoints += categoryBonus;
            
            // Check completion
            if (target.collected >= target.needed) {
                if (!completedCategories.includes(target.name)) {
                    completedCategories.push(target.name);
                    bonusPoints += 500; // Completion bonus
                }
            }
        }
    });
    
    // Animate tile removal
    CONFIG.selectedTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.remove('selected');
            tile.classList.add('used');
            tile.style.transform = 'scale(0) rotate(180deg)';
            tile.style.opacity = '0';
            
            // Create particle effect
            createParticleEffect(tile);
            
        }, index * 150);
    });
    
    // Update score
    const oldScore = CONFIG.score;
    const pointsGained = totalPoints + bonusPoints;
    CONFIG.score += pointsGained;
    
    // Reset selection
    CONFIG.selectedTiles = [];
    CONFIG.maxSelection = 0;
    
    // Update displays
    updateDisplay();
    updateTargetsDisplay();
    updateSelectedCount();
    
    // Show feedback
    const feedback = VOICE_FEEDBACK.getFeedback(pointsGained);
    let message = `🎯 ${feedback} +${pointsGained} points!`;
    
    if (completedCategories.length > 0) {
        message += `<br>✅ ${completedCategories.join(', ')} completed!`;
        playSound('win');
    } else {
        playSound('success');
    }
    
    showMessage(message, "success");
    
    // Check level completion
    setTimeout(checkLevelCompletion, 1000);
    
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
        
        // Calculate level bonuses
        const diceBonus = CONFIG.diceCount * 50;
        const levelBonus = CONFIG.currentLevel * 100;
        const timeBonus = Math.max(0, CONFIG.gameTime) * 10;
        const totalBonus = diceBonus + levelBonus + timeBonus;
        
        // Add bonus to score
        CONFIG.score += totalBonus;
        
        // Calculate stars (based on performance)
        const stars = calculateStars();
        
        // Show victory screen
        setTimeout(() => {
            showMessage(
                `🏆 LEVEL ${CONFIG.currentLevel} COMPLETE!<br><br>` +
                `⭐ ${'★'.repeat(stars)}${'☆'.repeat(5-stars)}<br>` +
                `Bonus: +${totalBonus.toLocaleString()} points<br><br>` +
                `🎲 Dice remaining: ${CONFIG.diceCount}<br>` +
                `⏱️ Time bonus: +${timeBonus}<br><br>` +
                `Tap anywhere to continue`,
                "victory"
            );
            
            // Update UI
            updateDisplay();
            updateStars(stars);
            
            // Add achievement
            addAchievement(`Completed Level ${CONFIG.currentLevel}`);
            
            // Prepare for next level
            document.body.addEventListener('click', nextLevel, { once: true });
            
            // Save game
            gameState.playerData.save();
            
        }, 1500);
        
    } else if (CONFIG.diceCount <= 0) {
        // Game over - out of dice
        showMessage(
            `❌ OUT OF DICE!<br><br>` +
            `Progress: ${getCompletionPercentage()}%<br>` +
            `Watch ad for more dice or restart level.`,
            "error"
        );
    }
}

function nextLevel() {
    // Clear any existing message
    document.getElementById('messageOverlay').classList.add('hidden');
    
    // Increment level
    CONFIG.currentLevel++;
    
    // Check if game completed
    if (CONFIG.currentLevel > CONFIG.totalLevels) {
        showMessage(
            `🎊 CONGRATULATIONS!<br><br>` +
            `You've completed all ${CONFIG.totalLevels} levels!<br>` +
            `Final Score: ${CONFIG.score.toLocaleString()}<br><br>` +
            `Starting over with bonus points...`,
            "victory"
        );
        
        addAchievement("Game Master - Completed All Levels!");
        
        // Reset to level 1 with bonus
        setTimeout(() => {
            CONFIG.currentLevel = 1;
            CONFIG.score += 10000; // Completion bonus
            generateLevel();
        }, 3000);
    } else {
        // Generate next level
        generateLevel();
        
        // Show level intro
        setTimeout(() => {
            showMessage(`LEVEL ${CONFIG.currentLevel}<br>Good luck!`, "info");
        }, 500);
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function updateDisplay() {
    // Update level display
    document.getElementById('currentLevel').textContent = CONFIG.currentLevel;
    
    // Update score
    document.getElementById('score').textContent = CONFIG.score.toLocaleString();
    
    // Update dice count
    document.getElementById('rollsLeft').textContent = CONFIG.diceCount;
    document.getElementById('totalRolls').textContent = CONFIG.totalRolls;
    
    // Update roll button state
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = CONFIG.diceCount <= 0 || CONFIG.maxSelection > 0;
    
    // Update hints count
    document.getElementById('hintsCount').textContent = CONFIG.score.toLocaleString();
    
    // Update dice count
    document.getElementById('rollsLeft').textContent = CONFIG.diceCount;
    document.getElementById('totalRolls').textContent = CONFIG.totalRolls;
    
    // Update roll button state
    const rollBtn = document.getElementById('rollBtn');
    rollBtn.disabled = CONFIG.diceCount <= 0 || CONFIG.maxSelection > 0;
    
    // Update hints count
    document.getElementById('hintsCount').textContent = CONFIG.hints;
}

function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = CONFIG.selectedTiles.length;
    document.getElementById('maxSelect').textContent = CONFIG.maxSelection;
}

function updateTargetsDisplay() {
    const container = document.getElementById('targetsContainer');
    container.innerHTML = '';
    
    Object.keys(gameState.currentTargets).forEach(category => {
        const target = gameState.currentTargets[category];
        const percentage = Math.min((target.collected / target.needed) * 100, 100);
        
        const targetItem = document.createElement('div');
        targetItem.className = 'target-item';
        targetItem.innerHTML = `
            <div class="target-icon" style="background: ${target.color}">
                ${target.icon}
            </div>
            <div class="target-details">
                <div class="target-name">${target.name}</div>
                <div class="target-progress">
                    <div class="progress-bar" style="width: ${percentage}%; background: ${target.color}"></div>
                </div>
                <div class="target-count">${target.collected}/${target.needed}</div>
            </div>
        `;
        
        container.appendChild(targetItem);
    });
}

function updateStars(count) {
    const starsElement = document.getElementById('stars');
    starsElement.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.className = i < count ? 'fas fa-star' : 'far fa-star';
        star.style.color = i < count ? '#FFD700' : '#666';
        starsElement.appendChild(star);
    }
}

function calculateStars() {
    const completion = getCompletionPercentage();
    if (completion >= 90) return 5;
    if (completion >= 75) return 4;
    if (completion >= 60) return 3;
    if (completion >= 40) return 2;
    return 1;
}

function getCompletionPercentage() {
    if (Object.keys(gameState.currentTargets).length === 0) return 0;
    
    let totalCollected = 0;
    let totalNeeded = 0;
    
    Object.values(gameState.currentTargets).forEach(target => {
        totalCollected += target.collected;
        totalNeeded += target.needed;
    });
    
    return Math.round((totalCollected / totalNeeded) * 100);
}

// ============================================
// FEATURE FUNCTIONS
// ============================================
function useHint() {
    if (CONFIG.hints <= 0) {
        showMessage("No hints left! Watch ad to get more hints.", "info");
        return;
    }
    
    // Find incomplete targets
    const incomplete = Object.keys(gameState.currentTargets).filter(
        cat => gameState.currentTargets[cat].collected < gameState.currentTargets[cat].needed
    );
    
    if (incomplete.length === 0) {
        showMessage("All targets complete! Roll dice to finish.", "info");
        return;
    }
    
    CONFIG.hints--;
    playSound('hint');
    
    // Pick random incomplete target
    const randomCat = incomplete[Math.floor(Math.random() * incomplete.length)];
    const target = gameState.currentTargets[randomCat];
    const needed = target.needed - target.collected;
    
    // Highlight matching tiles
    const tiles = document.querySelectorAll(`.tile[data-category="${randomCat}"]:not(.used):not(.locked)`);
    
    if (tiles.length > 0) {
        tiles.forEach(tile => {
            tile.style.boxShadow = '0 0 25px gold, 0 0 50px rgba(255, 215, 0, 0.5)';
            tile.style.borderColor = 'gold';
            tile.style.zIndex = '100';
            
            setTimeout(() => {
                tile.style.boxShadow = '';
                tile.style.borderColor = '';
                tile.style.zIndex = '';
            }, 3000);
        });
        
        showMessage(`💡 Hint: Focus on ${target.name}. Need ${needed} more. Hints left: ${CONFIG.hints}`, "info");
    } else {
        showMessage(`💡 Hint: You need ${needed} more ${target.name}. No available tiles.`, "info");
    }
    
    updateDisplay();
    gameState.playerData.save();
}

function getExtraDice() {
    showMessage("Watching ad for extra dice...", "info");
    
    // Simulate ad view
    setTimeout(() => {
        CONFIG.diceCount += 5;
        CONFIG.extraDice++;
        
        // Add achievement
        addAchievement("Ad Watcher - Got bonus dice!");
        
        showMessage(
            `🎉 +5 DICE ADDED!<br>` +
            `Total dice: ${CONFIG.diceCount}<br>` +
            `Extra dice collected: ${CONFIG.extraDice}`,
            "success"
        );
        
        updateDisplay();
        gameState.playerData.save();
        
    }, 2000);
}

function resetLevel() {
    if (confirm("Reset current level? Your progress for this level will be lost.")) {
        generateLevel();
        showMessage("Level reset! Good luck!", "info");
        gameState.playerData.save();
    }
}

// ============================================
// SETTINGS & UI FUNCTIONS
// ============================================
function toggleSound() {
    CONFIG.soundEnabled = !CONFIG.soundEnabled;
    const soundBtn = document.getElementById('soundBtn');
    
    if (CONFIG.soundEnabled) {
        soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        soundBtn.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-dark))';
        playSound('tile');
    } else {
        soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        soundBtn.style.background = '#666';
    }
    
    showMessage(CONFIG.soundEnabled ? "Sound ON" : "Sound OFF", "info");
    gameState.playerData.save();
}

function showSettings() {
    document.getElementById('settingsPanel').classList.remove('hidden');
}

function saveSettings() {
    CONFIG.soundEnabled = document.getElementById('soundToggle').checked;
    CONFIG.musicEnabled = document.getElementById('musicToggle').checked;
    CONFIG.vibrationEnabled = document.getElementById('vibrationToggle').checked;
    
    showMessage("Settings saved!", "success");
    setTimeout(() => {
        document.getElementById('settingsPanel').classList.add('hidden');
    }, 1000);
    
    gameState.playerData.save();
}

function showAchievements() {
    const container = document.getElementById('achievementsList');
    container.innerHTML = '';
    
    // Sample achievements (in real game, load from save)
    const achievements = [
        { icon: "🥇", title: "First Level", desc: "Complete level 1", date: "Today" },
        { icon: "🎯", title: "Perfect Match", desc: "Select 6 tiles in one turn", date: "Today" },
        { icon: "💎", title: "Dice Master", desc: "Roll 3 sixes in a row", date: "Today" },
        { icon: "🌟", title: "Star Collector", desc: "Get 5 stars on 5 levels", date: "Today" },
        { icon: "⚡", title: "Speed Runner", desc: "Complete level under 30 seconds", date: "Today" }
    ];
    
    achievements.forEach(ach => {
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-details">
                <div class="achievement-title">${ach.title}</div>
                <div class="achievement-desc">${ach.desc}</div>
                <div class="achievement-date">${ach.date}</div>
            </div>
        `;
        container.appendChild(item);
    });
    
    document.getElementById('achievementsPanel').classList.remove('hidden');
}

function addAchievement(title) {
    // In real implementation, save to localStorage
    console.log("Achievement unlocked:", title);
    showMessage(`🏆 Achievement Unlocked: ${title}`, "success");
}

function showQuickMenu() {
    const menuHTML = `
        <div class="message-box">
            <h3>QUICK MENU</h3>
            <div style="margin: 20px 0; display: flex; flex-direction: column; gap: 10px;">
                <button onclick="showSettings()" style="width:100%; padding:12px; background:var(--primary); color:white; border:none; border-radius:8px;">SETTINGS</button>
                <button onclick="showAchievements()" style="width:100%; padding:12px; background:var(--warning); color:black; border:none; border-radius:8px;">ACHIEVEMENTS</button>
                <button onclick="gameState.playerData.reset()" style="width:100%; padding:12px; background:var(--danger); color:white; border:none; border-radius:8px;">RESET GAME</button>
                <button onclick="document.getElementById('messageOverlay').classList.add('hidden')" style="width:100%; padding:12px; background:var(--gray); color:white; border:none; border-radius:8px;">CLOSE</button>
            </div>
        </div>
    `;
    
    const overlay = document.getElementById('messageOverlay');
    overlay.innerHTML = menuHTML;
    overlay.classList.remove('hidden');
}

// ============================================
// GAME TIMER
// ============================================
function startGameTimer() {
    clearInterval(CONFIG.gameTimer);
    
    CONFIG.gameTimer = setInterval(() => {
        if (CONFIG.gameTime > 0 && !gameState.levelComplete) {
            CONFIG.gameTime--;
            document.getElementById('gameTime').textContent = CONFIG.gameTime;
            
            // Time warnings
            if (CONFIG.gameTime === 30) {
                showMessage("30 seconds remaining!", "warning");
            } else if (CONFIG.gameTime === 10) {
                showMessage("10 seconds! Hurry up!", "error");
            }
        } else if (CONFIG.gameTime <= 0 && !gameState.levelComplete) {
            clearInterval(CONFIG.gameTimer);
            showMessage("⏰ TIME'S UP! Level failed.", "error");
        }
    }, 1000);
}

// ============================================
// EFFECTS & ANIMATIONS
// ============================================
function createParticleEffect(element) {
    const rect = element.getBoundingClientRect();
    const particles = 10;
    
    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = 'radial-gradient(circle, gold, orange)';
        particle.style.borderRadius = '50%';
        particle.style.left = `${rect.left + rect.width/2}px`;
        particle.style.top = `${rect.top + rect.height/2}px`;
        particle.style.zIndex = '1000';
        particle.style.pointerEvents = 'none';
        
        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        document.body.appendChild(particle);
        
        // Animate
        let opacity = 1;
        const animate = () => {
            opacity -= 0.02;
            particle.style.opacity = opacity;
            particle.style.left = `${parseFloat(particle.style.left) + vx}px`;
            particle.style.top = `${parseFloat(particle.style.top) + vy}px`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

function playSound(soundName) {
    if (!CONFIG.soundEnabled) return;
    
    const sounds = {
        tile: document.getElementById('tileClickSound'),
        diceRoll: document.getElementById('diceRollSound'),
        success: document.getElementById('successSound'),
        win: document.getElementById('winSound'),
        hint: document.getElementById('hintSound')
    };
    
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
    }
}

function showMessage(text, type = "info") {
    const overlay = document.getElementById('messageOverlay');
    const messageBox = overlay.querySelector('.message-box') || document.createElement('div');
    
    messageBox.className = 'message-box';
    
    // Set color based on type
    let color = 'var(--accent)';
    if (type === 'error') color = 'var(--danger)';
    if (type === 'success') color = 'var(--success)';
    if (type === 'warning') color = 'var(--warning)';
    if (type === 'victory') color = 'gold';
    
    messageBox.innerHTML = `
        <div class="message-text" style="color: ${color}">${text}</div>
        <button id="closeMessage" class="message-close" style="background: ${color}">OK</button>
    `;
    
    if (!overlay.contains(messageBox)) {
        overlay.innerHTML = '';
        overlay.appendChild(messageBox);
    }
    
    overlay.classList.remove('hidden');
    
    // Auto-close info messages after 2 seconds
    if (type === 'info') {
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 2000);
    }
    
    // Re-attach close button event
    setTimeout(() => {
        document.getElementById('closeMessage')?.addEventListener('click', () => {
            overlay.classList.add('hidden');
        });
    }, 100);
}

// ============================================
// MOBILE OPTIMIZATIONS
// ============================================
// Prevent zoom on double-tap
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    return false;
});

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Handle resize
window.addEventListener('resize', function() {
    // Adjust tile sizes for mobile
    const tiles = document.querySelectorAll('.tile');
    const isMobile = window.innerWidth <= 768;
    
    tiles.forEach(tile => {
        if (isMobile) {
            tile.style.width = '60px';
            tile.style.height = '80px';
        } else {
            tile.style.width = '70px';
            tile.style.height = '90px';
        }
    });
});        
