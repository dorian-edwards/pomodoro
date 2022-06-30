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
    this._DOM.workLength.value = this.work / 60
    this._DOM.shortBreak.value = this.shortBreak / 60
    this._DOM.longBreak.value = this.longBreak / 60
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
        const audio = new Audio('sound.wav')
        audio.play()
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
const stopButton = label('.stop')
const title = label('.title')
const warning = label('.warning')
const overlay = document.querySelector('.overlay')
let imageInterval = null

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

    timer.stop()
  } catch (err) {
    workLength.value = ''
    shortBreak.value = ''
    longBreak.value = ''
    showWarning(err.message)
  }
})

start.addEventListener('click', (e) => {
  e.preventDefault()
  const img = document.querySelector('.site-img')
  if (!img.getAttribute('src')) {
    img.setAttribute(
      'src',
      'https://planetary.s3.amazonaws.com/web/assets/pictures/20200401_bg_planetary-society_cassini-in-saturns-shadow_uhd3840x2160.jpg'
    )
    overlay.classList.toggle('fade')
  }
  if (!timer.running) {
    setInterval(getImage, 30000)
    return timer.start()
  }
  timer.pause()
})

stopButton.addEventListener('click', (e) => {
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
  let img,
    found = false

  const effectNo = Math.floor(Math.random() * 4) + 1

  overlay.classList.toggle('fade') // takes 5s

  let imgTimer = setTimeout(async () => {
    while (!found) {
      // for images using saturn as keyword, 70 is the max number of pages
      const pageNumber = Math.floor(Math.random() * 70) + 1
      const response1 = await fetch(
        `https://images-api.nasa.gov/search?q=planet&media_type=image&page=${pageNumber}`
      )
      const response1JSON = await response1.json()

      // generate random no. based on max size of array
      const max = response1JSON.collection.items.length
      const arrayElement = Math.floor(Math.random() * max)

      const picObj = response1JSON.collection.items[arrayElement]
      const id = picObj.data[0].nasa_id

      const response2 = await fetch(`https://images-api.nasa.gov/asset/${id}`)
      const response2JSON = await response2.json()

      img = response2JSON.collection.items[0].href
      if (!img.endsWith('.tif')) {
        found = true
      }
    }

    document.querySelector('.site-img').setAttribute('src', img)
    // document
    //   .querySelector('.site-img')
    //   .setAttribute('style', `animation: 70s ease-in effect${effectNo};`)
    document.querySelector('.overlay').classList.toggle('fade')
    clearTimeout(imgTimer)
  }, 6000)
}
