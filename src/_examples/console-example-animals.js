Animal = mixable.createMixableClass({
  name: 'Animal',
  body: class {

    static staticProp = 'static prop'
  
    static staticThing() {
      return 'static return'
    }

    static staticUsingClass() {
      return Animal.staticThing() + 'added bit'
    }
  
    exampleProp
    alive = true
    privateProp = false

    _constructor(params) {
        this.exampleProp = 'example'
        this.alive = true
    }
  
    die() { 
      this.alive = false
    }
  
    isAlive() {
      return this.alive
    }
  
    breathe() {
      if (!this.alive) 
        throw new Error('is dead!')
    } 
  
  }
})

// ---------

Swimmer = mixable.createMixableClass({
  name: 'Swimmer',
  inherits: [ Animal ],
  body: class {

    currentPosition
    MAX_DEPTH
  
    _constructor(params) {
      this.currentPosition = 'surface'
      this.MAX_DEPTH = params.maxDepth
    }
  
    getCaughtInNet() {
      this.die()
    }
  
    diveDown() {
      this.currentPosition = 'deep'
      return 'a string'
    }
  
    riseToSurface() {
      this.currentPosition = 'surface'
    }
  
    position() {
      return this.currentPosition
    }
  
  }
})

// ---------

Flyer = mixable.createMixableClass({
  name: 'Flyer',
  inherits: [ Animal ],
  body: class {

    static flyerStatic() {
      return Flyer.staticUsingClass() + 'flyer contribution'
    }
  
    crashIntoWindow() {
      this.die()
    }
  
    diveDown() { return 3 }

    die() { console.log('hi') }
  
    land() { }
  
    takeOff() { }
  
  }
})

// ---------

FlyingFish = mixable.createMixableClass({
  name: 'FlyingFish',
  inherits: [ Flyer, Swimmer ],
  body: class {

    _constructor() {
      this.die()
    }
  
    avoidPredator() {
      this.riseToSurface()
      this.takeOff()
      this.land()
      this.diveDown()
    }

  }
})
