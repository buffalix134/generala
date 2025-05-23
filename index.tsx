
// Declare confetti globally for TypeScript
declare var confetti: any;

document.addEventListener('DOMContentLoaded', () => {
  // Screen elements
  const screens: { [key: string]: HTMLElement | null } = {
    newGame: document.getElementById('new-game-screen'),
    playerConfig: document.getElementById('player-config-screen'),
    roundScoring: document.getElementById('round-scoring-screen'),
    gameScoreboard: document.getElementById('game-scoreboard-screen'),
    gameOver: document.getElementById('game-over-screen'),
    settings: document.getElementById('settings-screen'), // Added settings screen
  };

  // UI Elements - New Game Screen
  const playerCountSelect = document.getElementById('player-count') as HTMLSelectElement | null;
  const startGameButton = document.getElementById('start-game-button') as HTMLButtonElement | null;

  // UI Elements - Player Config Screen
  const playerNamesContainer = document.getElementById('player-names-container') as HTMLDivElement | null;
  const saveNamesButton = document.getElementById('save-names-button') as HTMLButtonElement | null;
  const backToNewGameButton = document.getElementById('back-to-new-game-button') as HTMLButtonElement | null;

  // UI Elements - Round Scoring Screen
  const currentPlayerTurnInfo = document.getElementById('current-player-turn-info') as HTMLHeadingElement | null;
  const currentRoundInfo = document.getElementById('current-round-info') as HTMLParagraphElement | null;
  const scoringCategoriesContainer = document.getElementById('scoring-categories-container') as HTMLDivElement | null;
  const confirmTurnButton = document.getElementById('confirm-turn-button') as HTMLButtonElement | null;
  const viewScoreboardButton = document.getElementById('view-scoreboard-button') as HTMLButtonElement | null;
  
  // UI Elements - Game Scoreboard Screen
  const scoreboardTableContainer = document.getElementById('scoreboard-table-container') as HTMLDivElement | null;
  const continueGameButton = document.getElementById('continue-game-button') as HTMLButtonElement | null;
  const scoreboardNewGameButton = document.getElementById('scoreboard-new-game-button') as HTMLButtonElement | null;

  // UI Elements - Game Over Screen
  const winnerEmojiLargeEl = document.getElementById('winner-emoji-large') as HTMLDivElement | null;
  const winnerNameMessageEl = document.getElementById('winner-name-message') as HTMLHeadingElement | null;
  const winnerScoreMessageEl = document.getElementById('winner-score-message') as HTMLParagraphElement | null;
  const otherPlayersScoresTitleEl = document.getElementById('other-players-scores-title') as HTMLHeadingElement | null;
  const otherPlayersScoresListEl = document.getElementById('other-players-scores-list') as HTMLDivElement | null;
  const gameOverViewFinalBoardButton = document.getElementById('game-over-view-final-board-button') as HTMLButtonElement | null;
  const gameOverNewGameButton = document.getElementById('game-over-new-game-button') as HTMLButtonElement | null;

  // UI Elements - Settings Screen
  const settingsPlayersListContainer = document.getElementById('settings-players-list-container') as HTMLDivElement | null;
  const addNewPlayerButton = document.getElementById('add-new-player-button') as HTMLButtonElement | null;
  const settingsBackButton = document.getElementById('settings-back-button') as HTMLButtonElement | null;
  
  // Nav Links
  const navLinks = document.querySelectorAll('footer nav a');
  const navInicio = document.getElementById('nav-inicio');
  const navPartidas = document.getElementById('nav-partidas');
  const navAjustes = document.getElementById('nav-ajustes');


  // Game State
  interface Player {
    id: number; // Unique ID for each player
    name: string;
    emoji: string;
    scores: { [categoryKey: string]: number | null };
    totalScore: number;
  }

  interface ScoringCategory {
    key: string;
    name: string;
    isNumeric?: boolean; 
    numericValue?: number; 
  }

  interface GameData {
    players: Player[];
    numPlayers: number;
    currentPlayerIndex: number;
    currentRound: number;
    maxRounds: number;
    scoringCategories: ScoringCategory[];
    isGameOver: boolean;
    activeScreen: string | null;
    nextPlayerId: number; // For assigning unique IDs
  }

  let gameData: GameData;
  let previousScreenForSettings: string | null = null;

  const EMOJI_OPTIONS = ['😀', '🥳', '😎', '🎲', '🏆', '🦊', '🦄', '🤖', '👻', '⭐'];

  const SCORING_CATEGORIES: ScoringCategory[] = [
    { key: '1s', name: 'Unos (1)', isNumeric: true, numericValue: 1 }, 
    { key: '2s', name: 'Doses (2)', isNumeric: true, numericValue: 2 }, 
    { key: '3s', name: 'Treses (3)', isNumeric: true, numericValue: 3 },
    { key: '4s', name: 'Cuatros (4)', isNumeric: true, numericValue: 4 }, 
    { key: '5s', name: 'Cincos (5)', isNumeric: true, numericValue: 5 }, 
    { key: '6s', name: 'Seises (6)', isNumeric: true, numericValue: 6 },
    { key: 'escalera', name: 'Escalera' }, 
    { key: 'full', name: 'Full' }, 
    { key: 'poker', name: 'Poker' },
    { key: 'generala', name: 'Generala' }, 
    { key: 'dobleGenerala', name: 'Doble Generala' }
  ];

  function initializeGameData(): GameData {
    return {
      players: [],
      numPlayers: 0,
      currentPlayerIndex: 0,
      currentRound: 1,
      maxRounds: SCORING_CATEGORIES.length,
      scoringCategories: [...SCORING_CATEGORIES],
      isGameOver: false,
      activeScreen: 'newGame',
      nextPlayerId: 1,
    };
  }
  gameData = initializeGameData();


  function showScreen(screenKey: keyof typeof screens) {
    Object.keys(screens).forEach(key => {
      const screenElement = screens[key as keyof typeof screens];
      if (screenElement) {
        if (key === screenKey) {
          screenElement.classList.remove('hidden');
          screenElement.classList.add('flex');
          gameData.activeScreen = key;
        } else {
          screenElement.classList.add('hidden');
          screenElement.classList.remove('flex');
        }
      }
    });
    if (screenKey === 'gameScoreboard' && continueGameButton) {
        continueGameButton.style.display = gameData.isGameOver ? 'none' : 'flex';
    }
    
    // Update active state for footer nav
    navLinks.forEach(link => {
        const linkAriaLabel = link.getAttribute('aria-label')?.toLowerCase();
        let isActive = false;

        if (linkAriaLabel === 'inicio' && (screenKey === 'newGame' || screenKey === 'playerConfig')) {
            isActive = true;
        } else if (linkAriaLabel === 'ajustes' && screenKey === 'settings') {
            isActive = true;
        }
        // Add other specific active states here, e.g., for 'partidas' if it maps to a screen
        // else if (linkAriaLabel === 'partidas' && screenKey === 'someOtherScreenForPartidas') {
        //     isActive = true;
        // }

        if (isActive) {
            link.classList.remove('text-[#5c718a]');
            link.classList.add('text-[#b2cae5]');
        } else {
            link.classList.remove('text-[#b2cae5]');
            link.classList.add('text-[#5c718a]');
        }
    });
  }

  function resetGame() {
    gameData = initializeGameData();
    if (playerCountSelect) playerCountSelect.value = "2"; // Default to 2 players
    showScreen('newGame');
    console.log("Juego reiniciado.");
  }

  // --- Screen Rendering Functions ---

  function renderPlayerConfigScreen(numPlayers: number) {
    if (!playerNamesContainer) return;
    playerNamesContainer.innerHTML = ''; 

    for (let i = 1; i <= numPlayers; i++) {
      const playerInputGroup = document.createElement('div');
      playerInputGroup.className = 'flex items-center space-x-3';

      const nameLabel = document.createElement('label');
      nameLabel.htmlFor = `player-name-${i}`;
      nameLabel.className = 'block text-sm font-medium text-[#5c718a] sr-only';
      nameLabel.textContent = `Nombre Jugador ${i}`;
      
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = `player-name-${i}`;
      nameInput.name = `player-name-${i}`;
      nameInput.className = 'form-input flex-grow px-4 py-3 text-base font-normal text-[#101418] bg-[#eaedf1] border border-transparent rounded-xl focus:text-[#101418] focus:bg-white focus:border-[#b2cae5] focus:outline-none focus:ring-2 focus:ring-[#b2cae5]/50';
      nameInput.placeholder = `Nombre Jugador ${i}`;
      
      const emojiSelect = document.createElement('select');
      emojiSelect.id = `player-emoji-${i}`;
      emojiSelect.name = `player-emoji-${i}`;
      emojiSelect.className = 'form-select emoji-select px-2 py-3 text-base font-normal text-[#101418] bg-[#eaedf1] border border-transparent rounded-xl focus:text-[#101418] focus:bg-white focus:border-[#b2cae5] focus:outline-none focus:ring-2 focus:ring-[#b2cae5]/50';
      
      EMOJI_OPTIONS.forEach(emoji => {
        const option = document.createElement('option');
        option.value = emoji;
        option.textContent = emoji;
        emojiSelect.appendChild(option);
      });
      emojiSelect.value = EMOJI_OPTIONS[ (i-1) % EMOJI_OPTIONS.length ];

      playerInputGroup.appendChild(nameLabel); 
      playerInputGroup.appendChild(nameInput);
      playerInputGroup.appendChild(emojiSelect);
      playerNamesContainer.appendChild(playerInputGroup);
    }
  }

  function populateScoreOptions(category: ScoringCategory, currentPlayer: Player): HTMLOptionElement[] {
    const options: { value: string, text: string }[] = [];
    options.push({ value: "", text: "Elegir Pts" }); 

    if (category.isNumeric && category.numericValue) {
      options.push({ value: "0", text: "0 (Tachar)"});
      for (let i = 1; i <= 5; i++) { 
        options.push({ value: (category.numericValue * i).toString(), text: (category.numericValue * i).toString() });
      }
    } else {
      options.push({ value: "0", text: "0 (Tachar)"}); 
      switch (category.key) {
        case 'escalera':
          options.push({ value: "20", text: "20" });
          options.push({ value: "25", text: "25 (Servida)" });
          break;
        case 'full':
          options.push({ value: "30", text: "30" });
          options.push({ value: "35", text: "35 (Servido)" });
          break;
        case 'poker':
          options.push({ value: "40", text: "40" });
          options.push({ value: "45", text: "45 (Servido)" });
          break;
        case 'generala':
          options.push({ value: "50", text: "50" });
          break;
        case 'dobleGenerala':
          if (currentPlayer.scores['generala'] === 50) {
            options.push({ value: "100", text: "100" });
          }
          break;
      }
    }
    
    return options.map(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.text;
        return optionEl;
    });
  }

  function renderRoundScoringScreen() {
    if (!currentPlayerTurnInfo || !currentRoundInfo || !scoringCategoriesContainer) return;

    const currentPlayer = gameData.players[gameData.currentPlayerIndex];
    if (!currentPlayer) {
        console.error("Jugador actual no encontrado. Reiniciando juego.");
        resetGame();
        return;
    }
    currentPlayerTurnInfo.textContent = `Turno de: ${currentPlayer.name} ${currentPlayer.emoji}`;
    currentRoundInfo.textContent = `Ronda: ${gameData.currentRound} / ${gameData.maxRounds}`;

    scoringCategoriesContainer.innerHTML = '';
    gameData.scoringCategories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0';

      const label = document.createElement('label');
      label.htmlFor = `score-select-${category.key}`;
      label.className = 'text-base text-[#101418]';
      label.textContent = category.name;

      const select = document.createElement('select');
      select.id = `score-select-${category.key}`;
      select.name = `score-select-${category.key}`;
      select.dataset.categoryKey = category.key;
      select.className = 'score-select-field form-select px-3 py-2 text-base font-normal text-[#101418] bg-[#eaedf1] border border-transparent rounded-lg focus:text-[#101418] focus:bg-white focus:border-[#b2cae5] focus:outline-none focus:ring-2 focus:ring-[#b2cae5]/50';
      
      const scoreOptions = populateScoreOptions(category, currentPlayer);
      scoreOptions.forEach(opt => select.appendChild(opt));

      if (currentPlayer.scores[category.key] !== null) {
        select.value = currentPlayer.scores[category.key]!.toString();
        select.disabled = true;
        select.classList.add('bg-gray-300', 'text-gray-500');
      } else {
        select.disabled = false;
        if (category.key === 'dobleGenerala' && currentPlayer.scores['generala'] !== 50) {
            if (select.options.length <= 2) { 
                 // select.disabled = true; // Optionally disable if only 0 is possible.
            }
        }
      }
      
      categoryDiv.appendChild(label);
      categoryDiv.appendChild(select);
      scoringCategoriesContainer.appendChild(categoryDiv);
    });
  }

  function renderScoreboardScreen() {
    if (!scoreboardTableContainer) return;

    let tableHTML = `<table class="scoreboard-table"><thead><tr><th>Categoría</th>`;
    gameData.players.forEach(player => {
      tableHTML += `<th class="player-header">${player.name} ${player.emoji}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;

    gameData.scoringCategories.forEach(category => {
      tableHTML += `<tr><td class="category-col">${category.name}</td>`;
      gameData.players.forEach(player => {
        const score = player.scores[category.key];
        tableHTML += `<td class="score-cell">${score !== null ? score : '-'}</td>`;
      });
      tableHTML += `</tr>`;
    });

    tableHTML += `<tr class="total-row"><td class="category-col">TOTAL</td>`;
    gameData.players.forEach(player => {
      tableHTML += `<td class="score-cell">${player.totalScore}</td>`;
    });
    tableHTML += `</tr></tbody></table>`;
    
    scoreboardTableContainer.innerHTML = tableHTML;
  }

  function renderGameOverScreen() {
    if (!winnerEmojiLargeEl || !winnerNameMessageEl || !winnerScoreMessageEl || !otherPlayersScoresListEl || !otherPlayersScoresTitleEl) {
        console.error("Elementos de la pantalla Game Over no encontrados.");
        return;
    }

    winnerEmojiLargeEl.innerHTML = '';
    winnerNameMessageEl.textContent = '';
    winnerScoreMessageEl.textContent = '';
    otherPlayersScoresListEl.innerHTML = '';
    otherPlayersScoresTitleEl.classList.add('hidden');

    let winners: Player[] = [];
    let maxScore = -1;

    gameData.players.forEach(player => {
      if (player.totalScore > maxScore) {
        maxScore = player.totalScore;
        winners = [player];
      } else if (player.totalScore === maxScore) {
        winners.push(player);
      }
    });

    if (winners.length > 0) {
        if (winners.length === 1) {
            winnerEmojiLargeEl.textContent = winners[0].emoji;
            winnerNameMessageEl.textContent = `¡Ganador: ${winners[0].name}!`;
            winnerScoreMessageEl.textContent = `Puntaje Final: ${winners[0].totalScore}`;
        } else {
            winnerEmojiLargeEl.textContent = winners.map(w => w.emoji).join(' ');
            winnerNameMessageEl.textContent = `¡Empate entre: ${winners.map(w => w.name).join(' y ')}!`;
            winnerScoreMessageEl.textContent = `Puntaje Final: ${maxScore}`;
        }
    } else {
        winnerNameMessageEl.textContent = "No se pudo determinar el ganador.";
    }

    const otherPlayers = gameData.players.filter(p => !winners.includes(p));
    if (otherPlayers.length > 0) {
        otherPlayersScoresTitleEl.classList.remove('hidden');
        otherPlayers.sort((a,b) => b.totalScore - a.totalScore); 
        otherPlayers.forEach(player => {
            const playerScoreElement = document.createElement('p');
            playerScoreElement.className = 'text-sm';
            playerScoreElement.textContent = `${player.emoji} ${player.name}: ${player.totalScore} puntos`;
            otherPlayersScoresListEl.appendChild(playerScoreElement);
        });
    }
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    }
  }

  function renderSettingsScreen() {
    if (!settingsPlayersListContainer) return;
    settingsPlayersListContainer.innerHTML = '';

    gameData.players.forEach((player, index) => {
        const playerRow = document.createElement('div');
        playerRow.className = 'settings-player-row flex items-center space-x-2 py-2 border-b border-gray-200';

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.value = player.name;
        nameInput.className = 'form-input flex-grow px-3 py-2 text-sm text-[#101418] bg-[#eaedf1] border border-transparent rounded-lg focus:text-[#101418] focus:bg-white focus:border-[#b2cae5]';
        nameInput.setAttribute('aria-label', `Nombre de ${player.name}`);

        const emojiSelect = document.createElement('select');
        emojiSelect.className = 'form-select emoji-select px-2 py-2 text-sm text-[#101418] bg-[#eaedf1] border border-transparent rounded-lg focus:text-[#101418] focus:bg-white focus:border-[#b2cae5]';
        EMOJI_OPTIONS.forEach(emoji => {
            const option = document.createElement('option');
            option.value = emoji;
            option.textContent = emoji;
            emojiSelect.appendChild(option);
        });
        emojiSelect.value = player.emoji;
        emojiSelect.setAttribute('aria-label', `Emoji de ${player.name}`);

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.className = 'px-3 py-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-md';
        saveButton.addEventListener('click', () => {
            const oldName = gameData.players[index].name;
            gameData.players[index].name = nameInput.value.trim() || `Jugador ${player.id}`;
            gameData.players[index].emoji = emojiSelect.value;
            alert(`Cambios guardados para ${oldName}.`);
            renderSettingsScreen(); // Re-render to reflect changes or confirm
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'px-3 py-1.5 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md';
        deleteButton.addEventListener('click', () => {
            if (gameData.players.length <= 1) {
                alert('No puedes eliminar al último jugador.');
                return;
            }
            if (confirm(`¿Seguro que quieres eliminar a ${player.name}?`)) {
                const removedPlayer = gameData.players.splice(index, 1)[0];
                gameData.numPlayers = gameData.players.length;

                // Adjust currentPlayerIndex if necessary
                if (index < gameData.currentPlayerIndex) {
                    gameData.currentPlayerIndex--;
                } else if (index === gameData.currentPlayerIndex && gameData.currentPlayerIndex >= gameData.numPlayers && gameData.numPlayers > 0) {
                    // If current player was removed and was last, wrap to first player (or 0 if list became empty, though prevented)
                    gameData.currentPlayerIndex = 0; 
                }
                // If game is active and current player was deleted, and it's now out of bounds, reset to 0
                if (gameData.currentPlayerIndex >= gameData.numPlayers && gameData.numPlayers > 0) {
                     gameData.currentPlayerIndex = 0;
                }


                alert(`${removedPlayer.name} eliminado.`);
                renderSettingsScreen(); // Re-render the list
            }
        });

        playerRow.appendChild(nameInput);
        playerRow.appendChild(emojiSelect);
        playerRow.appendChild(saveButton);
        playerRow.appendChild(deleteButton);
        settingsPlayersListContainer.appendChild(playerRow);
    });
  }


  // --- Event Listeners ---

  if (startGameButton && playerCountSelect) {
    startGameButton.addEventListener('click', () => {
      const numPlayers = parseInt(playerCountSelect.value, 10);
      gameData.numPlayers = numPlayers; // Set this early
      renderPlayerConfigScreen(numPlayers);
      showScreen('playerConfig');
    });
  }

  if (backToNewGameButton) {
    backToNewGameButton.addEventListener('click', () => {
      showScreen('newGame');
      if (playerNamesContainer) playerNamesContainer.innerHTML = '';
    });
  }

  if (saveNamesButton && playerNamesContainer) {
    saveNamesButton.addEventListener('click', () => {
      gameData.players = [];
      gameData.nextPlayerId = 1; // Reset for new game
      for (let i = 1; i <= gameData.numPlayers; i++) {
        const nameInput = document.getElementById(`player-name-${i}`) as HTMLInputElement | null;
        const emojiSelect = document.getElementById(`player-emoji-${i}`) as HTMLSelectElement | null;
        
        const scores: { [categoryKey: string]: number | null } = {};
        gameData.scoringCategories.forEach(cat => scores[cat.key] = null);

        gameData.players.push({
          id: gameData.nextPlayerId++,
          name: nameInput?.value.trim() || `Jugador ${gameData.nextPlayerId -1}`,
          emoji: emojiSelect?.value || EMOJI_OPTIONS[0],
          scores: scores,
          totalScore: 0
        });
      }
      gameData.currentPlayerIndex = 0;
      gameData.currentRound = 1;
      gameData.isGameOver = false;
      renderRoundScoringScreen();
      showScreen('roundScoring');
    });
  }
  
  if (confirmTurnButton && scoringCategoriesContainer) {
    confirmTurnButton.addEventListener('click', () => {
      if (gameData.players.length === 0 || !gameData.players[gameData.currentPlayerIndex]) {
        alert("No hay jugadores configurados o error en el jugador actual. Volviendo a inicio.");
        resetGame();
        return;
      }
      const currentPlayer = gameData.players[gameData.currentPlayerIndex];
      let scoreEntered = false;
      let enteredScoreValue = 0;
      let scoredCategoryKey = '';

      const scoreSelects = scoringCategoriesContainer.querySelectorAll('select.score-select-field') as NodeListOf<HTMLSelectElement>;
      let multipleScoresEntered = false;
      scoreSelects.forEach(select => {
        if (!select.disabled && select.value !== '') { 
          const categoryKey = select.dataset.categoryKey;
          if (categoryKey && currentPlayer.scores[categoryKey] === null) {
             const score = parseInt(select.value, 10);
             if (!isNaN(score)) { 
                if (scoreEntered) { 
                    multipleScoresEntered = true;
                    return; 
                }
                enteredScoreValue = score;
                scoredCategoryKey = categoryKey;
                scoreEntered = true;
             }
          }
        }
      });
      
      if(multipleScoresEntered){
        alert('Solo puedes anotar en una categoría por turno.');
        return;
      }

      if (!scoreEntered || scoredCategoryKey === '') {
        alert('Por favor, selecciona un puntaje para una categoría disponible o elige 0 para tacharla.');
        return;
      }
      
      currentPlayer.scores[scoredCategoryKey] = enteredScoreValue;
      currentPlayer.totalScore = Object.values(currentPlayer.scores).reduce((sum, currentScore) => sum + (currentScore || 0), 0);
      
      gameData.currentPlayerIndex++;
      if (gameData.currentPlayerIndex >= gameData.numPlayers) {
        gameData.currentPlayerIndex = 0;
        gameData.currentRound++;
      }

      if (gameData.currentRound > gameData.maxRounds) {
        gameData.isGameOver = true;
        renderGameOverScreen();
        showScreen('gameOver');
      } else {
        renderRoundScoringScreen();
        showScreen('roundScoring');
      }
    });
  }

  if (viewScoreboardButton) {
    viewScoreboardButton.addEventListener('click', () => {
      renderScoreboardScreen();
      showScreen('gameScoreboard');
    });
  }
  
  if (continueGameButton) {
    continueGameButton.addEventListener('click', () => {
      if (!gameData.isGameOver) {
        showScreen('roundScoring');
      }
    });
  }

  const newGameButtons = [scoreboardNewGameButton, gameOverNewGameButton];
  newGameButtons.forEach(button => {
    if (button) button.addEventListener('click', resetGame);
  });

  if (gameOverViewFinalBoardButton) {
    gameOverViewFinalBoardButton.addEventListener('click', () => {
      renderScoreboardScreen(); 
      showScreen('gameScoreboard');
       if (continueGameButton) continueGameButton.style.display = 'none';
    });
  }

  // Settings Screen Buttons
  if (addNewPlayerButton) {
    addNewPlayerButton.addEventListener('click', () => {
        const newPlayerId = gameData.nextPlayerId++;
        const scores: { [categoryKey: string]: number | null } = {};
        gameData.scoringCategories.forEach(cat => scores[cat.key] = null);

        const newPlayer: Player = {
            id: newPlayerId,
            name: `Jugador ${newPlayerId}`,
            emoji: EMOJI_OPTIONS[gameData.players.length % EMOJI_OPTIONS.length],
            scores: scores,
            totalScore: 0
        };
        gameData.players.push(newPlayer);
        gameData.numPlayers = gameData.players.length;
        renderSettingsScreen();
    });
  }

  if (settingsBackButton) {
    settingsBackButton.addEventListener('click', () => {
        if (previousScreenForSettings && !gameData.isGameOver) {
            const targetScreenKey = previousScreenForSettings as keyof typeof screens;
            if (targetScreenKey === 'roundScoring') renderRoundScoringScreen();
            else if (targetScreenKey === 'gameScoreboard') renderScoreboardScreen();
            else if (targetScreenKey === 'gameOver') renderGameOverScreen(); // Should not happen if !isGameOver
            else if (targetScreenKey === 'playerConfig') renderPlayerConfigScreen(gameData.numPlayers);
            showScreen(targetScreenKey);
        } else if (gameData.isGameOver) { // If game is over, always give option to see board or start new
            renderGameOverScreen(); // Re-render in case names/emojis changed.
            showScreen('gameOver');
        }
         else {
            showScreen('newGame'); // Default fallback
        }
        previousScreenForSettings = null; 
    });
  }


  // Footer Navigation
  if (navInicio) {
    navInicio.addEventListener('click', (e) => {
      e.preventDefault();
      const isGameEffectivelyActive = gameData.activeScreen !== 'newGame' && gameData.activeScreen !== 'playerConfig' && !gameData.isGameOver;
      if (isGameEffectivelyActive) {
        if (confirm('¿Estás seguro de que quieres ir al inicio? Se perderá el progreso de la partida actual.')) {
          resetGame();
        }
      } else {
        resetGame(); 
      }
    });
  }
  
  if (navAjustes) {
    navAjustes.addEventListener('click', (e) => {
        e.preventDefault();
        const isGameEffectivelyActive = gameData.activeScreen !== 'newGame' && 
                                     gameData.activeScreen !== 'playerConfig' && 
                                     gameData.activeScreen !== 'settings' && 
                                     !gameData.isGameOver;

        if (isGameEffectivelyActive) {
            if (!confirm('Modificar jugadores durante una partida activa puede afectar los puntajes y el orden. ¿Deseas continuar?')) {
                return;
            }
        }
        previousScreenForSettings = gameData.activeScreen;
        renderSettingsScreen();
        showScreen('settings');
    });
  }

  if (navPartidas) { 
    navPartidas.addEventListener('click', (e) => {
        e.preventDefault();
        alert('"Partidas Guardadas" (Funcionalidad aún no implementada)');
    });
  }


  // Initial setup
  showScreen('newGame');
  console.log("Aplicación Generala cargada y lista.");
});
