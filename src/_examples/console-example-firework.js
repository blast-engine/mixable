
createModelClass = ({ 
  options:o, 
  mixableFactory:f
}) => 
  f.createMixableClass({
    name: 'Model',
    body: class {

      _constructor(args = {}) {      
        this.args = args
        this.propagatedProvisions 
          = this.p 
          = args.propagatedProvisions || {}
        this.persistentCache 
          = this.c 
          = args.persistentCache || {}
      }

      spinoff(Model, args = {}) {
        return new Model({ 
          ...args, 
          propagatedProvisions: this.p 
        })
      }

      clone(args = {}) {
        return this.spinoff(this.class(), { ...this.args, ...args })
      }

      _ensure({ check, failMsg }) {
        if (!o.checkAssertions) return
        if (check()) return
        o.onAssertionFail(failMsg)
      }

      abst() {
        this._abstract()
      }

      _abstract() {
        if (!o.checkAssertions) return

        let method
        try { throw new Error() }
        catch(e) { method = e.stack.split('(')[1].split('at')[1] }
        
        o.onAssertionFail(`abstract methods cannot be called directly: ${method}`)
      }

    }
  })

// ---

createLoadableModelClass = ({ 
  options:o, 
  mixableFactory:f,
  dependencies:d
}) => 
  f.createMixableClass({
    name: 'LoadableModel',
    inherits: [ d.Model ],
    body: class {

      isLoaded() {
        this._abstract()
      }
  
      _ensureLoaded() {
        this._ensure({
          check: () => this.isLoaded(),
          failMsg: 'data is not loaded'
        })
      }
  
    }
  })

// ---

Model = createModelClass({ 
  options: { checkAssertions: true, onAssertionFail: msg => { throw new Error(msg) } }, 
  mixableFactory: mixable 
})

LoadableModel = createLoadableModelClass({ 
  options: { checkAssertions: true, onAssertionFail: msg => { throw new Error(msg) } }, 
  mixableFactory: mixable,
  dependencies: { Model }
})

m = new Model()
lm = new LoadableModel()