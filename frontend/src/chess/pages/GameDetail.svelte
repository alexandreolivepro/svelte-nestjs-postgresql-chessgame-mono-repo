<script lang="ts">
import { onDestroy } from "svelte";

    import Chessboard from "../components/Chessboard.svelte";
    import type { GameStore } from "../models/game-store.model";
    import type { ChessPiece } from "../models/pieces/chess-piece.model";
    import { defaultGame } from "../config";
    import gameStore from "../stores/game.store";
    import { getOppositeColor } from "../utils/chessboard.utils";

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