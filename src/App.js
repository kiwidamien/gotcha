import React from 'react';
import './App.css';

const EMPTY = 0;
const RED = 1;
const YELLOW = 2;

function Cell(props){
  let colors = new Map([
    [EMPTY, 'white'],
    [RED, 'red'],
    [YELLOW, 'yellow'],
  ]);

  var cellColor = colors.get(props.value) || 'black';

  return (
    <div className="gotcha_cell">
      <svg viewBox="0 0 70 70">
        <circle cx="35" cy="35" r="25" fill={cellColor}/>
      </svg>
    </div>
  );
}

class GotchaRow extends React.Component {

  renderCell(c){
    let value = EMPTY;
    let colRelInner = c - 1 + this.props.offset;
    if ((colRelInner >= 0) & (colRelInner < 3)){
      value = this.props.squares[colRelInner];
    }

    return (
      <Cell
        value={value}
        key={c}
      />
    );
  }

  render(){
    const xShift = 70 + 70*this.props.offset;
    const style = {
      transform: `translateX(${xShift}px)`
    };

    return (
        <div className="gotcha_row" style={style}>
          {Array(5).fill(null)
                   .map( (_,col) => this.renderCell(col) )}
        </div>
    );
  }
}

class GotchaBoard extends React.Component {
  renderRow(rowNum){
    return(
      <GotchaRow className="gotcha_row"
          row={rowNum}
          key={rowNum}
          squares={this.props.squares.slice(3*rowNum, 3*rowNum + 3)}
          offset={this.props.offset[rowNum]}
      />
    );
  }

  render(){
    return (
      <div className="gotcha_board">
        { Array(3).fill(null).map( (_, row) => this.renderRow(row) ) }
      </div>
    );
  }
}

function SliderButton(props){
  return (
    <button onClick={props.onClick} disabled={!props.isValid}>
      {props.value}
    </button>
  )
};

class SliderControlPanel extends React.Component {
    renderButton(row,numShift){
        let className = "fa fa-angle-" + (Math.abs(numShift) === 2 ? 'double-' : '') + ((numShift < 0) ? 'left' : 'right');
        let direction = <i className={className} style={{fontSize: '22px'}}></i>;
        let isValid   = (Math.abs(this.props.offset[row] + numShift) < 2);
        return(
          <SliderButton
            value={direction}
            onClick={() => this.props.onClick(row,numShift)}
            isValid={isValid}
            key={row + ',' + numShift}
          />
        );
    }

    render(){
      return(
        <div>
          {
            Array(3).fill(null).map( (_, row) => {
              return (
              <div className="gotcha_control_panel" key={row}>
                { this.props.shiftValues.map((numShift) => this.renderButton(row,numShift)) }
              </div>
            );
            })
          }
        </div>
    );
    }
}

class TokenDropControlPanel extends React.Component{
  render(){
    let downArrow = () => ( <i className="fa fa-angle-down" style={{fontSize: '22px'}}></i> );
    return (
      <div className="gotcha_drop_panel">
        {Array(3).fill(0).map((_,col) => {
            return <SliderButton value={downArrow()} onClick={() => this.props.onClick(col)} isValid={true} key={col}/>
        }
        )}
      </div>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      history: [
        {
          squares: Array(9).fill(0),
          offset : Array(3).fill(0)
        }
      ],
      stepNumber: 0,
      redIsNext: true
    };
  }

  putTokenInCol(colNum) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let squares = current.squares.slice();
    const offset = current.offset.slice();

    if (calculateWinner(squares, offset)){
      return;
    }

    let index = colNum;

    if (squares[index] !== EMPTY){
      return;
    }

    squares[index] = this.state.redIsNext ? RED : YELLOW;
    squares = getSquaresAfterMove(squares, offset);
    this.setState({
      history: history.concat([
        {
          squares: squares,
          offset:  offset
        }
      ]),
      stepNumber: history.length,
      redIsNext: !this.state.redIsNext
    });
  }

  shiftRow(rowNum, numToShift) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    let squares = current.squares.slice();
    const offset  = current.offset.slice();

    if (Math.abs(offset[rowNum] + numToShift) > 1) {
      return;
    }

    if (calculateWinner(squares, offset)){
      return;
    }

    const direction = (numToShift < 0) ? -1 : 1;

    while (numToShift !== 0){
      offset[rowNum] += direction;
      squares = getSquaresAfterShift(squares, rowNum, direction);
      squares = getSquaresAfterMove(squares, offset);
      numToShift -= direction;
    }

    this.setState({
      history: history.concat([
        {
          squares: squares,
          offset:  offset
        }
      ]),
      stepNumber: history.length,
      redIsNext: !this.state.redIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      redIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares, current.offset);

    const moves = history.map((step, move) => {
      const desc = move ? "Move #" + move : "Game start";
      return (
        <li key={move}>
          <a href="#" onClick={() => this.jumpTo(move)}>{desc}</a>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + ((winner === RED) ? "Red" : "Yellow");
    } else {
      status = "Next player: " + (this.state.redIsNext ? "Red" : "Yellow");
    }

    return (
      <div>
      <div className="game">
        <TokenDropControlPanel
          onClick={(c) => this.putTokenInCol(c)}/>
        <div className="board-edge top-board"></div>
        <div className="game-area">
          <SliderControlPanel
            shiftValues={[-2,-1]}
            onClick={(r,n) => this.shiftRow(r,n)}
            offset={current.offset}
          />
          <GotchaBoard
            squares={current.squares}
            offset={current.offset}
            onClick={i => this.handleClick(i)}
          />
          <SliderControlPanel
            shiftValues={[1,2]}
            onClick={(r,n) => this.shiftRow(r,n)}
            offset={current.offset}
          />
        </div>
        <div className="board-edge bottom-board"></div>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

function getSquaresAfterShift(squares, rowNum, direction) {
  var row = squares.slice(3*rowNum, 3*rowNum + 3);

  if (direction > 0){
    row.unshift(EMPTY);
    row = row.slice(0,3);
  } else {
    row.push(EMPTY);
    row = row.slice(1,4);
  }

  for (let col = 0; col < 3; col++){
    squares[3*rowNum + col] = row[col];
  }

  return squares;
}

function getSquaresAfterMove(squares, offset) {

  // move everything down, row 0 on top
  for (let col = 0; col < 3; col++){
    for (let row = 1; row >= 0; row--){
      let thisCell = 3*row + col;
      while ((squares[thisCell + 3] === EMPTY) & (thisCell + 3 < 9)){
        squares[thisCell + 3] = squares[thisCell];
        squares[thisCell] = 0;
        thisCell += 3;
      }
    }
  }

  return squares;
}


function calculateWinner(squares, offset) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const innerSquares = squares;
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (innerSquares[a] && innerSquares[a] === innerSquares[b] && innerSquares[a] === innerSquares[c]) {
      return innerSquares[a];
    }
  }
  return null;
}

export default App;
