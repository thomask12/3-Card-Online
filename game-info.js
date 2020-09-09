$(document).ready(function(){
  $("#game-settings").submit(async function(e) {
    num_players = $("#game-settings").serialize();
    e.preventDefault();
    if (num_players === "players=one"){
      sessionStorage.setItem("NumPlayers", 1);
    } else if (num_players === "players=two"){
      sessionStorage.setItem("NumPlayers", 2);
    } else if (num_players === "players=three"){
      sessionStorage.setItem("NumPlayers", 3);
    }
    window.location.replace("game.html");
  });
});
