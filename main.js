const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

var socket = null;
if (window.io !== undefined) {
	console.log("Database connected!");

	socket = io.connect(PARAMETERS.ip);

	socket.on("connect", function () {
		databaseConnected();
	});
	
	socket.on("disconnect", function () {
		databaseDisconnected();
	});

	socket.addEventListener("error", console.log);
	socket.addEventListener("log", console.log);
}

function loadFirstRunParameters() {
	runIndex = 0;
	const run = runs[runIndex];
	Object.assign(PARAMETERS, run);
	saveParametersToUI();
	startRun();
}

function loadNextRunParameters() {
	runIndex = (runIndex + 1) % runs.length;
	const run = runs[runIndex];
	Object.assign(PARAMETERS, run);
	saveParametersToUI();
	startRun();
}

function startRun() {
	gameEngine.entities = [];
	let population = new Population();
	gameEngine.addEntity(population);
}

ASSET_MANAGER.downloadAll(() => {
	document.getElementById("resetButton").onclick = function() {
		loadParametersFromUI();
		startRun();
	}

	document.getElementById("runExperimentButton").onclick = function() {
		loadFirstRunParameters();
		startRun();
	}

	document.getElementById("nextRunButton").onclick = function() {
		loadNextRunParameters();
		startRun();
	}

	const canvas = document.getElementById("gameWorld");
	const ctx = canvas.getContext("2d");

	loadParametersFromUI();
	gameEngine.entities = [];

	gameEngine.init(ctx);

	let population = new Population();
	gameEngine.addEntity(population);

	gameEngine.start();
});
