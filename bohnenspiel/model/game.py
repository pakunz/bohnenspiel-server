'''
Created on 19.06.2012
Last modified 23.06.2012

@author: Timo Sztyler
'''

from threading import Timer
from state import State

class Game(object):   

    def __init__(self, player1):  
        # initialisiere Spiel
        self.__move = list()                                    # Liste der getaetigten Spielzuege
        self.__board = [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6]     # Spielfeld
        self.__players = [[str(player1), 0], ["", 0]]           # Spielernamen und deren Punktzahl
        self.__timer = Timer(300.0, self.__timeout)              # Zeit bis ein zweiter Spieler das Spiel betreten muss (siehe auch Zeile 109)
        self.__timer.start()
        # initialisiere Spielstatus
        self.__state = State.WAIT                               
        self.__message = "Waiting for another player ..."
    
    def move(self, playerID, fieldID):            
            
        # Pruefe Zug auf seine Gueltigkeit
        code = self.check(playerID)
        if fieldID < 0 or fieldID > 12 or (str(playerID) == str(self.__players[0][0]) and fieldID > 5) or (str(playerID) == str(self.__players[1][0]) and fieldID < 6) or code < -1:   
            self.__timer.cancel()   
            self.__state = State.DONE   # setze neuen Status

            # baue Statusnachricht zusammen
            self.__message = "The Game is over. " + str(playerID) + " has made an invalid move (e.g. 'wrong field' or 'not his/her turn'). The winner is: "
            if str(playerID) == str(self.__players[0][0]):
                self.__message += str(self.__players[1][0]) # Spieler 1
            else:                
                self.__message += str(self.__players[0][0]) # Spieler 2 
                
            return # ungueltiger Zug
        
        cField = self.__board[fieldID]  # Lese Anzahl der Bohnen in Feld 'fieldID'
        self.__board[fieldID] = 0       # Loesche Anzahl der Bohnen in Feld 'fieldID' 
        
        # lege Bohnen in die Loecher
        for i in range(cField):
            self.__board[(fieldID + i + 1) % 12] += 1       
                    
        # sammle Punkte, sofern es welche gibt            
        for i in range(cField, 0, -1):
            if self.__board[(fieldID + i) % 12] != 2 and self.__board[(fieldID + i) % 12] != 4 and self.__board[(fieldID + i) % 12] != 6: # laufe solange ruckwerts bis keine 2,4 oder 6 mehr kommt
                break                
            self.__players[len(self.__move) % 2][1] += self.__board[(fieldID + i) % 12]     # addiere Punkte auf
            self.__board[(fieldID + i) % 12] = 0;                                         # leere Feld       
        
        # Pruefe ob das Spiel vorbei ist (jemand hat mehr als 36 Punkte)
#        if self.__players[0][1] > 36 or self.__players[1][1] > 36:
#            self.__state = State.DONE   # setze neuen Status
#            
#            # baue Statusnachricht zusammen
#            self.__message = "The Game is over. Someone has more then 36 beans. The winner is: "
#            if self.__players[0][1] > 36:
#                self.__message += str(self.__players[0][0]) # Spieler 1
#            else:                
#                self.__message += str(self.__players[1][0]) # Spieler 2
        
        # Speichere Zug  
        self.__move.append([playerID, fieldID])
                
        # Sysout Spielfeld
        print self.__board
        print self.__players
 
        # Pruefe ob Spieler 1 keine Bohnen mehr auf seiner Seite hat    
        for i in range(6):
            if self.__board[i] > 0 or str(playerID) == str(self.__players[0][0]):
                break;
        else:
            for i in range(6, 12):    
                self.__players[1][1] += self.__board[i]
                self.__board[i] = 0;
            self.__state = State.DONE   # setze neuen Status   
                    
        if self.__state != State.DONE:
            # Pruefe ob Spieler 2 keine Bohnen mehr auf seiner Seite hat  
            for i in range(6, 12):
                if self.__board[i] > 0 or str(playerID) == str(self.__players[1][0]):
                    break;
            else:
                for i in range(6):    
                    self.__players[0][1] += self.__board[i]
                    self.__board[i] = 0;
                self.__state = State.DONE   # setze neuen Status
             
        
        if self.__state == State.DONE:
            if self.__players[0][1] != self.__players[1][1]:
                self.__message = "The Game is over. The winner is: " 
                if self.__players[0][1] > self.__players[1][1]:
                    self.__message += str(self.__players[0][0]) # Spieler 1
                else:                
                    self.__message += str(self.__players[1][0]) # Spieler 2
            else:
                self.__message = "The Game is over (draw)."
        
        # Timer
        self.__timer.cancel()
        if  self.__state != State.DONE:
            self.__timer = Timer(300.0, self.__timeout) # Zeit pro Spielzug (siehe auch Zeile 136)
            self.__timer.start()
        
    def check(self, playerID):          
        if self.__state == State.JOIN and len(self.__move) == 0:
            self.__state = State.RUN
            self.__message = "The game is running ..."
            return 0 # Das Spiel darf gestartet werden
        if len(self.__move) == 0 and self.__state == State.RUN and str(playerID) == str(self.__players[0][0]):
            return -1
        if (len(self.__move) > 0 and str(playerID) != str(self.__move[len(self.__move) - 1][0])):
            return self.__move[len(self.__move) - 1][1] + 1  # Spielfeldnummer         
        if self.__state == State.DONE:
            return -2 # Das Spiel ist beendet
        if (len(self.__move) > 0 and str(playerID) == str(self.__move[len(self.__move) - 1][0])) or (len(self.__move) == 0 and str(playerID) == str(self.__players[1][0])):
            return -3 # Du bist nicht an der Reihe   
        if self.__state == State.WAIT:
            return -4 # Spieler 2 fehlt    
   
    def join(self, new_player):
        if(str(self.__players[1][0]) != "" or str(new_player) == str(self.__players[0][0])):
            return 0 # Beitritt fehlgeschlagen
               
        self.__players[1][0] = new_player
        self.__state = State.JOIN
        self.__timer.cancel()
        self.__timer = Timer(300.0, self.__timeout)
        self.__timer.start()
        return 1 # Beitritt erfolgreich
    
    def state(self):
        return self.__state # Status
    
    def state_message(self):
        return self.__message # Status Nachricht
    
    def player_name(self, idx):
        return str(self.__players[idx][0]) # Name des Spielers idx
    
    def scores(self):
        return str(str(self.__players[0][1]) + ' - ' + str(self.__players[1][1])) # aktueller Punktestand
    
    def getmove(self, number):
        if (number <= len(self.__move)):
            return self.__move[number - 1][1] + 1
        else:
            return -1
    def movetotal(self):
        return len(self.__move)
    
    def __timeout(self):
        self.__state = State.DONE   # setze neuen Status
        
        # baue Statusnachricht
        self.__message = "The Game is over. Timeout! The winner is: "
        if len(self.__move) == 0:
            self.__message += self.__players[1][0]
        else:
            self.__message += str(self.__move[len(self.__move) - 1][0])
