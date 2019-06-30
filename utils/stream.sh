#!/bin/bash

set -e
function cleanup {
    echo "Stopping gstreamer..."
    sudo pkill gst-launch-1.0
}

trap cleanup EXIT

# upstream command
#gst-launch-1.0 -v autovideosrc  bitrate=3000000 keyframe-interval=20 ! video/x-h264, framerate=20/1 ! h264parse ! rtph264pay config-interval=1 pt=96 ! multiudpsink clients=127.0.0.1:8004,127.0.0.1:8005 

# this one is working but too large packets
# gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! ximagesink

gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! 'video/x-raw, width=320, height=240, framerate=30/1' ! rndbuffersize max=1316 min=1316 ! multiudpsink clients=127.0.0.1:8004,127.0.0.1:8005
