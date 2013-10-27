	$(document).ready(function(){
      var moves;
	  var moveText = 'init';
	  var moveResult = '-';
	  var state, updateStateTimer, moveTimer;
	  
	  // init board
	  function init(){
		for (i=1; i<=12; i++){
			$('#id'+i).text("6");
	   	}
	   	$('#points1').text("0");
	   	$('#points2').text("0");
		moves = 0;
		
		//first table row
		addTableRow(moves);	
		$('#moveID' + moves).text('-');
		$('#moveText' + moves).text(moveText);		
		$('#moveResult' + moves).text($('#points1').text() + ' : ' + $('#points1').text());
		$('#moveBoard' + moves).html(getBoardString());
				
		loadNames();	
		state = getStateForStart();
		if (state === 0){
			$('#status').text('Warte auf zweiten Spieler.');
			updateStateTimer = window.setInterval(getStateForStart, 1000);
		} else if (mode === 3) {
			activateFields();
		}
	  }
	  
	 
	  // get state of the game: 0-wait, 1-running, 2-finished
	  function getStateForStart(){			
		  state = parseInt($.ajax({ url: '/api/state/' + gameID, async: false }).responseText);
		  if (state != 0 && moves == 0 && mode != 3){
			  window.clearInterval(updateStateTimer);
			  loadNames();
			  // get all moves
			  getMove(true);
		  }		  
		  return state;
	  }
	  
	  function loadNames(){
		  $.ajax({
				type: 'GET',
				async: false,
				url: '/api/player/' + gameID,						
				dataType: 'json',
				success:	function(data){								
								$('#name1').text(data[0]);
								$('#name2').text(data[1]);
								player = data;
							}
		});
	  }
	  
	  function getMove(all){		 
		  $.ajax({
			  	url: '/api/getmove/' + gameID + '?number=' + (moves+1),
			  	dataType: 'json',
			  	async: false,
			  	success: function(data) {			  		
			  	    var lastMove = parseInt(data[0]);
			  	    var totalMoves = parseInt(data[1]);
			  	    var liveState = parseInt(data[2]);
			  	    if (liveState === 2 && totalMoves === moves){ // first call after finished game			  	    	
			  	    	window.clearInterval(moveTimer);
			  	    	deactivateAll();
			  	    	alert('Game is finished...');
			  	    	$('#status').text($.ajax({ url: '/api/statemsg/' + gameID, async: false }).responseText);
			  	    	return;
			  	    }
			  	    if (all){
			  	    	if (totalMoves > 0 && (moves+1) <= totalMoves){
			  	    		selectFieldSimple(lastMove);
			  	    		checkWinner();
			  	    		getMove(true);
			  	    	} else {
			  	    	  // alert ('activate');	
			  			  activateFields();
			  	    	}
			  	    } else if (lastMove != -1 && 1 <= lastMove && lastMove <= 12){
			  	    	window.clearInterval(moveTimer);
						selectField(lastMove);			
					  }
			  	  }
		  });
	  }
	  
	  function addTableRow(val){
		  $('table#historyTable tr:first').after('<tr><td id="moveID' + val +'"></td><td  id="moveText' + val +'"></td><td  id="moveResult' + val +'"></td><td  id="moveBoard' + val +'"></td></tr>');	
	  }
	  	  
	  // activate-deactivate fields, set click handler, check result
	  function activateFields(){
		deactivateAll();
		
		// detect (next) active player
		var activePlayer;
		if (moves%2 == 0){
			start = 1;
			end = 6;
			$('#status').text('nächster Zug: ' + $('#name1').text());
			activePlayer = $('#name1').text();
		} else {
			start = 7;
			end = 12;
			$('#status').text('nächster Zug: ' + $('#name2').text());
			activePlayer = $('#name2').text();
		}
		
		// set click handler
		for (i = 1; i<=12; i++){
			var value = parseInt($('#id'+i).text());

			if (start<= i && i <= end && value != 0){				
				$('#box'+i).removeClass('passiveField');				
				if (mode === 3 || (mode === 1 && start === 1) || (mode === 2 && start == 7)){
					$('#box'+i).addClass('activeField');
					$('#box'+i).click(function () {
						deactivateAll();
						id = parseInt($(this).attr('id').substring(3));
						// send ajax move
						//timeOut
						if (parseInt($.ajax({ url: '/api/state/' + gameID, async: false }).responseText) === 2){
							$('#status').text($.ajax({ url: '/api/statemsg/' + gameID, async: false }).responseText);
							checkWinner();
							getMove(false);
							return;
						} else {
							$.ajax({ url: '/api/move/' + gameID + '/' + activePlayer +'/' + id, async: false });
						}
						selectField(id);
	    			});
				}					
			}
		}
		
		//load next move // no timeout
		//timeOut - mode 1-3
		if (parseInt($.ajax({ url: '/api/state/' + gameID, async: false }).responseText) === 2){
			$('#status').text($.ajax({ url: '/api/statemsg/' + gameID, async: false }).responseText);
			deactivateAll();
			checkWinner();
			getMove(false);
			return;
		} else if (mode === 0 || (mode === 1 && start === 7) || (mode === 2 && start == 1)){
			moveTimer = window.setInterval(function(){getMove(false);}, 1000);
		}
		
		if (moves != 0){
			checkWinner();
		}
	  }
	  
	  
	  function checkWinner(){
		// check result, total points
		points1 = parseInt($('#points1').text());	
    	points2 = parseInt($('#points2').text());
		$('#moveResult' + moves).text(points1 + ' : ' + points2);
		$('#moveBoard' + moves).html(getBoardString());
		
		boardTotal = getRowTotal();
		var p1 = boardTotal[0], p2 = boardTotal[1];
		var winner = false;
		var moveCopy = moves;
		
		var player, playerNameX, playerNameY;
		if ((p1 == 0 && moves%2 == 0)|| (p2 == 0 && moves%2 == 1)){
			deactivateAll();
			moveCopy++;			
			addTableRow(moveCopy);
			if (p1 == 0){
				player = '#points2';
				playerNameX = $('#name1').text();
				playerNameY = $('#name2').text();
			} else {
				player = '#points1';
				playerNameX = $('#name2').text();
				playerNameY = $('#name1').text();
			}
						
			collectAllPoints(player);
			
			points1 = parseInt($('#points1').text());	
			points2 = parseInt($('#points2').text());	
			winner = true;
			
			$('#moveText' + moveCopy).html(playerNameX + ' hat keine Bohnen mehr.<br\>' + playerNameY + ' erhält  ' + (p1+p2) + ' Punkte.');
			$('#moveResult' + moveCopy).text(points1 + ' : ' + points2);
			
			alert('Finish: ' + points1 + ' - ' + points2 + ' (keine Bohnen)');
			
		}/* else if (points1>36 || points2>36){
			alert('Finish: ' + points1 + ' - ' + points2 + ' (50%)' );
			moveCopy++;
			addTableRow(moveCopy);						
			$('#moveResult' + moveCopy).text(points1 + ' : ' + points2);
			
			if (points1 > points2){
				$('#moveText' + moveCopy).html( $('#name1').text() + ' hat mehr als 50% der Bohnen.');
			} else if (points1 < points2){
				$('#moveText' + moveCopy).html( $('#name2').text() + ' hat mehr als 50% der Bohnen.');				
			}
			
			winner = true;
		}
		*/
		if (winner){
			deactivateAll();
			if (points1>points2){
				$('#status').text($('#name1').text() + ' gewinnt.');	
			} else if (points1<points2){
				$('#status').text($('#name2').text() + ' gewinnt.');	
			} else {
				$('#status').text('Unentschieden.');		
			}
			moveCopy++;
			addTableRow(moveCopy);
			$('#moveText' + moveCopy).text('Spiel beendet.');
		}
	  }
	  
	  function getBoardString(){
		var moveBoard1 = '';
		var moveBoard2 = '';
		for (i = 1; i<=12; i++){
			var value = parseInt($('#id'+i).text());
			if (i <= 6){
				(i % 6 != 0) ? moveBoard1 += value + ';' : moveBoard1 += value;	
			} else {
				(i > 7) ? moveBoard2 = value + ';' + moveBoard2 : moveBoard2 = value;	
			}
		}
		return (moveBoard2 + '<br\>' + moveBoard1)
	  }
	  
	  function getRowTotal(){
		var p1 = 0, p2 = 0; // points in rows
		for (i = 1; i<=12; i++){
		  var value = parseInt($('#id'+i).text());
		  i<=6 ? p1+=value : p2+=value;
		}
		return [p1,p2]
	  }
	  
	  function collectAllPoints(player){
		var points = 0;
		for (j = 1; j<=12; j++){
			tempPoints = parseInt($('#id'+j).text());
			points += tempPoints;						
			$('#id'+j).text('0');
		}
		currentPoints = parseInt($(player).text());	  
		currentPoints+= points;
		$(player).text(currentPoints);
	  }
	  
	  function deactivateAll(){
		for (j = 1; j<=12; j++){
		 	$('#box'+j).removeClass('activeField');
		 	$('#box'+j).addClass('passiveField');				
	     	$('#box'+j).click(false);
		 	$('#box'+j).unbind('click')	
		}
	  }
	 
	  function selectFieldSimple(id){
		var value = parseInt($('#id'+id).text());
		if(value == 0){
			alert('error - disqualified (zero)');
			deactivateAll();
			return;
		}	
		$('#id'+id).text('0');
		moves++;
		addTableRow(moves); // add row
		
		var nameVal;
		moves%2 == 1 ? nameVal = 'name1' : nameVal = 'name2';
		moveText = $('#'+nameVal).text() + ' wählt Feld ' + id + ' (' + value + ')'
		$('#moveID' + moves).text(moves);
		$('#moveText' + moves).text(moveText);
		$('#status').text(moves + '. Zug: ' +  moveText);		
		
		//change values
		var position = id, oldValue, newValue;
		do {
			position == 12 ? position = 1 : position++;
			oldValue = parseInt($('#id'+ position).text());
			newValue = oldValue+1;	
			$('#id'+ position).text(newValue);
			value--;      	
		} while (value > 0);
		
		var points;
		(moves%2 == 1) ? points = '#points1' : points = '#points2';
		//collect points
		while (newValue == 2 || newValue == 4 || newValue == 6){
		    var currentValue = parseInt($('#id'+ position).text());
		    $('#id'+ position).text('0');
			var currentPoints = parseInt($(points).text());
			currentPoints += currentValue;
			$(points).text(currentPoints);
			
			// next Field			
			position == 1 ? position = 12 : position = position-1;
			newValue = parseInt($('#id'+ position).text());  
		} 		
	  }

	  function selectField(id){
			var value = parseInt($('#id'+id).text());
			if(value == 0){
				alert('error - disqualified (zero)');				
				return;
			}
			
			$('#id'+id).text('0');
			
			moves++;
			addTableRow(moves); // add row
			
			var nameVal;
			moves%2 == 1 ? nameVal = 'name1' : nameVal = 'name2';
			moveText = $('#'+nameVal).text() + ' wählt Feld ' + id + ' (' + value + ')'
			$('#moveID' + moves).text(moves);
			$('#moveText' + moves).text(moveText);
			$('#status').text(moves + '. Zug: ' +  moveText);		
			changeValues(id,value);	
	}	  
	  
	 var aTime = 100;
	 // change values
	 function changeValues(position, value){
		setTimeout(function(){
			$('#box'+ position).removeClass('updateField');
			position == 12 ? position = 1 : position++;
			$('#box'+ position).addClass('updateField');
			var oldValue = parseInt($('#id'+ position).text());
			var newValue = oldValue+1;
					
			$('#id'+ position).fadeOut(aTime, function() {
        	$(this).text(newValue).fadeIn(aTime);
    		});
			
			value--;      	
			if (value > 0){
				changeValues(position, value);
      		} else {
				window.setTimeout(
					function(){
						$('#box'+ position).removeClass('updateField');							
						if (/*newValue > 0 || */ newValue == 2 || newValue == 4 || newValue == 6){
							var points;
							(moves%2 == 1) ? points = '#points1' : points = '#points2';
							$('#box'+ position).addClass('pointField');
							collectPoints(position, points);
						} else {
							setTimeout(function(){activateFields();},1000);
						}
					}
				,2*aTime);
			}
   		}, 2*aTime);  
	  }
	  
	  // collect points
	  function collectPoints(position,points){
		  setTimeout(function(){
			  var currentValue = parseInt($('#id'+ position).text());
			  $('#id'+ position).fadeOut(200, function() {
        		$(this).text(0).fadeIn(200, function() {
        			$('#box'+ position).removeClass('pointField');
			  	})
			  });
			  
			  // add points
			  var currentPoints = parseInt($(points).text());
			  currentPoints += currentValue;
			  $(points).fadeOut(250, function() {
        		$(this).text(currentPoints).fadeIn(250);
			  });
			  		  
			  // next Field
			  var position2;
			  position == 1 ? position2 = 12 : position2 = position-1;
			  var newValue = parseInt($('#id'+ position2).text());
			  if (/*newValue > 0 || */ newValue == 2 || newValue == 4 || newValue == 6){
				 $('#box'+ position2).addClass('pointField');
				 collectPoints(position2,points); 
			  } else {
					setTimeout(function(){activateFields();},1000);
			  }
		  }, 500);
	  }
	  
	  init();
	  
	 });