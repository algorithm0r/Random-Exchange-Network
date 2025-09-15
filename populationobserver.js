class PopulationObserver {
    constructor(population, dataManager) {
        this.population = population;
        this.dataManager = dataManager;
        this.agents = population.agents;

        const popData = [this.dataManager.populationTimeSeries, this.dataManager.nullPopulationTimeSeries];
        this.populationGraph = new Graph(1000, 0, 1000, 100, popData, 'Population Over Time', 0, 100, true);

        const wealthData = [this.dataManager.minWealthTimeSeries, this.dataManager.averageWealthTimeSeries, this.dataManager.maxWealthTimeSeries];
        this.wealthGraph = new Graph(1000,115,1000,100, wealthData, "Wealth", 0, PARAMETERS.initialWealth, true);

        const wealthHistogram = this.dataManager.wealthDistribution;
        this.wealthHistogram = new Histogram(1000, 230, wealthHistogram, {label: "Wealth", width: 1000, height: 100});
    }

    update() {

    }

    drawNetwork(ctx) {
        // draw agents in a circle
        const centerX = ctx.canvas.height / 2;
        const centerY = ctx.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        const angleStep = (2 * Math.PI) / this.agents.length;
        this.agents.forEach((agent, index) => {
            if (agent) {
                const angle = index * angleStep;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                ctx.fillStyle = 'blue';
                ctx.beginPath();
                const rad = 1 + Math.log(agent.wealth + 1);
                ctx.arc(x, y, rad, 0, 2 * Math.PI);
                ctx.fill();

                // draw connections to employers
                if (PARAMETERS.employerNetwork) {
                    ctx.strokeStyle = 'rgba(255,0,0,0.1)';
                    agent.employers.forEach(employer => {
                        const employerIndex = this.agents.indexOf(employer);
                        if (!employer || employerIndex === -1) return; // skip if employer not found
                        const employerAngle = employerIndex * angleStep;
                        const ex = centerX + radius * Math.cos(employerAngle);
                        const ey = centerY + radius * Math.sin(employerAngle);
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(ex, ey);
                        ctx.stroke();
                    });
                }
                // draw connections to employees
                if (PARAMETERS.employeeNetwork) {
                    ctx.strokeStyle = 'rgba(0,0,255,0.1)';
                    agent.employees.forEach(employee => {
                        const employeeIndex = this.agents.indexOf(employee);
                        if (!employee || employeeIndex === -1) return; // skip if employee not found
                        const employeeAngle = employeeIndex * angleStep;
                        const ex = centerX + radius * Math.cos(employeeAngle);
                        const ey = centerY + radius * Math.sin(employeeAngle);
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(ex, ey);
                        ctx.stroke();
                    });
                }
            } else {
                // draw null agents as gray dots
                const angle = index * angleStep;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                ctx.fillStyle = 'gray';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
    }

    drawPopulationStats(ctx) {
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.fillText(`Total Agents: ${this.dataManager.numAgents}`, 10, 20);
        ctx.fillText(`Null Agents: ${this.dataManager.numNullAgents}`, 10, 40);
        ctx.fillText(`Total Wealth: ${this.dataManager.totalWealth}`, 10, 60);
        ctx.fillText(`Average Wealth: ${this.dataManager.averageWealth.toFixed(0)}`, 10, 80);
        ctx.fillText(`Max Wealth: ${this.dataManager.maxWealth}`, 10, 100);
        ctx.fillText(`Min Wealth: ${this.dataManager.minWealth}`, 10, 120);
    }

    draw(ctx) {
        this.drawNetwork(ctx);
        this.drawPopulationStats(ctx);

        this.populationGraph.draw(ctx);
        this.wealthGraph.draw(ctx);
        this.wealthHistogram.draw(ctx);
    }
}
