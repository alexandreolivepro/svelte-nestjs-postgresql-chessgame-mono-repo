<script lang="ts">
    import type { ChessPiece } from "../models/pieces/chess-piece.model";

    export let piece: ChessPiece;
    export let isSelected: boolean;
</script>

<style lang="scss">
    $rows: '8', '7', '6', '5', '4', '3', '2', '1';
    $columns: '1', '2', '3', '4', '5', '6', '7', '8';

    $x-position: (
        'pawn': -389px,
        'rook': -310px,
        'knight': -231px,
        'bishop': -153px,
        'queen': -71px,
        'king': 11px,
    );

    $pieces: 'king', 'queen', 'bishop', 'knight', 'rook', 'pawn';
    $colors: 'white', 'black';

    div {
        position: absolute;
        width: $sizeSquare;
        height: $sizeSquare;
    }

    .is-selected {
        background: green;
    }

    .pieces {
        background-image: url('/images/Chess_Pieces_Sprite.svg');
        background-size: 500%;
        width: 6rem;
        height: 6rem;
        display: block;
        background-repeat: no-repeat;
    }

    .white-position {
        background-position-y: 7px;
    }

    .black-position {
        background-position-y: -75px;
    }

    @each $color in $colors {
        @each $piece in $pieces {
            .#{$color}-#{$piece} {
                @extend .pieces;
                @extend .#{$color}-position;
                background-position-x: map-get($x-position, $piece);
            }
        }
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
    class="square-{piece.position} "
    class:is-selected={isSelected}>
    <i on:click class="{piece.color}-{piece.type}"></i>
</div>
