const gameEngine = new GameEngine();

const ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.downloadAll(() => {
	document.getElementById("resetButton").onclick = function() {
		loadParametersFromUI();
		gameEngine.entities = [];
		let population = new Population();
		gameEngine.addEntity(population);
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
