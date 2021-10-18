/* eslint-disable camelcase */
import React from 'react'
import { Dialog, Spinner, Stack, Flex, Text, Box, Card } from '@sanity/ui'
import pluginConfig from 'config:@labs-tech/sanity-plugin-asset-source-imageshop'
import languageResolver from 'part:@labs-tech/sanity-plugin-asset-source-imageshop/language-resolver'

import {
  Asset,
  AssetDocument,
  AssetDocumentProps,
  ImageShopAsset,
  ImageShopIFrameEventData
} from '../types'
import { IFrame } from './ImageShopAssetSource.styled'

declare global {
  interface Window {
    imageshop: any
  }
}

window.imageshop = window.imageshop || {}

type Props = {
  onSelect: (assets: Asset[]) => void
  onClose: () => void
  selectedAssets?: AssetDocument[]
  selectionType: 'single' | 'multiple'
  isLoadingMultiUpload?: boolean
}

type State = {
  loadingMessage: string | null
  hasConfig: boolean
}

const IMAGESHOP_CLIENT = 'https://client.imageshop.no'

const imageShopAssetToSanityAsset = (
  imageShopData: ImageShopAsset,
  documentTitle?: string
): Asset | null => {
  // Make a check, is this even from imageshop ? Should have .documentId and parsed the first part as json.
  if (!imageShopData || !imageShopData.documentId) {
    return null
  }

  const ASSET_TEXT_LANGUAGE = languageResolver()
  const textObject = imageShopData.text[ASSET_TEXT_LANGUAGE]
  const assetDocumentProps: AssetDocumentProps = {
    source: {
      id: imageShopData.documentId,
      name: `imageshop`
    },
    texts: imageShopData.text
  }

  if (documentTitle) {
    assetDocumentProps.title = documentTitle
  }
  if (textObject?.title) {
    assetDocumentProps.title = textObject.title
  }
  if (textObject?.description) {
    assetDocumentProps.description = textObject.description
  }
  if (textObject?.credits) {
    assetDocumentProps.creditLine = textObject.credits
  }
  return {
    kind: 'url',
    value: imageShopData.image.file,
    assetDocumentProps: assetDocumentProps
  }
}

export default class ImageShopAssetSource extends React.Component<Props, State> {
  static defaultProps = {
    selectedAssets: undefined
  }

  state = {
    loadingMessage: 'Loading ImageShop Media Libary',
    hasConfig: false
  }

  private contentRef = React.createRef<HTMLDivElement>()

  private domId = Date.now()
  private imageshopDomain = `${IMAGESHOP_CLIENT}/InsertImage2.aspx`

  componentDidMount() {
    const hasConfig = !!pluginConfig.IMAGESHOPTOKEN
    this.setState({ hasConfig }, () => hasConfig && this.setupMediaLibrary())
    window.addEventListener('message', this.handleEvent)
  }

  componentWillUnmount(): void {
    window.removeEventListener('message', this.handleEvent)
  }

  isMulti(): boolean {
    return this.props.selectionType === 'multiple'
  }

  private setupMediaLibrary = () => {
    const { selectedAssets, selectionType } = this.props
    const firstSelectedAsset = selectedAssets ? selectedAssets[0] : null

    const iframe: ChildNode | null = this.contentRef.current && this.contentRef.current.firstChild
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.onload = () => {
        this.setState({ loadingMessage: null })
      }
    }
  }

  handleEvent = (event: any) => {
    if (!event || !event.data) {
      return
    }
    if (typeof event.data !== 'string') {
      return
    }
    if (event.origin !== IMAGESHOP_CLIENT) {
      return
    }

    let selectedFiles: Asset[] = []

    const [imageShopDataString, title, width, height] = event.data.split(
      ';'
    ) as ImageShopIFrameEventData

    if (!imageShopDataString) {
      return
    }

    const parsedEventData = JSON.parse(imageShopDataString)

    if (Array.isArray(parsedEventData)) {
      const imageShopDataString = event.data

      if (!imageShopDataString) {
        return
      }

      const imageShopDatas = parsedEventData as ImageShopAsset[]

      if (!imageShopDatas || !Array.isArray(imageShopDatas) || imageShopDatas.length === 0) {
        return
      }

      const assetsToBeUploaded = imageShopDatas
        .map(imageShopObject => imageShopAssetToSanityAsset(imageShopObject))
        .filter(asset => asset !== null) as Asset[]

      if (assetsToBeUploaded) {
        selectedFiles = assetsToBeUploaded
      }
    } else {
      const imageShopData = parsedEventData as ImageShopAsset

      const uploadAsset = imageShopAssetToSanityAsset(imageShopData, title)

      if (uploadAsset) {
        selectedFiles = [uploadAsset]
      }
    }

    this.props.onSelect(selectedFiles)
  }

  handleClose = () => {
    this.props.onClose()
  }

  renderConfigWarning() {
    return (
      <Card tone="caution" padding={4} radius={2}>
        <Stack space={4}>
          <Text as="h1" weight="semibold">
            Missing configuration
          </Text>
          <Text>You must first configure the plugin with your ImageShop credentials</Text>
          <Text>
            Edit the <code>./config/@labs-tech/sanity-plugin-asset-source-imageshop.json</code> file
            in your Sanity Studio folder.
          </Text>
          <Text>
            You can get your credentials by visiting{' '}
            <a href="https://www.imageshop.no/" rel="noopener noreferrer" target="_blank">
              ImageShop
            </a>{' '}
            and get your token.
          </Text>
        </Stack>
      </Card>
    )
  }

  render() {
    const iframeParams: any = {
      IFRAMEINSERT: 'true',
      HIDEIMAGEINFO: 'true',
      INSERTIMIDIATELY: 'true',
      SHOWSIZEDIALOGUE: 'true',
      SHOWCROPDIALOGUE: 'true',
      FREECROP: 'true',
      IMAGESHOPINTERFACENAME: pluginConfig.IMAGESHOPINTERFACENAME || '',
      IMAGESHOPDOCUMENTPREFIX: pluginConfig.IMAGESHOPDOCUMENTPREFIX || '',
      CULTURE: pluginConfig.CULTURE || 'nb-NO',
      PROFILEID: pluginConfig.PROFILEID || '',
      REQUIREDUPLOADFIELDS: pluginConfig.REQUIREDUPLOADFIELDS || '',
      UPLOADFIELDLANGUAGES: pluginConfig.UPLOADFIELDLANGUAGES || 'no,en',
      IMAGESHOPTOKEN: pluginConfig.IMAGESHOPTOKEN,
      IMAGESHOPSIZES: `${pluginConfig.IMAGE_ALIAS || 'Large'};${pluginConfig.IMAGE_MAX_SIZE ||
        '2048x2048'}`,
      FORMAT: 'json'
    }

    if (this.isMulti()) {
      iframeParams.ENABLEMULTISELECT = 'true'
    }

    const url = `${this.imageshopDomain}?${new URLSearchParams(iframeParams)}`

    const { hasConfig, loadingMessage } = this.state
    const { isLoadingMultiUpload } = this.props
    return (
      <Dialog
        id="imageshop-asset-source"
        title="Select image from ImageShop"
        onClose={this.handleClose}
        open
        width={hasConfig ? 4 : 1}
        zOffset={9999}
      >
        {' '}
        <Box padding={4}>
          {isLoadingMultiUpload && (
            <Stack space={3}>
              <Flex align="flex-start" justify="flex-start">
                <Spinner muted />
              </Flex>
              <Text size={1} muted align="left">
                Uploading images, please wait.
              </Text>
            </Stack>
          )}
          {hasConfig && loadingMessage && (
            <Stack space={3}>
              <Flex align="center" justify="center">
                <Spinner muted />
              </Flex>
              <Text size={1} muted align="center">
                {loadingMessage}
              </Text>
            </Stack>
          )}
          {hasConfig && (
            <div ref={this.contentRef} id={`imageshopWidget-${this.domId}`}>
              <IFrame frameBorder={0} width="100%" src={url} />
            </div>
          )}
          {!hasConfig && this.renderConfigWarning()}
        </Box>
      </Dialog>
    )
  }
}
