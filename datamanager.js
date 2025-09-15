class DataManager {
	constructor(population) {
		this.population = population;
		this.agents = population.agents;

		// population statistics
		this.populationTimeSeries = [];
		this.nullPopulationTimeSeries = [];
		this.upperClassTimeSeries = [];
		this.lowerClassTimeSeries = [];
		
		// wealth statistics
		this.maxWealthTimeSeries = [];
		this.minWealthTimeSeries = [];
		this.averageWealthTimeSeries = [];
		
		// wealth distribution
		this.wealthDistribution = [];

		this.averageWealth = 0;
		this.totalWealth = 0;
		this.maxWealth = 0;
		this.minWealth = 0;
		this.numAgents = 0;
		this.numUpperClass = 0;
		this.numLowerClass = 0;
		this.numNullAgents = 0;
		this.tick = 0;
		this.reportingPeriod = PARAMETERS.reportingPeriod;
	}
	update() {
		this.tick++;
		if (this.tick % this.reportingPeriod === 0) {
			this.numAgents = this.agents.filter(a => a !== null).length;
			this.populationTimeSeries.push(this.numAgents);
			this.numNullAgents = this.agents.length - this.numAgents;
			this.nullPopulationTimeSeries.push(this.numNullAgents);

			this.averageWealth = this.numAgents > 0 ? this.totalWealth / this.numAgents : 0;
			this.numUpperClass = this.agents.filter(a => a !== null && a.wealth > this.averageWealth).length;
			this.numLowerClass = this.numAgents - this.numUpperClass;
			this.upperClassTimeSeries.push(this.numUpperClass);
			this.lowerClassTimeSeries.push(this.numLowerClass);

			this.totalWealth = this.agents.reduce((sum, agent) => sum + (agent ? agent.wealth : 0), 0);
			this.maxWealth = this.agents.reduce((max, agent) => agent ? Math.max(max, agent.wealth) : max, 0);
			this.minWealth = this.agents.reduce((min, agent) => agent ? Math.min(min, agent.wealth) : min, Infinity);
			this.averageWealthTimeSeries.push(this.averageWealth);
			this.maxWealthTimeSeries.push(this.maxWealth);
			this.minWealthTimeSeries.push(this.minWealth === Infinity ? 0 : this.minWealth);

			const agentWealths = this.agents.filter(a => a !== null).map(a => a.wealth);
			const counts = [];
			for(let i = 0; i < 20; i++) {
				counts.push(0);
			}
			counts[0] += this.numNullAgents;
			const bucketSize = this.averageWealth / 5;
			agentWealths.forEach(wealth => {
				let index = Math.min(19,Math.floor(wealth / bucketSize));
				counts[index]++
			});
			this.wealthDistribution.push(counts);
		}
	}

	draw(ctx) {
	}
};