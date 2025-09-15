/** Global Parameters Object */
const PARAMETERS = {    
    initialAgents: 100,
    initialNullAgents: 0,
    initialWealth: 100,
    numEmployers: 5,
    numEmployees: 5,

    yardsale: true,

    employerNetwork: true,
    changeEmployersOnEarnings: true,
    employeeNetwork: true,
    changeEmployeeOnPayment: true,

    nullAgents: false,
    removeDeadAgents: true,

    earnChance: 0.0,
    spendChance: 1.0,
    randomTrades: 1,

    giveRate: 0.5,

    idCounter: 0,

    reportingPeriod: 20, 
};


const loadParametersFromUI = () => {
    PARAMETERS.initialAgents = parseInt(document.getElementById("numAgents").value);
    PARAMETERS.initialWealth = parseInt(document.getElementById("initialWealth").value);
    PARAMETERS.initialEmployers = parseInt(document.getElementById("numEmployers").value);
    PARAMETERS.initialEmployees = parseInt(document.getElementById("numEmployees").value);
    PARAMETERS.yardsale = document.getElementById("yardSale").checked;
    PARAMETERS.employeeNetwork = document.getElementById("employeeNetwork").checked;
    PARAMETERS.employerNetwork = document.getElementById("employerNetwork").checked;
    PARAMETERS.changeEmployersOnEarnings = document.getElementById("changeEmployersOnEarnings").checked;
    PARAMETERS.changeEmployeeOnPayment = document.getElementById("changeEmployeeOnPayment").checked;
    PARAMETERS.nullAgents = document.getElementById("nullAgents").checked;
    PARAMETERS.removeDeadAgents = document.getElementById("deadAgents").checked;
    PARAMETERS.earnChance = parseFloat(document.getElementById("earnChance").value);
    PARAMETERS.spendChance = parseFloat(document.getElementById("spendChance").value);
    PARAMETERS.randomTrades = parseInt(document.getElementById("randomTrades").value);
    PARAMETERS.giveRate = parseFloat(document.getElementById("giveRate").value);
};