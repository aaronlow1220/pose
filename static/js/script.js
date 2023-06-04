

// ---
// const init = async () =>{
//     function onResultsHandler(results){
//         if(results.multiHandLandmarks.length && results.multiHandedness){
//             global_x = results.multiHandLandmarks[0][8].x * 1280;
//             global_y = results.multiHandLandmarks[0][8].y * 720;
//             mouseCircle.style.left = global_x - 15 + "px";
//             mouseCircle.style.top = global_y - 15 + "px";
//         }
//     }

//     const hands = new Hands({
//         locateFile:(file)=>{
//             return `./assets/@mediapipe/hands/${file}`;
//         }
//     });

//     hands.setOptions({
//         selfieMode: true,
//         maxNumHands: 2,
//         modelComplexity: 1,
//         minDetectionConfidence: 0.5,
//         minTrackingConfidence: 0.5
//     });
    
//     hands.onResults(onResultsHandler);

//     const camera = new Camera(video, {
//         onFrame: async()=>{
//             await hands.send({image: video});
//         },
//         width: 1280,
//         height: 720,
//         facingMode: "enviroment"
//     });
//     camera.start();
// }