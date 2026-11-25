configureLogging();

// Update all of the corresonding fields when switching protocol or playback mode
$('#protocol').change(function() {
    updateFieldsCorrespondingToStreamingProtocol();
});
$('#playbackMode').change(function() {
    updateFieldsCorrespondingToPlaybackMode();
});

// Read/Write all of the fields to/from localStorage so that fields are not lost on refresh.
[
    'protocol',
    'player',
    'region',
    'accessKeyId',
    'secretAccessKey',
    'sessionToken',
    'endpoint',
    'streamName',
    'playbackMode',
    'discontinuityMode',
    'displayFragmentTimestamp',
    'displayFragmentNumber',
    'startTimestamp',
    'endTimestamp',
    'fragmentSelectorType',
    'maxResults',
    'expires'
].forEach(function(field) {
    var id = "#" + field;

    // Read field from localStorage
    try {
        var localStorageValue = localStorage.getItem(field);
        if (localStorageValue) { 
            $(id).val(localStorageValue);
            $(id).trigger('change');
        }
    } catch (e) { /* Don't use localStorage */ }

    // Write field to localstorage on change event
    $(id).change(function() {
        try {
            localStorage.setItem(field, $(id).val());
        } catch (e) { /* Don't use localStorage */ }
    });
});

function selectHasValue(select, value) {
    for (var i = 0; i < select.options.length; i++) {
        if (select.options[i].value === value) { return true; }
    }
    return false;
}

function applyQueryParameters() {
    if (typeof URLSearchParams === 'undefined') { return; }

    var parameters;
    try {
        parameters = new URLSearchParams(window.location.search);
    } catch (e) {
        return;
    }

    // Apply only explicitly allowlisted, non-secret URL parameters. Never add credentials or
    // endpoint: URLs can be retained in browser history, copied, or logged.
    // Protocol must be applied before player because changing protocol rebuilds the player options.
    ['protocol', 'player', 'region', 'playbackMode'].forEach(function(field) {
        var value = parameters.get(field);
        var select = document.getElementById(field);
        if (value !== null && select && select.options && selectHasValue(select, value)) {
            $(select).val(value);
            $(select).trigger('change');
        }
    });

    var streamName = parameters.get('streamName');
    if (streamName !== null && /^[a-zA-Z0-9_.-]{1,256}$/.test(streamName)) {
        $('#streamName').val(streamName);
        $('#streamName').trigger('change');
    }
}

// Initially hide the player elements
$('.player').hide();

function configureLogging() {
    console._error = console.error;
    console.error = function(messages) {
        log('ERROR', Array.prototype.slice.call(arguments));
        console._error.apply(this, arguments);
    }

    console._log = console.log;
    console.log = function(messages) {
        log('INFO', Array.prototype.slice.call(arguments));
        console._log.apply(this, arguments);
    }

    function log(level, messages) {
        var text = '';
        for (message of messages) {
            if (typeof message === 'object') { message = JSON.stringify(message, null, 2); }
            text += ' ' + message;
        }
        $('#logs').append($('<div>').text('[' + level + ']' + text + '\n'));
    }
}

function updateFieldsCorrespondingToStreamingProtocol() {
    var isDASH = $('#protocol').val() === 'DASH';
    $('#containerFormat').prop('disabled', isDASH);
    $('#discontinuityMode').prop('disabled', isDASH);  
    $('#displayFragmentNumber').prop('disabled', !isDASH); 

    var players = isDASH ? DASH_PLAYERS : HLS_PLAYERS;
    $('#player').empty();
    players.forEach(function (player) {
        var option = $('<option>').text(player);
        $('#player').append(option);
    });
    $('#player').trigger('change');  
}
updateFieldsCorrespondingToStreamingProtocol();

function updateFieldsCorrespondingToPlaybackMode() {
    var isLive = $('#playbackMode').val() === 'LIVE';
    $('#startTimestamp').prop('disabled', isLive);
    $('#endTimestamp').prop('disabled', isLive);
}
updateFieldsCorrespondingToPlaybackMode();
applyQueryParameters();

$('.loader').hide();
$('.main').show();
console.log("Page loaded")