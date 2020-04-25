function add_audio(peer_id) {
    var audio_div = document.getElementById("audio")
    audio_div.innerHTML += '<audio controls autoplay id="audio_' + peer_id + '"></audio>'
}



function changevol() {
    for (var c of connections) {
        if (c.open) {
            var audiop = document.getElementById("audio_" + c.peer)
            if (audiop != null){
                var d = distance(peer, c) 
                //var maxd = Math.sqrt(2) * canvas.width
                
                if ( d <= 50 ){
                    audiop.volume = 1
                }
                else if (d <= 150){
                    audiop.volume = 1 - (d-50)/100
                }
                else {
                    audiop.volume = 0
                }

                
            }
        }
    }
}