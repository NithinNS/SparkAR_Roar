const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Audio = require('Audio');
const TouchGestures = require('TouchGestures');

const values = [
  ['Yes','No','Pain','Doctor','Breathless'],
  ['Thirsty','Scratch','Move','Toilet','Sleepy'],
  ['Entertainment','Outdoor','Wipe','Wash','Massage'],
  ['Wassup?','How are you?','Miss You','Thanks','Bye'],
  ['','','','',''],
  ['','','','',''],
  ['','','','','']
]


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
	}
  
});  
  
  