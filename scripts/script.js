
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
var currentMenu = 0;
var first = false;

var t1=0,t2,eyesClosedStatus=false;
var leftEyeClosedT1=0,leftEyeClosedT2;
var rightEyeClosedT1=0,rightEyeClosedT2;

var isAudioPlaying = false;


//Words
const values = [
	['Yes','No','Pain','Doctor','Breathless'],
	['Thirsty','Scratch','Move','Toilet','Sleepy'],
	['Entertainment','Outdoor','Wipe','Wash','Massage'],
	['Wassup?','How are you?','Miss You','Thanks','Bye'],
	['','','','',''],
	['','','','',''],
	['','','','','']
  ]

var currentWordIndex = 0;  

//Keyboard
const timeInMilliseconds = 500;
var flashCursor = false;
var keysRowBgPosition = 0;
var keysOffset = 0;

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
	['_','123','clr'],
	['1','2','3'],
	['4','5','6'],
	['7','8','9'],
	['0','?','!'],
	[',','.','@'],
	[':',';','!'],
	['(',')','$'],
	['%','^','&'],
	['*','-','del'],
	['_','abc','clr'],
	]
	
var typedValue = "";

(async function () {  

	const [home,menuBg0,menuBg1,menuBg2] = await Promise.all([
		Scene.root.findFirst('home'),
		Scene.root.findFirst('menuBg0'),
		Scene.root.findFirst('menuBg1'),
		Scene.root.findFirst('menuBg2')
	]);

	var menuBgs = [menuBg0,menuBg1,menuBg2];

	const [words,A,B,C,D,E,positionValue] = await Promise.all([
		Scene.root.findFirst('words'),
		Scene.root.findFirst('A'),
		Scene.root.findFirst('B'),
		Scene.root.findFirst('C'),
		Scene.root.findFirst('D'),
		Scene.root.findFirst('E'),
		Scene.root.findFirst('positionValue')
	]);

	const [x,y,confirmed,eyesClosed,timeValue,leftEyeClosed,rightEyeClosed] = await Promise.all([
		Patches.outputs.getScalar('x'),
		Patches.outputs.getScalar('y'),
		Patches.outputs.getBoolean('confirmed'),
		Patches.outputs.getBoolean('eyesClosed'),
		Patches.outputs.getScalar('timeValue'),
		Patches.outputs.getBoolean('leftEyeClosed'),
		Patches.outputs.getBoolean('rightEyeClosed')
	]);

	var [keyboard] = await Promise.all([
		Scene.root.findFirst('keyboard')
	]);

	var alphabets = await Promise.all([
		Scene.root.findFirst('A1'),
		Scene.root.findFirst('A2'),
		Scene.root.findFirst('A3'),
		Scene.root.findFirst('A4'),
		Scene.root.findFirst('A5'),
		Scene.root.findFirst('A6'),
		Scene.root.findFirst('A7'),
		Scene.root.findFirst('A8'),
		Scene.root.findFirst('A9'),
		Scene.root.findFirst('A10')
	]);

	var keyboardRows = await Promise.all([
		Scene.root.findFirst('row1'),
		Scene.root.findFirst('row2'),
		Scene.root.findFirst('row3'),
		Scene.root.findFirst('row4'),
		Scene.root.findFirst('row5'),
		Scene.root.findFirst('row6'),
		Scene.root.findFirst('row7'),
		Scene.root.findFirst('row8'),
		Scene.root.findFirst('row9'),
		Scene.root.findFirst('row10')
	]);

	const [keysNumeric,keysAlphabet] = await Promise.all([
		Scene.root.findFirst('keysNumeric'),
		Scene.root.findFirst('keysAlphabet')
	]);

	//Quiz
	const [quiz,question,score,correct,wrong,choice0,choice1,choice2,choiceBg0,choiceBg1,choiceBg2] = await Promise.all([
		Scene.root.findFirst('quiz'),
		Scene.root.findFirst('question'),
		Scene.root.findFirst('score'),
		Scene.root.findFirst('correct'),
		Scene.root.findFirst('wrong'),
		Scene.root.findFirst('choice0'),
		Scene.root.findFirst('choice1'),
		Scene.root.findFirst('choice2'),
		Scene.root.findFirst('choiceBg0'),
		Scene.root.findFirst('choiceBg1'),
		Scene.root.findFirst('choiceBg2')
	]);

	const [playbackController,playbackControllerCorrect,playbackControllerWrong,playbackControllerHome] = await Promise.all([
		Audio.getAudioPlaybackController('playbackController'),
		Audio.getAudioPlaybackController('playbackControllerCorrect'),
		Audio.getAudioPlaybackController('playbackControllerWrong'),
		Audio.getAudioPlaybackController('playbackControllerHome')
	]);


	playbackController.setPlaying(true);
	playbackController.setLooping(false);

	playbackControllerCorrect.setPlaying(true);
	playbackControllerCorrect.setLooping(false);

	playbackControllerWrong.setPlaying(true);
	playbackControllerWrong.setLooping(false);

	playbackControllerHome.setPlaying(true);
	playbackControllerHome.setLooping(false);
  

const userScope = Persistence.userScope;
var data = { question: 0, score: 0 };

var currentQuestion = 0;
var currentScore = 0;

var choiceBgs = [choiceBg0,choiceBg1,choiceBg2]; 
var choiceBgColors = ['choice0Color','choice1Color','choice2Color']; 

var currentChoice = 0;
var confirmedChoice = -1;
 
function populateAlphabets()
{
	for (var i = 0; i <alphabets.length; i++) {
        alphabets[i].text = characters[i][0]+"      "+characters[i][1]+"      "+characters[i][2];
    }
}

function populateNumbers()
{
	for (var i = 0; i <alphabets.length; i++) {
        alphabets[i].text = characters[i+10][0]+"      "+characters[i+10][1]+"      "+characters[i+10][2];
    }
}
 
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
	Patches.inputs.setString('typedValue',typedValue);
 
  } else {
  
	typedValue = typedValue.replace('|','');
	Patches.inputs.setString('typedValue',typedValue);
	
  }
  
  flashCursor = !flashCursor;
   
} 

function checkEyeClosedDuration() {
   
  var currentTimeValue = timeValue.pinLastValue();
   
  if(mode!=0 && eyesClosedStatus && (currentTimeValue - t1)>=2.5) 
  { 
	  keyboard.hidden = true;
	  words.hidden = true;
	  home.hidden = false;	  
	  quiz.hidden = true;	
	  mode = 0;
	  
	  playbackControllerHome.reset();
	  playbackControllerHome.setPlaying(true);
  }   
} 

const intervalTimer = Time.setInterval(flashCursorBegin, timeInMilliseconds);
const blinkTimer = Time.setInterval(checkEyeClosedDuration, 500);

const face = FaceTracking.face(0);

y.monitor().subscribe(function() { 
    
  if(y.pinLastValue()<0)
  { 
	  Patches.inputs.setBoolean('resetY', true);
	  
  }else
  {	  
	  Patches.inputs.setBoolean('resetY', false);
	  
	  A.text = values[y.pinLastValue()][0];
	  B.text = values[y.pinLastValue()][1];
	  C.text = values[y.pinLastValue()][2];
	  D.text = values[y.pinLastValue()][3];
	  E.text = values[y.pinLastValue()][4];
	  
	  var position = (y.pinLastValue()+1)+"/6";
	  positionValue.text = position;
	   
		if(y.pinLastValue()<=3)
		{
			Patches.inputs.setBoolean('smileyVisible', false); 
		}
  }
  
    
  
});
 
 
eyesClosed.monitor().subscribe(function(event) { 

	if(event.newValue)
	{
		  eyesClosedStatus = true;
		  t1 = timeValue.pinLastValue();
		  Patches.inputs.setScalar('blinkTime', 2); 
		  
	}else{
		  eyesClosedStatus = false;
		  t2 = timeValue.pinLastValue();	  
		  Patches.inputs.setScalar('timeElapsed', (t2-t1)); 
		  Patches.inputs.setScalar('blinkTime', (t2-t1)); 
		   
			if((t2-t1)>0.8)
			{
				if((t2-t1)<2.5)
				{				
				  var output  = values[y.pinLastValue()][x.pinLastValue()];
				  Patches.inputs.setString('value', output); 
					
					if(mode==1)
					{
						playbackController.reset();
						playbackController.setPlaying(true);
					}					

				  
				   
					if(y.pinLastValue()>3)
					{
						var exp = y.pinLastValue();
						Patches.inputs.setScalar('currentFrame',(exp-4)*5+ x.pinLastValue());  
						Patches.inputs.setBoolean('smileyVisible', true); 	    			  
					}else
					{
						Patches.inputs.setBoolean('smileyVisible', false); 
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
							populateNumbers();
							keysOffset = 10;
							
						  }else
						  {
							keysAlphabet.hidden = false;
							keysNumeric.hidden = true;  
							populateAlphabets();
							keysOffset = 0;
						  }
						  
						  
					  }else
					  {
						  typedValue = typedValue.replace('|','');
						  typedValue = typedValue+characters[keysOffset+keysRowBgPosition][1];	
						  typedValue = typedValue.replace('_',' ');		  
						  Patches.inputs.setString('typedValue',typedValue);
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
					
					if(currentMenu==menuBgs.length)
					{
						currentMenu = 0;
					}
					
					menuBgs[currentMenu].hidden = false;
					
				}else if(mode==1)
				{
					currentWordIndex++;

					if(currentWordIndex==5)
					{
						currentWordIndex = 0;
					}
					
					Patches.inputs.setScalar('choice2Color', currentWordIndex); 
					
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
		  Patches.inputs.setScalar('leftEyeCloseDuration', 0); 
		  
	}else{
		  
		  leftEyeClosedT2 = timeValue.pinLastValue();	  
		  Patches.inputs.setScalar('leftEyeCloseDuration', (leftEyeClosedT2-leftEyeClosedT1)); 		   
		  
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
				  typedValue = typedValue.replace('_',' ');	
				  Patches.inputs.setString('typedValue',typedValue);
			  }
		  }

	}
  
});    
  
rightEyeClosed.monitor().subscribe(function(event) { 

	if(event.newValue)
	{
		  rightEyeClosedT1 = timeValue.pinLastValue();
		  Patches.inputs.setScalar('rightEyeCloseDuration', 0); 
		  
	}else{
		  
		  rightEyeClosedT2 = timeValue.pinLastValue();	  
		  Patches.inputs.setScalar('rightEyeCloseDuration', (rightEyeClosedT2-rightEyeClosedT1)); 		   
		  
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
				  
				  typedValue = typedValue.replace('_',' ');	
				  Patches.inputs.setString('typedValue',typedValue);
				  
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

			Diagnostics.log("currentMenu : "+currentMenu);
		
		switch(currentMenu)
		{
			case 0 : words.hidden = false;		
			break;
			
			case 1 : keyboard.hidden = false;
			if(keysOffset ==0)
			{
				populateAlphabets();

			}else{
				populateNumbers();
			}
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
	Patches.inputs.setScalar('choice0Color', 0); 
	Patches.inputs.setScalar('choice1Color', 0); 
	Patches.inputs.setScalar('choice2Color', 0); 
	
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
		question.text = "\n\n"+(currentQuestion+1)+") "+allQuestions[currentQuestion].q;
		choice0.text = allQuestions[currentQuestion].c[0];
		choice1.text = allQuestions[currentQuestion].c[1];
		choice2.text = allQuestions[currentQuestion].c[2];
	 
	}).catch(function(error) { 

		Diagnostics.log('Failed to retrieve data, ' + error);
	 
		currentQuestion =  0;
		currentScore =  0;
	  
		score.text = "Score : "+currentScore;		 
		question.text = "\n\n"+(currentQuestion+1)+") "+allQuestions[currentQuestion].q;
		choice0.text = allQuestions[currentQuestion].c[0];
		choice1.text = allQuestions[currentQuestion].c[1];
		choice2.text = allQuestions[currentQuestion].c[2];

	});
	
}

function checkChoice()
{
	for (var i = 0; i <choiceBgColors.length; i++) 
	{
		Patches.inputs.setScalar(choiceBgColors[i], 1); 			
	}
		
	Patches.inputs.setScalar(choiceBgColors[allQuestions[currentQuestion].a], 2); 
		
	if(allQuestions[currentQuestion].a==confirmedChoice)
	{	  
		correct.hidden = false;
		wrong.hidden = true;
		currentScore++;
		score.text = "Score : "+currentScore;		 
		playbackControllerCorrect.reset();
		playbackControllerCorrect.setPlaying(true);
		
	}else{
		
		correct.hidden = true;
		wrong.hidden = false;		
		
		playbackControllerWrong.reset();
		playbackControllerWrong.setPlaying(true);		
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

//TouchGestures.onTap(question).subscribe(function() {
 
	//saveQuizProgress();
	//Diagnostics.log("userScope"+currentQuestion+" "+currentScore);

//});
  
  
var allQuestions = [
{
    q: 'What does the S stand for in the abbreviation SIM, as in SIM card? ',
    c: ['Single', 'Secure', 'Subscriber'],
    a: 2
},
{
    q: 'What is the Zodiac symbol for Gemini?',
    c: ['Twins', 'Fish', 'Scales'],
    a: 0
},
{
    q: 'Which of the following card games revolves around numbers and basic math?',
    c: ['Munchkin', 'Uno', 'Twister'],
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


})();