import { sliceArray } from "../../../utils";
import { PieceType } from "../../enums/piece-type.enum";
import { getAvailableMovesBySide, getBoardWithNewInstance, getOppositeColor, getPieceAttackingTheKing, hasAlreadyMoved } from "../../utils/chessboard.utils";
import type { GameStore } from "../game-store.model";
import type { Move } from "../move.model";
import type { Position } from "../position.model";
import type { ChessPiece } from "./chess-piece.model";
import { ChessPieceAbstract } from "./chess-piece.model";
import { castleValues } from "./config";
import type { Rook } from "./rook.model";

export default class King extends ChessPieceAbstract {
    readonly type = PieceType.KING;

    /**
     * Get the available position for the piece
     * @param pieces List of pieces on the board
     * @param moves All the moves already played in the game
     * @param isMovedPiece If we call this method to get the position of the moved piece or just to get the position of the piece on the board
     * @returns A list of position
     */
    getAvailablePositions(pieces: ChessPiece[], moves: Move[], isMovedPiece = true): Position[] {
        let availableMoves: Position[] = [];
        availableMoves.push(...getAvailableMovesBySide(pieces, [-10, 10, -1, 1, 9, 11, -9, -11], this.position, this.color, 1));

        availableMoves.push(...this.getCastlingMoves(pieces, moves));
        
        if (isMovedPiece) {
           availableMoves = this.removeImpossibleMoves(pieces, moves, availableMoves);
        }
        
        return this.filterKingMovesIfHeIsChecked(pieces, availableMoves);
    }

    filterKingMovesIfHeIsChecked(board: ChessPiece[], availableMoves: Position[]) {
        const piecesAttackingTheKing = getPieceAttackingTheKing(this, board);
        const kingIndex = board.findIndex((piece) => piece.type === PieceType.KING && piece.color === this.color)
        const boardWithoutKing = board.slice(0, kingIndex).concat(board.slice(kingIndex + 1));
        const piecesAttackingTheKingMoves = piecesAttackingTheKing.map(
            (piece) => piece.getAvailablePositions(boardWithoutKing, [], false)
        ).flat();
        return availableMoves.filter((move) => !piecesAttackingTheKingMoves.find((position) => position === move));
    }

    getPositionBetweenPieceAndOpponentKing(king: ChessPiece, availableMoves: Position[]): Position[] {
        return [];
    }

    /**
     * The king cannot go onto a square that is attacked by an opponent piece so we remove those square.
     * It also removes the castle possibilities if needed.
     */
    removeImpossibleMoves(board: ChessPiece[], moves: Move[], availableMoves: Position[]): Position[] {
        const enemieAvailablePositions = board.filter((piece) => piece.color === getOppositeColor(this.color)).map(
            (piece) => piece.availableMoves
        ).flat();

        let newAvailableMoves = availableMoves.filter((position) => !enemieAvailablePositions.find((p) => p === position));

        newAvailableMoves = this.removeAvailableMovesAttackingPiecesDefendedByOtherPieces(board, availableMoves);
        
        return newAvailableMoves.filter((availableMove) => {
            return !(this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'long', newAvailableMoves)
                || this.checkEmptySquareBetweenKingAndDestinationCastle(availableMove, 'short', newAvailableMoves));
        });
    }

    /**
     * The king can take opponent pieces only if they are not defended by other pieces, this function check if the king
     * will be under attack if he takes the opponent piece.
     * @param board the current board
     * @param availableMoves the available moves for the king
     * @returns the available moves
     */
    removeAvailableMovesAttackingPiecesDefendedByOtherPieces(board: ChessPiece[], availableMoves: Position[]): Position[] {
        return availableMoves.filter((move) => {
            let newBoard = getBoardWithNewInstance(board);
            const hasPieceOnPossibleMove = newBoard.findIndex((piece) => piece.position === move);
            if (hasPieceOnPossibleMove > -1) {
                newBoard = sliceArray<ChessPiece>(newBoard, newBoard.findIndex((piece) => piece.position === move));
            }
            const kingIndex = newBoard.findIndex((piece) => piece.type === PieceType.KING && piece.color === this.color)
            newBoard[kingIndex].position = move;
            
            newBoard = newBoard.map((piece) => {
                piece.availableMoves = piece.getAvailablePositions(newBoard, [], false);
                return piece;
            });
            return getPieceAttackingTheKing(newBoard[kingIndex], newBoard).length === 0;
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
            const castle = castlePosition[name];
            const castleTowerAtStartingPosition = gameStore.board.findIndex(
                (piece) => piece.color === this.color && piece.type === PieceType.ROOK && piece.position === castle.towerDefaultPosition && piece.name === name,
            );
            if (castleTowerAtStartingPosition > -1
                && !this.hasRookAlreadyMoved(gameStore.board[castleTowerAtStartingPosition] as Rook, gameStore.moves)
                && this.position === castle.kingDestination) {
                gameStore.board[castleTowerAtStartingPosition].position = castle.towerDestination as Position;
            }
        });
        return gameStore;
    }

    private getCastlingMoves(pieces: ChessPiece[], moves: Move[]) {
        const availableMoves: Position[] = [];
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

    private hasRookAlreadyMoved(piece: Rook, moves: Move[]): Move | undefined {
        return moves.find((move) => move.piece.color === piece?.color && move.piece.type === PieceType.ROOK && move.piece?.name === piece.name);
    }
}