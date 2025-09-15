class Agent {
    constructor() {
        this.id = PARAMETERS.idCounter++;

        this.wealth = PARAMETERS.initialWealth;
        this.giveRate = PARAMETERS.giveRate;

        this.employers = [];
        this.employees = [];
        this.agents = [];
    }

    selectInitialNetworks(agents) {
        // Select a random subset of agents as employers
        const numEmployers = PARAMETERS.numEmployers;

        for(let i = 0; i < numEmployers; i++) {
            const randomIndex = randomInt(agents.length);
            const agent = agents[randomIndex];
            if(!agent || !this.employers.includes(agent) && agent !== this) {
                this.employers.push(agents[randomIndex]);
            }
        }

        // Select a random subset of agents as employees
        const numEmployees = PARAMETERS.numEmployees;

        for(let i = 0; i < numEmployees; i++) {
            const randomIndex = randomInt(agents.length);
            const agent = agents[randomIndex];
            if(!agent || !this.employees.includes(agent) && agent !== this) {
                this.employees.push(agents[randomIndex]);
            }
        }

        this.agents = agents;
    }

    selectNewNetworks(agents) {
        this.employers = this.employers.filter(e => e !== null && e.wealth > 0);
        this.employees = this.employees.filter(e => e !== null && e.wealth > 0);
        while(this.employers.length < PARAMETERS.numEmployers && this.employers.length < agents.length - 1) {
            this.selectNewEmployer(agents);
        }
        while(this.employees.length < PARAMETERS.numEmployees && this.employees.length < agents.length - 1) {
            this.selectNewEmployee(agents);
        }
    }

    selectNewEmployer(agents) {
        if(agents.length <= 2*PARAMETERS.numEmployers) {
            agents = agents.filter(a => a !== this && !this.employers.includes(a));
            if(agents.length != 0) {
                this.employers.push(agents[randomInt(agents.length)]);
            }
        } else {
            let randomIndex = randomInt(agents.length);
            let newEmployer = agents[randomIndex];
            while(newEmployer && (this.employers.includes(newEmployer) || newEmployer === this)) {
                randomIndex = randomInt(agents.length);
                newEmployer = agents[randomIndex];
            }
            this.employers.push(newEmployer);
        }
    }

    selectNewEmployee(agents) {
        if(agents.length <= 2*PARAMETERS.numEmployees) {
            agents = agents.filter(a => a !== this && !this.employees.includes(a));
            if(agents.length != 0) {
                this.employees.push(agents[randomInt(agents.length)]);
            }
        } else {
            let randomIndex = randomInt(agents.length);
            let newEmployee = agents[randomIndex];
            while(newEmployee && (this.employees.includes(newEmployee) || newEmployee === this)) {
                randomIndex = randomInt(agents.length);
                newEmployee = agents[randomIndex];
            }
            this.employees.push(newEmployee);
        }
    }

    earnFrom(employer) {
        if(!employer) return 0;
        let amount = 0;
        if(PARAMETERS.yardsale) {
            amount = Math.ceil(this.giveRate * Math.min(this.wealth, employer.wealth));
        } else {
            amount = Math.ceil(employer.giveRate * employer.wealth);
        }
        this.wealth += amount;
        employer.wealth -= amount;
        return amount;
    }

    payTo(employee) {
        if(!employee) return;
        let amount = 0;
        if(PARAMETERS.yardsale) {
            amount = Math.ceil(this.giveRate * Math.min(this.wealth, employee.wealth));
        } else {
            amount = Math.ceil(this.giveRate * this.wealth);
        }
        this.wealth -= amount;
        employee.wealth += amount;
        return amount;
    }

    update() {
        if(PARAMETERS.employeeNetwork || PARAMETERS.employerNetwork) {
            this.selectNewNetworks(this.agents);
        }
        // earn from employers
        const earnChance = PARAMETERS.earnChance;
        if (Math.random() < earnChance) {
            if (PARAMETERS.employerNetwork) {
                let randomEmployer = this.employers[randomInt(this.employers.length)];

                let poorEmployer = randomEmployer && randomEmployer.wealth < this.wealth;
                this.earnFrom(randomEmployer);
                // possibly change employers
                if (PARAMETERS.changeEmployersOnEarnings) {
                    if (poorEmployer) {
                        this.employers = this.employers.filter(e => e !== randomEmployer);
                    }
                    if (!randomEmployer) {
                        // remove only one null employer
                        const nullIndex = this.employers.indexOf(null);
                        if (nullIndex !== -1) {
                            this.employers.splice(nullIndex, 1);
                        }
                    }
                }
            } else {
                let randomEmployer = this.agents[randomInt(this.agents.length)];
                while (randomEmployer === this) {
                    randomEmployer = this.agents[randomInt(this.agents.length)];
                }
                this.earnFrom(randomEmployer);
            }
        }

        // pay to employees
        const spendChance = PARAMETERS.spendChance;
        if (Math.random() < spendChance) {
            if (PARAMETERS.employeeNetwork) {
                let randomEmployee = this.employees[randomInt(this.employees.length)];

                let richEmployee = randomEmployee && randomEmployee.wealth > this.wealth;
                this.payTo(randomEmployee);
                // possibly change employees
                if (PARAMETERS.changeEmployeeOnPayment) {
                    if (richEmployee) {
                        this.employees = this.employees.filter(e => e !== randomEmployee);
                    }
                    if (!randomEmployee) {
                        // remove only one null employee
                        const nullIndex = this.employees.indexOf(null);
                        if (nullIndex !== -1) {
                            this.employees.splice(nullIndex, 1);
                        }
                    }
                }
            } else {
                let randomAgent = this.agents[randomInt(this.agents.length)];
                while (randomAgent === this) {
                    randomAgent = this.agents[randomInt(this.agents.length)];
                }
                this.payTo(randomAgent);
            }
        }
    }

    draw(ctx) {
    
    }
}
