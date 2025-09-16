/*
    Parameter options  
    giveRate: 0.1 to 0.9
    yardsale: true/false
    employeeNetwork: true/false
    changeEmployeeOnPayment: true/false
    employerNetwork: true/false
    changeEmployersOnEarnings: true/false
    earnChance: 0.0/0.0
    spendChance: 0.0/0.0
    randomTrades: 0/1/100
    nullAgents: true/false
    removeDeadAgents: true/false

    Main runs
    Yard Sale/Random Pairs/100 trades/Preserve Dead
    Proportional/Random Pairs/100 trades/Preserve Dead
    Yard Sale/Random Pairs/100 trades/Remove Dead
    Proportional/Random Pairs/100 trades/Remove Dead
    Yard Sale/Random Pairs/100 trades/Null Agents
    Proportional/Random Pairs/100 trades/Null Agents 
    */
let runIndex = 0;

const runs = [
  // Yard Sale + Preserve Dead
  { runName: "YS_Preserve_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "YS_Preserve_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },

  // TF + Preserve Dead  
  { runName: "TF_Preserve_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },
  { runName: "TF_Preserve_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: false },

  // Yard Sale + Remove Dead
  { runName: "YS_Remove_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "YS_Remove_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },

  // TF + Remove Dead
  { runName: "TF_Remove_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },
  { runName: "TF_Remove_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: false, removeDeadAgents: true },

  // Yard Sale + Null Agents
  { runName: "YS_Null_0.1", giveRate: 0.1, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.2", giveRate: 0.2, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.3", giveRate: 0.3, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.4", giveRate: 0.4, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.5", giveRate: 0.5, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.6", giveRate: 0.6, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.7", giveRate: 0.7, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.8", giveRate: 0.8, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "YS_Null_0.9", giveRate: 0.9, yardsale: true, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },

  // TF + Null Agents
  { runName: "TF_Null_0.1", giveRate: 0.1, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.2", giveRate: 0.2, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.3", giveRate: 0.3, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.4", giveRate: 0.4, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.5", giveRate: 0.5, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.6", giveRate: 0.6, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.7", giveRate: 0.7, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.8", giveRate: 0.8, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false },
  { runName: "TF_Null_0.9", giveRate: 0.9, yardsale: false, employeeNetwork: false, changeEmployeeOnPayment: false, employerNetwork: false, changeEmployersOnEarnings: false, earnChance: 0.0, spendChance: 0.0, randomTrades: 100, nullAgents: true, removeDeadAgents: false }
];
