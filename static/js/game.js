// Config
let game = null;
const video = document.querySelector("#input_video");
const mouseCircle = document.querySelector("#mouse-circle");

const w = 1280 || window.innerWidth;
const h = 720 || window.innerHeight;00000

const config = {
    type: Phaser.AUTO,
    width: w,
    height: h,
    //backgroundColor: "#4488AA",
    transparent: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false,
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
};

window.onload = async() => {
    await init();
     game = new Phaser.Game(config);
};

// Declare
let scoreLabel = null;
let score = 0;
let fireRate = 1000;
let nextFire = 0;
let slashes = null;
let slashLine = null;
let points = [];
let global_x = 0;
let global_y = 0;

// Preload
function preload() {
    this.load.atlas("flares", "../../assets/flares.png", "../../assets/flares.json");
}
// Create
function create() {
    // Good Ball
    texture_good = this.textures.createCanvas("circle_good", 100, 100);
    texture_good.context.beginPath();
    texture_good.context.arc(50, 50, 50, 0, 2 * Math.PI);
    texture_good.context.fillStyle = "#00ff00";
    texture_good.context.fill();
    texture_good.refresh();

    // Bad Ball
    texture_bad = this.textures.createCanvas("circle_bad", 100, 100);
    texture_bad.context.beginPath();
    texture_bad.context.arc(50, 50, 50, 0, 2 * Math.PI);
    texture_bad.context.fillStyle = "#ff1e00";
    texture_bad.context.fill();
    texture_bad.refresh();

    // Good Ball Group
    group_good = this.physics.add.group({
        key: "circle_good",
        active: false,
        frameQuantity: 200,
        setXY: {
            x: Phaser.Math.Between(w / 2 - 300, w / 2 + 300),
            y: h + 100,
            // stepX: 100,
        },
        immovable: true,
        allowGravity: true,
        colliderWorldBounds: false,
    });

    // Bad Ball Group
    group_bad = this.physics.add.group({
        key: "circle_bad",
        active: false,
        frameQuantity: 50,
        setXY: {
            x: Phaser.Math.Between(w / 2 - 300, w / 2 + 300),
            y: h + 100,
        },
        immovable: true,
        allowGravity: true,
        colliderWorldBounds: false,
    });

    // Particle
//     let particles = this.add.particles("flares");
//     this.emitter = particles.createEmitter({
//         on: false,
//         alpha: { start: 1, end: 0, ease: "Cubic.easeIn" },
//         blendMode: "ADD",
//         frame: {
//             frames: ["red", "yellow", "green", "blue"],
//             cycle: true,
//             quantity: 500,
//         },
//         gravity: 300,
//         quantity: 100,
//         scale: { min: 0.05, max: 0.15 },
//         speed: { min: 300, max: 600 },
//         bounce: 0.9,
//         collideTop: false,
//         collideBottom: false,
//     });

    // Score
    let scoreLabelConfig = {
        font: "20px 微軟正黑體",
        fill: "black",
        align: "center",
    };
    scoreLabel = this.add.text(10, 10, `使用滑鼠切球球，綠球加分，紅球扣分\nScore: ${score}`, scoreLabelConfig);

    // Controller
    // this.input.on("pointermove", (pointer) => {
    //     global_x = pointer.x;
    //     global_y = pointer.y;
    //     this.mouseCircle.setTo(global_x, global_y);
    // });

    this.graphics = this.add.graphics();
    this.mouseCircle = new Phaser.Geom.Circle();
}

// Update
function update() {
    throwObject.call(this);

    points.push({ x: global_x, y: global_y });
    points = points.splice(points.length - 10, points.length);
    if (points.length < 1 || points[0].x == 0) {
        return;
    }

    // Mouse Circle
    this.graphics.clear();
    this.mouseCircle.setTo(global_x,global_y)
    this.graphics.fillStyle(0xffffff, 0.5).fillCircle(global_x, global_y, 15).lineStyle(5, 0xffff00, 1).strokeCircle(global_x, global_y, 20);

    // Mouse Trace
    this.graphics.lineStyle().fillStyle(0xffffff, 0.5);
    this.graphics.beginPath().moveTo(points[0].x, points[0].y);
    for(var i = 1; i<points.length; i++){
        this.graphics.lineTo(points[i].x, points[i].y);
    }
    this.graphics.closePath().fillPath().strokePath();
    for(var i=1; i<points.length;i++){
        slashLine = new Phaser.Geom.Line(points[i].x, points[i].y, points[i-1].x, points[i-1].y);

        group_good.children.each(ball =>{
            isIntersect(ball, isDestroyBall.bind(this));
        }, this);
        group_bad.children.each(ball =>{
            isIntersect(ball, isDestroyBall.bind(this));
        }, this);
    }
}

function throwObject() {
    if (this.time.now > nextFire) {
        nextFire = this.time.now + fireRate;
        if (Math.random() > 0.5) {
            throwBadObject.call(this);
        } else {
            throwGoodObject.call(this);
        }
    }
}

function throwGoodObject() {
    let obj = group_good.getFirstDead();
    if (obj != null) {
        obj.active = true;
        console.log("丟好球");
        obj.setPosition(Phaser.Math.Between(w / 2 - 300, w / 2 + 300), h);
        this.physics.moveTo(obj, w / 2, h / 2, 600);
    }
}

function throwBadObject() {
    let obj = group_bad.getFirstDead();
    if (obj != null) {
        obj.active = true;
        console.log("丟壞球");
        obj.setPosition(Phaser.Math.Between(w / 2 - 300, w / 2 + 300), h);
        this.physics.moveTo(obj, w / 2, h / 2, 600);
    }
}

function isIntersect(ball, cb){
    if(ball.active){
        let line1 = new Phaser.Geom.Line(ball.body.right - ball.width, ball.body.bottom - ball.height, ball.body.right, ball.body.bottom);
        let line2 = new Phaser.Geom.Line(ball.body.right - ball.width, ball.body.bottom, ball.body.right, ball.body.bottom- ball.height);
        let result1 = Phaser.Geom.Intersects.LineToLine(slashLine, line1);
        let result2 = Phaser.Geom.Intersects.LineToLine(slashLine, line2);
        let result = result1 || result2;
        cb(result, ball);
    }
}

function isDestroyBall(result,ball){
    if(!result){
        return;
    }
    if(ball.frame.texture.key == "circle_bad"){
        score -=10;
        console.log("切壞球，扣分");
    }
    if(ball.frame.texture.key == "circle_good"){
        score +=10;
        console.log("切好球，加分");
    }
    points = [];
    scoreLabel.setText(`使用滑鼠切球球，綠球家人，紅球扣分\nScore: ${score}`);
    this.emitter.setPosition(ball.body.position.x, ball.body.position.y).explode();
    ball.destroy();
}

const init = async () =>{
    function onResultsHandler(results){
        if(results.multiHandLandmarks.length && results.multiHandedness){
            global_x = results.multiHandLandmarks[0][8].x * 1280;
            global_y = results.multiHandLandmarks[0][8].y * 720;
            mouseCircle.style.left = global_x - 15 + "px";
            mouseCircle.style.top = global_y - 15 + "px";
        }
    }

    const hands = new Hands({
        locateFile:(file)=>{
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        selfieMode: true,
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.75,
        minTrackingConfidence: 0.75
    });
    
    hands.onResults(onResultsHandler);

    const camera = new Camera(video, {
        onFrame: async()=>{
            await hands.send({image: video});
        },
        width: 1280,
        height: 720,
        facingMode: "enviroment"
    });
    console.log(camera.start());
}
