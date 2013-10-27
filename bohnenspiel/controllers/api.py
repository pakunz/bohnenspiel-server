import logging

from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect
from pylons import app_globals

import simplejson as json

from bohnenspiel.lib.base import BaseController, render

from bohnenspiel.model.game import Game
from bohnenspiel.model.state import State

log = logging.getLogger(__name__)

class ApiController(BaseController):

    def opengames(self):
        og = ''
        for idx, val in enumerate(app_globals.games):
            if val.state() == State.WAIT :
               og += str(idx) + ';'
        if len(og) > 0:
            return og[:-1]
        else: 
            return og
    
    def creategame(self, id): # id = playerName
        app_globals.games.append(Game(str(id)))
        return str(len(app_globals.games)-1)                                        # ID des erstellten neuen Spiels (Listenposition)
    
    def joingame(self, id, playerName = ''):
        return str((app_globals.games[int(id)]).join(str(playerName)))              # 0 = Fehler beim Beitreten, 1 = Erfolgreich Beigetreten
    
    def check(self, id, playerName):
        return str((app_globals.games[int(id)]).check(str(playerName)))             # 0: Das Spiel darf gestartet werden, -1: Du bist an der Reihe , -2: Das Spiel ist beendet, -3: Du bist nicht an der Reihe, -4: Spieler 2 fehlt
    
    def move(self, id, playerName, fieldID):
        (app_globals.games[int(id)]).move(str(playerName), int(int(fieldID)-1))     # nichts
        return ""
    
    def statemsg(self, id):
        return str((app_globals.games[int(id)]).state_message())
    
    def state(self, id):
        val = app_globals.games[int(id)]
        if val.state() == State.WAIT :            
           return str(0)
        elif val.state()  == State.RUN or val.state() == State.JOIN:
           return str(1)
        elif val.state()  == State.DONE:
           return str(2)
    
    def player(self, id):
        g = app_globals.games[int(id)]
        return json.dumps([g.player_name(0),g.player_name(1)])
    
    def getmove(self, id): # move or -1
        if (len(app_globals.games) < int(id)):
            return 'id does not exist ' +  str(len(app_globals.games))       
        if ('number' in request.params):
            number = app_globals.games[int(id)].getmove(int(request.params['number']))
            total = app_globals.games[int(id)].movetotal()
            return json.dumps([number, total, int(self.state(id))])        
        else:
            return 'error: not field selected'