export class Player {
    id: string;
    username: string;
    nation: string;
    isOnline: boolean;
    socketId: string;

    // New Supremacy 1914 Resource Schema
    resources: {
        money: number;
        food: number;      // Grain + Fish
        materials: number; // Wood + Iron
        energy: number;    // Coal + Oil + Gas
        manpower: number;
    };

    // Relations with other players (Map<PlayerId, RelationStatus>)
    // RelationStatus: 'WAR' | 'PEACE' | 'RIGHT_OF_WAY' | 'SHARE_MAP'
    relations: Map<string, string>;

    constructor(id: string, username: string, nation: string, socketId: string) {
        this.id = id;
        this.username = username;
        this.nation = nation;
        this.socketId = socketId;
        this.isOnline = true;
        this.relations = new Map();

        // Initial Resources (to be balanced)
        this.resources = {
            money: 20000,
            food: 20000,
            materials: 20000,
            energy: 20000,
            manpower: 1000
        };
    }
}
