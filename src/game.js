
function print_my_money() {
    /*
    ctx.fillStyle = "black"
    ctx.font = "30px Arial"
    ctx.fillText(peer.money, 0, 450)
    */
    ctx.drawImage(peer.moneyCanvas, 10, 430)
    ctx.drawImage(img_coin.canvas, 0, 450)
}

function get_mouse_coord(canvas, e) {
    var offsetX = 0, offsetY = 0, mx, my

    // Compute the total offset
    if (canvas.offsetParent !== undefined) {
        do {
            offsetX += canvas.offsetLeft
            offsetY += canvas.offsetTop
        } while ((canvas = canvas.offsetParent))
    }

    mx = e.pageX - offsetX
    my = e.pageY - offsetY

    return { x: mx, y: my }
}

function print_background(ctx) {
    ctx.beginPath()
    ctx.fillStyle = "#f9f2ec"
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fill();
}

function points_print(ctx) {
    if (peer_selected != null) {
        ctx.beginPath()
        ctx.arc(peer_selected.x, peer_selected.y, point_radius, 0, 2 * Math.PI)
        ctx.fillStyle = "red"
        ctx.fill()
    }

    for (var p of connections) {
        if (p.open) {
            if (p.avatar == null) {
                ctx.beginPath()
                ctx.arc(p.x, p.y, point_radius, 0, 2 * Math.PI)
                ctx.fillStyle = "black"
                ctx.fill()
            }
            else {
                if (p.avatar_direction == DIR_LEFT)
                    ctx.drawImage(avatars_data[p.avatar].left_img.canvas, p.x - 20, p.y - 20)

                if (p.avatar_direction == DIR_RIGHT)
                    ctx.drawImage(avatars_data[p.avatar].right_img.canvas, p.x - 20, p.y - 20)

                if (p.is_courtier) {
                    ctx.drawImage(img_chapeau.canvas, p.x - 10, p.y - 48)
                }
            }

            ctx.drawImage(p.pseudoCanvas, p.x - p.pseudoCanvas.width / 2, p.y - 40)
        }

    }

    var p = { x: peer.x, y: peer.y }
    if (peer.avatar == null) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, point_radius, 0, 2 * Math.PI)
        ctx.fillStyle = "black"
        ctx.fill()
    }
    else {
        ctx.beginPath()
        ctx.arc(p.x, p.y, distance_to_speak, 0, 2 * Math.PI)
        ctx.strokeStyle = "grey"
        ctx.stroke()

        if (peer.avatar_direction == DIR_LEFT)
            ctx.drawImage(avatars_data[peer.avatar].left_img.canvas, p.x - 20, p.y - 20)

        if (peer.avatar_direction == DIR_RIGHT)
            ctx.drawImage(avatars_data[peer.avatar].right_img.canvas, p.x - 20, p.y - 20)

        if (peer.is_courtier) {
            ctx.drawImage(img_chapeau.canvas, p.x - 10, p.y - 48)
        }
    }

}



var keyState = {};
window.addEventListener('keydown', function (e) {
    keyState[e.keyCode || e.which] = true;
}, true);
window.addEventListener('keyup', function (e) {
    keyState[e.keyCode || e.which] = false;
}, true);



function game_end() {
    game.status = GAME_STATUS_OVER
    monetary_mass_chart.update()
    update_volumes()
    my_credits = []
    var top = document.getElementById("results").offsetTop
    window.scrollTo(0, top)
}


function gameLoop(ctx) {

    if (get_time_left_before_end() <= 0) {
        if (game.status == GAME_STATUS_RUNNING) {
            game_end()
        }
    }

    var speed = 2
    var speedv2 = 3.5
    var my_position_has_changed = false

    // move the avatar with mouse
    if (move_target != null && (peer.x != move_target.x || peer.y != move_target.y)) {
        positions_have_changed = true
        my_position_has_changed = true
        if (move_target.x >= peer.x) {
            peer.avatar_direction = DIR_RIGHT
        }
        else {
            peer.avatar_direction = DIR_LEFT
        }
        var dist = Math.sqrt((move_target.x - peer.x) ** 2 + (move_target.y - peer.y) ** 2)
        var new_pos = {
            x: peer.x + speedv2 * (move_target.x - peer.x) / dist,
            y: peer.y + speedv2 * (move_target.y - peer.y) / dist
        }

        var too_near = false
        for (var c of connections) {
            if (c.open) {
                if (distance(c, new_pos) <= 35) {
                    var r = 35
                    var vAB = vector(peer, new_pos)
                    var vBC = vector(new_pos, c)
                    var ps1 = ps(vAB, vBC)
                    var AB = distance(new_pos, peer)
                    var BC = distance(new_pos, c)
                    var t1 = (- ps1 + Math.sqrt(ps1 * ps1 - AB * AB * (BC * BC - r * r))) / (AB * AB)
                    var t2 = (- ps1 - Math.sqrt(ps1 * ps1 - AB * AB * (BC * BC - r * r))) / (AB * AB)
                    if (true || (0 <= t1 && t1 <= 1)) {
                        var vI = { x: t1 * peer.x + (1 - t1) * new_pos.x, y: t1 * peer.y + (1 - t1) * new_pos.y }
                        var vCI = vector(c, vI)
                        if (ps(vAB, { x: -vCI.y, y: vCI.x }) < 0) {
                            var theta = -t1 * AB / r
                        }
                        else {
                            var theta = t1 * AB / r
                        }
                        var Bp = {
                            x: c.x + vCI.x * Math.cos(theta) - vCI.y * Math.sin(theta),
                            y: c.y + vCI.x * Math.sin(theta) + vCI.y * Math.cos(theta)
                        }
                        new_pos.x = Bp.x
                        new_pos.y = Bp.y
                    }
                    too_near = true
                    does_not_work = false
                    for (var cp of connections) {
                        if (cp.open && distance(cp, new_pos) < 34.8) {
                            does_not_work = true
                            break
                        }
                    }
                    if (does_not_work == false) {
                        peer.x = new_pos.x
                        peer.y = new_pos.y
                    }



                    too_near = true
                    break
                }
            }
        }

        if (too_near == false) {
            if (dist > speedv2) {
                peer.x = new_pos.x
                if (new_pos.y < canvas.height - 100)
                    peer.y = new_pos.y
            }
        }



    }

    if (keyState[85] && peer.speaking_to_all == false) { // 85 = u
        peer.speaking_to_all = true
        send_to_all_peers_nojson({ speaking_to_all: peer.speaking_to_all }, SEND_UPDATE_DATA_NO_RECONNECTION)
        update_volumes()
    }
    else if (keyState[85] == false && peer.speaking_to_all) {
        peer.speaking_to_all = false
        send_to_all_peers_nojson({ speaking_to_all: peer.speaking_to_all }, SEND_UPDATE_DATA_NO_RECONNECTION)
        update_volumes()
    }

    if (keyState[83] || keyState[40]) {
        if (peer.y + speed < canvas.height - 100) {
            positions_have_changed = true
            my_position_has_changed = true
            peer.y += speed;
        }
    }
    if (keyState[90] || keyState[38]) {
        if (peer.y - speed > 0) {
            positions_have_changed = true
            my_position_has_changed = true
            peer.y -= speed;
        }
    }
    if (keyState[37] || keyState[81]) {
        if (peer.x - speed > 0) {
            positions_have_changed = true
            peer.x -= speed;
            peer.avatar_direction = DIR_LEFT
            my_position_has_changed = true
        }
    }
    if (keyState[39] || keyState[68]) {
        if (peer.x + speed < canvas.width) {
            positions_have_changed = true
            my_position_has_changed = true
            peer.x += speed;
            peer.avatar_direction = DIR_RIGHT
        }
    }



    slide_little_card()
    print_background(ctx)

    if (distance(peer, fabrik) <= 80) {
        ctx.drawImage(fabrik.img_selected.canvas, fabrik.x - 40, fabrik.y - 40)
    }
    else {
        ctx.drawImage(fabrik.img.canvas, fabrik.x - 40, fabrik.y - 40)
    }


    if (game.mode == MODE_DETTE) {
        if (distance(peer, bank) <= 80) {
            ctx.drawImage(bank.img_selected.canvas, bank.x - 40, bank.y - 40)
        }
        else {
            ctx.drawImage(bank.img.canvas, bank.x - 40, bank.y - 40)
        }
    }

    points_print(ctx)
    if (game.mode != MODE_WAITING_ROOM) {
        print_my_cards(ctx)
        if (game.mode == MODE_LIBRE || game.mode == MODE_DETTE) {
            print_my_money()
        }

    }


    if (my_position_has_changed) {
        send_to_all_peers_nojson({ x: peer.x, y: peer.y, avatar_direction: peer.avatar_direction }, SEND_UPDATE_DATA)
    }

    if (true && positions_have_changed) {
        update_volumes()
    }

    if (game.mode == MODE_LIBRE) {
        ctx.font = "16px Arial"
        ctx.fillStyle = "black"
        ctx.fillText("Prochaine réévaluation : " + get_str_time_left_before_reevaluation(), 5, 20)

        if (get_time_left_before_reevaluation() < 0) {
            game.reevaluation_old_time = get_current_time()
            game.turn++
            reevaluate()
        }
    }

    if (game.mode != MODE_WAITING_ROOM) {
        game_mode_str = ""
        switch (game.mode) {
            case MODE_DETTE:
                game_mode_str = "monnaie dette"
                break
            case MODE_LIBRE:
                game_mode_str = "monnaie libre"
                break
            case MODE_DON:
                game_mode_str = "don"
                break
        }
        if (game.status == GAME_STATUS_OVER) {
            document.getElementById("header_avancement").innerHTML = "Partie finie"
        } else {
            document.getElementById("header_avancement").innerHTML = "Partie en cours (" + game_mode_str + ") : " + get_str_time_left_before_end()
        }

        if (game.common_good_mode) {
            document.getElementById("header_avancement").innerHTML += " (Santé  : " + game.common_good_health + " : Obsolete : " + obsolete_number() + " )"
        }
    }

    if (game.mode == MODE_DETTE) {
        for (var i in my_credits) {
            ctx.font = "16px Arial"
            ctx.fillStyle = "black"
            ctx.fillText("Crédit à rembourser dans : " + get_time_left_credit(my_credits[i]) + "s", 5, 20 + i * 25)

            if (get_time_left_credit(my_credits[i]) < 0) {

                if (peer.money >= game.initial_credit + game.interet) {
                    add_to_my_money(-game.initial_credit - game.interet)
                    payer_interets()
                    my_credits.splice(i, 1)
                }
                else if (peer.money >= game.interet) {
                    add_to_my_money(- game.interet)
                    my_credits.splice(i, 1)
                    my_credits.push(get_current_time())
                    payer_interets()
                }
                else {
                    if (peer.cards.length >= 1) {
                        my_credits.splice(i, 1)
                        my_credits.push(get_current_time())
                        hypothequer(peer.cards[0])
                        remove_card(peer.cards[0])
                    }
                    else {
                        my_credits.splice(i, 1)
                    }

                }
                break
            }
        }


    }


    var do_search_square = false
    for (var card of peer.cards) {
        if (card.x != card.target_x && card.y != card.target_y) {
            do_search_square = false
            break
        }
    }
    if (do_search_square) {
        search_and_apply_square()
    }

    if (game.status == GAME_STATUS_PAUSED) {
        ctx.font = "20px Arial"
        ctx.fillStyle = "black"
        ctx.fillText("Jeu en pause", 100, 100)
    }

    positions_have_changed = false

}









function add_to_my_money(quantity) {
    peer.money += quantity
    peer.moneyCanvas = generate_text_canvas(peer.money)
    send_to_all_peers_nojson({ money: peer.money }, SEND_UPDATE_DATA)
}




function disaster() {
    if (game.common_good_mode && game.common_good_health < 0) {
        var r = Math.random()
        var proba_dis = 0.01 * 2 ** (-1 - game.common_good_health)
        console.log(proba_dis)
        if (r < proba_dis) {
            remove_random_card()
            reposition_cards()
        }
    }
}