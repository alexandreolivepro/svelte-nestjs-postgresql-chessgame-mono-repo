import { PieceColor } from '../enums/piece-color.enum';
import { PieceType } from '../enums/piece-type.enum';
import type { Move } from '../models/move.model';
import { Bishop } from '../models/pieces/bishop.model';
import King from '../models/pieces/king.model';

import { Queen } from '../models/pieces/queen.model';
import { Rook } from '../models/pieces/rook.model';
import type { Position } from '../models/position.model';
import {
	filterAvailableMovesIfKingIsChecked,
	getAvailableMovesBySide,
	getBoardWithoutPiece,
	getDiagonalBetweenTwoPiece,
	getFirstDigitOfPosition,
	getLastDigitOfPosition,
	getOppositeColor,
	getPieceAttackingTheKing,
	getStraigthLineBetweenTwoPieces,
	hasAlreadyMoved,
	hasPieceOnPosition,
	isCheckWithoutPieceOnBoard,
	isPositionOutsideBoundaries
} from './chessboard.utils';

describe('chessboard.utils', () => {
	describe('getOppositeColor(:color)', () => {
		it('Should return white', () => {
			expect(getOppositeColor(PieceColor.BLACK)).toEqual(PieceColor.WHITE);
		});

		it('Should return black', () => {
			expect(getOppositeColor(PieceColor.WHITE)).toEqual(PieceColor.BLACK);
		});
	});

	describe('isPositionOutsideBoundaries(:position)', () => {
		it('Position below 11 should be true', () => {
			expect(isPositionOutsideBoundaries(-22)).toBeTruthy();
			expect(isPositionOutsideBoundaries(-9)).toBeTruthy();
			expect(isPositionOutsideBoundaries(-1)).toBeTruthy();
			expect(isPositionOutsideBoundaries(10)).toBeTruthy();
			expect(isPositionOutsideBoundaries(6)).toBeTruthy();
			expect(isPositionOutsideBoundaries(3)).toBeTruthy();
		});

		it('Position above 88 should be true', () => {
			expect(isPositionOutsideBoundaries(89)).toBeTruthy();
			expect(isPositionOutsideBoundaries(109)).toBeTruthy();
			expect(isPositionOutsideBoundaries(300)).toBeTruthy();
		});

		it('Position ending in 0 or 9 should be true', () => {
			expect(isPositionOutsideBoundaries(20)).toBeTruthy();
			expect(isPositionOutsideBoundaries(19)).toBeTruthy();
			expect(isPositionOutsideBoundaries(59)).toBeTruthy();
			expect(isPositionOutsideBoundaries(30)).toBeTruthy();
		});

		it('Position between 11 and 88 should be false', () => {
			expect(isPositionOutsideBoundaries(11)).toBeFalsy();
			expect(isPositionOutsideBoundaries(88)).toBeFalsy();
			expect(isPositionOutsideBoundaries(51)).toBeFalsy();
		});
	});

	describe('hasPieceOnPosition(:pieces, :destination, :color)', () => {
		it('Should find piece on find on position', () => {
			const mockBoard = [
				new Rook(PieceColor.WHITE, 11, 'long'),
				new Rook(PieceColor.WHITE, 81, 'short'),
				new Bishop(PieceColor.BLACK, 31)
			];
			expect(hasPieceOnPosition(mockBoard, 11, PieceColor.WHITE)).toBeTruthy();
			expect(hasPieceOnPosition(mockBoard, 81, PieceColor.WHITE)).toBeTruthy();
		});
		it('Should not find piece on find on position', () => {
			const mockBoard = [
				new Rook(PieceColor.WHITE, 11, 'long'),
				new Rook(PieceColor.WHITE, 81, 'short'),
				new Bishop(PieceColor.BLACK, 31)
			];
			expect(hasPieceOnPosition(mockBoard, 31, PieceColor.WHITE)).toBeFalsy();
			expect(hasPieceOnPosition(mockBoard, 82, PieceColor.WHITE)).toBeFalsy();
			expect(hasPieceOnPosition(mockBoard, 11, PieceColor.BLACK)).toBeFalsy();
		});
	});

	describe('hasAlreadyMoved(:piece, :moves)', () => {
		it('Should have already moved', () => {
			const king = new King(PieceColor.WHITE, 11);
			const mockMoves = [
				{
					piece: king,
					start: 11,
					end: 12
				},
				{
					piece: king,
					start: 12,
					end: 13
				}
			] as Move[];
			expect(hasAlreadyMoved(king, mockMoves)).toBeTruthy();
		});
		it('Should not have already moved', () => {
			const king = new King(PieceColor.WHITE, 11);
			const queen = new Queen(PieceColor.WHITE, 11);
			const mockMoves = [
				{
					piece: king,
					start: 11,
					end: 12
				},
				{
					piece: king,
					start: 12,
					end: 13
				}
			] as Move[];
			expect(hasAlreadyMoved(queen, mockMoves)).toBeFalsy();
		});
	});

	describe('getAvailableMovesBySide(:pieces, :movementValuesBySide, :startingPosition, :color, :distance)', () => {
		it('Should not return any position because it is the edge of the board', () => {
			const values = getAvailableMovesBySide([], [11, 10, 9], 85, PieceColor.WHITE, 8);
			expect(values.length).toEqual(0);

			expect(getAvailableMovesBySide([], [11, 1, -9], 48, PieceColor.WHITE, 8).length).toEqual(0);

			expect(getAvailableMovesBySide([], [-9, -10, -11], 15, PieceColor.WHITE, 8).length).toEqual(
				0
			);
		});

		it('Should return the diagonals without blocking', () => {
			const diagonalMiddle = getAvailableMovesBySide([], [11, 9, -9, -11], 45, PieceColor.WHITE, 8);
			expect(diagonalMiddle.length).toEqual(13);
			expect(diagonalMiddle).toMatchObject([56, 67, 78, 54, 63, 72, 81, 36, 27, 18, 34, 23, 12]);

			const diagonalSide = getAvailableMovesBySide([], [11, 9, -9, -11], 37, PieceColor.WHITE, 8);
			expect(diagonalSide.length).toEqual(9);
			expect(diagonalSide).toMatchObject([48, 46, 55, 64, 73, 82, 28, 26, 15]);
		});

		it('Should return the straight line without blocking', () => {
			const straightMiddle = getAvailableMovesBySide([], [10, 1, -1, -10], 45, PieceColor.WHITE, 8);
			expect(straightMiddle.length).toEqual(14);
			expect(straightMiddle).toMatchObject([
				55, 65, 75, 85, 46, 47, 48, 44, 43, 42, 41, 35, 25, 15
			]);

			const straightSide = getAvailableMovesBySide([], [10, 1, -1, -10], 37, PieceColor.WHITE, 8);
			expect(straightSide.length).toEqual(14);
			expect(straightSide).toMatchObject([47, 57, 67, 77, 87, 38, 36, 35, 34, 33, 32, 31, 27, 17]);
		});

		it('Should be blocked by enemies but still return their position', () => {
			const mockBoard = [new Bishop(PieceColor.WHITE, 56), new Bishop(PieceColor.WHITE, 52)];
			const moveBishop = getAvailableMovesBySide(
				mockBoard,
				[11, 9, -9, -11],
				34,
				PieceColor.BLACK,
				8
			);
			expect(moveBishop).toMatchObject([45, 56, 43, 52, 25, 16, 23, 12]);
			expect(moveBishop.length).toEqual(8);
		});

		it("Should be blocked by friends but don't return their position", () => {
			const mockBoard = [new Bishop(PieceColor.WHITE, 56), new Bishop(PieceColor.WHITE, 52)];
			const moveBishop = getAvailableMovesBySide(
				mockBoard,
				[11, 9, -9, -11],
				34,
				PieceColor.WHITE,
				8
			);
			expect(moveBishop).toMatchObject([45, 43, 25, 16, 23, 12]);
			expect(moveBishop.length).toEqual(6);
		});

		it('Should only go until the given distance', () => {
			const straightMiddle = getAvailableMovesBySide([], [10, 1, -1, -10], 45, PieceColor.WHITE, 2);
			expect(straightMiddle.length).toEqual(8);
			expect(straightMiddle).toMatchObject([55, 65, 46, 47, 44, 43, 35, 25]);

			const straightSide = getAvailableMovesBySide([], [10, 1, -1, -10], 37, PieceColor.WHITE, 1);
			expect(straightSide.length).toEqual(4);
			expect(straightSide).toMatchObject([47, 38, 36, 27]);
		});
	});

	describe('getDiagonalBetweenTwoPiece(:firstPiece, :secondPiece)', () => {
		it('Should get the correct value between 2 pieces', () => {
			expect(
				getDiagonalBetweenTwoPiece(
					new Bishop(PieceColor.WHITE, 36),
					new Bishop(PieceColor.WHITE, 63)
				)
			).toMatchObject([63, 54, 45]);
			expect(
				getDiagonalBetweenTwoPiece(
					new Bishop(PieceColor.WHITE, 63),
					new Bishop(PieceColor.WHITE, 36)
				)
			).toMatchObject([36, 45, 54]);
			expect(
				getDiagonalBetweenTwoPiece(
					new Bishop(PieceColor.WHITE, 37),
					new Bishop(PieceColor.WHITE, 63)
				)
			).toMatchObject([]);
			expect(
				getDiagonalBetweenTwoPiece(
					new Bishop(PieceColor.WHITE, 25),
					new Bishop(PieceColor.WHITE, 61)
				)
			).toMatchObject([61, 52, 43, 34]);
		});
	});

	describe('getStraigthLineBetweenTwoPieces(:firstPiece, :secondPiece)', () => {
		it('Should get the correct value between 2 pieces', () => {
			expect(
				getStraigthLineBetweenTwoPieces(
					new Bishop(PieceColor.WHITE, 36),
					new Bishop(PieceColor.WHITE, 66)
				)
			).toMatchObject([36, 46, 56, 66]);
			expect(
				getStraigthLineBetweenTwoPieces(
					new Bishop(PieceColor.WHITE, 66),
					new Bishop(PieceColor.WHITE, 36)
				)
			).toMatchObject([36, 46, 56, 66]);
			expect(
				getStraigthLineBetweenTwoPieces(
					new Bishop(PieceColor.WHITE, 25),
					new Bishop(PieceColor.WHITE, 28)
				)
			).toMatchObject([25, 26, 27, 28]);
		});
	});

	describe('getLastDigitOfPosition(:position)', () => {
		it('Should get the last digit of those values', () => {
			expect(getLastDigitOfPosition(52)).toEqual('2');
			expect(getLastDigitOfPosition(46)).toEqual('6');
			expect(getLastDigitOfPosition(64)).toEqual('4');
		});
	});

	describe('getFirstDigitOfPosition(:position)', () => {
		it('Should get the first digit of those values', () => {
			expect(getFirstDigitOfPosition(52)).toEqual('5');
			expect(getFirstDigitOfPosition(46)).toEqual('4');
			expect(getFirstDigitOfPosition(64)).toEqual('6');
		});
	});

	describe('getPieceAttackingTheKing(:king, :board)', () => {
		it('Should return the bishop attacking the king', () => {
			let mockBoard = [
				new Bishop(PieceColor.WHITE, 55),
				new Bishop(PieceColor.WHITE, 36),
				new Rook(PieceColor.BLACK, 38, 'long'),
				new King(PieceColor.BLACK, 33),
				new King(PieceColor.WHITE, 11)
			];
			mockBoard = mockBoard.map((piece) => {
				piece.availableMoves = piece.getAvailablePositions(mockBoard, [], false);
				return piece;
			});
			const pieceAttackingTheKing = getPieceAttackingTheKing(
				new King(PieceColor.BLACK, 33),
				mockBoard
			);
			expect(pieceAttackingTheKing.length).toEqual(1);
			expect(pieceAttackingTheKing[0].type).toEqual('bishop');
		});
	});

	describe('getBoardWithoutPiece(:board, :piece)', () => {
		it('Should return the board without the specified piece', () => {
			const mockBoard = [
				new Bishop(PieceColor.WHITE, 55),
				new Bishop(PieceColor.WHITE, 36),
				new Rook(PieceColor.BLACK, 38, 'long'),
				new King(PieceColor.BLACK, 33),
				new King(PieceColor.WHITE, 11)
			];
			const boardWithoutPiece = getBoardWithoutPiece(
				mockBoard,
				new Rook(PieceColor.BLACK, 38, 'long')
			);
			expect(boardWithoutPiece.length).toEqual(4);
			expect(boardWithoutPiece[0].type).toEqual(PieceType.BISHOP);
			expect(boardWithoutPiece[1].type).toEqual(PieceType.BISHOP);
			expect(boardWithoutPiece[2].type).toEqual(PieceType.KING);
			expect(boardWithoutPiece[3].type).toEqual(PieceType.KING);
			const boardWithoutPiece2 = getBoardWithoutPiece(mockBoard, new Bishop(PieceColor.WHITE, 55));
			expect(boardWithoutPiece2.length).toEqual(4);
			expect(boardWithoutPiece2[0].type).toEqual(PieceType.BISHOP);
			expect(boardWithoutPiece2[1].type).toEqual(PieceType.ROOK);
			expect(boardWithoutPiece2[2].type).toEqual(PieceType.KING);
			expect(boardWithoutPiece2[3].type).toEqual(PieceType.KING);
		});
	});

	describe('isCheckWithoutPieceOnBoard(:board, :pieceToCheck)', () => {
		it('Should not be check without the piece', () => {
			const mockBoard = [
				new Bishop(PieceColor.WHITE, 55),
				new Bishop(PieceColor.WHITE, 36),
				new Rook(PieceColor.BLACK, 38, 'long'),
				new King(PieceColor.BLACK, 33),
				new King(PieceColor.WHITE, 11)
			];
			expect(isCheckWithoutPieceOnBoard(mockBoard, new Bishop(PieceColor.WHITE, 55))).toBeFalsy();
		});

		it('Should be check without the piece', () => {
			const mockBoard = [
				new Bishop(PieceColor.WHITE, 55),
				new Bishop(PieceColor.WHITE, 36),
				new Rook(PieceColor.BLACK, 38, 'long'),
				new King(PieceColor.BLACK, 11),
				new King(PieceColor.WHITE, 33)
			];
			expect(isCheckWithoutPieceOnBoard(mockBoard, new Bishop(PieceColor.WHITE, 36))).toBeTruthy();
		});
	});

	describe('filterAvailableMovesIfKingIsChecked(:board, :currentPiece, :availableMoves)', () => {
		it('Should return an empty array if the king is attacked by 2 or more pieces', () => {
			let mockBoard = [
				new Bishop(PieceColor.BLACK, 55),
				new Rook(PieceColor.BLACK, 38, 'long'),
				new King(PieceColor.WHITE, 33),
				new King(PieceColor.BLACK, 74)
			];
			mockBoard = mockBoard.map((piece) => {
				piece.availableMoves = piece.getAvailablePositions(mockBoard, [], false);
				return piece;
			});
			expect(
				filterAvailableMovesIfKingIsChecked(
					mockBoard,
					new Bishop(PieceColor.WHITE, 25),
					[25, 34, 43]
				)
			).toEqual([]);
		});

		it('Should return the availableMoves array if the king is not under attack', () => {
			let mockBoard = [
				new Bishop(PieceColor.BLACK, 64),
				new Rook(PieceColor.BLACK, 48, 'long'),
				new King(PieceColor.WHITE, 33),
				new King(PieceColor.BLACK, 74)
			];
			mockBoard = mockBoard.map((piece) => {
				piece.availableMoves = piece.getAvailablePositions(mockBoard, [], false);
				return piece;
			});
			expect(
				filterAvailableMovesIfKingIsChecked(
					mockBoard,
					new Bishop(PieceColor.WHITE, 25),
					[25, 34, 43]
				)
			).toEqual([25, 34, 43]);
		});

		it('Should return only the availableMoves that protect the king', () => {
			let mockBoard = [
				new Bishop(PieceColor.BLACK, 55),
				new Queen(PieceColor.WHITE, 46),
				new King(PieceColor.WHITE, 33),
				new King(PieceColor.BLACK, 74)
			];
			mockBoard = mockBoard.map((piece) => {
				piece.availableMoves = piece.getAvailablePositions(mockBoard, [], false);
				return piece;
			});
			const availableMoves = [
				55, 47, 48, 45, 44, 43, 42, 41, 36, 26, 16, 37, 28, 35, 24, 13
			] as Position[];
			expect(
				filterAvailableMovesIfKingIsChecked(
					mockBoard,
					new Queen(PieceColor.WHITE, 46),
					availableMoves
				)
			).toEqual([55, 44]);

			let mockBoard2 = [
				new Rook(PieceColor.BLACK, 38, 'long'),
				new Queen(PieceColor.WHITE, 46),
				new King(PieceColor.WHITE, 33),
				new King(PieceColor.BLACK, 74)
			];
			mockBoard2 = mockBoard2.map((piece) => {
				piece.availableMoves = piece.getAvailablePositions(mockBoard2, [], false);
				return piece;
			});
			expect(
				filterAvailableMovesIfKingIsChecked(
					mockBoard2,
					new Queen(PieceColor.WHITE, 46),
					availableMoves
				)
			).toEqual([36, 37, 35]);
		});
	});
});
