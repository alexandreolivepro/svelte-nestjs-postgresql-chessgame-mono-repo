import { PieceColor } from '../piece-color.model';
import { Bishop } from './bishop.model';

describe('chessboard.utils', () => {
	describe('getOppositeColor(:color)', () => {
		it('Should return white', () => {
			const bishop = new Bishop(PieceColor.WHITE, 33);
			expect(bishop).toBeTruthy();
		});
	});
});
