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

  try {
    const contentfulClient = createClient({ accessToken: contentfulToken });

    const dato = new SiteClient(datoCmsToken, {
      environment: datoCmsEnvironment,
      baseUrl: datoCmsCmaBaseUrl,
    });

    const contentful = await contentfulClient.getSpace(contentfulSpaceId);
    spinner.succeed();

    return { dato, contentful };
  } catch (e) {
    spinner.fail();
    throw e;
  }
};
