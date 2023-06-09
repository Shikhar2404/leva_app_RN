import TrackPlayer, { Event, State } from 'react-native-track-player';

let wasPausedByDuck = false;

module.exports = async function setup() {
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause();
    });

    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        TrackPlayer.skipToPrevious();
    });
    TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
        const position = (await TrackPlayer.getPosition()) + event.interval;
        TrackPlayer.seekTo(position);
      });
      TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
        const position = (await TrackPlayer.getPosition()) - event.interval;
        TrackPlayer.seekTo(position);
      });
      TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
        TrackPlayer.seekTo(event.position);
      });
        
    TrackPlayer.addEventListener(Event.RemoteDuck, async e => {
        if (e.permanent === true) {
            TrackPlayer.stop();
        } else {
            if (e.paused === true) {
                const playerState = await TrackPlayer.getState();
                wasPausedByDuck = playerState !== State.Paused;
                TrackPlayer.pause();
            } else {
                if (wasPausedByDuck === true) {
                    TrackPlayer.play();
                    wasPausedByDuck = false;
                }
            }
        }
    });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, data => {
  });

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, data => {
  });

};