export type Asset = {
  kind: 'url' | 'base64' | 'file' | 'assetDocumentId'
  value: string | File
  assetDocumentProps?: {
    originalFileName?: string
    label?: string
    title?: string
    description?: string
    source?: {
      id: string
      name: string
      url?: string
    }
    creditLine?: string
  }
}

export type AssetDocument = {
  _id: string
  label?: string
  title?: string
  description?: string
  source?: {
    id: string
    name: string
    url?: string
  }
  creditLine?: string
  originalFilename?: string
}

export type ImageShopAsset = {
  secure_url: string
  format: string
  resource_type: string
  type: string
  public_id: string
  derived: { url: string; secure_url: string }[]
}



export type ImageShopAssetSourceIdData = { public_id: string; resource_type: string; type: string }
