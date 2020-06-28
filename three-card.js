var game_started;
var pile = ["deck"];
var players = [];
var deck = ["AS", "AH", "AC", "AD", "2S", "2H", "2C", "2D", "3S", "3H", "3C", "3D", "4S", "4H", "4C", "4D",
              "5S", "5H", "5C", "5D", "6S", "6H", "6C", "6D", "7S", "7H", "7C", "7D", "8S", "8H", "8C", "8D",
              "9S", "9H", "9C", "9D", "10S", "10H", "10C", "10D", "JS", "JH", "JC", "JD", "QS", "QH", "QC", "QD", "KS", "KH", "KC", "KD"];
var ThreeCard = (function() {
  var pub = {};
  function shuffle(array) {
    for (var i = array.length - 1; i > 0; i-- ){
      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
    return array;
  };
  function player(id) {
    // Id = 0 is the player, every other one is the computer
    this.id = id;
    // each card is a new card_tuple element
    this.hand = [];
    this.top = [];
    this.bottom = [];
    this.lowestPlayable = function() {
      var lowest = pile[pile.length - 1];
      var new_lowest = lowest;
      for (var i = 0; i < this.hand.length; i += 1) {
        var card_played = this.hand[i];
        if (ThreeCard.card_value(card_played) === ThreeCard.card_value(new_lowest)) {
          return this.hand[i];
        } else if (ThreeCard.card_value(new_lowest) > ThreeCard.card_value(card_played)) {
          new_lowest = this.hand[i];
        }
      }
      if (new_lowest !== lowest) {
        return new_lowest;
      }
      return -1
    }
    this.draw = function() {
      while (this.hand.length < 3) {
        if (deck.length > 0) {
          var temp_val = deck.pop();
          this.hand.push(temp_val);
        } else if (this.hand.length === 0) {
          if (this.top.length !== 0) {
            this.hand = this.top;
            this.top = [];
          } else if (this.bottom.length !== 0) {
            var temp_val = this.bottom.pop();
            this.hand.push(temp_val);
          } else {
            alert("Player " + this.id + " has won the game.");
            game_started = false;
          }
          break;
        } else {
          break;
        }
      }
    }
    this.put = function(card) {
      //Finds all the cards in the array
      //To_remove is filtered.length
      var filtered = this.hand.filter(function(value, index, arr) {
        return value === card;
      });
      var new_hand = this.hand.filter(function(value, index, arr) {
        return value !== card;
      });
      this.hand = new_hand;
      var to_remove = filtered.length;
      for (var i = 0; i < to_remove; i += 1) {
        pile.push(filtered[i]);
      }
      //Filtered contains card value and its index (img, card)
      // Return card img index to place on top of deck
    }
    this.pick = function() {
      for (var i = 0; i < pile.length; i += 1) {
        this.hand.push(pile[i]);
      }
      pile = [];
    }
  }
  pub.setup = function(p) {
    //Populates deck with img values
    //Shuffles the values in the deck
    deck = shuffle(deck);
    var temp_deck = [];
    for (var i = 0; i < p; i += 1) {
      players.push(new player(i));
    }
    for (var i = 0; i < players.length; i += 1) {
      for (var j = 0; j < 3; j += 1) {
        var temp_val = deck.pop();
        players[i].bottom.push(temp_val);
      }
      for (var j = 0; j < 6; j += 1) {
        var temp_val = deck.pop();
        players[i].hand.push(temp_val);
      }
    }
  }
  pub.card_value = function(card) {
    //alert(new_card);
    var new_card = card.substring(0, 1);
    //Two (reset)
    if (new_card == "2") {
      return 15;
    }
    //Ten (reset/blow-up)
    else if (new_card == "1") {
      return 16;
    }
    //Ace
    if (new_card == "A") {
      return 14;
    }
    else if (new_card == "K") {
      return 13;
    }
    else if (new_card == "Q") {
      return 12;
    }
    else if (new_card == "J") {
      return 11;
    }
    else if (new_card == "d") {
      return 0;
    }
    //Everything else
    return new_card;
  }
  return pub;
})();
$(document).ready(ThreeCard);
