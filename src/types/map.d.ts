import { Position } from "./position.d";

export interface MMap {
    data: string[][];
    start_position: Position;
    column: number;
    row: number;
}