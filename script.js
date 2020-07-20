const rulesBtn = document.getElementById('rules-btn');
const closeBtn = document.getElementById('close-btn');
const rules = document.getElementById('rules');
const highScore = document.getElementById('high-score');
let HIGH_SCORE = localStorage.getItem('high-score') ? localStorage.getItem('high-score') : localStorage.setItem('high-score', 0);
const result = document.getElementById('result');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let firstTime = true;
let score = 0;

const brickRowCount = 5;
const brickColumnCount = 9;

// Create ball props
const ball = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	size: 10,
	speed: 4,
	dx: 4,
	dy: -4
};

// Create paddle props
const paddle = {
	x: canvas.width / 2 - 40,
	y: canvas.height - 20,
	w: 170,
	h: 10,
	speed: 8,
	dx: 0
};

// Create brick props
const brickInfo = {
	w: 70,
	h: 20,
	padding: 10,
	offsetX: 45,
	offsetY: 60,
	visible: true,
	color: null
}

// Create bricks
const bricks = [];

for (let i = 0; i < brickRowCount; i++) {
	bricks[i] = [];

	for (let j = 0; j < brickColumnCount; j++) {
		const x = j * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
		const y = i * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
		bricks[i][j] = { x, y, ...brickInfo };
	}
}

// Move paddle on canvas
function movePaddle() {
	paddle.x += paddle.dx;

	// if paddle hits right wall
	if (paddle.x + paddle.w > canvas.width) {
		paddle.x = canvas.width - paddle.w;
	}

	// if paddle hits left wall
	if (paddle.x < 0)
		paddle.x = 0;
}

// Move ball on canvas
function moveBall() {

	if (!firstTime) {
		ball.x += ball.dx;
		ball.y += ball.dy;
	}

	// Wall collision (right/left)
	if (ball.x + ball.size > canvas.width || ball.x - ball.size < 0)
		ball.dx *= -1;


	// Wall collision (top/bottom)
	if (ball.y + ball.size > canvas.height || ball.y - ball.size < 0)
		ball.dy *= -1;

	// Paddle collision
	if (ball.x - ball.size >= paddle.x && ball.x + ball.size <= paddle.x + paddle.w &&
		ball.y + ball.size >= paddle.y)
		ball.dy = -ball.speed;

	// Brick collision
	bricks.forEach(row => {
		row.forEach(brick => {
			if (brick.visible) {
				if (ball.x - ball.size > brick.x && // brick left side check
					ball.x + ball.size < brick.x + brick.w && // brick right side check
					ball.y + ball.size > brick.y && // brick top side check
					ball.y - ball.size < brick.y + brick.h // brick bottom side check
				) {
					ball.dy *= -1;
					brick.visible = false;
					increaseScore();
				}
			}
		});
	});

	// Lose game if ball hits bottom wall
	if (ball.y + ball.size > canvas.height)
		endGame();
}

function increaseScore() {
	score++;
	paddle.w -= 2;

	if (score % (brickRowCount * brickColumnCount) === 0) {
		showResult("YOU WON!!!", "#2be81a")
		endGame(true);
	}
}

function showResult(text, color) {
	result.innerText = text;
	result.style.color = color;

	result.classList.add('show');
	setTimeout(() => result.classList.remove('show'), 1000);
}

function endGame(win = false) {
	// Make all brick reappear
	bricks.forEach(row => {
		row.forEach(brick => {
			brick.visible = true;
			brick.color = undefined;
		});
	});

	const highScore = localStorage.getItem('high-score');

	if (highScore < score) {
		if (!win)
			showResult("YOU GOT A NEW HIGH SCORE!!!", "#f2a50a")
		HIGH_SCORE = localStorage.setItem('high-score', score);
	}
	else
		showResult(":(", "#f74734");

	score = 0;
	paddle.w = 170;
	firstTime = true;
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;

}


// Draw everything
function draw() {
	// Draw ball on canvas
	function drawBall() {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
		ctx.fillStyle = '#555';
		ctx.fill();
		ctx.closePath();
	}

	// Draw paddle on canvas
	function drawPaddle() {
		ctx.beginPath();
		ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
		ctx.fillStyle = '#555';
		ctx.fill();
		ctx.closePath();
	}

	function drawScore() {
		ctx.font = '20px Arial';
		ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
	}

	function getRandomColor() {
		const colors = ['#0095dd', '#9ae67c', '#ffce47', '#ffac5e',
			'#ff5757',
			'#b874fc', '#ff91ca'
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}

	// Draw bricks on canvas
	function drawBricks() {
		bricks.forEach(row => {
			row.forEach(brick => {
				ctx.beginPath();
				ctx.rect(brick.x, brick.y, brick.w, brick.h);

				brick.color = brick.color ? brick.color : getRandomColor();
				ctx.fillStyle = brick.visible ? brick.color : 'transparent';
				ctx.fill();
				ctx.closePath()
			});
		});
	}

	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	drawBall();
	drawPaddle();
	drawScore();
	drawBricks();
}

function update() {
	// Draw everything
	draw();
	movePaddle();
	moveBall();


	requestAnimationFrame(update);
	HIGH_SCORE = localStorage.getItem('high-score');
	highScore.innerText = HIGH_SCORE;

}

update();


function setUpEventListeners() {
	// Keydown event
	function keyDown(e) {
		firstTime = false;
		if (e.key === 'Right' || e.key === 'ArrowRight')
			paddle.dx = paddle.speed;
		else if (e.key === 'Left' || e.key === 'ArrowLeft')
			paddle.dx = -paddle.speed;
	}

	// Keyup event
	function keyUp(e) {
		if (e.key === 'Right' || e.key === 'ArrowRight' ||
			e.key === 'Left' || e.key === 'ArrowLeft')
			paddle.dx = 0;

	}

	// Keyboard event handlers
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);

	// Rules and close event handlers
	rulesBtn.addEventListener('click', () => rules.classList.add('show'));
	closeBtn.addEventListener('click', () => rules.classList.remove('show'));
}
setUpEventListeners();
