import TrackPlayer, { Event } from 'react-native-track-player';

export default async function() {
    // This service needs to be registered for the module to work
    // Handle remote events from notification controls
    
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
        TrackPlayer.seekTo(event.position);
    });
}

