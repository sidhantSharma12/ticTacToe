const EMPTY_CELL = "";

$().ready(function(){
  var newGame = Object.create(GamePrototype);
  newGame.init();
  newGame.playGame();


});

var CellPrototype = {
  init: function(){
    this._symbol = EMPTY_CELL;
  },
  setSymbol: function(symbol){
    this._symbol = symbol;
  },
  getSymbol: function(){
    return this._symbol;
  }
};

// Responsible for getting and setting cells and determining winner/draw
var BoardPrototype = {
  init: function(){
    this._grid = [];
    for(var i = 0; i < 3; i++){
      var row = [];
      for(var j = 0; j < 3; j++){
        var cell = Object.create(CellPrototype);
        cell.init();
        row.push(cell);
      }
      this._grid.push(row);
    }
  },
  getCell: function(row,col){
    return this._grid[row][col].getSymbol();
  },
  setCell: function(row,col,symbol){
    if(this.getCell(row,col) === EMPTY_CELL){
      this._grid[row][col].setSymbol(symbol);
      return true;
    }
    return false;
  },
  checkGameOver: function(){
    if(this._win()) return "winner";
    if(this._draw()) return "draw";
    return false;
  },
  _allSame: function(arr){
    for(var i of arr){
      if(i.getSymbol() !== arr[0].getSymbol())
        return false;
    }
    return true;
  },
  _allEmpty: function(arr){
    for(var i of arr){
      if(i.getSymbol() !== EMPTY_CELL)
        return false;
    }
    return true;
  },
  _noneEmpty: function(arr){
    for(var i of arr){
      if(i.getSymbol() === EMPTY_CELL)
        return false;
    }
    return true;
  },
  _transposeGrid: function(){
    var transposed_grid = this._grid[0].map(function(col, i){
      return this._grid.map(function(row){
        return row[i];
      });
    },this);
    return transposed_grid;
  },
  _diagonalRows: function(){
    return [
      [this._grid[0][0], this._grid[1][1], this._grid[2][2]],
      [this._grid[0][2], this._grid[1][1], this._grid[2][0]]
    ];
  },
  _winningPositions: function(){
    return this._grid.concat(this._transposeGrid(), this._diagonalRows());
  },
  _win: function(){
    var positions = this._winningPositions();
    for(var i = 0; i < positions.length; i++){
      if(this._allEmpty(positions[i])) continue;
      if(this._allSame(positions[i])) return true;
    }
    return false;
  },
  _draw: function(){
    var flattened = this._winningPositions().reduce(function(a,b){
      return a.concat(b);
    });
    if(this._noneEmpty(flattened))
      return true;
    return false;
  }
}

var PlayerPrototype = {
  init: function(symbol){
    this._symbol = symbol;
  },
  get: function(){
    return this._symbol;
  }
};

var GamePrototype = {
  init: function(){
    this._players = [];
    var player1 = Object.create(PlayerPrototype),
      player2 = Object.create(PlayerPrototype);
    player1.init("X");
    player2.init("O");
    this._players.push(player1,player2);
    this._board = Object.create(BoardPrototype);
    this._board.init();
    this._startingPlayer();
  },
  _startingPlayer: function(){
    this._turn = Math.round(Math.random())?"X":"O";
  },
  _switchTurns: function(){
    this._turn = (this._turn === "X")?"O":"X";
  },
  playGame: function(){
    var row, col, symbol, msg;
    var that = this;
    $('.board-wrapper').click(function(event){
      //console.log(row+","+col);
      if(this._board.setCell(row,col,symbol)){
        msg = this._board.checkGameOver();
        $('.row:nth-child('+(row+1)+') .col:nth-child('+(col+1)+')').addClass(symbol).html(symbol);
        if(msg){
          if(msg === "winner")
            console.log("Player '" + this._turn + "' is the winner!");
          else
            console.log("Draw game!");
          this._restartGame(msg);
        }
        this._switchTurns();
      }else{
        console.log("Cell Occupied");
      }
    }.bind(this));

    $('.col').hover(function(event){
      symbol = that._turn;
      row = $(event.target).closest('.row').index('.row');
      col = $(event.target).closest('.col').index('.col')%3;
      if(that._board.getCell(row,col) === EMPTY_CELL){
        $(this).html(symbol);
      }
    }, function(){
      if(that._board.getCell(row,col) === EMPTY_CELL){
        $(this).html("");
      }
    });
  },
  _restartGame: function(msg){
    $('.board-wrapper').unbind('click');
    $('.col').unbind('mouseenter mouseleave');
    $('.board-wrapper').prepend('<div class="overlay"></div>');
    if(msg === "winner")
      $('.overlay').append('<p>Player "'+ this._turn + '" Wins!</p>');
    else
      $('.overlay').append('<p>Draw Game!</p>');
    $('.overlay').append('<p><a href="">Play Again?</a></p>');
  }
}