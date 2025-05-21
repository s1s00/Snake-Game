const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const chartCtx = document.getElementById("gameChart").getContext("2d");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
snakeBody = [[snakeX, snakeY]];

let setIntervalId;
let score = 0;

let playerLogs = [];
let gameStartTime = Date.now();

let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

function logEvent(type, data = {}) {
    playerLogs.push({
        type: type,
        timestamp: Date.now(),
        ...data
    });
}

const updateFoodPosition = () => {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    gameOver = true;

    const gameEndTime = Date.now();
    const totalDuration = (gameEndTime - gameStartTime) / 1000;

    logEvent("game_over", {
        reason: "collision",
        totalDuration: totalDuration,
        finalScore: score
    });

    const blob = new Blob([JSON.stringify(playerLogs, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "player_data.json";
    link.click();

    alert("Game Over! اضغط OK للعب مرة أخرى...");

    createScoreChart();

    setTimeout(() => {
        location.reload();
    }, 3000);
};

const changeDirection = e => {
    let directionChanged = false;

    if (e.key === "ArrowUp" && velocityY !== 1) {
        velocityX = 0;
        velocityY = -1;
        directionChanged = "up";
    } else if (e.key === "ArrowDown" && velocityY !== -1) {
        velocityX = 0;
        velocityY = 1;
        directionChanged = "down";
    } else if (e.key === "ArrowLeft" && velocityX !== 1) {
        velocityX = -1;
        velocityY = 0;
        directionChanged = "left";
    } else if (e.key === "ArrowRight" && velocityX !== -1) {
        velocityX = 1;
        velocityY = 0;
        directionChanged = "right";
    }

    if (directionChanged) {
        logEvent("direction_change", { direction: directionChanged });
    }
};

const initGame = () => {
    if (gameOver) return;

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // أكل الطعام
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        const newPart = snakeBody.length > 0
            ? [...snakeBody[snakeBody.length - 1]]
            : [snakeX, snakeY];

        snakeBody.push(newPart);
        score++;

        logEvent("food_eaten", {
            position: { x: foodX, y: foodY },
            score: score
        });

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("high-score", highScore);
        }

        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    // تحريك الرأس
    snakeX += velocityX;
    snakeY += velocityY;

    // تحريك الجسم
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = [...snakeBody[i - 1]];
    }
    if (snakeBody.length > 0) {
        snakeBody[0] = [snakeX, snakeY];
    }

    // الاصطدام
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return handleGameOver();
    }

    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            return handleGameOver();
        }
    }

    // رسم الرأس والجسم
    for (let i = 0; i < snakeBody.length; i++) {
        const partClass = i === 0 ? "head" : "body";
        html += `<div class="${partClass}" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    }

    playBoard.innerHTML = html;
};

function createScoreChart() {
    const foodEvents = playerLogs.filter(event => event.type === "food_eaten");

    const scores = foodEvents.map(e => e.score);
    const labels = foodEvents.map((e, i) => `قطعة ${i + 1}`);

    if (window.scoreChart) {
        window.scoreChart.destroy();
    }

    window.scoreChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'النقاط',
                data: scores,
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
                tension: 0.3,
                pointRadius: 5,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'النقاط' }
                },
                x: {
                    title: { display: true, text: 'الطعام الذي أُكل' }
                }
            }
        }
    });
}

updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);

logEvent("game_start", { startTime: new Date(gameStartTime).toLocaleString() });
