const circHeight = "16%";
const styles = {
	strictEnabled: {
		'background-color': '#ce5a39',
	},
	
	highlight: {
		'box-shadow': '0px 0px 10px 30px #0ff',
		'zIndex': '-1'
	},
	
	notHighlight: {
		//'zIndex': '5',
	},
	
	quarterTL: {
		'border-top-left-radius': '100%',
		'padding-top': circHeight,
		'background-color': 'yellow',
	},
	
	quarterTR: {
		'border-top-right-radius': '100%',
		'padding-top': circHeight,
		'background-color': 'green',
	},
	quarterBL: {
		'border-bottom-left-radius': '100%',
		'padding-bottom': circHeight,
		'background-color': 'blue',
	},
	quarterBR: {
		'border-bottom-right-radius': '100%',
		'padding-bottom': circHeight,
		'background-color': 'red',
	},
	counter: {
		'border-style': 'solid',
		'border-width': '1px',
		'padding': '5px 5px 5px 5px',
		'margin': '0px 0px -1px 0px',
		'background-color': '#3d5c5c',
		'color': 'white'
	},
	message: {
		'padding': '5px 5px 5px 15px'
	}
}

class App extends React.Component {
  constructor(props) {
    super(props);
    
		this.basePlaySpeed = 500;
    this.state = {
			sequence: [],
			speedMult: 1,
			progress: 0,
			message: "Click restart to play...",
			boardHighlight: 0,
			cpuTurn: 0,
			strict: 0
    }
	}
	
  render() {
		return (
			<div>
				<StatusBar
					plyrProgress = {this.state.sequence.length}
					message = {this.state.message}
					changeStrict = {this.changeStrict.bind(this)}
					resetGame = {this.resetGame.bind(this)}
					strict = {this.state.strict}
				/>

				<GameBoard
					sequence = {this.state.sequence}
					boardHighlight = {this.state.boardHighlight}
					playerClick = {this.playerClick.bind(this)}
				/>
			</div>
		);
	}
	
	changeStrict() {
	  const st = this.state.strict;
	  this.setState({strict: !st});
	}
	
	resetGame() {
		this.setState({
			sequence: [],
			speedMult: 1,
			progress: 0,
			cpuTurn: 1
		}, this.addToSequence);
	}
	
	addToSequence() {
	  // call end of game if sequence length is 20
	  if (this.state.sequence.length == 20) {
	    this.setState(
	      {
	        message: 'You win! Excellent memory! Click restart to play again...'
	      }
	    )
	  } else {
  	  
  		// pick a random number between 1 and 4 - this will correspond to
  		// a button index (TL = 1, TR = 2, BL = 3, BR = 4)
  		const randButton = Math.floor(Math.random()*4+1);
  		this.setState(
  			{
  			  message: 'Simon says...',
  				sequence: [...this.state.sequence, randButton]
  			},
  			()=>{this.playSequence(0);}
  		);
	  }
	}
	
	// get the button [index] to highlight its div
	// and play the related button sound
	playButton(index, mult) {
		this.setState(
			{boardHighlight: index},
			() => {
				var a = new Audio(
					'https://s3.amazonaws.com/freecodecamp/simonSound'+index+'.mp3'
				);
				console.log(mult);
				a.playbackRate = mult;
				a.play();
			}
		);
		
		setTimeout(() => this.setState({boardHighlight: 0}), this.basePlaySpeed);
	}
	
	playSequence(i) {
	  if (i < this.state.sequence.length) {
  		setTimeout(
  				() => {
  				  this.playButton(this.state.sequence[i], this.state.speedMult);
  				  this.playSequence(i+1);
  				},
  				this.basePlaySpeed / this.state.speedMult,
  				this.state.sequence[i]
  			);
		} else {
  		this.setState(
  		  {
  		    cpuTurn:0,
  		    message:"Your turn..."
  		  }
		  );
		};
	}
	
	playerClick(i) {
		if (this.state.cpuTurn) {return};
		const p = this.state.progress;
		
		// check if this was the right move in sequence
		// if it was right, play the sound and increment
		// progress count
		if (i == this.state.sequence[p]) {
			this.playButton(i, this.state.speedMult);
			this.setState({progress: p+1})
			
			// increment game speed at certain intervals
			// on the 5th, 9th, and 13th step
			const seqLen = this.state.sequence.length;
			
			var newMult = 1;
			if (seqLen >=12) {newMult = 2.0}
			else if (seqLen >= 8) {newMult = 1.7}
			else if (seqLen >= 4) {newMult = 1.3};
				
			this.setState({speedMult: newMult});
			
			
			
			// set the turn back to CPU when player has made it
  		// all the way through sequence.
  		if (this.state.sequence.length == p+1) {
  			
    		// pause for half a second first to let
    		// player click sound play
  			setTimeout(
  			  ()=>{
  			    this.setState(
      			  {
      			    cpuTurn: 1,
      			    progress: 0
      			  }
      			);
      			this.addToSequence();
  			  },
  			  500
  			 );
  			
  			
  			
  		}
			
		} else {
		  
		  // if it was wrong, display message saying you failed
		  // depending on whether or not we are playing in strict mode
	  	// either restart game or let player start over
	  	if (this.state.strict) {
			  this.setState(
			    {
			      message: "WRONG. Click restart to play again...",
			      cpuTurn: 1
			    }
			  );
			  
			  // don't change anything else; holding onto cpuTurn will
			  // force the player to click Restart in order for anything
			  // else to happen
			  
	  	} else {
	  		
	  		// if player was wrong and strict mode was off
	  		// player gets to try again. replay the whole sequence to refresh their
	  		// memory
	  	  this.setState(
	  	    {
	  	      message:"WRONG! Try again...",
	  	      progress: 0,
	  	      cpuTurn: 1
	  	    }
	  	  );
	  	  this.playSequence(0);
	  	}

		}
		

	}
	
};

function StatusBar(props) {
	
	return (
		<div className="container-fluid" id="statusBar">
			<div className="row">
				<button
					onClick={props.changeStrict}
					style={props.strict ? styles.strictEnabled : {}}
				>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M18.6,6.62C17.16,6.62 15.8,7.18 14.83,8.15L7.8,14.39C7.16,15.03 6.31,15.38 5.4,15.38C3.53,15.38 2,13.87 2,12C2,10.13 3.53,8.62 5.4,8.62C6.31,8.62 7.16,8.97 7.84,9.65L8.97,10.65L10.5,9.31L9.22,8.2C8.2,7.18 6.84,6.62 5.4,6.62C2.42,6.62 0,9.04 0,12C0,14.96 2.42,17.38 5.4,17.38C6.84,17.38 8.2,16.82 9.17,15.85L16.2,9.61C16.84,8.97 17.69,8.62 18.6,8.62C20.47,8.62 22,10.13 22,12C22,13.87 20.47,15.38 18.6,15.38C17.7,15.38 16.84,15.03 16.16,14.35L15,13.34L13.5,14.68L14.78,15.8C15.8,16.81 17.15,17.37 18.6,17.37C21.58,17.37 24,14.96 24,12C24,9 21.58,6.62 18.6,6.62Z"></path>
					</svg>
				</button>

				<button onClick={props.resetGame}>
					<svg width="24" height="24" viewBox="0 0 24 24">
						<path d="M19,8L15,12H18A6,6 0 0,1 12,18C11,18 10.03,17.75 9.2,17.3L7.74,18.76C8.97,19.54 10.43,20 12,20A8,8 0 0,0 20,12H23M6,12A6,6 0 0,1 12,6C13,6 13.97,6.25 14.8,6.7L16.26,5.24C15.03,4.46 13.57,4 12,4A8,8 0 0,0 4,12H1L5,16L9,12"></path>
					</svg>
				</button>

				<div id="counter" style={styles.counter}>
					{props.plyrProgress < 10 ? '0' + props.plyrProgress: props.plyrProgress}
				</div>
				
				<div style={styles.message}>
					{props.message}
				</div>
			</div>
		</div>
	);
}

class GameBoard extends React.Component {
	constructor(props) {
		super(props);
	}
	

	render() {
		return(
			<div className="container-fluid">
				<div className="row justify-content-center">
					<div
						index = "1"
						high = 'false'
						className = "buttonSlice col-2"
						style = {
							Object.assign(
								{},
								styles.quarterTL,
								this.props.boardHighlight == 1 ?
									styles.highlight :
									styles.notHighlight
							)
						}
						onClick = {this.props.playerClick.bind(this,1)}
					/>
					<div
						index = "2"
						ref = "btn2"
						className = "buttonSlice col-2"
						style = {
							Object.assign(
								{},
								styles.quarterTR,
								this.props.boardHighlight == 2 ?
									styles.highlight :
								styles.notHighlight
							)
						}
						onClick = {this.props.playerClick.bind(this,2)}
					/>
				</div>
				<div className="row justify-content-center">
					<div
						index = "3"
						ref = "btn3"
						className = "buttonSlice col-2"
						style = {
							Object.assign(
								{},
								styles.quarterBL,
								this.props.boardHighlight == 3 ?
									styles.highlight :
									styles.notHighlight
							)
						}
						onClick = {this.props.playerClick.bind(this,3)}
					/>
					<div
						index = "4"
						ref = "btn4"
						className = "buttonSlice col-2"
						style = {
							Object.assign(
								{},
								styles.quarterBR,
								this.props.boardHighlight == 4 ?
									styles.highlight :
									styles.notHighlight
							)
						}
						onClick = {this.props.playerClick.bind(this,4)}
					/>
				</div>
			</div>
		);
	};

};


const app = (
  <App />
);

ReactDOM.render(
  app,
  document.getElementById("root")
);