import { castleValues } from "../../config";
import { PieceColor } from "../../enums/piece-color.enum";
import { PieceType } from "../../enums/piece-type.enum";
import { filterAvailableMovesIfKingIsChecked, getAvailableMovesBySide, getOppositeColor, getPieceAttackingTheKing, hasAlreadyMoved, hasPieceOnPosition, isPositionOutsideBoundaries } from "../../utils/chessboard.utils";
import type { GameStore } from "../game-store.model";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";
import type { Rook } from "./rook.model";

export class King extends ChessPieceAbstract {
    readonly type = PieceType.KING;

    /**
     * Get the available position for the piece
     * @param pieces List of pieces on the board
     * @param moves All the moves already played in the game
     * @param isMovedPiece If we call this method to get the position of the moved piece or just to get the position of the piece on the board
     * @returns A list of position
     */
    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece: boolean = true): Position[] {
        let availableMoves = [];
        availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color, 1));

        availableMoves.push(...this.getCastlingMoves(pieces, moves));
        
        if (isMovedPiece) {
            availableMoves = this.removeImpossibleMoves(pieces, moves, availableMoves);
        }

        return filterAvailableMovesIfKingIsChecked(pieces, this, availableMoves);
    }

    getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
        return [];
    }

    /**
     * The king cannot go onto a square that is attacked by an opponent piece so we remove those square.
     * It also removes the castle possibilities if needed.
     */
    removeImpossibleMoves(pieces: ChessPiece[], moves: Move[], availableMoves: Position[]): Position[] {
        const enemieAvailablePositions = pieces.filter((piece) => piece.color === getOppositeColor(this.color)).map(
            (piece) => piece.getAvailablePositions(pieces, moves, false)
        ).flat();

        const newAvailableMoves = availableMoves.filter((position) => !enemieAvailablePositions.find((p) => p === position));
        return newAvailableMoves.filter((availableMove) => {
            return !(this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'long', newAvailableMoves)
                || this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'short', newAvailableMoves));
        });
    }

    /**
     * The king cannot castle if one of the square in between him and his destination is under attack. This function check
     * if the square between him and is destination is not in the availableMoves array based on the castleType
     */
    checkEmptySquareBetweenKingAndDestinationCastle(availableMove: Position, castleType: 'short' | 'long', availableMoves: Position[]) {
        const castlePosition = castleValues[this.color];
        return availableMove === castlePosition[castleType].kingDestination
            && !availableMoves.find((move) => move === (availableMove + (castleType === 'long' ? 10 : -10)));
    }

    onMoveAction(gameStore: GameStore): GameStore {
        const castlePosition = castleValues[this.color];

        // Moves the tower if it's a castle
        Object.keys(castlePosition).forEach((name) => {
            const castleTowerAtStartingPosition = gameStore.board.findIndex(
                (piece) => piece.color === this.color && piece.type === PieceType.ROOK && piece.position === castlePosition[name].towerDefaultPosition && piece.name === name,
            );
            if (castleTowerAtStartingPosition > -1
                && !this.hasRookAlreadyMoved(gameStore.board[castleTowerAtStartingPosition] as Rook, gameStore.moves)
                && this.position === castlePosition[name].kingDestination) {
                gameStore.board[castleTowerAtStartingPosition].position = castlePosition[name].towerDestination;
            }
        });
        return gameStore;
    }

    private getCastlingMoves(pieces: ChessPiece[], moves: Move[]) {
        const availableMoves = [];
        if (getPieceAttackingTheKing(this, pieces).length > 0) {
            return [];
        }
        if (!hasAlreadyMoved(this, moves)) {
            const castlePosition = castleValues[this.color];

            Object.keys(castlePosition).forEach((name) => {
                const castleTowerAtStartingPosition = pieces.find(
                    (piece) => piece.color === this.color && piece.type === PieceType.ROOK && piece.position === castlePosition[name].towerDefaultPosition && piece.name === name,
                ) as Rook;
                if (castleTowerAtStartingPosition && !this.hasRookAlreadyMoved(castleTowerAtStartingPosition, moves)) {
                    availableMoves.push(castlePosition[name].kingDestination);
                }
            })
        }
        return availableMoves;
    }

    private hasRookAlreadyMoved(piece: Rook, moves: Move[]): Move {
        return moves.find((move) => move.piece.color === piece?.color && move.piece.type === PieceType.ROOK && move.piece?.name === piece.name);
    }
}