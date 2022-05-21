const PROTOCOL = 'HLS';
const STREAM_NAME = "thing_stream_466f401";
const API_NAME = "GET_HLS_STREAMING_SESSION_URL";

const fetchCredentials = async () => {
    try {
        console.log('Fetching credentials');
        return (await axios.get('https://master.darwinist.io/credentials')).data.credentials;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const initPlayer = (streamingSessionURL) => {
    const playerElement = $('#videojs');
    playerElement.show();
    const player = videojs('videojs', {
        autoplay: true,
        muted: true
    });
    player.src({
        src: streamingSessionURL,
        type: 'application/x-mpegURL'
    });
    console.log('Created VideoJS Player');
}

const initStreamingSession = async () => {
    const options = await fetchCredentials();

    const kinesisVideo = new AWS.KinesisVideo(options);
    const kinesisVideoArchivedContent = new AWS.KinesisVideoArchivedMedia(options);

    let dataEndpoint;

    try {
        console.log('Fetching data endpoint');

        dataEndpoint = (await kinesisVideo.getDataEndpoint({
                StreamName: STREAM_NAME,
                APIName: API_NAME
            })
            .promise()).DataEndpoint;

        console.log(`Data endpoint: ${dataEndpoint}`)
    } catch (e) {
        console.log(e);
        throw e;
    }

    kinesisVideoArchivedContent.endpoint = new AWS.Endpoint(dataEndpoint);

    let streamingSessionURL;

    try {
        console.log(`Fetching ${PROTOCOL} streaming session URL`);

        streamingSessionURL = (await kinesisVideoArchivedContent.getHLSStreamingSessionURL({
            StreamName: STREAM_NAME
        }).promise()).HLSStreamingSessionURL;

        console.log(`HLS Streaming Session URL: ${streamingSessionURL}`)

        return streamingSessionURL;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const play = async () => {
    const streamingSessionURL = await initStreamingSession();
    initPlayer(streamingSessionURL);
}

(async () => await play())();