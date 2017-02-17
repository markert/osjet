This nodejs module can connect to a jet daemon or run its own daemon. It adds all system states from the nodejs os functions and the diskspace.

Usage:

npm install
node osjet.js

options:

'port': jetport
'addr': jetaddress
'nojet': do not start own jet daemon
'initpath': path at jet daemon
'updateinterval': update interval for changeable values
