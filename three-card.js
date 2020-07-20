var game_started;
var players = [];
var disc = [];
var ThreeCard = (function() {
  var pub = {};

  function player(id) {
    // Id = 0 is the player, every other one is the computer
    this.id = id;
    //Keeps track of players hands
    //Hands contain card objects
    this.hand = [];
    this.top = [];
    this.bottom = [];
    this.lp;
    //Returns lowest playable card object
    this.lowestPlayable = async function() {
      var exPile = disc[disc.length - 1];
      if (exPile === -1) {
        var lowest = 100;
        var lowest_card;
        for (var i = 0; i < this.hand.length; i += 1) {
          if (this.card_value(this.hand[i].code) < lowest) {
            lowest = this.card_value(this.hand[i].code);
            lowest_card = this.hand[i];
          }
        }
        this.lp = lowest_card;
        //return lowest_card;
      } else {
        var new_lowest = "N";
        //alert("exPile: " + this.card_value(exPile.code));
        var nlowest;
        for (var i = 0; i < this.hand.length; i += 1) {
          //alert("player card: " + this.card_value(this.hand[i].code));
          if (this.card_value(this.hand[i].code) === this.card_value(exPile.code)) {
            //returns entire card object
            this.lp = this.hand[i];
            return false;
            //return this.hand[i];
          }
          else if (this.card_value(this.hand[i].code) > this.card_value(exPile.code)) {
            if(this.card_value(this.hand[i].code) <= this.card_value(new_lowest)){
              new_lowest = this.hand[i].code;
              nlowest = this.hand[i];
            }
          }
        }
        if (new_lowest === "N") {
          alert("inside pick");
          this.lp = -1;
          //return -1;
        } else {
          alert("inside lowest");
          alert(JSON.stringify(nlowest));
          this.lp = nlowest;
          //return lowest;
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
          for (var i = 0; i < 3; i += 1) {
            if (i === 2) {
              card_string.concat(this.hand[i].code);
            } else {
              card_string.concat(this.hand[i].code + ",");
            }
          }
          await APICards.toHand(this.id, card_string);
        } else if (deck === 0 && this.bottom.length !== 0) {
          //Add bottom cards to players hand one-by-one here
        } else {
          alert("Player " + this.id + " has won the game.");
        }
      }
    }
    this.put = async function(card) {
      //card is only a cards code
      //Consider putting amount of cards being put down
      //alert("Card " + JSON.stringify(card));
      disc.push(await APICards.discard(this.id, "stack", card));
      //alert(JSON.stringify(disc));
      this.hand = this.hand.filter(val => val.code !== card);
      //this.draw();
    }
    this.pick = async function() {
      var card_string = "";
      for (var i = 1; i < disc.length; i += 1) {
        if (i === disc.length - 1) {
          alert("Pick " + JSON.stringify(disc[i].code));
          card_string += disc[i].code;
        } else {
          card_string += disc[i].code + ',';
        }
        this.hand.push(disc[i]);
      }
      //alert(card_string);
      await APICards.discard("stack", this.id, card_string);
      disc = [];
      disc.push(-1);
    }
    //takes card codes
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
      //await APICards.listHand(players[i].id + "bottom");
      //Puts the card values into the player's hand
      players[i].hand = await APICards.draw(players[i].id, 6);
      //players[i].hand = await APICards.listHand(players[i].id);
    }
  }
  //Takes card codes
  return pub;
})();
$(document).ready(ThreeCard);
