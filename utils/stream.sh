#!/bin/bash

set -e
function cleanup {
    echo "Stopping gstreamer..."
     pkill ffmpeg
}

trap cleanup EXIT

# upstream command
#gst-launch-1.0 -v autovideosrc  bitrate=3000000 keyframe-interval=20 ! video/x-h264, framerate=20/1 ! h264parse ! rtph264pay config-interval=1 pt=96 ! multiudpsink clients=127.0.0.1:8004,127.0.0.1:8005 

ffmpeg  -framerate 15/5 -i /dev/video0 -vf scale=320:240  -vcodec libx264 -y -f h264  -f rtp rtp://127.0.0.1:8004
