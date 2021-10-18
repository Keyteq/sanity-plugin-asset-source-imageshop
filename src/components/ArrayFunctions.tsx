import { ArraySchemaType } from '@sanity/types'
import { AddIcon } from '@sanity/icons'
import React, { ReactNode, useState } from 'react'
import { Button } from '@sanity/ui'
import { randomKey } from '@sanity/util/content'
import OldArrayFunctions from 'part:@sanity/form-builder/input/array/functions-default'
import fieldMapper from 'part:@labs-tech/sanity-plugin-asset-source-imageshop/field-mapper'
import ImageShopAssetSource from './ImageShopAssetSource'
import { Asset, AssetDocumentProps } from '../types'

// These are the props any implementation of the ArrayFunctions part will receive
export interface ArrayFunctionsProps<SchemaType extends ArraySchemaType, MemberType> {
  className?: string
  type: SchemaType
  children?: ReactNode
  value?: MemberType[]
  readOnly: boolean | null
  onAppendItem: (itemValue: MemberType) => void
  onPrependItem: (itemValue: MemberType) => void
  onFocusItem: (item: MemberType, index: number) => void
  onCreateValue: (type: SchemaType) => MemberType
  onChange: (event: any) => void
}

/**
 * This function overrides the array-functions to also add a upload multiple images for the imageshop plugin.
 * @param props
 * @constructor
 */
export default function ArrayFunctions<MemberType>(
  props: ArrayFunctionsProps<ArraySchemaType, MemberType>
) {
  const { type, readOnly, children, onAppendItem } = props
  const [isAssetSourceOpen, setIsAssetSourceOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // @ts-ignore
  const shouldDisplayMultiUpload = type?.options?.batchUpload

  const handleAddMultipleBtnClick = () => {
    setIsAssetSourceOpen(true)
  }

  const onClose = () => {
    setIsAssetSourceOpen(false)
  }

  const onSelect = async (files: Asset[]) => {
    const baseClient = require('part:@sanity/base/client')
    const client = baseClient.withConfig({ apiVersion: '2021-10-10' })

    setIsLoading(true)

    // We support only kind url.

    const promises = files.map(async file => {
      if (typeof file.value === 'string' && file.kind === 'url') {
        // Convert url to to blob
        const resp = await fetch(file.value)
        const blob = await resp.blob()

        const dataLookup: AssetDocumentProps = file.assetDocumentProps || {}

        // Upload image via sanity client.
        const imageAssetDocument = await client.assets.upload('image', blob, {
          filename: file.assetDocumentProps?.originalFileName,
          ...dataLookup
        })

        // Create a random key for the array item.
        const _key = randomKey(12)

        // Create object based on sanity datastructure for an image.
        const theImage: any = fieldMapper(
          {
            _type: 'image',
            _key,
            asset: {
              _type: 'reference',
              _ref: imageAssetDocument._id
            }
          },
          dataLookup?.texts || {}
        )

        // @ts-ignore
        onAppendItem(theImage)
      }
    })

    await Promise.all(promises)

    setIsLoading(false)

    setIsAssetSourceOpen(false)
  }

  return (
    <OldArrayFunctions {...props}>
      {shouldDisplayMultiUpload && (
        <Button
          icon={AddIcon}
          mode="ghost"
          onClick={handleAddMultipleBtnClick}
          text="Add multiple images"
        />
      )}
      {isAssetSourceOpen && (
        <ImageShopAssetSource
          isLoadingMultiUpload={isLoading}
          selectedAssets={[]}
          onClose={onClose}
          onSelect={onSelect}
          selectionType={'multiple'}
        />
      )}
    </OldArrayFunctions>
  )
}
