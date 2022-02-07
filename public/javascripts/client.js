const socket = io('http://89.158.228.86:8080/');
let c = 0;

socket.on(playerid, (socket) => {
    if(socket.launch) $('div.prev').attr('id','hide');
    if(socket.response) {
        $('div.content div.piece.focused').removeClass('focused');
        $('div.content').append(`<div class="piece piece-${socket.response.color}" id="${socket.response.case}"></div>`);
        $lastpiece = $(`div.piece-${socket.response.color}#${socket.response.case}`);
        $lastpiece.addClass('focused');
    }
    if(socket.next){$('div.column').attr('id','playable');}
    if(socket.next == false && !socket.launch) actualizeCount();
    if(!socket.next) $('div.column').removeAttr('id');
    if(socket.win) alert("C'est gagné !");
    if(socket.lose) alert("T'as perdu gros nul");
    if(socket.draw) alert('Match nul');
    if(socket.left){
        alert("L'adversaire a quitté la partie");
        window.location.replace('logout');
    }
})

$(function(){
    $('div.column').click(function(){
        if($(this).attr('id') == "playable"){
            socket.emit('play',{column:$(this).index(),playerid:playerid,gameid:gameid});
        }
    });
});

var actualizeCount = function(){
    c++;
    n = l-c;
    $('span.num').html('x'+n.toString());
};