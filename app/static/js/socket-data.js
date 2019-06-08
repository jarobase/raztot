$(document).ready(function () {
    var isMoving = false;

    // Connect to the socket server
    var socket = io.connect('https://' + document.domain + ':' + location.port + '/raztot', { timeout: 5000 });

    // Movement keycodes
    const MOVE_LEFT = 37;
    const MOVE_UP = 38;
    const MOVE_RIGHT = 39;
    const MOVE_DOWN = 40;

    socket.emit('poll');

    // Socket commands for issuing pwm values to the servos
    function stopMovement() {
        socket.emit('move', null);
    }

    function startMovement(direction) {
        socket.emit('move', {
            left: direction == MOVE_LEFT ? 1 : 0,
            up: direction == MOVE_UP ? 1 : 0,
            right: direction == MOVE_RIGHT ? 1 : 0,
            down: direction == MOVE_DOWN ? 1 : 0
        });
    }

    // Keyboard controls
    document.onkeydown = function (event) {
        startMovement(event.keyCode);
    }

    document.onkeyup = function (event) {
        stopMovement();
    }

    // Mobile controls
    var sb = document.getElementById('swipe-box');
    var xAxis = {
        downX: 0,
        upX: 0,
        differenceX: 0
    }
    var yAxis = {
        downY: 0,
        upY: 0,
        differenceY: 0
    }

    sb.addEventListener("touchstart", function(e){
        e.preventDefault();
        xAxis.downX = e.touches[0].clientX;
        yAxis.downY = e.touches[0].clientY;
        isMoving = true;
    });

    document.ontouchend = function(e) {
        isMoving = false;
        stopMovement();
    }

    // Check for direction of user's swiping
    sb.addEventListener("touchmove", function(e) {
        e.preventDefault();
        if (!isMoving) {
            return;
        }

        xAxis.upX = e.touches[0].clientX;
        yAxis.upY = e.touches[0].clientY;

        var differenceX;
        var differenceY;

        differenceX = Math.abs(xAxis.downX - xAxis.upX);
        differenceY = Math.abs(yAxis.downY - yAxis.upY);

        // Check for swipe on X axis
        if (differenceX > differenceY) {
            if (xAxis.upX >= (xAxis.downX + 50)) {
                startMovement(MOVE_RIGHT);
            }

            if (xAxis.upX <= (xAxis.downX - 50)) {
                startMovement(MOVE_LEFT);
            }
        } else {
            // Swipe is on Y axis
            if (yAxis.upY >= (yAxis.downY + 30)) {
                startMovement(MOVE_DOWN);
            }
            if (yAxis.upY <= (yAxis.downY - 30)) {
                startMovement(MOVE_UP);
            }
        }
    });

    // Receieve status messages through socket connection
    socket.on('status', function (msg) {
        msg = JSON.parse(msg);

        // Always show main drive state, even if not streaming
        $('#drive-state').html(msg['used'] + ' / ' + msg['total'] +
            ' GB (' + msg['percent'] + '% full)');

        if (parseFloat(msg['percent']) > 75.0) {
            $('#drive-state').removeClass("option-caution");
            $('#drive-state').addClass("option-warning");
        } else if (parseFloat(msg['percent']) > 50.0) {
            $('#drive-state').removeClass("option-warning");
            $('#drive-state').addClass("option-caution");
        }

        if (msg['camera_status']) {
            $("#camera-state").html("Online");
            if (!$("#camera-state").hasClass("inner-disabled")) {
                $("#camera-state").addClass("option-on");
            }
            $("#start-stream").removeClass("disabled");
        } else {
            $("#camera-state").html("Offline");
            $("#camera-state").removeClass("option-on");
            if (!$("#start-stream").hasClass("disabled")) {
                $("#start-stream").addClass("disabled");
            }
        }

        // Show image count
        $('#acq-name').html(msg['acq_size']);
        $('#temperature-status').html(msg['temp']);

        setTimeout(function () {
            socket.emit('poll');
        }, 500);
    });

    $(window).bind('beforeunload', function () {
        socket.disconnect();
    });

});
