import React from 'react';
import './instructions.css';

class Instructions extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false
    };
  }

  toggleVisible() {
    this.setState({
      visible : !this.state.visible
    }
    );
  }

  render() {
    const label = (this.state.visible) ? "Hide" : "Show";
    const mh    = (this.state.visible) ? 5000 : 0;
    return (
      <div className="instructions">
        <span className="instruction_link" onClick={()=>this.toggleVisible()}>{label} instructions</span>
        <div className="instruction_text" style={{maxHeight: mh + 'px'}}>
        <h4>To win:</h4>
        Get 3 tokens of your color in a line at the <i>end</i> of a turn.

        <h4>What can I do on my turn?</h4>
        During your turn, you can either <b>place a token in a column</b>, or <b>slide a row</b>. You should know that
        <ul>
          <li>Tokens that are not directly above the "base" (shown in blue) will fall out.</li>
          <li>Tokens will fall to the lowest empty spot in columns above the space (like Connect4)</li>
          <li>When sliding a row multiple spaces, tokens "settle" or drop after each movement.</li>
        </ul>

        <h4>Is it possible to win on the other player's turn?</h4>
        Yes. If another player slides 3 of your tokens into a line on their turn, you still win.

        <h4>Is it possible to draw?</h4>
        Yes. If a move results in both players getting three in a row, the game is a draw.

        </div>
      </div>
    );
  }

}

export default Instructions;
