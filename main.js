// Timer Class
class Timer {
  constructor(work, shortBreak, longBreak, DOM) {
    this._work = work * 60
    this._shortBreak = shortBreak * 60
    this._longBreak = longBreak * 60
    this._timeLeft = this.work
    this._working = true
    this._DOM = DOM
    this._interval = null
    this._running = false
    this._DOM.display.textContent = this.toString()
    this._count = 0
  }

  // getters and setters
  get work() {
    return this._work
  }

  get shortBreak() {
    return this._shortBreak
  }

  get longBreak() {
    return this._longBreak
  }

  // this is to distinguish whether current timer is
  // a work timer or break timer
  get working() {
    return this._working
  }

  set working(s) {
    return (this._working = s)
  }

  // for keeping trak of number of pomodoros
  // completed. Later for display purposes for now
  // for determinine when to load longBreak duration
  get count() {
    return this._count
  }

  set count(s) {
    this._count = s
  }

  get timeLeft() {
    return this._timeLeft
  }

  set timeLeft(s) {
    return (this._timeLeft = s)
  }

  get DOM() {
    return this._DOM
  }

  get running() {
    return this._running
  }

  set running(s) {
    this._running = s
  }

  get interval() {
    return this._interval
  }

  set interval(i) {
    this._interval = i
  }

  // Methods
  start() {
    this.running = true
    if (this.running) this.DOM.start.textContent = 'pause'
    // update display
    this.DOM.display.textContent = this.toString()
    const start = Date.now()
    this.interval = setInterval(() => {
      // if timer is complete
      if (this.timeLeft === 0) {
        clearInterval(this.interval)

        if (this.working) {
          // if working timer
          if (this.count === 2) {
            this.count = 0
            this.timeLeft = this.longBreak
            this.toggleWork()
          } else {
            this.count += 1
            this.timeLeft = this.shortBreak
            this.toggleWork()
          }
        } else {
          this.timeLeft = this.work
          this.toggleWork()
        }

        this.DOM.display.textContent = this.toString()
        this.interval = null
        this.running = false
        this.DOM.start.textContent = 'Start'
        return
      }
      if (Date.now() - start >= 1000) {
        this.timeLeft -= 1
        clearInterval(this.interval)
        this.start()
      }
    }, 50)
  }

  pause() {
    this.running = false
    this.DOM.start.textContent = 'start'
    clearInterval(this.interval)
  }

  stop() {

    this.timeLeft = this.work
    this.working = true
    clearInterval(this.interval)
    this.interval = null
    this.running = false
    this.count = 0
    this.DOM.display.textContent = this.toString()
    this.DOM.title.textContent = 'Work'
    this.DOM.start.textContent = 'start'
  }

  toggleWork() {
    this.working = !this.working
    this.DOM.title.textContent = this.working ? 'Work' : 'Break'
  }

  toString() {
    let seconds = this.timeLeft
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
    seconds %= 3600

    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
    seconds = String(seconds % 60).padStart(2, '0')

    return `${hours === '00' ? '' : hours + ':'}${minutes}:${seconds}`
  }
}
// *** Timer Class End

/** Utilities */
function label(element) {
  return document.querySelector(element)
}

/** DOM element registration */
const display = label('.time')
const workLength = label('.work-length')
const shortBreak = label('.short-break')
const longBreak = label('.long-break')
const submit = label('.form-submit')
const start = label('.start')
const stop = label('.stop')
const title = label('.title')
const warning = label('.warning')

const DOM = {
  display,
  start,
  title,
  workLength,
  shortBreak,
  longBreak,
}

let timer = new Timer(25, 5, 15, DOM)

submit.addEventListener('click', (e) => {
  e.preventDefault()
  try {
    const workLengthUserInput = workLength.value
    const shortBreakUserInput = shortBreak.value
    const longBreakUserInput = longBreak.value
    validateInput(workLengthUserInput)
    validateInput(shortBreakUserInput)
    validateInput(longBreakUserInput)

    if (timer.running) {
      timer.stop()
    }

    timer = new Timer(
      workLengthUserInput,
      shortBreakUserInput,
      longBreakUserInput,
      DOM
    )
  } catch (err) {
    workLength.value = ''
    shortBreak.value = ''
    longBreak.value = ''
    showWarning(err.message)
  }
})

start.addEventListener('click', (e) => {
  e.preventDefault()
  if (!timer.running) return timer.start()
  timer.pause()
})

stop.addEventListener('click', (e) => {
  e.preventDefault()
  return timer && timer.stop()
})

function validateInput(userInput) {
  const input = +userInput.trim()
  if (Number.isNaN(input)) throw new Error('Please enter a valid integer')
  if (!Number.isInteger(input)) throw new Error('Please enter a valid integer')
  if (input > 86400 || input < 1)
    throw new Error('Duration should be between 86400 and 1')
}

function showWarning(message) {
  warning.textContent = message
  warning.style.opacity = 1

  setTimeout(() => {
    warning.style.opacity = 0
  }, 5000)
}

async function getImage() {
// generate two random numbers one for page number and another for item number
const pageNumber = Math.floor(Math.random() * 100) + 1
const arrayElement = Math.floor(Math.random() * 100) + 1

const response1 = await fetch(`https://images-api.nasa.gov/search?q=space&media_type=image&page=${pageNumber}`)
const response1JSON = await response1.json()

const picObj = response1JSON.collection.items[arrayElement]
const id = picObj.data[0].nasa_id
const response2 = await fetch(`https://images-api.nasa.gov/asset/${id}`)
const response2JSON = await response2.json()

const img = response2JSON.collection.items[0].href

console.log(img)

document.querySelector('body').setAttribute('style', `background: url(${img}) center/cover no-repeat;`)


// send request to https://images-api.nasa.gov/search?q=space&media_type=image&page=[randomPageNumber]
// to get a list of 100 potential items [array]
// access random object from this array and get NASA ID
// use this id to fetch specific image https://images-api.nasa.gov/asset/[nasa ID]
// set this image as url for background image
}

getImage()