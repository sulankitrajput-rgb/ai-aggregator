import * as THREE from 'three';
import './style.css';

// ===================================
// INDIAN AIRPORT DATABASE
// ===================================

const airports = [
    {code:'VNS',name:'Lal Bahadur Shastri International',city:'Varanasi, Uttar Pradesh'},
    {code:'DEL',name:'Indira Gandhi International',city:'Delhi'},
    {code:'BOM',name:'Chhatrapati Shivaji Maharaj International',city:'Mumbai'},
    {code:'BLR',name:'Kempegowda International',city:'Bengaluru'},
    {code:'MAA',name:'Chennai International',city:'Chennai'},
    {code:'CCU',name:'Netaji Subhas Chandra Bose International',city:'Kolkata'},
    {code:'HYD',name:'Rajiv Gandhi International',city:'Hyderabad'},
    {code:'GOI',name:'Manohar International',city:'Goa'},
    {code:'AMD',name:'Sardar Vallabhbhai Patel International',city:'Ahmedabad'},
    {code:'COK',name:'Cochin International',city:'Kochi'},
    {code:'PAT',name:'Jay Prakash Narayan Airport',city:'Patna'},
    {code:'LKO',name:'Chaudhary Charan Singh International',city:'Lucknow'},
    {code:'IXC',name:'Chandigarh International',city:'Chandigarh'},
    {code:'IXB',name:'Bagdogra Airport',city:'Siliguri'},
    {code:'JAI',name:'Jaipur International',city:'Jaipur'},
    {code:'TRV',name:'Thiruvananthapuram International',city:'Kerala'},
    {code:'IXE',name:'Mangaluru International',city:'Karnataka'},
    {code:'NAG',name:'Dr. Babasaheb Ambedkar International',city:'Nagpur'},
    {code:'SXR',name:'Sheikh ul Alam International',city:'Srinagar'},
    {code:'GAU',name:'Lokpriya Gopinath Bordoloi International',city:'Guwahati'},
    {code:'BBI',name:'Biju Patnaik International',city:'Bhubaneswar'},
    {code:'RPR',name:'Swami Vivekananda Airport',city:'Raipur'},
    {code:'UDR',name:'Maharana Pratap Airport',city:'Udaipur'},
    {code:'IXR',name:'Birsa Munda Airport',city:'Ranchi'},
    {code:'VGA',name:'Vijayawada International',city:'Vijayawada'}
];

// ===================================
// AIRCRAFT DATABASE
// ===================================

const fleet = [
    {name:'A220-300',airlines:['Air Baltic','Delta Air Lines'],span:13.5,len:12.5},
    {name:'A300-600',airlines:['FedEx','UPS Airlines'],span:16,len:17},
    {name:'A310-300',airlines:['Air Transat','Mahan Air'],span:15,len:16},
    {name:'A318',airlines:['Air France','British Airways'],span:12,len:12},
    {name:'A319',airlines:['IndiGo','Lufthansa'],span:13,len:13},
    {name:'A320neo',airlines:['IndiGo','Air India'],span:13,len:13.5},
    {name:'A321neo',airlines:['IndiGo','Wizz Air'],span:14,len:15},
    {name:'A330-300',airlines:['AirAsia X','Lufthansa'],span:19,len:19},
    {name:'A340-600',airlines:['Lufthansa','Virgin Atlantic'],span:19,len:22},
    {name:'A350-900',airlines:['Air India','Singapore Airlines'],span:20,len:21},
    {name:'A380-800',airlines:['Emirates','Singapore Airlines'],span:24,len:24},
    {name:'Concorde',airlines:['British Airways','Air France'],span:14,len:22}
];

const $ = id => document.getElementById(id);

const aircraftSelect = $('aircraftSelect');
const airlineSelect = $('airlineSelect');
const airportSelect = $('airportSelect');

fleet.forEach((a,i) => {
    aircraftSelect.add(new Option(a.name,i));
});

airports.forEach(a => {
    airportSelect.add(new Option(
        `${a.code} - ${a.city}`,a.code
    ));
});

airportSelect.value = 'VNS';

function updateAirlines() {
    const a = fleet[Number(aircraftSelect.value)];

    airlineSelect.replaceChildren(
        ...a.airlines.map(name => new Option(name,name))
    );
}

updateAirlines();

// ===================================
// THREE.JS SETUP
// ===================================

let scene;
let camera;
let renderer;
let plane;
let clock;

let started = false;
let throttle = 0;
let speed = 0;
let altitude = 0;
let pitch = 0;
let bank = 0;
let heading = 0;
let flaps = 0;
let gearDown = true;
let brakes = false;
let verticalSpeed = 0;

const held = {};

function createScene() {

    const host = $('scene');

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x9acde5);

    scene.fog = new THREE.Fog(
        0x9acde5,450,2600
    );

    camera = new THREE.PerspectiveCamera(
        53,
        host.clientWidth / host.clientHeight,
        0.1,
        8000
    );

    camera.position.set(0,9,30);

    renderer = new THREE.WebGLRenderer({
        antialias:true
    });

    renderer.setPixelRatio(
        Math.min(devicePixelRatio,2)
    );

    renderer.setSize(
        host.clientWidth,
        host.clientHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.outputColorSpace = THREE.SRGBColorSpace;

    host.appendChild(renderer.domElement);

    scene.add(
        new THREE.HemisphereLight(
            0xeaf8ff,0x617d54,2
        )
    );

    const sun = new THREE.DirectionalLight(
        0xfff4dc,2.2
    );

    sun.position.set(-80,140,90);
    sun.castShadow = true;

    scene.add(sun);

    // Ground

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(8000,8000),
        new THREE.MeshStandardMaterial({
            color:0x628b55
        })
    );

    ground.rotation.x = -Math.PI/2;
    ground.position.y = -2;

    scene.add(ground);

    createRunway();
    createAirport();
    createClouds();
    createPlane();

    clock = new THREE.Clock();

    $('loading').style.opacity = '0';

    animate();

    window.addEventListener('resize',resize);
}

// ===================================
// RUNWAY
// ===================================

function createRunway() {

    const runway = new THREE.Mesh(
        new THREE.BoxGeometry(44,.3,1150),
        new THREE.MeshStandardMaterial({
            color:0x343c42
        })
    );

    runway.position.set(0,-1.78,-420);

    scene.add(runway);

    const white = new THREE.MeshStandardMaterial({
        color:0xffffff
    });

    for(let z=-970;z<-5;z+=48) {

        const mark = new THREE.Mesh(
            new THREE.BoxGeometry(.65,.08,23),
            white
        );

        mark.position.set(0,-1.59,z);

        scene.add(mark);
    }

    for(const x of [-18,18]) {

        const edge = new THREE.Mesh(
            new THREE.BoxGeometry(.45,.08,1120),
            white
        );

        edge.position.set(x,-1.58,-420);

        scene.add(edge);
    }
}

// ===================================
// AIRPORT BUILDING
// ===================================

function createAirport() {

    const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(105,12,25),
        new THREE.MeshStandardMaterial({
            color:0xc8d3d7
        })
    );

    terminal.position.set(125,4,-15);

    scene.add(terminal);

    const glass = new THREE.Mesh(
        new THREE.BoxGeometry(106,6,.5),
        new THREE.MeshStandardMaterial({
            color:0x4d8398
        })
    );

    glass.position.set(125,4,-2.2);

    scene.add(glass);

}

// ===================================
// CLOUDS
// ===================================

function createClouds() {

    const material = new THREE.MeshStandardMaterial({
        color:0xffffff
    });

    for(let i=0;i<35;i++) {

        const cloud = new THREE.Group();

        for(let j=0;j<5;j++) {

            const puff = new THREE.Mesh(
                new THREE.SphereGeometry(
                    7 + Math.random()*5,
                    10,8
                ),
                material
            );

            puff.position.set(
                j*8,
                Math.random()*3,
                Math.random()*8
            );

            cloud.add(puff);
        }

        cloud.position.set(
            (Math.random()-.5)*1500,
            75+Math.random()*100,
            -1000+Math.random()*1700
        );

        scene.add(cloud);
    }
}

// ===================================
// AIRCRAFT CREATION
// ===================================

function createPlane() {

    if(plane) {
        scene.remove(plane);
    }

    const spec = fleet[Number(aircraftSelect.value)];

    plane = new THREE.Group();

    const colorMap = {
        'Air India':0xb71935,
        'IndiGo':0x173e83,
        'Emirates':0xb51e36,
        'Qatar Airways':0x651b3c,
        'Lufthansa':0x153e72,
        'British Airways':0x173c70,
        'Singapore Airlines':0x9c7a32,
        'Air France':0x163b75,
        'Delta Air Lines':0x9b1d36,
        'Air Baltic':0x75b6c9
    };

    const color = colorMap[airlineSelect.value] ?? 0x244d79;

    const paint = new THREE.MeshStandardMaterial({
        color:color
    });

    const white = new THREE.MeshStandardMaterial({
        color:0xf2f3ef
    });

    const dark = new THREE.MeshStandardMaterial({
        color:0x253746
    });

    // Fuselage

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(
            .85,.95,spec.len,24
        ),
        white
    );

    body.rotation.x = Math.PI/2;

    plane.add(body);

    // Nose

    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(
            .88,20,12
        ),
        white
    );

    nose.scale.set(1,1,1.65);

    nose.position.z = -spec.len/2;

    plane.add(nose);

    // Wings

    const wing = new THREE.Mesh(
        new THREE.BoxGeometry(
            spec.span,.18,3
        ),
        paint
    );

    plane.add(wing);

    // Concorde delta wing approximation

    if(spec.name === 'Concorde') {

        wing.geometry.dispose();

        const vertices = new Float32Array([
            -7,0,2,
             7,0,2,
             0,0,-7,
            -7,0,2
        ]);

        const geo = new THREE.BufferGeometry();

        geo.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(vertices,3)
        );

        wing.geometry = geo;
    }

    // Tail wing

    const tail = new THREE.Mesh(
        new THREE.BoxGeometry(
            spec.span*.35,.16,1.8
        ),
        paint
    );

    tail.position.set(
        0,.35,spec.len*.39
    );

    plane.add(tail);

    // Vertical stabilizer

    const fin = new THREE.Mesh(
        new THREE.BoxGeometry(
            .22,2.5,2.5
        ),
        paint
    );

    fin.position.set(
        0,1.25,spec.len*.39
    );

    plane.add(fin);

    // Engines

    const engineCount =
        spec.name === 'A340-600' ||
        spec.name === 'A380-800' ||
        spec.name === 'Concorde'
        ? 4 : 2;

    for(let i=0;i<engineCount;i++) {

        const side = i%2===0 ? -1 : 1;

        const engine = new THREE.Mesh(
            new THREE.CylinderGeometry(
                .62,.72,2.6,20
            ),
            dark
        );

        engine.rotation.x = Math.PI/2;

        engine.position.set(
            side*spec.span*.23,
            -.65,-.3
        );

        plane.add(engine);
    }

    plane.position.set(0,.1,0);

    scene.add(plane);
}

// ===================================
// FLIGHT CONTROL
// ===================================

function resetFlight() {

    started = false;

    throttle = 0;
    speed = 0;
    altitude = 0;
    pitch = 0;
    bank = 0;
    heading = 0;
    flaps = 0;

    gearDown = true;
    brakes = false;

    plane.position.set(0,.1,0);

    plane.rotation.set(0,0,0);

    $('flightState').textContent = 'READY ON STAND';

    updateHUD();
}

function updateHUD() {

    $('speed').textContent = Math.round(speed);

    $('altitude').textContent = Math.round(altitude);

    $('throttle').textContent = Math.round(throttle);

    $('throttleBar').style.width = throttle + '%';

    $('vspeed').textContent = Math.round(verticalSpeed);

    $('gear').textContent =
        gearDown ? 'GEAR DOWN' : 'GEAR UP';

    $('flaps').textContent = 'FLAPS ' + flaps;
}

// ===================================
// MAIN ANIMATION
// ===================================

function animate() {

    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(),.05);

    if(started) {

        if(held.ShiftLeft || held.ShiftRight)
            throttle = Math.min(100,throttle+22*dt);

        if(held.ControlLeft || held.ControlRight)
            throttle = Math.max(0,throttle-25*dt);

        if(held.KeyW)
            pitch = Math.min(.45,pitch+dt*.48);

        if(held.KeyS)
            pitch = Math.max(-.35,pitch-dt*.48);

        if(held.KeyA)
            bank = Math.min(.75,bank+dt*.85);

        if(held.KeyD)
            bank = Math.max(-.75,bank-dt*.85);

        if(held.KeyQ)
            heading -= dt*.45;

        if(held.KeyE)
            heading += dt*.45;

        pitch *= Math.pow(.985,dt*60);

        bank *= Math.pow(.98,dt*60);

        let acceleration =
            throttle/100*18 - speed*.045;

        if(brakes) acceleration -= 28;

        speed = Math.max(
            0,
            Math.min(480,speed+acceleration*dt)
        );

        const airborne = speed>145 && !gearDown;

        const targetVs = airborne
            ? pitch*speed*2.1
            : 0;

        verticalSpeed +=
            (targetVs-verticalSpeed)*Math.min(1,dt*1.5);

        altitude = Math.max(
            0,
            altitude+verticalSpeed*dt/60
        );

        const travel = speed*.13*dt;

        plane.position.x += Math.sin(heading)*travel;

        plane.position.z -= Math.cos(heading)*travel;

        plane.position.y = altitude*.003+.1;

        plane.rotation.set(
            -pitch,
            heading,
            -bank
        );

        if(altitude>0)
            $('flightState').textContent='AIRBORNE';

        else if(speed>10)
            $('flightState').textContent='TAKEOFF ROLL';

        else
            $('flightState').textContent='TAXI';
    }

    // Follow camera

    const desired = new THREE.Vector3(
        plane.position.x+Math.sin(heading)*4,
        plane.position.y+8+altitude*.002,
        plane.position.z+25
    );

    camera.position.lerp(desired,.055);

    camera.lookAt(plane.position);

    updateHUD();

    renderer.render(scene,camera);
}

// ===================================
// BUTTONS AND AIRPORT SELECTION
// ===================================

aircraftSelect.addEventListener(
    'change',
    () => {
        updateAirlines();
        createPlane();
    }
);

airlineSelect.addEventListener(
    'change',
    createPlane
);

airportSelect.addEventListener(
    'change',
    () => {

        const a = airports.find(
            x => x.code === airportSelect.value
        );

        $('airportCode').textContent = a.code;

        $('airportName').textContent = a.name;

        $('airportCity').textContent = a.city;
    }
);

$('startBtn').addEventListener(
    'click',
    () => {
        started = true;
        throttle = Math.max(throttle,12);
    }
);

$('resetBtn').addEventListener(
    'click',
    resetFlight
);

// ===================================
// KEYBOARD
// ===================================

window.addEventListener('keydown',e=>{

    held[e.code] = true;

    if(e.repeat) return;

    if(e.code==='KeyG')
        gearDown = !gearDown;

    if(e.code==='KeyF')
        flaps = (flaps+1)%4;

    if(e.code==='KeyB')
        brakes = !brakes;

    if(e.code==='KeyR')
        resetFlight();
});

window.addEventListener('keyup',e=>{
    held[e.code] = false;
});

// ===================================
// RESIZE
// ===================================

function resize() {

    const host = $('scene');

    camera.aspect =
        host.clientWidth/host.clientHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        host.clientWidth,
        host.clientHeight
    );
}

// START

createScene();
