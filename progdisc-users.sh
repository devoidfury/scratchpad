#!/bin/sh
echo 'HTTP/1.0 200 OK'
echo "Content-type:text/html\r\n"
echo '<!doctype html><html><head><title>Programming Discussions - User List</title>'
echo '<link rel="stylesheet" href="scripts.css"></head><body id="user-list">'

ONLINEUSERS="$(who | cut -d' ' -f1) "
USERS="$(members progdisc-dev | tr ' ' "\n" | sort | tr "\n" ' ')"

OUT=''
for user_ in $USERS; do
    OUT="$OUT<a href=\"/~$user_\""
    if [ -z  "${ONLINEUSERS##*$user_*}" ]; then
        OUT="$OUT class=\"online\""
    fi
    OUT="$OUT>~$user_</a><br>\n"
done
echo "<main><h1>Server Users</h1>$OUT</main></body></html>"
