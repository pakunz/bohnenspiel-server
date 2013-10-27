import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons import app_globals

from pylons.controllers.util import abort, redirect

from pylons import url

import bohnenspiel.lib.helpers as h

from bohnenspiel.lib.base import BaseController, render
from bohnenspiel.model.game import Game
from bohnenspiel.model.state import State

log = logging.getLogger(__name__)

class StartController(BaseController):

    def index(self):
        redirect(url(controller='start', action='games'))
    
    def games(self):
        openGames = list()
        runningGames = list()
        finishedGames = list()
        
        #openGames.append(['id', 'player1', 'player2', '36:36'])
        #runningGames.append(['id', 'player1', 'player2', '36:36'])
        #finishedGames.append(['99', 'player1', 'player2', '36:36'])
        
        for idx, val in enumerate(app_globals.games):
            if val.state() == State.WAIT :            
               openGames.append([str(idx), val.player_name(0), val.player_name(1), val.scores()])
            elif val.state()  == State.RUN or val.state() == State.JOIN:
               runningGames.append([str(idx), val.player_name(0), val.player_name(1), val.scores()])
            elif val.state()  == State.DONE:
               finishedGames.append([str(idx), val.player_name(0), val.player_name(1), val.scores()])
                
        #return str(len(app_globals.games))                                          # Anzahl der Spiele
        #return render('/name.html') #, extra_vars={'ptitle': ptitle , 'page':page, 'systems': systems})
        return render('/portal.html', extra_vars={'openGames': openGames , 'runningGames':runningGames, 'finishedGames': finishedGames}) 
        
    def startgame(self):
        stateText = 'Neues Spiel erstellen.'
        return render('/name.html', extra_vars={'stateText': stateText, 'mode': 0}) 
    
    def enter(self, id):
        stateText = 'Spiel ' + str(id) + ' betreten.'
        return render('/name.html', extra_vars={'stateText': stateText,  'mode': 1, 'id' : id}) 
    
    #mode: 0 (zuschauen), 1 (Spieler1) , 2 (Spieler 2), 3 (beide Spieler)
    def show(self, id):
        return render('/game.html', extra_vars={'id': id, 'mode': 0})

    def p1(self, id): 
        return render('/game.html', extra_vars={'id': id, 'mode': 1})

    def p2(self, id): 
        return render('/game.html', extra_vars={'id': id, 'mode': 2})    
        
    def play(self, id): 
        return render('/game.html', extra_vars={'id': id, 'mode': 3})
    