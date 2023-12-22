/** Redraw entire canvas from model. */

export function redrawCanvas(model, canvasObj, appObj) {
    const ctx = canvasObj.getContext('2d');
    if (ctx === null) { return; }    // here for testing purposes...
    
    // clear the canvas area before rendering the coordinates held in state
    ctx.clearRect( 0,0, canvasObj.width, canvasObj.height);  

    // draws squares based on information? Perhaps you can use some of this concept
    let size = model.board.size
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let square = model.board.grid[r][c]
        let x = c * 50
        let y = r * 50
        let w = 50
        let h = 50
        ctx.lineWidth = 1;
        if (square.color) {
          ctx.fillStyle = square.color
        } else {
          ctx.fillStyle = 'white'
        }
        ctx.fillRect(x, y, w, h)
        ctx.strokeRect(x, y, w, h)
      }
    }
console.log(model)
    
    // THEN draw ninjase
    let image = document.getElementById('ninjase');

    image.onload = function () {
      ctx.drawImage(image, Math.abs(model.ninjaColumn)* 50, (model.ninjaRow) *50, 100, 100)

  };

  ctx.drawImage(image, Math.abs(model.ninjaColumn)* 50, (model.ninjaRow) *50, 100, 100)


    
}

