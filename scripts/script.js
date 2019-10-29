
const Persistence = require('Persistence');
const Diagnostics = require('Diagnostics');
const Scene = require('Scene');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Audio = require('Audio');
const TouchGestures = require('TouchGestures');
const Time = require('Time');
const FaceGestures = require('FaceGestures');
const FaceTracking = require('FaceTracking');


//Home
var mode = 0;
var home = Scene.root.find('home');
var currentMenu = 0;
var menuBg0 = Scene.root.find('menuBg0');
var menuBg1 = Scene.root.find('menuBg1');
var menuBg2 = Scene.root.find('menuBg2');
var menuBgs = [menuBg0,menuBg1,menuBg2];
var first = true;

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

var t1=0,t2,eyesClosedStatus=false;
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


//Quiz
var quiz = Scene.root.find('quiz');

var question = Scene.root.find('question');
var score = Scene.root.find('score');
var correct = Scene.root.find('correct');
var wrong = Scene.root.find('wrong');

var choice0 = Scene.root.find('choice0');
var choice1 = Scene.root.find('choice1');
var choice2 = Scene.root.find('choice2');

var choiceBg0 = Scene.root.find('choiceBg0');
var choiceBg1 = Scene.root.find('choiceBg1');
var choiceBg2 = Scene.root.find('choiceBg2');

const userScope = Persistence.userScope;
var data = { question: 0, score: 0 };

var currentQuestion = 0;
var currentScore = 0;

var choiceBgs = [choiceBg0,choiceBg1,choiceBg2]; 
var choiceBgColors = ['choice0Color','choice1Color','choice2Color']; 

var currentChoice = 0;
var confirmedChoice = -1;
 
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

function checkEyeClosedDuration() {
   
  var currentTimeValue = timeValue.pinLastValue();
   
  if(mode!=0 && eyesClosedStatus && (currentTimeValue - t1)>=2.5) 
  {
	  playbackController.reset();
	  playbackController.setPlaying(true);
	  keyboard.hidden = true;
	  words.hidden = true;
	  home.hidden = false;	  
	  quiz.hidden = true;	
	  mode = 0;
  }   
} 

const intervalTimer = Time.setInterval(flashCursorBegin, timeInMilliseconds);
const blinkTimer = Time.setInterval(checkEyeClosedDuration, 500);

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
		  eyesClosedStatus = true;
		  t1 = timeValue.pinLastValue();
		  Patches.setScalarValue('blinkTime', 2); 
		  
	}else{
		
		  eyesClosedStatus = false;
		  t2 = timeValue.pinLastValue();	  
		  Patches.setScalarValue('timeElapsed', (t2-t1)); 
		  Patches.setScalarValue('blinkTime', (t2-t1)); 
		   
			if((t2-t1)>0.8)
			{
				if((t2-t1)<2.5)
				{					
				  var output  = values[y.pinLastValue()][x.pinLastValue()];
				  Patches.setStringValue('value', output); 
					
					if(mode==1)
					{
						playbackController.reset();
						playbackController.setPlaying(true);
					}					

				  
				   
					if(y.pinLastValue()>3)
					{
						var exp = y.pinLastValue();
						Patches.setScalarValue('currentFrame',(exp-4)*5+ x.pinLastValue());  
						Patches.setBooleanValue('smileyVisible', true); 	    			  
					}else
					{
						Patches.setBooleanValue('smileyVisible', false); 
					}
				
							  
				  if(mode==0)
				  {
					 switchUI();
					  
				  }else if(mode==2)
				  {
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
					  
				  }else if(mode==3)
				  { 
					if(confirmedChoice==-1)
					{
						confirmedChoice = currentChoice;
						checkChoice();
						
					}else
					{
						confirmedChoice=-1;
						resetQuizUi();
						displayNextQuestion();					
						 
					}
					
						
				  }
				  
				}
			   
			}else 	
			{
				if(mode==0)
				{
					for (var i = 0; i <menuBgs.length; i++) {
						menuBgs[i].hidden = true;
					}
					
					currentMenu++;
					
					if(currentMenu==3)
					{
						currentMenu = 0;
					}
					
					menuBgs[currentMenu].hidden = false;
					
				}else if(mode==3 && confirmedChoice==-1)
				{
					for (var i = 0; i <choiceBgs.length; i++) {
						choiceBgs[i].hidden = true;
					}
					
					currentChoice++;
					
					if(currentChoice==3)
					{
						currentChoice = 0;
					}
					
					choiceBgs[currentChoice].hidden = false;
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
		  
		  if(mode==2)
		  {
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
		  
		  if(mode==2)
		  {		  
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
		  
	}
  
});  


function switchUI()
{
	if(!first)
	{
		keyboard.hidden = true;
		words.hidden = true;
		home.hidden = true;	 
		quiz.hidden = true;	 
		
		mode = currentMenu+1;
		
		switch(currentMenu)
		{
			case 0 : words.hidden = false;		
			break;
			
			case 1 : keyboard.hidden = false;
			break;
			
			case 2 : quiz.hidden = false;
			resetQuizUi();
			displayNextQuestion();			
			break;
				
		}
	}
	
	first = false;
	
}

FaceGestures.onBlink(face).subscribe(function() {

	
	 
});
  

function resetQuizUi()
{
	Patches.setScalarValue('choice0Color', 0); 
	Patches.setScalarValue('choice1Color', 0); 
	Patches.setScalarValue('choice2Color', 0); 
	
	correct.hidden = true;
	wrong.hidden = true;
	
	choiceBg0.hidden = false;
	choiceBg1.hidden = true;
	choiceBg2.hidden = true;	
}

function displayNextQuestion()
{ 
	userScope.get('data').then(function(result) {
 
		currentQuestion =  result.question;
		currentScore =  result.score;
	  
		score.text = "Score : "+currentScore;		 
		question.text = (currentQuestion+1)+") "+allQuestions[currentQuestion].q;
		choice0.text = allQuestions[currentQuestion].c[0];
		choice1.text = allQuestions[currentQuestion].c[1];
		choice2.text = allQuestions[currentQuestion].c[2];
	 
	}).catch(function(error) { 

		Diagnostics.log('Failed to retrieve data, ' + error);
	 
		currentQuestion =  0;
		currentScore =  0;
	  
		score.text = "Score : "+currentScore;		 
		question.text = (currentQuestion+1)+") "+allQuestions[currentQuestion].q;
		choice0.text = allQuestions[currentQuestion].c[0];
		choice1.text = allQuestions[currentQuestion].c[1];
		choice2.text = allQuestions[currentQuestion].c[2];

	});
	
}

function checkChoice()
{
	for (var i = 0; i <choiceBgColors.length; i++) 
	{
		Patches.setScalarValue(choiceBgColors[i], 1); 			
	}
		
	Patches.setScalarValue(choiceBgColors[allQuestions[currentQuestion].a], 2); 
		
	if(allQuestions[currentQuestion].a==confirmedChoice)
	{	  
		correct.hidden = false;
		wrong.hidden = true;
		currentScore++;
		score.text = "Score : "+currentScore;		 
		//play sound
		
	}else{
		
		correct.hidden = true;
		wrong.hidden = false;		
		
		//play sound
	}
	
	currentQuestion++;
	saveQuizProgress();
	
}

function saveQuizProgress()
{
	data.question = currentQuestion;
	data.score = currentScore;
	 
	userScope.set('data',data).then(function(result) {
		
		Diagnostics.log("userScope saved");
   
  }).catch(function(error) {
  

  });
}

TouchGestures.onTap(question).subscribe(function() {
 
	//saveQuizProgress();
	Diagnostics.log("userScope"+currentQuestion+" "+currentScore);

});
  
  
var allQuestions = [
{
    q: '1What is the capital city of Australia?',
    c: ['Sydney', 'Melbourne', 'Canberra'],
    a: 2
},
{
    q: '2Who won the 2014 FIFA World Cup?',
    c: ['Brazil', 'England', 'Germany'],
    a: 2
},
{
    q: '3What book series is authored by J.K Rowling?',
    c: ['Game of Thrones', 'Hunger Games', 'Twilight'],
    a: 1
},
{
    q: '4At which bridge does the annual Oxford and Cambridge boat race start?',
    c: ['Sydney', 'Melbourne', 'Canberra'],
    a: 2
},{
    q: '5What book series is authored by J.K Rowling?',
    c: ['Game of Thrones', 'Hunger Games', 'Twilight'],
    a: 0
},
{
    q: '11What is the capital city of Australia?',
    c: ['Sydney', 'Melbourne', 'Canberra'],
    a: 2
},
{
    q: '22Who won the 2014 FIFA World Cup?',
    c: ['Brazil', 'England', 'Germany'],
    a: 2
},
{
    q: '33What book series is authored by J.K Rowling?',
    c: ['Game of Thrones', 'Hunger Games', 'Twilight'],
    a: 1
},
{
    q: '44At which bridge does the annual Oxford and Cambridge boat race start?',
    c: ['Sydney', 'Melbourne', 'Canberra'],
    a: 2
},
{
    q: '55What book series is authored by J.K Rowling?',
    c: ['Game of Thrones', 'Hunger Games', 'Twilight'],
    a: 0
}];


