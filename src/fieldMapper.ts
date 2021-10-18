import { Asset, AssetDocumentProps } from './types'

const fieldMapper = (asset: Asset, documentProps: AssetDocumentProps) => {
  // Do custom mapping of fields here. Example:
  // asset.altText = { nb: documentProps.description }

  return asset
}

export default fieldMapper
