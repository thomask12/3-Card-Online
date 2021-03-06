var garbage = [];
var user_pickup = false;
var four_kind = false;
$(document).ready(async function() {
  //The number of players as selected by the user
  var num_players = parseInt(sessionStorage.getItem("NumPlayers"));
  await ThreeCard.setup(num_players + 1);
  await displayOpponents(num_players);
  game_started = false;
  $("#alerts").hide();
  //display hand
  function computers_play(){
    for (var i = 1; i < players.length; i += 1){
      ThreeCard.comp_play(i);
    }
  }
  function reset_opacity(){
    for (var i = 0; i < players[0].hand.length; i += 1) {
      $("img[alt='" + players[0].hand[i] + "']").parent().css("opacity", "1");
    }
  }
  async function newCards() {
    $("#cards").empty();
    players[0].orderHand();
    for (var i = 0; i < players[0].hand.length; i += 1) {
      if (players[0].hand[1] === "unknown") {
        players[0].hand.pop();
        $("#cards").append("<img class='user_cards' src='images/deck_01.svg' alt='unknown'>");
      } else {
        $("#cards").append("<div id='card_wrapper'><img class='user_cards' src='images/" + players[0].hand[i] + ".svg' alt='" + players[0].hand[i] + "'></div>");
      }
    }
    for (var i = 1; i < players.length; i += 1){
      $(".ophand" + i + "").empty();
      for (var j = 0; j < players[i].hand.length; j += 1){
        $(".ophand" + i + "").append("<div id='ophandwrap'><img src='images/deck_01.svg'></div>");
      }
    }
  }
  newCards();
  $("#deck").css("display", "flex");
  $("#user").css("display", "block");
  $("#opponent").css({
    "display": "flex",
    "justify-content": "center",
    "text-align": "center"
  });
  //Displays computer players and their initial face down cards
  async function displayOpponents(n) {
    for (var i = 1; i <= n; i += 1) {
      $("#opponent").append("<div id='opponent" + i + "'><h4>Opponent " + (i + 1) + "</h4>" +
        "<div class='ophand" + i + "'></div>" +
        "<div id='op" + i + "top'><img class='op" + i + "top1' src='images/deck_01.svg' alt='deck'>" +
        "<img class='op" + i + "top2' src='images/deck_01.svg' alt='deck'>" +
        "<img class='op" + i + "top3' src='images/deck_01.svg' alt='deck'>" +
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
        $(e).attr("src", "images/deck_01.svg");
        $(e).attr("alt", "deck");
        newCards();
      }
    }
  }
  //Removes card from top if there is one already selected
  $("#top").on("click", ".top1", function() { selectTops(this); });
  $("#top").on("click", ".top2", function() { selectTops(this); });
  $("#top").on("click", ".top3", function() { selectTops(this); });
  //Begins game when button is pushed
  $("#begin-game").submit(async function(e) {
    e.preventDefault();
    $("#begin-game").css("display", "none");
    displayTops(num_players);
    await Banners.display_start(num_players);
    game_started = true;
  });
  //Activate after player has selected cards
  $("#deck").on("click", async function() {
    $("#deck").css("border-color", "#FBB03B");
    //Checks if a player needs to pick up cards
    if (user_pickup) {
      user_pickup = false;
      players[0].pick();
      await Banners.display_pickup(0);
      newCards();
    }
    //Checks is player selected cards before trying to play
    else if (players[0].to_play.length === 0) {
      await Banners.display_wrong();
      return false;
    }
    else if (players[0].to_play.length > 0) {
      //Allows a player to play again after a 2 (reset card)
      if (ThreeCard.card_value(players[0].to_play[0]) === 15) {
        players[0].put(players[0].to_play[0]);
        await Banners.display_two();
        newCards();
        players[0].to_play = [];
        return false;
      }
      //Allows a player to play again after a 10 (blow up card)
      if (ThreeCard.card_value(players[0].to_play[0]) === 16) {
        players[0].put(players[0].to_play[0]);
        garbage.push(disc);
        disc = [];
        disc.push(-1);
        $("#deck").empty();
        await Banners.display_ten();
        newCards();
        players[0].to_play = [];
        return false;
      }
      //Plays all (valid) cards a player has selected
      for (var i = 0; i < players[0].to_play.length; i += 1) {
        players[0].put(players[0].to_play[i]);
      }
      //Blows up the pile after 4-of-a-kind
      if (four_kind) {
        four_kind = false;
        newCards();
        players[0].to_play = [];
        return false;
      }
      newCards();
    }
    await computers_play();
    await newCards();
    players[0].to_play = [];
    return false;
  });
  //
  //computers go in succession immediately following the player
  $("#cards").on("click", ".user_cards", async function() {
    players[0].lowestPlayable();
    var this_value = $(this).attr("alt");
    var this_img = $(this).attr("src");
    //Player selects top cards before game begins
    if (game_started === false) {
      if (players[0].top.length < 3) {
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
      $("#deck").css("border-color", "#000000");
      //players[...].low should have EVERY cards with the same value as the lowest card
      //Need to figure out displaying cards if there's a botto card in a player's hand
      //Allows user to pick up by clicking their hand
      if(user_pickup){
        players[0].pick();
        user_pickup = false;
        newCards();
        computers_play();
        $("#deck").css("border-color", "#FBB03B");
        return false;
      }
      //Checks if a player selected a card with a large enough value
      else if (ThreeCard.card_value(this_value) < ThreeCard.card_value(players[0].low) && ThreeCard.card_value(players[0].low) !== 15) {
        await Banners.display_wrong_card();
        $("#deck").css("border-color", "#FBB03B");
        return false;
      }
      if (players[0].to_play.length > 0) {
        //Deselects cards if they are clicked again
        if (this_value === players[0].to_play[0] && players[0].to_play.length === 1) {
          reset_opacity();
          $("img[alt='" + players[0].to_play[0] + "']").parent().css("transform", "translate(0px, 0px)");
          $("img[alt='" + players[0].to_play[0] + "']").parent().css("overflow", "hidden");
          players[0].to_play = [];
          $("#deck").css("border-color", "#FBB03B");
          return false;
        }
        //Deselects cards if a different value is clicked
        if (ThreeCard.card_value(this_value) !== ThreeCard.card_value(players[0].to_play[0]) && players[0].to_play.length !== 0) {
          reset_opacity();
          for (var i = 0; i < players[0].to_play.length; i += 1) {
            $("img[alt='" + players[0].to_play[i] + "']").parent().css("transform", "translate(0px, 0px)");
            $("img[alt='" + players[0].to_play[i] + "']").parent().css("overflow", "hidden");
          }
          players[0].to_play = [];
          $("#deck").css("border-color", "#FBB03B");
          return false;
        }
        //Deselects one card if multiple are selected
        for (var i = 0; i < players[0].to_play.length; i += 1) {
          if (this_value === players[0].to_play[i]) {
            var toPlay_card = players[0].hand.filter(val => val === this_value);
            var not_card = players[0].hand.filter(val => val !== this_value);
            $("img[alt='" + toPlay_card[0] + "']").parent().css("transform", "translate(0px, 0px)");
            $("img[alt='" + toPlay_card[0] + "']").parent().css("overflow", "hidden");
            players[0].to_play = not_card;
            return false;
          }
        }
      }
      $(this).parent().css("transform", "translate(0px, -20px)");
      $(this).parent().css("overflow", "visible");
      var user_result;
      //Add fading border around deck when card is selected
      //$("#deck").css("border", "2px solid red");
      var not_card = players[0].hand.filter(val => ThreeCard.card_value(val) !== ThreeCard.card_value(this_value));
      for (var i = 0; i < not_card.length; i += 1) {
        $("img[alt='" + not_card[i] + "']").parent().css("opacity", "0.5");
      }
      if (this_value === "unknown") {
        var botm_card = players[0].hand[0];
        user_result = ThreeCard.user_play(botm_card, "images/" + botm_card + ".svg");
      } else {
        user_result = ThreeCard.user_play(this_value, this_img);
      }
      return false;
    }
  });
});
