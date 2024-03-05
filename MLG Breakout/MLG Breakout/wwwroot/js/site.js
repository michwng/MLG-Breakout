﻿// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
/*
 * -------------------------------------------------------------------
 * File name: index.html
 * Project name: MLG Breakout
 * -------------------------------------------------------------------
 * Author's name and email:	Michael Ng, mwnmwn07@gmail.com
 * A personal project for ETSU ACM Game Jam Spring 2023.
 
 * Creation Date: 3/9/2023
 * Last Modified: 3/5/2024
 * Description: This webpage serves as the main page for the breakout game.
 * Tutorial Used: https://developer.mozilla.org/en-US/docs/Games/Tutorials/2D_Breakout_game_pure_JavaScript
 * Version: V1.2
 * -------------------------------------------------------------------
 */

//Small note - everything inside script is commented with "//" and /* */, rather than <!-- -->.

//=================================================================================================//
//=================================================================================================//
//********************************            VARIABLES            ********************************//
//=================================================================================================//
//=================================================================================================//
//canvas will store a reference to the canvas element named myCanvas.
const canvas = document.getElementById("myCanvas");

//canvasContext will store the 2D rendering context.
//This context will be used to paint on the Canvas.
const canvasContext = canvas.getContext("2d");

/** Game Variables **/
let score = 0;
let lives = 3;
let ballSpeed = 2;
let themeColor = "#000000";
let colorBlindMode = false;
let blocksDecimated = 0;

//I commented this out since getting the frameCount wasn't necessary.
//let frameCount = 0;

//womboCombo holds the amount of bricks the player's ball hits in one go.
let womboCombo = 0;

//The isPaused boolean will allow you to pause the game.
let isPaused = false;

//ballSpeedRemember acts as a remembering variable.
//When the player pauses the game, ballSpeed is set to 0.
//ballSpeedRemember will retain the ballSpeed before pause.
let ballSpeedRemember = 0;
let ballMoveXRemember = 0;
let ballMoveYRemember = 0;

//Automode determines if the paddle will always hit the paddle.
let autoMode = false;
//pwnMode determines if the ball will react to brick collisions.
//If true, Newton's 3rd Law is ignored when the ball hits the bricks.
let pwnMode = false;

//When enabled, the ball will automatically target stray bricks.
let snipeMode = false;
let brickTarget = null;

/** Ball Variables **/
const ballRadius = 10;

let ballX = canvas.width / 2;
//Since ballMoveX is positive, it will move right.
let ballMoveX = ballSpeed;

let ballY = canvas.height - 30;
//Since ballMoveY is negative, it will move up (not down).
let ballMoveY = -ballSpeed;

let ballColor = "#0095DD"
let cyan = "#0095DD";
let lgreen = "#3DED97";
let green = "#03C04A";
let dblue = "#211BF1";
let purple = "#8F00FF";


/** Paddle Variables **/
const paddleHeight = 10;
let paddleWidth = (canvas.width / 6); //Originally 75.

//paddleScore is a variable used to keep track of paddleSize.
//It is named this because it uses score to increase the paddle's width.
let paddleScore = score;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;


/** Brick Variables **/
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 20;
let bricksLeft = brickRowCount * brickColumnCount;

//We will hold all these bricks in a 2D array.
const bricks = [];

//Add bricks to the 2D array.
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}


/** Resources **/
//=====================================================//
//*****************     ALL AUDIO     *****************//
//=====================================================//
//The background music.
var backgroundMusic = document.getElementById("BackgroundMusic");

/*
 * The reason why I declared many hitsounds is because I want each hitsound to complete
 * before I reset the sound. I declared all these hitsounds in the HTML code above
 * and used an iterative looping variable (above the playHitsound() function)
 * to use each hitsound concurrently.
 *
 * Side Note: 6 of these are not enough when playing at high ball speeds.
 * I kept it this way to save resources.
 */
//The hitsound plays whens the ball makes contact with a brick.
var hitsound = document.getElementById("HitmarkerSound");
var hitsound2 = document.getElementById("HitmarkerSound2");
var hitsound3 = document.getElementById("HitmarkerSound3");
var hitsound4 = document.getElementById("HitmarkerSound4");
var hitsound5 = document.getElementById("HitmarkerSound5");
var hitsound6 = document.getElementById("HitmarkerSound6");

/* I applied the same solution to the hitsounds to the sniperSounds.
 * snipesounds are used in snipeMode, when there are less than 12.5% bricks left.
 * It also uses the same iterative looping variable and function as for hitsounds.
 *
 * Side Note: 2 is not enough, but I kept it that way to save resources..
 */
//The snipesounds play when the ball hits a block when snipeMode is true.
var snipersound = document.getElementById("SniperSound");
var snipersound2 = document.getElementById("SniperSound2");

//An audio sound that plays when you hit more than 10 blocks in a row.
var WomboCombo = document.getElementById("WomboCombo");
//===========================================================//
//*****************     (END) ALL AUDIO     *****************//
//===========================================================//


//======================================================//
//*****************     ALL VIDEOS     *****************//
//======================================================//
//This is an mp4 video that was declared and intialized in the HTML above.
//It will be used when snipeMode is active.
var video = document.getElementById("SnipeVideo");
let videoX = 0;
let videoY = 0;
//============================================================//
//*****************     (END) ALL VIDEOS     *****************//
//============================================================//


//======================================================//
//*****************     ALL IMAGES     *****************//
//======================================================//
//The hitmarker that displays when you hit a block.
const hitmarker = new Image();
hitmarker.src = "/pictures/hitmarkersmall.png";
hitmarkerX = 0;
hitmarkerY = 0;

//The background you see while playing the game while
//colorBlindMode is off.
const mlgbackground = new Image();
mlgbackground.src = "/pictures/mlgbackground.jpg";
mlgbackgroundX = 0;
mlgbackgroundY = 0;
//============================================================//
//*****************     (END) ALL IMAGES     *****************//
//============================================================//

//=======================================================================================================//
//=======================================================================================================//
//********************************            (END) VARIABLES            ********************************//
//=======================================================================================================//
//=======================================================================================================//

//=================================================================================================//
//=================================================================================================//
//********************************            FUNCTIONS            ********************************//
//=================================================================================================//
//=================================================================================================//


//=====================================================================================================================//
//********************************            PLAYING AUDIO FOR THE PROGRAM            ********************************//
//=====================================================================================================================//

//hitSoundIteration will iterate up to effectively play hitsounds.
hitSoundIteration = 0;
/* This function plays hitsounds when the ball collides with a brick.
 * It is called by the collisionDetection() function.
 *
 * When the program is not in snipeMode, we play the normal hitsound.
 * But, when the program IS in snipeMode, we play the sniper sound.
 */
function playHitsound() {
    /*
     * There is a reason why this function was created.
     * Problem: When the ball hits multiple blocks very quickly,
     * the program can't play multiple hitmarkersounds.
     *
     * Solution: This code tries to alleviate this problem
     * by having multiple audio tracks.
     * Based on my research, Howler.js is an option rather than
     * this approach. However, the only downside is that it requires
     * a download. I want this project to be download-free.
     * So, I opted for this rudimentary approach.
     *
     *
     * https://howlerjs.com/
     * Benefits over Web Audio API
     * - Audio Sprites
     * - Full Codec Support: MP3, MPEG, OPUS, OGG, OGA, WAV, AAC,
     *   CAF, M4A, MP4, WEBA, WEBM, DOLBY, FLAC.
     * - More versatile and compatible with older browsers like IE9.
     * - Auto Caching for better performance and bandwidth.
     * - Lightweight (7KB) and is 100% JavaScript. No Dependencies.
     * - More.
     *
     */
    if (!snipeMode) {
        switch (hitSoundIteration) {
            case 0:
                hitsound.play();
                break;
            case 1:
                hitsound2.play();
                break;
            case 2:
                hitsound3.play();
                break;
            case 3:
                hitsound4.play();
                break;
            case 4:
                hitsound5.play();
                break;
            case 5:
                hitsound6.play();
                break;
            default:
                hitsound.play();
                hitSoundIteration = 0;
        }
    }
    else {
        hitSoundIteration = 0;
        switch (hitSoundIteration) {
            case 0:
                snipersound.play();
                break;
            case 1:
                snipersound2.play();
                break;
            case 2:
                snipersound.play();
                break;
            case 3:
                snipersound2.play();
                break;
            case 4:
                snipersound.play();
                break;
            default:
                snipersound2.play();
                hitSoundIteration = 0;
        }
    }
    hitSoundIteration++;

    //The code if I decided to use Howler.js. Incredibly simple.
    /* var sound = new Howl({
        urls: ['hitmarkersound.mp3']
      }).play(); */
}


//===========================================================================================================================//
//********************************            (END) PLAYING AUDIO FOR THE PROGRAM            ********************************//
//===========================================================================================================================//
//===================================================================================================================//
//********************************            DRAWING STUFF ON THE CANVAS            ********************************//
//===================================================================================================================//

/* The drawTitle() function draws the Title for the game
 * as text on the canvas.
 *
 * This time, it's not a helper function to the draw() function.
 * Instead, it is called before the draw() function.
 * It is called asyncronously in the async function calls section by
 * drawTitle().
 */
function drawTitle() {
    //Determine the width of the Title text.
    titleTextSize = getTextWidth(`MLG Breakout`, "bold 40px sans-serif");

    //Before drawing the title, Draw the MLG Background to the side.
    drawBackgroundImage();

    //Draw the Title.
    canvasContext.font = "bold 40px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`MLG Breakout`, (canvas.width / 2) - (titleTextSize / 2), 100);

    //Determine the width of the starting text.
    startingTextSize = getTextWidth(`Click Anywhere to Begin Pwnage.`, "italic bold 20px sans-serif");

    //Draw text showing how to start the game.
    canvasContext.font = "italic bold 20px sans-serif";
    canvasContext.fillStyle = "#333333";
    canvasContext.fillText(`Click Anywhere to Begin Pwnage.`, (canvas.width / 2) - (startingTextSize / 2), 200);

    //Determine the width of the control title text.
    controlTitleTextSize = getTextWidth(`Controls`, "bold 30px sans-serif");

    //Draw the Controls.
    canvasContext.font = "bold 30px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`Controls`, (canvas.width / 2) - (controlTitleTextSize / 2), 300);


    LMBcontrolTextSize = getTextWidth(`LMB (Left Mouse Button): Increase Ball Speed`, "20px sans-serif");

    //Draw the Controls.
    canvasContext.font = "20px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`LMB (Left Mouse Button): Increase Ball Speed`, (canvas.width / 2) - (LMBcontrolTextSize / 2), 350);


    MMBcontrolTextSize = getTextWidth(`MMB (Middle Mouse Button): Activate Auto Mode`, "20px sans-serif");

    //Draw the Controls.
    canvasContext.font = "20px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`MMB (Middle Mouse Button): Activate Auto Mode`, (canvas.width / 2) - (MMBcontrolTextSize / 2), 400);


    RMBcontrolTextSize = getTextWidth(`RMB (Right Mouse Button): Decrease Ball Speed`, "20px sans-serif");

    //Draw the Controls.
    canvasContext.font = "20px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`RMB (Right Mouse Button): Decrease Ball Speed`, (canvas.width / 2) - (RMBcontrolTextSize / 2), 450);


    PcontrolTextSize = getTextWidth(`P (Keyboard): Pause the Game`, "20px sans-serif");

    //Draw the Controls.
    canvasContext.font = "20px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`P (Keyboard): Pause the Game`, (canvas.width / 2) - (PcontrolTextSize / 2), 500);


    PcontrolTextSize = getTextWidth(`C (Keyboard): Toggle Color Blind Mode`, "20px sans-serif");

    //Draw the Controls.
    canvasContext.font = "20px sans-serif";
    canvasContext.fillStyle = "#000000";
    canvasContext.fillText(`C (Keyboard): Toggle Color Blind Mode`, (canvas.width / 2) - (PcontrolTextSize / 2), 550);
}


//The draw function will update the canvas.
//It is called frequently by requestAnimationFrame(draw);,
//which is located at the bottom of this function.
//It will clear the canvas and draw everything!
//This is the MAIN drawing function. The most important one of all!
function draw() {
    //clear the entire canvas before drawing again.
    //Takes in the top left coordinates and bottom right coordinates
    //and then clears the entire area in a rectangle shape.
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    //draw the background image if colorBlindMode is false (off).
    if (!colorBlindMode) {
        drawBackgroundImage();
    }
    //call the drawBricks function to draw the Bricks.
    drawBricks();
    //call the drawBall function to draw the Ball.
    drawBall();
    //call the drawPaddle function to draw the Paddle.
    drawPaddle();
    //call the collisionDetection function to detect collision in the bricks.
    collisionDetection();
    //call the drawScore function to draw the score the player has.
    drawScore();
    //call the drawSpeed function to draw the speed the ball has.
    drawSpeed();
    //call the drawLives function to draw the amount of lives the player has.
    drawLives();
    //call the drawLives function to draw the bricks left on screen.
    drawBricksLeft();
    //call the drawMLGBooleans function to draw the bricks left on screen.
    drawMLGBooleans();

    /**************************************************************************************
     * ========== A Special Note About Drawing X and Y Coordinates on JavaScript ==========
     *
     * In Javascript, the top-left corner of the canvas represents coordinates (0, 0).
     *  0, 0 represents x = 0 & y = 0 respectively.
     * The bottom-right corner of the canvas represents coordinates (canvas.width, canvas.height).
     *  (canvas.width, canvas.height) represents x = canvas width & y = canvas height respectively.
     *
     * X is relatively easy to understand. Left side of the canvas is 0 and right side is canvas width.
     * Y is not the same. The top of the canvas is 0. The bottom of the canvas is canvas height.
     * If you wanted the middle of the canvas, you use the coordinates (canvas.width/2, canvas.height/2).
     *
     * I'll provide many examples below, but that's a basic explanation of the 2D context in Javascript.
     **************************************************************************************/


    /***** Ball Logic *****/
    //If the ball hits the left border of the screen,
    //or the right border of the screen.
    if (ballX + ballMoveX < ballRadius || ballX + ballMoveX > canvas.width - ballRadius) {
        ballMoveX = -ballMoveX;
    }
    //If the ball goes above the top border of the screen,
    //or below the bottom border of the screen.
    if (ballY + ballMoveY < ballRadius) {
        ballMoveY = -ballMoveY;
    }
    else if (ballY + ballMoveY > canvas.height - paddleHeight - ballRadius) {
        //Note that the above code deviates from the source code.
        //I did this because the ball bouncing off the wall instead of
        // the paddle bothered me, so I made some changes.
        //Originally, if the ball's X was between the left and right sides of the paddle,
        //it would bounce off the bottom wall - not the paddle.
        //This code adjustment makes the ball bounce off the PADDLE! Not the bottom WALL!

        //If the ball is  between the paddle sides (and about to hit the paddle)
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballMoveY = -ballMoveY;
        }
        else if (ballY + ballRadius > canvas.height) {
            //else if the ball makes contact with the bottom of the screen.

            //We subtract a life. We normally start with 3 and gain 1 per round.
            lives--;

            //if there are no lives. How does this make logical sense?
            //Well, !0 = 1. 1 is true. (Binary Stuff)
            if (!lives) {
                //We can determine the rounds we lived through by dividing the total
                //number of bricks we destroyed by 40 and rounding down (Math.floor()).
                let roundsLived = Math.floor(blocksDecimated / 40);

                //Display
                alert(`
                                             GAME OVER\n
                                     ------------------------------\n
                                     Your Final Score was ${score} Points.\n
                                     You Pwned ${blocksDecimated} Bricks.\n
                                     You Survived ${roundsLived} Rounds.`);
                document.location.reload();
                //clearInterval(interval);
            }
            else {
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;

                //We want to make sure the minimum value of ballSpeed is 1.
                //This statement ensures that the minimum value is met when the ball goes out of bounds.
                if (ballSpeed >= 3) {
                    ballSpeed -= 2;
                }
                else {
                    ballSpeed = 1;
                }

                //Make the ball go right.
                ballMoveX = Math.abs(ballSpeed);
                //Make the ball go up.
                ballMoveY = -Math.abs(ballSpeed);

                //reset the position of the paddle.
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }

    //If snipemode is false, just move the ball as
    if (!snipeMode) {
        //Move the ball horizontally according to ballMoveX.
        ballX += ballMoveX;
        //Move the ball vertically according to ballMoveY.
        ballY += ballMoveY;
    }
    else //SnipeMode will move the ball towards a brick, rather than an arbitrary direction.
    {
        /*
            * A Physics Background may be required to understand what is happening.
            *
            * In short, when snipeMode is on, the ball zips to the nearest brick.
            * snipeMode is normally activated when there are less than 12.5% of all
            * bricks are remaining on the screen.
            *
            * The physics explanation:
            * The program gets the x and y component based on the ball's position
                from the brick.
            * The trajectory is gotten from dividing the y component by the x component
                and using the inverse Tangent function.
            * The ball moves towards the brick using this trajectory.
            *
            *
            * The result:
            * The result ended up with an interesting behavior of the ball.
            * The ball immediately zips to the y axis or x axis of the brick,
                then slowly closes the gap, taps the brick, and repeats
                for the remaining bricks
            * When the ballSpeed is too fast, the ball appears to quiver up and down.
                I am not entirely sure why, but I set the ballSpeed to 1 everytime
                the ball enters snipeMode.
            *
            * Note that this result was better than what I originally planned.
            * Most of this was using what I learned in Physics and testing it out.
            *
            * This result took about 2 hours to create and conceptualize.
            * Taking physics is paying off!
            */
        //Get a new brick to target if that brick has become null or invisible.
        if (brickTarget == null || brickTarget.status == 0) {
            brickTarget = getVisibleBrick();
        }


        //if ball is to the right of the brick.
        if (ballX > brickTarget.x) {
            //if ball is below brick.
            if (ballY > brickTarget.y) {
                //First decide the X and Y distance from the ball.
                //the distance the ball is from a brick on the x axis.
                trajX = ballX - brickTarget.x;
                //the distance the ball is from a brick on the y axis.
                trajY = ballY - brickTarget.y;

                //find the angle above the x-axis that the ball should be headed.
                vectorAngle = Math.atan(trajX / trajY);

                //The angle adds up to 90 degrees, so we divide by 90 to get the
                //x and y force components.
                //X goes left.
                trajX = -(vectorAngle / 90) * ballSpeed * (trajX / trajY);
                //Y goes up.
                trajY = -((90 - vectorAngle) / 90) * ballSpeed;

                //Move the ball based on the calculated trajectory.
                //We move the X and Y by their individual trajectories.
                ballMoveX = trajX;
                ballMoveY = trajY;
            }
            else //ball is above brick.
            {
                //First decide the X and Y distance from the ball.
                trajX = ballX - brickTarget.x;
                trajY = ballY + brickTarget.y;

                //find the angle above the x-axis that the ball should be headed.
                vectorAngle = Math.atan(trajX / trajY);

                //The angle adds up to 90 degrees, so we divide by 90 to get the
                //x and y force components.
                //X goes left.
                trajX = -(vectorAngle / 90) * ballSpeed * (trajX / trajY);
                //Y goes down.
                trajY = ((90 - vectorAngle) / 90) * ballSpeed;

                //Move the ball based on the calculated trajectory.
                //We move the X and Y by their individual trajectories.
                ballMoveX = trajX;
                ballMoveY = trajY;
            }

        }
        else //ball is to the left of the brick.
        {
            //if ball is below brick.
            if (ballY > brickTarget.y) {
                //First decide the X and Y distance from the ball.
                trajX = ballX + brickTarget.x;
                trajY = ballY - brickTarget.y;

                //find the angle above the x-axis that the ball should be headed.
                vectorAngle = Math.atan(trajX / trajY);

                //The angle adds up to 90 degrees, so we divide by 90 to get the
                //x and y force components.
                //X is going right.
                trajX = (vectorAngle / 90) * ballSpeed * (trajX / trajY);
                //Y is going up.
                trajY = -((90 - vectorAngle) / 90) * ballSpeed;

                //Move the ball based on the calculated trajectory.
                //We move the X and Y by their individual trajectories.
                ballMoveX = trajX;
                ballMoveY = trajY;
            }
            else //ball is above brick.
            {
                //First decide the X and Y distance from the ball.
                trajX = ballX + brickTarget.x;
                trajY = ballY + brickTarget.y;

                //find the angle above the x-axis that the ball should be headed.
                vectorAngle = Math.atan(trajX / trajY);

                //The angle adds up to 90 degrees, so we divide by 90 to get the
                //x and y force components.
                //X is going right.
                trajX = (vectorAngle / 90) * ballSpeed * (trajX / trajY);
                //Y is going down.
                trajY = ((90 - vectorAngle) / 90) * ballSpeed;

                //Move the ball based on the calculated trajectory.
                //We move the X and Y by their individual trajectories.
                ballMoveX = trajX;
                ballMoveY = trajY;
            }
        }
        //Move the ball horizontally according to ballMoveX.
        ballX += ballMoveX;
        //Move the ball vertically according to ballMoveY.
        ballY += ballMoveY;
    }



    /***** Paddle Logic *****/
    if (rightPressed) {
        //When we press the right arrow key,
        //move the paddle right by 7 pixels.
        paddleX += 7;
        if (paddleX + paddleWidth > canvas.width) {
            //if our paddle moves past the right wall,
            //set our paddleX to the
            //width of the canvas - width of the paddle.
            //This way, the paddle hugs the right wall.
            paddleX = canvas.width - paddleWidth;
        }
    }
    else if (leftPressed) {
        //When we press the right arrow key,
        //move the paddle right by 7 pixels.
        paddleX -= 7;
        if (paddleX < 0) {
            //if our paddle moves past the left wall,
            //set our paddleX to 0.
            paddleX = 0;
        }
    }

    // Paddle Logic for Auto-Mode
    if (autoMode) {
        //In every frame, the paddle readjusts to be underneath the ball.
        paddleX = ballX - paddleWidth / 2;
    }

    //Paddle Logic for Increasing Width.
    if (paddleScore >= 10) {
        //Every 10 increase in score, the paddle gets 1 pixel wider!
        paddleWidth++;
        paddleScore = paddleScore - 10;
    }

    //Logic for Wombo Combo
    //If womboCombo is not 0
    if (womboCombo != 0) {
        //if the ball is below 2/3 of the screen.
        if (ballY > ((2 * canvas.height) / 3)) {
            //reset womboCombo.
            womboCombo = 0;
        }
        else if (womboCombo > 10 && ballY < ((2 * canvas.height) / 3)) {
            //here, ball is above 2/3 of the screen - meaning it is still hitting bricks.
            //and wombo combo is more than 10.

            //play WomboCombo.mp3
            //(declared in the HTML code - gotten by the WomboCombo variable in script)
            WomboCombo.play();
            //Log the combo to the debug console.
            console.log(`Wombo Combo! You hit ${womboCombo} bricks in 1 go!`);
        }
    }

    //Draw a hitmarker every frame to mark the most recently-hit brick.
    drawHitMarker();

    //reanimate the draw function.
    //Doing it this way helps minimize skipped frames and makes animations smoother.
    requestAnimationFrame(draw);
}


/* This function draws the background image.
 * It serves as a helper function to the
 * primary draw() function.
 */
function drawBackgroundImage() {
    canvasContext.drawImage(mlgbackground, mlgbackgroundX, mlgbackgroundY, canvas.width, canvas.height);
}

/* This function is responsible for drawing the ball
 * on the canvas. It's a helper function for the
 * primary draw() function.
 */
function drawBall() {
    /*** The following code will draw a small blue circle ***/

    //beginPath is like putting a pen down on a piece of paper.
    canvasContext.beginPath();
    //draw the circle.
    //The circle starts:
    //ballX from the left side of the screen,
    //ballY from the top of the screen,
    //ballRadius for the arc radius
    //0 for the for the start angle (must be in radians if > 0.)
    //Math.PI*2 for the end angle (must be in radians)
    canvasContext.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    //make the pen change to blue-cola-colored ink.
    canvasContext.fillStyle = ballColor;
    //make the pen change to blue-cola-colored ink.
    canvasContext.fill();
    //take the pen off the paper.
    canvasContext.closePath();
}

/* This function is responsible for drawing the paddle
 * on the canvas. It's a helper function for the
 * primary draw() function.
 */
function drawPaddle() {
    canvasContext.beginPath();
    canvasContext.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    canvasContext.fillStyle = themeColor;
    canvasContext.fill();
    canvasContext.closePath();
}


//videoIteration = 0;
/* This function draws a hitmarker on the screen.
 * It is called whenever the ball hits a brick.
 * The context draws the image of the hitmarker
 * on top of the now-invisible brick.
 *
 * It's called by the draw() function.
 * It's a helper function to the draw() function.
 *
 * If snipeMode is on, then we draw a video frame instead.
 * We draw a sniper sniping the brick.
 */
function drawHitMarker() {
    if (!snipeMode) {
        canvasContext.drawImage(hitmarker, hitmarkerX, hitmarkerY);
    }
    else {
        video.play();
        canvasContext.drawImage(video, videoX, videoY, 200, 120);

        //I tried to make 2 separate videos to make the sniping more coherent,
        //but it created a ghost-like effect for both videos when rendering both.
        //In the end, I decided to just cut the video to a very short length
        //and keep it to 1 video.
        //I left this here so you can see what I did.
        /*switch(videoIteration)
        {
            case 0:
                videoIteration++;
                video.play();
                canvasContext.drawImage(video, videoX, videoY, 200, 120);
                break;
            default:
                video2.play();
                canvasContext2.drawImage(video2, video2X, video2Y, 200, 120);
                videoIteration = 0;
                break;
        }*/

    }
}

/* This function draws the bricks on the canvas.
 * It uses predefined and initialized variables
 * to determine how spread apart the bricks are
 * and their general layout.
 *
 * It will print bricks that are visible (status === 1)
 * and leave out bricks that are invisible (status === 0)
 *
 * This function is called by the draw() function.
 * It's a helper function to the draw() function.
 */
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                canvasContext.beginPath();
                canvasContext.rect(brickX, brickY, brickWidth, brickHeight);
                canvasContext.fillStyle = "#4ba3a7";
                canvasContext.fill();
                canvasContext.closePath();
            }
        }
    }
}

/* The drawScore() function draws the current score
 * as text on the canvas.
 *
 * It's a helper function to the main draw() function.
 */
function drawScore() {
    canvasContext.font = "16px sans-serif";
    canvasContext.fillStyle = themeColor;
    canvasContext.fillText(`Score: ${score}`, 8, 20);
}

/* The drawSpeed() function draws the current speed of the ball
 * as text on the canvas.
 *
 * It's a helper function to the main draw() function.
 */
function drawSpeed() {
    speedText = getTextWidth(`Speed: ${ballSpeed}`, "16px sans-serif");

    canvasContext.font = "16px sans-serif";
    if (!colorBlindMode) {
        canvasContext.fillStyle = "#FFFFFF";
    }
    else {
        canvasContext.fillStyle = themeColor;
    }

    canvasContext.fillText(`Speed: ${ballSpeed}`, (canvas.width / 2) - (speedText / 2), 20);
}

/* The drawLives() function draws the amount of lives the user has
 * as text on the canvas.
 *
 * It's a helper function to the main draw() function.
 */
function drawLives() {
    canvasContext.font = "16px sans-serif";
    canvasContext.fillStyle = themeColor;
    canvasContext.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

/* The drawBrickLeft() function draws the number of bricks that are visible on the canvas
 * as text on the canvas.
 *
 * It's a helper function to the main draw() function.
 */
function drawBricksLeft() {
    canvasContext.font = "16px sans-serif";
    if (!colorBlindMode) {
        canvasContext.fillStyle = "#FFFF00";
        canvasContext.fillText(`Bricks Left: ${bricksLeft}`, 140, canvas.height - 20);
    }
    else {
        canvasContext.fillStyle = themeColor;
        canvasContext.fillText(`Bricks Left: ${bricksLeft}`, 20, canvas.height - 20);
    }
}



/* The drawBLGBooleans() function draws the status of:
 * Auto Mode, Pwn Mode, and Snipe Mode
 * as text on the canvas.
 *
 * It's a helper function to the main draw() function.
 */
function drawMLGBooleans() {
    //Determine the size of the MLG text.
    mlgTextSize = getTextWidth(`[ Auto Mode: ${autoMode} | PWN Mode: ${pwnMode} | Snipe Mode: ${snipeMode} ]`, "italic bold 16px sans-serif");

    autoModeTextSize = getTextWidth(`[ Auto Mode: ${autoMode} | `, "italic 16px sans-serif");
    pwnModeTextSize = getTextWidth(`PWN Mode: ${pwnMode} | `, "italic 16px sans-serif");
    snipeModeTextSize = getTextWidth(`Snipe Mode: ${snipeMode} ]`, "italic 16px sans-serif");

    //Affect the color of the text.
    canvasContext.fillStyle = "#000000";

    //Determine the font, size, and text renders for the canvas context.
    canvasContext.font = "italic 16px sans-serif";


    //The x where the string will begin.
    //It starts 2/3 from the left of the canvas minus half of the entire string.
    booleanStartX = (2 * canvas.width / 3) - (mlgTextSize / 2);


    //Adjust the size of the text if it's bold.
    if (autoMode) {
        autoModeTextSize = getTextWidth(`[ Auto Mode: ${autoMode} | `, "italic bold 16px sans-serif");
        canvasContext.font = "italic bold 16px sans-serif";
    }
    else {
        canvasContext.font = "italic 16px sans-serif";
    }
    canvasContext.fillText(`[ Auto Mode: ${autoMode} | `, booleanStartX, canvas.height - 20);


    //Adjust the size of the text if it's bold.
    if (pwnMode) {
        pwnModeTextSize = getTextWidth(`PWN Mode: ${pwnMode} | `, "italic bold 16px sans-serif");
        canvasContext.font = "italic bold 16px sans-serif";
    }
    else {
        canvasContext.font = "italic 16px sans-serif";
    }
    canvasContext.fillText(`PWN Mode: ${pwnMode} | `, booleanStartX + autoModeTextSize, canvas.height - 20);


    //Adjust the size of the text if it's bold.
    if (snipeMode) {
        snipeModeTextSize = getTextWidth(`Snipe Mode: ${snipeMode} ]`, "italic bold 16px sans-serif");
        canvasContext.font = "italic bold 16px sans-serif";
    }
    else {
        canvasContext.font = "italic 16px sans-serif";
    }
    canvasContext.fillText(`Snipe Mode: ${snipeMode} ]`, booleanStartX + autoModeTextSize + pwnModeTextSize, canvas.height - 20);
}


//=========================================================================================================================//
//********************************            (END) DRAWING STUFF ON THE CANVAS            ********************************//
//=========================================================================================================================//
//===========================================================================================================//
//********************************            COLLISION DETECTION            ********************************//
//===========================================================================================================//

/* This function detects for collision between the ball and any brick on the canvas.
 * It does so by checking to see if the ball's X or Y overlaps with a brick's X or Y.
 *
 * It's actually more complex than what I described above.
 * We have to consider the ball's radius, as well as the brick's width and height
 * when we check for the collision.
 */
function collisionDetection() {
    //iterate through the 2d array, bricks.
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            //We check if the brick is visible, first.
            if (brick.status === 1) {
                //The brick collision. If the ball and its radius are inside the brick.
                if (
                    ballX + ballRadius >= brick.x &&
                    ballX - ballRadius <= brick.x + brickWidth &&
                    ballY + ballRadius >= brick.y &&
                    ballY - ballRadius <= brick.y + brickHeight) {
                    //We make the brick disappear.
                    brick.status = 0;

                    //if pwnMode is off (pwnMode allows the ball to ignore bouncing off of bricks)
                    if (!pwnMode) {
                        //Specify the collision.
                        //if the top of the ball hits the bottom of the brick OR
                        //the bottom of the ball hits the top of the brick.
                        if (ballY - ballRadius >= brick.y + brickHeight || ballY + ballRadius <= brick.y) {
                            //make the ball go in the opposite Y direction.
                            ballMoveY = -ballMoveY;
                        }
                        else {
                            //make the ball go in the opposite X direction.
                            ballMoveX = -ballMoveX;
                        }
                    }

                    //add to our score, based on ball speed.
                    score += ballSpeed;
                    //add to the paddleScore, based on ball speed.
                    //quick refresher: paddleScore is used to increase the width of the paddle.
                    paddleScore = ballSpeed;

                    //Adjust the hitmarker's X and Y to mark where the location of the last-hit brick.
                    hitmarkerX = brick.x + (brickWidth / 2) - (hitmarker.width / 2);
                    hitmarkerY = brick.y + (brickHeight / 2) - (hitmarker.height / 2);

                    //call on the drawHitMarker() function.
                    //(It draws the hitmarker.)
                    drawHitMarker(hitmarkerX, hitmarkerY);

                    //play the hitSound.
                    playHitsound();

                    //count down the bricks that are left.
                    bricksLeft--;
                    //increase the combo meter.
                    womboCombo++;
                    //increase the number of blocks that were destroyed.
                    blocksDecimated++;

                    //If there are less than half of the bricks remaining.
                    if (bricksLeft < Math.round(brickColumnCount * brickRowCount * (0.5))) {
                        //set pwnMode to true, allowing the ball to ignore bouncing off of bricks.
                        pwnMode = true;
                    }
                    //If there are less than 1/8 of the bricks remaining.
                    if (bricksLeft < Math.round(brickColumnCount * brickRowCount * (0.125))) {
                        //set snipeMode to true, allowing the ball to move towards a brick
                        //rather than in an arbitrary direction.
                        snipeMode = true;
                        //set the video X and Y to be in the middle of the hit brick.
                        videoX = brick.x + (brickWidth / 2) - (video.width / 2);
                        videoY = brick.y + (brickHeight / 2) - (video.height / 2);

                        //If ballSpeed is not 1.
                        if (ballSpeed != 1) {
                            //ballSpeedRemember will remember the past ballSpeed
                            ballSpeedRemember = ballSpeed;
                            //then ballSpeed will be set to 1.
                            ballSpeed = 1;
                            //Update the change in ballSpeed by calling the updateSpeed function.
                            //This function updates ballMoveX and ballMoveY to reflect the changes.
                            updateSpeed();
                        }

                    }

                    //If there are no bricks left...
                    if (bricksLeft == 0) {
                        //We set every brick back to visible.
                        for (let c = 0; c < brickColumnCount; c++) {
                            for (let r = 0; r < brickRowCount; r++) {
                                const brick = bricks[c][r];
                                brick.status = 1;
                            }
                        }

                        //we then set the bricks left to columns * rows.
                        bricksLeft = brickColumnCount * brickRowCount;

                        //Add a life as a reward for living this round.
                        lives++;

                        //turn off pwnMode and snipeMode.
                        pwnMode = false;
                        snipeMode = false;

                        //Set the ballSpeed back to what it was previously.
                        ballSpeed = ballSpeedRemember;
                        //update ballMoveX and ballMoveY to reflect the changes.
                        updateSpeed();
                    }


                    // Get a random number to determine the color of
                    //the ball when it collides with a brick.
                    //The randon number ranges from 1-5.
                    var randomNumber = Math.round((Math.random() * 5) + 1);


                    //Change the color of the ball randomly.
                    switch (randomNumber) {
                        case 1:
                            ballColor = lgreen;
                            break;
                        case 2:
                            ballColor = green;
                            break;
                        case 3:
                            ballColor = dblue;
                            break;
                        case 4:
                            ballColor = purple;
                            break;
                        default:
                            ballColor = cyan;
                            break;
                    }
                }
            }
        }
    }
}

//=================================================================================================================//
//********************************            (END) COLLISION DETECTION            ********************************//
//=================================================================================================================//
//======================================================================================================//
//********************************            EVENT HANDLERS            ********************************//
//======================================================================================================//

/* This function will be called whenever the user
 * clicks on the start screen to begin the game.
 * (Activated by mousedown)
 *
 * Called by the async function call:
 *  document.addEventListener("click", beginGame, false);
 */
function beginGame() {
    //replace the event listener with a function that increases the speed.
    document.removeEventListener("click", beginGame, false);
    canvas.addEventListener("click", increaseSpeed, false);

    //begin playing the background music.
    backgroundMusic.play();

    //Begin Drawing Shapes for the Game.
    draw();
}

//left-click to increase speed.
/* This function increases the speed of the ball
 * whenever LMB (Left Mouse Button) [Left-Click] is pressed.
 *
 * It's a helper function to improve customizing the gameplay.
 */
function increaseSpeed() {
    //increase the ball's speed by 1.
    ballSpeed++;
    //update ballMoveX and ballMoveY to reflect the change in ballSpeed.
    updateSpeed();
}

//decrease speed (by right-clicking).
/* This function decreases the speed of the ball
 * whenever RMB (Right Mouse Button) [Left-Click] is pressed.
 *
 * It's a helper function to improve customizing the gameplay.
 */
function decreaseSpeed() {
    //increase the ball's speed by 1.
    ballSpeed--;
    //update ballMoveX and ballMoveY to reflect the change in ballSpeed.
    updateSpeed();
}

/* This function toggles AutoMode
 * whenever MMB (Middle Mouse Button) [Middle-Click] is pressed.
 *
 * This function is called by the async function call:
 *  document.addEventListener("auxclick", toggleAutoMode, false);
 *  where auxclick signifies a middle mouse click.
 *
 * It's a helper function to improve luxury of gameplay.
 */
function toggleAutoMode(e) {
    // Thanks to https://stackoverflow.com/questions/21224327/how-to-detect-middle-mouse-button-click
    // e.which == 2 is the one that allows a middle click.
    if (e.button == 1 || e.which == 2 || e.button == 4) {
        e.preventDefault();
        console.log('Middle Click Detected - Activating Auto Mode');
        if (autoMode) {
            autoMode = false;
        }
        else {
            autoMode = true;
        }
        return false;
    }
}

//right-click to lower speed.
//This is basically a function combined with an event listener.
//It's done this way to prevent the context menu from appearing.
/* This function reduces the speed of the ball
 * whenever RMB (Right Mouse Button) [Right-Click] is pressed.
 *
 * It's a helper function to improve customizing the gameplay.
 */
document.oncontextmenu = function (e) {
    var evt = new Object({ keyCode: 93 });
    //Ensure ballSpeed is 1 or more.
    //Negative ballSpeed works, but breaks the game functionality.
    decreaseSpeed();

    //Prevent the actual context menu from showing up.
    //Do you want to save this webpage during gameplay?
    //No! When you Right-Click, you decrease ball speed!
    if (e.preventDefault != undefined)
        e.preventDefault();
    if (e.stopPropagation != undefined)
        e.stopPropagation();
}


/* This function pauses the game
 * by remembering the ballSpeed and stopping
 * the ball in its tracks.
 *
 * This function is called by the keyUpHandler() function,
 * which is called by:
 *  document.addEventListener("keyup", keyUpHandler, false);.
 *
 * Whenever the user presses P, pauseGame is called from keyUpHandler.
 * It's a helper function for ballSpeed.
 */
function pauseGame() {
    //if the game is not paused.
    if (!isPaused) {
        //remember the current speed of the ball and the ball velocity.
        ballSpeedRemember = ballSpeed;
        ballMoveXRemember = ballMoveX;
        ballMoveYRemember = ballMoveY;

        //set the ball's speed to 0.
        ballSpeed = 0;
        //update the speed for ballMoveX and ballMoveY.
        updateSpeed();

        //set isPaused to true. The game isPaused.
        isPaused = true;
    }
    else {
        //set the speed of the ball and its velocity to what we remembered.
        ballSpeed = ballSpeedRemember;
        ballMoveX = ballMoveXRemember;
        ballMoveY = ballMoveYRemember;

        //update the speed for ballMoveX and ballMoveY.
        updateSpeed();

        //set isPaused to false. The game is not Paused.
        isPaused = false;
    }
}

/* This function is responsible for handling key down events.
 * It's called by the ASYNC FUNCTION call:
 * document.addEventListener("keydown", keyDownHandler, false);
 *
 * Whenever the user presses any button on the keyboard,
 * this method is called. It checks to see what key
 * was pressed down and responds from there.
 */
function keyDownHandler(e) {
    //when the user presses down on the right arrow key.
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    }
    //if the user presses down on the left arrow key.
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

/* This function is responsible for handling key up events.
 * It's called by the ASYNC FUNCTION call:
 * document.addEventListener("keyup", keyUpHandler, false);
 *
 * Whenever the user releases any button on the keyboard (after being pressed),
 * this method is called. It checks to see what key
 * was released and responds from there.
 */
function keyUpHandler(e) {
    //when the user releases their right arrow key.
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    }
    //when the user releases their left arrow key.
    else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
    //when the user releases their 'P' key.
    else if (e.key === "P" || e.key === "p") {
        //call the pauseGame function.
        pauseGame();
    }
    //when the user releases their 'C' key.
    else if (e.key === "C" || e.key === "c") {
        //if colorblind mode is on.
        if (colorBlindMode) {
            //turn off colorBlindMode, which adds the MLG Background.
            colorBlindMode = false;
        }
        else //if colorblind mode is off.
        {
            //turn on colorBlindMode, which removes the MLG Background.
            colorBlindMode = true;
        }

    }
}

/* This function is responsible for handling mousemove events.
 * It's called by the ASYNC FUNCTION call:
 * document.addEventListener("mousemove", mouseMoveHandler, false);
 *
 * Whenever the user moves their mouse pointer in the canvas,
 * this method is called. It checks to see where the mouse currently is
 * and updates paddleX based on the mouse's position in the canvas.
 */
function mouseMoveHandler(e) {
    //relativeX is equal to the horizontal mouse position -
    //distance between the left edge of the canvas and viewport (offsetLeft).
    const relativeX = e.clientX - canvas.offsetLeft;

    //if the user's mouse is between the left side of the canvas and
    //the right side of the canvas.
    if (relativeX > 0 && relativeX < canvas.width) {
        //Set the paddle's middle to be underneath the mouse pointer.
        paddleX = relativeX - paddleWidth / 2;
    }
}

document.body.onmousedown = function (e) {
    if (e.button == 1) {
        e.preventDefault();
        return false;
    }
}

//============================================================================================================//
//********************************            (END) EVENT HANDLERS            ********************************//
//============================================================================================================//
//======================================================================================================================//
//********************************            MISCELLANEOUS HELPER FUNCTIONS            ********************************//
//======================================================================================================================//


/* This function updates the speed of the ball
 * by altering ballMoveX and ballMoveY based on ballSpeed
 * changes or where the ball's velocity is headed.
 *
 * It's a helper function for ballSpeed.
 */
function updateSpeed() {
    //if ball is moving right
    if (ballMoveX > 0) {
        ballMoveX = ballSpeed;
    }
    else if (ballSpeed == 0) {
        ballMoveX = 0;
    }
    else //ball is moving left
    {
        ballMoveX = -ballSpeed;
    }

    //if the ball is moving down.
    if (ballMoveY > 0) {
        ballMoveY = ballSpeed;
    }
    else if (ballSpeed == 0) {
        ballMoveY = 0;
    }
    else //ball is moving up.
    {
        ballMoveY = -ballSpeed;
    }
}

//Thanks to: https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
//This function calculates the width of a
//text given its font, font size, and bold/italic/etc.
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
}

/* This function returns a visible brick
 * if there is one in the brick 2D array.
 *
 * If not, it returns nothing.
 * It's a helper function for the draw() function.
 * However, it doesn't draw anything,
 * so it goes under MISCELLANEOUS HELPER FUNCTIONS.
 */
function getVisibleBrick() {
    //for loops are basically the same as they always were.
    //This one loops through the 2D brick array to find a brick.
    //If there is a visible brick remaining, return it.
    //else, it returns nothing.
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                return brick;
            }
        }
    }
}

//============================================================================================================================//
//********************************            (END) MISCELLANEOUS HELPER FUNCTIONS            ********************************//
//============================================================================================================================//


//=======================================================================================================//
//=======================================================================================================//
//********************************            (END) FUNCTIONS            ********************************//
//=======================================================================================================//
//=======================================================================================================//



//============================================================================================================//
//============================================================================================================//
//********************************            ASYNC FUNCTION CALLS            ********************************//
//============================================================================================================//
//============================================================================================================//

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

document.addEventListener("auxclick", toggleAutoMode, false);

//video.addEventListener("play", renderVideoOnLocation, false);

drawTitle();
//Wait for the user to click - then begin the game.
document.addEventListener("click", beginGame, false);

//==================================================================================================================//
//==================================================================================================================//
//********************************            (END) ASYNC FUNCTION CALLS            ********************************//
//==================================================================================================================//
//==================================================================================================================//

