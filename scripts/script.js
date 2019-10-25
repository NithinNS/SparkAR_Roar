const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Audio = require('Audio');
const TouchGestures = require('TouchGestures');
const Time = require('Time');
const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');


var mode = 0;
var totalBlinks = 0;

//words

const values = [
  ['Yes','No','Pain','Doctor','Breathless'],
  ['Thirsty','Scratch','Move','Toilet','Sleepy'],
  ['Entertainment','Outdoor','Wipe','Wash','Massage'],
  ['Wassup?','How are you?','Miss You','Thanks','Bye'],
  ['','','','',''],
  ['','','','',''],
  ['','','','','']
]


var words = Scene.root.find('words');
var A = Scene.root.find('A');
var B = Scene.root.find('B');
var C = Scene.root.find('C');
var D = Scene.root.find('D');
var E = Scene.root.find('E');

var positionValue = Scene.root.find('positionValue');

var t1=0,t2;
var leftEyeClosedT1=0,leftEyeClosedT2;
var rightEyeClosedT1=0,rightEyeClosedT2;

var x = Patches.getScalarValue('x');
var y = Patches.getScalarValue('y');
var confirmed = Patches.getBooleanValue('confirmed');

var eyesClosed = Patches.getBooleanValue('eyesClosed');
var timeValue = Patches.getScalarValue('timeValue');
var leftEyeClosed = Patches.getBooleanValue('leftEyeClosed');
var rightEyeClosed = Patches.getBooleanValue('rightEyeClosed');

const playbackController = Audio.getPlaybackController('playbackController');
playbackController.setPlaying(true);
playbackController.setLooping(false);

var isAudioPlaying = false;

//Keyboard
const timeInMilliseconds = 500;
var flashCursor = false;
var keysRowBgPosition = 0;
var keysOffset = 0;
var keyboard = Scene.root.find('keyboard');
var row1 = Scene.root.find('row1');
var row2 = Scene.root.find('row2');
var row3 = Scene.root.find('row3');
var row4 = Scene.root.find('row4');
var row5 = Scene.root.find('row5');
var row6 = Scene.root.find('row6');
var row7 = Scene.root.find('row7');
var row8 = Scene.root.find('row8');
var row9 = Scene.root.find('row9');
var row10 = Scene.root.find('row10');

var keysNumeric = Scene.root.find('keysNumeric');
var keysAlphabet = Scene.root.find('keysAlphabet');

var keyboardRows = [row1,row2,row3,row4,row5,row6,row7,row8,row9,row10]

const characters = [  
['A','B','C'],
['D','E','F'],
['G','H','I'],
['J','K','L'],
['M','N','O'],
['P','Q','R'],
['S','T','U'],
['V','W','X'],
['Y','Z','del'],
[' ','123','clr'],
['1','2','3'],
['4','5','6'],
['7','8','9'],
['0','+','+'],
['+','+','+'],
['+','+','+'],
['+','+','+'],
['+','+','+'],
['+','+','del'],
[' ','abc','clr'],
]

var typedValue = "";
 
function hideAllKeyboardRows()
{
	for (var i = 0; i <keyboardRows.length; i++) {
        keyboardRows[i].hidden = true;
    }
	
	
}

function keyboardNextRow()
{
	hideAllKeyboardRows();
	keysRowBgPosition++;
   
   if(keysRowBgPosition==10)
   {
		keysRowBgPosition = 0;		
   }
   
   keyboardRows[keysRowBgPosition].hidden = false;
    
    
}

function keyboardPreviousRow()
{
	hideAllKeyboardRows();
	keysRowBgPosition--;
   
   if(keysRowBgPosition==-1)
   {
		keysRowBgPosition = 9;		
   }
   
   keyboardRows[keysRowBgPosition].hidden = false;
     
}

function flashCursorBegin() {
  
 
  if(!flashCursor) {
	  
	typedValue = typedValue + "|";
	Patches.setStringValue('typedValue',typedValue);
 
  } else {
  
	typedValue = typedValue.replace('|','');
	Patches.setStringValue('typedValue',typedValue);
	
  }
  
  flashCursor = !flashCursor;
   
} 

function checkBlinks() {
   
  if(totalBlinks>2)
  {
	  
	  keyboard.hidden = true;
	  words.hidden = true;
	  
  }else{
	  
	  
  }
  
  totalBlinks = 0;
  
} 

const intervalTimer = Time.setInterval(flashCursorBegin, timeInMilliseconds);
const blinkTimer = Time.setInterval(checkBlinks, 800);

const face = FaceTracking.face(0);

y.monitor().subscribe(function() { 
    
  if(y.pinLastValue()<0)
  { 
	  Patches.setBooleanValue('resetY', true);
	  
  }else
  {	  
	  Patches.setBooleanValue('resetY', false);
	  
	  A.text = values[y.pinLastValue()][0];
	  B.text = values[y.pinLastValue()][1];
	  C.text = values[y.pinLastValue()][2];
	  D.text = values[y.pinLastValue()][3];
	  E.text = values[y.pinLastValue()][4];
	  
	  var position = (y.pinLastValue()+1)+"/6";
	  positionValue.text = position;
	   
		if(y.pinLastValue()<=3)
		{
			Patches.setBooleanValue('smileyVisible', false); 
		}
  }
  
    
  
});
 
 
eyesClosed.monitor().subscribe(function(event) { 

	if(event.newValue)
	{
		  t1 = timeValue.pinLastValue();
		  Patches.setScalarValue('blinkTime', 2); 
		  
	}else{
		  
		  t2 = timeValue.pinLastValue();	  
		  Patches.setScalarValue('timeElapsed', (t2-t1)); 
		  Patches.setScalarValue('blinkTime', (t2-t1)); 
		  
		  
			if((t2-t1)>0.8)
			{
				
			  var output  = values[y.pinLastValue()][x.pinLastValue()];
			  Patches.setStringValue('value', output); 
			  			    
			  playbackController.reset();
			  playbackController.setPlaying(true);
			   
				if(y.pinLastValue()>3)
				{
					var exp = y.pinLastValue();
					Patches.setScalarValue('currentFrame',(exp-4)*5+ x.pinLastValue());  
					Patches.setBooleanValue('smileyVisible', true); 	    			  
				}else
				{
					Patches.setBooleanValue('smileyVisible', false); 
				}
			
			  			  
			  if(keysRowBgPosition==9 || keysRowBgPosition-keysOffset==9)
			  {
				  if(keysOffset==0)
				  {
					keysAlphabet.hidden = true;
					keysNumeric.hidden = false;  
					keysOffset = 10;
					
				  }else
				  {
					keysAlphabet.hidden = false;
					keysNumeric.hidden = true;  
					keysOffset = 0;
				  }
				  
				  
			  }else
			  {
				  typedValue = typedValue.replace('|','');
				  typedValue = typedValue+characters[keysOffset+keysRowBgPosition][1];			  
				  Patches.setStringValue('typedValue',typedValue);
			  }
			   
			} 	
	}
  
  
});

leftEyeClosed.monitor().subscribe(function(event) { 

	if(event.newValue)
	{
		  leftEyeClosedT1 = timeValue.pinLastValue();
		  Patches.setScalarValue('leftEyeCloseDuration', 0); 
		  
	}else{
		  
		  leftEyeClosedT2 = timeValue.pinLastValue();	  
		  Patches.setScalarValue('leftEyeCloseDuration', (leftEyeClosedT2-leftEyeClosedT1)); 		   
		  
		  Diagnostics.log('duration'+(leftEyeClosedT2-leftEyeClosedT1));
		  
		  if((leftEyeClosedT2-leftEyeClosedT1)<0.5)
		  {
			keyboardPreviousRow();
			
		  }else 
		  {
			  typedValue = typedValue.replace('|','');
			  
			  typedValue = typedValue+characters[keysOffset+keysRowBgPosition][0];
			  
			  Patches.setStringValue('typedValue',typedValue);
		  }

	}
  
});    
  
rightEyeClosed.monitor().subscribe(function(event) { 

	if(event.newValue)
	{
		  rightEyeClosedT1 = timeValue.pinLastValue();
		  Patches.setScalarValue('rightEyeCloseDuration', 0); 
		  
	}else{
		  
		  rightEyeClosedT2 = timeValue.pinLastValue();	  
		  Patches.setScalarValue('rightEyeCloseDuration', (rightEyeClosedT2-rightEyeClosedT1)); 		   
		  
		  
		  
		  if((rightEyeClosedT2-rightEyeClosedT1)<0.5)
		  {
			keyboardNextRow();
			
		  }else
		  {
			  typedValue = typedValue.replace('|','');
			  
			  if(keysRowBgPosition==8 || keysRowBgPosition-keysOffset==8)
			  {
				  typedValue = typedValue.slice(0, -1);
				  typedValue = typedValue;
				  
			  }else if(keysRowBgPosition==9 || keysRowBgPosition-keysOffset==9)
			  {
				  typedValue = "";				  
				  
			  }else
			  {
				  typedValue = typedValue+characters[keysOffset+keysRowBgPosition][2];
			  }
			   
			  Patches.setStringValue('typedValue',typedValue);
			  
		  }
		  
	}
  
});  


FaceGestures.onBlink(face).subscribe(function() {

	totalBlinks++;
	 
});
  
  