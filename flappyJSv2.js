class Matrix {
  constructor(rows, cols){
    this.rows = rows
    this.cols = cols
    this.data = []
    for(let i=0; i<rows; i++){
      this.data[i] = []
      for(let j=0; j<cols; j++){
        this.data[i][j] = -1 + Math.random()*2
      }
    }
  }

  map(func){
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j];
        this.data[i][j] = func(val);
      }
    }
  }

  static multiply(m1, m2){
    let matrix = new Matrix(m1.rows, m2.cols)
    if(m1.cols != m2.rows){
      console.error('Cannot multiply m1 and m2')
      return
    }
    for(let i=0; i<m1.rows; i++){
      for(let j=0; j<m2.cols; j++){
        let sum = 0
        for(let k=0; k<m1.cols; k++){
          sum += m1.data[i][k] * m2.data[k][j]
        }
        matrix.data[i][j] = sum
      }
    }
    return matrix
  }

  static toMatrix(array){
    let matrix = new Matrix(array.length, 1)
    for(let i=0; i<array.length; i++){
      matrix.data[i][0] = array[i]
    }
    return matrix
  }

  static toArray(matrix){
    if(matrix.cols != 1){
      console.error("Cannot transform multi dimensionnal matrix into array")
      return void 0
    }
    let array = []
    for(let i=0; i<matrix.rows; i++){
      array.push(matrix.data[i][0])
    }
    return array
  }

  copy(){
    let m = new Matrix(this.rows, this.cols);
    for (let i=0; i<this.rows;i++) {
      for (let j=0; j<this.cols;j++) {
        m.data[i][j] = this.data[i][j];
      }
    }
    return m;
  }

  mutate(mutationRate){
    for (let i=0; i<this.rows; i++) {
      for (let j=0; j<this.cols; j++) {
        let rdm = Math.random()
        if(rdm < mutationRate){
          this.data[i][j] = -1 + Math.random()*2
        }
      }
    }
  }
}
// Faire une classe genetic algo avec proba, pick parent etc
// Ajouter paramètres, comme tableau chaine de caractères pour inputs signification à écrire devant le dessin du nn
class NeuralNetwork {
  constructor(listLayers, activationFunction = relu, drawX = 80, drawY = 80, gapLayer = 200, gapPerceptron = 50, radiusPerceptron = 20, thicknessWeights = 4) {
    if(listLayers instanceof NeuralNetwork){
      let nn = listLayers
      let layers = []
      nn.layers.forEach( (layer, index) => layers[index] = layer.copy())
      this.layers = layers
      this.drawX = nn.drawX
      this.drawY = nn.drawY
      this.gapLayer = nn.gapLayer
      this.gapPerceptron = nn.gapPerceptron
      this.radiusPerceptron = nn.radiusPerceptron
      this.thicknessWeights = nn.thicknessWeights
      this.activationFunction = nn.activationFunction
    }
    else{
      let layers = []
      listLayers.forEach( (layer, index, listLayers) => {
        if(index != listLayers.length -1){
          layers[index] = new Matrix(listLayers[index+1], layer)
        }
      })
      this.layers = layers
      this.drawX = drawX
      this.drawY = drawY
      this.gapLayer = gapLayer
      this.gapPerceptron = gapPerceptron
      this.radiusPerceptron = radiusPerceptron
      this.thicknessWeights = thicknessWeights
      this.activationFunction = activationFunction
    }
  }
  copy(){
    return new NeuralNetwork(this);
  }
  mutate(mutationRate){
    this.layers.forEach( layer => layer.mutate(mutationRate))
  }
  think(inputs){
    let outputs = Matrix.toMatrix(inputs)
    this.layers.forEach( layer => {
      let result = Matrix.multiply(layer, outputs)
      result.map(this.activationFunction)
      outputs = result
    })
    return Matrix.toArray(outputs)
  }

  static draw(nn, context, inputs){
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    inputs.forEach( (elem, index) => { // Voir si on peut draw les inputs dans la boucle du dessous où s'il faut vraiment séparer
      context.lineWidth = 1 // A set ailleurs ?
      context.strokeStyle = 'rgb(0, 0, 0)'
      context.strokeText(elem.toFixed(3), nn.drawX - 50, nn.drawY + index*nn.gapPerceptron) // A set en option ?

      let intensity = elem * 255
      context.fillStyle = 'rgb(0, ' + intensity + ', 0)'
      context.beginPath()
      context.arc(nn.drawX, nn.drawY + index*nn.gapPerceptron, nn.radiusPerceptron, 0, 2*Math.PI)
      context.fill()
    })

    let outputs = Matrix.toMatrix(inputs)
    nn.layers.forEach( (layer, index, layers) => {
      context.lineWidth = nn.thicknessWeights// A set ailleurs ?

      let result = Matrix.multiply(layer, outputs)
      result.map(nn.activationFunction)
      outputs = Matrix.toArray(result)
      outputs.forEach( (elem, indexOutputs) => {
        let intensity = elem * 255
        context.fillStyle = 'rgb(0, ' + intensity + ', 0)'
        context.beginPath()
        context.arc(nn.drawX + (index+1)*nn.gapLayer, nn.drawY + indexOutputs*nn.gapPerceptron, nn.radiusPerceptron, 0, 2*Math.PI)
        context.fill()
      })
      outputs = Matrix.toMatrix(outputs)

      layer.data.forEach( (ligne, indexLigne) => {
        ligne.forEach( (value, indexColonne) => {
          context.beginPath()
          let colorIntensity = Math.abs(value) * 255 * inputs[indexColonne]
          if(value > 0){
            context.strokeStyle = 'rgb(0, ' + colorIntensity + ', 0)'
          }
          else{
            context.strokeStyle = 'rgb(' + colorIntensity + ', 0, 0)'
          }
          context.moveTo(nn.drawX + index*nn.gapLayer, nn.drawY + indexColonne*nn.gapPerceptron)
          context.lineTo(nn.drawX + (index+1)*nn.gapLayer, nn.drawY + indexLigne*nn.gapPerceptron)
          context.stroke()
        })
      })
    })
  }
}
// Ajouter BIAS ?
// Passer le code en full anglais
// Mettre les functions d'activations dans la lib
const sigmoid = x => 1 / (1 + Math.exp(-x));
const relu = x => x < 0 ? 0 : x
const step = x => x < 0 ? 0 : 1
const identity = x => x


//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
var contextctx, canvas
var ctxNeuralNetwork, canvasNN
var width, height
// Ajouter resize function
const init = () => {
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  canvasNN = document.getElementById('neuralNetworkCanvas')
  ctxNeuralNetwork = canvasNN.getContext('2d') // Voir pour l'ajouter avec une fonction dans la librairie
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
  ctxNeuralNetwork.canvas.width = width
  ctxNeuralNetwork.canvas.height = height
  createBirds()
  loop()
}

const loop = () => {
	createPipes()

  gravity()
  updatePipesPosition()
  removePastPipes()
  collisions()
  updateScore()

  restoreGame()
  dessin()

  requestAnimationFrame(loop)
}

const jeu = {
	width: 900,
  pipeWidth: 900/10,
	height: 900, // base 600
	positionX: 50,
	positionY: 50,
	lastPipeCreated: 0,
  startingHolePipe: 0.8,
  holePipe: 0.8,
	holePipeMin: 0.15, // %of the pipe cut off, usually 30%
  holePipeDecreaseRate: 0.8,
	listePipes: [],
  listeBird: [],
  listDeadBirds: [],
	speed: 3,
	score: 0,
  gravityPower: 0.7,
  scoreBetweenPipes : 400, // base 300
  nbBirds: 200,
  maxDrawnBird: 200,
  nbGeneration: 1,
  mutationRate: 0.1
}

const useBrain = (bird, indexBird) => {
  // inputs = [birdSpeed, yBird, xDstFromPipe, yTopPipe, yBottomPipe] + normalize
  let inputs = [
    (bird.birdVertSpeed+15) / (30), // (Speed/rangeSpeed)
    (bird.y-bird.size) / (jeu.height-(2*bird.size)),
    (jeu.listePipes[0].x-bird.x+jeu.pipeWidth+bird.size) / (jeu.scoreBetweenPipes),
    (jeu.listePipes[0].height1) / (jeu.height*(1-jeu.holePipe)),
    (jeu.listePipes[0].height2) / (jeu.height*(1-jeu.holePipe))
  ]
  if(inputs[2] > 1) inputs[2] = 1
  if(indexBird === 0) NeuralNetwork.draw(bird.brain, ctxNeuralNetwork, inputs)
  let results = bird.brain.think(inputs)
  return results[0]
}

class Bird {
  constructor(fromParent){
    this.size = 25
    this.x = 50
    this.y = this.size + Math.random()*(jeu.height - 2*this.size)
    this.birdVertSpeed = 0
    this.fitness = 0
    this.probability = 0
    this.collision = false
    this.color = getRandomColor()
    if(!fromParent){
      this.brain = new NeuralNetwork([5, 5, 3, 1])
      this.brain.drawY = 1000
    }
    else{
      // Selection d'un parent
      let mother = pickParent()
      this.brain = mother
      this.brain.mutate(jeu.mutationRate)
    }
  }
}

class Tuyau {
  constructor(){
    jeu.holePipe = jeu.holePipe * jeu.holePipeDecreaseRate
    if(jeu.holePipe < jeu.holePipeMin) jeu.holePipe = jeu.holePipeMin

    this.x       = jeu.width
    this.width   = jeu.pipeWidth
    let h1Part   = Math.random() * (1-jeu.holePipe)
    this.height1 = jeu.height*h1Part
    this.height2 = jeu.height - this.height1 - jeu.holePipe*jeu.height
    this.y1      = 0
    this.y2      = jeu.height - this.height2
  }
}

const calculateFitness = () => {
  let minFit = 1000000
  for(let i=0; i<jeu.nbBirds; i++){
    // reduction des ecarts de fitness avec minFit:
    if(jeu.listDeadBirds[i].fitness < minFit) minFit = jeu.listDeadBirds[i].fitness
  }
  jeu.listDeadBirds.forEach(elem => elem.fitness -= minFit)

  // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
  for(let i=0; i<jeu.nbBirds; i++){
    jeu.listDeadBirds[i].fitness = Math.pow(jeu.listDeadBirds[i].fitness, 4)
  }
}

const calculateProbability = () => {
  let sum = 0
  for(let i=0; i<jeu.nbBirds; i++){
    sum += jeu.listDeadBirds[i].fitness
  }
  for(let i=0; i<jeu.nbBirds; i++){
    jeu.listDeadBirds[i].probability = jeu.listDeadBirds[i].fitness / sum
  }
  //jeu.listDeadBirds.forEach(elem => console.log(elem.probability))
}

const pickParent = () => {
  let index = 0
  let rdm = Math.random()
  while( rdm > 0){
    rdm = rdm - jeu.listDeadBirds[index].probability
    index++
  }
  index--
  return jeu.listDeadBirds[index].brain.copy()
}

const restoreGame = () => {
  if(jeu.listeBird.length == 0){
    jeu.lastPipeCreated = 0
    jeu.listePipes = []
    jeu.listeBird = []
    jeu.score = 0
    jeu.nbGeneration++
    jeu.holePipe = jeu.startingHolePipe

    calculateFitness()
    calculateProbability()
    createNewGenBirds()
    jeu.listDeadBirds = []
  }
}

const createNewGenBirds = () => {
  for(i=0; i<jeu.nbBirds; i++){
    jeu.listeBird.push(new Bird("fromParent"))
  }
}

const createBirds = () => {
  for(i=0; i<jeu.nbBirds; i++){
    jeu.listeBird.push(new Bird())
  }
}
const updateScore = () => {
  jeu.score += jeu.speed
}

const createPipes = () => {
	if(jeu.lastPipeCreated + jeu.scoreBetweenPipes < jeu.score ){
		jeu.listePipes.push(new Tuyau())
		jeu.lastPipeCreated = jeu.score
	}
}

const updatePipesPosition = () => {
  for (p of jeu.listePipes) {
		p.x -= jeu.speed
	}
}

const removePastPipes = () => {
  if(jeu.listePipes.length>0){ // Car au tout debut y'a aucun pipes
  let bird = jeu.listeBird[0]
    if((bird.x-jeu.listePipes[0].x) > (jeu.listePipes[0].width+bird.size)){
      jeu.listePipes.splice(0,1)
  	}
  }
}

const collisions = () => {
  if(jeu.listePipes.length>0){ // Si on a 1 pipes devant nous présent (pas le cas au début)

    var midPipe = jeu.listePipes[0].x + (jeu.listePipes[0].width/2)
    var widthHalfPipe = midPipe-jeu.listePipes[0].x
    for(bird of jeu.listeBird){
      if (Math.abs(midPipe - bird.x) < (bird.size+widthHalfPipe)){ // Si on est au niveau du pipe
        if ( (bird.y - bird.size) < (jeu.listePipes[0].height1) // Si on est sur le haut
        || ( (bird.y + bird.size) > (jeu.listePipes[0].y2) )){ // Ou le bas du pipe, collision
          bird.collision = true
        }
      }
    }
  }
  for(i=0; i<jeu.listeBird.length; i++){
    if(jeu.listeBird[i].collision){
      jeu.listeBird[i].fitness = jeu.score
      jeu.listDeadBirds.push(jeu.listeBird[i])
      // if(jeu.listeBird.length == 1){
      //   console.table(jeu.listeBird[0].brain.hiddenWeights.data)
      // }
      jeu.listeBird.splice(i, 1)
    }
  }
}

const gravity = () => {
  jeu.listeBird.forEach((bird, indexBird) => {
    bird.birdVertSpeed += jeu.gravityPower
  	if(bird.birdVertSpeed > 15){
  		bird.birdVertSpeed = 15
  	}

    if(jeu.listePipes.length>=1){ // on a besoin d'un pipe à prendre en entrée pour useBrain
      if(useBrain(bird, indexBird) >= 0.5){
    		if(bird.birdVertSpeed > 0){
    			bird.birdVertSpeed = 0
    		}
    		bird.birdVertSpeed -= 1
    	}
    }
    else{
      if(Math.random() > 0.5){
        if(bird.birdVertSpeed > 0){
    			bird.birdVertSpeed = 0
    		}
        bird.birdVertSpeed -= 0.9
      }
    }

  	if(bird.birdVertSpeed < -15){
  			bird.birdVertSpeed = -15
  	}
  	bird.y += bird.birdVertSpeed
  	if(bird.y > jeu.height - bird.size ){
  		bird.y = jeu.height - bird.size
  	}
  	else if(bird.y < bird.size){
  		bird.y = bird.size
  	}
  })
}

const dessin = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
	ctx.fillStyle = "#83f442"
	for (p of jeu.listePipes) {
		ctx.fillRect(p.x + jeu.positionX, p.y1 + jeu.positionY, p.width, p.height1) // top pipe
		ctx.fillRect(p.x + jeu.positionX, p.y2 + jeu.positionY, p.width, p.height2) // bottom pipe
	}

  if(jeu.listeBird.length>jeu.maxDrawnBird){
    for(i=0; i<jeu.maxDrawnBird; i++){
      ctx.fillStyle = jeu.listeBird[i].color
      ctx.beginPath()
    	ctx.arc(jeu.listeBird[i].x + jeu.positionX, jeu.listeBird[i].y + jeu.positionY, jeu.listeBird[i].size, 0, 2*Math.PI)
    	ctx.fill()
    }
  }
  else{
    for(bird of jeu.listeBird){
      ctx.fillStyle = bird.color
      ctx.beginPath()
    	ctx.arc(bird.x + jeu.positionX, bird.y + jeu.positionX, bird.size, 0, 2*Math.PI)
    	ctx.fill()
    }
  }

  ctx.font = "40px Comic Sans MS"
	ctx.strokeText("Score : " + jeu.score, 50, 40)
  ctx.strokeText("Generation : " + jeu.nbGeneration, 350, 40)
	ctx.strokeRect(jeu.positionX, jeu.positionY, jeu.width, jeu.height); // Cadre noir du jeu
}

const getRandomColor = () => {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i=0; i<6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

window.addEventListener('load', init)
