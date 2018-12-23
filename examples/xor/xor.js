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

  add(n) {
    if (n instanceof Matrix) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += n.data[i][j];
        }
      }
    } else {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] += n;
        }
      }
    }
  }

  static subtract(a, b) {
    // Return a new Matrix a-b
    let result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < result.rows; i++) {
      for (let j = 0; j < result.cols; j++) {
        result.data[i][j] = a.data[i][j] - b.data[i][j];
      }
    }
    return result;
  }

  applyActivationFunction(func){
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j];
        this.data[i][j] = func(val);
      }
    }
  }
  static map(matrix, func) {
    let result = new Matrix(matrix.rows, matrix.cols);
    // Apply a function to every element of matrix
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        let val = matrix.data[i][j];
        result.data[i][j] = func(val);
      }
    }
    return result;
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

  multiply(n) {
    if (n instanceof Matrix) {
      // hadamard product
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n.data[i][j];
        }
      }
    }
    else {
      // Scalar product
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.cols; j++) {
          this.data[i][j] *= n;
        }
      }
    }
  }

  static transpose(matrix) {
    let result = new Matrix(matrix.cols, matrix.rows);
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.cols; j++) {
        result.data[j][i] = matrix.data[i][j];
      }
    }
    return result;
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
  constructor(listLayers, drawX = 80, drawY = 80, gapLayer = 200, gapPerceptron = 50, radiusPerceptron = 20, thicknessWeights = 4) {
    if(listLayers instanceof NeuralNetwork){
      let nn = listLayers

      let layers = []
      nn.layers.forEach( (layer, index) => layers[index] = layer.copy())
      this.layers = layers

      let listBias = []
      nn.listBias.forEach( (bias, index) => listBias[index] = bias.copy())
      this.listBias = listBias

      this.drawX = nn.drawX
      this.drawY = nn.drawY
      this.gapLayer = nn.gapLayer
      this.gapPerceptron = nn.gapPerceptron
      this.radiusPerceptron = nn.radiusPerceptron
      this.thicknessWeights = nn.thicknessWeights

      this.learning_rate = 0.1
    }
    else{
      let layers = []
      listLayers.forEach( (layer, index, listLayers) => {
        if(index != listLayers.length -1){
          layers[index] = new Matrix(listLayers[index+1], layer)
        }
      })
      this.layers = layers

      let listBias = []
      listLayers.forEach( (layer, index, listLayers) => {
        if(index != listLayers.length -1){
          listBias[index] = new Matrix(listLayers[index+1], 1)
        }
      })
      this.listBias = listBias

      this.drawX = drawX
      this.drawY = drawY
      this.gapLayer = gapLayer
      this.gapPerceptron = gapPerceptron
      this.radiusPerceptron = radiusPerceptron
      this.thicknessWeights = thicknessWeights

      this.learning_rate = 0.1
    }
    this.setActivationFunction();

  }
  setActivationFunction(func = sigmoid) {
    this.activationFunction = func;
  }
  copy(){
    return new NeuralNetwork(this);
  }
  mutate(mutationRate){
    this.layers.forEach( layer => layer.mutate(mutationRate))
  }
  think(inputs){
    let outputs = Matrix.toMatrix(inputs)
    this.layers.forEach( (layer, index) => {
      let result = Matrix.multiply(layer, outputs)
      result.add(this.listBias[index])
      result.applyActivationFunction(this.activationFunction.func)
      outputs = result
    })
    return Matrix.toArray(outputs)
  }

  train(inputsArray, targetArray){
    let outputs = Matrix.toMatrix(inputsArray)
    let listResult = []
    listResult.push(outputs)
    this.layers.forEach( (layer, index) => {
      let result = Matrix.multiply(layer, outputs)
      result.add(this.listBias[index])
      result.applyActivationFunction(this.activationFunction.func)
      listResult.push(result)
      outputs = result
    })
    let targets = Matrix.toMatrix(targetArray)

    let errors = Matrix.subtract(targets, outputs)
    let gradients = Matrix.map(outputs, this.activationFunction.dfunc)
    gradients.multiply(errors)
    gradients.multiply(this.learning_rate)

    let hiddenTransposed = Matrix.transpose(listResult[this.layers.length-1])
    let weightsDeltas = Matrix.multiply(gradients, hiddenTransposed)
    this.listBias[this.layers.length-1].add(gradients)
    this.layers[this.layers.length-1].add(weightsDeltas)

    for( let i = this.layers.length-1; i > 0; i--){ // i stop à 1
      let whoT = Matrix.transpose(this.layers[i]);
      let err = Matrix.multiply(whoT, errors)
      errors = err

      let gradients = Matrix.map(listResult[i], this.activationFunction.dfunc)
      gradients.multiply(errors)
      gradients.multiply(this.learning_rate)

      let hiddenTransposed = Matrix.transpose(listResult[i-1])
      let weightsDeltas = Matrix.multiply(gradients, hiddenTransposed)

      this.layers[i-1].add(weightsDeltas)
      this.listBias[i-1].add(gradients)
    }
  }


// ADD BIAS TO DRAW FUNCTION
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
      result.applyActivationFunction(nn.activationFunction.func)
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

class ActivationFunction {
  constructor(func, dfunc) {
    this.func = func;
    this.dfunc = dfunc;
  }
}
// Ajouter BIAS ?
// Passer le code en full anglais
// Mettre les functions d'activations dans la lib
const sigmoid = new ActivationFunction(
  x => 1 / (1 + Math.exp(-x)),
  y => y * (1 - y)
)
const relu = new ActivationFunction(
  x => x < 0 ? 0 : x,
  y => y < 0 ? 0 : 1
)
const tanh = new ActivationFunction(
  x => Math.tanh(x),
  y => 1 - (y * y)
)
const step = x => x < 0 ? 0 : 1
const identity = new ActivationFunction(
  x => x,
  y => 1
)


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

  loop()
}

let trainingSpeed = 100
cpt = 0
const loop = () => {

  for( let i = 0; i < trainingSpeed; i++){
    training()
  }

  dessin()
  if(cpt%100 === 0)  NeuralNetwork.draw(brain, ctxNeuralNetwork, listInputs[Math.floor(Math.random()*4)].i)
  cpt++
  requestAnimationFrame(loop)
}

let brain = new NeuralNetwork([2, 8, 4, 2, 1])
brain.setActivationFunction(sigmoid)
brain.drawX = 100
brain.drawY = 500

let listInputs = [
  {i: [0, 0], o: [0]},
  {i: [0, 1], o: [1]},
  {i: [1, 0], o: [1]},
  {i: [1, 1], o: [0]}
]


const training = () => {
  let inputs = listInputs[Math.floor(Math.random()*4)]
  brain.train(inputs.i, inputs.o)
}

gridX = 30
gridY = 30
sizeDraw = 10
const dessin = () => {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)


  for( let i = 0; i < gridX; i++){
    for (let j = 0; j < gridY; j++){
      let results = brain.think([i/gridX, j/gridY])
      let colorIntensity = 255 * results[0]
      ctx.fillStyle = 'rgb(' + colorIntensity + ', ' + colorIntensity + ',' + colorIntensity + ')'
      ctx.fillRect(i*sizeDraw, j*sizeDraw, sizeDraw, sizeDraw);
    }
  }
}

window.addEventListener('load', init)
