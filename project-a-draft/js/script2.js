function preload() {
    myFont = loadFont('PilkiusRomeus-YwDL.ttf');
  }

function setup() {
    let canvas = createCanvas(800, 500)
    canvas.parent("p5-canvas-container");

    creatureX = 530;
    creatureY = 350;

    // Initialize bubbles with random positions and sizes
    for (let i = 0; i < bubbleCount; i++) {
        let bubble = {
            x: random(width), // Random x position
            y: random(height), // Random y position
            size: random(30, 80), // Random size between 20 and 50
            noiseOffset: random(1000), // Noise offset for floating effect
        };
        bubbles.push(bubble);
    }
}


let friendX, friendY;
let numTriangles = 7;
let pupilHeight = 30;
let pupilWidth = 30;
let minPupilHeight = 0;
let maxPupilHeight = 30;
let blinkSpeed = 2;
let pupilShrinking = true;
let blinkDelay = 200; // frames in between blinks!
let poppedFlag = false

let bubbles = []; // array to hold bubbles
let bubbleCount = 30; // Number of bubbles
let personalBubblePopped = false; // To track if the bubble is popped

let creatureX, creatureY;
let currentPromptIndex = 0;
let flickerSpeed = 0.0005; // Speed of flicker
let flickerScale = 1; // Flicker scale
let flickerOffset = 0;
let mousePressedFlag = false;

let eyeOpen = true;
let blinkTimer = 0; // timer to control blinking
let blinkInterval = 100; // frames between blinks

let isHovering = false; // mouse hover position

// Scaling to grow flame
let scaleFactor = 0.2; // smallest initial size
let scaleTarget = 0.2;
let scaleAmount = 0.03; // lerp amount
let scaleValues = [1, 1.5, 2, 2.5, 3]; // scale values corresponding to keys 1-5
3;
let currentBackground = 0; // 0: Default, 1: Ocean, 2: Night
let opStr = "I bet you can't find me!"

// Fireball Variables
let sparks = []; // Array to hold sparks
let maxsparks = 100; // Maximum number of sparks

function draw() {
    // Call background based on currentBackground
    if (currentBackground === 0) {
        // default setting with candles
        drawDefaultBackground();
        if (keyIsPressed) {
            scaleTarget += 0.005;
            scaleTarget = constrain(scaleTarget, 0.2, 1.0);
        }
    } else if (currentBackground === 1) {
        // ocean setting
        drawOceanBackground();

        if (personalBubblePopped) {
            scaleTarget -= 0.005;
            scaleTarget = constrain(scaleTarget, 0.1, 1.0);
            if (scaleTarget < 0.11) {
                personalBubblePopped = false;
                currentBackground = 0;
            }
        } else {
            scaleTarget = 1.0;
        }
        // scale to 0.8

    } else if (currentBackground === 2) {
        // night setting
        drawNightBackground();
        scaleTarget = 1.0;

    } else if (currentBackground === 3) {
        // fire setting
        drawFireBackground();
        scaleTarget = 3.0;

    } else if (currentBackground === 4) {
        // purple setting
        drawPurpleDreamBackground();
        scaleTarget = 1.0;
    }
    scaleFactor = lerp(scaleFactor, scaleTarget, scaleAmount);

    drawCreature(creatureX, creatureY, scaleFactor);


    // CHANGE THE SCENE
    if (creatureX <= 0) {
        // go to night 
        currentBackground = 2;
        creatureX = width / 2;
        creatureY = height / 2;

    } else if (creatureX >= width - 1) {
        // go to purple partyscape 
        currentBackground = 4;
        creatureX = width / 2;
        creatureY = height / 2;
    }
    if (creatureY <= 0) {
        // go to ocean
        currentBackground = 1;
        creatureX = width / 2;
        creatureY = height / 2;

    } else if (creatureY >= height - 1) {
        // go to fire
        currentBackground = 3;
        creatureX = width / 2;
        creatureY = height / 2;
    }

    handleBlinking();
    handleMovement();

    console.log(creatureX, creatureY);
}

function keyPressed() {
    if (key >= "1" && key <= "5") {
        let index = int(key) - 1;
        scaleFactor = scaleValues[index];
    }

    // CHANGE BACKGROUNDS WITH KEYS
    if (key === "O" || key === "o") {
        currentBackground = 1; // Ocean theme
    } else if (key === "N" || key === "n") {
        currentBackground = 2; // Night theme
    } else if (key === "D" || key === "d") {
        currentBackground = 0; // Default theme
    }

    // Create fireball when space bar is pressed
    if (key === " ") {
        createFireball(); // Create a new fireball
    }
}

function mousePressed() {
    if (!mousePressedFlag) {
        mousePressedFlag = true;

        // Generate a new bubble when mouse is clicked in the ocean background
        if (currentBackground === 1) {
            createBubble(); // Create a new bubble
        }
    }
}

function mouseReleased() {
    mousePressedFlag = false;
}

// BACKGROUND FUNCTIONS
function drawDefaultBackground() {
    background(255); // Default white background
    noStroke()
    textFont(myFont);
    textSize(32);
    text(opStr, width / 2, 100)
    textAlign(CENTER, CENTER);



    // Draw candles in the background
    drawCandles();
}

function drawOceanBackground() {
    // ocean gradient
    push();
    for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(0, 105, 148), color(103, 141, 198), inter); // Interpolate between teal and pewter blue
        stroke(c);
        line(0, i, width, i); // lines going down the canvas for gradient effect
    }
    pop();



    // Check if Space is pressed to pop the bubble
    if (keyIsPressed && key == " ") {
        personalBubblePopped = true; // Pop the personal bubble

    }

    if (personalBubblePopped) {
        opStr = "...the Flicker magically flickers back to life"
        textFont(myFont);
        textSize(20)
        fill('white')
        stroke('black')
        strokeWeight(1)
        text("YOU POPPED THE BUBBLE! The flicker starts drowning. Goodbye.", width / 2, 100)
        textAlign(CENTER, CENTER);
    }

    // Draw the personal bubble if it's not popped
    if (!personalBubblePopped) {
        textFont(myFont);
        textSize(20)
        fill('white')
        stroke('#2281CD')
        strokeWeight(1)
        text("I'm afraid of water, be careful around my bubble!", width / 2, 100)
        textAlign(CENTER, CENTER);
        drawpersonalBubble(); // draw personal bubble
    }

    // Update creature position to follow mouse because it's swimming
    creatureX = constrain(mouseX, 0, width); // Keep within horizontal bounds
    creatureY = constrain(mouseY, 0, height - 50); // Keep within vertical bounds (assuming creature won't swim below the bottom of the canvas)

    // Draw bubbles
    for (let bubble of bubbles) {
        push();
        fill(128, 180, 202, 150);
        stroke(255, 255, 255, 150);
        strokeWeight(4);
        ellipse(bubble.x, bubble.y, bubble.size);
        pop(); // prevents weird outline on other shapes

        // floating effect of bubbles
        bubble.y += map(noise(bubble.noiseOffset), 0, 1, -0.5, 0.5); // Float up and down
        bubble.noiseOffset += 0.03; // increment shifts in bubble positions
    }
}

function drawpersonalBubble() {
    // CREATURE'S PERSONAL BUBBLE
    fill(128, 180, 202); // Bubble inner color
    stroke(255, 255, 255, 150); // White stroke with some transparency
    strokeWeight(4); // Bubble outline
    circle(creatureX, creatureY - 50, 300 * scaleFactor); // Bubble size and position
}

function drawNightBackground() {
    background(0, 0, 50);
    fill(255);

    // Draw stars
    fill(255);
    for (let i = 0; i < 20; i++) {
        let x = random(width);
        let y = random(height);
        ellipse(x, y, 5, 5); // Stars
    }

    // Draw moon
    fill(255);
    ellipse(200, 100, 100, 100);

    // Draw platform
    fill(150);
    rect(0, height - 50, width, 50); // Platform at the bottom
    textFont(myFont);
    textSize(20)
    fill('white')
    text('The stars are pretty, but I can generate prettier sparks!', width / 2, 475)

    textAlign(CENTER, CENTER)

    updatesparks(); // Update sparks
    drawsparks(); // Draw sparks

    // Keep creature on the ground
    creatureX = constrain(creatureX, 0, width); // Keep creature within horizontal bounds
    creatureY = constrain(creatureY, 0, height - 100); // Keep creature on ground
}

// Function to create a new bubble and add it to the bubbles array
function createBubble() {
    let bubble = {
        x: random(width), // Random x position
        y: random(height), // Start at the bottom of the canvas
        size: random(30, 80), // Random size between 30 and 80
        noiseOffset: random(800), // Noise offset for floating effect
    };
    bubbles.push(bubble); // Add new bubble to the array
}

// Create a fireball
function createFireball() {
    if (sparks.length < maxsparks) {
        sparks.push({
            x: random(width), // random x position
            y: height, // Start from the bottom
            velocity: random(-3, -6), // Negative velocity for upward movement
            life: 60, // Lifespan of the fireball
        });
    }
}

// Update sparks
function updatesparks() {
    for (let i = sparks.length - 1; i >= 0; i--) {
        let fireball = sparks[i];
        fireball.y += fireball.velocity; // Move up
        fireball.life--; // Decrease life
        if (fireball.life <= 0) {
            sparks.splice(i, 1); // Remove dead sparks
        }
    }
}

// Draw sparks
function drawsparks() {
    for (let fireball of sparks) {
        fill(255, random(150, 255), 0); // Fireball color
        noStroke();
        ellipse(fireball.x, fireball.y, 10, 10); // Draw the fireball
    }
}

function drawPurpleDreamBackground() {
    // Create a gradient effect with purple shades
    for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(100, 0, 255), color(200, 150, 255), inter); // Gradient from dark purple to light purple
        stroke(c);
        line(0, i, width, i); // Vertical lines for the gradient effect
    }

    // Draw animated circles to mimic dance lights 
    for (let i = 0; i < 10; i++) {
        fill(random(255), random(100, 255), random(255), random(50, 150)); // Random colors for the circles
        noStroke();
        let size = random(30, 80); // Random size for the circles
        let x = random(width); // Random x position
        let y = random(height); // Random y position
        ellipse(x, y, size); // Draw the circle
    }
}

//drawing the friend
function drawFriend(x, y, scl) {
    push();
    translate(300, 400);
    scale(scl);

    // Draw outer flame layer (dynamic shape with curveVertex)
    fill(255, 0, 0, 100);
    flameShape(0, 0, 1.0);

    // Draw inner flame layer (smaller, brighter)
    fill(255, 255, 0, 100);
    flameShape(5, 10, 0.9);

    // Draw face (change to just eyes)
    drawFace(0, -30);

    pop();
}

// Improved flame shape using curveVertex for smoother edges
function flameShape(x, y, scl) {
    push();
    translate(x, y);
    scale(scl);
    beginShape();

    // Flame shape with curved vertices for smoothness
    curveVertex(-50, -150);
    curveVertex(-20, -200);
    curveVertex(0, -250);  // Sharp tip of the flame
    curveVertex(50, -200);
    curveVertex(80, -100);
    curveVertex(60, 50);
    curveVertex(-60, 50);
    curveVertex(-80, -100);

    endShape(CLOSE);
    pop();
}

// Face with blinking eyes 
function drawFace(x, y) {
    let eyeX1 = -30; // Adjusted for the center of flame
    let eyeX2 = 30;
    let eyeY = y;

    // Draw pupils
    fill(0);
    ellipse(eyeX1, eyeY, pupilWidth, pupilHeight * 2);
    ellipse(eyeX2, eyeY, pupilWidth, pupilHeight * 2);

    // Add reflection to the eyes
    if (pupilHeight >= maxPupilHeight - 7) {
        fill(255, 255, 255, 180);
        ellipse(eyeX1 - 7, eyeY - 7, pupilWidth * 0.5, pupilHeight * 0.5);
        ellipse(eyeX2 - 7, eyeY - 7, pupilWidth * 0.5, pupilHeight * 0.5);
    }

    // Handle blinking mechanism
    handleBlinking();
}

// Blinking mechanism 
function handleBlinking() {
    if (frameCount - blinkTimer > blinkDelay) {
        if (pupilShrinking) {
            pupilHeight -= blinkSpeed; // Flatten the pupil
            if (pupilHeight <= minPupilHeight) {
                pupilShrinking = false;
            }
        } else {
            pupilHeight += blinkSpeed; // Expand the pupil back to normal height
            if (pupilHeight >= maxPupilHeight) {
                pupilShrinking = true;
                blinkTimer = frameCount; // Reset the timer after a complete blink
                blinkDelay = random(100, 350); // Randomize next blink
            }
        }
    }
}


// Draw with flames
function drawCreature(x, y, scl) {
    let flickerScale = 0.6 + random(-0.05, 0.05);

    push();
    translate(x, y);
    scale(scl * flickerScale);

    isHovering = dist(mouseX, mouseY, creatureX, creatureY) < 80;

    noStroke();
    if (isHovering) {
        fill(0, 100, 255, 150);
        flameLayer1(0, 0, 1.0);
        fill(50, 150, 255, 200);
        flameLayer2(0, 10, 0.8);
        fill(0, 200, 255, 250);
        flameLayer3(0, 20, 0.6);
        drawEyes(0, -30, 40, 50);
    } else {
        fill(255, 100, 0, 150);
        flameLayer1(0, 0, 1.0);
        fill(255, 150, 50, 200);
        flameLayer2(0, 10, 0.8);
        fill(255, 200, 0, 250);
        flameLayer3(0, 20, 0.6);
        drawEyes(0, -30, 30, 40);
    }

    drawLegs(0, 35);
    pop();
}

// Handle creature movement
function handleMovement() {
    // Move left and right with arrow keys
    if (keyIsDown(LEFT_ARROW)) {
        creatureX -= 5; // Move left
    }
    if (keyIsDown(RIGHT_ARROW)) {
        creatureX += 5; // Move right
    }
    if (keyIsDown(UP_ARROW)) {
        creatureY -= 5; // Move up
    }
    if (keyIsDown(DOWN_ARROW)) {
        creatureY += 5; // Move down
    }

    // Boundary checks to keep the creature on screen
    creatureX = constrain(creatureX, 0, width); // Keep creature within horizontal bounds
    creatureY = constrain(creatureY, 0, height); // Keep creature within vertical bounds
}

// Draw legs
function drawLegs(x, y) {
    fill(100, 50, 0);
    rect(x - 20, y + 30, 10, 20);
    rect(x + 10, y + 30, 10, 20);
}

// Flame layers
function flameLayer1(x, y, scl) {
    push();
    translate(x, y);
    scale(scl);
    beginShape();
    curveVertex(-50 + random(-3, 3), -150 + random(-6, 6));
    curveVertex(-20 + random(-3, 3), -200 + random(-6, 6));
    curveVertex(0 + random(-3, 3), -250 + random(-6, 6));
    curveVertex(50 + random(-3, 3), -200 + random(-6, 6));
    curveVertex(80 + random(-3, 3), -100 + random(-6, 6));
    curveVertex(60 + random(-3, 3), 50 + random(-6, 6));
    curveVertex(-60 + random(-3, 3), 50 + random(-6, 6));
    curveVertex(-80 + random(-3, 3), -100 + random(-6, 6));
    endShape(CLOSE);
    pop();
}

function flameLayer2(x, y, scl) {
    push();
    translate(x, y);
    scale(scl);
    beginShape();
    curveVertex(-40 + random(-3, 3), -130 + random(-6, 6));
    curveVertex(-10 + random(-3, 3), -180 + random(-6, 6));
    curveVertex(10 + random(-3, 3), -210 + random(-6, 6));
    curveVertex(40 + random(-3, 3), -180 + random(-6, 6));
    curveVertex(60 + random(-3, 3), -90 + random(-6, 6));
    curveVertex(50 + random(-3, 3), 40 + random(-3, 6));
    curveVertex(-50 + random(-3, 3), 40 + random(-3, 6));
    curveVertex(-60 + random(-3, 3), -90 + random(-3, 6));
    endShape(CLOSE);
    pop();
}

function flameLayer3(x, y, scl) {
    push();
    translate(x, y);
    scale(scl);
    beginShape();
    curveVertex(-30 + random(-3, 3), -110 + random(-6, 6));
    curveVertex(-5 + random(-3, 3), -160 + random(-6, 6));
    curveVertex(15 + random(-3, 3), -170 + random(-6, 6));
    curveVertex(30 + random(-3, 3), -150 + random(-6, 6));
    curveVertex(40 + random(-3, 3), -80 + random(-6, 6));
    curveVertex(30 + random(-3, 3), 30 + random(-3, 6));
    curveVertex(-30 + random(-3, 3), 30 + random(-3, 6));
    curveVertex(-40 + random(-3, 3), -80 + random(-3, 6));
    endShape(CLOSE);
    pop();
}

// Draw eyes
function drawEyes(x, y, eyeWidth, eyeHeight) {
    let eyeX1 = -30;
    let eyeX2 = 30;
    let eyeY = y;
    fill(0);
    if (eyeOpen) {
        ellipse(eyeX1, eyeY, eyeWidth, eyeHeight);
        ellipse(eyeX2, eyeY, eyeWidth, eyeHeight);
        fill(255);
        ellipse(eyeX1 - 8, eyeY - 8, 8, 12);
        ellipse(eyeX2 - 8, eyeY - 8, 8, 12);
    } else {
        fill(0);
        rect(eyeX1 - eyeWidth / 2, eyeY - eyeHeight / 4, eyeWidth, 10);
        rect(eyeX2 - eyeWidth / 2, eyeY - eyeHeight / 4, eyeWidth, 10);
    }
}

// Blinking mechanism
function handleBlinking() {
    blinkTimer++;
    if (blinkTimer > blinkInterval) {
        eyeOpen = !eyeOpen;
        blinkTimer = 0;
        blinkInterval = random(60, 280);
    }
}

// candles
function drawCandles() {
    let numberOfCandles = 8;
    let xStart = 30; // Starting x position
    let yPosition = 400; // Fixed y level for all candles
    let candleSpacing = 100; // Distance between candles

    // Loop to generate each candle
    for (let i = 0; i < numberOfCandles; i++) {
        let x = xStart + i * candleSpacing; // x position
        drawCandle(x, yPosition); // candle position
    }
}

function drawCandle(x, y) {
    fill(253, 251, 212);
    rect(x - 25, y - 40, 50, 150); // Candle body

    // candle flame flickering
    let flickerOffset = random(-8, 3);
    fill(255, 150, 0);
    beginShape();
    vertex(x - 5, y - 40);
    vertex(x, y - 70 + flickerOffset);
    vertex(x + 5, y - 40);
    endShape(CLOSE);
}

function drawFireBackground() {
    // gradient
    for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(255, 0, 0), color(255, 165, 0), inter);
        stroke(c);
        line(0, i, width, i);
    }

    // Draw random flames
    for (let i = 0; i < 100; i++) {
        drawFlame(
            random(width),
            height - random(50, 10),
            random(10, 20),
            random(30, 90)
        );
    }
}

function drawFlame(x, y, w, h) {
    noStroke();
    fill(255, 255, 0, 150); // Yellow
    ellipse(x, y, w, h);
    fill(255, 165, 0, 100); // Orange
    ellipse(x, y - h * 0.5, w * 0.8, h * 0.6);
    fill(255, 0, 0, 50); // Red
    ellipse(x, y - h * 0.7, w * 0.6, h * 0.4);
}

function drawPurpleDreamBackground() {
    // gradient effect with purple shades
    for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(100, 0, 255), color(200, 150, 255), inter); // Gradient from dark purple to light purple
        stroke(c);
        line(0, i, width, i); // Vertical lines for the gradient effect
    }
    fill('white')
    text("Uhhhh... let's get out of here. It's too crowded.", width / 2 + 100, 100, 200)


    // Draw animated circles to mimic dance lights
    for (let i = 0; i < 10; i++) {
        fill(random(255), random(100, 255), random(255), random(50, 150)); // Random colors for the circles
        noStroke();
        let size = random(30, 80); // Random size for the circles
        let x = random(width); // Random x position
        let y = random(height); // Random y position
        ellipse(x, y, size); // Draw the circle
    }

    drawFriend(friendX, friendY, scaleFactor);

    // Allow the flame to follow mouse when clicked
    if (mouseIsPressed) {
        friendX = mouseX;
        friendY = mouseY;
    }

    // Flickering effect
    flickerScale = 0.50 + random(-0.05, 0.05) * flickerSpeed; // Adjusted to flicker


}


// Improved flame shape using curveVertex for smoother edges
function flameShape(x, y, scl) {
    push();
    translate(x, y);
    scale(scl);
    beginShape();

    // Flame shape with curved vertices for smoothness
    curveVertex(-50, -150);
    curveVertex(-20, -200);
    curveVertex(0, -250);  // Sharp tip of the flame
    curveVertex(50, -200);
    curveVertex(80, -100);
    curveVertex(60, 50);
    curveVertex(-60, 50);
    curveVertex(-80, -100);

    endShape(CLOSE);
    pop();
}

// Face with blinking eyes 
function drawFace(x, y) {
    let eyeX1 = -30; // Adjusted for the center of flame
    let eyeX2 = 30;
    let eyeY = y;

    // pupils
    fill(0);
    ellipse(eyeX1, eyeY, pupilWidth, pupilHeight * 2);
    ellipse(eyeX2, eyeY, pupilWidth, pupilHeight * 2);



    // Add reflection to the eyes
    if (pupilHeight >= maxPupilHeight - 7) {
        fill(255, 255, 255, 180);
        ellipse(eyeX1 - 7, eyeY - 7, pupilWidth * 0.5, pupilHeight * 0.5);
        ellipse(eyeX2 - 7, eyeY - 7, pupilWidth * 0.5, pupilHeight * 0.5);
    }

    // Handle blinking mechanism
    handleBlinking();
}

// Blinking mechanism 
function handleBlinking() {
    if (frameCount - blinkTimer > blinkDelay) {
        if (pupilShrinking) {
            pupilHeight -= blinkSpeed; // Flatten the pupil
            if (pupilHeight <= minPupilHeight) {
                pupilShrinking = false;
            }
        } else {
            pupilHeight += blinkSpeed; // Expand the pupil back to normal height
            if (pupilHeight >= maxPupilHeight) {
                pupilShrinking = true;
                blinkTimer = frameCount; // Reset the timer after a complete blink
                blinkDelay = random(100, 350); // Randomize next blink
            }
        }
    }

}

