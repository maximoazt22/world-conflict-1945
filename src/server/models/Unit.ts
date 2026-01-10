export type UnitType =
    | 'INFANTRY' | 'CAVALRY' | 'ARMORED_CAR'
    | 'ARTILLERY' | 'TANK' | 'HEAVY_TANK' | 'RAILGUN'
    | 'FIGHTER' | 'BOMBER' | 'BALLOON'
    | 'BATTLESHIP' | 'LIGHT_CRUISER' | 'SUBMARINE';

export class Unit {
    id: string;
    type: UnitType;
    ownerId: string;
    provinceId: string; // Current location

    // Movement
    targetProvinceId: string | null;
    movementProgress: number; // 0-100% to next node
    path: string[]; // List of province IDs

    // Combat Stats
    health: number; // 0-100%
    strength: number; // Quantity of soldiers/vehicles in this unit/stack

    constructor(id: string, type: UnitType, ownerId: string, provinceId: string, count: number = 1) {
        this.id = id;
        this.type = type;
        this.ownerId = ownerId;
        this.provinceId = provinceId;
        this.targetProvinceId = null;
        this.movementProgress = 0;
        this.path = [];
        this.health = 100;
        this.strength = count;
    }
}
