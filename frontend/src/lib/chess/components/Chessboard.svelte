<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { ChessPiece } from "../models/pieces/chess-piece.model";
    import type { Position } from '../models/position.model';
    import Piece from "./Piece.svelte";

    const dispatch = createEventDispatcher();
    
    export let chessboardPieces: ChessPiece[] = [];
    export let selectedPiece: ChessPiece;
    export let availableMoves: Position[] = [];

    const columns = [1, 2, 3, 4, 5, 6, 7, 8];
    const rows = columns.slice().reverse();

    function clickEmptySquare(event: any): void {
        if (selectedPiece && event.target instanceof HTMLDivElement) {
            dispatch('movePiece', { square: event.target?.dataset.square });
        }
    }
</script>

<style lang="scss">
    .column {
        width: $sizeSquare;
        height: $sizeSquare;
        padding: 0px;
        margin: 0px;
    }

    .row:nth-child(odd) .column:nth-child(even) {
        background: gray;
    }

    .row:nth-child(even) .column:nth-child(odd) {
        background: gray;
    }

    .chessboard {
        position: relative;
    }

    .chess-pieces {
        position: absolute;
        top: 0;
        left: 0;
    }   

    .is-available {
        background: yellow !important;
    }
</style>

<div class="chessboard container">
    {#each rows as row (row)}
        <div class="row d-flex">
            {#each columns as column (column)}
                <div
                    class="column"
                    class:is-available={!!availableMoves?.find((moves) => moves === +(column.toString() + row.toString()))}
                    data-square="{column.toString() + row.toString()}"
                    on:click="{clickEmptySquare}"
                >
                    {column}{row}
                </div>
            {/each}
        </div>
    {/each}
    {#if chessboardPieces && chessboardPieces.length > 0}
        <div class="chess-pieces">
            {#each chessboardPieces as piece}
                <Piece
                    {piece}
                    isSelected={selectedPiece?.position === piece.position}
                    on:click="{() => dispatch('pieceClick', piece)}"
                ></Piece>
            {/each}
        </div>
    {/if}
</div>
