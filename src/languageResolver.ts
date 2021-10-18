import pluginConfig from 'config:@labs-tech/sanity-plugin-asset-source-imageshop'

/**
 * Should return a valid language in imageshop, e.g. en, no, etc.
 * You can implement part:sanity-plugin-asset-source-imageshop/language-resolver to create a custom language resolver.
 *
 * E.g. if you have some kind of localstorage where your current language is stored in your studio, return that language here.
 */
const languageResolver = () => {
  return pluginConfig.SANITY_ASSET_TEXT_LANGUAGE || 'no'
}
export default languageResolver
