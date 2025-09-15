class Population {
    constructor() {
        this.agents = [];
        for (let i = 0; i < PARAMETERS.initialAgents; i++) {
            this.agents.push(new Agent());
        }
        for(let i = 0; i < PARAMETERS.initialNullAgents; i++) {
            this.agents.push(null);
        }
        this.agents.forEach(agent => agent?.selectInitialNetworks(this.agents));

        this.dataManager = new DataManager(this);

        this.populationObserver = new PopulationObserver(this, this.dataManager);
    }

    executeRandomTrades (num) {
        for (let i = 0; i < num; i++) {
            let employer = this.agents[randomInt(this.agents.length)];
            let employee = this.agents[randomInt(this.agents.length)];
            if (employer && employee && employer !== employee) {
                employee.earnFrom(employer);
            }
        }
    }

    update() {
        this.agents.forEach(agent => agent?.update());
        for(let i = this.agents.length - 1; i >= 0; i--) {
            if(this.agents[i] && this.agents[i].wealth <= 0) {
                if (PARAMETERS.nullAgents) // replace agent with null agent
                    this.agents.splice(i, 1, null);
                else if (PARAMETERS.removeDeadAgents) // remove agent
                    this.agents.splice(i, 1);
            }
        }
        this.executeRandomTrades(PARAMETERS.randomTrades);
        this.dataManager.update();
    }

    draw(ctx) {
        this.populationObserver.draw(ctx);
    }
}
