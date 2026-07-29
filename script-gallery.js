import * as THREE from "three";


// ======================
// Canvas + Scene
// ======================

const canvas =
document.querySelector("#gallery-canvas");


const scene =
new THREE.Scene();


scene.background =
new THREE.Color(0xd8c8a6);


scene.fog =
new THREE.FogExp2(
    0xd8c7a2,
    0.012
);



// ======================
// Renderer
// ======================

const renderer =
new THREE.WebGLRenderer({

    canvas,

    antialias:true

});


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.setSize(
    innerWidth,
    innerHeight
);


renderer.shadowMap.enabled = true;


renderer.shadowMap.type =
THREE.PCFSoftShadowMap;


renderer.outputColorSpace =
THREE.SRGBColorSpace;



// ======================
// Camera
// ======================

const camera =
new THREE.PerspectiveCamera(

    60,

    innerWidth / innerHeight,

    0.1,

    200

);



camera.position.set(
    0,
    0,
    0
);



// ======================
// Player
// ======================

const player =
new THREE.Group();


player.position.set(

    0,

    1.7,

    8

);



player.add(camera);


scene.add(player);



// ======================
// Cinematic Controller
// ======================


const keys = {};


const velocity =
new THREE.Vector3();


const direction =
new THREE.Vector3();



let yaw = 0;

let pitch = 0;


let bobTime = 0;



const mouseSensitivity =
0.0025;



// ======================
// Keyboard Input
// ======================


window.addEventListener(
"keydown",
(e)=>{

    keys[e.code] = true;

});


window.addEventListener(
"keyup",
(e)=>{

    keys[e.code] = false;

});



// ======================
// Mouse Look
// ======================


document.body.addEventListener(
"click",
()=>{

    document.body.requestPointerLock();

});



document.addEventListener(
"mousemove",
(e)=>{


    if(
    document.pointerLockElement !== document.body
    )
    return;



    yaw -= 
    e.movementX *
    mouseSensitivity;



    pitch -=
    e.movementY *
    mouseSensitivity;



    pitch =
    Math.max(
        -Math.PI/3,
        Math.min(
            Math.PI/3,
            pitch
        )
    );


});


// ======================
// Lighting
// ======================


const sun =
new THREE.DirectionalLight(
    0xffd89b,
    4
);


sun.position.set(
    -15,
    20,
    10
);


sun.castShadow = true;


sun.shadow.mapSize.set(
    2048,
    2048
);


sun.shadow.camera.near = 1;

sun.shadow.camera.far = 80;


scene.add(sun);



const hemisphere =
new THREE.HemisphereLight(
    0xe9f3ff,
    0x4b5d36,
    1.8
);


scene.add(hemisphere);



const ambient =
new THREE.AmbientLight(
    0xffffff,
    0.35
);


scene.add(ambient);



// ======================
// Terrain
// ======================


const groundGeometry =
new THREE.PlaneGeometry(
    100,
    100,
    200,
    200
);



const vertices =
groundGeometry.attributes.position;



for(
let i = 0;
i < vertices.count;
i++
){


    const x =
    vertices.getX(i);


    const y =
    vertices.getY(i);



    const height =

    Math.sin(x * 0.08) * 0.4 +

    Math.cos(y * 0.07) * 0.3 +

    (Math.random()-0.5)*0.05;



    vertices.setZ(
        i,
        height
    );

}



groundGeometry.computeVertexNormals();



const ground =
new THREE.Mesh(

    groundGeometry,

    new THREE.MeshStandardMaterial({

        color:"#5d5b3c",

        roughness:1

    })

);



ground.rotation.x =
-Math.PI/2;



ground.receiveShadow = true;


scene.add(ground);



// ======================
// Trees
// ======================


function createTree(
    x,
    z
){

    const tree =
    new THREE.Group();



    // trunk

    const trunk =
    new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.25,
            0.45,
            7,
            10
        ),


        new THREE.MeshStandardMaterial({

            color:"#5a3a23",

            roughness:1

        })

    );



    trunk.position.y =
    3.5;



    trunk.castShadow = true;



    // foliage layers


    const foliageMaterial1 =
    new THREE.MeshStandardMaterial({

        color:"#355f32",

        roughness:1

    });



    const foliageMaterial2 =
    new THREE.MeshStandardMaterial({

        color:"#44773b",

        roughness:1

    });



    const foliageMaterial3 =
    new THREE.MeshStandardMaterial({

        color:"#2f582e",

        roughness:1

    });



    const leaves1 =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            2.2,
            18,
            18
        ),

        foliageMaterial1

    );



    leaves1.position.y =
    6.8;



    const leaves2 =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1.8,
            18,
            18
        ),

        foliageMaterial2

    );



    leaves2.position.y =
    8.2;



    const leaves3 =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            1.2,
            18,
            18
        ),

        foliageMaterial3

    );



    leaves3.position.y =
    9.4;



    tree.add(trunk);

    tree.add(leaves1);

    tree.add(leaves2);

    tree.add(leaves3);



    tree.position.set(
        x,
        0,
        z
    );



    tree.rotation.y =
    Math.random()*Math.PI*2;



    const scale =
    0.8 +
    Math.random()*0.8;



    tree.scale.setScalar(
        scale
    );



    return tree;

}




// Scatter forest

for(
let i=0;
i<120;
i++
){


    const x =
    (Math.random()-0.5)*90;


    const z =
    (Math.random()-0.5)*90;



    // gallery clearing

    if(
        Math.abs(x)<8 &&
        Math.abs(z)<28
    )
    continue;



    scene.add(
        createTree(
            x,
            z
        )
    );


}


// ======================
// Photo Gallery
// ======================


const photos = [

    "./Pictures/space.jpg",

    "./Pictures/rule_of_thirds.jpg",

    "./Pictures/SantaCruz1.jpg",

    "./Pictures/SantaCruz2.jpg",

    "./Pictures/SantaCruz3.jpg",

    "./Pictures/SantaCruz4.jpg",

    "./Pictures/SantaCruz5.jpg",

    "./Pictures/SantaCruz6.jpg"

];



const frames=[];

let exhibitMode = false;
let focusedFrame = null;



const exhibitLight=[];

const exhibitData=[];



// ======================
// Texture Loader
// ======================


const textureLoader =
new THREE.TextureLoader();




// ======================
// Create Museum Frame
// ======================


function createFrame(
    url,
    x,
    z,
    title
){


    const frameGroup =
    new THREE.Group();



    // Wooden backing


    const wood =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            2.8,
            2.1,
            0.18
        ),


        new THREE.MeshStandardMaterial({

            color:"#6b4226",

            roughness:0.8

        })

    );



    wood.castShadow = true;



    frameGroup.add(
        wood
    );



    // Photograph


    const texture =
    textureLoader.load(
        url
    );



    texture.colorSpace =
    THREE.SRGBColorSpace;



    const photo =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            2.35,
            1.65
        ),


        new THREE.MeshStandardMaterial({

            map:texture,

            roughness:0.5

        })

    );



    photo.position.z =
    0.11;



    frameGroup.add(
        photo
    );



    // Glass reflection layer


    const glass =
    new THREE.Mesh(

        new THREE.PlaneGeometry(
            2.4,
            1.7
        ),


        new THREE.MeshPhysicalMaterial({

            color:0xffffff,

            transparent:true,

            opacity:0.12,

            roughness:0,

            transmission:0.8,

            thickness:0.05

        })

    );



    glass.position.z =
    0.13;



    frameGroup.add(
        glass
    );



    // Museum plaque


    const plaque =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            1.8,
            0.35,
            0.04
        ),


        new THREE.MeshStandardMaterial({

            color:"#d8c8a6",

            roughness:0.7

        })

    );



    plaque.position.y =
    -1.35;


    plaque.position.z =
    0.05;


    frameGroup.add(
        plaque
    );

    // Position exhibit


    frameGroup.position.set(

        x,

        2.2,

        z

    );

    scene.add(
        frameGroup
    );

    const spotlight = new THREE.SpotLight(
    0xfff5dd,
    2,
    8,
    Math.PI/6,
    0.4,
    1
);

    spotlight.position.set(
    x,
    5,
    z+1
);

    spotlight.target=frameGroup;

    scene.add(spotlight);

    scene.add(spotlight.target);

    exhibitLight.push(spotlight);

    exhibitData.push({
    title:title,
    frame:frameGroup
});


    frames.push(
        frameGroup
    );


}

// ======================
// Exhibition Corridor
// ======================


const galleryPhotos = [

    "Forest Dawn",
    "Silent Valley",
    "Wild Light",
    "Hidden Path",
    "Ancient Woods",
    "Golden Hour",
    "Santa Cruz Coast",
    "Mountain Light"

];

// ======================
// Exhibition Layout
// ======================


createFrame(
    photos[0],
    -2,
    -1,
    galleryPhotos[0]
);


createFrame(
    photos[1],
    5,
    -6,
    galleryPhotos[1]
);


createFrame(
    photos[2],
    10,
    -7,
    galleryPhotos[2]
);


createFrame(
    photos[3],
    -8,
    -2,
    galleryPhotos[3]
);


createFrame(
    photos[4],
    -4,
    -15,
    galleryPhotos[4]
);


createFrame(
    photos[5],
    3,
    -18,
    galleryPhotos[5]
);


createFrame(
    photos[6],
    -1,
    -23,
    galleryPhotos[6]
);


createFrame(
    photos[7],
    -10,
    -15,
    galleryPhotos[7]
);

// ======================
// Hover Interaction
// ======================


const raycaster =
new THREE.Raycaster();


const mouse =
new THREE.Vector2();



window.addEventListener(
"mousemove",
(event)=>{


    mouse.x =
    (event.clientX / innerWidth)*2-1;



    mouse.y =
    -(event.clientY / innerHeight)*2+1;


});



const photoInfo =
document.querySelector(
".photo-info"
);



let hoveredFrame =
null;




function checkHover(){


    exhibitLight.forEach(light=>{
    light.intensity=THREE.MathUtils.lerp(
        light.intensity,
        .7,
        .1
    );
});

const index=frames.indexOf(parent);

if(index!=-1){

    exhibitLight[index].intensity=
    THREE.MathUtils.lerp(
        exhibitLight[index].intensity,
        4,
        .15
    );

}

    raycaster.setFromCamera(
        mouse,
        camera
    );



    const hits =
    raycaster.intersectObjects(
        frames,
        true
    );



    if(hits.length){


        let parent =
        hits[0].object;



        while(
            parent &&
            !frames.includes(parent)
        ){

            parent =
            parent.parent;

        }



        if(parent){


            hoveredFrame =
            parent;



            parent.scale.lerp(
            new THREE.Vector3(1.08,1.08,1.08),
            0.12
            );

            parent.rotation.y = THREE.MathUtils.lerp(
            parent.rotation.y,
            0,
            0.08);



            photoInfo.classList.add(
                "visible"
            );


        }


    }

    else {


        if(hoveredFrame){


            hoveredFrame.scale.lerp(

                new THREE.Vector3(
                    1,
                    1,
                    1
                ),

                0.1

            );

        }



        photoInfo.classList.remove(
            "visible"
        );


        hoveredFrame =
        null;


    }


}


// ======================
// Floating Pollen
// ======================


const particleGeometry =
new THREE.BufferGeometry();


const particlePositions = [];



for(
let i = 0;
i < 2500;
i++
){

    particlePositions.push(

        (Math.random()-0.5)*50,

        Math.random()*20,

        (Math.random()-0.5)*50

    );

}



particleGeometry.setAttribute(

    "position",

    new THREE.Float32BufferAttribute(
        particlePositions,
        3
    )

);



const particleMaterial =
new THREE.PointsMaterial({

    color:0xffffcc,

    size:0.045,

    transparent:true,

    opacity:0.8

});



const pollen =
new THREE.Points(

    particleGeometry,

    particleMaterial

);



scene.add(
    pollen
);




// ======================
// Movement System
// ======================


const moveSpeed = 5;


const acceleration = 12;


const damping = 8;




function updateMovement(delta){



    direction.set(
        0,
        0,
        0
    );



    // Forward/back


    // Forward / Back
if (keys["KeyW"] || keys["ArrowUp"])
    direction.z += 1;

if (keys["KeyS"] || keys["ArrowDown"])
    direction.z -= 1;

// Left / Right
if (keys["KeyA"] || keys["ArrowLeft"])
    direction.x -= 1;

if (keys["KeyD"] || keys["ArrowRight"])
    direction.x += 1;



    direction.normalize();



    // smooth acceleration


    velocity.x +=

    (
        direction.x * moveSpeed
        -
        velocity.x

    )

    *
    delta
    *
    acceleration;



    velocity.z +=

    (
        direction.z * moveSpeed
        -
        velocity.z

    )

    *
    delta
    *
    acceleration;



    // inertia stopping


    if(direction.length()===0){

        velocity.x =
        THREE.MathUtils.damp(
            velocity.x,
            0,
            damping,
            delta
        );


        velocity.z =
        THREE.MathUtils.damp(
            velocity.z,
            0,
            damping,
            delta
        );

    }



    // direction vectors


    const forward =
    new THREE.Vector3(
        0,
        0,
        -1
    );


    forward.applyAxisAngle(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        yaw

    );



    const right =
    new THREE.Vector3(
        1,
        0,
        0
    );


    right.applyAxisAngle(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        yaw

    );




    player.position.addScaledVector(

        forward,

        velocity.z * delta

    );



    player.position.addScaledVector(

        right,

        velocity.x * delta

    );


}




// ======================
// Camera Effects
// ======================


function updateCamera(delta){



    camera.rotation.order =
    "YXZ";



    // smooth looking


    camera.rotation.y =
    THREE.MathUtils.damp(

        camera.rotation.y,

        yaw,

        12,

        delta

    );



    camera.rotation.x =
    THREE.MathUtils.damp(

        camera.rotation.x,

        pitch,

        12,

        delta

    );





    const moving =

    Math.abs(velocity.x)
    +
    Math.abs(velocity.z)
    >
    0.1;



    // walking bob


    if(moving){


        bobTime +=
        delta * 8;



        camera.position.y =

        Math.sin(bobTime)
        *
        0.04;


    }

    else{


        camera.position.y =

        THREE.MathUtils.damp(

            camera.position.y,

            0,

            8,

            delta

        );


    }





    // subtle leaning


    camera.rotation.z =

    THREE.MathUtils.damp(

        camera.rotation.z,

        -velocity.x * 0.015,

        6,

        delta

    );

}



// ======================
// Animate Floating Details
// ======================


function updateEnvironment(time){


    // pollen drifting


    pollen.rotation.y =
    time * 0.015;



    const positions =
    pollen.geometry.attributes.position;



    for(
    let i=0;
    i<positions.count;
    i++
    ){


        let y =
        positions.getY(i);



        y +=
        0.002;



        if(y>20)
            y=0;



        positions.setY(
            i,
            y
        );


    }



    positions.needsUpdate =
    true;



}


// ======================
// Photo Focus Interaction
// ======================


window.addEventListener("click", () => {

    if (!hoveredFrame || exhibitMode)
        return;

    focusedFrame = hoveredFrame;
    exhibitMode = true;

});




// ======================
// Animation Loop
// ======================


const clock =
new THREE.Clock();



function animate(){


    const delta =
    clock.getDelta();



    const elapsed =
    clock.elapsedTime;



    updateMovement(
        delta
    );


    updateCamera(
        delta
    );


    updateEnvironment(
        elapsed
    );


    checkHover();

    if (exhibitMode && focusedFrame) {

    const target = new THREE.Vector3();
    focusedFrame.getWorldPosition(target);

    // Slowly move the player toward the photo
    player.position.lerp(
        new THREE.Vector3(
            target.x,
            1.7,
            target.z + 2.2
        ),
        0.04
    );

    camera.lookAt(target);

}

    // subtle frame floating


    frames.forEach(
    (frame,index)=>{


        frame.position.y =

        2.2 +

        Math.sin(
            elapsed * 0.8 + index
        )
        *
        0.02;


    });



    renderer.render(
        scene,
        camera
    );


}




renderer.setAnimationLoop(
    animate
);




// ======================
// Resize
// ======================


window.addEventListener(
"resize",
()=>{


    camera.aspect =
    innerWidth /
    innerHeight;



    camera.updateProjectionMatrix();



    renderer.setSize(
        innerWidth,
        innerHeight
    );


});

window.addEventListener("keydown", (e) => {

    if (e.code === "Escape") {

        exhibitMode = false;
        focusedFrame = null;

    }

});
