import { 
  callConstructors, 
  getMixableMeta, 
  initMixableMeta, 
  applyParents, 
  applySelf,
} from './mixable-behaviour.functions'

const DEFAULT_CLASS_NAME = 'AnonymousClass'

export const isMixableClass = constructor => !!(
  typeof constructor === 'function' 
  && getMixableMeta(constructor)
) 

export const isMixableInstance = object => !!(
  typeof object === 'object' 
  && getMixableMeta(object.constructor)
) 

export function createMixableClass({
  name = DEFAULT_CLASS_NAME,
  inherits = [],
  body = class {},
  staticProps = {}
}) {

  let MixableClass
  
  const USE_NAMED_CLASS = true
  if (USE_NAMED_CLASS) {

    const classFactory = new Function('mixableClassConstructor', `
      return function ${name}(...args) {
        return mixableClassConstructor.call(this, ...args)
      }
    `)

    MixableClass = classFactory(function(...args) {
      try {
        callConstructors(this, args)
      } catch(e) {
        throw new Error(`error constructing ${MixableClass.className()}: ${e.message} ${e.stack}`)
      }
      return this
    })

  } else {

    MixableClass = function(...args) {
      try {
        callConstructors(this, args)
      } catch(e) {
        throw new Error(`error constructing ${MixableClass.className()}: ${e.message}`)
      }
      return this
    }

  }

  MixableClass.className = name

  MixableClass.mixableMeta = function () {
    return getMixableMeta(this)
  }
  
  MixableClass.className = function () {
    return this.mixableMeta().name
  }
  
  MixableClass.constructors = function () {
    return this.mixableMeta().constructors
  }

  // @todo: doesnt check that inheritance chain is in correct order
  MixableClass.inheritsFrom = function (...OtherClasses) {

    if (OtherClasses.some(OC => !OC || !isMixableClass(OC))) throw new Error(
      'invalid argument provided to MixableClass.inheritsFrom(). '
      + 'expected array of mixable classes'
    )
    
    return OtherClasses
      .every(OC => OC.constructors()
        .every(({ name: n1 }) => this.constructors()
          .some(({ name: n2 }) => n1 === n2)))
  }

  MixableClass.prototype.is = function (...MixableClasses) {
    return MixableClasses.every(MC => this.constructor.inheritsFrom(MC))
  }

  initMixableMeta(MixableClass, name)
  applyParents(MixableClass, inherits)
  applySelf(MixableClass, body)

  Object.keys(staticProps).forEach(k => MixableClass[k] = staticProps[k])

  return MixableClass
}