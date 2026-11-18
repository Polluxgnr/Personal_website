import defaults from './contact.config.json';

/**
 * Contact form settings. Messages are sent through Web3Forms, which emails
 * them to me; the access key only identifies my inbox and is meant to be
 * public (it sits in the page). It comes from contact.config.json, or from
 * the PUBLIC_WEB3FORMS_KEY build variable when that is set.
 */
export const contact = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.PUBLIC_WEB3FORMS_KEY || defaults.web3formsAccessKey,
};
