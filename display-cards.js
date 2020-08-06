var garbage = [];
$(document).ready(function() {
  //The number of players as selected by the user
  game_started = false;
  var num_players;
  var play_more = false;
  //do display hand and display disc for played cards
  async function newCards() {
    //id is equal to 0 for player
    //broken: empties and doesn't display a player's undercard
    $("#cards").empty();
    for (var i = 0; i < players[0].hand.length; i += 1) {
      if (players[0].hand[1] === "unknown"){
        players[0].hand.pop();
        $("#cards").append("<img class='user_cards' src='images/deck.svg' alt='unknown'>");
      }
      else{
        $("#cards").append("<div id='card_wrapper'><img class='user_cards' src='images/" + players[0].hand[i] + ".svg' alt='" + players[0].hand[i] + "'></div>");
      }
    }
  }
  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      await findTops(i);
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
  //Computes the top cards for computer players
  async function findTops(id) {
    for (var i = 0; i < 3; i += 1) {
      var newmax = -1;
      var maxcard;
      for (var j = 0; j < players[id].hand.length; j += 1) {
        var thisCard = players[id].hand[j];
        if (players[id].card_value(thisCard) > newmax) {
          newmax = players[id].card_value(thisCard);
          maxcard = thisCard;
        }
      }
      players[id].hand = players[id].hand.filter(val => val !== maxcard);
      players[id].top.push(maxcard);
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

  function check_back(){
    var num_cards = 1;
    var card = disc[disc.length - 1];
    for (var i = 2; i <= 4; i += 1){
      var next_card = disc[disc.length - i];
      if (players[0].card_value(next_card) !== players[0].card_value(card)){
        break;
      }
      else{
        num_cards += 1;
      }
    }
    if(num_cards === 3 && players[0].card_value(card) === "6"){
      alert("The number of the beast!");
    }
    if(num_cards === 4){
      return true;
    }
    return false;
  }
  async function user_play(card, imag) {
    //if user_play returns -1 return false and break the loop
    await players[0].lowestPlayable();
    var multi_card = players[0].hand.filter(val => players[0].card_value(val) === players[0].card_value(card));
    if ((players[0].low) === -1) {
      //Alert on screen to pick up cards
      players[0].pick();
      newCards();
    }
    //Puts card down and draws if it is greater than the lowest playable
    else if (players[0].card_value(card) >= players[0].card_value(players[0].low[0])) {
      if (play_more) {
        if (players[0].card_value(card) !== players[0].card_value(players[0].low[0])) {
          alert("Please select a card of the same value");
          return -1;
        } else {;
          play_more = false;
          if (multi_card.length === 1) {
            //Display button that says "Uh oh. Pick up".
            await players[0].put(card);
            await players[0].draw();
            newCards();
            if(check_back()){
              garbage.push(disc);
              disc = [];
              disc.push(-1);
              $("#deck").empty();
              $("#deck").append("<img src='images/deck.svg' alt='deck'>");
              alert("Kerchoo! Select another card.");
              return -1;
            }
            return 0;
          }
        }
      } else if (players[0].card_value(card) === 15) {
        await players[0].put(card);
        await players[0].draw();
        alert("Reverse reverse. Select another card.");
        newCards();
        return -1;
      } else if (players[0].card_value(card) === 16) {
        await players[0].put(card);
        await players[0].draw();
        garbage.push(disc);
        disc = [];
        disc.push(-1);
        $("#deck").empty();
        $("#deck").append("<img src='images/deck.svg' alt='deck'>");
        alert("Kerchoo! Select another card.");
        newCards();
        return -1;
      }
      if (multi_card.length > 1 && players[0].bottom.length > 0) {
        var res = prompt("Would you like to play another " + card.substring(0, 1) + "? (Y or N)");
        switch (res.toLowerCase()) {
          case "y":
            play_more = true;
            await players[0].put(card);
            newCards();
            return -1;
            break;
          case "n":
            await players[0].put(card);
            await players[0].draw();
            newCards();
            break;
          default:
            alert("Please answer Y or N...");
            return -1;
            break;
        }
      } else {
        await players[0].put(card);
        await players[0].draw();
        newCards();
        if(check_back()){
          garbage.push(disc);
          disc = [];
          disc.push(-1);
          $("#deck").empty();
          $("#deck").append("<img src='images/deck.svg' alt='deck'>");
          alert("Kerchoo! Select another card.");
          return -1;
        }
      }
    }
    //Makes player select again if they picked a card too low
    else {
      alert("Select a different card.");
      return -1;
    }
  }
  async function comp_play(id) {
    await players[id].lowestPlayable();
    if(disc.length === 1){
      $("#deck").empty();
    }
    if (players[id].low === -1) {
      alert("OH NO!");
      players[id].pick();
    } else if (players[id].card_value(players[id].low[0]) === 15) {
      await timeout(650);
      alert("Naaah");
      await players[id].put(players[id].low[0]);
      await players[id].draw();
      await comp_play(id);
    } else if (players[id].card_value(players[id].low[0]) === 16) {
      await timeout(650);
      alert("Kerchoo");
      await players[id].put(players[id].low[0]);
      $("#deck").empty();
      $("#deck").append("<img src='images/deck.svg' alt='deck'>");
      disc = [];
      disc.push(-1);
      await players[id].draw();
      await comp_play(id);
    } else {
      await timeout(650);
      for (var i = 0; i < players[id].low.length; i += 1) {
        await players[id].put(players[id].low[i]);
        await timeout(300);
      }
      await players[id].draw();
      if(check_back()){
        alert("Kerchoo");
        $("#deck").empty();
        $("#deck").append("<img src='images/deck.svg' alt='deck'>");
        disc = [];
        disc.push(-1);
        await comp_play(id);
      }
    }
  }
  //
  //computers go in succession immediately following the player
  $("#cards").on("click", ".user_cards", async function() {
    var this_value = $(this).attr("alt");
    var this_img = $(this).attr("src");
    if (game_started === false) {
      if (players[0].top.length < 3 && game_started === false) {
        $(this).remove();
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
        //await APICards.discard(0, "0top", this_value);
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
      if(disc.length === 1){
        $("#deck").empty();
      }
      var user_result
      if (this_value === "unknown") {
        var botm_card = players[0].hand[0];
        user_result = await user_play(botm_card, "images/" + botm_card + ".svg");
      } else {
        user_result = await user_play(this_value, this_img);
      }

      if (user_result === -1) {
        return false;
      }
      for (var i = 1; i < players.length; i += 1) {
        await comp_play(i);
      }
      return false;
    }
  });
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
  //Begins game when button is pushed
  $("#begin-game").submit(async function(e) {
    e.preventDefault();
    $("#begin-game").css("display", "none");
    displayTops(num_players);
    game_started = true;
  });
});
