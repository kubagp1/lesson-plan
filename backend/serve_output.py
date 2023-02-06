#!/usr/bin/env python3
# encoding: utf-8
"""For use when working on the frontend locally"""

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler


class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header(
            'Cache-Control', 'no-store, no-cache, must-revalidate')
        return super(CORSRequestHandler, self).end_headers()


os.chdir('./output/')
httpd = HTTPServer(('0.0.0.0', 5000), CORSRequestHandler)
httpd.serve_forever()
