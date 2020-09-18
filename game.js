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
        this.player = new Player()
        
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
        setTimeout(() => {this.reset()}, 4000)
    }
}