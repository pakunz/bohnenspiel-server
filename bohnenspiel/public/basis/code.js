
	$(document).ready(function(){
      var moves;
	  var moveText = 'init';
	  var moveResult = '-';
	  
	  // init board
	  function init(){
	   	for (i=1; i<=12; i++){
			$('#id'+i).text("6");
	   	}
	   	$('#points1').text("0");
	   	$('#points2').text("0");
		moves = 0;
		addTableRow();
		$('#moveID' + moves).text('-');
		$('#moveText' + moves).text(moveText);
		activateFields();
	  }
	  
	  function addTableRow(){
		  $('table#historyTable tr:first').after('<tr><td id="moveID' + moves +'"></td><td  id="moveText' + moves +'"></td><td  id="moveResult' + moves +'"></td><td  id="moveBoard' + moves +'"></td></tr>');	
	  }
	  	  
	  // activate-deactivate fields, set click handler, check result
	  function activateFields(){
		// detect (next) active player
		if (moves%2 == 0){
			start = 1;
			end = 6;
			$('#status').text('nächster Zug: ' + $('#name1').text());
		} else {
			start = 7;
			end = 12;
			$('#status').text('nächster Zug: ' + $('#name2').text());			
		}
		
		// set click handler
		var p1 = 0, p2 = 0; // points in rows
		var moveBoard1 = '';
	    var moveBoard2 = '';
		for (i = 1; i<=12; i++){
			var value = parseInt($('#id'+i).text());
			i<=6 ? p1+=value : p2+=value;
			
			//table
			if (i <= 6){
				(i % 6 != 0) ? moveBoard1 += value + ';' : moveBoard1 += value;	
			} else {
				(i > 7) ? moveBoard2 = value + ';' + moveBoard2 : moveBoard2 = value;	
			}
			
			if (start<= i && i <= end && value != 0){
				$('#box'+i).addClass('activeField');
				$('#box'+i).removeClass('passiveField');
				$('#box'+i).click(function () {
		      		id = parseInt($(this).attr('id').substring(3));
					deactivateAll();
					selectField(id);
    			});	
			}
		}
		
		// check result, total points
		points1 = parseInt($('#points1').text());	
    	points2 = parseInt($('#points2').text());
		$('#moveResult' + moves).text(points1 + ' : ' + points2);
		$('#moveBoard' + moves).html(moveBoard2 + '<br\>' + moveBoard1);
		var winner = false;

		var player, playerNameX, playerNameY;
		if (p1 == 0 || p2 == 0){
			deactivateAll();
			moves++;
			addTableRow();
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
			
			$('#moveText' + moves).html(playerNameX + ' hat keine Bohnen mehr.<br\>' + playerNameY + ' erhält  ' + (p1+p2) + ' Punkte.');
			$('#moveResult' + moves).text(points1 + ' : ' + points2);
			
			alert('Finish: ' + points1 + ' - ' + points2 + ' (keine Bohnen)');
			
		} else if (points1>36 || points2>36){
			alert('Finish: ' + points1 + ' - ' + points2 + ' (50%)' );
			moves++;
			addTableRow();						
			$('#moveResult' + moves).text(points1 + ' : ' + points2);
			
			if (points1 > points2){
				$('#moveText' + moves).html( $('#name1').text() + ' hat mehr als 50% der Bohnen.');
			} else if (points1 < points2){
				$('#moveText' + moves).html( $('#name2').text() + ' hat mehr als 50% der Bohnen.');				
			}
			
			winner = true;
		}
		if (winner){
			deactivateAll();
			if (points1>points2){
				$('#status').text($('#name1').text() + ' gewinnt.');	
			} else if (points1<points2){
				$('#status').text($('#name2').text() + ' gewinnt.');	
			} else {
				$('#status').text('Unentschieden.');		
			}
			moves++;
			addTableRow();
			$('#moveText' + moves).text('Spiel beendet.');
		}
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
	 
	  function selectField(id){
		var value = parseInt($('#id'+id).text());
		if(value == 0){
			alert('error - disqualified (zero)');
			deactivateAll();
			return;
		}	
		$('#id'+id).text('0');
		moves++;
		addTableRow(); // add row
		
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