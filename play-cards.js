var PlayCards = (function(){

  function turn(id){
    if (players[id].isTurn === False){
      player[id].isTurn = True;
    }
    else{
      alert ("Yikes, that was an error.");
      return -1;
    }
  }
})();
$(document).ready(PlayCards);
