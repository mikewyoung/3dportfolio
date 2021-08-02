// The 3D Portion of this website was made in Babylon.JS, which is basically just a Microsoft-backed alternative to ThreeJS
const debug = false;
let showContent = true;
let sentContact = false;

function lerp(x, y, a){
        return x * (1 - a) + y * a
}

// Hide the dummy input with JS just to be a little more clever about it.
function hideInput(){
    let honeyPot = document.getElementById("last-name");
    let honeyPotLabel = document.getElementById("last-name-label");
    honeyPot.style.display = "none";
    honeyPotLabel.style.display = "none";
}

// Vars for handling swipe gestures
let initialX = 0;
let initialTime = 0;



canvas = document.getElementById("renderCanvas");
let sceneToRender = null;
let scene = null;
let engine = null;
let camera = null;
let skybox = null;
let shadowGenerator;
let dolphinSpriteManager;
let box;
let dolphin;
let light;
let downMesh;



let createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

let createScene = function () {
    scene = new BABYLON.Scene(engine);
    scene.executeWhenReady(function(){
        let welcomeMessage = document.getElementById("loading-overlay");
        let welcomeMessageInnerText = document.getElementById("welcome-message");
        welcomeMessage.style['font-size'] = "5em";
        welcomeMessageInnerText.innerText = "Welcome";
        welcomeMessage.style['animation-name'] = "fadeOut";
        welcomeMessage.style['animation-duration'] = "2s";
        welcomeMessage.style['animation-delay'] = "1s";
        welcomeMessage.style['pointer-events'] = "none !important";
    });

    dolphinSpriteManager = new BABYLON.SpriteManager("dolphinManager", "images/mysql-dolphin.png", 5, {width: 2000, height: 2000}, scene);
    dolphin = new BABYLON.Sprite("dolphin", dolphinSpriteManager);
    dolphin.width = 8;
    dolphin.height = 8;
    dolphin.position = new BABYLON.Vector3(139, -2, -2);
    dolphin.baseY = dolphin.position.y;
    dolphin.bobRange = 3;
    dolphin.targetY = dolphin.baseY + (dolphin.bobRange * .5);
    dolphin.bobDirection = true;
    dolphin.bobSpeed = 0.01;
    camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-1.16, 14.2, 19), scene, true);
    camera.attachControl(canvas);
    if (debug == false){
        camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        camera.inputs.removeByType("FreeCameraGamepadInput");
    }

    // Change FOV depending on view size
    camera.fov = 1;
    light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(50, 1, 50), scene);
    light.intensity = 1;
    
    //shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    // Skybox
    skybox = BABYLON.Mesh.CreateBox("skyBox", 5000.0, scene);
    let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("images/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
        
    // Water
    let waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 2048, 2048, 8, scene, false);
    let water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
    waterMesh.position.y = -15;
    water.backFaceCulling = true;
    water.bumpTexture = new BABYLON.Texture("images/waterbump.png", scene);
    water.windForce = -10;
    water.waveHeight = 1.7;
    water.bumpHeight = 0.1;
    water.windDirection = new BABYLON.Vector2(1, 1);
    water.waterColor = new BABYLON.Color3(0, 0, 221 / 255);
    water.colorBlendFactor = 0.0;
    water.addToRenderList(skybox);
    waterMesh.material = water;

    canvas.addEventListener("pointerdown", function(evt){
        initialX = evt.x;
        initialTime = Date.now();
        let pickResult = scene.pick(evt.clientX, evt.clientY);
        if (pickResult.hit){
            if (pickResult.pickedMesh){
                downMesh = pickResult.pickedMesh;
                return;
            }
        }
        downMesh = null;
    });

    canvas.addEventListener("pointerup", function(evt) {
        let pickResult = scene.pick(evt.clientX, evt.clientY);
        if (pickResult.hit){
            if (pickResult.pickedMesh && downMesh == pickResult.pickedMesh){
                let picked = pickResult.pickedMesh.id;
                if (picked == "NameSign"){
                    setTarget(1);
                    console.log(evt.pointerId)
                    canvas.releasePointerCapture(evt.pointerId);
                }

                if (picked == "LinkedinLogo"){
                    window.open("https://www.linkedin.com/in/myoungde/");
                    canvas.releasePointerCapture(evt.pointerId);
                }

                if (picked == "LDMISail"){
                    window.open("https://lifestyledocumentmanagement.com");
                    canvas.releasePointerCapture(evt.pointerId);
                }

                if (picked == "Bottle"){
                    setTarget(2);
                }
            }
        }

        let swipeDist = initialX - evt.x;
        let swipeThreshold = Math.min(window.innerWidth, 400);

        if (Math.abs(swipeDist) > (swipeThreshold * 0.5) && Date.now() - initialTime < 600){
            if (Math.sign(swipeDist) == 1){
                currentTarget++;
            }else{
                currentTarget--;
            }

            if (currentTarget > targetPositions.length -1){
                currentTarget = 0;
            }else{
                if (currentTarget < 0){
                    currentTarget = targetPositions.length -1;
                }
            }

            setTarget(currentTarget);
        }
     });
    

    // External model
    island = BABYLON.SceneLoader.LoadAssetContainer("./assets/", "tropical.glb", scene, function (container) {
        // Adds all elements to the scene

        container.addAllToScene();
        let signMesh = scene.getMeshByName("NameSign");
        signMesh.actionManager = new BABYLON.ActionManager(scene);
        signMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
             canvas.style.cursor = "move"
        }, false));

        signMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            canvas.style.cursor = "default" ;
        },false));

        let LinkedinMesh = scene.getMeshByName("LinkedinLogo");
        LinkedinMesh.actionManager = new BABYLON.ActionManager(scene);
        LinkedinMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
             canvas.style.cursor = "move"
        }, false));

        LinkedinMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            canvas.style.cursor = "default" ;
        },false));

        let LDMIMesh = scene.getMeshByName("LDMISail");
        LDMIMesh.actionManager = new BABYLON.ActionManager(scene);
        LDMIMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
             canvas.style.cursor = "move"
        }, false));

        LDMIMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            canvas.style.cursor = "default" ;
        },false));

        let bottleMesh = scene.getMeshByName("Bottle");
        bottleMesh.actionManager = new BABYLON.ActionManager(scene);
        bottleMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(ev){	
             canvas.style.cursor = "move"
        }, false));

        bottleMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(ev){
            canvas.style.cursor = "default" ;
        },false));
    });

    var pipeline = new BABYLON.DefaultRenderingPipeline("default", true, scene);

    // Tone mapping
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.toneMappingType = BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
    scene.imageProcessingConfiguration.exposure = 1;

    // Bloom
    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 0.8;
    pipeline.bloomWeight = 0.3;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 0.5;
    pipeline.fxaaEnabled = true;

    // Smoke
    let fire = BABYLON.ParticleHelper.CreateAsync("smoke", scene).then((set) => {
        set.start();
        set.systems[0].worldOffset = new BABYLON.Vector3(52, -1, 16);
        
    });
    addKeyboardControls();
    return scene;
}

        initFunction = async function() {               
            let asyncEngineCreation = async function() {
                try {
                return createDefaultEngine();
                } catch(e) {
                console.log("the available createEngine function failed. Creating the default engine instead");
                return createDefaultEngine();
                }
            }

            engine = await asyncEngineCreation();
if (!engine) throw 'engine should not be null.';
scene = createScene();};
initFunction().then(() => {sceneToRender = scene        
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
            skybox.rotation.y += 0.0002;
            // Rotate camera to where it needs to be.
            let setX = lerp(camera.target.x, targetPositions[currentTarget][0], 0.05);
            let setY = lerp(camera.target.y, targetPositions[currentTarget][1], 0.01);
            let setZ = lerp(camera.target.z, targetPositions[currentTarget][2], 0.05);
            // Fixes view, comment out to enable free camera.
            if (debug == false){
                camera.setTarget(new BABYLON.Vector3(setX, setY, setZ));
            }

            if (dolphin){
                dolphin.position.y = lerp(dolphin.position.y, dolphin.targetY, dolphin.bobSpeed);
                if (Math.abs(dolphin.position.y - dolphin.targetY) < 0.1){
                    if (dolphin.bobDirection == true){
                        dolphin.targetY = dolphin.baseY - (dolphin.bobRange * .5);
                        dolphin.bobDirection = false;
                    }else{
                        dolphin.targetY = dolphin.baseY + (dolphin.bobRange * .5);
                        dolphin.bobDirection = true;
                    }
                }
            }
            

            
        }
    });
});

function addKeyboardControls(){
    if (debug == true){
        box = BABYLON.Mesh.CreateBox("box", 1, scene);
    }
    document.addEventListener('keydown', function(e){
        switch(e.code){
            case "KeyA":{
                if (debug == true){
                    box.position.x += 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "KeyD":{
                if (debug == true){
                    box.position.x -= 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "KeyW":{
                if (debug == true){
                    box.position.z += 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "KeyS":{
                if (debug == true){
                    box.position.z -= 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "KeyQ":{
                if (debug == true){
                    box.position.y -= 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "KeyE":{
                if (debug == true){
                    box.position.y += 1;
                    console.log("Box position: " + box.position);
                }
            }
            break;

            case "ArrowRight":{

                // Don't do this if an input has focus
                if (document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA"){
                    if (debug == false){
                        currentTarget--;
                        if (currentTarget < 0){
                            currentTarget = targetPositions.length - 1;
                        }
                        setTarget(currentTarget);
                    }
                }
            }
            break;

            case "ArrowLeft":{
                if (document.activeElement.tagName != "INPUT" && document.activeElement.tagName != "TEXTAREA"){
                    if (debug == false){
                        currentTarget++;
                        if (currentTarget > targetPositions.length - 1){
                            currentTarget = 0;
                        }
                        setTarget(currentTarget);
                    }
                }
            }
            break;
        }
    });
}

let targetPositions = [[-1.2154941222071647,  14.139187120646238, 18.003394663333893],
[-0.22658202409744255, 14.143180192261934, 18.645736783742905],
[-0.5717147326469421, 14.139187120646238, 19.806363582611084],
[-2.1242760157585145,  14.150170218944549,  18.73982948064804]];
let currentTarget = 0;

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});

function setTarget(target){
    currentTarget = target;
    let contents = document.getElementsByClassName("content");
    for (let i = 0; i < contents.length; i++){
        contents[i].style.display = "none";
    }
    let instructions = document.getElementById("instructions");
    let toggleButton = document.getElementById("toggle-content-wrapper");
    instructions.style.display = "none";
    if (showContent == false){
        toggleButton.style.display = "block";
    }

    let thankYou = document.getElementById("thank-you-overlay")
    thankYou.style.display = "none";

    switch(target){
        case 0:{
            toggleButton.style.display = "none";
            instructions.style.display = "block";
        }
        break;

        case 1:{
            let about = document.getElementById("about");
            if (showContent == true){
                about.style.display = "block";
            }
        }
        break;

        case 2:{
            if (sentContact == false){
                let contact = document.getElementById("contact");
                if (showContent == true){
                    contact.style.display = "block";
                }
            }else{
                thankYou.style.display = "block";
            }
        
        }
        break;

        case 3:{
            let featured = document.getElementById("featured");
            if (showContent == true){
                featured.style.display = "block";
            }
        }
        break;
    }
}

function toggleContent(){
    let toggleButton = document.getElementById("toggle-content-wrapper");
    if (showContent == true){
        showContent = false;
        let content = document.getElementsByClassName("content");
        toggleButton.style.display = "block";
        for (let i = 0; i < content.length; i++){
            content[i].style.display = "none";
        }
    }else{
        showContent = true;
        setTarget(currentTarget);
        toggleButton.style.display = "none";
    }
}

function submitContact(){
    let form = document.getElementsByTagName("FORM")[0];
    form.disabled = true;
    let name = document.getElementById("name").value;
    let lastName = document.getElementById("last-name").value;
    let business = document.getElementById("business").value;
    let email = document.getElementById("email").value;
    let phone = document.getElementById("phone").value;
    let message = document.getElementById("information").value;

    let nameError = document.getElementById("name-error");
    let emailError = document.getElementById("email-error");
    let phoneError = document.getElementById("phone-error");
    let messageError = document.getElementById("message-error");

    nameError.innerHTML = "";
    emailError.innerHTML = "";
    phoneError.innerHTML = "";
    messageError.innerHTML = "";

    let formErrors = false;

    if (name == ""){
        nameError.innerHTML = "Name is required.";
        formErrors = true;
    }

    if (phone == ""){
        phoneError.innerHTML = "Phone No. is required.";
        formErrors = true;
    }

    if (email == ""){
        emailError.innerHTML = "Email is required.";
        formErrors = true;
    }else{
        let re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(String(email).toLowerCase()) == false){
            emailError.innerHTML = "That is not a valid email address."
            formErrors = true;
        }
    }

    if (message == ""){
        messageError.innerHTML = "Please specify why you're contacting me."
        formErrors = true;
    }



    if (formErrors == true){
        return;
    }

    $.post("contact.php", {name: name, last_name: lastName, email: email, phone: phone, business: business, message: message}, function(data){
        form.disabled = false;
        console.log("Success");
        console.log(data);
        if (data == 'true'){
            let contactForm = document.getElementById("contact");
            contactForm.style.display = "none";
            let thankYou = document.getElementById("thank-you-overlay");
            thankYou.style.display = "block";
            thankYou.style['animation-name'] = "fadeIn";
            sentContact = true;
        }else{
            alert("Unknown error occured when sending contact form.");
        }
    });
}