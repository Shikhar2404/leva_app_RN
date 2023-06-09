
1. update chart data for lib code in react-native-gifted-charts
    ==> path > node_modules->react-native-gifted-charts->src
  
  // replace src folder (lib changes for Replace GiftedChartSRC)<== name of folder in this project

2. coment this 3 line code in  track player  for ios bcz app crash some time 
==> path > node_modules->react-native-track-player->ios->RNTrackPlayer->RNTrackPlayer.swift-> line --> 788 to 791

   // if let nextIndex = nextIndex, nextIndex < player.items.count {
        //     let track = player.items[nextIndex]
        //     isTrackLiveStream = (track as? Track)?.isLiveStream ?? false
        // }

3. update trackplayer getCurrentTrack data bcz in ios we get null if any data not in trackplayer and  android get 0 so we have to change this code in native file
==> path > node_modules->react-native-track-player->android->src->->main->java->com->doublesymmetry->trackplayer->module->MusicModule.kt ==> line no :-470


 @ReactMethod
    fun getCurrentTrack(callback: Promise) = scope.launch {
        if (verifyServiceBoundOrReject(callback)) return@launch
        val currentTrackIndex = musicService.getCurrentTrackIndex()
        if (currentTrackIndex > 0 || currentTrackIndex < musicService.tracks.size) { --> this chnage
            callback.resolve(currentTrackIndex)
        } else {
            callback.resolve(null)
        }
    }
4. for android  react-native-youtube-sdk get error in build project
==> path > node_modules->react-native-youtube-sdk->android->build.gradle
 
        implementation 'com.github.PierfrancescoSoffritti.android-youtube-player:core:10.0.5' // update 29 line with this

