/*

GESTION DES PARTIES DE PUISSANCE 4

*/

// Modules
var express = require('express');
var router = express.Router();
var p4 = require('../class/p4');
var randomstring = require('randomstring');

//Page d'accueil du jeu
router.get('/', (req,res) => {
    //Une partie est déjà en cours =>> redirigé vers la partie
    if(req.session.gameid && req.session.playerid){
        if(games[req.session.gameid]) res.redirect('/puissance4/'+req.session.gameid);
        else{
            req.session.destroy();
            res.redirect('/puissance4/');
        }
    }
    //Aucune partie en cours => initialisation d'une partie
    else{
        let gameid = randomstring.generate({length:12,charset:'alphanumeric'});
        let playerid = randomstring.generate({length:10,charset:'alphanumeric'});
        games[gameid] = {p1:playerid,p2:null,game:null,created:Date.now()};
        req.session.playerid = playerid;
        req.session.gameid = gameid;
        res.redirect('/puissance4/'+gameid);
    }
});

//Page de jeu

router.get('/logout',(req,res) => {
    if(req.session.playerid || req.session.gameid){
        if(games[req.session.gameid] && games[req.session.gameid].p2 != null) io.emit(games[req.session.gameid].game.getOpp(req.session.playerid),{left:true});
        delete games[req.session.gameid];
        req.session.destroy();
    }
    res.redirect('/');
});

router.get('/invite/:id', (req,res) => {
        res.render('redirect.ejs',{url:req.params.id});
});

router.get('/:id', (req,res) => {
    let gameid = req.params.id;
    //La partie n'existe pas
    if(!games[gameid]){
        if(req.session.playerid && req.session.gameid){
            req.session.destroy();
            res.redirect('/puissance4/'+gameid);
        }
        else res.render('error.ejs',{error:"Aucune partie n'existe avec cet id."});
    //La partie existe
    } else{
        //La session existe
        if(req.session.gameid || req.session.playerid){
            if(req.session.playerid == games[gameid].p2 || req.session.playerid == games[gameid].p1){
                if(games[gameid].p2 == null){// Le deuxième joueur n'est pas encore arrivé
                    res.locals.status = 1;
                    res.locals.color = 'y';
                    res.locals.next = false;
                }
                else{
                    res.locals.moves = games[gameid].game.moves;
                    res.locals.status = 0;
                    res.locals.color = games[gameid].game.getColor(req.session.playerid);
                    res.locals.next = games[gameid].game.isNext(req.session.playerid);
                }
                res.render('puissance4.ejs',{gameid:gameid,playerid:req.session.playerid});
            }
            else res.redirect('/puissance4/'+req.session.gameid);
        }
        //La session n'existe pas
        else{
            //La deuxieme place est libre => le deuxième joueur rejoint la partie, le jeu commence
            if(games[gameid].p2 == null){
                console.table([req.params.id,req.connection.remoteAddress]);
                let playerid = randomstring.generate({length:10,charset:'alphanumeric'});
                games[gameid].p2 = playerid;
                games[gameid].game = new p4(games[gameid].p1,playerid,gameid);
                req.session.gameid = gameid;
                req.session.playerid = playerid;
                res.locals.status = 0;
                res.locals.color = 'r';
                res.locals.next = games[gameid].game.isNext(req.session.playerid);
                io.emit(games[gameid].p1,{launch:true,next:!res.locals.next});
                res.render('puissance4.ejs',{gameid:gameid,playerid:playerid});
            }
            //La deuxieme place n'est pas libre
            else res.render('error.ejs',{error:"Deux joueurs sont déjà en train de jouer à cette partie."});
        }
    }
});

module.exports = router;