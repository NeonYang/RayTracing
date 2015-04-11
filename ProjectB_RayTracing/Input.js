/**
 * Created by NeonYoung on 14-2-21.
 */
var Input={
    KeyCode:["KeyBackSpace",//keycode 8
        "Tab",
        "",
        "",
        "",
        "KeyEnter",
        "",
        "",
        "Shift_L",
        "Control_L",
        "Alt_L",
        "Pause",
        "Caps_Lock",
        "",
            "",
            "",
            "",
            "",
            "",
         "Escape",
         "",
            "",
            "",
            "",
        "KeySpace",
        "Prior" ,
        "Next" ,
        "End" ,
        "Home" ,
        "KeyLeft",
        "KeyUp" ,
        "KeyRight" ,
        "KeyDown" ,
        "Select" ,
        "Print" ,
        "Execute" ,
        "",
        "Insert" ,
        "Delete" ,
        "Help" ,
        "KeyN0",
        "KeyN1",
        "KeyN2",
        "KeyN3" ,
        "KeyN4",
        "KeyN5" ,
        "KeyN6" ,
        "KeyN7" ,
        "KeyN8" ,
        "KeyN9",
        "",
            "",
            "",
            "",
            "",
            "",
            "",
        "KeyA" ,
        "KeyB",
        "KeyC",
        "KeyD",
        "KeyE",
        "KeyF",
        "KeyG",
        "KeyH" ,
        "KeyI" ,
        "KeyJ",
        "KeyK" ,
        "KeyL" ,
        "KeyM" ,
        "KeyN",
        "KeyO" ,
        "KeyP",
        "KeyQ" ,
        "KeyR",
        "KeyS",
        "KeyT" ,
        "KeyU" ,
        "KeyV",
        "KeyW" ,
        "KeyX" ,
        "KeyY" ,
        "KeyZ" ,//90
        "",
            "",
            "",
            "",
            "",
        "KeyNum0" ,//96
        "KeyNum1" ,
        "KeyNum2",
        "KeyNum3" ,
        "KeyNum4" ,
        "KeyNum5" ,
        "KeyNum6" ,
        "KeyNum7" ,
        "KeyNum8" ,
        "KeyNum9",
        "KeyNumMul",
        "KeyNumPlus",
        "KeyNumSep",
        "KeyNumMinus",
        "KeyNumDot",
        "KeyNumDivd" ],//keycode 111
    KeyA:0,
    KeyB:0,
    KeyC:0,
    KeyD:0,
    KeyE:0,
    KeyF:0,
    KeyG:0,
    KeyH:0,
    KeyI:0,
    KeyJ:0,
    KeyK:0,
    KeyL:0,
    KeyM:0,
    KeyN:0,
    KeyO:0,
    KeyP:0,
    KeyQ:0,
    KeyR:0,
    KeyS:0,
    KeyT:0,
    KeyU:0,
    KeyV:0,
    KeyW:0,
    KeyX:0,
    KeyY:0,
    KeyZ:0,
    KeyN0:0,
    KeyN1:0,
    KeyN2:0,
    KeyN3:0,
    KeyN4:0,
    KeyN5:0,
    KeyN6:0,
    KeyN7:0,
    KeyN8:0,
    KeyN9:0,
    KeyNum1:0,
    KeyNum2:0,
    KeyNum3:0,
    KeyNum4:0,
    KeyNum5:0,
    KeyNum6:0,
    KeyNum7:0,
    KeyNum8:0,
    KeyNum9:0,
    KeyNum0:0,
    KeyNumPlus:0,
    KeyNumMinus:0,
    KeyUp:0,
    KeyDown:0,
    KeyLeft:0,
    KeyRight:0,
    KeySpace:0,
    KeyBackSpace:0,
    KeyEnter:0,
    //KeyPlus:0,
   // KeyMinus:0,
    MouseWheelDelta: 0,
    MouseDeltaX:0,
    MouseDeltaY:0,

    Init:function(){
        document.onkeydown=function(ev){onKeyDown(ev)};//document is a variable
        document.onkeyup=function(ev){onKeyUp(ev)};//document is a variable
        document.onmousewheel=function(ev){mouseWheel(ev)};
        document.addEventListener('mousemove',function(ev){onMouseMove(ev)},false);
         MouseDeltaX=0;
         MouseDeltaY=0;
    }
/*    OnKeyDown:function(inputV)
    {
        if(ev.)return inputV;
    }*/
}

var M_LastPositionX=0;
var M_LastPositionY=0;
function onMouseMove(ev)
{
  //  var X=ev.clientX;

    Input.MouseDeltaX = ev.clientX-M_LastPositionX;
    Input.MouseDeltaX=Math.abs(Input.MouseDeltaX)<5?0:Input.MouseDeltaX;
    Input.MouseDeltaY = ev.clientY-M_LastPositionY;
    Input.MouseDeltaY=Math.abs(Input.MouseDeltaY)<5?0:Input.MouseDeltaY;
    M_LastPositionX = ev.clientX;
    M_LastPositionY = ev.clientY;
   // document.getElementById('dx').innerHTML =  Input.MouseDeltaX;
   // document.getElementById('dy').innerHTML =  Input.MouseDeltaY;
}

function onKeyDown(ev){
   // alert(ev.keyCode);
   //str = String.fromCharCode(ev.keyCode);
   // Input[]=1;//
    Input[Input.KeyCode[ev.keyCode-8]]=1;
 }
function onKeyUp(ev){
    Input[Input.KeyCode[ev.keyCode-8]]=0;
}
function mouseWheel(ev){
    Input.MouseWheelDelta = ev.wheelDelta;

}
