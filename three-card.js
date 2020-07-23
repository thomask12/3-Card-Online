var game_started;
var players = [];
var disc = [];
var ThreeCard = (function() {
  var pub = {};

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
    this.lowestCard = function(){
      var lowest = 100;
      var lowest_card;
      for (var i = 0; i < this.hand.length; i += 1) {
        if (this.card_value(this.hand[i].code) < lowest) {
          lowest = this.card_value(this.hand[i].code);
          lowest_card = this.hand[i];
        }
      }
      return lowest_card;
    }
    //Returns lowest *playable* card object
    this.lowestPlayable = async function() {
      var exPile = disc[disc.length - 1];
      if (exPile === -1 || this.card_value(exPile.code) === 15) {
        this.low = this.lowestCard();
      } else {
        var new_lowest = "N";
        var nlowest;
        for (var i = 0; i < this.hand.length; i += 1) {
          if (this.card_value(this.hand[i].code) === this.card_value(exPile.code)) {
            //adds entire card object
            this.low = this.hand[i];
            return false;
          }
          else if (this.card_value(this.hand[i].code) > this.card_value(exPile.code)) {
            if(this.card_value(this.hand[i].code) <= this.card_value(new_lowest)){
              new_lowest = this.hand[i].code;
              nlowest = this.hand[i];
            }
          }
        }
        if (new_lowest === "N") {
          this.low = -1;
        } else {
          this.low = nlowest;
        }
      }
    }
    this.draw = async function() {
      if (this.hand.length < 3 && deck > 0) {
        if (deck >= 3) {
          var new_cards = await APICards.draw(this.id, 3 - this.hand.length);
          this.hand.push(new_cards[0]);
        } else if (deck < (3 - this.hand.length)) {
          var new_cards = await APICards.draw(this.id, deck);
          this.hand.push(new_cards[0]);
        } else {
          var new_cards = await APICards.draw(this.id, (3 - this.hand.length));
          this.hand.push(new_cards[0]);
        }
      } else if (this.hand.length === 0) {
        if (this.top.length > 0) {
          this.hand = this.top;
          var card_string = "";
          for (var i = 0; i < top.length; i += 1) {
            if (i === (top.length -1)) {
              card_string += this.hand[i].code;
            } else {
              card_string += this.hand[i].code + ",";
            }
          }
          alert("New Hand: " + JSON.stringify(this.hand));
          await APICards.discard(this.id + "top", this.id, card_string);
          this.top = [];
        } else if (deck === 0 && this.bottom.length !== 0) {
          //Add bottom cards to players hand one-by-one here
        } else {
          alert("Player " + this.id + " has won the game.");
        }
      }
    }
    this.put = async function(card) {
      //if 2 or a 10 return false, else return true;
      //card is only a cards code
      //var multiple_cards = this.hand.filter(val => val.code === card);
      //if (multiple_cards.length > )
      disc.push(await APICards.discard(this.id, "stack", card));
      this.hand = this.hand.filter(val => val.code !== card);
      await this.draw();
    }
    this.pick = async function() {
      var card_string = "";
      for (var i = 1; i < disc.length; i += 1) {
        if (i === disc.length - 1) {
          //alert("Pick " + JSON.stringify(disc[i].code));
          card_string += disc[i].code;
        } else {
          card_string += disc[i].code + ',';
        }
        this.hand.push(disc[i]);
      }
      await APICards.discard("stack", this.id, card_string);
      disc = [];
      disc.push(-1);
      //$("#deck").empty();
      //$("#deck").append("<img src='images/deck.jpg' alt='deck'>");
    }
    //Takes card codes
    this.card_value = function(card) {
      var new_card = String(card);
      new_card = new_card.substring(0, 1);
      //Ten (reset/blow-up)
      if (new_card === "0") {
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
      }
      else if (new_card === "N"){
        return 100;
      }
      //Everything else
      return new_card;
    }
  }
  pub.setup = async function(p) {
    //Populates deck with img values
    //Shuffles the values in the deck
    disc.push(-1);
    deck = await APICards.shuffle();
    for (var i = 0; i < p; i += 1) {
      players.push(new player(i));
      //Adds 3 cards to the face down hand
      players[i].bottom = await APICards.draw(players[i].id + "bottom", 3);
      //Puts the card values into the player's hand
      players[i].hand = await APICards.draw(players[i].id, 6);
    }
  }
  return pub;
})();
$(document).ready(ThreeCard);
