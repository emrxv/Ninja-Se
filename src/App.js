import React from 'react';
import './App.css';
import ninjase from './ninjase.svg'
import Model, { find2x2Cluster, remove2x2Block } from './model/Model.js';
import Board from './model/Model.js'
import { isWon } from './model/Model.js'
import { find2x2ClusterContainingClick } from './model/Model.js'
import { redrawCanvas } from './boundary/Boundary.js'
import { layout } from './Layout.js'
import { config_4x4, config_5x5 } from './model/config';
import { setSelectionRange } from '@testing-library/user-event/dist/utils';

function App() {
  // initial instantiation of the Model
  const [model, setModel] = React.useState(new Model(0));  // only place where Model object is instantiated.
  const [redraw, forceRedraw] = React.useState(0);    // change values to force redraw

  const appRef = React.useRef(null);      // Later need to be able to refer to App 
  const canvasRef = React.useRef(null);   // Later need to be able to refer to Canvas


  /** Ensures initial rendering is performed, and that whenever model changes, it is re-rendered. */
  React.useEffect(() => {
    /** Happens once. */
    // selection(model, )
    redrawCanvas(model, canvasRef.current, appRef.current);
  }, [model, redraw])   // this second argument is CRITICAL, since it declares when to refresh (whenever Model changes)

  // controller to handle moving
  const moveNinjaSe = (direction) => {

    if (!isWon(model)) {
      let affectedSquares = 0;
      switch (direction) {
        case "Up":
          //Checks if ninjase is at top
          if (model.ninjaRow >= 1) {

            let ninjaAnchorColumn = model.ninjaColumn;

            //for each column above ninjase
            for (let colOffset = 0; colOffset < 2; colOffset++) {
              let col = ninjaAnchorColumn + colOffset;
              let aboveColor = model.board.grid[model.ninjaRow - 1][col].color;
              let shouldWrap = false;

              if (aboveColor === undefined || aboveColor === 'white') {
                continue;
              } else {
                let foundWhite = false;

                for (let row = model.ninjaRow - 1; row >= 0; row--) {
                  if (model.board.grid[row][col].color === undefined) {
                    foundWhite = true;
                    for (let r = row; r < model.ninjaRow - 1; r++) {
                      model.board.grid[r][col].color = model.board.grid[r + 1][col].color;
                      affectedSquares++;
                      model.board.grid[r + 1][col].color = 'white';
                    }
                    break;
                  }
                }

                // If the loop finished without finding a white cell, there is wrapping
                if (!foundWhite) {
                  shouldWrap = true;
                }

                if (shouldWrap) {
                  let tempColor = model.board.grid[0][col].color; 

                  for (let r = 0; r < model.board.grid.length - 1; r++) {
                    model.board.grid[r][col].color = model.board.grid[r + 1][col].color;
                  }
                  for (let r = 0; r < model.ninjaRow; r++) {
                    if (model.board.grid[r][col].color !== 'white' && model.board.grid[r][col].color !== undefined) {
                      affectedSquares++;
                    }
                  }

                  model.board.grid[model.board.grid.length - 1][col].color = tempColor;

                  if (tempColor !== 'white' && tempColor !== undefined) {
                    affectedSquares++;
                  }

                  for (let r = model.board.grid.length - 1; r > model.ninjaRow; r--) {
                    if (r === model.board.grid.length - 1) {
                      continue;
                    }
                    if (model.board.grid[r][col].color !== 'white' && model.board.grid[r][col].color !== undefined) {
                      affectedSquares++;
                    }
                  }

                }
              }

            }
            //moves ninjase up
            model.ninjaRow--;

            model.numMoves++;
          }
          break;


        case "Right":
          if (model.ninjaColumn !== model.config.numColumns - 2) {
            for (let rowOffset = 0; rowOffset < 2; rowOffset++) {
              let row = model.ninjaRow + rowOffset;
              let rightColor = model.board.grid[row][model.ninjaColumn + 2].color; // +2 to get the column to the right of the ninja
              let shouldWrap = false;

              if (rightColor === undefined || rightColor === 'white') {
                continue;
              } else {
                let foundWhite = false;

                // Start checking from the column to the right of the ninja
                for (let col = model.ninjaColumn + 2; col < model.config.numColumns; col++) {
                  if (model.board.grid[row][col].color === undefined) {
                    foundWhite = true;
                    for (let c = col; c > model.ninjaColumn + 1; c--) {
                      model.board.grid[row][c].color = model.board.grid[row][c - 1].color;
                      affectedSquares++;
                    }
                    model.board.grid[row][model.ninjaColumn + 1].color = undefined;
                    break;
                  }
                }

                // If no white cell is found, wrap
                if (!foundWhite) {
                  shouldWrap = true;
                }

                if (shouldWrap) {
                  let tempColor = model.board.grid[row][model.config.numColumns - 1].color; // Store the color of the rightmost block

                  for (let c = model.config.numColumns - 1; c > 0; c--) {
                    model.board.grid[row][c].color = model.board.grid[row][c - 1].color;
                  }


                  model.board.grid[row][0].color = tempColor;

                  for (let c = model.ninjaColumn + 2; c < model.config.numColumns; c++) {
                    if (model.board.grid[row][c].color !== 'white' && model.board.grid[row][c].color !== undefined) {
                      affectedSquares++;
                    }
                  }

                  for (let c = model.ninjaColumn; c >= 0; c--) {
                    if (model.board.grid[row][c].color !== 'white' && model.board.grid[row][c].color !== undefined) {
                      affectedSquares++;
                    }
                  }

                }
              }
            }

            // Moves ninjase right
            model.ninjaColumn++;

            model.numMoves++;
          }
          break;
        case "Down":
          // Checks if ninjase is at the bottom
          if (model.ninjaRow !== model.config.numRows - 2) {

            let ninjaAnchorColumn = model.ninjaColumn;

            // For each column below ninjase
            for (let colOffset = 0; colOffset < 2; colOffset++) {
              let col = ninjaAnchorColumn + colOffset;
              let belowColor = model.board.grid[model.ninjaRow + 2][col].color; 
              let shouldWrap = false;

              if (belowColor === undefined || belowColor === 'white') {
                continue;
              } else {
                let foundWhite = false;

                // Start checking from the row below the ninja downwards
                for (let row = model.ninjaRow + 2; row < model.board.grid.length; row++) {
                  if (model.board.grid[row][col].color === 'white' || model.board.grid[row][col].color === undefined) {
                    foundWhite = true;
                    for (let r = row; r > model.ninjaRow + 1; r--) { // Note: r > model.ninjaRow + 1 to not overwrite the ninja itself
                      affectedSquares++;
                      model.board.grid[r][col].color = model.board.grid[r - 1][col].color;
                    }
                    model.board.grid[model.ninjaRow + 1][col].color = undefined;
                    break;
                  }
                }

                if (!foundWhite) {
                  shouldWrap = true;
                }

                if (shouldWrap) {
                  // Perform wrapping
                  let tempColor = model.board.grid[model.board.grid.length - 1][col].color; // Store the color of the bottom block

                  for (let r = model.board.grid.length - 1; r > 0; r--) {
                    model.board.grid[r][col].color = model.board.grid[r - 1][col].color;
                  }
                  for (let r = model.board.grid.length - 1; r > model.ninjaRow + 1; r--) {
                    if (model.board.grid[r][col].color !== 'white' && model.board.grid[r][col].color !== undefined) {
                      affectedSquares++;
                    }
                  }


                  // Place the bottom block color at the top
                  model.board.grid[0][col].color = tempColor;

                  for (let r = 0; r <= model.ninjaRow; r++) {
                    if (model.board.grid[r][col].color !== 'white' && model.board.grid[r][col].color !== undefined) {
                      affectedSquares++;
                    }
                  }
                }
              }
            }

            // Moves ninjase down
            model.ninjaRow++;

            model.numMoves++;
          }
          break;
        case "Left":
          if (model.ninjaColumn !== 0) {

            for (let rowOffset = 0; rowOffset < 2; rowOffset++) {
              let row = model.ninjaRow + rowOffset;
              let leftColor = model.board.grid[row][model.ninjaColumn - 1].color;
              let shouldWrap = false;

              if (leftColor === undefined || leftColor === 'white') {
                continue;
              } else {
                let foundWhite = false;

                for (let col = model.ninjaColumn - 1; col >= 0; col--) {
                  if (model.board.grid[row][col].color === undefined || model.board.grid[row][col].color === 'white') {
                    foundWhite = true;
                    for (let c = col; c < model.ninjaColumn; c++) {
                      model.board.grid[row][c].color = model.board.grid[row][c + 1].color;
                      if (model.board.grid[row][c + 1].color !== 'white' && model.board.grid[row][c + 1].color !== undefined) {
                        affectedSquares++; 
                    }
                      
                    }
                    model.board.grid[row][model.ninjaColumn].color = undefined;
                    break;
                  }
                }

                // If no white cell is found, trigger wrapping
                if (!foundWhite) {
                  shouldWrap = true;
                }

                if (shouldWrap) {
                  // Perform wrapping for the row
                  let tempColor = model.board.grid[row][0].color; 

                  for (let c = 0; c < model.config.numColumns - 1; c++) {
                    model.board.grid[row][c].color = model.board.grid[row][c + 1].color;
                  }

                  model.board.grid[row][model.config.numColumns - 1].color = tempColor;
                
                  for (let c = model.ninjaColumn - 2; c >= 0; c--) {
                    if (model.board.grid[row][c].color !== 'white' && model.board.grid[row][c].color !== undefined) {
                      affectedSquares++;
                    }
                  }

                  for (let c = model.ninjaColumn; c < model.config.numColumns; c++) {
                    if (model.board.grid[row][c].color !== 'white' && model.board.grid[row][c].color !== undefined) {
                      affectedSquares++;
                    }
                  }
                  
                }
              }
            }

            // Moves ninjase left
            model.ninjaColumn--;

            model.numMoves++;
          }
          break;
      }
      model.score += affectedSquares;
      forceRedraw(redraw + 1);
    }


    // model.board.grid[1][3].color = 'red'
    //forceRedraw(redraw+1)   // react to changes, if model has changed.
  }

//---------------------------------------------------------------------------------------------
  function ChangeConfig(config) {
    const newModel = new Model(config);
    setModel(newModel);
  }

  function ResetConfig(config) {
    let num = 0;
    if (config === config_4x4) {
      num = 1;
    } else if (config === config_5x5) {
      num = 0;
    } else {
      num = 2;
    }
    const newModel = new Model(num);
    setModel(newModel);
  }


  //------------------------------------------------------------------------------------------


  function removeSelection() {
    let clusters = find2x2Cluster(model.board.size, model.board.grid, model)
    if (clusters === null) {
      return;
    } else {
      for (clusters of clusters) {
        remove2x2Block(clusters.row, clusters.column, model)
        model.numMoves++;
        model.score += 4;
      }
    }
    
    forceRedraw(redraw + 1);
  }

  return (
    <div className="App" ref={appRef}>
      <canvas tabIndex="1"
        data-testid="canvas"
        className="App-canvas"
        ref={canvasRef}
        width={500}
        height={500}
      />



      <div style={layout.scaling}>
        <label data-testid="score-label" style={layout.score}>{"Score: " + model.score}</label>
        <label data-testid="moves-label" style={layout.text}>{"Number of Moves: " + model.numMoves}</label>
        <button className="Config1" data-testid="Config1" style={layout.Config1} onClick={(e) => ChangeConfig(0)}   >Config 1</button>
        <button className="Config2" data-testid="Config2" style={layout.Config2} onClick={(e) => ChangeConfig(1)}  >Config 2</button>
        <button className="Config3" data-testid="Config3" style={layout.Config3} onClick={(e) => ChangeConfig(2)}   >Config 3</button>

        <button className="Reset" data-testid="Reset" style={layout.Reset} onClick={(e) => ResetConfig(model.config)}   >Reset</button>
        {isWon(model) ? (<label data-testid="victory-label" style={layout.victory}>YOU WIN CONGRATULATIONS!</label>) : null}
        <button className="Remove" data-testid="Remove" style={layout.Remove} onClick={() => removeSelection()}>Remove</button>
        {!isWon(model) ? (<div style={layout.buttons}>
          <button className="upbutton" data-testid="upbutton" style={layout.upbutton} onClick={(e) => moveNinjaSe("Up")}       >UP</button>
          <button className="leftbutton" data-testid="leftbutton" style={layout.leftbutton} onClick={(e) => moveNinjaSe("Left")}   >LEFT</button>
          <button className="rightbutton" data-testid="rightbutton" style={layout.rightbutton} onClick={(e) => moveNinjaSe("Right")}  >RIGHT</button>
          <button className="downbutton" data-testid="downbutton" style={layout.downbutton} onClick={(e) => moveNinjaSe("Down")}   >DOWN</button>
        </div>) : null}
      </div>
      <img id="ninjase" src={ninjase} alt="hidden" hidden></img>
    </div>
  );

}
export default App;
