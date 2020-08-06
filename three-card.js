var game_started;
var players = [];
var disc = [];
var draw_deck = ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS",
  "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
  "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC",
  "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"
];
var ThreeCard = (function() {
  var pub = {};

  function shuffle_cards() {
    for (var i = draw_deck.length - 1; i > 0; i = i - 1) {
      const j = Math.floor(Math.random() * i)
      const temp = draw_deck[i];
      draw_deck[i] = draw_deck[j];
      draw_deck[j] = temp;
    }
  }

  function player(id) {
    // Id = 0 is the player, every other one is the computer
    this.id = id;
    //Keeps track of players hands
    this.hand = [];
    this.top = [];
    this.bottom = [];
    this.low;
    //Makes strings for APICards
    //Finds the lowest card in a players hand
    this.lowestCard = function() {
      var lowest = 100;
      var lowest_card;
      for (var i = 0; i < this.hand.length; i += 1) {
        if (this.card_value(this.hand[i]) < lowest) {
          lowest = this.card_value(this.hand[i]);
          lowest_card = this.hand[i];
        }
      }
      return lowest_card;
    }
    //Returns lowest *playable* card object
    this.lowestPlayable = async function() {
      var lower;
      var exPile = disc[disc.length - 1];
      if (exPile === -1 || this.card_value(exPile) === 15) {
        lower = this.lowestCard();
        this.low = this.hand.filter(val => this.card_value(val) === this.card_value(lower));
      } else {
        var new_lowest = "N";
        var nlowest;
        for (var i = 0; i < this.hand.length; i += 1) {
          if (this.card_value(this.hand[i]) === this.card_value(exPile)) {
            lower = this.hand[i];
            this.low = this.hand.filter(val => this.card_value(val) === this.card_value(lower));
            return false;
          } else if (this.card_value(this.hand[i]) > this.card_value(exPile)) {
            if (this.card_value(this.hand[i]) <= this.card_value(new_lowest)) {
              new_lowest = this.hand[i];
              nlowest = this.hand[i];
            }
          }
        }
        if (new_lowest === "N") {
          this.low = -1;
        } else {
          lower = nlowest;
          this.low = this.hand.filter(val => this.card_value(val) === this.card_value(lower));
        }
      }
    }
    this.draw = async function() {
      if (this.hand.length < 3 && draw_deck.length > 0) {
        var new_cards;
        if (draw_deck.length >= 3) {
          new_cards = 3 - this.hand.length;
        } else if (draw_deck.length < (3 - this.hand.length)) {
          new_cards = draw_deck.length;
        }
        else{
          new_cards = 3 - this.hand.length;
        }
        for(var i = 0; i < new_cards; i += 1){
          var temp_val = draw_deck.pop();
          this.hand.push(temp_val);
        }
      } else if (this.hand.length === 0 && draw_deck.length === 0) {
        if (this.top.length !== 0) {
          this.hand = this.top;
          this.top = [];
          if(this.id === 0){
            $("#top").empty();
            $("#top").append("<img class='top1' src='images/deck.svg' alt='deck'>" +
              "<img class='top2' src='images/deck.svg' alt='deck'>" +
              "<img class='top3' src='images/deck.svg' alt='deck'>");
          } else{
            $("#op" + this.id + "top").empty();
            $("#op" + this.id + "top").append("<img class='op" + i + "top1' src='images/deck.svg' alt='deck'>" +
              "<img class='op" + i + "top2' src='images/deck.svg' alt='deck'>" +
              "<img class='op" + i + "top3' src='images/deck.svg' alt='deck'>");
          }
        } else if (this.bottom.length !== 0) {
          //Removes first value of the array
          var bottom_card = this.bottom.pop();
          this.hand.push(bottom_card);
          if(this.id === 0){
            $("#top").empty();
            for (var i = 0; i < this.bottom.length; i += 1) {
              $("#top").append("<img class='unknown" + i + "' src='images/deck.svg' alt='unknown" + i + "'>");
            }
            $("#cards").append("<img class='user_cards' src='images/deck.svg' alt='unknown'>");
            this.hand.push("unknown");
          }
          else{
            $("#op" + this.id + "top").empty();
            for (var i = 0; i < this.bottom.length; i += 1) {
              $("#op" + this.id + "top").append("<img class='unknown" + i + "' src='images/deck.svg' alt='unknown" + i + "'>");
            }
          }

        } else {
          alert("Player " + this.id + " has won the game.");
          game_started = false;
        }
      }
    }
    this.put = async function(card) {
      this.hand = this.hand.filter(val => val !== card);
      disc.push(card);
      $("#deck").append("<img class='deck_cards' src='images/" + card + ".svg' alt='" + card + "'>");
    }
    this.pick = async function() {
      for (var i = 1; i < disc.length; i += 1) {
        this.hand.push(disc[i]);
      }
      disc = [];
      disc.push(-1);
      $("#deck").empty();
      $("#deck").append("<img src='images/deck.svg' alt='deck'>");
    }
    //Takes card codes
    this.card_value = function(card) {
      var new_card = String(card);
      new_card = new_card.substring(0, 1);
      //Ten (reset/blow-up)
      if (new_card === "1") {
        return 16;
      }
      //Two (reset)
      if (new_card === "2") {
        return 15;
      }
      //Ace
      if (new_card === "A") {
        return 14;
      } else if (new_card === "K") {
        return 13;
      } else if (new_card === "Q") {
        return 12;
      } else if (new_card === "J") {
        return 11;
      } else if (new_card === "N") {
        return 100;
      }
      //Everything else
      return new_card;
    }
  }
  pub.setup = async function(p) {
    //Initialize disc with lowest value
    disc.push(-1);
    shuffle_cards();
    for (var i = 0; i < p; i += 1) {
      players.push(new player(i));
      //Adds 3 cards to the face down hand
      for(var j = 0; j < 6; j += 1){
        if (j < 3){
          var temp_val = draw_deck.pop();
          players[i].bottom.push(temp_val);
        }
        var new_temp = draw_deck.pop();
        players[i].hand.push(new_temp);
      }
    }
  }
  return pub;
})();
