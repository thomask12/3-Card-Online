var garbage = [];
var user_pickup = false;
$(document).ready(function() {
  //The number of players as selected by the user
  game_started = false;
  var num_players;
  $("#alerts").hide();
  //display hand
  async function newCards() {
    //id is equal to 0 for player
    $("#cards").empty();
    for (var i = 0; i < players[0].hand.length; i += 1) {
      if (players[0].hand[1] === "unknown"){
        players[0].hand.pop();
        $("#cards").append("<img class='user_cards' src='images/deck.svg' alt='unknown'>");
      } else{
        $("#cards").append("<div id='card_wrapper'><img class='user_cards' src='images/" + players[0].hand[i] + ".svg' alt='" + players[0].hand[i] + "'></div>");
      }
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
    $("#deck").css("display", "flex");
    //Display user's cards and opponent's cards
    $("#user").css("display", "block");
    $("#opponent").css({
      "display": "flex",
      "justify-content": "center",
      "text-align": "center"
    });
  });
  //Displays computer players and their initial face down cards
  async function displayOpponents(n) {
    for (var i = 1; i <= n; i += 1) {
      $("#opponent").append("<div id='opponent" + i + "'><h4>Opponent " + i + "</h4>" +
        "<div id='op" + i + "top'><img class='op" + i + "top1' src='images/deck.svg' alt='deck'>" +
        "<img class='op" + i + "top2' src='images/deck.svg' alt='deck'>" +
        "<img class='op" + i + "top3' src='images/deck.svg' alt='deck'>" +
        "</div></div>");
      await ThreeCard.findTops(i);
    }
  }
  //Displays computer player's top cards
  async function displayTops(n) {
    for (var i = 1; i <= n; i += 1) {
      for (var j = 0; j < players[i].top.length; j += 1) {
        $(".op" + players[i].id + "top" + (j + 1)).attr("src", "images/" + players[i].top[j] + ".svg");
        $(".op" + players[i].id + "top" + (j + 1)).attr("alt", players[i].top[j]);
      }
    }
  }
  //Allows the player to select 3 cards to put on top
  async function selectTops(e) {
    //Will not let the player change cards once the game has started
    if (!game_started) {
      var this_value = $(e).attr("alt");
      if (this_value !== "deck") {
        $(".start-menu").css("display", "none");
        var temp = players[0].top.filter(val => val !== this_value);
        players[0].top = temp;
        players[0].hand.push(this_value);
        $(e).attr("src", "images/deck.svg");
        $(e).attr("alt", "deck");
        newCards();
      }
    }
  }
  //
  //Removes card from top if there is one already selected
  $("#top").on("click", "top1", function() {
    selectTops(this);
  });
  $("#top").on("click", ".top2", function() {
    selectTops(this);
  });
  $("#top").on("click", ".top3", function() {
    selectTops(this);
  });
  //Begins game when button is pushed
  $("#begin-game").submit(async function(e) {
    e.preventDefault();
    $("#begin-game").css("display", "none");
    displayTops(num_players);
    await Banners.display_start(num_players);
    game_started = true;
  });
  //
  $("#deck").on("click", async function(){
    //have to do explosions and repeat for 2 and ten. Right now they are commented out in Three-card js
    if(user_pickup){
      players[0].pick();
      newCards();
    }
    else if(players[0].to_play.length > 0){
      if(ThreeCard.card_value(players[0].to_play[0]) === 15){
        players[0].put(players[0].to_play[0]);
        players[0].draw();
        Banners.display_two();
        newCards();
        players[0].to_play = [];
        return false;
      }
      if(ThreeCard.card_value(players[0].to_play[0]) === 16){
        players[0].put(players[0].to_play[0]);
        players[0].draw();
        garbage.push(disc);
        disc = [];
        disc.push(-1);
        $("#deck").empty();
        $("#deck").append("<img src='images/deck.svg' alt='deck'>");
        Banners.display_ten();
        newCards();
        players[0].to_play = [];
        return false;
      }
      //alert("To play length: " + players[0].to_play.length);
      for(var i = 0; i < players[0].to_play.length; i += 1){
        players[0].put(players[0].to_play[i]);
      }
      players[0].draw();
      newCards();
      for (var i = 1; i < players.length; i += 1) {
        if(disc.length === 1){
          $("#deck").empty();
        }
        await ThreeCard.comp_play(i);
      }
      players[0].to_play = [];
      return false;
    }
  });
  //
  //computers go in succession immediately following the player
  $("#cards").on("click", ".user_cards", async function() {
    var this_value = $(this).attr("alt");
    var this_img = $(this).attr("src");
    if (game_started === false) {
      if (players[0].top.length < 3 && game_started === false) {
        $(this).parent().remove();
        var new_string = players[0].hand.filter(val => val === this_value);
        players[0].hand = players[0].hand.filter(val => val !== this_value);
        players[0].top.push(new_string[0]);
        if ($(".top1").attr("alt") === "deck") {
          $(".top1").attr("alt", this_value);
          $(".top1").attr("src", this_img);
        } else if ($(".top2").attr("alt") === "deck") {
          $(".top2").attr("alt", this_value);
          $(".top2").attr("src", this_img);
        } else if ($(".top3").attr("alt") === "deck") {
          $(".top3").attr("alt", this_value);
          $(".top3").attr("src", this_img);
        }
      }
      if (players[0].top.length === 3) {
        $(".start-menu").css("display", "block");
      }
    }
    //Game starts
    else {
      //this_value is card code
      //players[...].low should have EVERY cards with the same value as the lowest card
      //Need to figure out displaying cards if there's a botto card in a player's hand
      //if(disc.length === 1){
        //$("#deck").empty();
      //}
      for (var i = 0; i < players[0].to_play.length; i += 1){
        if (this_value === players[0].to_play[i] || ThreeCard.card_value(this_value) !== ThreeCard.card_value(players[0].to_play[0])){
          return false;
        }
      }
      var user_result;
      var not_card = players[0].hand.filter(val => ThreeCard.card_value(val) !== ThreeCard.card_value(this_value));
      $(this).css("box-shadow", "#D9A91A");
      for(var i = 0; i < not_card.length; i += 1){
        $("img[alt='" + not_card[i] + "']").css("opacity", "0.5");
      }
      if (this_value === "unknown") {
        var botm_card = players[0].hand[0];
        user_result = await ThreeCard.user_play(botm_card, "images/" + botm_card + ".svg");
      } else {
        user_result = await ThreeCard.user_play(this_value, this_img);
      }
      if (user_result === 0) {
        user_pickup = true;
      }
      return false;
    }
  });
});
