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