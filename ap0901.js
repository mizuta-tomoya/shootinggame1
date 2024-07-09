//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G285102022 水田智也
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import {GLTFLoader} from "gltf";
import {OrbitControls} from "orbit";
import { GUI } from "gui";


// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    axes: true, // 座標軸
  };

  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // モデルの読み込み
  let xwing; // モデルを格納する変数
  function loadModel() { // モデル読み込み関数の定義
    const loader = new GLTFLoader();
    loader.load(
      "xwing.glb", // モデルのファイル
      (gltf)=>{ //読み込み終了時に実行される関数
        xwing = gltf.scene; //モデルのシーンを取り出す
        xwing.position.set(0,5,0);
        xwing.rotation.x=Math.PI;
        scene.add(xwing); //Three.jsのシーンに追加する
        render(); // 描画開始
      }
    );
  }
  let xwingY=3;
  // スコア表示
  let score = 0;
  function setScore(score) {
    document.getElementById("score").innerText
    =String(Math.round(score)).padStart(8,"0");
  }
  // Geometry の分割数
  const nSeg = 24;
  const pi = Math.PI;

  //弾を入れる配列
  const balls = new THREE.Group();
  const ballR = 0.1;
  for(let i=0;i<4;i++){
      //弾の作成
    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(ballR, nSeg, nSeg),
      new THREE.MeshPhongMaterial({ color: 0x808080, specular: 0xa0a0a0 })
    );
    ball.geometry.computeBoundingSphere();
    //配列に弾を入れる
    ball.live = false;
    balls.add(ball);
  }
  //シーンに配列の中身を入れる
  scene.add(balls);

  // ボールの移動
  const vBall = new THREE.Vector3();
  let vz = -Math.cos(pi / 4);

  function moveBall(delta) {
    balls.children.forEach((ball) => {
  
    if(ball.live){
      vBall.set(0, 0, vz)
     ball.position.addScaledVector(vBall,delta * speed);
      if(ball.position.z<=-30){
        stopBall(ball);
      }
    }
    else{
      ball.position.x = xwing.position.x;
      ball.position.y=5;
      ball.position.z = xwing.position.z-xwingY-ballR;
    }
    });
  }

  let speed = 0;

  // ボールを停止する
  function stopBall(ball) {
    ball.live = false;
      
  }

  // ボールを動かす
  function startBall(ball) {
    ball.live = true;
    speed = 20;
  }

  // マウスクリックでスタートする
  let timer = 100;
  let start=false;
  window.addEventListener("mousedown", () => {
    start=true;
    if (timer == 0){
      timer = 100;
    }
    if(nBrick<=0){
      score=score+1000;
      resetBrick();
    }
    if (!balls.children[0].live) { startBall(balls.children[0]); }
  }, false);


  const FrameX=20;const FrameY = 10; const FrameZ = 30;const FrameW=3;
    //枠生成
  //上蓋
//  const FrameX=20;const FrameY = 10; const FrameZ = 30;const FrameW=3;
const tFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FrameX, FrameW, FrameZ),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0xffffff })
);
tFrame.position.set(0,FrameY+(FrameW/2),-FrameZ/2);
scene.add(tFrame);
//左
const lFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FrameW, FrameY, FrameZ),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x333333 })
);
lFrame.position.set(-FrameX/2-FrameW/2,FrameY/2,-FrameZ/2);
scene.add(lFrame);
//右
const rFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FrameW, FrameY, FrameZ),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x333333 })
);
rFrame.position.set(FrameX/2+FrameW/2,FrameY/2,-FrameZ/2);
scene.add(rFrame);
//下
const bFrame = new THREE.Mesh(
  new THREE.BoxGeometry(FrameX, FrameW, FrameZ),
  new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0xffffff })
);
bFrame.position.set(0,-FrameW/2,-FrameZ/2);
scene.add(bFrame);

//テクスチャの読み込み
const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load("uchu.jpeg");
//平面の作成
const PlaneGeometry=new THREE.PlaneGeometry(FrameX,FrameY);
const PlaneMaterial = new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color: 0xccaa77});
const Plane=new THREE.Mesh(PlaneGeometry, PlaneMaterial);
//平面にテクスチャを登録
PlaneMaterial.map = texture1;
//平面の位置
Plane.position.set(0,FrameY/2,-FrameZ);
//シーンに平面を追加する
scene.add(Plane);


  //マウスが動いている間モデル移動
  {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const intersects = new THREE.Vector3();
    function xwingMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2-1;
      raycaster.setFromCamera(mouse,camera);
      raycaster.ray.intersectPlane(plane,intersects);
      const offset = FrameX / 2 - FrameW/2 ;
      if(intersects.x < -offset){
        intersects.x = -offset;
      }
      else if (intersects.x > offset) {
        intersects.x = offset;
      }
      xwing.position.x=intersects.x;
  
    }
    window.addEventListener("mousemove", xwingMove, false);
  }
  // ブロックの生成
  const bricks = new THREE.Group();
  let nBrick=0;
  {
    const color = ["white", "red", "yellow", "blue", "purple", "green"];
    const param = {
      h: 0.8, /* ブロックの高さ */ d: 0.4, /* ブロックの奥行 */
      nRow: 6, /* ブロックの行数 */ nCol: 9, /* ブロックの列数 */
      gapX: 0.1, /* 横方向の隙間 */ gapZ: 0.3 /* 縦方向の隙間 */
    };
    // ブロックの幅
    param.w = (FrameX - 2 * 1 - (param.nCol + 1) * param.gapX) / param.nCol;
    // ブロックを並べる
    for(let r=0;r<param.nRow;r++){
      for(let c = 0;c<param.nCol;c++){
        const brick = new THREE.Mesh(
          new THREE.BoxGeometry(param.w,param.h,param.d),
          new THREE.MeshLambertMaterial({color: color[r%color.length]})
        );
        brick.position.set(
          (param.w+param.gapX)*(c-((param.nCol-1)/2)),
          5,
          -(param.d+param.gapZ)*r
        )
        brick.geometry.computeBoundingBox();
        bricks.add(brick);
        nBrick++;
      }
    }

    // ブロック全体を奥に移動する
    bricks.position.z=-10;
    scene.add(bricks);

  }
  // ブロックの衝突検出
  function brickCheck() {
    balls.children.forEach((ball) => {
    let hit = false;
    const sphere = ball.geometry.boundingSphere.clone();
    sphere.translate(ball.position);
    bricks.children.forEach((brick)=>{
      if(!hit&&brick.visible){
        let box=brick.geometry.boundingBox.clone();
        box.translate(bricks.position);
        box.translate(brick.position);
        if(box.intersectsSphere(sphere)){
          hit=true;
          brick.visible=false;
          nBrick--;
          score +=(1-brick.position.z)*100;
          stopBall(ball);
          
        }
      }
    });
  });
  }
  // ブロックの再表示
  function resetBrick() {
    nBrick=0;
    bricks.children.forEach((brick)=>{
      brick.visible=true;
      nBrick++;
    });
  }
  




  // 光源の設定
  const light = new THREE.SpotLight();
  light.position.set(0, 20, 10);
  scene.add(light);
  
  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0,10,20);
  camera.lookAt(0,7,10);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
    document.getElementById("output").appendChild(renderer.domElement);

  // 描画処理

  // 描画関数
  const clock = new THREE.Clock(); // 時間の管理
  function render() {
    if (start&&timer%30==0) {
      console.log(200);
      startBall(balls.children[Math.floor(timer/30)]);
    }
    timer -= 1;
    if (timer < 0){
      timer = 0;
      start=false;
    }
    // 座標軸の表示
    axes.visible = param.axes;
    // ゲーム画面の更新
    let delta = clock.getDelta(); // 経過時間の取得
    brickCheck(); // ブロックの衝突判定
    moveBall(delta); // ボールの移動
    setScore(score); // スコア更新
    
    // 描画
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画開始
  loadModel(); // モデル読み込み実行
}

init();