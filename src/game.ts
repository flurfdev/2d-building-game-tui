import fs from "fs"
import {RowData} from "./types/rowdata.d"
import {MMap} from "./types/map.d"
import {Position} from "./types/position.d"
import { sleep } from "./lib/sleep"
import readline from "readline-sync"

class Player {
    private position: Position;
    private health: number;

    constructor(position: Position, health: number){
        this.position = position
        this.health = health;
    }

    setPosition(pos: Position){
        this.position = pos;
    }

    getPosition():Position{
        return this.position
    }
}

class Game {
    private maps: Array<MMap>;
    private currentMapPosition: RowData;
    private currMap: MMap|undefined;

    constructor(){
        this.maps = [];
        this.currentMapPosition = {column: 1, row: 1}
        this.init();
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
            if(this.maps[p].column == this.currentMapPosition.column && this.maps[p].row == this.currentMapPosition.row) {
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

            switch(key){
                case "q":
                    process.exit(0);
                    break;
            }

            await sleep(750);
        }
    }

    format(map: MMap|undefined):string{
        let tmp: string = "";

        if(map == undefined){
            console.log("Current map is undefined for some reason");
            process.exit(1);
        }

        for(let y = 0; y < map.data.length; y++){
            for(let x = 0; x < map.data[y].length; x++){
                tmp += map.data[y][x];
            }
            tmp += "\n"
        }

        return tmp;
    }
}


const game: Game = new Game();

game.play();