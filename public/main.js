const socket = io('https://mh-nodejs-webrtc.herokuapp.com/');
let _idPeer;
let _userNamePeer;
$("#chat").hide();
$("#warpChat").hide();

$("#ulUser").on('click', 'li', function(){
    console.log($(this).attr('id'));
    const id = $(this).attr('id');
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => {
            playStream('remoteStream', remoteStream)
        });
    })
})

$("#btnSendmessenge").click(()=>{
    let messenge = $('#messenge').val();
    let userName = _userNamePeer;
    socket.emit("NGUOI_DUNG_NHAN_TIN", {messenge,userName});
});

$("#messenge").keyup(function(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code==13) {
        $("#btnSendmessenge").click();
    }
});


socket.on('CO_NGUOI_NHAN_TIN', messengeResult=>{
    let textPosition = messengeResult.peerId == _idPeer ? 'text-right' : 'text-left';
    let userinfor = messengeResult.peerId == _idPeer ? '' : `<span class='mr-1'>${messengeResult.userName}: </span>`;
    $('#contentChat').append(`<p class='${textPosition}'>${userinfor} ${messengeResult.messenge}</p>`);
    $('#contentChat').scrollTop($('#contentChat').scrollTop() + 300);
    $('#messenge').val('');
})

socket.on('DANH_SACH_ONLINE', arrayUser => {
    $("#ulUser").text('')
    for (const item of arrayUser) {
        if (item.peerId != _idPeer) {
            $("#ulUser").append(`<li id="${item.peerId}">${item.ten}</li>`)
        }
    }
});
socket.on('CO_NGUOI_DUNG_MOI', arrayUser => {
    $("#ulUser").text('')
    for (const item of arrayUser) {
        if (item.peerId != _idPeer) {
            $("#ulUser").append(`<li id="${item.peerId}">${item.ten}</li>`)
        }
    }
});



socket.on('CO_NGUOI_HUY_KET_NOI', arrayUser => {
    $("#ulUser").text('')
    for (const item of arrayUser) {
        if (item.peerId != _idPeer) {
            $("#ulUser").append(`<li id="${item.peerId}">${item.ten}</li>`)
        }
    }
});

socket.on('DANG_KI_THAT_BAI', () => {
    alert('Tên người dùng đã tồn tại, vui lòng chọn tên đăng nhập khác.')
})

function openStream(_audio =true) {
    const config = { audio: _audio, video: true }
	if(!navigator.mediaDevices){
		alert('Thiết bị của bạn không hỗ trợ video call');
		return;
	}
    return navigator.mediaDevices.getUserMedia(config);
};
function playStream(idvideoTag, stream) {
    const video = document.getElementById(idvideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream().then(stream=>playStream('localStream',stream));

var peer = new Peer();

peer.on('open', id => {
    _idPeer = id;
    $("#yourId").text(id);
    $("#btnSigup").click(() => {
        const userName = $("#userName").val();
        _userNamePeer = userName;
        socket.emit("NGUOI_DUNG_DANG_KI", { ten: userName, peerId: id });
        $("#chat").show();
        $("#login").hide();
        $("#warpChat").show();
        $("#displayUsername").text(userName);
    })
});

//caller
$("#btnCall").click(() => {
    const id = $("#remoteId").val();
    openStream().then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => {
            playStream('remoteStream', remoteStream)
        });
    })
});

//callee

peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);
            call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
        })
});

