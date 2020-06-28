$(document).ready(function() {
  //The number of players as selected by the user
  game_started = false;
  var num_players;
  //The game begins
  $("#game-settings").submit(function(e) {
    deck = APICards.shuffle();
    num_players = $("#game-settings").serialize();
    $(".top-menu").css("display", "none");
    e.preventDefault();
    //Sets up opponent players
    if (num_players === "players=one") {
      ThreeCard.setup(2);
      displayOpponents(1);
      num_players = 1;
    }
    if (num_players === "players=two") {
      ThreeCard.setup(3);
      displayOpponents(2);
      num_players = 2;
    }
    if (num_players === "players=three") {
      ThreeCard.setup(4);
      displayOpponents(3);
      num_players = 3;
    }
    //Sets up user's hand
    for (var i = 0; i < 6; i += 1) {
      $("#cards").append("<img class='user_cards' src='images/" + players[0].hand[i] + ".jpg' alt='" + players[0].hand[i] + "'>")
    }
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
  function displayTops(n) {
    for (var i = 1; i <= n; i += 1) {
      for (var j = 0; j < players[i].top.length; j += 1) {
        $(".op" + i + "top" + (j + 1)).attr("src", "images/" + players[i].top[j] + ".jpg");
        $(".op" + i + "top" + (j + 1)).attr("alt", players[i].top[j]);
      }
    }
  }
  //Displays new hand after every turn
  function displayHand() {
    $("#cards").empty();
    for (var i = 0; i < players[0].hand.length; i += 1) {
      $("#cards").append("<img class='user_cards' src='images/" + players[0].hand[i] + ".jpg' alt='" + players[0].hand[i] + "'>")
    }
  }
  //Computes the top cards for computer players
  function findTops(id) {
    while (players[id].top.length < 3) {
      var newmax = 0;
      var maxcard;
      for (var i = 0; i < players[id].hand.length; i += 1) {
        if (ThreeCard.card_value(players[id].hand[i]) > newmax) {
          newmax = ThreeCard.card_value(players[id].hand[i]);
          maxcard = players[id].hand[i];
        }
      }
      var newhand = players[id].hand.filter(function(value, index, arr) {
        return value !== maxcard;
      });
      players[id].top.push(maxcard);
      players[id].hand = newhand;
    }
  }
  //Allows the player to select 3 cards to put on top
  function selectTops(e) {
    //Will not let the player change cards once the game has started
    if (!game_started) {
      var this_value = $(e).attr("alt");
      if (this_value !== "deck") {
        if (players[0].top.length === 3) {
          $(".start-menu").css("display", "none");
        }
        var hand_cards = players[0].top.filter(function(value, index, arr) {
          return value === this_value;
        });
        if (players[0].top.length > 1) {
          var new_top = players[0].top.filter(function(value, index, arr) {
            return value !== this_value;
          });
        } else {
          new_top = [];
        }
        players[0].top = new_top;
        players[0].hand.push(hand_cards[0]);
        $(e).attr("src", "images/deck.jpg");
        $(e).attr("alt", "deck");
        $("#cards").append("<img class='user_cards' src='images/" + this_value + ".jpg' alt='" + this_value + "'>");
      }
    }
  }
  //get_put, get_pick, get_draw are all required functions
  //trades off between player and computer turns
  //computers go in succession immediately following the player
  //helper function player click
  $("#cards").on("click", ".user_cards", function() {
    if (players[0].top.length < 3) {
      var this_value = $(this).attr("alt");
      var top_cards = players[0].hand.filter(function(value, index, arr) {
        return value === this_value;
      });
      var new_hand = players[0].hand.filter(function(value, index, arr) {
        return value !== this_value;
      });
      players[0].hand = new_hand;
      players[0].top.push(top_cards[0]);
      $(this).remove();
      if ($(".top1").attr("alt") === "deck") {
        $(".top1").attr("alt", this_value);
        $(".top1").attr("src", "images/" + this_value + ".jpg");
      } else if ($(".top2").attr("alt") === "deck") {
        $(".top2").attr("alt", this_value);
        $(".top2").attr("src", "images/" + this_value + ".jpg");
      } else if ($(".top3").attr("alt") === "deck") {
        $(".top3").attr("alt", this_value);
        $(".top3").attr("src", "images/" + this_value + ".jpg");
      }
      if (players[0].top.length === 3) {
        $(".start-menu").css("display", "block");
      }
    }
  });
  //Removes card from top if there is one already selected
  $("#top").on("click", ".top1", function() {
    selectTops(this);
  });
  //Removes card from top if there is one already selected
  $("#top").on("click", ".top2", function() {
    selectTops(this);
  });
  //Removes card from top if there is one already selected
  $("#top").on("click", ".top3", function() {
    selectTops(this);
  });
  $("#begin-game").submit(function(e) {
    e.preventDefault();
    $("#begin-game").css("display", "none");
    displayTops(num_players);
    game_started = true;
    turn(0);
  });

  function turn() {
    if (game_started === true) {
      //Player chooses
      $("#cards").on("click", ".user_cards", function() {
        if (players[0].lowestPlayable() === -1) {
          players[0].pick();
          displayHand();
          $("#deck").attr("alt", "deck");
          $("#deck").attr("src", "images/deck.jpg");
        } else {
          var this_value = $(this).attr("alt");
          var last_card = pile[pile.length - 1];
          if (ThreeCard.card_value(this_value) < ThreeCard.card_value(last_card)) {
            alert("Select a different card");
          }
          var top_cards = players[0].hand.filter(function(value, index, arr) {
            return value === this_value;
          });
          var new_hand = players[0].hand.filter(function(value, index, arr) {
            return value !== this_value;
          });
          this.remove();
          players[0].put(this_value);
          players[0].hand = new_hand;
          players[0].draw();
          alert("Hand " + new_hand);
          displayHand();
          $("#deck").empty();
          $("#deck").append("<img src='images/" + this_value + ".jpg' alt=" + this_value + ">");
        }
        //Computer plays
        for (var i = 1; i <= num_players; i += 1) {
          var lowest_val = players[i].lowestPlayable();
          alert("Computer lowest value " + lowest_val);
          if (lowest_val === -1) {
            players[i].pick();
            $("#deck").attr("alt", "deck");
            $("#deck").attr("src", "images/deck.jpg");
          } else {
            players[i].put(lowest_val);
            players[i].draw();
            $("#deck").empty();
            $("#deck").append("<img src='images/" + lowest_val + ".jpg' alt=" + lowest_val + ">");
          }
        }
      });
    }
  }
});
