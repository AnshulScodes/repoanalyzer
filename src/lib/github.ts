import { Octokit } from 'octokit';

export async function getRepoContent(url: string, token?: string) {
  const octokit = new Octokit({ auth: token });
  
  // Extract owner and repo from URL
  const [, , , owner, repo] = url.split('/');
  
  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: '',
      recursive: true
    });
    
    const files = await Promise.all(
      Array.isArray(response.data) 
        ? response.data
          .filter(file => file.type === 'file')
          .map(async file => {
            const content = await octokit.rest.repos.getContent({
              owner,
              repo,
              path: file.path
            });
            return {
              path: file.path,
              content: Buffer.from((content.data as any).content, 'base64').toString()
            };
          })
        : []
    );
    
    return files;
  } catch (error) {
    console.error('Error fetching repo content:', error);
    throw error;
  }
}