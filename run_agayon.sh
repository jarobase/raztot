#!/bin/bash

USAGE=$(cat <<-END
 
    Usage: source run.sh [remote|local] [server] (flags)
    Arguments:
        - remote : Launches the flask app on 0.0.0.0 (public)
        - local  : Launches the flask app on 127.0.0.1 (for use with the included nginx configuration)
        - server  : Launches the python server
    Flags:
        --skip-janus : Skips launching Janus Gateway
                       Note: For debugging only (Janus Gateway is required for video streaming)
 
END
)

if [[ $# -eq 0 ]]; then
    echo -e "$USAGE"
    return
fi

#export RANDOM_KEY=`head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 ; echo ''`
export RANDOM_KEY=j2aGY2DVFeRVTSDUuvyDoO2Bziaz3cyy
NETWORK_IP=(`hostname -i`)

#if ! pgrep -x "pigpiod" > /dev/null
#then
#    echo "Starting pigpiod..."
#    sudo pigpiod
#fi

if [[ "$VIRTUAL_ENV" == "" ]]; then
    source venv/bin/activate
fi

# Start flask server either on local network or public
if [[ $1 == "local" ]]; then
    export FLASK_HOST="127.0.0.1"
elif [[ $1 == "remote" ]]; then
    export FLASK_HOST="0.0.0.0"
else
    echo -e "$USAGE"
    return
fi

# Start (or skip) janus gateway for streaming
if [[ $* == *--skip-janus* ]]; then
    echo -e "Skipping Janus..."
else
    pkill janus
    sleep 0.5
    echo "Using api key: $RANDOM_KEY"
    /usr/bin/janus -a $RANDOM_KEY &
fi

if [[ $2 == "server" ]]; then
python server.py
fi
