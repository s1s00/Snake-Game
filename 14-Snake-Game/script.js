const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const chartCtx = document.getElementById("gameChart").getContext("2d");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

// مصفوفة لتسجيل البيانات
let playerLogs = [];
let gameStartTime = Date.now(); // بداية اللعبة

// استرجاع أعلى نتيجة من التخزين المحلي
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

// تسجيل حدث
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
    const totalDuration = (gameEndTime - gameStartTime) / 1000; // بالثواني
    logEvent("game_over", { reason: "collision", totalDuration: totalDuration, finalScore: score });

    // تحميل ملف JSON
    const blob = new Blob([JSON.stringify(playerLogs, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "player_data.json";
    link.click();

    alert("Game Over! اضغط OK للعب مرة أخرى...");

    // رسم البيانات في الرسم البياني
    drawChart();

    // إعادة ضبط اللعبة بعد 3 ثواني (تعطي وقت للرسم البياني)
    setTimeout(() => {
        location.reload();
    }, 3000);
}

const changeDirection = e => {
    let directionChanged = false;

    if(e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
        directionChanged = "up";
    } else if(e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
        directionChanged = "down";
    } else if(e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
        directionChanged = "left";
    } else if(e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
        directionChanged = "right";
    }

    if (directionChanged) {
        logEvent("direction_change", { direction: directionChanged });
    }
}

controls.forEach(button =>
    button.addEventListener("click", () =>
        changeDirection({ key: button.dataset.key }))
);

const initGame = () => {
    if(gameOver) return;

    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    if(snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]);
        score++;

        // تسجيل حدث أكل الطعام
        logEvent("food_eaten", { position: { x: foodX, y: foodY }, score: score });

        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;
    }

    snakeX += velocityX;
    snakeY += velocityY;

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY];

    // اصطدام بالجدار
    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return handleGameOver();
    }

    // اصطدام بنفسه
    for (let i = 1; i < snakeBody.length; i++) {
        if (snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
            return handleGameOver();
        }
    }

    // رسم الثعبان
    for (let i = 0; i < snakeBody.length; i++) {
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    }

    playBoard.innerHTML = html;
}

// رسم الرسم البياني باستخدام Chart.js
function drawChart() {
    // استخدم playerLogs لتجميع النقاط والزمن
    // نفلتر الأحداث food_eaten للحصول على النقاط وتوقيت أكلها
    const foodEvents = playerLogs.filter(event => event.type === "food_eaten");

    const scores = foodEvents.map(e => e.score);
    const times = foodEvents.map((e, i) => `قطعة ${i+1}`);

    // تدمير الرسم القديم إذا موجود
    if(window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: times,
            datasets: [{
                label: 'النقاط',
                data: scores,
                borderColor: 'rgb(75, 192, 192)',
                fill: false,
                tension: 0.3,
            }]
        },
        options: {
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

// إعداد أول مرة
updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);

// تسجيل بداية اللعبة
logEvent("game_start", { startTime: new Date(gameStartTime).toLocaleString() });
