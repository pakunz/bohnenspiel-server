from bohnenspiel.tests import *

class TestStartController(TestController):

    def test_index(self):
        response = self.app.get(url(controller='start', action='index'))
        # Test response...
