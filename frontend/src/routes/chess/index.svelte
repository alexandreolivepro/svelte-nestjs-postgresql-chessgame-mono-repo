<svelte:head>
	<title>Chessgame</title>
	<meta name="description" content="The chessboard game" />
</svelte:head>

<script lang="ts">
	import { onDestroy } from "svelte";
	
	import Chessboard from "$lib/chess/components/Chessboard.svelte";
	import type { GameStore } from "$lib/chess/models/game-store.model";
	import type { ChessPiece } from "$lib/chess/models/pieces/chess-piece.model";
	import { defaultGame } from "$lib/chess/config";
	import gameStore from "$lib/chess/stores/game.store";
	import { getOppositeColor } from "$lib/chess/utils/chessboard.utils";

	let currentGame: GameStore;
	gameStore.setGame(defaultGame);

	const unsubscribe = gameStore.subscribe((game) => {
		currentGame = game;
	});

	onDestroy(() => {
		unsubscribe();
	});

	function handlePieceClick(event: CustomEvent<ChessPiece>): void {
		const { detail: piece } = event;

		if (piece.color === currentGame.nextColorToPlay) {
			gameStore.setSelectedPiece(piece);
		} else if (piece.color === getOppositeColor(currentGame.selectedPiece?.color)) {
			gameStore.addMove(piece.position.toString());
		}
	}

	function handleMovePiece(event: CustomEvent<{square: string}>): void {
		gameStore.addMove(event.detail.square);
	}
</script>
	
<Chessboard
	chessboardPieces="{currentGame.board}"
	selectedPiece="{currentGame.selectedPiece}"
	availableMoves="{currentGame.availableMoves}"
	on:pieceClick="{handlePieceClick}"
	on:movePiece="{handleMovePiece}"
></Chessboard>

{currentGame.checkStatus}