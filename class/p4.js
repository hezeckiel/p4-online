let Game = function(p1,p2,gameid){
    //J1 est jaune et J2 est rouge
    this.p1 = p1;
    this.p2 = p2;
    this.grid = [];
    for(let i=0;i<7;i++){
        this.grid.push([null,null,null,null,null,null]);
    }
    this.id = gameid;
    this.next = [this.p1,this.p2][Math.round(Math.random())];
    this.moves = [];
};

Game.prototype.determinePos = function(columnid){
    let i = 0;
    while(this.grid[columnid][i] != null && i<6) i++;
    if(i<6){
        let id = i + 1;
        let coord = ["a","b","c","d","e","f","g"][columnid] + id.toString();
        return {id:i,coord:coord};
    }else return false;
};

Game.prototype.play = function(id,emitter){
    let color = this.next == this.p1 ? 'y' : 'r';
    let pos = this.determinePos(id-1);
    if(pos){
        this.grid[id-1][pos.id] = color;
        let params = {color:color,case:pos.coord};
        let analyze = this.analyzeMove(id-1,pos.id);
        let prev = this.next;
        this.next = this.next == this.p1 ? this.p2 : this.p1;
        this.moves.push(params);
        
        if(this.next == this.p1){
            emitter.emit(this.p1,{response:params,next:true});
            emitter.emit(this.p2,{response:params,next:false});
        }else{
            emitter.emit(this.p1,{response:params,next:false});
            emitter.emit(this.p2,{response:params,next:true});
        }
        if(analyze){this.win(prev,emitter);return true;}
        else if(!analyze && this.moves.length >= 42){this.draw(emitter);return true;}
        else return false;
    }
    else return false;
};

Game.prototype.isNext = function(playerid){
    return playerid == this.next ? true : false;
};

Game.prototype.isPlayer = function(playerid){
    if(playerid == this.p1 || playerid == this.p2) return true;
    else return false;
}

Game.prototype.getColor = function(playerid){
    if(this.isPlayer(playerid)) return playerid == this.p1 ? 'y' : 'r';
    else return false;
}

Game.prototype.getOpp = function(playerid){
    return this.p1 == playerid ? this.p2 : this.p1;
}

Game.prototype.analyzeMove = function(x,y){
    /* 4 directions possibles */
    let dir1 = this.analyzeDir1(x,y); //verticale
    let dir2 = this.analyzeDir2(x,y); //horizontale
    let dir3 = this.analyzeDir3(x,y); //diagonale droite
    let dir4 = this.analyzeDir4(x,y); //diagonale gauche
    return (dir1 || dir2 || dir3 || dir4) ? true : false;
};

Game.prototype.analyzeDir1 = function(x,y){
    let a = 0;
    let b = 0;
    for(let i=1;i<4;i++){
        if(this.grid[x][y] == this.grid[x][y+i]) a++;
        else break;
    }
    for(i=1;i<4-a;i++){
        if(this.grid[x][y] == this.grid[x][y-i]) b++;
        else break;
    }
    return a+b == 3 ? true : false;
};

Game.prototype.analyzeDir2 = function(x,y){
    let a = 0;
    let b = 0;
    for(let i=1;i<4;i++){
        if(x+i < this.grid.length){
            if(this.grid[x][y] == this.grid[x+i][y]) a++;
            else break;
        }
        else break;
    }
    for(i=1;i<4-a;i++){
        if(x-i >= 0){
            if(this.grid[x][y] == this.grid[x-i][y]) b++;
            else break;
        }
        else break;
    }
    return a+b == 3 ? true : false;
};

Game.prototype.analyzeDir3 = function(x,y){
    let a = 0;
    let b = 0;
    for(let i=1;i<4;i++){
        if(x+i < this.grid.length){
            if(this.grid[x][y] == this.grid[x+i][y+i]) a++;
            else break;
        }
        else break;
    }
    for(i=1;i<4-a;i++){
        if(x-i >= 0){
            if(this.grid[x][y] == this.grid[x-i][y-i]) b++;
            else break;
        }
        else break;
    }
    return a+b == 3 ? true : false;
};

Game.prototype.analyzeDir4 = function(x,y){
    let a = 0;
    let b = 0;
    for(let i=1;i<4;i++){
        if(x+i < this.grid.length){
            if(this.grid[x][y] == this.grid[x+i][y-i]) a++;
            else break;
        }
        else break;
    }
    for(i=1;i<4-a;i++){
        if(x-i >= 0){
            if(this.grid[x][y] == this.grid[x-i][y+i]) b++;
            else break;
        }
        else break;
    }
    return a+b == 3 ? true : false;
};

Game.prototype.win = function(playerid,emitter){
    let otherid = this.getOpp(playerid);
    emitter.emit(playerid,{win:true});
    emitter.emit(otherid,{lose:true});
};

Game.prototype.draw = function(emitter){
    emitter.emit(this.p1,{draw:true});
    emitter.emit(this.p2,{draw:true});
};

module.exports = Game;