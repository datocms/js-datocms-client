import { createClient } from 'contentful-management';
import ora from 'ora';
import SiteClient from '../site/SiteClient';

export default async (contentfulToken, contentfulSpaceId, datoCmsToken) => {
  const spinner = ora('Configuring DatoCMS/Contentful clients').start();
  const contentfulClient = createClient({ accessToken: contentfulToken });
  const dato = new SiteClient(datoCmsToken);
  let contentful;
  try {
    contentful = await contentfulClient.getSpace(contentfulSpaceId);
    spinner.succeed();
  } catch (e) {
    spinner.fail(e);
    process.exit();
  }
  return { dato, contentful };
};
