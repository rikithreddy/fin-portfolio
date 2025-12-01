/**
 * Testimonial Loader Utility
 *
 * Fetches and parses markdown testimonials from the public/testimonials directory.
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
 * Get the base URL for fetching testimonial content.
 * Always use GitHub raw content for reliability.
 */
function getTestimonialBaseUrl() {
  return 'https://raw.githubusercontent.com/rikithreddy/fin-portfolio/master/public';
}

/**
 * Fetch a single testimonial by filename.
 */
async function fetchTestimonial(filename) {
  try {
    const baseUrl = getTestimonialBaseUrl();
    const url = `${baseUrl}/testimonials/${filename}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch testimonial: ${filename}`);
      return null;
    }

    const rawContent = await response.text();
    const { metadata, content } = parseFrontmatter(rawContent);

    return {
      ...metadata,
      text: content.trim(),
      slug: filename.replace('.md', '')
    };
  } catch (error) {
    console.error(`Error loading testimonial ${filename}:`, error);
    return null;
  }
}

/**
 * Fetch all testimonials listed in the manifest.
 */
export async function loadAllTestimonials() {
  try {
    const baseUrl = getTestimonialBaseUrl();
    const url = `${baseUrl}/testimonials/manifest.json`;
    const manifestResponse = await fetch(url);

    if (!manifestResponse.ok) {
      console.error('Failed to fetch testimonials manifest');
      return [];
    }

    const manifest = await manifestResponse.json();
    const testimonialFilenames = manifest.testimonials || [];

    const testimonialPromises = testimonialFilenames.map(filename => fetchTestimonial(filename));
    const testimonials = await Promise.all(testimonialPromises);

    return testimonials
      .filter(testimonial => testimonial !== null)
      .sort((a, b) => (a.id || 0) - (b.id || 0));
  } catch (error) {
    console.error('Error loading testimonials:', error);
    return [];
  }
}

export default loadAllTestimonials;

