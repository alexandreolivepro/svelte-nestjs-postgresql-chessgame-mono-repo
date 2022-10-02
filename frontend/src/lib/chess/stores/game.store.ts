import { writable, type Writable } from 'svelte/store';
import type { GameStore } from '../models/game-store.model';
import type { ChessPiece } from '../models/pieces/chess-piece.model';
import type { Position } from '../models/position.model';
import { getCheckStatus, getOppositeColor } from '../utils/chessboard.utils';

const gameStore: Writable<GameStore> = writable();

const customGameStore = {
    subscribe: gameStore.subscribe,
    setGame: (game: GameStore) => {
        gameStore.set(game);
        game.board = game.board.map((value) => {
            value.availableMoves = value.getAvailablePositions(game.board, [], false);
            return value;
        });
    },
    addMove: (move: string) => {
        gameStore.update((game) => {
            if (game.availableMoves?.find((availableMove) => availableMove === +move) && game.selectedPiece) {
                game.moves.push({
                    piece: game.selectedPiece,
                    start: game.selectedPiece.position,
                    end: +move as Position,
                });
                // Remove the piece if there is one at the destination
                if (game.board.findIndex((piece) => piece.position === +move) > -1) {
                    game.board.splice(game.board.findIndex((piece) => piece.position === +move), 1);
                }
                // Move the selected piece at the destination
                game.board[game.board.findIndex((piece) => piece.position === game.selectedPiece?.position)].position = +move as Position;
                // Allow the pieces to make action on the board (castling moving the rook or en passant for exemple)
                game = game.selectedPiece.onMoveAction(game);
                game.board = game.board.map((value) => {
                    value.availableMoves = value.getAvailablePositions(game.board, [], false);
                    return value;
                });
                // Reset the selectedPiece
                delete game.selectedPiece;
                game.availableMoves = [];
                // Change the next player
                game.nextColorToPlay = getOppositeColor(game.nextColorToPlay);
                game.checkStatus = getCheckStatus(game.board, game.nextColorToPlay);
            }
            return { ...game };
        });
    },
    setSelectedPiece: (piece: ChessPiece) => {
        gameStore.update((game) => {
            game.availableMoves = game.selectedPiece?.position === piece.position ? [] : piece.getAvailablePositions(game.board, game.moves, true);
            game.selectedPiece = game.selectedPiece?.position === piece.position ? undefined : piece;
            
            return { ...game };
        })
    }
}

export default customGameStore;