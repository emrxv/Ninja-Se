import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Model from './model/Model.js';
import App from './App';

// default puzzle to use
import { puzzleInformation } from './model/Puzzle.js'; 
import { Up, Down, Left, Right } from './model/Model.js';
import { movePiece } from './controller/Controller.js';

import { puzzleInformation as testInformation } from './model/TestPuzzle.js'; 

var actualPuzzle = JSON.parse(JSON.stringify(puzzleInformation));   // parses string into JSON object, used below.

test('No moves when model created', () => {
  var model = new Model(actualPuzzle);

  expect(model.numMoves).toBe(0)
});

test('Properly renders 0 moves', () => {
  const { getByText } = render(<App />);
  const movesElement = getByText(/number moves: 0/i);
  expect(movesElement).toBeInTheDocument();
});

test('Access GUI', () => {
  const { getByText } = render(<App />);

  const leftButton = screen.getByTestId('leftbutton');
  const rightButton = screen.getByTestId('rightbutton');
  const canvasElement = screen.getByTestId('canvas');

  // initially, this button
  expect(leftButton.disabled).toBeTruthy()
  expect(rightButton.disabled).toBeTruthy()

  // where I click the mouse and this enables some of the buttons
  // 591 570 186 444
  fireEvent.click(canvasElement, { screenX: 591, screenY: 570, clientX:186, clientY: 444} )

   // now this button is NOT disabled
   expect(leftButton.disabled).toBeFalsy()
   expect(rightButton.disabled).toBeFalsy()

   // make a left move
   fireEvent.click(leftButton);

   // no longer can go further left.
   expect(leftButton.disabled).toBeTruthy()

   const movesElement = getByText(/number moves: 1/i);
   expect(movesElement).toBeInTheDocument();
});

test('First valid moves', () => {
  var model = new Model(actualPuzzle);
  var pieceJ = model.puzzle.pieces.find(p => p.label === 'J')
  model.puzzle.select(pieceJ)
  expect(model.puzzle.selected).toBe(pieceJ)

  // now what moves are available? only left and right
  expect(model.available(Left)).toBe(true)
  expect(model.available(Right)).toBe(true)
  expect(model.available(Up)).toBe(false)
  expect(model.available(Down)).toBe(false)

  movePiece(model, Left);
  expect(pieceJ.column).toBe(0)     // moved piece J off to the edge.

  var pieceA = model.puzzle.pieces.find(p => p.label === 'A')
  model.puzzle.select(pieceA)
  expect(model.puzzle.selected).toBe(pieceA)
  expect(model.available(Left)).toBe(false)
  expect(model.available(Right)).toBe(false)
  expect(model.available(Up)).toBe(false)
  expect(model.available(Down)).toBe(false)
});


describe('Separately define a new suite', () => {
  test('Test puzzle', () => {
    expect(testInformation).toBeTruthy()
  });
});