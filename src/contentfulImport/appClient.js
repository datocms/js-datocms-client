import { createClient } from 'contentful-management';
import ora from 'ora';
import SiteClient from '../site/SiteClient';

export default async (
  contentfulToken,
  contentfulSpaceId,
  datoCmsToken,
  datoCmsEnvironment,
  datoCmsCmaBaseUrl,
) => {
  const spinner = ora('Configuring DatoCMS/Contentful clients').start();
  const contentfulClient = createClient({ accessToken: contentfulToken });
  const dato = new SiteClient(
    datoCmsToken,
    { environment: datoCmsEnvironment },
    datoCmsCmaBaseUrl,
  );
  let contentful;
  try {
    contentful = await contentfulClient.getSpace(contentfulSpaceId);
    spinner.succeed();
  } catch (e) {
    spinner.fail(typeof e === 'object' ? e.message : e);
    process.exit();
  }
  return { dato, contentful };
};
