var Banners = (function(){

  pub = {};
  pub.display_start = function(num){
    num = num + 1;
    $("#alerts").html(num + " Players in the Game");
    $("#alerts").fadeIn().css("display","inline-block").delay(1000).fadeOut();
  };
  pub.display_ten = function(){
    $("#alerts").html("Kerchoo!!");
    $("#alerts").fadeIn().delay(800).fadeOut();
  };
  pub.display_two = function(){
    $("#alerts").html("Reverse Reverese");
    $("#alerts").fadeIn().delay(800).fadeOut();
  };
  pub.display_pickup = function(id){
    $("#alerts").html("OH NO! Player " + id + " picked up.");
    $("#alerts").fadeIn().delay(900).fadeOut();
  }
  pub.display_wrong_card = function(){
    $("#alerts").html("Please select a card equal or greater to " + disc[disc.length-1].substring(0, 1));
    $("#alerts").fadeIn().delay(750).fadeOut();
  }
  pub.display_wrong_multi = function(){
    $("#alerts").html("Please select another " + disc[disc.length-1].substring(0, 1));
    $("#alerts").fadeIn().delay(750).fadeOut();
  }
  pub.beast = function(){
    $("#alerts").css("background-color", "black");
    $("#alerts").css("color", "red")
    $("#alerts").html("666 The Number of the Beast 666");
    $("#alerts").fadeIn().delay(750).fadeOut();
  }
  return pub;
})();
