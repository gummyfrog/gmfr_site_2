/* jshint esversion: 6 */

function mwymi_logger(msg) {
	console.log("MWYMI: " + msg);
}

var express = require('express');
var router = express.Router();
var axios = require('axios');
var json = require('jsonfile');
var websocket = require('ws');

const wss = new websocket.Server({ port: 8000 });

wss.on('connection', (ws) => {
	console.log("New Client Connected");

	ws.on('message', (msg) => {
		var data = JSON.parse(msg);
		// exchange logic and the such

		if(data.operation == "puzzle-blame" || data.operation == "exchange-blame") {
			send_all(ws, JSON.stringify({identifier:"notify", message:data.blame}));
		}

		updateClients();
	});

	updateClient(ws);
});


// router.get('/api/puzzle/values', (req, res) => {
// 	res.json({"values":puzzleValues, "status": "200"});
// });


setInterval(updateClients, 1000 * 3);


// function handleIncoming(message) {
// 	// token issuing?

// 	var message = JSON.parse(message);
// }


function updateClient(client) {
	client.send(JSON.stringify({identifier: "bank-update", bank: bank}));
	client.send(JSON.stringify({identifier: "graph-update", graph: graph}));
	client.send(JSON.stringify({identifier: "puzzle-value-update", values: puzzleValues}));
}

function updateClients() {
	wss.clients.forEach(client => {
		if(client.readyState === websocket.OPEN) {
			updateClient(client);
		}
	});
}

function send_all(ws, data) {
	wss.clients.forEach(client => {
		if(client !== ws && client.readyState === websocket.OPEN) {
			client.send(data);
		}
	});	
}

function nonce() {
	var nonce = "";

	for(var x=0; x<3; x++) {
		var big_number = Math.floor(Math.random() * 10);
		nonce += String.fromCharCode(66+big_number);
	}

	return nonce;
}

var URL = "https://www.xn--hs4d.com";

if(process.env.DEBUG) {
	URL = "http://localhost:3000/mwymi";
}

var puzzleValues = [
	"",
	{"name": "math", "value": 1.0},
	{"name": "anagram", "value": 1.0},
	{"name": "clicker", "value": 1.0}
];

puzzleValues[0] = nonce();

var rate = 0.02;
var bank;
var graph;

initializeStock();
initializeGraph();

// wallet calls should be replaced with read first/ store local, write at quit


function initializeStock() {
	bank = json.readFileSync("./wallet/bank.json");
}

function initializeGraph() {
	graph = json.readFileSync("./wallet/graph.json");
}

function recordPrices() {
	graph.mc.push({t: new Date(), y: bank.held.VC/bank.held.MC});
	graph.vc.push({t: new Date(), y: bank.held.MC/bank.held.VC});

	json.writeFile("./wallet/graph.json", graph, (err, res) => {
		if(err) {
			console.error();
		}
	});
}

equalizeMarket();
recordPrices();

setInterval(recordPrices, 5*1000);
// setInterval(equalizeMarket, 20*1000);
// setInterval(shakeMarket, 30*1000);

function equalizeMarket() {
	coin = get_coin();
	if(bank.held[inverse_coin(coin)] / bank.held[coin] < bank.held[coin] / bank.held[inverse_coin(coin)]) {
		coin = inverse_coin(coin);
	}
	amount = Math.floor((Math.random()*120) + 10);
	var rate = bank.held[inverse_coin(coin)] / bank.held[coin];
	var merit_amount = amount * rate;

	mwymi_logger(`${coin_symbol(inverse_coin(coin))}/${coin_symbol(coin)} EXCHANGE RATE: ${rate}`);

	axios.post(`${URL}/api/bank/deposit`, {"coin": coin, "amount": amount})
	.then(response => {
		if(response.status == 200) {
			mwymi_logger("Doing a little stabilizing.");
			axios.post(`${URL}/api/bank/withdraw`, {"coin": inverse_coin(coin), "amount": merit_amount})
			.then(response => {
				if(response.status == 200) {
					mwymi_logger("Exchange seems ok!");						
				}
			});
		}
	})
	.catch(console.error);
}

function shakeMarket() {
	coin = get_coin();
	// if(bank.held[inverse_coin(coin)] / bank.held[coin] < bank.held[coin] / bank.held[inverse_coin(coin)]) {
	// 	coin = inverse_coin(coin);
	// }
	amount = Math.floor((Math.random()*700) + 10);
	var rate = bank.held[inverse_coin(coin)] / bank.held[coin];
	var merit_amount = amount * rate;

	mwymi_logger(`${coin_symbol(inverse_coin(coin))}/${coin_symbol(coin)} EXCHANGE RATE: ${rate}`);

	axios.post(`${URL}/api/bank/deposit`, {"coin": coin, "amount": amount})
	.then(response => {
		if(response.status == 200) {
			mwymi_logger("Doing a little shaking.");
			axios.post(`${URL}/api/bank/withdraw`, {"coin": inverse_coin(coin), "amount": merit_amount})
			.then(response => {
				if(response.status == 200) {
					mwymi_logger("Exchange seems ok!");						
				}
			});
		}
	})
	.catch(console.error);
}


function puzzleSwitch(which) {
	puzzleValues[0] = nonce();

	var toMerit = puzzleValues.filter(obj => {
		return obj.name!=which;
	});
	var toDemerit = puzzleValues.filter(obj => {
		return obj.name==which;
	});

	if(toDemerit[0].value - rate*toMerit.length > 0) {
		toDemerit[0].value -= rate*toMerit.length;
		
		for(var x=0;x<toMerit.length;x++) {
			toMerit[x].value += rate;
		}
	}

	updateClients();
}

function makeDefault(players, target) {
	players[target] = {"held": {"VC": 420, "MC": 115}};
	return players;
}

function inverse_coin(coin) {
	if(coin == "MC") {
		return "VC";
	} else {
		return "MC";
	}
}

function coin_symbol(coin) {
	if(coin == "MC") {
		return "🜸";
	} else {
		return "🜁";
	}
}

function get_coin() {
	var coin = Math.floor(Math.random()*10);
	if(coin > 5) {
		return "MC";
	} else {
		return "VC";
	}
}


router.get('/api/market', (req, res) => {
	res.json(bank);
});


router.post('/api/player/demerit', (req, res) => {
	var body = req.body;

	// player, coin, amount

	json.readFile(`./wallet/players.json`, (err, players) => {
		if(err) { 
			mwymi_logger(err);
			res.json({"Error": err | 500});
			return;
		}

		// create target if it doesn't exist
		if(!players[body.target]) {
			makeDefault(players, body.target);
		}

		// identify target
		target = players[body.target];
		// check if they can afford the demerit
		if((target.held[body.coin] < body.amount)) {
			res.json({"message": "BROKE", "status": 600});
			return;
		}

		// demerit
		players[body.target].held[body.coin] -= body.amount;

		// put it in the bank
		axios.post(`${URL}/api/bank/deposit`, {"coin": body.coin, "amount": parseFloat(body.amount)})
		.then((response) => {
			if(response.data.status == 200) {
				// everything seemed to go ok... reflect changes in file
				json.writeFile("./wallet/players.json", players, (err, result) => {
					if(err) { 
						mwymi_logger(err);
						res.json({"Error": err | 500});
						return;
					}

					mwymi_logger(`${body.target} paid ${coin_symbol(body.coin)}${body.coin}${parseFloat(body.amount)} to the bank.`);
					res.json({"message": "Payment Successful.", "status": 200});
				});
			} else {
				mwymi_logger(err);
				res.json({"Error": response.status | 500});
			}
		})
		.catch((axios_error) => {
			mwymi_logger(axios_error);	
			res.json({"axioserror": axios_error});
			return;
		});
	});
});


router.post('/api/bank/deposit', (req, res) => {
	var body = req.body;
	// recordFromHeld(bank);

	bank.held[body.coin] += parseFloat(body.amount);

	mwymi_logger(`Deposited ${coin_symbol(body.coin)}${body.coin}${parseFloat(body.amount)} to the bank. Bank State: ${bank.held.VC} / ${bank.held.MC}`);
	res.json({"status": 200});

});

router.post('/api/bank/withdraw', (req, res) => {
	var body = req.body;

	if((bank.held[body.coin] <= parseFloat(body.amount))) {
		mwymi_logger("OH NO! BANK CAN'T AFFORD!");
		res.json({"status": 400});
		return;
	}

	bank.held[body.coin] -= parseFloat(body.amount);
	mwymi_logger(`Withdrew ${coin_symbol(body.coin)}${body.coin}${parseFloat(body.amount)} from the bank. Bank State: ${bank.held.VC} / ${bank.held.MC}`);
	res.json({"status": 200});

});





router.post('/api/player/merit', (req, res) => {
	var body = req.body;

	// player, coin, amount

	json.readFile(`./wallet/players.json`, (err, players) => {
		if(err) { 
			mwymi_logger(err);
			console.log("ERR!");
			res.json({"Error": err | 500});
			return;
		}

		if(!players[body.target]) {
			makeDefault(players, body.target);
		}

		// withdraw from bank
		axios.post(`${URL}/api/bank/withdraw`, {"coin": body.coin, "amount": parseFloat(body.amount)})
		.then((response) => {
			if(response.data.status == 200) {
			// everything seemed to go ok... pay the player & reflect changes in file
				players[body.target].held[body.coin] += parseFloat(body.amount);

				json.writeFile("./wallet/players.json", players, (err, result) => {
					if(err) { 
						mwymi_logger(err);
						res.json({"Error": err | 500});
						return;
					}

					mwymi_logger(`${body.target} got paid ${coin_symbol(body.coin)}${body.coin}${parseFloat(body.amount)} by the bank.`);
					res.json({"message": "Payment Successful.", "status": 200});
				});
			} else {
				res.json({"Error": err | 500});
			}
		})
		.catch((axios_error) => {
			mwymi_logger(axios_error);
			res.json({"axioserror": axios_error});
			return;
		});
	});
});





router.post('/api/player/exchange', (req, res) => {
	var body = req.body;

	console.log(req.body);

	// player, coin, amount
	var rate = bank.held[inverse_coin(body.coin)] / bank.held[body.coin];
	var merit_amount = (parseFloat(body.amount) * rate);
	// tax
	var tax_amount = merit_amount*0.3;
	merit_amount = merit_amount*0.7;


	mwymi_logger(`${coin_symbol(inverse_coin(body.coin))}/${coin_symbol(body.coin)} EXCHANGE RATE: ${rate}`);

	axios.post(`${URL}/api/player/demerit`, {"target": body.target, "coin": body.coin, "amount": parseFloat(body.amount)})
	.then((response) => {
		if(response.data.status != 200) {
			res.json({"status":600}); 
			return;
		}

		mwymi_logger("Demerit ok.");

		// deposit tax
		axios.post(`${URL}/api/bank/deposit`, {"coin": inverse_coin(coin), "amount": tax_amount})
		.then(response => {
			if(response.status == 200) {
				mwymi_logger("Tax collected.");
			}
		})
		.catch(console.error);



		axios.post(`${URL}/api/player/merit`, {"target": body.target, "coin": inverse_coin(body.coin), "amount": merit_amount})
		.then((meritresponse) => {
			mwymi_logger(meritresponse.data);
			if (meritresponse.data.Error == 500) {
				// pay 'em back' if the bank can't pay back
				mwymi_logger("PAYBACK STIMULUS");
				axios.post(`${URL}/api/player/merit`, {"target": body.target, "coin": body.coin, "amount": parseFloat(body.amount)})
				.then((paybackresponse) => {
					mwymi_logger("TRYING PAYBACK");
				})
				.catch((axios_error) => {

				});
				return;
			} else {
				res.json({"status":400}); 
				return;
			}

			mwymi_logger("Merit ok. Exchange over!");
			res.json({"status": 200});
		})
		.catch((axios_error) => {

		});
	})
	.catch((axios_error) => {

	});
});

router.get('/api/player/wallet', (req, res) => {
	var target = req.headers.target;

	// player, coin, amount

	json.readFile(`./wallet/players.json`, (err, players) => {
		if(err) { 
			mwymi_logger(err);
			res.json({"Error": err | 500});
			return;
		}

		if(!players[target]) {
			makeDefault(players, target);
		}

		res.json({"held":players[target].held, "status":200});
	});
});


router.post('/api/puzzle/demerit', (req, res) => {
	var body = req.body;
	var which = body.which;
	puzzleSwitch(which);
	res.json({"status": 200});
});

router.get('/api/puzzle/value', (req, res) => {
	var which = req.headers.which;
	var search = puzzleValues.filter(obj => {
		return obj.name==which;
	});
	if(search.length >= 1) {
		res.json({search});
	} else {
		res.json({"message":"invalid puzzle", "status": "401"})
	}
});


router.get('/', function(req, res, next) {
  res.render('mwymi', { title: 'MWYMI' });
});

module.exports = router;
