import { Player } from './Player';
import { Province } from './Province';
import { Unit } from './Unit';

export class Game {
    id: string;
    players: Map<string, Player>;
    provinces: Map<string, Province>;
    units: Map<string, Unit>;

    // Time
    tick: number; // 1 tick = 1 in-game hour (can be accelerated)
    day: number;

    // Status
    status: 'LOBBY' | 'PLAYING' | 'ENDED';
    startTime: number;

    constructor(id: string) {
        this.id = id;
        this.players = new Map();
        this.provinces = new Map();
        this.units = new Map();
        this.tick = 0;
        this.day = 1;
        this.status = 'LOBBY';
        this.startTime = Date.now();
    }

    addPlayer(player: Player) {
        this.players.set(player.id, player);
    }

    // Main Simulation Loop
    processTick() {
        if (this.status !== 'PLAYING') return;

        this.tick++;

        // 24 ticks = 1 day
        if (this.tick % 24 === 0) {
            this.day++;
            this.triggerDailyEvents();
        }

        this.processEconomy();
        this.processMovement();
        this.processCombat();
    }

    private processEconomy() {
        // Calculate production for all provinces
        this.provinces.forEach(prov => {
            if (!prov.ownerId) return;
            const owner = this.players.get(prov.ownerId);
            if (!owner) return;

            // Simple Morale factor (0-1)
            const moraleFactor = prov.morale / 100;

            // Production logic (Supremacy style)
            // TODO: Add building multipliers
            if (prov.resourceType === 'FOOD') owner.resources.food += prov.baseProduction * moraleFactor;
            if (prov.resourceType === 'MATERIALS') owner.resources.materials += prov.baseProduction * moraleFactor;
            if (prov.resourceType === 'ENERGY') owner.resources.energy += prov.baseProduction * moraleFactor;

            // Tax / Money
            owner.resources.money += 100 * moraleFactor;
        });

        // Consumption logic (Unit upkeep)
        this.units.forEach(unit => {
            const owner = this.players.get(unit.ownerId);
            if (!owner) return;

            // Basic upkeep
            owner.resources.food -= 5 * unit.strength;
        });
    }

    private processMovement() {
        // TODO: Implement path interpolation
    }

    private processCombat() {
        // TODO: Implement combat resolution
    }

    private triggerDailyEvents() {
        // TODO: Newspaper generation, Spy reports
    }
}
