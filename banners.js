var Banners = (function(){

  pub = {};
  pub.display_start = function(num){
    num = num + 1;
    $("#alerts").css("visibility", "visible");
    $("#alerts").html(num + " Players in the Game");
    $("#alerts").fadeIn().css("display","inline-block").delay(1700).fadeOut();
  };
  pub.display_ten = function(){
    $("#alerts").css("visibility", "visible");
    $("#alerts").html("Kerchoo!!");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  };
  pub.display_two = function(){
    $("#alerts").css("visibility", "visible");
    $("#alerts").html("Reverse Reverese");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  };
  pub.display_pickup = function(id){
    $("#alerts").css("visibility", "visible");
    $("#alerts").html("OH NO! Player " + (id + 1) + " picked up.");
    $("#alerts").fadeIn().delay(1000).fadeOut();
  }
  pub.display_wrong_card = function(){
    $("#alerts").css("visibility", "visible");
    $("#alerts").html("Please select a card of a greater value.");
    $("#alerts").fadeIn().delay(950).fadeOut();
  }
  pub.display_wrong = function(){
    $("#alerts").css("visibility", "visible");
    $("#alerts").css("background-color", "red");
    $("#alerts").html("Please select a card");
    $("#alerts").fadeIn().delay(950).fadeOut();
    $("#alerts").css("color", "#0F1026");
    $("#alerts").css("background-color", "#0979BF");
  }
  pub.beast = function(){
    $("#alerts").css("visibility", "visible");
    $("#alerts").css("background-color", "black");
    $("#alerts").css("color", "red")
    $("#alerts").html("666 The Number of the Beast 666");
    $("#alerts").fadeIn().delay(950).fadeOut();
    $("#alerts").css("color", "#0F1026");
    $("#alerts").css("background-color", "#0979BF");
  }
  return pub;
})();
