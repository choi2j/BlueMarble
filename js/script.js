// MAIN
const main = document.getElementById("main");

// CANVAS
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ------------------------------------------------------------------------------------------------------------

// VARIABLES
// environment
let obstacles = [];
let initialSpawnTimer = 150;
let spawnTimer = initialSpawnTimer;

// player
let player;

// scores
let score;
let scoreText;
let highscore;
let highscoreText;

// dice
let dice = 1;
let diceText;
let diceImg = new Image();

// settings
let gravity;
let gameSpeed;
let keys = {};
let isStart = false;
let imgBG = new Image();
var sound = new Audio();
sound.src = "./diceSound.mp3";

var rickroll = new Audio();
rickroll.src = "./rickrollSound.mp3";

// ------------------------------------------------------------------------------------------------------------

// EVENTLISTENER
document.addEventListener("keydown", function (evt) {
	keys[evt.code] = true;
});

document.addEventListener("keyup", function (evt) {
	keys[evt.code] = false;
});

// ------------------------------------------------------------------------------------------------------------

// CLASS
// Player
class Player {
	constructor(x, y, w, h) {
		// Player Settings
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		// Player Defaults
		this.dy = 0; // direction Y > y 좌표 이동 계산
		this.jumpForce = 15; // 점프 강도 계산
		this.jumpTimer = 0; // 점프 타이머 > 점프한 시간 계산
		this.originalHeight = h; // 원래 높이
		this.grounded = true; // 땅에 있는지 판단
	}

	Draw() {
		var img = new Image();
		if ((keys["ShiftLeft"] || keys["KeyS"]) && this.grounded) {
			img.src = "./img/santa02.png";
			ctx.drawImage(img, this.x, this.y, this.w, this.h);
		} else {
			img.src = "./img/santa01.png";
			ctx.drawImage(img, this.x, this.y, this.w, this.h);
		}
	}

	Jump() {
		//점프함수 추가
		if (this.grounded && this.jumpTimer == 0) {
			//땅에 있는지 && 타이머 =0
			this.jumpTimer = 1;
			this.dy = -this.jumpForce;
		} else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
			this.jumpTimer++;
			this.dy = -this.jumpForce - this.jumpTimer / 50; //갈수록 빠르게 떨어지는 것 구현
		}
	}

	Animate() {
		// 키 입력
		if (keys["Space"] || keys["KeyW"]) {
			// 스페이스바 or 키보드 W 입력시
			this.Jump();
		} else {
			this.jumpTimer = 0;
		}

		if (keys["ShiftLeft"] || keys["KeyS"]) {
			// 왼쉬프트 or 키보드 S 입력시
			this.y += this.h / 2;
			this.h = this.originalHeight / 2; //h를 절반으로 줄여서 숙인 것과 같은 효과
		} else {
			this.h = this.originalHeight;
		}

		this.y += this.dy; //위치 변경

		//중력적용
		if (this.y + this.h < canvas.height) {
			//공중에 떠 있을 때
			this.dy += gravity; // 중력만큼 dy++
			this.grounded = false;
		} else {
			this.dy = 0;
			this.grounded = true;
			this.y = canvas.height - this.h; //바닥에 딱 붙어 있게 해줌
		}

		//this.y += this.dy; <-삭제 (뒤에 쓰면 중력 적용할 때 문제가 생김)

		this.Draw();
	}
}

class Obstacle {
	constructor(x, y, w, h) {
		// Obstacle Settings
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		// Obstacle Defaults
		this.dx = -gameSpeed;
		this.isFly = false;
	}

	Update() {
		this.x += this.dx;
		this.Draw();
		this.dx = -gameSpeed;
	}

	Draw() {
		var img = new Image();
		if (this.isFly == true) {
			img.src = "./img/star.png";
			ctx.drawImage(img, this.x, this.y, this.w, this.h);
		} else {
			img.src = "./img/tree.png";
			ctx.drawImage(img, this.x, this.y, this.w, this.h);
		}
	}
}

class Text {
	constructor(t, x, y, a, c, s) {
		// Text Settings
		this.t = t;
		this.x = x;
		this.y = y;
		this.a = a;
		this.c = c;
		this.s = s;
	}

	Draw() {
		ctx.beginPath();
		ctx.fillStyle = this.c;
		ctx.font = this.s + "px Atari";
		ctx.textAlign = this.a;
		ctx.fillText(this.t, this.x, this.y);
		ctx.closePath();
	}
}

// ------------------------------------------------------------------------------------------------------------

// getJSON : get JSON from URL
const getJSON = function (url, callback) {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "json";
	xhr.onload = function () {
		const status = xhr.status;
		if (status === 200) {
			callback(null, xhr.response);
		} else {
			callback(status, xhr.response);
		}
	};
	xhr.send();
};

// get IMG from API
function getImg(i) {
	getJSON(`https://api.unsplash.com/collections/10082870/photos?client_id=S58QreT4IiHVXA2IwpVI0V-l3bGFKQYqV-PC62YlIus&per_page=30`, function (err, data) {
		if (err !== null) {
			console.log(err);
		} else {
			console.log(data[i]);
			imgBG.src = data[i].urls.full;
		}
	});
}

// ------------------------------------------------------------------------------------------------------------

// FUNCTIONS
// defaults
function randomNum(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

// game
function reset() {
	score = 0;
	obstacles = [];
	initialSpawnTimer = 150;
	spawnTimer = initialSpawnTimer;
	gameSpeed = 5;

	window.localStorage.setItem("highscore", highscore);
}

function randomSet(val) {
	switch (val) {
		case 0:
			gravity = 1.5;
			gameSpeed = 9;
			initialSpawnTimer = 250;
			break;
		case 1:
			gravity = 1.75;
			gameSpeed = 11;
			initialSpawnTimer = 220;
			break;
		case 2:
			gravity = 1.9;
			gameSpeed = 13;
			initialSpawnTimer = 190;
			break;
		case 3:
			gravity = 2.25;
			gameSpeed = 15;
			initialSpawnTimer = 160;
			break;
		case 4:
			gravity = 2.5;
			gameSpeed = 17;
			initialSpawnTimer = 130;
			break;
		case 5:
			gravity = 3;
			gameSpeed = 19;
			initialSpawnTimer = 100;
			break;
		default:
			gravity = 1;
			gameSpeed = 3;
			initialSpawnTimer = 300;
	}
	getImg(val);
	diceImg.src = `./img/dice/dice${val + 1}.png`;
}

function spawnObstacle() {
	let size = randomNum(50, 100);
	let type = randomNum(0, 1);
	let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, "#2484E4");

	if (type == 1) {
		obstacle.isFly = true;
		obstacle.y -= player.originalHeight - randomNum(1, 10);
	}
	obstacles.push(obstacle);
}

function Start() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	ctx.font = "20px sans-serif";

	gameSpeed = 5;
	gravity = 1;

	score = 0;
	highscore = 0;

	if (localStorage.getItem("highscore")) {
		highscore = localStorage.getItem("highscore");
	}

	player = new Player(25, canvas.height - 130, 130, 130, "pink");

	scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");

	highscoreText = new Text("HighScore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

	diceText = new Text("Dice: " + dice, canvas.width / 2 - 40, 250, "left", "#212121", "20");

	requestAnimationFrame(Update);
}

function Update() {
	requestAnimationFrame(Update);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 0.5;
	ctx.drawImage(imgBG, 0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;

	ctx.drawImage(diceImg, canvas.width / 2 - 50, 50, 150, 150);

	player.Animate(); //공룡한테 애니메이션 주는 함수 <-여기서 그려줄거임

	spawnTimer--; //스폰타이머 --
	if (spawnTimer <= 0) {
		//장애물 속도 조절하는 if문
		spawnObstacle(); //장애물 객체 생성
		console.log(obstacles);
		spawnTimer = initialSpawnTimer - gameSpeed * 8; // 점점 스폰되는 간격이 짧아짐

		if (spawnTimer < 60) {
			spawnTimer = 60; // 스폰간격의 하한선 설정
		}
	}

	//장애물 생성해보자
	for (let i = 0; i < obstacles.length; i++) {
		let o = obstacles[i];

		if (o.x + o.w < 0) {
			obstacles.splice(i, 1);
		}

		if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
			reset();
		}
		o.Update();
	}

	if (score % 500 == 0) {
		let val = randomNum(1, 66);
		if (val != 66) {
			randomSet(val % 6);
			let diceval = (val % 6) + 1;
			diceText.t = "Dice: " + diceval;
			dice = diceval;
			sound.play();
			getImg(score / 500 + val * (val + 1));
		} else {
			gravity = 5;
			gameSpeed = 25;
			initialSpawnTimer = 70;
			imgBG.src = "./img/rickroll.webp";
			let diceval = (val % 6) + 1;
			diceText.t = "Dice: " + "rickroll";
			dice = diceval;
			rickroll.play();
		}
	}

	diceText.Draw();

	score++;
	scoreText.t = "Score: " + score;
	scoreText.Draw();

	if (score > highscore) {
		highscore = score;
		highscoreText.t = "HighScore: " + highscore;
	}

	highscoreText.Draw();
}

// GAME START
Start();
