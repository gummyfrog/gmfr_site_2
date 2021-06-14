// jshint esversion: 6

//graphing nonsense
		function chart(data) {
			var options = {
					responsive: true,
					maintainAspectRatio: false,
					elements: {
						line: {
							tension: 0.1
						},
						point: {
							radius: 0
						}
					},
					animation: {
						duration: 0
					},
					legend: {
				        display: false
				    },
				    tooltips: {
				        callbacks: {
				           label: (tooltipItem) => {
				                  return tooltipItem.yLabel;
				           }
				        }
				    },
				    scales:{
			           xAxes: [{
			              	display: false //this will remove all the x-axis grid lines
			           }],
			           yAxes: [{
			                ticks: {
			                    beginAtZero:false,
			                    fontColor: 'white'
			                },
			            }],			        
			        }
			};
			var now = new Date();
			var recentInMinutes = 20;

			data.mc = data.mc.filter(obj=> {
				var diffInMS = now - new Date(obj.t);
				var msInHour = Math.floor(diffInMS/1000/60);
				return msInHour < recentInMinutes;
			});

			data.vc = data.vc.filter(obj=> {
				var diffInMS = now - new Date(obj.t);
				var msInHour = Math.floor(diffInMS/1000/60);
				return msInHour < recentInMinutes;
			});


			var mcctx = document.getElementById("MCCHART").getContext("2d");
			var mcchart = new Chart(mcctx, {
			    // The type of chart we want to create
			    type: 'line',

			    // The data for our dataset
			    data: {
			        labels: data.mc.map(obj=>{return obj.t}),
			        datasets: [{
			            label: '🜸MC',
			            borderColor: this.COLORMC,
			            data: data.mc
			        }]
			    },

			    // Configuration options go here
			    options: options
			});

			var vcctx = document.getElementById("VCCHART").getContext("2d");
			var vcchart = new Chart(vcctx, {
			    // The type of chart we want to create
			    type: 'line',

			    // The data for our dataset
			    data: {
			        labels: data.vc.map(obj=>{return obj.t}),
			        datasets: [{
			            label: '🜁VC',
			            borderColor: this.COLORVC,
			            data: data.vc
			        }]
			    },

			    // Configuration options go here
			    options: options
			});
		}

		this.url = "http://localhost:3000/mwymi";

		this.words = [
			["eggs", "hamlet", "coin", "berg", "freak", "suburb", "spoil", "shock", "burst", "asset", "suit",
			"penny", "panic", "drill", "roar", "rack", "cast", "tear", "help", "tube", "team", "silk", "land"],
			["method", "switch", "please", "cotton", "launch", "manual", "report", "window", "health", "barrel",
			"labour", "prince", "sticky", "timber", "marble", "ground", "colony", "cereal", "cherry", "velvet"],
			["scramble", "omelette", "opponent", "watermelon", "breakfast", "parallel", "cemetary", "economic",
			"triangle", "champion", "platform", "weakness", "appendix", "location"],
			["interrupt", "isolation", "butterfly", "community", "agreement", "determine", "cathedral", "liability", "essential", "extension", "directory", "interface", "biography"]
		];
		this.wordRaw = "bloomberg";

		this.mathProblem = "6+2";
		this.mathAnswer = "8";
 		this.operations = ["*", "+", "-"];
 		this.mathBounds = [10, 30, 40, 70, 140];

 		this.clicksDifficulty = [20, 30, 40, 60, 100];
 		this.clicksRequired = 15;
 		this.clicksCounted = 0;

		this.circle = document.querySelector('.clicker_ring_circle');
 		this.radius = circle.r.baseVal.value;
		this.circumference = radius * 2 * Math.PI;

		this.circle.style.strokeDasharray = `${circumference} ${circumference}`;
		this.circle.style.strokeDashoffset = `${circumference}`;

		this.reward = 1;
		this.exchange = 1;


		function openConnection() {
			this.socket = new WebSocket('ws://localhost:8000');

			this.socket.addEventListener('open', (event) => {
				console.log("Connected");
				Snackbar.show({text: 'Connected to MWYMI!'});
			});

			this.socket.addEventListener('message', (message) => {

				message = JSON.parse(message.data);

				if(message.identifier == "bank-update") {
					updateMarketInfo(message.bank);
				} else if (message.identifier == "graph-update") {
					chart(message.graph);
				} else if (message.identifier == "puzzle-value-update") {
					updateDifficulty(message.values); 				
				} else if (message.identifier == "notify") {
					Snackbar.show({text: message.message});
				}

			});
		}

		function updateDifficulty(values) {
			console.log(values);

			if(this.puzzleValues == null || (this.puzzleValues[0] != values[0])) {
				this.puzzleValues = values;
					document.getElementById("math-value").innerText = 
				2 * Math.round((this.puzzleValues.find(obj=>obj.name=="math").value) * 100) / 100;
					document.getElementById("anagram-value").innerText = 
				2 * Math.round((this.puzzleValues.find(obj=>obj.name=="anagram").value) * 100) / 100;
					document.getElementById("clicker-value").innerText =
				2 * Math.round((this.puzzleValues.find(obj=>obj.name=="clicker").value) * 100) / 100;

				generateWord();
				generateMath();
				restartClicker();
			}
 		}

		function updateMarketInfo(bank) {
			var {VC, MC} = bank.held;
			var SYMBMC, SYMBVC = "";
			var COLORMC, COLORVC = "";
			var diff = ((VC/MC)-(MC/VC))
			console.log(diff);
			console.log(diff < 0.35);
			if (diff < 0.2) {
				SYMBMC = "⤳"; COLORMC = "#53CCB0";
				SYMBVC = "⤳"; COLORVC = "#53CCB0";
			} else if(VC/MC < MC/VC) {
				SYMBMC = "⍔"; COLORMC = "#F4989D";
				SYMBVC = "⍍"; COLORVC = "#53CCB0";
			} else {
				SYMBMC = "⍍"; COLORMC = "#53CCB0";
				SYMBVC = "⍔"; COLORVC = "#F4989D";
			}

			this.COLORMC = COLORMC;
			this.COLORVC = COLORVC;

			document.getElementById('market').innerHTML = 
			`<span style="color:${COLORMC}">${SYMBMC}</span> 🜸MC 1 ⇌ 🜁VC <span style="color:${COLORMC}">${Math.round((VC/MC) * 10000) / 10000}</span><br><span style="color:${COLORVC}; margin-left:1px">${SYMBVC}</span> 🜁VC 1 ⇌ 🜸MC <span style="color:${COLORVC}">${Math.round((MC/VC) * 10000) / 10000}</span>`;
		}


		function changeExchange() {
			if(this.exchange == 0) {
				this.exchange = 1;
				document.getElementById("exchange").innerText="🜸MC ⍄ 🜁VC";
			} else {
				this.exchange = 0;
				document.getElementById("exchange").innerText="🜁VC ⍄ 🜸MC ";
			}

			return false;
		}

		function changeReward() {
			if(this.reward == 0) {
				this.reward = 1;
				document.getElementById("reward").innerText="Reward: 🜸MC";
			} else {
				this.reward = 0;
				document.getElementById("reward").innerText="Reward: 🜁VC";
			}
			return false;
		}

		function fisheryatesshuffle(str) {
		    var a = str.split(""),
		        n = a.length;

		    for(var i = n - 1; i > 0; i--) {
		        var j = Math.floor(Math.random() * (i + 1));
		        var tmp = a[i];
		        a[i] = a[j];
		        a[j] = tmp;
		    }
		    return a.join("");
		}

		function setProgress(percent) {
			const offset = circumference - percent / 100 * circumference;
			circle.style.strokeDashoffset = offset;
		}

		function restartClicker() {
			// ask for difficulty from server
			var difficulty = Math.ceil(2 * Math.round((this.puzzleValues.find(obj=>obj.name=="clicker").value) * 10) / 10)-1;
			if(difficulty > this.clicksDifficulty.length-1) {
				difficulty = this.clicksDifficulty.length-1;
			} else if (difficulty == 0) {
				document.getElementById('click').style.opacity = 0.4;
				document.getElementById('click').style.pointerEvents = "none";
			} else {
				document.getElementById('click').style.opacity = 1;
				document.getElementById('click').style.pointerEvents = "auto";
			}
			this.clicksRequired = this.clicksDifficulty[difficulty];
			this.clicksCounted = 0;
			setProgress((this.clicksCounted/this.clicksRequired)*100);

			var color;
			switch(difficulty) {
				case 0: color = "#0067a5"; break;
				case 1: color = "#53CCB0"; break;
				case 2: color = "#F4989D"; break;
				case 3: color = "#ac334f"; break;
				default: color = "#53CCB0";
			}


			var circles = document.getElementsByClassName('clicker_ring_circle');
			for(i = 0; i < circles.length; i++) {
				circles[i].style.stroke = color;
			}

		}

		function clickEvent() {
			if((this.clicksCounted/this.clicksRequired)*100 == 100) {
				restartClicker();
				merit("clicker");
			} else {
				this.clicksCounted++;
			}

			setProgress((this.clicksCounted/this.clicksRequired)*100);
		}

		function generateWord() {
			var difficulty = Math.ceil(2 * Math.round((this.puzzleValues.find(obj=>obj.name=="anagram").value) * 10) / 10)-1;
			if(difficulty > this.words.length-1) {
				difficulty = this.words.length-1;
			} else if (difficulty == 0) {
				console.log("Zero Difficulty");
				document.getElementById('anagram').style.opacity = 0.4;
				document.getElementById('anagram').style.pointerEvents = "none";
			} else {
				document.getElementById('anagram').style.opacity = 1;
				document.getElementById('anagram').style.pointerEvents = "auto";
			}
			var input = document.getElementById("anagram-guess");
			switch(difficulty) {
				case 0: input.style.borderBottom = "2px solid #0067a5"; break;
				case 1: input.style.borderBottom = "2px solid #53CCB0"; break;
				case 2: input.style.borderBottom = "2px solid #F4989D"; break;
				case 3: input.style.borderBottom = "2px solid #ac334f"; break;
				default: input.style.borderBottom = "2px solid #53CCB0";
			}
			this.wordRaw = this.words[difficulty][Math.floor(Math.random() * this.words[difficulty].length)];
			document.getElementById("scramble").innerText = fisheryatesshuffle(this.wordRaw);
		}

		function submitAnagram() {
			var content = document.getElementById('anagram-guess').value;

			if(content == this.wordRaw) {
				document.getElementById('anagram-guess').value = "";
				merit("anagram");
				return false;
			} else {
				document.getElementById('anagram-guess').value = "";
				return false;
			}
 		}

 		function generateMath() {
 			var difficulty = Math.ceil(2 * Math.round((this.puzzleValues.find(obj=>obj.name=="math").value) * 10) / 10)-1;
			if(difficulty > this.mathBounds.length-1) {
				difficulty = this.mathBounds.length-1;
			} else if (difficulty == 0) {
				document.getElementById('math').style.opacity = 0.4;
				document.getElementById('math').style.pointerEvents = "none";
			} else {
				document.getElementById('math').style.opacity = 1;
				document.getElementById('math').style.pointerEvents = "auto";
			}
			var bound = this.mathBounds[difficulty];
 			var a = Math.floor(Math.random()*bound)+1;
 			var b = Math.floor(Math.random()*bound)+1;

 			var operation = this.operations[Math.floor(Math.random()*this.operations.length)];

 			switch(operation) {
 				case "*": this.mathAnswer = `${a*b}`; break;
 				case "+": this.mathAnswer = `${a+b}`; break;
 				case "-": this.mathAnswer = `${a-b}`; break;
 			}

 			var input = document.getElementById("math-guess");
			switch(difficulty) {
				case 0: input.style.borderBottom = "2px solid #0067a5"; break;
				case 1: input.style.borderBottom = "2px solid #53CCB0"; break;
				case 2: input.style.borderBottom = "2px solid #F4989D"; break;
				case 3: input.style.borderBottom = "2px solid #ac334f"; break;
				default: input.style.borderBottom = "2px solid #53CCB0";
			}

 			this.mathProblem = `${a}${operation}${b}`;
 			document.getElementById('math-problem').innerText = this.mathProblem;
 		}

		function submitMath() {
			var content = document.getElementById('math-guess').value;
			if(content == this.mathAnswer) {
				document.getElementById('math-guess').value = "";
				merit("math");
				return false;
			} else {
				document.getElementById('math-guess').value = "";
				return false;
			}
 		}

 		function getWallet() {
			fetch(`${this.url}/api/player/wallet`, {
				headers: {
					'Content-Type': 'application/json',
					'target': this.id,
				}
			})
			.then(res => res.json())
			.then(response => {
				if(response.status == 200) {
					document.getElementById('info').innerText = `${this.username}#${this.discriminator}\n🜁VC ${Math.round((response.held.VC) * 100) / 100} 🜸MC ${Math.round((response.held.MC) * 100) / 100}`;
				}
			})
			.catch(console.error);
 		}





 		function exchangeCoins() {
 			var coin = "MC";
 			if(this.exchange == 0) {
 				coin = "VC";
 			}

 			var amount = parseFloat(document.getElementById("exchange-amount").value);
 			if(amount > 1000 || amount < 0 || isNaN(amount) || amount == "NaN" || amount == undefined) {
 				amount = 1;
 			}

 			fetch(`${this.url}/api/player/exchange`, {
 				method: 'POST',
 				headers: {
 					'Content-Type': 'application/json'
 				},
 				body: JSON.stringify({"target": this.id, "coin": coin, "amount": amount})
 			})
 			.then(res => res.json())
 			.then(response => {
 				getWallet();
 				this.socket.send(JSON.stringify({operation:"exchange-blame", blame: `${this.username}#${this.discriminator} exchanged ${amount} ${coin}`}));
 			})
 			.catch(console.error);

 			return false;
 		}

 		function merit(puzzle) {
 			var amount = 2*this.puzzleValues.find(obj=>obj.name==puzzle).value;
 			var coin = "MC";
 			if(this.reward == 0) {
 				coin = "VC";
 			}

 			this.socket.send(JSON.stringify({operation:"puzzle-blame", blame: `${this.username}#${this.discriminator} completed a puzzle.`}));

 			fetch(`${this.url}/api/player/merit`, {
 				method: 'POST',
 				headers: {
 					'Content-Type': 'application/json'
 				},
 				body: JSON.stringify({"target": this.id, "coin": coin, "amount": amount})
 			})
 			.then(res => res.json())
 			.then(response => {
 				puzzleDemerit(puzzle);
 				getWallet();
 			})
 			.catch(console.error);
 		}

 		function puzzleDemerit(which) {
 			 fetch(`${this.url}/api/puzzle/demerit`, {
 				method: 'POST',
 				headers: {
 					'Content-Type': 'application/json',
 				},
 				body: JSON.stringify({"which":which})
 			})
 			.then(res => res.json())
 			.then(response => {
 				console.log("demerido");
 			})
 			.catch(console.error);
 		}


		window.onload = () => {
			var fragment = new URLSearchParams(window.location.hash.slice(1));

			if (fragment.has("access_token")) {
				var accessToken = fragment.get("access_token");
				var tokenType = fragment.get("token_type");

				fetch('https://discord.com/api/users/@me', {
					headers: {
						authorization: `${tokenType} ${accessToken}`
					}
				})
				.then(res => res.json())
				.then(response => {
					const { username, discriminator, id } = response;
					this.id = id;
					this.username = username;
					this.discriminator = discriminator;
					document.getElementById('info').innerText = `${this.username}#${this.discriminator}`;
					setInterval(getWallet, 5*1000)
					getWallet();
					openConnection();
				})
				.catch(console.error);

			}
			else {
				document.getElementById('terminal').style.pointerEvents = "none";
				document.getElementById('terminal').style.opacity = 0.2;

				document.getElementById('messenger').style.display = 'block';
			}
		};