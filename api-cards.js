var deckId = null;
var APICards = (function() {
  var pub = {};
  pub.shuffle = function() {
    return $.ajax({
      type: "GET",
      url: "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1",
      dataType: "json",
      success: function(result, status) {
        deckId = JSON.stringify(result.deck_id);
        console.log(deckId);
      }
    });
  }
  pub.draw = function(num){
    return $.ajax({
      type: "GET",
      url: "https://deckofcardsapi.com/api/deck/" + JSON.parse(deckId) + "/draw/?count=" + num,
      dataType: "json",
      success: function(result, status) {
        console.log(JSON.stringify(result.cards);
      }
    });
  }
  return pub;
})();
