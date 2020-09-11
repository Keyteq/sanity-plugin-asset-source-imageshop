/* eslint-disable camelcase */
import React from 'react'
import Dialog from 'part:@sanity/components/dialogs/fullscreen'
import Spinner from 'part:@sanity/components/loading/spinner'
import pluginConfig from 'config:asset-source-imageshop'

import { Asset, AssetDocument } from '../types'
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
  private imageshopDomain = "https://client.imageshop.no/InsertImage2.aspx"

  componentDidMount() {
    const hasConfig = !!(pluginConfig.IMAGESHOPTOKEN)
    this.setState({ hasConfig }, () => hasConfig && this.setupMediaLibrary())

    window.addEventListener("message", this.handleEvent)
  }
  componentWillUnmount(): void {

    window.removeEventListener("message", this.handleEvent)
  }

  private setupMediaLibrary = () => {
    const { selectedAssets, selectionType } = this.props
    const firstSelectedAsset = selectedAssets ? selectedAssets[0] : null

    const iframe: ChildNode | null = this.contentRef.current && this.contentRef.current.firstChild
    if (iframe && iframe instanceof HTMLIFrameElement) {
      iframe.onload = () => {
        this.setState({loadingMessage: null})
      }
    }
  }

  handleEvent = (event: any) => {
    console.log(event)
    if (!event || !event.data) {
      return;
    }
    if (typeof event.data !== 'string') {
      return;
    }
    const [imageShopDataString, title, width, height] = event.data.split(";")

    if (!imageShopDataString) {
      return;
    }

    const imageShopData = JSON.parse(imageShopDataString)

    if (!imageShopData || !imageShopData.documentId) {
      return;
    }
    const selectedFiles: Asset[] = [
      {
        kind: 'url',
        value: imageShopData.image.file,
        assetDocumentProps: {
          source: {
            id: imageShopData.documentId,
            name: `imageshop`,
            url: imageShopData.image.file
          }
        }
      }
    ]
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
          Edit the <code>./config/asset-source-imageshop.json</code> file in your Sanity Studio
          folder.
        </p>
        <p>
          You can get your credentials by visiting the{' '}
          <a href="https://imageshop.com/console" rel="noopener noreferrer" target="_blank">
            ImageShop console
          </a>{' '}
          and get your Cloud name and API key.
        </p>
      </div>
    )
  }

  render() {


    const iframeParams = {
      'IFRAMEINSERT': 'true',
      'IMAGESHOPTOKEN': pluginConfig.IMAGESHOPTOKEN,
      'FORMAT': 'json'
    }
    const url = `${this.imageshopDomain}?${ new URLSearchParams(iframeParams)}`

    const { hasConfig, loadingMessage } = this.state
    return (
      <Dialog title="Select image from ImageShop" onClose={this.handleClose} isOpen>
        {hasConfig && loadingMessage && <Spinner fullscreen center message={loadingMessage} />}
        {hasConfig && (
          <div
            ref={this.contentRef}
            className={styles.widget}
            id={`imageshopWidget-${this.domId}`}
          >
            <iframe width="100%" src={url} />
          </div>
        )}
        {!hasConfig && this.renderConfigWarning()}
      </Dialog>
    )
  }
}
