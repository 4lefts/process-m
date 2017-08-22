const p5 = require('p5')
const Tone = require('tone')

const proc = new p5(function(p){

  let cellSz = 50
  let tracks = 8
  let steps = 16
  let grid = []
  let notes = ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5']
  let scale = []
  const roots = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  let root = 'C'
  let editingRoot = false
  let bgColour, cellColour, highLightColour
  let margin = 10
  let isPlaying = false
  let tempo = 90
  let counter = 0 //nb counter is used for gui, not audio scheduling
  let editingTempo = false

  const verb = new Tone.Freeverb({
    roomSize: 0.8,
    dampening: 2000,
    wet: 0.2
  }).toMaster()

  const delay1 = new Tone.FeedbackDelay({
    delayTime: '16n',
    feedback: 0.4,
    wet: 0.3
  })

  const delay2 = new Tone.FeedbackDelay({
    delayTime: '8n',
    feedback: 0.3,
    wet: 0.2
  })

  const synth = new Tone.MultiPlayer({
    urls: {
      'C3': './chimes/1.mp3',
      'C#3': './chimes/2.mp3',
      'D3': './chimes/3.mp3',
      'D#3': './chimes/4.mp3',
      'E3': './chimes/5.mp3',
      'F3': './chimes/6.mp3',
      'F#3': './chimes/7.mp3',
      'G3': './chimes/8.mp3',
      'G#3': './chimes/9.mp3',
      'A3': './chimes/10.mp3',
      'A#3': './chimes/11.mp3',
      'B3': './chimes/12.mp3',
      'C4': './chimes/13.mp3',
      'C#4': './chimes/14.mp3',
      'D4': './chimes/15.mp3',
      'D#4': './chimes/16.mp3',
      'E4': './chimes/17.mp3',
      'F4': './chimes/18.mp3',
      'F#4': './chimes/19.mp3',
      'G4': './chimes/20.mp3',
      'G#4': './chimes/21.mp3',
      'A4': './chimes/22.mp3',
      'A#4': './chimes/23.mp3',
      'B4': './chimes/24.mp3',
      'C5': './chimes/25.mp3'
    },
    volume: -10,
    fadeOut: 0.1,
  }).chain(delay1, delay2, verb)

  // sequencer clock
  const loop = new Tone.Sequence(function(time, step){
    counter = step
    const column = grid[step]
    p.playStep(column, time)
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], '16n')
  Tone.Transport.bpm.value = tempo
  Tone.Transport.start()

  p.playStep = function(col, t){
    let noteOptions = []
    let probabilities = []
    let sum = 0
    for(let i = col.length - 1; i >= 0; i--){
      if(col[i] > 0){
        sum += col[i]
        noteOptions.push(scale[i])
        probabilities.push(sum)
      }
    }
    const roll = Math.random() * sum
    for(let i = 0; i < noteOptions.length; i++){
      if(roll < probabilities[i]){
        synth.start(noteOptions[i], t, 0, '8n', 0, 0.8)
        break
      }
    }
  }

  p.setup = function(){
    const cnv = p.createCanvas(800, document.documentElement.clientHeight)
    bgColour = p.color(1, 22, 39)
    cellColour = p.color(239, 255, 233)
    highLightColour = p.color(231, 29, 54)
    p.initGrid()
    scale = p.makeScale(root, roots, 'major', notes)
  }

  p.draw = function(){
    if(editingRoot) p.updateScale()
    if(editingTempo) p.updateTempo()
    p.background(bgColour)
    p.drawPlayBar()
    p.drawCells()
    p.drawPlayButton()
    p.drawNumber(2, 'root', root, editingRoot)
    p.drawNumber(12, 'bpm', tempo, editingTempo)
    p.drawNumber(14, 'step', counter, false)
  }

  p.mousePressed = function(){
    if(p.mouseX > cellSz * 12 && p.mouseX < cellSz * 14 && p.mouseY > tracks * cellSz && p.mouseY < (tracks + 2) * cellSz){
      editingTempo = true
    } else if(p.mouseX > cellSz * 2 && p.mouseX < cellSz * 4 && p.mouseY > tracks * cellSz && p.mouseY < (tracks + 2) * cellSz){
      editingRoot = true
    } else {
      editingRoot = false
      editingTempo = false
    }
  }

  p.mouseReleased = function(){
    if(!editingTempo && !editingRoot){
      if( p.mouseX > 0 && p.mouseX < steps * cellSz && p.mouseY > 0){
        if(p.mouseY < tracks * cellSz){
          p.toggleGrid(p.mouseX, p.mouseY)
          return
        } else if(p.mouseX < 100 && p.mouseY < (tracks * cellSz) + 100) {
          p.startStop()
        }
      }
    }
    editingTempo = false
    editingRoot = false
  }

  p.startStop = function(){
    isPlaying = !isPlaying
    if(isPlaying){
      loop.start()
    } else {
      loop.stop()
    }
  }

  p.updateTempo = function(){
    tempo = p.constrain(p.map(p.mouseY, 0, p.height, 240, 40), 40, 240).toFixed(0)
    Tone.Transport.bpm.value = tempo
  }

  p.updateScale = function(){
    root = roots[p.constrain(p.map(p.mouseY, 0, p.height, 11, 0), 0, 11).toFixed(0)]
    scale = p.makeScale(root, roots, 'major', notes)
  }

  p.drawPlayBar = function(){
    if(isPlaying){
      p.stroke(highLightColour)
      p.fill(highLightColour)
      p.rect(counter * cellSz, 0, cellSz, tracks * cellSz)
    }
  }

  p.drawPlayButton = function(){
    p.push()
    p.translate(0, cellSz * tracks)
    p.noFill()
    p.stroke(cellColour)
    p.rect(0, 0, cellSz * 2, cellSz * 2)
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
          let _h = (1 - grid[i][j]) * cellSz
          p.noStroke()
          p.fill(cellColour)
          p.rect(cellSz * i, (cellSz * j) + _h, cellSz, cellSz - _h)
        }
      }
    }
    p.pop()
  }

  p.drawNumber = function(x, label, value, editing){
    p.push()
    p.translate(cellSz * x, cellSz * tracks)
    p.noFill()
    p.stroke(cellColour)
    p.rect(0, 0, cellSz * 2, cellSz * 2)
    p.noStroke()
    if(editing){
      p.fill(highLightColour)
    } else {
      p.fill(cellColour)
    }
    p.textSize(12)
    p.textAlign(p.left)
    p.text(`${label}:`, margin, p.textAscent() + margin)
    p.textSize(48)
    p.textAlign(p.RIGHT)
    p.text(value, (cellSz * 2) - margin, (cellSz * 2) - margin)
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
    let v = 1 - ((_y / cellSz) - y) //get just the decimal part
    if(grid[x][y]){
      grid[x][y] = 0
    } else {
      grid[x][y] = v
    }
  }

  p.makeScale = function(rt, rts, type, allNotes){
    const scales = {
      major: [0, 2, 4, 5, 7, 9, 11, 12]
    }
    const fst = rts.indexOf(rt)
    const ret = scales[type].map((note, i) => {
      const currentInterval = fst + scales[type][i]
      return allNotes[currentInterval]
    })
    console.log(fst)
    return ret
  }

}, 'process-container')
