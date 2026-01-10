export class Province {
    id: string;
    name: string;
    ownerId: string | null;
    ownerColor?: string; // Visual helper
    core: boolean; // True if original territory (morale penalty if false)

    // Production
    resourceType: 'FOOD' | 'MATERIALS' | 'ENERGY';
    baseProduction: number;
    morale: number; // 0-100

    // Buildings (Level 0 = not built)
    buildings: {
        recruitment_office: boolean;
        barracks: boolean;
        workshop: number; // Level 1-2
        factory: number; // Level 1-4
        aerodrome: boolean;
        harbor: boolean;
        railroad: boolean;
        fortress: number; // Level 1-5
    };

    // Construction Queue
    construction: {
        building: string | null;
        timeLeft: number; // Ticks remaining
    };

    // Unit Production Queue
    production: {
        unitType: string | null;
        timeLeft: number;
        queue: string[]; // Array of unit types queued
    };

    // Garrison (Simple count for now, linked to separate Unit entities ideally)
    units: string[]; // Unit IDs stationed here

    constructor(id: string, name: string, resourceType: 'FOOD' | 'MATERIALS' | 'ENERGY') {
        this.id = id;
        this.name = name;
        this.ownerId = null;
        this.core = true;
        this.resourceType = resourceType;
        this.baseProduction = 1000;
        this.morale = 100;

        this.buildings = {
            recruitment_office: false,
            barracks: false,
            workshop: 0,
            factory: 0,
            aerodrome: false,
            harbor: false,
            railroad: false,
            fortress: 0
        };

        this.construction = { building: null, timeLeft: 0 };
        this.production = { unitType: null, timeLeft: 0, queue: [] };
        this.units = [];
    }
}
