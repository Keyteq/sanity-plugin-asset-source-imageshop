import index from '../src/index'
import ImageShopAssetSource from '../src/components/ImageShopAssetSource'

describe('index', () => {
  it('has a name', () => {
    expect(index.name).toBe('imageshop')
  })
  it('has a component', () => {
    expect(index.component).toBe(ImageShopAssetSource)
  })
})
