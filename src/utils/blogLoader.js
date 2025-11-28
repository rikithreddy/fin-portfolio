/**
 * Blog Loader Utility
 * 
 * Fetches and parses markdown blog posts from the public/blog directory.
 * Each markdown file should have YAML frontmatter with metadata.
 */

/**
 * Parse YAML frontmatter from markdown content.
 * 
 * @param {string} content - Raw markdown file content
 * @returns {Object} Parsed frontmatter and content body
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { metadata: {}, content: content };
  }
  
  const frontmatterStr = match[1];
  const bodyContent = match[2];
  
  const metadata = {};
  const lines = frontmatterStr.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Parse numeric values
    if (!isNaN(value) && value !== '') {
      value = Number(value);
    }
    
    metadata[key] = value;
  }
  
  return { metadata, content: bodyContent };
}

/**
 * Fetch a single blog post by filename.
 * 
 * @param {string} filename - The markdown filename
 * @returns {Promise<Object|null>} Parsed blog post or null on error
 */
async function fetchBlogPost(filename) {
  try {
    const basePath = process.env.PUBLIC_URL || '';
    const response = await fetch(`${basePath}/blog/${filename}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch blog post: ${filename}`);
      return null;
    }
    
    const rawContent = await response.text();
    const { metadata, content } = parseFrontmatter(rawContent);
    
    return {
      ...metadata,
      content: content.trim(),
      slug: filename.replace('.md', '')
    };
  } catch (error) {
    console.error(`Error loading blog post ${filename}:`, error);
    return null;
  }
}

/**
 * Fetch all blog posts listed in the manifest.
 * 
 * @returns {Promise<Array>} Array of parsed blog posts
 */
export async function loadAllBlogs() {
  try {
    const basePath = process.env.PUBLIC_URL || '';
    const manifestResponse = await fetch(`${basePath}/blog/manifest.json`);
    
    if (!manifestResponse.ok) {
      console.error('Failed to fetch blog manifest');
      return [];
    }
    
    const manifest = await manifestResponse.json();
    const blogFilenames = manifest.blogs || [];
    
    const blogPromises = blogFilenames.map(filename => fetchBlogPost(filename));
    const blogs = await Promise.all(blogPromises);
    
    // Filter out any failed fetches and sort by id
    return blogs
      .filter(blog => blog !== null)
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

export default loadAllBlogs;

