import { copyMembers } from './copy-members.functions'

const ANONYMOUS_CLASS_NAME = 'AnonymousClass'
const META_KEY = '__mixable_meta'

export const isMixableClass = constructor => 
  !!(typeof constructor === 'function' && constructor[META_KEY]) 

export const isMixableInstance = object => 
  !!(typeof object === 'object' && object.constructor[META_KEY]) 

const createCreateMixableClass = ({ registry, opts }) => ({
  name,
  inherits = [],
  body = class {},
  staticProps = {},
  provisions = {}
}) => {

  const assert = ({ check, failMsg }) => {
    if (!opts.doAssertions) return
    else if (check()) return
    else opts.onAssertionFail(failMsg)
  }

  // ---

  if (!name) name = ANONYMOUS_CLASS_NAME + `_${registry.anonymousClassCounter++}`
  
  assert({
    check: () => !registry.classes[name], 
    failMsg: `class ${name} already exists`
  })
  
  // ---

  const callConstructors = (instance, ...args) => {
    const i = instance 
    i._provisions = i._p = provisions
    i._postConstructCallbacks = []
    i.class().constructors().forEach(ctr => ctr.call(i, ...args))
    i._postConstructCallbacks.forEach(cb => cb())
  }

  let MixableClass = function(...args) {
    try { callConstructors(this, ...args) } 
    catch(e) { throw new Error(`error constructing ${MixableClass.className()}: ${e.message} ${e.stack}`) }
    return this
  }

  if (opts.namedClasses) {
    const namedConstructorCode = 
      `return function ${name}(...args) { return mixableClassConstructor.call(this, ...args) }`
    MixableClass = new Function('mixableClassConstructor', namedConstructorCode)(MixableClass)
  }

  // ---

  const inheritedLayers = inherits.reduce((mergedLayers, MixableClass) => {
    const meta = MixableClass.mixableMeta()
    const newLayers = meta.layers
      .filter(({ name: candidateLayerName }) => mergedLayers
        .every(({ name: existingLayerName }) => candidateLayerName !== existingLayerName ))
    return mergedLayers.concat(newLayers)
  }, [])

  const bodyLayer = { 
    name,
    staticProps,
    body,
    _constructor: body.prototype._constructor || function(){}
  }

  const layers = inheritedLayers.concat(bodyLayer)
  const meta = { name, layers }
  MixableClass[META_KEY] = meta

  layers.forEach(layer => {
    copyMembers({ source: layer.body, dest: MixableClass })
    Object.keys(layer.staticProps)
      .forEach(propName => MixableClass[propName] = staticProps[propName])
  })

  // ---

  MixableClass.provisions = provisions

  MixableClass.mixableMeta = function() {
    return this[META_KEY]
  }
  
  MixableClass.className = function() {
    return this[META_KEY].name
  }

  MixableClass.layers = function() {
    return this[META_KEY].layers
  }
  
  MixableClass.constructors = function() {
    return this[META_KEY].layers.map(l => l._constructor)
  }

  MixableClass.inheritsFrom = function (...OtherClasses) {
    assert({
      check: OtherClasses.some(OC => !OC || !isMixableClass(OC)),
      failMsg: 'invalid argument provided to MixableClass.inheritsFrom(). '
        + 'expected array of mixable classes'
    })
    
    return OtherClasses.every(OC => { 
      const meta = this[META_KEY]
      const otherMeta = OC[META_KEY]
      return meta.layers.some(layer => layer.name === otherMeta.name)
    })
  }

  // ---

  MixableClass.prototype.class = function () {
    return this.constructor
  }

  MixableClass.prototype.className = function() {
    return this.class()[META_KEY].name
  }

  MixableClass.prototype.is = function (...MixableClasses) {
    return MixableClasses.every(MC => this.class().inheritsFrom(MC))
  }

  // ---

  registry.classes[name] = MixableClass
  return MixableClass
}

// ---

export const createMixableFactory = async (opts = {}) => {
  const registry = { classes: {}, anonymousClassCounter: 0 }

  const createMixableClass = createCreateMixableClass({ 
    registry,
    opts: {
      namedClasses: !!opts.namedClasses,
      doAssertions: !!opts.doAssertions,
      onAssertionFail: opts.onAssertionFail || (msg => { throw new Error(msg) })
    }
  })
  
  return {
    registry,
    isMixableClass,
    isMixableInstance,
    createMixableClass
  }
}