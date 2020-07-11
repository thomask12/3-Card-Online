var game_started;
var players = [];
var disc = [];
var ThreeCard = (function() {
  var pub = {};
  function player(id) {
    // Id = 0 is the player, every other one is the computer
    this.id = id;
    // each card is a new card_tuple element
    //Keeps track of players hands
    this.hand = [];
    this.top = [];
    this.bottom = [];
    this.lowestPlayable = async function() {
      var exPile = disc[disc.length-1];
      /*
      t is passed in and represents the current turn
      if (t !== 0){
        var exPile = await APICards.listHand("stack");
        if (exPile.length !== 0){
          lowest = exPile[exPile.length - 1].code;
        }
      }
      */
      //thisHand = await APICards.listHand(this.id);
      var new_lowest = exPile;
      for (var i = 0; i < this.hand.length; i += 1) {
        var pCard = this.hand[i].code;
        if (ThreeCard.card_value(pCard) === ThreeCard.card_value(new_lowest)) {
          return pCard;
        } else if (ThreeCard.card_value(pCard) < ThreeCard.card_value(new_lowest) && ThreeCard.card_value(pCard) > ThreeCard.card_value(new_lowest)) {
          new_lowest = this.hand[i];
        }
      }
      if (new_lowest !== exPile) {
        return new_lowest;
      }
      return -1
    }
    this.draw = async function() {
      if (this.hand.length < 3 && deck > 0) {
        if (deck >= 3) {
          await APICards.draw(this.id, 3 - this.hand.length);
        } else if (deck < (3 - this.hand.length)) {
          await APICards.draw(this.id, deck);
        } else {
          await APICards.draw(this.id, (3 - this.hand.length));
        }
      }
      else if (this.hand.length === 0){
        if (this.top.length > 0){
          var res = APICards.listHand(this.id + "top");
          var topCards = res.piles[this.id + "top"].cards;
          for (var i = 0; i < topCards.length; i += 1){
            await APICards.toHand(this.id, topCards[i].code);
          }
        }
        else if (deck === 0 && this.bottom.length !== 0){
          //Add bottom cards to players hand one-by-one here
        }
        else{
          alert("Player " + this.id + " has won the game.");
        }
      }
      this.hand = await APICards.listHand(this.id);
    }
    this.put = async function(card) {
      //card is entire cards array full of objects
      //Consider putting amount of cards being put down
      //Puts one card into the stack
      await APICards.discard(this.id, "stack", card.code);
      disc.push(card);
      var result = this.hand.filter(val => val.code !== card.code);
      this.hand = result;
      //this.hand = await APICards.listHand(this.id);
      //alert(JSON.stringify(this.hand));
      this.draw();
    }
    this.pick = async function() {
      for (var i = 0; i < disc.length; i += 1) {
        await APICards.discard("stack", this.id, disc[i].code);
        this.hand.push(disc[i]);
      }
      disc = [-1];
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
      players[i].bottom = await APICards.draw(players[i].id + "bottom", 3).cards;
      alert(players[i].bottom)
       //await APICards.listHand(players[i].id + "bottom");
      //Puts the card values into the player's hand
      await APICards.draw(players[i].id, 6);
      players[i].hand = await APICards.listHand(players[i].id);
    }
  }
  //Takes card codes
  pub.card_value = function(card) {
    //alert(new_card);
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
    //Everything else
    return new_card;
  }
  return pub;
})();
$(document).ready(ThreeCard);
