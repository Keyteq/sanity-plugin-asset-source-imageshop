import ImageShopAssetSource from '../src/components/ImageShopAssetSource'

describe('ImageShopAssetSource', () => {
  it('ImageShopAssetSource is instantiable', () => {
    expect(
      new ImageShopAssetSource({
        onSelect: () => void 0,
        onClose: () => void 0,
        selectionType: 'single'
      })
    ).toBeInstanceOf(ImageShopAssetSource)
  })
})
