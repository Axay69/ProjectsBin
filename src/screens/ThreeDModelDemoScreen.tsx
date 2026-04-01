import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Horse => https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773900672/qajhyr4jjstpwp0l2we7.glb

const ThreeDModelDemoScreen = () => {
    const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
    <style>
      body { margin: 0; overflow: hidden; }
      canvas { display: block; }
    </style>
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: message }));
      };
      window.addEventListener("unhandledrejection", function(event) { 
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'promiseError', message: event.reason }));
      });
    </script>
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
      }
    </script>
  </head>
  <body>
      <script type="module">
      import * as THREE from 'three';
      import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
      import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x058D9E);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      camera.position.set(0, 1, 5);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      document.body.appendChild(renderer.domElement);

      // Lights
      const light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(5, 10, 15);
      light1.castShadow = true;
      scene.add(light1);

      const light2 = new THREE.DirectionalLight(0xffffff, 0.7);
      light2.position.set(-10, 10, 15);
      scene.add(light2);

      const ambient = new THREE.AmbientLight(0x404040, 1.5);
      scene.add(ambient);

      // Floor
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.3 })
      );
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = -1;
      plane.receiveShadow = true;
      scene.add(plane);

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = true;
      controls.enableDamping = true; // Smooth rotation
    //   controls.autoRotate = true;    // Auto-rotate by default!
    //   controls.autoRotateSpeed = 2.0;

      // --- ANIMATION VARIABLES ---
      let mixer;            // Handles all animations
      let currentAction;    // Keeps track of the currently playing animation
      let animations = [];  // Will store all loaded animations
      const clock = new THREE.Clock(); // Keeps track of time between frames

      // Helper function to easily play animations by index Number with smooth crossfading
      // (1: Idle, 2: Jump, 3: Run, 4: Walk, 5: WalkSlow)
        function playAnimation(index, loopOnce = false) {
          if (!animations[index]) return null;

          const action = mixer.clipAction(animations[index]);
          action.reset();
          
          if (loopOnce) {
              action.setLoop(THREE.LoopOnce, 1);
              action.clampWhenFinished = true; // Stop on the last frame
          } else {
              action.setLoop(THREE.LoopRepeat, Infinity);
          }

          action.play();
          
          // Smoothly transition from the current animation to the new one over 0.5 seconds
          if (currentAction && currentAction !== action) {
              currentAction.crossFadeTo(action, 0.5, true);
          }

          currentAction = action;
          return action;
        }

      // Starts the infinitely repeating Jump + Run sequence
      function startInfiniteLoop() {
          // Play Jump (1 time)
          const jumpAction = playAnimation(2, true);
          const jumpDurationMs = jumpAction.getClip().duration * 1000;

          // Wait until Jump finishes
          setTimeout(() => {
              // Play Run (2 seconds)
              playAnimation(3, false);
              
              setTimeout(() => {
                  startInfiniteLoop(); // Repeat the sequence forever
              }, 2000); // Wait 2 seconds of running

          }, jumpDurationMs - 200); // 200ms subtracted so it smooths into the Run earlier
      }

      // --- SETUP & LOAD MODEL ---
      const loader = new GLTFLoader();
      loader.load(
        'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773900672/qajhyr4jjstpwp0l2we7.glb',
        (gltf) => {
          const model = gltf.scene;
          model.position.y = -1; // Bump it up slightly above the floor

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          scene.add(model);

          // If the model has animations, save them and start the sequence!
          if (gltf.animations && gltf.animations.length > 0) {
            const animNames = gltf.animations.map((a, i) => i + ': ' + (a.name || 'unnamed'));
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'animations_list',
              message: 'Total: ' + gltf.animations.length + ' | Names: ' + animNames.join(', ')
            }));

            mixer = new THREE.AnimationMixer(model);
            animations = gltf.animations; // Store all animations globally

            // SEQUENCE TIMELINE (in milliseconds):
            // 1. WalkSlow for 10 seconds
            playAnimation(5, false);

            setTimeout(() => {
                // 2. Walk for 6 seconds
                playAnimation(4, false);

                setTimeout(() => {
                    // 3. Jump (1 time)
                    const jumpAction = playAnimation(2, true);
                    const jumpDurationMs = jumpAction.getClip().duration * 1000;

                    setTimeout(() => {
                        // 4. Run for 5 seconds
                        playAnimation(3, false);

                        setTimeout(() => {
                             // 5. Start Infinite Loop (Jump -> 2s Run -> repeat)
                             startInfiniteLoop();

                        }, 5000); // Wait 5 seconds of running
                    }, jumpDurationMs - 200);

                }, 6000); // Wait 6 seconds of walking
            }, 10000); // Wait 10 seconds of slow walking
          }
        },
        undefined,
        (error) => console.error(error)
      );

      function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta); // Update model animations
        
        controls.update(); // Required for autoRotate and damping
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    </script>

  </body>
  </html>
  `;



    return (
        <View style={styles.container}>
            <WebView
                style={{ flex: 1, backgroundColor: 'white' }}
                originWhitelist={['*']}
                source={{ html, baseUrl: 'https://localhost' }}
                allowFileAccess
                allowFileAccessFromFileURLs
                allowUniversalAccessFromFileURLs
                javaScriptEnabled
                domStorageEnabled
                onMessage={(event) => console.log('WebView Message:', event.nativeEvent.data)}
                containerStyle={{
                    flex: 1,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'red' },
});

export default ThreeDModelDemoScreen;



// ====

// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { WebView } from 'react-native-webview';

// // ============================================================
// // ANIMATION REFERENCE (per model group)
// //
// // GROUP A — 6 animations (NightWarrior, Model_2, Model_6)
// //   0: Death  | 1: Idle | 2: Jump | 3: Run | 4: Walk | 5: WalkSlow
// //   Sequence: WalkSlow(10s) → Walk(6s) → Jump(x1) → Run(5s)
// //             → then loop forever: Jump(x1) → Run(2s)
// //
// // GROUP B — 2 animations (Model_1, Model_3, Model_4, Model_5)
// //   0: Idle  | 1: Jump
// //   Sequence: Idle(4s) → Jump(x1) → repeat forever
// // ============================================================

// const ThreeDModelDemoScreen = () => {
//     const html = `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
//     <style>
//         * { margin: 0; padding: 0; box-sizing: border-box; }
//         body { overflow: hidden; background: #058D9E; }
//         canvas { display: block; }
//     </style>

//     <!-- Error Bridge: forwards JS errors to React Native console -->
//     <script>
//         window.onerror = function(message) {
//             window.ReactNativeWebView.postMessage(
//                 JSON.stringify({ type: 'error', message: message })
//             );
//         };
//         window.addEventListener('unhandledrejection', function(event) {
//             window.ReactNativeWebView.postMessage(
//                 JSON.stringify({ type: 'promiseError', message: String(event.reason) })
//             );
//         });
//     </script>

//     <!-- Import Map: lets us use bare specifiers like 'three' -->
//     <script type="importmap">
//         {
//             "imports": {
//                 "three":         "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
//                 "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
//             }
//         }
//     </script>
// </head>
// <body>
// <script type="module">

//     import * as THREE        from 'three';
//     import { GLTFLoader }    from 'three/addons/loaders/GLTFLoader.js';
//     import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//     // ================================================================
//     // SCENE
//     // ================================================================

//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0x058D9E);

//     const camera = new THREE.PerspectiveCamera(
//         60,
//         window.innerWidth / window.innerHeight,
//         0.1,
//         1000
//     );
//     camera.position.set(0, 2, 14);

//     const renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     renderer.shadowMap.enabled = true;
//     document.body.appendChild(renderer.domElement);

//     // ================================================================
//     // LIGHTING
//     // ================================================================

//     const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
//     keyLight.position.set(5, 10, 15);
//     keyLight.castShadow = true;
//     scene.add(keyLight);

//     const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
//     fillLight.position.set(-10, 10, 15);
//     scene.add(fillLight);

//     const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
//     scene.add(ambientLight);

//     // ================================================================
//     // FLOOR
//     // ================================================================

//     const floorMesh = new THREE.Mesh(
//         new THREE.PlaneGeometry(60, 60),
//         new THREE.ShadowMaterial({ opacity: 0.25 })
//     );
//     floorMesh.rotation.x = -Math.PI / 2;
//     floorMesh.position.y = -1;
//     floorMesh.receiveShadow = true;
//     scene.add(floorMesh);

//     // ================================================================
//     // ORBIT CONTROLS
//     // ================================================================

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableZoom    = true;
//     controls.enableDamping = true;
//     controls.target.set(0, 0.5, 0);
//     controls.update();

//     // ================================================================
//     // CLOCK
//     // ================================================================

//     const clock = new THREE.Clock();

//     // ================================================================
//     // MODEL REGISTRY
//     //
//     // animGroup:
//     //   'A' = 6 animations (Death, Idle, Jump, Run, Walk, WalkSlow)
//     //   'B' = 2 animations (Idle, Jump)
//     // ================================================================

//     const MODELS = [
//         { label: 'NightWarrior', animGroup: 'A', xOffset: -9,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773900672/qajhyr4jjstpwp0l2we7.glb' },

//         { label: 'Model_1',      animGroup: 'B', xOffset: -6,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905795/jrm4fofanygppgv6vyn2.glb' },

//         { label: 'Model_2',      animGroup: 'A', xOffset: -3,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905795/vqszd0scpwbhd5urliu0.glb' },

//         { label: 'Model_3',      animGroup: 'B', xOffset:  0,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905795/fzb9d6rdfpolo0vykf3t.glb' },

//         { label: 'Model_4',      animGroup: 'B', xOffset:  3,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905796/ej5phanvolfmpoyfrtzo.glb' },

//         { label: 'Model_5',      animGroup: 'B', xOffset:  6,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905796/dhjreolyngbsem5ucl67.glb' },

//         { label: 'Model_6',      animGroup: 'A', xOffset:  9,
//           url: 'https://res.cloudinary.com/dqpm9nx2h/image/upload/v1773905797/fmespgcsvwlqq6ibbs6x.glb' },
//     ].map(m => ({ ...m, mixer: null, clips: [], current: null }));

//     // ================================================================
//     // ANIMATION HELPER — play a clip on a model entry
//     // ================================================================

//     /**
//      * @param {object}  entry     - A MODELS entry
//      * @param {number}  index     - Clip index
//      * @param {boolean} loopOnce - Play once then clamp, or loop forever
//      * @returns {THREE.AnimationAction | null}
//      */
//     function playAnimation(entry, index, loopOnce = false) {
//         if (!entry.mixer || !entry.clips[index]) return null;

//         const action = entry.mixer.clipAction(entry.clips[index]);
//         action.reset();

//         if (loopOnce) {
//             action.setLoop(THREE.LoopOnce, 1);
//             action.clampWhenFinished = true;
//         } else {
//             action.setLoop(THREE.LoopRepeat, Infinity);
//         }

//         action.play();

//         // Smooth 0.5s crossfade from the previous animation
//         if (entry.current && entry.current !== action) {
//             entry.current.crossFadeTo(action, 0.5, true);
//         }

//         entry.current = action;
//         return action;
//     }

//     // ================================================================
//     // GROUP A SEQUENCE
//     // Clips: 0=Death | 1=Idle | 2=Jump | 3=Run | 4=Walk | 5=WalkSlow
//     //
//     // Timeline:
//     //   WalkSlow (10s) → Walk (6s) → Jump (x1) → Run (5s)
//     //   → ∞ loop: Jump (x1) → Run (2s) → repeat
//     // ================================================================

//     function groupA_infiniteLoop(entry) {
//         // Jump once
//         const jumpAction = playAnimation(entry, 2, true);
//         const jumpMs = jumpAction.getClip().duration * 1000;

//         setTimeout(() => {
//             playAnimation(entry, 3, false); // Run

//             setTimeout(() => {
//                 groupA_infiniteLoop(entry); // Repeat
//             }, 2000);

//         }, jumpMs - 200);
//     }

//     function groupA_startSequence(entry) {
//         // 1. WalkSlow — 10 seconds
//         playAnimation(entry, 5, false);

//         setTimeout(() => {
//             // 2. Walk — 6 seconds
//             playAnimation(entry, 4, false);

//             setTimeout(() => {
//                 // 3. Jump — 1 time
//                 const jumpAction = playAnimation(entry, 2, true);
//                 const jumpMs = jumpAction.getClip().duration * 1000;

//                 setTimeout(() => {
//                     // 4. Run — 5 seconds
//                     playAnimation(entry, 3, false);

//                     setTimeout(() => {
//                         // 5. Infinite: Jump → Run(2s) → Jump → ...
//                         groupA_infiniteLoop(entry);

//                     }, 5000);

//                 }, jumpMs - 200);

//             }, 6000);

//         }, 10000);
//     }

//     // ================================================================
//     // GROUP B SEQUENCE
//     // Clips: 0=Idle | 1=Jump
//     //
//     // Timeline (looping forever):
//     //   Idle (4s) → Jump (x1) → Idle (4s) → Jump (x1) → ...
//     // ================================================================

//     function groupB_loop(entry) {
//         // Idle — 4 seconds
//         playAnimation(entry, 0, false);

//         setTimeout(() => {
//             // Jump — once, then restart
//             const jumpAction = playAnimation(entry, 1, true);
//             const jumpMs = jumpAction.getClip().duration * 1000;

//             setTimeout(() => {
//                 groupB_loop(entry); // Restart
//             }, jumpMs - 200);

//         }, 4000);
//     }

//     // ================================================================
//     // LOAD ALL MODELS
//     // ================================================================

//     const loader = new GLTFLoader();

//     MODELS.forEach((entry) => {
//         loader.load(
//             entry.url,

//             // onLoad
//             (gltf) => {
//                 const model = gltf.scene;

//                 // Auto-centre bounding box, then place at xOffset on the floor
//                 const box    = new THREE.Box3().setFromObject(model);
//                 const size   = box.getSize(new THREE.Vector3());
//                 const center = box.getCenter(new THREE.Vector3());

//                 model.position.set(
//                     entry.xOffset - center.x,
//                     -center.y + (size.y / 2) - 1,
//                     -center.z
//                 );

//                 model.traverse((child) => {
//                     if (child.isMesh) {
//                         child.castShadow    = true;
//                         child.receiveShadow = true;
//                     }
//                 });

//                 scene.add(model);

//                 // Log animation names to React Native console
//                 const animNames = (gltf.animations || []).map(
//                     (clip, i) => i + ': ' + (clip.name || 'unnamed')
//                 );
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type:    'animations_list',
//                     message: '[' + entry.label + '] ('+ entry.animGroup +') '
//                              + 'Total: ' + animNames.length
//                              + '  |  ' + (animNames.join(', ') || 'none'),
//                 }));

//                 // Setup mixer if animations exist
//                 if (gltf.animations && gltf.animations.length > 0) {
//                     entry.mixer = new THREE.AnimationMixer(model);
//                     entry.clips = gltf.animations;

//                     if (entry.animGroup === 'A') {
//                         groupA_startSequence(entry);
//                     } else if (entry.animGroup === 'B') {
//                         groupB_loop(entry);
//                     }
//                 }
//             },

//             // onProgress
//             undefined,

//             // onError
//             (error) => {
//                 window.ReactNativeWebView.postMessage(JSON.stringify({
//                     type:    'load_error',
//                     message: '[' + entry.label + '] Failed: ' + (error.message || error),
//                 }));
//             }
//         );
//     });

//     // ================================================================
//     // RENDER LOOP
//     // ================================================================

//     function animate() {
//         requestAnimationFrame(animate);

//         const delta = clock.getDelta();

//         MODELS.forEach((entry) => {
//             if (entry.mixer) entry.mixer.update(delta);
//         });

//         controls.update();
//         renderer.render(scene, camera);
//     }

//     animate();

//     // ================================================================
//     // RESPONSIVE RESIZE
//     // ================================================================

//     window.addEventListener('resize', () => {
//         camera.aspect = window.innerWidth / window.innerHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(window.innerWidth, window.innerHeight);
//     });

// </script>
// </body>
// </html>
//     `;

//     return (
//         <View style={styles.container}>
//             <WebView
//                 style={styles.webView}
//                 originWhitelist={['*']}
//                 source={{ html, baseUrl: 'https://localhost' }}
//                 allowFileAccess
//                 allowFileAccessFromFileURLs
//                 allowUniversalAccessFromFileURLs
//                 javaScriptEnabled
//                 domStorageEnabled
//                 containerStyle={styles.webViewContainer}
//                 onMessage={(event) => {
//                     console.log('WebView Message:', event.nativeEvent.data);
//                 }}
//             />
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#058D9E',
//     },
//     webView: {
//         flex: 1,
//         backgroundColor: 'transparent',
//     },
//     webViewContainer: {
//         flex: 1,
//     },
// });

// export default ThreeDModelDemoScreen;

