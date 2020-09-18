const PLAYER_SHAPES = {
    BALLISTIC: 1,
    EGG: 2,
}
const CONFIG = {
    PLAYER_WIDTH: 50,
    PLAYER_SHAPE: PLAYER_SHAPES.EGG,
    PLAYER_DEFAULT_HEIGHT: 300,
    PLAYER_JUMP_SPEED: 150,
    PLAYER_MAX_FLOAT_SPEED: 15,
    PLAYER_FLOAT_ACC: 0.50,

    PLATFORM_MIN_SPEED: 2,
    PLATFORM_MAX_SPEED: 10,
    PLATFORM_MIN_WIDTH: 50,
    PLATFORM_MAX_WIDTH: 280,
    PLATFORM_SHOWN_COUNT: 4,
    PLATFORM_ANIMATION_FRAME_COUNT: 30,

    PLATFORMS_LEVEL_HEIGHT: 100,
    // automatically calculated from screen.
    GAME_HEIGHT: 400,
    GAME_CONTAINER_ID: 'game-container',
    GAME_WIDTH: document.getElementById('game-container').offsetWidth,
    GAME_UPDATE_INTERVAL_MS: 20,
}

const Utility = {
    randomBetween: function (min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    },
    linearFunc: function(value, offset, slope) {
        return slope * value + offset
    },
    reverseLogarithmFunc: function(value, min, max) {  
        let coef = Math.min(1 / Math.log(value), 1)
        let ret = Math.max(min, max * coef)
        // console.log(value, coef, ret)
        return ret
    },
    logarithmFunc: function(value, min, max) {
        let coef = Math.min(1 - (1 / Math.log(Math.max(1, value))), 1)
        let ret = Math.max(min, max * coef)
        // console.log('speed', value, coef, ret)
        return ret
    }
}

function Player(y) {
    this._setOffset = function(newY) {
        let prevY = this.y
        this.y = newY
        this.element.style.bottom = this.y.toString() + 'px' 
    }
    
    this._render = function() {
        const _playerContainer = document.createElement('div')
        _playerContainer.id = 'player-container'
        const _player = document.createElement('div')
        _player.id = 'player'
        _player.className = "player-position player-shape-" + CONFIG.PLAYER_SHAPE
        _playerContainer.appendChild(_player)
        document.getElementById(CONFIG.GAME_CONTAINER_ID).appendChild(_playerContainer)
        return _playerContainer
    }

    this.y = CONFIG.PLAYER_DEFAULT_HEIGHT
    this.width = CONFIG.PLAYER_WIDTH
    this.speed = -1
    this.acc = -1 * CONFIG.PLAYER_FLOAT_ACC
    this.element = this._render()

    this._isInPlatformWidth = function(platform) {
        let playerMidX = CONFIG.GAME_WIDTH/2
        let platformStartX = platform.x
        let platformEndX = platform.x + platform.width
        return platformEndX >= (playerMidX - CONFIG.PLAYER_MAX_FLOAT_SPEED) &&
                platformStartX <= (playerMidX + CONFIG.PLAYER_MAX_FLOAT_SPEED)
        
    }
    
    this._isOnPlatformLevel = function(newY) {
        return this.y > CONFIG.PLATFORMS_LEVEL_HEIGHT && newY <= CONFIG.PLATFORMS_LEVEL_HEIGHT
    }

    this.willHitPlatform = function(platform, newY) {
        return this._isOnPlatformLevel(newY) && this._isInPlatformWidth(platform)
    }

    this.hasFallenOff = function() {
        return this.y < 100 - CONFIG.PLAYER_JUMP_SPEED
    }

    this.jumpDown = function() {
        distance = this.y - CONFIG.PLATFORMS_LEVEL_HEIGHT
        this.speed = -1 * Math.min(CONFIG.PLAYER_JUMP_SPEED, distance)
    }

    this.move = function(platform) {
        let willHit = false
        let newY = this.y + this.speed
        this.speed = Math.max(
            -1 * CONFIG.PLAYER_MAX_FLOAT_SPEED, 
            Math.min(this.speed + this.acc, CONFIG.PLAYER_MAX_FLOAT_SPEED)
        )
        if(this.willHitPlatform(platform, newY)) {
            willHit = true
            newY = CONFIG.PLATFORMS_LEVEL_HEIGHT
            this.speed = CONFIG.PLAYER_MAX_FLOAT_SPEED
        }
        this._setOffset(newY)
        return willHit
    }
    
    this.destroy = function() {
        this.element.remove()
    }
}

platform_sec = 1
function Platform(x, width = null) {
    this._setOffset = function(newX) {
        this.x = newX
        this.element.style.left = this.x.toString() + 'px'
        if((this.x + this.width > CONFIG.GAME_WIDTH) || (this.x < 0)) {
            this.speed = -1 * this.speed
        } 
    }

    this._render = function() {
        doc_id = 'platform_' + this.id.toString()
        const _platform = document.createElement('div')
        _platform.id = doc_id
        _platform.className = 'platform'
        if(!this.width) {
            this.width = Utility.reverseLogarithmFunc(this.id, CONFIG.PLATFORM_MIN_WIDTH, CONFIG.PLATFORM_MAX_WIDTH)
            this.x = Math.min(this.x, CONFIG.GAME_WIDTH - this.width)
        }
        _platform.style.width = this.width.toString() + 'px'
        _platform.style.left = this.x.toString() + 'px'
        document.getElementById('platforms-container').appendChild(_platform)
        return _platform
    }

    this.id = platform_sec++
    this.position = 0
    this.x = x
    this.width = width
    this.speed = Utility.logarithmFunc(this.id, CONFIG.PLATFORM_MIN_SPEED, CONFIG.PLATFORM_MAX_SPEED) 
    this.element = this._render()
    this.animStepCount = 0

    this.animateMove = function(oldPosition, newPosition, frameCount, deleteAfter) {
        this.step = (newPosition - oldPosition) / frameCount
        this.animStepCount = 0
        // TODO: add scale animation too.
        this.animInterval = setInterval(() => {
            this.element.style.top = (this.element.offsetTop + this.step).toString() + "px"
            this.animStepCount++
            if(this.animStepCount >= frameCount) {
                clearInterval(this.animInterval)
                if(deleteAfter) this.element.remove()
            }
        }, 1)
    }

    this.setPosition = function(position) {
        positionDiff = position - this.position
        this.animateMove(
            this.element.offsetTop, 
            this.element.offsetTop - 30 * positionDiff, 
            CONFIG.PLATFORM_ANIMATION_FRAME_COUNT,
            false
        )
        // this.element.style.top = (this.element.offsetTop - 30 * positionDiff).toString() + "px"
        this.element.style.zIndex = CONFIG.PLATFORM_SHOWN_COUNT - position
        this.position = position
        if(position == 0) this.element.style.filter = ""
        else if(position) this.element.style.filter = 
            "brightness(" + 
            Utility.linearFunc((position-1), 50, -1 * Math.floor(40/CONFIG.PLATFORM_SHOWN_COUNT)) + 
            "%)"
    }


    this.move = function() {
        this._setOffset(this.x + this.speed)
    }

    this.destroy = function() {
        this.element.className = this.element.className + " removed-item"
        setTimeout(() => {this.element.remove()}, 400) // 400 is .removed-item animation length
    }
}

function Game() {
    this.scoreBoard = null
    this.score = 0
    this.platforms = []
    this.player = null
    this.gameLoop = null
    
    this.tapToStartElement = document.getElementById('tap-to-start')
    this._hideTapToStart = function() {
        this.tapToStartElement.style.display = 'none'
    }

    this._showTapToStart = function() {
        this.tapToStartElement.style.display = ''
    }

    this.nextPlatform = function() {
        this.platforms[0].destroy()
        this.platforms.shift()
        for (const platform of this.platforms) {
            platform.setPosition(platform.position - 1)
        }
        let x = Utility.randomBetween(0, CONFIG.GAME_WIDTH-CONFIG.PLATFORM_MIN_WIDTH)
        let newPlatform = new Platform(x)
        newPlatform.setPosition(CONFIG.PLATFORM_SHOWN_COUNT - 1)
        this.platforms.push(newPlatform)
    }

    this.start = function() {
        this._hideTapToStart()
        this.gameLoop = setInterval(gameLoop, CONFIG.GAME_UPDATE_INTERVAL_MS) 
    }

    this._cleanup = function() {
        platform_sec = 1
        if(this.scoreBoard) {
            document.getElementById('score-board').remove()
            this.scoreBoard = null
        }
        if(this.gameLoop) {
            clearInterval(this.gameLoop)
            this.gameLoop = null
        }
        if(this.player) {
            this.player.destroy()
            this.player = null
        }
        for (const p of this.platforms) {
            p.destroy()
        }
        this.platforms = []
    }

    this.reset = function() {
        this._cleanup()
        this.player = new Player(0)
        
        let firstPlatform = new Platform(CONFIG.PLATFORM_MIN_WIDTH/2, CONFIG.GAME_WIDTH-CONFIG.PLATFORM_MIN_WIDTH)
        firstPlatform.setPosition(0)
        this.platforms.push(firstPlatform)
        for (let i = 1; i < CONFIG.PLATFORM_SHOWN_COUNT; i++) {
            let x = Utility.randomBetween(0, CONFIG.GAME_WIDTH-CONFIG.PLATFORM_MIN_WIDTH)
            let p = new Platform(x)
            p.setPosition(i)
            this.platforms.push(p)
        }
        this._showTapToStart()
    }

    this._showScore = function() {
        this.scoreBoard = document.createElement('div')
        this.scoreBoard.id = 'score-board'
        let scoreText = document.createElement('div')
        scoreText.innerHTML = 'SCORE:'
        this.scoreBoard.appendChild(scoreText)
        let scoreValue = document.createElement('div')
        scoreValue.innerHTML = this.score
        this.scoreBoard.appendChild(scoreValue)
        document.getElementById(CONFIG.GAME_CONTAINER_ID).appendChild(this.scoreBoard)
    }

    this.over = function() {
        this.score = this.platforms[0].id - 1
        this._cleanup()
        this._showScore()
        setTimeout(() => {this.reset()}, 5000)
    }

}

game = new Game()
game.reset()

function playerJumpHandler(e) {
    if(!game.platforms){
        e.preventDefault()
    }
    if(!game.gameLoop) {
        console.log('starting')
        game.start()
    }
    game.player.jumpDown()
    console.log('jumping')
}

var isMobile = false;
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
    isMobile = true;
}
eventToListen = isMobile ? 'touchstart' : 'click'
document.getElementById(CONFIG.GAME_CONTAINER_ID).addEventListener(eventToListen, function(e) {
    e.stopImmediatePropagation()
    e.stopPropagation()
    playerJumpHandler(e)
})

function gameLoop() {
    for (const platform of game.platforms) {
        platform.move()
    }
    let willHit = game.player.move(game.platforms[0])
    if(willHit) game.nextPlatform()
    if(game.player.hasFallenOff()) game.over()
}