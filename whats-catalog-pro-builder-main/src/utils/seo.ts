// SEO utility functions
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const updateMetaTags = (title: string, description: string, slug?: string) => {
  // Update document title
  document.title = title;

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);

  // Update Open Graph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescription);
  }
  ogDescription.setAttribute('content', description);

  // Update canonical URL if slug is provided
  if (slug) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${window.location.origin}/${slug}`);
  }
};

export const generateProductMetaTitle = (productName: string, storeName?: string): string => {
  return storeName ? `${productName} - ${storeName}` : productName;
};

export const generateProductMetaDescription = (
  productName: string,
  description: string,
  price: number,
  storeName?: string
): string => {
  const truncatedDescription = description.length > 100 
    ? description.substring(0, 100) + "..." 
    : description;
  
  const baseDescription = `${productName} - ${truncatedDescription} Por R$ ${price.toFixed(2)}`;
  
  return storeName ? `${baseDescription} na ${storeName}` : baseDescription;
};