const Utility = {
    randomBetween: function (min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    },
    linearFunc: function(value, offset, slope) {
        return slope * value + offset
    },
    reverseLogarithmFunc: function(value, min, max) {  
        let coef = Math.min(CONFIG.PLATFORM_WIDTH_SMOOTHING_COEF / Math.log(value), 1)
        let ret = Math.max(min, max * coef)
        return ret
    },
    logarithmFunc: function(value, min, max) {
        let coef = Math.min(1 - (1 / Math.log(Math.max(1, value))), 1)
        let ret = Math.max(min, max * coef)
        return ret
    },
    debounce: function (func, wait = 100) {
        let isRunning = false;
        return function(...args) {
            if(!isRunning) {
                isRunning = true
                func.apply(this, args)
                setTimeout(() => {isRunning = false}, wait)
            }
        }
    },
}