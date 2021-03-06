function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}



function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    
    this.setX = x => this.elemento.style.left = `${x}px`

    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


function Barreiras(altura, largura, abertura, des, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura,abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = des
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX()- deslocamento)
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzarMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzarMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo){
    let voando = false;

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'img/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => {
        voando = true
        this.elemento.style.transform = 'rotate(-25deg)'
    }
    window.onkeyup = e => {
        voando = false
        this.elemento.style.transform = 'rotate(25deg)'
    }

    window.ontouchstart = e => {
        voando = true
        this.elemento.style.transform = 'rotate(-25deg)'
    } 

    window.ontouchend = e => {
        voando = false
        this.elemento.style.transform = 'rotate(25deg)'
    }
    
    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if( novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
 }


function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function Recomecar(){
    this.elemento = novoElemento('div','recomecar')

    const botao = novoElemento
    ('img')
    botao.src = 'https://img.icons8.com/external-becris-lineal-becris/64/000000/external-refresh-mintab-for-ios-becris-lineal-becris.png'

    botao.onclick = () =>{
        document.location.reload(true)
    }

    this.elemento.appendChild(botao)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(par => {
        if(!colidiu){
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(des,abertura, espaco){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight 
    const largura = areaDoJogo.clientWidth
    
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, abertura,des, espaco, ()=> progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)
    const recomecar = new Recomecar()
    
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () =>{
        // loop do jogo
        const temporizador = setInterval(() =>{
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro,barreiras)){
                clearInterval(temporizador)
                areaDoJogo.appendChild(recomecar.elemento)
                window.onkeydown = () =>{}
                window.onkeyup = () =>{}
                window.ontouchstart = () =>{}
            }
        },20)
    }
}

const areaForm = document.querySelector('.formulario')
const form = document.forms[0]
form.dificuldade.value = localStorage.getItem('nivel')

form.onsubmit = e => {
    e.preventDefault()
    const level = e.target.dificuldade.value
    localStorage.setItem('nivel',level)
    

    if(level === 'Dificil'){
        new FlappyBird(5,200,500).start()
        areaForm.style.display = 'none'
    }else if(level === 'Medio'){
        new FlappyBird(4,250,400).start()
        areaForm.style.display = 'none'
    }else{
        new FlappyBird(3,270,400).start()
        areaForm.style.display = 'none'
    }
}

