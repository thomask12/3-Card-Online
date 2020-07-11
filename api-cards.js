var deckId;
var deck;
var APICards = (function() {
  var pub = {};

  pub.shuffle = async function() {
    let response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    let shuffleDeck = await response.json();
    deckId = JSON.stringify(shuffleDeck.deck_id);
  }
  //draws cards from the deck and puts them in players[id] hand
  pub.draw = async function(id, num) {
    let response = await fetch("https://deckofcardsapi.com/api/deck/" + JSON.parse(deckId) + "/draw/?count=" + num);
    let drawnCard = await response.json();
    for(var i = 0; i < drawnCard.cards.length; i += 1){
        await APICards.toHand(id, drawnCard.cards[i].code);
    }
    deck = JSON.stringify(drawnCard.remaining);
    return drawnCard;
  }
  //Id is pile name
  pub.toHand = async function(id, card) {
    let response = await fetch("https://deckofcardsapi.com/api/deck/" + JSON.parse(deckId) + "/pile/" + id + "/add/?cards=" + card);
    let newCard = await response.json();
  }
  //lists the contents of a pile
  pub.listHand = async function(id) {
    let response = await fetch("https://deckofcardsapi.com/api/deck/" + JSON.parse(deckId) + "/pile/" + id + "/list/");
    let handList = await response.json();
    //Returns players cards
    console.log(JSON.stringify(handList));
    return handList.piles[id].cards;
  }
  //show moving from pile to pile
  pub.discard = async function(id, newHand, card) {
    let response = await fetch("https://deckofcardsapi.com/api/deck/" + JSON.parse(deckId) + "/pile/" + id + "/draw/?cards=" + card);
    let discarded = await response.json();
    await APICards.toHand(newHand, card);
    console.log(JSON.stringify(newHand));
    return discarded;
  }
  return pub;
})();
