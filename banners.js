var Banners = (function(){

  pub = {};
  pub.display_start = function(num){
    num = num + 1;
    $("#alerts").html(num + " Players in the Game");
    $("#alerts").fadeIn().css("display","inline-block").delay(1700).fadeOut();
  };
  pub.display_ten = function(){
    $("#alerts").html("Kerchoo!!");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  };
  pub.display_two = function(){
    $("#alerts").html("Reverse Reverese");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  };
  pub.display_pickup = function(id){
    $("#alerts").html("OH NO! Player " + id + " picked up.");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  }
  pub.display_wrong_card = function(){
    $("#alerts").html("Please select a card of a greater value.");
    $("#alerts").fadeIn().delay(950).fadeOut();
  }
  pub.display_wrong = function(){
    $("#alerts").css("background-color", "red");
    $("#alerts").html("Please select a card");
    $("#alerts").fadeIn().delay(950).fadeOut();
  }
  pub.beast = function(){
    $("#alerts").css("background-color", "black");
    $("#alerts").css("color", "red")
    $("#alerts").html("666 The Number of the Beast 666");
    $("#alerts").fadeIn().delay(950).fadeOut();
  }
  return pub;
})();
