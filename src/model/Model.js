import { config_4x4, config_5x5, config_6x6 } from "./config";

// someone needs to know about these configurations. Perhaps we should!
const configs = [config_5x5, config_4x4, config_6x6]


// wouldn't it be useful to have a Square class?
export class Square {
    constructor(row, column) {
        this.row = row
        this.column = column
    }
}

export class Board {
    constructor(size) {
        this.size = size

        this.grid = Array.from(Array(size), () => new Array(size));

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                this.grid[r][c] = new Square(r, c)
            }
        }

        // how you access a square by its [row][column] location
        // this.grid[2][4]
    }


}

// a method that might be useful
export function isWon(model) {
    for (let row = 0; row < model.board.grid.length; row++) {
        for (let column = 0; column < model.board.grid[row].length; column++) {
            const color = model.board.grid[row][column]?.color;
            if (color && color.toLowerCase() !== 'white') {
                return false;
            }
        }
    }
    return true;
}

export function find2x2Cluster(boardSize, grid, model) {
    let clusters = []; // Initialize an array to hold the top-left corners of each 2x2 cluster

    for (let r = 0; r < boardSize - 1; r++) {
        for (let c = 0; c < boardSize - 1; c++) {
            // Check if the current 2x2 block is of the same color
            const color = grid[r][c]?.color;
            if (color && // Make sure the color is not white/undefined
                grid[r][c + 1]?.color === color &&
                grid[r + 1][c]?.color === color &&
                grid[r + 1][c + 1]?.color === color) {

                clusters.push({ row: r, column: c }); // Add the top-left corner of the cluster to the array
                console.log(clusters)
                return clusters;
            }
        }
    }

    return null;
}

// Remove a 2x2 block by changing its color to white
export function remove2x2Block(row, column, model) {
    if (row !== null && column !== null) {
        for (let r = row; r < row + 2; r++) {
            for (let c = column; c < column + 2; c++) {
                model.board.grid[r][c].color = undefined;
            }
        }
    }
}


export default class Model {
    // info is going to be JSON-encoded puzzle

    // 'which' is an integer 0..1..2 which selects configuration you can use.
    constructor(which) {
        this.config = configs[which]
        this.ninjaRow = this.config.ninjaRow - 1
        this.ninjaColumn = (this.config.ninjaColumn.charCodeAt(0) - 'A'.charCodeAt(0))


        this.size = Number(this.config.numColumns)
        this.board = new Board(this.size)
        this.selectionrow = null
        this.selectioncol = null

        this.numMoves = 0;
        this.score = 0;

        console.log(this.config)
        for (let info of this.config.initial) {
            console.log(info)
            //info will be ... {"color" : "red", "row" : "1", "column" : "D"},
            let row = Number(info.row) - 1
            let column = info.column.charCodeAt(0) - 'A'.charCodeAt(0)
            this.board.grid[row][column].color = info.color


        }
    }


}

