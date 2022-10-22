import fs from "fs"
import {RowData} from "./types/rowdata.d"
import {MMap} from "./types/map.d"
import {Position} from "./types/position.d"
import { sleep } from "./lib/sleep"
import readline from "readline-sync"

class Tile {
    private sprite: string;
    private isSolid: boolean;
    private position: Position;

    constructor(sprite: string, isSolid: boolean, position: Position){
        this.sprite = sprite;
        this.isSolid = isSolid;
        this.position = position;
    }

    setData(sprite: string){
        this.sprite = sprite;
    }

    checkSolid(){
        return this.isSolid;
    }

    getPosition(){
        return this.position;
    }
}

class Map {
    private data: string[][]
    private tiles: Array<Tile>;
    private column: number;
    private row: number;

    constructor(data: string[][], column: number, row: number){
        this.data = data;
        this.tiles = [];
        this.column = column;
        this.row = row;
    }

    createTiles(){
        for(let y = 0; y < this.data.length; y++){
            for(let x = 0; x < this.data[y].length; x++){
                const t:Tile = new Tile(this.data[y][x],(this.data[y][x] !== "-") ? true : false, {"y": y, "x": x});
                this.tiles.push(t);
            }
        }
    }
}

class Player {
    private position: Position;
    private health: number;
    private direction: number; // 0 is left, 1 is up, 2 is right, 3 is down
    private sprite: string;

    constructor(position: Position, health: number, direction?:number, sprite?:string){
        this.position = position
        this.health = health;
        this.direction = direction || 0;
        this.sprite = sprite || "@";
    }

    setPosition(pos: Position){
        this.position = pos;
    }

    getPosition():Position{
        return this.position
    }

    getSprite():string {
        return this.sprite;
    }

    setDirection(direction: number){
        if(direction >= 0 && direction <= 3){
            this.direction = direction;
        } else {
            console.log(`Tried to pass bad value to player direction |${direction}|. Exiting to avoid further errors`);
            process.exit(1);
        }
    }
}

class Game {
    private maps: Array<MMap>;
    private currentMapPosition: RowData;
    private currMap: MMap|undefined;
    private player: Player;

    constructor(){
        this.maps = [];
        this.currentMapPosition = {column: 1, row: 1}
        this.init();
        this.findCurrentMap(this.currentMapPosition.column,this.currentMapPosition.row);
        this.player = new Player((this.currMap?.start_position !== undefined) ? this.currMap.start_position : {"y": 1, "x": 1},10);
    }

    init(){
        try{
            const cwd: string = process.cwd();
    
            if(!cwd){
                console.log("Could not get CWD");
                process.exit(1);
            }
        
            const mapdir: string = `${cwd}/src/maps`;
            // Removes accidental garbage in maps folder
            const maps: Array<string> = fs.readdirSync(mapdir).filter((e)=>{
                return (e.indexOf(".json")) ? true : false;
            });

            if(!maps.length){
                console.log("Maps directory is empty. Exiting");
                process.exit(1);
            }

            // Too lazy to use a loop
            this.maps = maps.map((x)=>{
                const d: MMap = JSON.parse(fs.readFileSync(`${mapdir}/${x}`,"utf-8"));
                return d;
            })



        } catch(err){
            console.log("An error occurred in Game class in the init function");
            console.error(err);
        }
    }

    findCurrentMap(column: number, row: number){
        for(let p = 0; p < this.maps.length; p++){
            if(this.maps[p].column===this.currentMapPosition.column && this.maps[p].row===this.currentMapPosition.row) {
                this.currMap = this.maps[p];
            }
        }
    }

    async play(){
        while(1){
            this.findCurrentMap(this.currentMapPosition.column,this.currentMapPosition.row);

            const map: string = this.format(this.currMap);

            console.clear();
            console.log(map);

            const key: string = readline.keyIn('',{hideEchoBack: true, mask: '', limit: "wasdq "});
            const pos: Position = this.player.getPosition();
            let newpos:Position|undefined;

            switch(key){
                case "q":
                    process.exit(0);
                    break;
                case "w":
                    newpos = {"y": pos.y-1, "x": pos.x};
                    this.player.setDirection(1);
                    break;
                case "a":
                    newpos = {"y": pos.y, "x": pos.x-1};
                    this.player.setDirection(0);
                    break;
                case "s":
                    newpos = {"y": pos.y+1, "x": pos.x};
                    this.player.setDirection(3);
                    break;
                case "d":
                    newpos = {"y": pos.y, "x": pos.x+1};
                    this.player.setDirection(2);
                    break;

            }

            if(newpos){
                if(this.isInBounds(newpos) && this.isSpotEmpty(newpos)){
                    this.player.setPosition(newpos);
                }
            }

            await sleep(100);
        }
    }

    format(map: MMap|undefined):string{
        let tmp: string = "";

        if(map===undefined){
            console.log("Current map is undefined for some reason");
            process.exit(1);
        }

        for(let y = 0; y < map.data.length; y++){
            for(let x = 0; x < map.data[y].length; x++){
                if(y === this.player.getPosition().y && x === this.player.getPosition().x){
                    tmp += this.player.getSprite();
                    continue;
                }
                tmp += map.data[y][x];
            }
            tmp += "\n"
        }

        return tmp;
    }

    isSpotEmpty(pos: Position){
        const m:MMap|undefined = this.currMap;

        if(m === undefined){
            console.log("Map variable in spot check is undefined");
            process.exit(1);
        }

        if(m.data[pos.y][pos.x] != "#"){
            return true;
        }

        return false;
    }

    isInBounds(pos: Position){
        const m:MMap|undefined = this.currMap;

        if(m === undefined){
            console.log("Map variable in bounds check is undefined");
            process.exit(1);
        }

        if(pos.y < m.data.length && pos.x < m.data[0].length){
            return true;
        }

        return false;
    }
}


const game: Game = new Game();

game.play();