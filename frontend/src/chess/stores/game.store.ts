import { writable, type Writable } from 'svelte/store';
import type { GameStore } from '../models/game-store.model';
import type { Game } from '../models/game.model';
import type { ChessPiece } from '../models/pieces/chess-piece.model';

const gameStore: Writable<GameStore> = writable();

const customGameStore = {
    subscribe: gameStore.subscribe,
    setGame: (game) => {
        gameStore.set(game);
    },
    addMove: (move: string) => {
        gameStore.update((game) => {
            game.moves.push(move);
            return { ...game };
        });
    },
    setSelectedPiece: (piece: ChessPiece) => {
        gameStore.update((game) => {
            game.selectedPiece = piece;
            return { ...game };
        })
    }
}

export default customGameStore;