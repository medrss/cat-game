const cat = document.getElementById("cat");
const originalSrc = cat.src;
const bonesCountElem = document.getElementById("bonesCount"); 
const heartsCountElem = document.getElementById("heartsCount");
let bat; // Объявляем переменную для летучей мыши
const gameArea = document.getElementById("gameArea");
let x, y, batX, batY, targetX, targetY;
let up = false, down = false, right = false, left = false, shooting = false;
let speed = 9;
let batSpeed = 2;
let batHits = 0;
const maxBatHits = 20; // Для уничтожения мыши нужно 15 попаданий
const batRespawnTime = 10000; // Время респауна мыши после смерти
let lastShotTime = 0;
const shotInterval = 500;
let lastBatShotTime = 0;
let bonesCount = 0; // Счетчик косточек
let heartsCount = 3; // Счетчик здоровья
let animationFrameId;
let spawnBalloonInterval, spawnBoneInterval, spawnHeartInterval;
let batTimeout;
let isAnimating = false;
let spawnBatTimeout;

// Код для всплывающего окна с котиком рассказчиком
const messages = [
    "",
    "Эй, странник! Добро пожаловать в долину Трискелиуса!",
    "Здесь летучие мыши, стреляющие ядом, сами на тебя охотятся, а воздушные шарики только добавляют сумбура.",
    "Как говорится, день самоуправления, не так ли?",
    "Так что держи ушки на макушке и будь готов к любым неожиданностям.",
    "Удачи, и помни: Трискелиус не любит незваных гостей."
];

let messageIndex = 0;
let isTyping = false;

function typeText(element, text, callback) {
    isTyping = true;
    let index = 0;
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, 36);
        } else if (callback) {
            isTyping = false;
            cattalking.pause();
            storytellerImg.src = './img/storytellernottalk.gif';
            cattalking.currentTime = 0;
            callback();
        }
    }
    type();
}

const storytellerImg = document.querySelector('.popup img');

function nextMessage() {
    if (messageIndex < messages.length && !isTyping) {
        const storyText = document.getElementById('storyText');
        const cattalking = document.getElementById('cattalking');
        
        storyText.textContent = '';

        if (messages[messageIndex]) {
            storytellerImg.src = './img/storyteller.gif'; // Котик "говорит"
            cattalking.play(); // Воспроизводим звук
        } else {
            storytellerImg.src = './img/storytellernottalk.gif'; // Сразу "не говорит" при первом пустом предложении
        }

        typeText(storyText, messages[messageIndex], () => {
            messageIndex++;
            if (messageIndex >= messages.length) {
                document.getElementById('startButton').style.display = 'block';
            }
        });
    }
}

function gameOver() {
    isAnimating = false;
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    const gameArea = document.getElementById("gameArea");
    gameArea.style.display = 'none'; // Скрываем игровую область
    document.getElementById("gameOverPopup").style.display = 'flex'; // Показываем окно Game Over
    document.getElementById('restartButton').style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    clearGameElements();
}

function restartGame() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Сброс интерфейса
    document.getElementById('gameOverPopup').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';

    // Сброс значений
    heartsCount = 3;
    bonesCount = 0;
    updateCounters();

    // Сброс позиций и состояния объектов
    x = 0;
    y = gameArea.offsetHeight / 2 - cat.offsetHeight / 2;
    cat.style.left = x + 'px';
    cat.style.top = y + 'px';

    // Полное удаление объектов
    clearGameElements();

    // Очистка таймеров и интервалов
    clearIntervals();

    // Инициализация игры заново
    initializeGame();
    const backgroundMusic = document.getElementById("backgroundMusic");
    backgroundMusic.play();
}


// Функция для обновления счетчиков на экране
function updateCounters() {
    bonesCountElem.textContent = bonesCount;
    heartsCountElem.textContent = heartsCount;
}

// Функция очистки элементов игры (летучие мыши, воздушные шарики и т.д.)
function clearGameElements() {
    // Удаляем всех летучих мышей
    let bats = document.querySelectorAll('.bat');
    bats.forEach(bat => {
        bat.remove(); 
    });
    bat = null; // Очистить переменную, чтобы избежать "невидимых" объектов

    // Удаляем все воздушные шарики
    let balloons = document.querySelectorAll('.balloon');
    balloons.forEach(balloon => { 
        balloon.remove(); 
    });
    balloon = null;

    // Удаляем все косточки
    let bones = document.querySelectorAll('.bone');
    bones.forEach(bone => { 
        bone.remove(); 
    });
    bone = null;

    // Удаляем все снаряды
    let bullets = document.querySelectorAll('.bullet');
    bullets.forEach(bullet => { 
        bullet.remove(); 
    });

    // Удаляем все ядовитые снаряды
    let poisons = document.querySelectorAll('.poison');
    poisons.forEach(poison => { 
        poison.remove(); 
    });
    poison = null;

    // Удаляем все сердечки
    let hearts = document.querySelectorAll('.heart');
    hearts.forEach(heart => { 
        heart.remove(); 
    });
    heart = null;

    // Проверяем, что в DOM больше не осталось объектов
    console.log('Элементы после очистки:', document.querySelectorAll('.bat, .balloon, .bone, .heart, .bullet, .poison').length === 0);
}



function clearIntervals() { 
    clearInterval(spawnBalloonInterval); 
    clearInterval(spawnBoneInterval); 
    clearInterval(spawnHeartInterval); 
    clearTimeout(spawnBatTimeout);
    isGameRunning = false;
}

function startGame() {
    document.getElementById('startPopup').style.display = 'none';
    document.getElementById('gameArea').style.opacity = '1';
    document.getElementById('gameArea').style.pointerEvents = 'auto';
    initializeGame(); 
    const backgroundMusic = document.getElementById('backgroundMusic');
    backgroundMusic.play();
}

window.onload = function() { 
    nextMessage();
} 

function initializeGame() {
    isAnimating = true;
    console.log("Проверка: все элементы очищены?", document.querySelectorAll('.bat, .balloon, .bone, .heart, .bullet, .poison').length === 0);

    // Сброс начальных значений
    x = 0;
    y = gameArea.offsetHeight / 2 - cat.offsetHeight / 2;
    batX = gameArea.offsetWidth + 30;

    cat.style.left = x + 'px';
    cat.style.top = y + 'px';
    
    // Сброс значений мыши
    batHits = 0;
    bat = null;
    clearTimeout(spawnBatTimeout);
    lastBatShotTime = 0;

    // Задаем новые интервалы и тайм-ауты для спавна объектов
    spawnBalloonInterval = setInterval(spawnBalloon, 2000);
    spawnBoneInterval = setInterval(spawnBone, 35000); // Спавн косточки каждые 35 секунд
    spawnHeartInterval = setInterval(spawnHeart, 60000); // Спавн сердечка каждые 60 секунд

    // Респаун летучей мыши
    spawnBatTimeout = setTimeout(showBat, batRespawnTime);

    // Установка обработчиков нажатий клавиш
    initializeKeyHandlers();

    loop(); // Запускаем анимацию
}

// Функция для установки обработчиков нажатий клавиш
function initializeKeyHandlers() {
    document.addEventListener('keydown', function (event) {
        if (event.code === 'KeyW') up = true;
        if (event.code === 'KeyS') down = true;
        if (event.code === 'KeyA') left = true;
        if (event.code === 'KeyD') right = true;
        if (event.code === 'Space' && !shooting) {
            shooting = true;
            shoot();
        }
    });

    document.addEventListener('keyup', function (event) {
        if (event.code === 'KeyW') up = false;
        if (event.code === 'KeyS') down = false;
        if (event.code === 'KeyA') left = false;
        if (event.code === 'KeyD') right = false;
        if (event.code === 'Space') {
            shooting = false;
        }
    });
}

function moveCat() {
    if (up) y -= speed;
    if (down) y += speed;
    if (right) x += speed;
    if (left) x -= speed;

    // Ограничение движения котика по горизонтали
    if (x < 0) x = 0;
    if (x > gameArea.offsetWidth * 0.7 - cat.offsetWidth) x = gameArea.offsetWidth * 0.7 - cat.offsetWidth;
    // Ограничение движения котика по вертикали
    if (y < 0) y = 0;
    if (y > gameArea.offsetHeight - cat.offsetHeight) y = gameArea.offsetHeight - cat.offsetHeight;

    cat.style.left = x + 'px';
    cat.style.top = y + 'px';
}

function update() {
    if (!isAnimating) {
        isAnimating = true;
        requestAnimationFrame(loop);
    }
}

function loop() {
    if (!isAnimating) return;
    moveCat();

    if (bat && bat.classList.contains('visible')) {
        moveBat();
        if (Date.now() - lastBatShotTime > 3000) {
            shootPoison();
            lastBatShotTime = Date.now();
        }
    }

    if (shooting && Date.now() - lastShotTime > shotInterval) {
        shoot();
        lastShotTime = Date.now();
    }

    if (heartsCount <= 0) {
        gameOver();
        isAnimating = false; // Остановка анимации после завершения игры
        return; // Завершаем цикл
    }

    requestAnimationFrame(loop); // Продолжаем анимацию
}

function shoot() {
    // Заменяем изображение котика на изображение с пушкой
    cat.src = './img/catgun.gif';

    const bullet = document.createElement("img");
    bullet.src = `./img/${['bullet1.png', 'bullet2.png', 'bullet3.png', 'star1.png', 'star2.png', 'star3.png', 'star4.png'][Math.floor(Math.random() * 7)]}`;
    bullet.classList.add('bullet');
    gameArea.appendChild(bullet);

    let bulletX = x + cat.offsetWidth - 120;
    let bulletY = y + cat.offsetHeight / 2 - bullet.offsetHeight / 2 + 30;

    function moveBullet() {
        bulletX += 10;
        if (bulletX > gameArea.offsetWidth) {
            bullet.remove();
        } else {
            bullet.style.left = bulletX + 'px';
            bullet.style.top = bulletY + 'px';

            // Проверка на попадание в летучую мышь
            if (bat && bulletX + bullet.offsetWidth >= batX && bulletX <= batX + bat.offsetWidth &&
                bulletY + bullet.offsetHeight >= batY && bulletY <= batY + bat.offsetHeight) {
                bullet.remove();
                const punchSound = document.getElementById('punch'); 
                punchSound.play();
                bat.classList.add('hit');
                setTimeout(() => bat.classList.remove('hit'), 200);
                console.log("batHits:", batHits);
                batHits++;
                if (batHits >= maxBatHits) { 
                    const batdieSound = document.getElementById('batdiee'); 
                    batdieSound.play();
                    bat.src = './img/batdie.gif'; // Заменяем изображение летучей мыши 
                    setTimeout(() => {
                        bat.remove(); // Удаляем летучую мышь
                        bat = null; 
                        setTimeout(showBat, batRespawnTime); }, 500); // Удаляем летучую мышь через 500 мс 
                    }
            } else {
                // Проверка на попадание в шарик
                const balloons = document.querySelectorAll('.balloon');
                balloons.forEach(balloon => {
                    const balloonX = parseFloat(balloon.style.left);
                    const balloonY = parseFloat(balloon.style.top);
                    if (!balloon.classList.contains('burst') && 
                        bulletX + bullet.offsetWidth >= balloonX - 40 && bulletX <= balloonX + balloon.offsetWidth - 40 &&
                        bulletY + bullet.offsetHeight >= balloonY - 80 && bulletY <= balloonY + balloon.offsetHeight - 80 ) {
                        bullet.remove();
                        balloon.src = "./img/balloonburst.gif"; // Заменяем изображение на взрыв
                        balloon.classList.add('burst'); // Помечаем шарик как взорванный
                        const popSound = document.getElementById('popSound'); 
                        popSound.play();
                        setTimeout(() => balloon.remove(), 500); // Удаляем шарик через 500 мс после взрыва
                        console.log("Шарик лопнул при попадании пули!");
                    }
                });

                requestAnimationFrame(moveBullet);
            }
        }
    }
    moveBullet();

    // Возвращаем изображение котика обратно через 0.5 секунды
    setTimeout(() => {
        cat.src = './img/cat.gif';
    }, 500);
}

function shootPoison() {
    const poison = document.createElement("img");
    poison.src = "./img/poisonbat.gif";
    poison.classList.add('poison');
    gameArea.appendChild(poison);

    let poisonX = batX;
    let poisonY = batY + bat.offsetHeight / 2;

    function movePoison() {
        if (!poison || !poison.parentElement) return; // Прерываем, если элемент был удален
    
        poisonX -= 7;
        if (poisonX < -60) {
            poison.remove();
        } else {
            poison.style.left = poisonX + 'px';
            poison.style.top = poisonY + 'px';
    
            // Проверка на попадание в кота
            if (poisonX <= x + cat.offsetWidth - 80 && poisonX + poison.offsetWidth - 80 >= x &&
                poisonY <= y + cat.offsetHeight - 40 && poisonY + poison.offsetHeight - 40 >= y) {
                cat.classList.add('hit');
                setTimeout(() => cat.classList.remove('hit'), 200);
                const meowSound = document.getElementById('meowhit');
                cat.src = './img/cathead.png';
                setTimeout(() => { cat.src = originalSrc; }, 300);
                meowSound.play();
                poison.remove();
                heartsCount--;
                updateCounters(); // Обновляем здоровье
            } else {
                requestAnimationFrame(movePoison);
            }
        }
    }    
    movePoison();
}

function spawnBone() {
    const bone = document.createElement("img");
    bone.src = "./img/bone.gif";
    bone.classList.add('bone');
    gameArea.appendChild(bone);

    let boneX = gameArea.offsetWidth + 50;
    let boneY = Math.random() * (gameArea.offsetHeight - 80);

    function moveBone() {
        boneX -= 5;
        if (boneX < 0) {
            bone.remove();
        } else {
            bone.style.left = boneX + 'px';
            bone.style.top = boneY + 'px';

            // Проверка на столкновение с котом
            if (boneX <= x + cat.offsetWidth - 80 && boneX + bone.offsetWidth - 80 >= x &&
                boneY <= y + cat.offsetHeight - 40 && boneY + bone.offsetHeight -40 >= y ) {
                bone.remove();
                cat.src = './img/catdefoult1.png';
                    setTimeout(() => { cat.src = originalSrc; // Возвращаем исходное изображение через 300 миллисекунд 
                    }, 300);
                const murSound = document.getElementById('mur'); 
                murSound.play();
                bonesCount++;
                bonesCountElem.textContent = bonesCount; // Обновляем счетчик косточек
                console.log("Косточка собрана!");
            } else {
                requestAnimationFrame(moveBone);
            }
        }
    }
    moveBone();
}

function spawnHeart() {
    const heart = document.createElement("img");
    heart.src = "./img/heartbeat.gif";
    heart.classList.add('heart');
    gameArea.appendChild(heart);

    let heartX = gameArea.offsetWidth + 50;
    let heartY = Math.random() * (gameArea.offsetHeight - 70);

    function moveHeart() {
        heartX -= 5;
        if (heartX < 0) {
            heart.remove();
        } else {
            heart.style.left = heartX + 'px';
            heart.style.top = heartY + 'px';

            // Проверка на столкновение с котом
            if (heartX <= x + cat.offsetWidth - 80 && heartX + heart.offsetWidth - 80 >= x &&
                heartY <= y + cat.offsetHeight - 40 && heartY + heart.offsetHeight -40 >= y) {
                heart.remove();
                cat.src = './img/catdefoult1.png';
                    setTimeout(() => { cat.src = originalSrc; // Возвращаем исходное изображение через 300 миллисекунд 
                    }, 300);
                const heartbeatSound = document.getElementById('heartbeat'); 
                heartbeatSound.play();
                heartsCount++;
                heartsCountElem.textContent = heartsCount; // Обновляем счетчик здоровья
                console.log("Сердечко собрано!");
            } else {
                requestAnimationFrame(moveHeart);
            }
        }
    }
    moveHeart();
}

function spawnBalloon() {
    if (!isAnimating) return;

    const balloon = document.createElement("img");
    balloon.src = "./img/balloonfly.gif";
    balloon.classList.add('balloon');
    gameArea.appendChild(balloon);

    let balloonX = gameArea.offsetWidth + 50;
    let balloonY = Math.random() * (gameArea.offsetHeight - 100);

    function moveBalloon() {
        if (!document.body.contains(balloon)) {
            // Если шарик уже был удален из DOM, прекращаем движение
            return;
        }
    
        balloonX -= 5;
    
        if (balloonX < -100) {
            balloon.dataset.removed = true; // Отмечаем как удалённый
            balloon.remove(); // Убираем шарик
            setTimeout(spawnBalloon, 1000); // Спавним новый через 1 секунду
        } else {
            balloon.style.left = balloonX + 'px';
            balloon.style.top = balloonY + 'px';
    
            // Проверка на столкновение с котиком
            if (balloon !== null && !balloon.dataset.removed && balloonX <= x + cat.offsetWidth - 80 && balloonX + balloon.offsetWidth - 80 >= x &&
                balloonY <= y + cat.offsetHeight - 80 && balloonY + balloon.offsetHeight - 80 >= y) {
                if (!balloon.classList.contains('burst')) {
                    heartsCount--;
                    heartsCountElem.textContent = heartsCount;
                    cat.classList.add('hit');
                    setTimeout(() => cat.classList.remove('hit'), 200);
    
                    balloon.src = "./img/balloonburst.gif";
                    balloon.classList.add('burst');
                    balloon.dataset.removed = true; // Помечаем шарик как удалённый
                    cat.src = './img/cathead.png';
                    setTimeout(() => { cat.src = originalSrc; }, 300);
    
                    const popSound = document.getElementById('popSound');
                    popSound.play();
                    const meowSound = document.getElementById('meowhit');
                    meowSound.play();
    
                    setTimeout(() => {
                        balloon.remove();
                        setTimeout(spawnBalloon, 1000);
                    }, 500);
                    console.log("Шарик лопнул при столкновении с котиком!");
                }
            } else {
                requestAnimationFrame(moveBalloon);
            }
        }
    }    
    moveBalloon();
}

function moveBat() {
    const screenWidthLimit = gameArea.offsetWidth * 0.80; 

    if (batX > screenWidthLimit) {
        batX -= batSpeed;
    }

    // Ограничиваем движение мыши вверх и вниз при достижении границы
    if (batX <= screenWidthLimit) {
        if (targetY == null || Math.abs(batY - targetY) < 2) {
            targetY = Math.random() * (gameArea.offsetHeight - bat.offsetHeight);
        }

        // Движение мыши по вертикали
        if (batY < targetY) {
            batY += batSpeed / 2;
        } else if (batY > targetY) {
            batY -= batSpeed / 2;
        }

        // Ограничиваем движение мыши внутри экрана по вертикали
        batY = Math.max(0, Math.min(batY, gameArea.offsetHeight - bat.offsetHeight));
    }

    // Устанавливаем позицию летучей мыши
    bat.style.left = batX + 'px';
    bat.style.top = batY + 'px';
}


function showBat() { 
    if (bat) return;
    batHits = 0; 
    bat = document.createElement("img"); 
    bat.src = "./img/batfly.gif"; 
    bat.classList.add('bat', 'visible'); 
    gameArea.appendChild(bat); 
    batX = gameArea.offsetWidth + 30;
    batY = Math.random() * (gameArea.offsetHeight - bat.offsetHeight - 100);
    bat.style.left = batX + 'px'; 
    bat.style.top = batY + 'px'; 
    targetY = null;
}
