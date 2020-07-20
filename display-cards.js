var DisplayCards = (function(){
  pub = {};

  pub.player_put = async function(event){

  }
  return pub;
})
$(document).ready(function() {
  //The number of players as selected by the user
  game_started = false;
  var num_players;
  async function newCards(){
    //id is equal to 0 for player
    $("#cards").empty();
    for (var i = 0; i < players[0].hand.length; i += 1){
      $("#cards").append("<img class='user_cards' src='" + players[0].hand[i].image + "' alt='" + players[0].hand[i].code + "'>");
    }
  }
  //The game begins
  $("#game-settings").submit(async function(e) {
    num_players = $("#game-settings").serialize();
    $(".top-menu").css("display", "none");
    e.preventDefault();
    //Sets up opponent players
    if (num_players === "players=one") {
      await ThreeCard.setup(2);
      displayOpponents(1);
      num_players = 1;
      newCards();
    } else if (num_players === "players=two") {
      await ThreeCard.setup(3);
      displayOpponents(2);
      num_players = 2;
      newCards();
    } else if (num_players === "players=three") {
      await ThreeCard.setup(4);
      displayOpponents(3);
      num_players = 3;
      newCards();
    }
    //Sets up user's hand
    $("#deck").css("display", "block");
    //Display user's cards and opponent's cards
    $("#user").css("display", "block");
    $("#opponent").css({
      "display": "flex",
      "justify-content": "center",
      "text-align": "center"
    });
  });
  //Displays computer players and their initial face down cards
  function displayOpponents(n) {
    for (var i = 1; i <= n; i += 1) {
      $("#opponent").append("<div id='opponent" + i + "'><h4>Opponent " + i + "</h4>" +
        "<div id='op" + i + "top'><img class='op" + i + "top1' src='images/deck.jpg' alt='deck'>" +
        "<img class='op" + i + "top2' src='images/deck.jpg' alt='deck'>" +
        "<img class='op" + i + "top3' src='images/deck.jpg' alt='deck'>" +
        "</div></div>");
      findTops(i);
    }
  }
  //Displays computer player's top cards
  async function displayTops(n) {
    for (var i = 1; i <= n; i += 1) {
      //var thisHand = await APICards.listHand(i + "top");
      for (var j = 0; j < players[i].top.length; j += 1) {
        $(".op" + players[i].id + "top" + (j + 1)).attr("src", players[i].top[j].image);
        $(".op" + players[i].id + "top" + (j + 1)).attr("alt", players[i].top[j].code);
      }
    }
  }
  //Computes the top cards for computer players
  async function findTops(id) {
    for (var i = 0; i < 3; i += 1){
      var newmax = -1;
      var maxcard;
      for (var j = 0; j < players[id].hand.length; j += 1) {
        var thisCard = players[id].hand[j].code;
        if (players[id].card_value(thisCard) > newmax) {
          newmax = players[id].card_value(thisCard);
          maxcard = thisCard;
        }
      }
      await APICards.discard(id, id + "top", maxcard);
      players[id].hand = await APICards.listHand(id);
      players[id].top = await APICards.listHand(id + "top");
    }
  }
  //Allows the player to select 3 cards to put on top
  async function selectTops(e) {
    //Will not let the player change cards once the game has started
    if (!game_started) {
      var this_value = $(e).attr("alt");
      if (this_value !== "deck") {
        $(".start-menu").css("display", "none");
        await APICards.discard("0top", 0, this_value);
        $(e).attr("src", "images/deck.jpg");
        $(e).attr("alt", "deck");
        players[0].hand = await APICards.listHand(0);
        players[0].top = await APICards.listHand("0top");
        newCards();
      }
    }
  }
  //
  //computers go in succession immediately following the player
  $("#cards").on("click", ".user_cards", async function() {
    var this_value = $(this).attr("alt");
    var this_img = $(this).attr("src");
    if (game_started === false){
      if (players[0].top.length < 3 && game_started === false) {
        $(this).remove();
        var new_string = players[0].hand.filter(val => val.code === this_value);
        var new_hand = players[0].hand.filter(val => val.code !== this_value);
        players[0].top.push(new_string);
        players[0].hand = new_hand;
        if ($(".top1").attr("alt") === "deck") {
          $(".top1").attr("alt", this_value);
          $(".top1").attr("src", this_img);
        } else if ($(".top2").attr("alt") === "deck") {
          $(".top2").attr("alt", this_value);
          $(".top2").attr("src", this_img);
        } else if ($(".top3").attr("alt") === "deck") {
          $(".top3").attr("alt", this_value);
          $(".top3").attr("src", this_img);
        } await APICards.discard(0, "0top", this_value);
      }
      if (players[0].top.length === 3){
        $(".start-menu").css("display", "block");
        //players[0].top = APICards.listHand(0);
      }
    }
    //
    //Game has started there
    //
    else{
      //this_value is card code
      players[0].lowestPlayable();
      //Picks up if lowest playable is -1
      if((players[0].lp) === -1){
        players[0].pick();
        $("#deck").empty();
        $("#deck").append("<img src='images/deck.jpg' alt='deck'>");
        return false;
      }
      //Puts card down and draws if it is greater than the lowest playable
      else if (players[0].card_value(this_value) >= players[0].card_value(players[0].lp.code)){
        //this_value is a code value
        await players[0].put(this_value);
        $("#deck").append("<img src='" + this_img + "' alt='" + this_value + "'>")
        await players[0].draw();
      }
      //Makes player select again if they picked a card too low
      else{
        alert("Select a different card.");
        return false;
      }
      newCards();
      for(var i = 1; i < players.length; i += 1){
        players[i].lowestPlayable();
        //alert("Lowest playable " + players[i].lp);
        if(players[i].lp === -1){
          players[i].pick();
          $("#deck").empty();
          $("#deck").append("<img src='images/deck.jpg' alt='deck'>");
        }
        else{
          players[i].put(players[i].lp.code);
          $("#deck").append("<img src='" + players[i].lp.image + "' alt='" + players[i].lp.code + "'>")
        }
      }
      return false;
    }
  });
  //
  //Removes card from top if there is one already selected
  $("#top").on("click", ".top1", function() {
    selectTops(this);
  });
  $("#top").on("click", ".top2", function() {
    selectTops(this);
  });
  $("#top").on("click", ".top3", function() {
    selectTops(this);
  });
  //
  //Begins game when button is pushed
  $("#begin-game").submit(async function(e) {
    e.preventDefault();
    $("#begin-game").css("display", "none");
    displayTops(num_players);
    game_started = true;
  });
});
