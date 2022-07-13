<script lang="ts">
    import type { ChessPiece } from "../models/pieces/chess-piece.model";

    export let piece: ChessPiece;
    export let isSelected: boolean;
</script>

<style lang="scss">
    $rows: '8', '7', '6', '5', '4', '3', '2', '1';
    $columns: '1', '2', '3', '4', '5', '6', '7', '8';

    div {
        position: absolute;
        width: $sizeSquare;
        height: $sizeSquare;
    }

    .is-selected {
        background: yellow;
    }

    @for $i from 1 through length($rows) {
        @for $j from 1 through length($columns) {
            .square-#{nth($columns, $j)}#{nth($rows, $i)} {
                transform: translate(($j * $sizeSquare) - $sizeSquare, ($i * $sizeSquare) - $sizeSquare);
            }
        }
    }
</style>

<div
    class="color-{piece.color} square-{piece.position}"
    class:is-selected={isSelected}
    on:click>
    {piece.type} {piece.position}
</div>
