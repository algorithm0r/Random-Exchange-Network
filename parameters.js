/** Global Parameters Object */
const PARAMETERS = {
    runName: "Run From Controls",
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

    db: "random_exchange",
    collection: "batch_001",
    reportingPeriod: 10,
    epoch: 10000,
    ip:'https://73.19.38.112:8888',    
};


const loadParametersFromUI = () => {
    PARAMETERS.initialAgents = parseInt(document.getElementById("numAgents").value);
    PARAMETERS.initialWealth = parseInt(document.getElementById("initialWealth").value);
    PARAMETERS.initialEmployers = parseInt(document.getElementById("numEmployers").value);
    PARAMETERS.initialEmployees = parseInt(document.getElementById("numEmployees").value);
    PARAMETERS.yardsale = document.getElementById("yardsale").checked;
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
    PARAMETERS.runName = "Run From Controls";
    document.getElementById("runName").innerText = PARAMETERS.runName;
};

const saveParametersToUI = () => {
    document.getElementById("numAgents").value = PARAMETERS.initialAgents;
    document.getElementById("initialWealth").value = PARAMETERS.initialWealth;
    document.getElementById("numEmployers").value = PARAMETERS.numEmployers;
    document.getElementById("numEmployees").value = PARAMETERS.numEmployees;
    document.getElementById("yardsale").checked = PARAMETERS.yardsale;
    document.getElementById("employeeNetwork").checked = PARAMETERS.employeeNetwork;
    document.getElementById("employerNetwork").checked = PARAMETERS.employerNetwork;
    document.getElementById("changeEmployersOnEarnings").checked = PARAMETERS.changeEmployersOnEarnings;
    document.getElementById("changeEmployeeOnPayment").checked = PARAMETERS.changeEmployeeOnPayment;
    document.getElementById("nullAgents").checked = PARAMETERS.nullAgents;
    document.getElementById("deadAgents").checked = PARAMETERS.removeDeadAgents;
    document.getElementById("earnChance").value = PARAMETERS.earnChance;
    document.getElementById("spendChance").value = PARAMETERS.spendChance;
    document.getElementById("randomTrades").value = PARAMETERS.randomTrades;
    document.getElementById("giveRate").value = PARAMETERS.giveRate;
    document.getElementById("runName").innerHTML = PARAMETERS.runName;
};