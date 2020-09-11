# Sanity Asset Source Plugin: ImageShop

Access and select photos from your ImageShop account within the Sanity Studio.

[![Build Status](https://travis-ci.org/sanity-io/sanity-plugin-asset-source-imageshop.svg?branch=master)](https://travis-ci.org/sanity-io/sanity-plugin-asset-source-imageshop)


## Installation

`sanity install asset-source-imageshop`

Edit the config file found in `./config/asset-source-imageshop.json` with your ImageShop Cloud name and API key.

You can find these in the ImageShop Console: https://imageshop.com/console

## Part name

If you need to customize available asset sources, the plugin part name for this asset source is:

`part:sanity-plugin-asset-source-imageshop/image-asset-source`

## Finding back to the original asset in ImageShop (public_id, resource_type, type)
This info exists on the asset document, however it's base64-encoded in the `source.id` field.
It's base64 encoded because Sanity asset-source plugins have a generic way of identifying assets (provider name and id), and ImageShop is a bit special needing to have three items to programatically find back to the original image, as opposed to just an id as most other sources do.

```
JSON.parse(atob(source.id))

> {"public_id":"samples/imageshop-group","resource_type":"image","type":"upload"}
```

## Developing on this module

To simulate using your development version as a real module inside a studio, you can do the following:

* Run `npm install && npm link` from the root of this repository.
* Run `npm run watch` to start developing and build the module when changes are made.

#### Displaying your development version inside a studio

**With the mono-repo's `test-studio`:**

  * Bootstrap the monorepo: `npm run bootstrap`
  * Add `sanity-plugin-asset-source-imageshop` with the current version number to `package.json` in the `test-studio` root folder (but don't run `npm install` afterwards)
  * Run `npm link sanity-plugin-asset-source-imageshop` inside the mono-repo's root.
  * Add `asset-source-imageshop` to the list of the studios plugins in `sanity.json`.
  * Restart the `test-studio`

**With a regular Sanity Studio:**
  * Run `npm install`
  * Add `sanity-plugin-asset-source-imageshop` with the current version number to `package.json`.
  * Run `npm link sanity-plugin-asset-source-imageshop`
  * Add `asset-source-imageshop` to the list of the studios plugins in `sanity.json`.
  * Start the studio

When you are done and have published your new version, you can run `npm unlink` inside this repo, and `npm unlink sanity-plugin-asset-source-imageshop` inside the mono-repo or studio to get back to the normal state. Then run `npm run bootstrap` for the mono-repo or `npm install` inside the regular studio to use the published version.


## Futher reading
* https://imageshop.com/documentation/media_library_widget
* https://www.sanity.io/docs/custom-asset-sources
