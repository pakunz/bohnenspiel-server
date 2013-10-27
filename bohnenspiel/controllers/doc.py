import logging
from pylons import request, response, session, tmpl_context as c, url
from pylons.controllers.util import abort, redirect
from bohnenspiel.lib.base import BaseController, render

log = logging.getLogger(__name__)

class DocController(BaseController):

    def index(self):
        ptitle = 'API Documentation'
        page = 'API Documentation'       

        return render('/doc.html', extra_vars={'ptitle': ptitle , 'page':page})