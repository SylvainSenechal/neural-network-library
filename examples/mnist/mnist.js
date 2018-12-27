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

    }
    this.setActivationFunction()
    this.setLearningRate()

  }
  setActivationFunction(func = sigmoid) {
    this.activationFunction = func;
  }
  setLearningRate(learning_rate = 0.1) {
    this.learning_rate = learning_rate;
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

const sigmoid = new ActivationFunction(
  x => 1 / (1 + Math.exp(-x)),
  y => y * (1 - y)
)
const relu = new ActivationFunction(
  x => x < 0 ? 0 : x,
  y => y < 0 ? 0 : 1
)
const leakyRelu = new ActivationFunction(
  x => x < 0 ? 0.01*x : x,
  y => y < 0 ? 0.01 : 1
)
const tanh = new ActivationFunction(
  x => Math.tanh(x),
  y => 1 - (y * y)
)
const identity = new ActivationFunction(
  x => x,
  y => 1
)
const step = x => x < 0 ? 0 : 1


//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

var ctx, canvas
var ctxNeuralNetwork, canvasNN
var contextChart
var myChart

var width, height

const url = 'https://sylvainsenechal.github.io/projects/tensorFlow/dataMnist.json';

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

  createChart()
  initCanvas()
  getData(url)

}

let trainingSpeed = 20
const loop = () => {
  for( let i = 0; i < trainingSpeed; i++){
    training()
  }

  guess()
  dessin()
  // changeGrid()

  requestAnimationFrame(loop);
}

const getData = url => {
  fetch(url)
  	.then(response => {
      return response.json();
    })
  	.then( data  => {
  		console.log(data.entries[0]);
      listInputs = data.entries
      loop()
  	});
}

let listInputs
let brain = new NeuralNetwork([784, 10])
brain.setActivationFunction(sigmoid)
brain.setLearningRate(0.2)
brain.drawX = 100
brain.drawY = 800

const training = () => {
  let idInput = Math.floor(Math.random()*listInputs.length)
  let inputs = []
  for( let i = 0; i < 784; i++){
    inputs[i] = listInputs[idInput][i+1]
  }

  let outputTarget = []
  for(let i = 0; i < 10; i++){
    if( i === Number(listInputs[idInput].label))  outputTarget[i] = 1
    else outputTarget[i] = 0
  }
  // console.log(outputTarget)

  brain.train(inputs, outputTarget)
}

const guess = () => {
  let inputs = []

  for( let i = 0; i < nbCase; i++){
    for( let j = 0; j < nbCase; j++){
      inputs.push(grid[j][i])
    }
  }

  NeuralNetwork.draw(brain, ctxNeuralNetwork, inputs)

  let results = brain.think(inputs)
  myChart.data.datasets[0].data = results
  myChart.update()
  document.getElementById('result').innerHTML = 'Result guessed : ' + results[0]
}

const changeGrid = () => {

  for( let i = 0; i < 784; i++){
    let a = Math.floor(i/28)
    let b = i%28

    grid[a][b] = listInputs[42][i+1]
  }
}

let grid = []
let widthCase = 10
let nbCase = 28
let offset = 150

const initCanvas = () => {
  for(let i = 0; i < nbCase; i++){
    grid[i] = []
    for(let j = 0; j < nbCase; j++){
      grid[i][j] = 0
    }
  }
}


const dessin = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  for(let i = 0; i < nbCase; i++){
    for(let j = 0; j < nbCase; j++){
      if(grid[i][j] === 0){
        ctx.fillStyle = "#000000"
      }
      else{
        ctx.fillStyle = 'rgb(' + grid[i][j]*255+ ',' + grid[i][j]*255+ ',' + grid[i][j]*255+ ')'
      }
      ctx.fillRect(i*widthCase + offset, j*widthCase + offset, widthCase, widthCase);
    }
  }
}

var mouseDown = false
document.onmousedown = e => {
  mouseDown = true
}
document.onmouseup = e => {
  mouseDown = false
}

document.onmousemove = e => {
  l = Math.floor((e.clientX-offset)/widthCase)
  c = Math.floor((e.clientY-offset)/widthCase)
  if(mouseDown){
    try{
      grid[l][c] = 1
      grid[l-1][c] = (0.5>grid[l-1][c]) ? 0.5 : grid[l-1][c]
      grid[l-2][c] = (0.25>grid[l-2][c]) ? 0.25 : grid[l-2][c]

      grid[l+1][c] = (0.5>grid[l+1][c]) ? 0.5 : grid[l+1][c]
      grid[l+2][c] = (0.25>grid[l+2][c]) ? 0.25 : grid[l+2][c]

      grid[l][c] = 1
      grid[l][c-1] = (0.5>grid[l][c-1]) ? 0.5 : grid[l][c-1]
      grid[l][c-2] = (0.25>grid[l][c-2]) ? 0.25 : grid[l][c-2]
      grid[l][c+1] = (0.5>grid[l][c+1]) ? 0.5 : grid[l][c+1]
      grid[l][c+2] = (0.25>grid[l][c+2]) ? 0.25 : grid[l][c+2]

      grid[l-1][c-1] = (0.5>grid[l-1][c-1]) ? 0.5 : grid[l-1][c-1]
      grid[l+1][c+1] = (0.5>grid[l+1][c+1]) ? 0.5 : grid[l+1][c+1]
      grid[l-1][c+1] = (0.5>grid[l-1][c+1]) ? 0.5 : grid[l-1][c+1]
      grid[l+1][c-1] = (0.5>grid[l+1][c-1]) ? 0.5 : grid[l+1][c-1]
    }
    catch(err){
      // console.log(err)
    }
  }
}

const createChart = () => {
  contextChart = document.getElementById("myChart").getContext('2d');
  myChart = new Chart(contextChart, {
    type: 'bar',
    data: {
      labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      datasets: [{
        label: '# of Votes',
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
}

window.addEventListener('load', init);
