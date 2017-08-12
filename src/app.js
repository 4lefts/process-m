const p5 = require('p5')
const Tone = require('tone')

const proc = new p5(function(p){

  let cellSz = 50
  let tracks = 8
  let steps = 16
  let grid = []
  let notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']
  let bgColour
  let cellColour
  let margin = 10
  let isPlaying = false
  let tempo = 90
  let counter = 0 //nb counter is used for gui, not audio scheduling

  const synth = new Tone.FMSynth({
    harmonicity: 10,
    modulationIndex: 4,
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.005,
      decay: 0,
      sustain: 1,
      release: 1
    },
    modulationEnvelope: {
      attack: 0.005,
      decay: 0.2,
      sustain: 0.2,
      release: 0.8
    },
    portamento: 0
  }).toMaster()

  // sequencer clock
  const loop = new Tone.Loop(function(time){
    counter++
    if(counter > steps - 1) counter = 0
    p.playNotes(grid[counter])
  }, '16n')
  Tone.Transport.bpm.value = tempo
  Tone.Transport.loop = true
  Tone.Transport.loopStart

  p.setup = function(){
    const cnv = p.createCanvas(800, document.documentElement.clientHeight)
    bgColour = p.color(1, 22, 39)
    cellColour = p.color(239, 255, 233)
    p.initGrid()
  }

  p.draw = function(){
    p.background(bgColour)
    p.drawPlayBar()
    p.drawCells()
    p.drawPlayButton()
  }

  p.mouseReleased = function(){
    if( p.mouseX > 0 && p.mouseX < steps * cellSz && p.mouseY > 0){
      if(p.mouseY < tracks * cellSz){
        p.toggleGrid(p.mouseX, p.mouseY)
        return
      } else if(p.mouseX < 100 && p.mouseY < (tracks * cellSz) + 100) {
        p.startStop()
      }
    }
  }

  p.startStop = function(){
    isPlaying = !isPlaying
    if(isPlaying){
      loop.start()
      Tone.Transport.start()
    } else {
      Tone.Transport.stop()
      loop.stop()
    }
  }

  p.playNotes = function(stepArr){
    for(let i = tracks - 1; i >= 0; i--){
      if(stepArr[i]){
        synth.triggerAttackRelease(notes[i], '16n')
      }
    }
  }

  p.drawPlayBar = function(){
    if(isPlaying){
      const c = p.color(231, 29, 54)
      p.stroke(c)
      p.fill(c  )
      p.rect(counter * cellSz, 0, cellSz, tracks * cellSz)
    }
  }

  p.drawPlayButton = function(){
    p.push()
    p.translate(0, cellSz * tracks)
    p.noFill()
    p.stroke(cellColour)
    p.rect(0, 0, 100, 100)
    p.fill(cellColour)
    if(isPlaying){
      p.rect(5, 5, 90, 90)
    } else {
      p.triangle(5, 5, 95, 50, 5, 95)
    }
    p.pop()
  }

  p.drawCells = function(){
    p.push()
    for(let i = grid.length - 1; i >= 0; i--){
      for(let j = grid[i].length - 1; j >= 0; j--){
        p.stroke(cellColour)
        p.noFill()
        p.rect(cellSz * i, cellSz * j, cellSz, cellSz)
        if(grid[i][j]){
          let _h = grid[i][j] * cellSz
          p.noStroke()
          p.fill(cellColour)
          p.rect(cellSz * i, (cellSz * j) + _h, cellSz, cellSz + (1 - _h))
        }
      }
    }
    p.pop()
  }

  p.initGrid = function(){
    for(let i = steps - 1; i >= 0; i--){
      grid[i] = []
      for(let j = tracks - 1; j >= 0; j --){
        grid[i][j] = 0
      }
    }
  }

  p.toggleGrid = function(_x, _y){
    let x = Math.floor(_x / cellSz)
    let y = Math.floor(_y / cellSz)
    let v = (_y / cellSz) - y //get just the decimal part
    if(grid[x][y]){
      grid[x][y] = 0
    } else {
      grid[x][y] = v
    }
    console.log(grid);
  }

}, 'process-container')
