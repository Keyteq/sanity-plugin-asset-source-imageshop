/* eslint-disable camelcase */
import React from 'react'
import Dialog from 'part:@sanity/components/dialogs/fullscreen'
import Spinner from 'part:@sanity/components/loading/spinner'
import pluginConfig from 'config:@labs-tech/sanity-plugin-asset-source-imageshop'

import {
  Asset,
  AssetDocument,
  AssetDocumentProps,
  ImageShopAsset,
  ImageShopIFrameEventData
} from '../types'
import styles from './ImageShopAssetSource.css'

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
}

type State = {
  loadingMessage: string | null
  hasConfig: boolean
}

const IMAGESHOP_CLIENT = "https://client.imageshop.no"


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
    const hasConfig = !!(pluginConfig.IMAGESHOPTOKEN)
    this.setState({hasConfig}, () => hasConfig && this.setupMediaLibrary())

    window.addEventListener("message", this.handleEvent)
  }

  componentWillUnmount(): void {

    window.removeEventListener("message", this.handleEvent)
  }

  private setupMediaLibrary = () => {
    const {selectedAssets, selectionType} = this.props
    const firstSelectedAsset = selectedAssets ? selectedAssets[0] : null

    const iframe: ChildNode | null = this.contentRef.current && this.contentRef.current.firstChild
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.onload = () => {
        this.setState({loadingMessage: null})
      }
    }
  }

  handleEvent = (event: any) => {
    if (!event || !event.data) {
      return;
    }
    if (typeof event.data !== 'string') {
      return;
    }
    if (event.origin !== IMAGESHOP_CLIENT) {
      return;
    }
    const [imageShopDataString, title, width, height] = event.data.split(";") as ImageShopIFrameEventData

    if (!imageShopDataString) {
      return;
    }

    const imageShopData = JSON.parse(imageShopDataString) as ImageShopAsset;

    // Make a check, is this even from imageshop ? Should have .documentId and parsed the first part as json.
    if (!imageShopData || !imageShopData.documentId) {
      return;
    }

    const ASSET_TEXT_LANGUAGE = pluginConfig.SANITY_ASSET_TEXT_LANGUAGE || 'no';
    const textObject = imageShopData.text[ASSET_TEXT_LANGUAGE];
    const assetDocumentProps: AssetDocumentProps = {
      source: {
        id: imageShopData.documentId,
        name: `imageshop`,
      }
    };

    if (title) {
      assetDocumentProps.title = title;
    }
    if (textObject?.description) {
      assetDocumentProps.description = textObject.description;
    }
    if (textObject?.credits) {
      assetDocumentProps.creditLine = textObject.credits;
    }
    const selectedFiles: Asset[] = [
      {
        kind: 'url', // 'url' does not work due to imageshop does not contain cors
        value: imageShopData.image.file,
        assetDocumentProps: assetDocumentProps
      }
    ];
    this.props.onSelect(selectedFiles)
  }


  handleClose = () => {
    this.props.onClose()
  }

  renderConfigWarning() {
    return (
      <div>
        <h2>Missing configuration</h2>
        <p>You must first configure the plugin with your ImageShop credentials</p>
        <p>
          Edit the <code>./config/@labs-tech/sanity-plugin-asset-source-imageshop.json</code> file in your Sanity Studio
          folder.
        </p>
        <p>
          You can get your credentials by visiting {' '}
          <a href="https://www.imageshop.no/" rel="noopener noreferrer" target="_blank">
            ImageShop
          </a>{' '}
          and get your token.
        </p>
      </div>
    )
  }

  render() {


    const iframeParams = {
      'IFRAMEINSERT': 'true',
      'HIDEIMAGEINFO': 'true',
      'INSERTIMIDIATELY': 'true',
      'SHOWSIZEDIALOGUE': 'true',
      'SHOWCROPDIALOGUE': 'true',
      'FREECROP': 'true',
      'IMAGESHOPINTERFACENAME': pluginConfig.IMAGESHOPINTERFACENAME || '',
      'IMAGESHOPDOCUMENTPREFIX': pluginConfig.IMAGESHOPDOCUMENTPREFIX || '',
      'CULTURE': pluginConfig.CULTURE || 'nb-NO',
      'PROFILEID': pluginConfig.PROFILEID || '',
      'REQUIREDUPLOADFIELDS': pluginConfig.REQUIREDUPLOADFIELDS || '',
      'UPLOADFIELDLANGUAGES': pluginConfig.UPLOADFIELDLANGUAGES || 'no,en',
      'IMAGESHOPTOKEN': pluginConfig.IMAGESHOPTOKEN,
      'IMAGESHOPSIZES': `${pluginConfig.IMAGE_ALIAS || 'Large'};${pluginConfig.IMAGE_MAX_SIZE || '2048x2048'}`,
      'FORMAT': 'json',
    }
    const url = `${this.imageshopDomain}?${new URLSearchParams(iframeParams)}`

    const {hasConfig, loadingMessage} = this.state
    return (
      <Dialog title="Select image from ImageShop" onClose={this.handleClose} isOpen>
        {hasConfig && loadingMessage && <Spinner fullscreen center message={loadingMessage}/>}
        {hasConfig && (
          <div
            ref={this.contentRef}
            className={styles.widget}
            id={`imageshopWidget-${this.domId}`}
          >
            <iframe frameBorder={0} width="100%" src={url}/>
          </div>
        )}
        {!hasConfig && this.renderConfigWarning()}
      </Dialog>
    )
  }
}
