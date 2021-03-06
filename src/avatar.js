// Avatars file names. It could be possible to load automatically all the images of a directory 'avatars'
// Avatars can be png or svg. They are automatically resized when printed.
avatars_data = [
    {
        left: "img/hen_left.png",
        right: "img/hen_right.png"
    },
    {
        left: "img/baleine_left.png",
        right: "img/baleine_right.png"
    },
    {
        left: "img/cow_left.png",
        right: "img/cow_right.png"
    },
    {
        left: "img/duck_left.svg",
        right: "img/duck_right.svg"
    },
    {
        left: "img/horse_left.svg",
        right: "img/horse_right.svg"
    },
    {
        left: "img/lion_left.png",
        right: "img/lion_right.png"
    },
    {
        left: "img/ours_left.png",
        right: "img/ours_right.png"
    },
    {
        left: "img/pig_left.png",
        right: "img/pig_right.png"
    },
    {
        left: "img/rabbit_left.png",
        right: "img/rabbit_right.png"
    },
    {
        left: "img/racoon_left.png",
        right: "img/racoon_right.png"
    },
    {
        left: "img/cat_left.png",
        right: "img/cat_right.png"
    },
    {
        left: "img/dog_left.png",
        right: "img/dog_right.png"
    },
    {
        left: "img/flamingo_left.png",
        right: "img/flamingo_right.png"
    },
    {
        left: "img/fox_left.png",
        right: "img/fox_right.png"
    }
]

var iconSelect;

window.onload = function () {

    document.getElementById('my-icon-select').addEventListener('changed', function (e) {
        my_avatar = iconSelect.getSelectedValue();
        peer.avatar = my_avatar
        send_to_all_peers_nojson({ avatar: my_avatar }, SEND_UPDATE_DATA)
    });

    iconSelect = new IconSelect("my-icon-select",
        {
            'selectedIconWidth': 48,
            'selectedIconHeight': 48,
            'selectedBoxPadding': 1,
            'iconsWidth': 48,
            'iconsHeight': 48,
            'boxIconSpace': 1,
            'vectoralIconNumber': 4,
            'horizontalIconNumber': 4
        });

    var icons = [];
    var counter = 0
    for (var a of avatars_data) {
        icons.push({ 'iconFilePath': a.right, 'iconValue': (counter) });
        counter += 1
    }
    iconSelect.refresh(icons);

    iconSelect.setSelectedIndex(Math.floor(Math.random() * avatars_data.length))

};

// avatars are loaded in the variable 'avatars'
avatars_data.forEach(element => {
    element.left_img = new Image()
    element.left_img.src = element.left
    generate_canvas_from_img(element.left_img, 40, 40)

    element.right_img = new Image()
    element.right_img.src = element.right
    generate_canvas_from_img(element.right_img, 40, 40)
});


my_avatar = Math.floor(Math.random() * avatars_data.length)


bank.img = new Image()
bank.img.src = "img/bank.svg"
generate_canvas_from_img(bank.img, 80, 80)
bank.img_selected = new Image()
bank.img_selected.src = "img/bank_selected.svg"
generate_canvas_from_img(bank.img_selected, 80, 80)


img_chapeau = new Image()
img_chapeau.src = "img/chapeau.png"
generate_canvas_from_img(img_chapeau, 40, 40)

img_coin = new Image()
img_coin.src = "img/coin.png"
generate_canvas_from_img(img_coin, 40, 40)

fabrik.img = new Image()
fabrik.img.src = "img/fabrik.png"
generate_canvas_from_img(fabrik.img, 80, 80)
fabrik.img_selected = new Image()
fabrik.img_selected.src = "img/fabrik_selected.png"
generate_canvas_from_img(fabrik.img_selected, 80, 80)


function load_img_and_canvas(obj, file_path, w, h) {
    obj.img = new Image()
    obj.img.src = file_path
    generate_canvas_from_img(obj.img, w, h)
}

function generate_canvas_from_img(lol, w, h) {
    lol.onload = function () {
        lol.canvas = document.createElement('canvas')
        var localCtx = lol.canvas.getContext('2d')
        lol.canvas.width = w
        lol.canvas.height = h
        localCtx.drawImage(lol, 0, 0, w, h)
    }
}





