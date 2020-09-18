function Player() {
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