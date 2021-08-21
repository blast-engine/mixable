import { copyMembers } from './copy-members.functions'

const META_KEY = '__mixable_meta'

/**
 * initializes the mixable metadata IN PLACE
 * @param constructor 
 * @param name 
 */
export function initMixableMeta(constructor, name) {
  constructor[META_KEY] = { name, constructors: [] }
}
  
/**
 * retrieves mixable data
 * @param Mixable 
 */  
export function getMixableMeta(Mixable) {
  return Mixable[META_KEY]
}

/**
 * 
 * @param Onion 
 * @param Layer 
 */
function applyLayer(Onion, Layer) {
  const meta = Onion.mixableMeta()

  const newConstructors = Layer.constructors()
    .filter(({ name: candidateName }) => !Onion.constructors()
      .some(({ name: existingLayerName }) => candidateName === existingLayerName )
    )

  meta.constructors = newConstructors.concat(Onion.constructors())

  copyMembers({ source: Layer, dest: Onion })
}

/**
 * 
 * @param Mixable 
 * @param constructors 
 */ 
export function applyParents(Mixable, Parents) {
  Parents.forEach(Parent => applyLayer(Mixable, Parent))
}

/**
 * 
 * @param MixableClass 
 * @param body 
 */
export function applySelf(Mixable, layer){
  
  const meta = Mixable.mixableMeta()

  meta.constructors.unshift({ 
    name: Mixable.className(),
    _constructor: layer.prototype._constructor || function(){}
  })

  delete layer.prototype._constructor

  copyMembers({ source: layer, dest: Mixable })

}
  
/**
 * 
 * @param instance 
 * @param args 
 */
export function callConstructors(
  instance = {},
  args = []
) {
  instance.class().constructors()
    .forEach(({ _constructor }) => _constructor.call(instance, ...args))
}